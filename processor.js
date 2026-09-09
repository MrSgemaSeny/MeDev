/**
 * Processor logic for MeDev backend Artillery Load & Smoke tests.
 * 
 * Архитектурные задачи скрипта:
 * 1. Защита от DoS на эндпоинты авторизации:
 *    Spring Boot использует Bucket4j AuthRateLimiter (10 req / 15 min per IP).
 *    Повторные вызовы /v1/auth/login приводят к блокировке с кодом 429.
 *    Кэширование токена уровня сьюта (suite-level token) гарантирует, что все виртуальные
 *    пользователи переиспользуют один валидный токен, а регистрация происходит ровно 1 раз.
 * 
 * 2. Двойная передача контекста аутентификации:
 *    MeDev поддерживает заголовок Authorization: Bearer <token> и Cookie: accessToken=<token>.
 * 
 * 3. Надежная экстракция ID:
 *    Поддержка как плоского JSON { id: 1 }, так и вложенных структур { data: { id: 1 } }.
 */

const BASE_URL = process.env.TARGET_URL || 'https://medev-backend.onrender.com/api';

// Кэш токенов уровня процесса раннера для исключения паразитной нагрузки на /auth/login
const tokenCache = {
  admin: null,
  user: null
};

// Блокировка от повторной параллельной регистрации сьюта
let isRegisteringUser = false;
let userInitPromise = null;

/**
 * Инициализирует и возвращает валидные токены администратора и пользователя.
 */
async function getTokens() {
  // 1. Авторизация или динамическая регистрация пользователя сьюта
  if (!tokenCache.user) {
    if (!userInitPromise) {
      userInitPromise = (async () => {
        // Попытка войти под существующим пользователем из env
        if (process.env.MEDEV_USER_EMAIL && process.env.MEDEV_USER_PASSWORD) {
          try {
            const res = await fetch(`${BASE_URL}/v1/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify({
                email: process.env.MEDEV_USER_EMAIL,
                password: process.env.MEDEV_USER_PASSWORD
              })
            });

            if (res.ok) {
              const body = await res.json();
              tokenCache.user = body?.accessToken || body?.data?.accessToken || null;
            }
          } catch (err) {
            console.warn(`[processor.js] Failed to login user: ${err.message}`);
          }
        }

        // Если пользователя нет в env или вход не удался — регистрируем 1 выделенного пользователя на сьют
        if (!tokenCache.user) {
          const rand = Math.floor(Math.random() * 900000) + 100000;
          const suiteEmail = `artillery.suite.${rand}@testmail.com`;
          const suiteUsername = `art_suite_${rand}`;
          const suitePassword = `TestPass123!_${rand}`;

          try {
            const regRes = await fetch(`${BASE_URL}/v1/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify({
                email: suiteEmail,
                username: suiteUsername,
                password: suitePassword
              })
            });

            if (regRes.ok) {
              const body = await regRes.json();
              tokenCache.user = body?.accessToken || body?.data?.accessToken || null;
            } else {
              console.warn(`[processor.js] Suite registration returned ${regRes.status}`);
            }
          } catch (err) {
            console.warn(`[processor.js] Failed to register suite user: ${err.message}`);
          }
        }
      })();
    }
    await userInitPromise;
  }

  // 2. Предзагрузка токена администратора (если переданы учетные данные)
  if (!tokenCache.admin && process.env.MEDEV_ADMIN_EMAIL && process.env.MEDEV_ADMIN_PASSWORD) {
    try {
      const res = await fetch(`${BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          email: process.env.MEDEV_ADMIN_EMAIL,
          password: process.env.MEDEV_ADMIN_PASSWORD
        })
      });

      if (res.ok) {
        const body = await res.json();
        tokenCache.admin = body?.accessToken || body?.data?.accessToken || null;
      }
    } catch (err) {
      console.warn(`[processor.js] Failed to fetch admin token: ${err.message}`);
    }
  }

  return tokenCache;
}

module.exports = {
  /**
   * Hook: beforeScenario для сценария администратора.
   * Инжектирует adminToken только если учетные данные валидны.
   */
  setAdminAuth: function (context, ee, next) {
    const callback = typeof next === 'function' ? next : (typeof ee === 'function' ? ee : null);
    getTokens().then(tokens => {
      context.vars = context.vars || {};
      if (tokens.admin) {
        context.vars.adminToken = tokens.admin;
        context.vars.authToken = tokens.admin;
      }
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  },

  /**
   * Hook: beforeScenario для всех пользовательских сценариев.
   * Инжектирует закэшированный токен сьюта, исключая спам в /auth/login.
   */
  setUserAuth: function (context, ee, next) {
    const callback = typeof next === 'function' ? next : (typeof ee === 'function' ? ee : null);
    getTokens().then(tokens => {
      context.vars = context.vars || {};
      if (tokens.user) {
        context.vars.userToken = tokens.user;
        context.vars.authToken = tokens.user;
      }
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  },

  /**
   * Hook: beforeRequest.
   * Добавляет заголовок Authorization и Cookie accessToken в каждый исходящий запрос.
   */
  attachAuthHeader: function (requestParams, context, ee, next) {
    const token = context.vars?.authToken;
    if (token) {
      requestParams.headers = requestParams.headers || {};
      requestParams.headers['Authorization'] = `Bearer ${token}`;
      requestParams.headers['Cookie'] = `accessToken=${token}; refresh_token=${token}`;
    }
    return next();
  },

  /**
   * Hook: afterResponse для POST /v1/tracker/applications.
   * Захватывает ID созданного отклика для последующего обновления и удаления (DELETE).
   */
  extractApplicationId: function (requestParams, response, context, ee, next) {
    try {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      const id = body?.id || body?.data?.id;
      if (id) {
        context.vars.currentAppId = id;
      }
    } catch (e) {
      console.warn('[processor.js] Could not parse application response body:', e.message);
    }
    return next();
  },

  /**
   * Hook: afterResponse для POST /v1/profile/skills.
   * Захватывает ID созданного навыка для последующего удаления (DELETE).
   */
  extractSkillId: function (requestParams, response, context, ee, next) {
    try {
      const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      const id = body?.id || body?.data?.id;
      if (id) {
        context.vars.createdSkillId = id;
      }
    } catch (e) {
      console.warn('[processor.js] Could not parse skill response body:', e.message);
    }
    return next();
  }
};
