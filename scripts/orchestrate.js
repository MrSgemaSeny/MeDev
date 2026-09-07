/**
 * MeDev Multi-Agent Orchestrator Runner
 * Связующий мост для оркестрации нескольких ИИ:
 * Antigravity / Cursor -> orchestrate.js -> внешняя модель (OpenRouter / Claude) -> возврат текста
 */
const { execSync } = require('child_process');

const ROLES = {
  reviewer: 'Ты строгий Senior Code Reviewer и Security Auditor. Ищи баги, уязвимости, edge cases и архитектурные нарушения. Отвечай кратко, тезисно, без вводных приветствий.',
  architect: 'Ты Senior Software Architect. Оценивай масштабируемость, разделение ответственности (FSD/Clean Architecture) и дизайн API. Формулируй решения прямо.',
  copywriter: 'Ты технический редактор. Пиши лаконичные описания, комментарии и документацию без лишних украшательств.',
  tester: 'Ты QA Automation Lead. Составляй список критических тест-кейсов, граничных значений и негативных сценариев.'
};

async function callOpenRouter(prompt, role, model) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY не обнаружен в переменных окружения.');
  }

  const targetModel = model || 'dots-studio/dots-3-note-preview:free';
  const systemPrompt = ROLES[role] || ROLES.reviewer;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      }),
      signal: controller.signal
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`OpenRouter API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const msg = data.choices?.[0]?.message;
    let content = (msg?.content || msg?.reasoning || '').trim();
    // Удаляем теги рассуждений и блоки Thinking Process
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    if (content.startsWith('Thinking Process:')) {
      const parts = content.split(/\n\n(?=[A-ZА-Я0-9#*-])/);
      if (parts.length > 1) {
        content = parts.slice(1).join('\n\n').trim();
      }
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function callClaudeCli(prompt, role) {
  const systemPrompt = ROLES[role] || ROLES.reviewer;
  const fullPrompt = `${systemPrompt}\n\nЗАДАЧА:\n${prompt}`;
  const escaped = fullPrompt.replace(/"/g, '\\"');
  return execSync(`claude -p "${escaped}"`, { encoding: 'utf-8' }).trim();
}

async function main() {
  const args = process.argv.slice(2);
  let role = 'reviewer';
  let prompt = '';
  let model = '';
  let backend = 'openrouter';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--role' && args[i + 1]) {
      role = args[++i];
    } else if (args[i] === '--prompt' && args[i + 1]) {
      prompt = args[++i];
    } else if (args[i] === '--model' && args[i + 1]) {
      model = args[++i];
    } else if (args[i] === '--backend' && args[i + 1]) {
      backend = args[++i];
    } else if (!args[i].startsWith('--')) {
      prompt = args.slice(i).join(' ');
      break;
    }
  }

  if (!prompt) {
    console.error('Использование: node scripts/orchestrate.js --role <reviewer|architect|copywriter|tester> --prompt "<текст задачи>"');
    process.exit(1);
  }

  try {
    let output = '';
    if (backend === 'claude-cli') {
      output = callClaudeCli(prompt, role);
    } else {
      output = await callOpenRouter(prompt, role, model);
    }

    console.log(output);
  } catch (err) {
    console.error(`[Orchestrator Error]: ${err.message}`);
    process.exit(1);
  }
}

main();
