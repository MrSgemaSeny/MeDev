# MeDev — ПОЛНЫЙ ПЛАН РЕАЛИЗАЦИИ
# TRACK: FULL
# Стек: Java 17 + Spring Boot 3 + PostgreSQL + Flyway + React 19 + TypeScript + Tailwind v4
# Версия: 1.0 — 2026-08-07
# Назначение: контекст для AI-агента и разработчика. Читай PROJECT STATUS BLOCK первым.

---

## PROJECT STATUS BLOCK

```
PROJECT:         MeDev
TRACK:           FULL
CURRENT PHASE:   4 (Billing & Monetization)
CURRENT SUBPHASE: 4.1 (Stripe Integration)
LAST UPDATED:    2026-08-10
BLOCKER:         нет
NEXT STEP:       Интеграция Stripe Checkout, управление подписками Free/Pro
NOTES:
  - Фаза 3 (Расширение) полностью завершена: внедрен парсинг PDF, мультисессии, i18n, README экспорт.
  - Auth: JWT с поддержкой мульти-сессий (deviceId)
  - UI: Drag-and-drop редактор, поддержка нескольких языков (react-i18next)
  - AI: Интеграция GROQ для автоматического извлечения данных из старых PDF-резюме
```

---

## СТРУКТУРА РЕПОЗИТОРИЯ

```
medev/
├── backend/                          # Spring Boot монолит
│   ├── src/main/java/com/medev/
│   │   ├── MeDevApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── JwtConfig.java
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/User.java
│   │   │   ├── profile/
│   │   │   │   ├── ProfileController.java
│   │   │   │   ├── ProfileService.java
│   │   │   │   ├── dto/
│   │   │   │   └── entity/
│   │   │   │       ├── Profile.java
│   │   │   │       ├── Experience.java
│   │   │   │       ├── Education.java
│   │   │   │       ├── Skill.java
│   │   │   │       ├── Language.java
│   │   │   │       └── Project.java
│   │   │   ├── github/
│   │   │   │   ├── GitHubController.java
│   │   │   │   ├── GitHubService.java
│   │   │   │   └── dto/GitHubRepoDto.java
│   │   │   ├── resume/
│   │   │   │   ├── ResumeController.java
│   │   │   │   ├── ResumeService.java
│   │   │   │   ├── PdfGeneratorService.java
│   │   │   │   └── PdfParserService.java
│   │   │   ├── portfolio/
│   │   │   │   ├── PortfolioController.java
│   │   │   │   └── PortfolioService.java
│   │   │   └── billing/
│   │   │       ├── BillingController.java
│   │   │       ├── StripeService.java
│   │   │       └── entity/Subscription.java
│   │   └── shared/
│   │       ├── exception/GlobalExceptionHandler.java
│   │       ├── security/JwtFilter.java
│   │       └── util/SecurityUtils.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-prod.yml
│   │   ├── db/migration/           # Flyway миграции
│   │   │   ├── V1__create_users.sql
│   │   │   ├── V2__create_profiles.sql
│   │   │   ├── V3__create_experience.sql
│   │   │   ├── V4__create_education.sql
│   │   │   ├── V5__create_skills.sql
│   │   │   ├── V6__create_languages.sql
│   │   │   ├── V7__create_projects.sql
│   │   │   └── V8__create_subscriptions.sql
│   │   └── templates/resume/       # HTML шаблоны резюме
│   │       ├── classic.html
│   │       ├── modern.html
│   │       └── minimal.html
│   ├── build.gradle
│   └── .env.example
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   └── providers.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProfileEditPage.tsx
│   │   │   ├── ResumeBuilderPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   └── PublicPortfolioPage.tsx  # /u/:username
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── github/
│   │   │   ├── resume-builder/     # drag-and-drop редактор
│   │   │   └── portfolio/
│   │   ├── shared/
│   │   │   ├── api/
│   │   │   │   └── client.ts       # axios instance
│   │   │   ├── types/
│   │   │   └── components/
│   │   └── store/
│   │       └── resumeEditorStore.ts  # Zustand
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## ФАЗА 1 — ИНИЦИАЛИЗАЦИЯ

### 1.1 Трек и репозиторий

```bash
mkdir medev && cd medev
git init
echo "# MeDev" > README.md
mkdir backend frontend
```

**TRACK: FULL** — платный SaaS продукт, глобальная аудитория.

### 1.2 Backend init

```bash
# Через Spring Initializr или вручную
# Зависимости: Web, Security, JPA, PostgreSQL, Flyway, Redis, Validation, Lombok
```

**build.gradle:**
```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

java { sourceCompatibility = JavaVersion.VERSION_17 }

dependencies {
    // Core
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    // DB
    runtimeOnly 'org.postgresql:postgresql'
    implementation 'org.flywaydb:flyway-core'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'

    // PDF
    implementation 'org.xhtmlrenderer:flying-saucer-pdf:9.1.22'
    implementation 'org.apache.pdfbox:pdfbox:3.0.2'

    // HTTP Client (для GitHub API)
    implementation 'org.springframework.boot:spring-boot-starter-webflux'

    // Utils
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Stripe
    implementation 'com.stripe:stripe-java:25.3.0'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```

**application.yml:**
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate          # НИКОГДА create — только Flyway
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}

server:
  port: 8080
  servlet:
    context-path: /api

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000            # 24 часа
  refresh-expiration: 2592000000  # 30 дней

github:
  api-url: https://api.github.com

stripe:
  secret-key: ${STRIPE_SECRET_KEY}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET}
```

**.env.example:**
```
DATABASE_URL=jdbc:postgresql://localhost:5432/medev
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-256-bit-secret-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.3 Frontend init

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install @tanstack/react-query axios zustand
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install react-hook-form zod @hookform/resolvers
```

### 1.4 Анализ рынка (зафиксировано)
- **Аудитория:** разработчики любого уровня, старт — СНГ
- **Конкуренты:** стандартные генераторы резюме (кривые редакторы), Canva (нет GitHub), read.cv / polywork (мертвы)
- **УТП:** data-first (один раз → везде), GitHub парсинг, UX редактора

### 1.5 Масштаб
- Старт: 0-100 пользователей (СНГ джуны/студенты)
- Через год: 1000-5000 (глобально)
- Пиковые нагрузки: нет сезонности, ровный трафик

### 1.6 Деплой
- Backend: Fly.io (как ZhanFinance)
- Frontend: Vercel
- Домен: medev.app / medev.io (выбрать)
- SSL: автоматически через Fly.io + Vercel

---

## ФАЗА 2 — MVP

### 2.1 Миграции БД

**V1__create_users.sql:**
```sql
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),                    -- nullable для OAuth
    username    VARCHAR(50)  NOT NULL UNIQUE,    -- для публичной страницы
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    plan        VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**V2__create_profiles.sql:**
```sql
CREATE TABLE profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255),
    headline        VARCHAR(500),          -- "Full Stack Developer | Spring Boot + React"
    summary         TEXT,
    avatar_url      VARCHAR(500),
    location        VARCHAR(255),
    website         VARCHAR(500),
    github_username VARCHAR(100),
    github_token    TEXT,                  -- encrypted, для API запросов
    telegram        VARCHAR(100),
    linkedin        VARCHAR(255),
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
```

**V3__create_experience.sql:**
```sql
CREATE TABLE experience (
    id           BIGSERIAL PRIMARY KEY,
    profile_id   BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company      VARCHAR(255) NOT NULL,
    position     VARCHAR(255) NOT NULL,
    description  TEXT,
    tech_stack   VARCHAR(500),            -- "Java, Spring Boot, PostgreSQL"
    start_date   DATE NOT NULL,
    end_date     DATE,                    -- NULL = по настоящее время
    is_current   BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**V4__create_education.sql:**
```sql
CREATE TABLE education (
    id           BIGSERIAL PRIMARY KEY,
    profile_id   BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution  VARCHAR(255) NOT NULL,
    degree       VARCHAR(255),            -- "Программная инженерия"
    field        VARCHAR(255),
    start_date   DATE NOT NULL,
    end_date     DATE,
    is_current   BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**V5__create_skills.sql:**
```sql
CREATE TABLE skills (
    id          BIGSERIAL PRIMARY KEY,
    profile_id  BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50),             -- "Backend", "Frontend", "DevOps", "Database"
    level       VARCHAR(20),             -- "beginner", "intermediate", "advanced"
    sort_order  INTEGER NOT NULL DEFAULT 0
);
```

**V6__create_languages.sql:**
```sql
CREATE TABLE languages (
    id          BIGSERIAL PRIMARY KEY,
    profile_id  BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,   -- "Казахский", "English"
    level       VARCHAR(20)  NOT NULL,   -- "native", "C2", "C1", "B2", "B1", "A2", "A1"
    sort_order  INTEGER NOT NULL DEFAULT 0
);
```

**V7__create_projects.sql:**
```sql
CREATE TABLE projects (
    id              BIGSERIAL PRIMARY KEY,
    profile_id      BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    tech_stack      VARCHAR(500),
    github_url      VARCHAR(500),
    live_url        VARCHAR(500),
    stars           INTEGER DEFAULT 0,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,  -- показывать в портфолио
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,   -- показывать в резюме
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**V8__create_subscriptions.sql:**
```sql
CREATE TABLE subscriptions (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    stripe_customer_id  VARCHAR(255),
    stripe_sub_id       VARCHAR(255),
    status              VARCHAR(20)  NOT NULL DEFAULT 'active',
    current_period_end  TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
```

---

### 2.2 Auth модуль

**User.java:**
```java
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;  // nullable для OAuth

    @Column(unique = true, nullable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plan plan = Plan.FREE;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Role { USER, ADMIN }
    public enum Plan { FREE, PRO }
}
```

**AuthController.java:**
```java
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.noContent().build();
    }
}
```

**AuthService.java:**
```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisTemplate<String, String> redisTemplate;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername().toLowerCase())
                .role(User.Role.USER)
                .plan(User.Plan.FREE)
                .build();

        userRepository.save(user);

        // Создаём пустой профиль автоматически
        profileService.createEmptyProfile(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Refresh token в Redis с TTL 30 дней
        redisTemplate.opsForValue().set(
            "refresh:" + user.getId(),
            refreshToken,
            Duration.ofDays(30)
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .plan(user.getPlan().name())
                .build();
    }

    public void logout(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "");
        Long userId = jwtService.extractUserId(token);
        // Удаляем refresh token → нельзя обновить сессию
        redisTemplate.delete("refresh:" + userId);
    }
}
```

**SecurityConfig.java:**
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Публичные эндпоинты
                .requestMatchers(
                    "/v1/auth/**",
                    "/v1/portfolio/**",    // публичные страницы
                    "/actuator/health"
                ).permitAll()
                // Только ADMIN
                .requestMatchers("/v1/admin/**").hasRole("ADMIN")
                // Всё остальное — авторизованные пользователи
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

---

### 2.3 Profile модуль

**ProfileController.java:**
```java
@RestController
@RequestMapping("/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // Получить свой профиль
    @GetMapping
    public ResponseEntity<ProfileDto> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    // Обновить основную информацию
    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.update(userId, request));
    }

    // CRUD для Experience
    @PostMapping("/experience")
    public ResponseEntity<ExperienceDto> addExperience(@Valid @RequestBody ExperienceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addExperience(userId, request));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceDto> updateExperience(
            @PathVariable Long id,
            @Valid @RequestBody ExperienceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.updateExperience(userId, id, request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.deleteExperience(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Обновить порядок секций (drag-and-drop)
    @PutMapping("/experience/reorder")
    public ResponseEntity<Void> reorderExperience(@RequestBody ReorderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.reorderExperience(userId, request.getIds());
        return ResponseEntity.noContent().build();
    }

    // Аналогичные эндпоинты для education, skills, languages, projects
}
```

**ReorderRequest.java** — для drag-and-drop:
```java
@Data
public class ReorderRequest {
    @NotNull
    private List<Long> ids;  // ID секций в новом порядке
}
```

**ProfileService.java (reorder логика):**
```java
@Transactional
public void reorderExperience(Long userId, List<Long> orderedIds) {
    Profile profile = getProfileByUserId(userId);

    // Проверяем что все ID принадлежат этому профилю (защита от IDOR)
    List<Experience> experiences = experienceRepository.findAllById(orderedIds);
    boolean allBelongToProfile = experiences.stream()
            .allMatch(e -> e.getProfile().getId().equals(profile.getId()));

    if (!allBelongToProfile || experiences.size() != orderedIds.size()) {
        throw new ForbiddenException("Access denied");
    }

    // Обновляем sort_order
    for (int i = 0; i < orderedIds.size(); i++) {
        experienceRepository.updateSortOrder(orderedIds.get(i), i);
    }
}
```

---

### 2.4 GitHub модуль

**GitHubService.java:**
```java
@Service
@RequiredArgsConstructor
public class GitHubService {

    private final WebClient webClient;
    private final ProfileService profileService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String GITHUB_API = "https://api.github.com";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    @SuppressWarnings("unchecked")
    public GitHubProfileDto fetchAndParseProfile(Long userId, String githubToken) {
        String cacheKey = "github:profile:" + userId;

        // Проверяем кэш
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) return (GitHubProfileDto) cached;

        // Получаем данные пользователя
        GitHubUserDto user = webClient.get()
                .uri(GITHUB_API + "/user")
                .header("Authorization", "token " + githubToken)
                .retrieve()
                .bodyToMono(GitHubUserDto.class)
                .block();

        // Получаем репозитории
        List<GitHubRepoDto> repos = webClient.get()
                .uri(GITHUB_API + "/user/repos?sort=updated&per_page=100")
                .header("Authorization", "token " + githubToken)
                .retrieve()
                .bodyToFlux(GitHubRepoDto.class)
                .collectList()
                .block();

        // Собираем языки по всем репо
        Map<String, Integer> languageStats = repos.stream()
                .filter(r -> r.getLanguage() != null)
                .collect(Collectors.groupingBy(
                    GitHubRepoDto::getLanguage,
                    Collectors.summingInt(r -> 1)
                ));

        GitHubProfileDto result = GitHubProfileDto.builder()
                .username(user.getLogin())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .publicRepos(user.getPublicRepos())
                .repos(repos)
                .languageStats(languageStats)
                .build();

        // Кэшируем на 1 час
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);

        return result;
    }

    // Импортируем данные GitHub в профиль пользователя
    @Transactional
    public void importToProfile(Long userId, GitHubImportRequest request) {
        GitHubProfileDto github = fetchAndParseProfile(userId, request.getToken());

        // Обновляем базовую информацию профиля
        profileService.updateFromGitHub(userId, github);

        // Импортируем выбранные репо как проекты
        if (request.getSelectedRepoIds() != null) {
            List<GitHubRepoDto> selectedRepos = github.getRepos().stream()
                    .filter(r -> request.getSelectedRepoIds().contains(r.getId()))
                    .toList();
            profileService.importProjects(userId, selectedRepos);
        }

        // Импортируем языки как навыки
        github.getLanguageStats().forEach((lang, count) ->
            profileService.addSkillIfNotExists(userId, lang, "Backend")
        );
    }
}
```

---

### 2.5 Resume модуль

**PdfGeneratorService.java:**
```java
@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    // Шаблоны лежат в resources/templates/resume/
    // Используем Thymeleaf для рендера HTML → Flying Saucer → PDF

    private final TemplateEngine templateEngine;
    private final ProfileService profileService;
    private final SubscriptionService subscriptionService;

    private static final int FREE_DAILY_LIMIT = 3;

    public byte[] generatePdf(Long userId, String templateName) {
        // Проверяем лимит для Free плана
        checkGenerationLimit(userId);

        ProfileDto profile = profileService.getByUserId(userId);

        // Рендерим HTML через Thymeleaf
        Context context = new Context();
        context.setVariable("profile", profile);
        context.setVariable("generatedAt", LocalDate.now());
        String html = templateEngine.process("resume/" + templateName, context);

        // HTML → PDF через Flying Saucer
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            renderer.finishPDF();

            // Увеличиваем счётчик генераций
            incrementGenerationCount(userId);

            return out.toByteArray();
        } catch (Exception e) {
            throw new InternalException("PDF generation failed: " + e.getMessage());
        }
    }

    private void checkGenerationLimit(Long userId) {
        User.Plan plan = subscriptionService.getUserPlan(userId);
        if (plan == User.Plan.FREE) {
            String key = "resume:gen:" + userId + ":" + LocalDate.now();
            Integer count = (Integer) redisTemplate.opsForValue().get(key);
            if (count != null && count >= FREE_DAILY_LIMIT) {
                throw new LimitExceededException("Daily generation limit reached. Upgrade to Pro.");
            }
        }
    }

    private void incrementGenerationCount(Long userId) {
        String key = "resume:gen:" + userId + ":" + LocalDate.now();
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, Duration.ofDays(1));
    }
}
```

**ResumeController.java:**
```java
@RestController
@RequestMapping("/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final PdfGeneratorService pdfGeneratorService;
    private final PdfParserService pdfParserService;

    // Генерация PDF по шаблону
    @GetMapping("/generate/{template}")
    public ResponseEntity<byte[]> generate(@PathVariable String template) {
        Long userId = SecurityUtils.getCurrentUserId();
        byte[] pdf = pdfGeneratorService.generatePdf(userId, template);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=resume.pdf")
                .body(pdf);
    }

    // Загрузка существующего резюме для парсинга
    @PostMapping("/parse")
    public ResponseEntity<ParsedResumeDto> parseResume(
            @RequestParam("file") MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        ParsedResumeDto parsed = pdfParserService.parse(file);
        return ResponseEntity.ok(parsed);
    }

    // Применить распарсенные данные к профилю
    @PostMapping("/import")
    public ResponseEntity<Void> importParsed(@RequestBody ParsedResumeDto parsed) {
        Long userId = SecurityUtils.getCurrentUserId();
        pdfParserService.importToProfile(userId, parsed);
        return ResponseEntity.noContent().build();
    }
}
```

**PdfParserService.java:**
```java
@Service
public class PdfParserService {

    // PDFBox извлекает текст из PDF
    // Затем простой парсинг по паттернам
    // ВАЖНО: не 100% точность, пользователь всегда редактирует вручную

    public ParsedResumeDto parse(MultipartFile file) {
        try {
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            return ParsedResumeDto.builder()
                    .rawText(text)
                    .email(extractEmail(text))
                    .phone(extractPhone(text))
                    .name(extractName(text))
                    .skills(extractSkills(text))
                    .build();
        } catch (IOException e) {
            throw new InternalException("PDF parsing failed");
        }
    }

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("\\+?[0-9]{10,13}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    // extractName и extractSkills — эвристический парсинг
    // Точность ~60-70%, пользователь поправит остальное
}
```

---

### 2.6 Portfolio модуль (публичная страница)

**PortfolioController.java:**
```java
@RestController
@RequestMapping("/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    // Публичный эндпоинт — без авторизации
    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDto> getPublicProfile(@PathVariable String username) {
        PublicProfileDto profile = portfolioService.getPublicProfile(username);
        return ResponseEntity.ok(profile);
    }
}
```

```java
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public PublicProfileDto getPublicProfile(String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        if (!profile.isPublic()) {
            throw new NotFoundException("Profile not found"); // не раскрываем что профиль существует
        }

        return PublicProfileDto.fromProfile(profile, user);
    }
}
```

---

### 2.7 GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(404).body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(401).body(new ErrorResponse("UNAUTHORIZED", e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(403).body(new ErrorResponse("FORBIDDEN", e.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException e) {
        return ResponseEntity.status(409).body(new ErrorResponse("CONFLICT", e.getMessage()));
    }

    @ExceptionHandler(LimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleLimit(LimitExceededException e) {
        return ResponseEntity.status(429).body(new ErrorResponse("LIMIT_EXCEEDED", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    // НИКОГДА не отдаём raw stack trace клиенту
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.status(500).body(new ErrorResponse("INTERNAL_ERROR", "Something went wrong"));
    }
}
```

---

## ФАЗА 3 — РАСШИРЕНИЕ

### 3.1 PDF парсинг загруженного резюме

Уже реализован в Фазе 2 (PdfParserService). В этой фазе улучшаем точность парсинга:
- Добавляем эвристики для секций (Experience, Education)
- Добавляем распознавание дат
- UX: показываем пользователю что распарсили, он подтверждает/правит

### 3.2 Шаблоны резюме (HTML файлы)

**resources/templates/resume/classic.html:**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="en">
<head>
    <meta charset="UTF-8"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #333; }
        .page { width: 210mm; padding: 20mm; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
        .name { font-size: 24pt; font-weight: bold; color: #1e40af; }
        .headline { font-size: 12pt; color: #6b7280; margin-top: 4px; }
        .section-title { font-size: 13pt; font-weight: bold; color: #1e40af;
                         border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;
                         margin: 15px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
        .watermark { position: fixed; bottom: 10px; right: 10px;
                     font-size: 8pt; color: #d1d5db; }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div class="name" th:text="${profile.fullName}">Full Name</div>
        <div class="headline" th:text="${profile.headline}">Headline</div>
        <div style="margin-top: 6px; font-size: 10pt; color: #6b7280;">
            <span th:text="${profile.email}"></span> ·
            <span th:if="${profile.location}" th:text="${profile.location}"></span>
            <span th:if="${profile.website}"> · <span th:text="${profile.website}"></span></span>
        </div>
    </div>

    <!-- Summary -->
    <div th:if="${profile.summary}">
        <div class="section-title">About</div>
        <p th:text="${profile.summary}"></p>
    </div>

    <!-- Experience -->
    <div th:if="${!profile.experience.isEmpty()}">
        <div class="section-title">Experience</div>
        <div th:each="exp : ${profile.experience}" style="margin-bottom: 10px;">
            <div style="font-weight: bold;" th:text="${exp.position}"></div>
            <div style="color: #4b5563;">
                <span th:text="${exp.company}"></span> ·
                <span th:text="${exp.startDate}"></span> —
                <span th:text="${exp.isCurrent ? 'Present' : exp.endDate}"></span>
            </div>
            <p style="margin-top: 4px; font-size: 10pt;" th:text="${exp.description}"></p>
            <div th:if="${exp.techStack}" style="font-size: 9pt; color: #6b7280; margin-top: 2px;">
                Stack: <span th:text="${exp.techStack}"></span>
            </div>
        </div>
    </div>

    <!-- Skills -->
    <div th:if="${!profile.skills.isEmpty()}">
        <div class="section-title">Skills</div>
        <div th:text="${#strings.listJoin(profile.skills.![name], ', ')}"></div>
    </div>

    <!-- Languages -->
    <div th:if="${!profile.languages.isEmpty()}">
        <div class="section-title">Languages</div>
        <div th:each="lang : ${profile.languages}">
            <span th:text="${lang.name}"></span> — <span th:text="${lang.level}"></span>
        </div>
    </div>

    <!-- Education -->
    <div th:if="${!profile.education.isEmpty()}">
        <div class="section-title">Education</div>
        <div th:each="edu : ${profile.education}">
            <div style="font-weight: bold;" th:text="${edu.institution}"></div>
            <div th:text="${edu.degree + (edu.field != null ? ', ' + edu.field : '')}"></div>
            <div style="color: #6b7280; font-size: 10pt;">
                <span th:text="${edu.startDate}"></span> —
                <span th:text="${edu.isCurrent ? 'Present' : edu.endDate}"></span>
            </div>
        </div>
    </div>

    <!-- Watermark (убирается в Pro) -->
    <div class="watermark" th:if="${!profile.isPro}">Made with MeDev</div>
</div>
</body>
</html>
```

### 3.3 Drag-and-drop конструктор (Frontend)

**resumeEditorStore.ts (Zustand):**
```typescript
import { create } from 'zustand';

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects';

interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
  label: string;
}

interface ResumeEditorStore {
  sections: Section[];
  selectedTemplate: string;
  setSections: (sections: Section[]) => void;
  toggleSection: (id: string) => void;
  reorderSections: (from: number, to: number) => void;
  setTemplate: (template: string) => void;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'summary',    type: 'summary',    visible: true, label: 'About' },
  { id: 'experience', type: 'experience', visible: true, label: 'Experience' },
  { id: 'education',  type: 'education',  visible: true, label: 'Education' },
  { id: 'skills',     type: 'skills',     visible: true, label: 'Skills' },
  { id: 'languages',  type: 'languages',  visible: true, label: 'Languages' },
  { id: 'projects',   type: 'projects',   visible: true, label: 'Projects' },
];

export const useResumeEditorStore = create<ResumeEditorStore>((set) => ({
  sections: DEFAULT_SECTIONS,
  selectedTemplate: 'classic',

  setSections: (sections) => set({ sections }),

  toggleSection: (id) => set((state) => ({
    sections: state.sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    )
  })),

  reorderSections: (from, to) => set((state) => {
    const sections = [...state.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    return { sections };
  }),

  setTemplate: (selectedTemplate) => set({ selectedTemplate }),
}));
```

**ResumeBuilder.tsx:**
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { useSaveResumeOrder } from './hooks/useSaveResumeOrder';

// Один элемент секции (перетаскиваемый)
function SortableSection({ section }: { section: Section }) {
  const { toggleSection } = useResumeEditorStore();
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200
                 rounded-lg mb-2 cursor-default select-none"
    >
      {/* Иконка drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        ⠿
      </span>

      <span className={`flex-1 font-medium ${!section.visible ? 'text-gray-400' : ''}`}>
        {section.label}
      </span>

      {/* Тогл видимости */}
      <button
        onClick={() => toggleSection(section.id)}
        className={`w-10 h-5 rounded-full transition-colors
                   ${section.visible ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5
                         ${section.visible ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export function ResumeBuilder() {
  const { sections, reorderSections, selectedTemplate, setTemplate } = useResumeEditorStore();
  const { mutate: saveOrder } = useSaveResumeOrder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex  = sections.findIndex(s => s.id === over.id);

    reorderSections(oldIndex, newIndex);

    // Сохраняем порядок на backend
    const newOrder = arrayMove(sections, oldIndex, newIndex).map(s => s.id);
    saveOrder(newOrder);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Левая панель — редактор */}
      <div className="w-80 flex-shrink-0">
        <h3 className="font-semibold mb-4">Sections</h3>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map(section => (
              <SortableSection key={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>

        {/* Выбор шаблона */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Template</h3>
          {['classic', 'modern', 'minimal'].map(t => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`w-full p-2 mb-2 rounded-lg border text-left capitalize
                         ${selectedTemplate === t
                           ? 'border-blue-500 bg-blue-50 text-blue-700'
                           : 'border-gray-200 hover:border-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Правая панель — превью PDF (iframe) */}
      <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden">
        <iframe
          src={`/api/v1/resume/preview/${selectedTemplate}`}
          className="w-full h-full border-0"
          title="Resume Preview"
        />
      </div>
    </div>
  );
}
```

---

## ФАЗА 4 — МОНЕТИЗАЦИЯ

### 4.1 Stripe интеграция

```java
@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeKey;

    @PostConstruct
    public void init() { Stripe.apiKey = stripeKey; }

    public String createCheckoutSession(Long userId, String priceId) throws StripeException {
        String successUrl = "https://medev.app/dashboard?payment=success";
        String cancelUrl  = "https://medev.app/pricing";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build()
                )
                .putMetadata("userId", userId.toString())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    // Webhook — Stripe вызывает когда оплата прошла
    public void handleWebhook(String payload, String sigHeader) throws StripeException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject().orElseThrow();
            Long userId = Long.parseLong(session.getMetadata().get("userId"));
            subscriptionService.activatePro(userId, session.getSubscription());
        }

        if ("customer.subscription.deleted".equals(event.getType())) {
            // Подписка отменена → деградируем до Free
            Subscription sub = (Subscription) event.getDataObjectDeserializer()
                    .getObject().orElseThrow();
            subscriptionService.deactivatePro(sub.getId());
        }
    }
}
```

### 4.2 Ограничения по плану

```java
@Component
@RequiredArgsConstructor
public class PlanGuard {

    private final SubscriptionService subscriptionService;

    // Аннотация для методов которые требуют Pro
    public void requirePro(Long userId) {
        User.Plan plan = subscriptionService.getUserPlan(userId);
        if (plan != User.Plan.PRO) {
            throw new ForbiddenException("This feature requires Pro plan. Upgrade at medev.app/pricing");
        }
    }
}
```

---

## ФАЗА 5 — КАЧЕСТВО

### 5.1 Security checklist

- [ ] Все эндпоинты `/v1/profile/**` и `/v1/resume/**` проверяют `userId` из JWT, не из запроса
- [ ] `/v1/portfolio/{username}` — публичный, без авторизации — не раскрывает приватные профили
- [ ] PDF парсинг — проверка типа файла (только PDF), лимит размера (5MB)
- [ ] GitHub token хранится зашифрованным в БД
- [ ] Rate limiting на `/v1/auth/login` — защита от брутфорса
- [ ] Stack trace никогда не в ответе клиенту (GlobalExceptionHandler)

### 5.2 Тесты

```java
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Test
    void register_validRequest_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(APPLICATION_JSON)
                .content("""
                    {
                        "email": "test@example.com",
                        "password": "SecurePass123!",
                        "username": "testuser"
                    }
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        // создаём пользователя
        // повторный запрос с тем же email → 409
    }

    @Test
    void login_invalidPassword_returns401() throws Exception {
        // ...
    }
}
```

### 5.3 CI/CD (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Run tests
        run: ./gradlew test
        working-directory: backend

      # Деплой ТОЛЬКО если тесты прошли
      - name: Deploy to Fly.io
        if: success()
        uses: superfly/flyctl-actions@1.5
        with:
          args: "deploy --app medev-backend"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## ФАЗА 6 — РЫНОК

### 6.1 Landing page ключевые секции

- Hero: "Your developer profile. Done right." + CTA "Connect GitHub"
- How it works: 3 шага (Connect → Build → Share)
- Templates preview: 3 шаблона резюме
- Pricing: Free / Pro карточки
- Testimonials (после первых пользователей)

### 6.2 Первые пользователи

- Друзья-разработчики → фидбек по UX
- Посты в Telegram каналах (казахстанские IT сообщества)
- GitHub README своего профиля со ссылкой

---

## ПОДВОДНЫЕ КАМНИ

### Flying Saucer + кириллица
Flying Saucer плохо работает с кириллицей без явного указания шрифта.
В HTML шаблоне обязательно:
```css
@font-face {
    font-family: 'Roboto';
    src: url('classpath:fonts/Roboto-Regular.ttf');
}
body { font-family: 'Roboto', sans-serif; }
```
Положи TTF шрифт в `resources/fonts/`.

### GitHub API rate limit
Без токена: 60 запросов/час. С токеном пользователя: 5000/час.
Всегда используй токен пользователя + кэш в Redis на 1 час.

### dnd-kit и touch устройства
По умолчанию dnd-kit работает на десктопе. Для мобильного drag-and-drop:
```typescript
import { TouchSensor } from '@dnd-kit/core';
useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
```

### PDF превью в iframe
`/api/v1/resume/preview/{template}` должен возвращать PDF с заголовком:
```
Content-Disposition: inline  // не attachment — чтобы показался в iframe
```

### Username уникальность
Username — часть публичного URL (`medev.app/u/username`).
Зарезервируй системные имена: `admin`, `api`, `login`, `register`, `pricing`, `dashboard`.
```sql
-- В V1__create_users.sql добавить CHECK
ALTER TABLE users ADD CONSTRAINT check_username_reserved
CHECK (username NOT IN ('admin', 'api', 'login', 'register', 'pricing', 'dashboard', 'u'));
```

---

## ЧЕКЛИСТ ПЕРЕД КАЖДЫМ КОММИТОМ

- [ ] Нет секретов в коде (только в env vars)
- [ ] Новые эндпоинты проверяют userId из токена, не из body/params
- [ ] Новые таблицы добавлены через Flyway миграцию, не ddl-auto
- [ ] GlobalExceptionHandler покрывает новые типы ошибок
- [ ] Тесты зелёные: `./gradlew test`
