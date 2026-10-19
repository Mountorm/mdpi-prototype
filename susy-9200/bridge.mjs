/**
 * 本机桥脚本（bridge）
 *
 * 为什么需要它：Cloudflare 边缘访问不到 Susy 的 dev 环境（网络层被挡，实测 12s 超时），
 * 所以 Mock 收到 Susy 触发后只把回调任务入队；由这个脚本在**公司网络**里把任务发出去，
 * 再把 Susy 的答复回写到面板。
 *
 * 用法：npm run bridge
 * 凭证：读环境变量 SUSY_API_TOKEN，没有则读同目录的 .dev.vars
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const MOCK_BASE = process.env.MOCK_BASE || 'https://susy-9200.mdpi.cloud';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 2000);
const CALLBACK_TIMEOUT_MS = Number(process.env.CALLBACK_TIMEOUT_MS || 20000);
const SUSY_DEV_BASE = 'https://susy-9200.susy.mdpi.dev';

function loadToken() {
  if (process.env.SUSY_API_TOKEN) return process.env.SUSY_API_TOKEN.trim();
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const text = readFileSync(join(here, '.dev.vars'), 'utf8');
    const line = text.split(/\r?\n/).find((l) => l.startsWith('SUSY_API_TOKEN='));
    if (line) return line.slice('SUSY_API_TOKEN='.length).trim();
  } catch (e) {
    // 忽略，下面统一报错
  }
  return '';
}

const TOKEN = loadToken();
if (!TOKEN) {
  console.error('缺少 SUSY_API_TOKEN：请设置环境变量，或在 susy-9200/.dev.vars 里写 SUSY_API_TOKEN=<token>');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function now() {
  return new Date().toLocaleTimeString();
}

/** 启动前自检：本机能不能访问 Susy dev（能通才说明桥有意义） */
async function preflight() {
  const startedAt = Date.now();
  try {
    const res = await fetch(SUSY_DEV_BASE + '/', { signal: AbortSignal.timeout(10000) });
    console.log('[' + now() + '] 自检：本机访问 Susy dev 正常（HTTP ' + res.status + '，' + (Date.now() - startedAt) + 'ms）');
  } catch (err) {
    console.log('[' + now() + '] 自检：本机访问 Susy dev 失败（' + ((err && err.message) || err) + '），请确认在公司网络/VPN 内');
  }
  try {
    const res = await fetch(MOCK_BASE + '/api/panel/configs', { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    console.log('[' + now() + '] 自检：连接 Mock ' + MOCK_BASE + ' 正常');
  } catch (err) {
    console.log('[' + now() + '] 自检：连接 Mock 失败（' + ((err && err.message) || err) + '）');
    process.exit(1);
  }
}

/** 把一条任务发给 Susy，返回回调结果对象 */
async function pushTask(task) {
  const startedAt = Date.now();
  const callback = {
    url: task.target_url,
    status: 0,
    success: false,
    message: '',
    raw: '',
    duration_ms: 0,
    by: 'bridge',
  };

  try {
    const res = await fetch(task.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'susy-api-token': TOKEN,
      },
      body: JSON.stringify(task.payload),
      signal: AbortSignal.timeout(CALLBACK_TIMEOUT_MS),
    });
    callback.status = res.status;
    const text = await res.text();
    callback.raw = text.slice(0, 2000);

    let body = null;
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = null;
    }
    callback.success = res.ok && !(body && body.success === false);
    callback.message = (body && (body.message || body.error)) || (res.ok ? 'OK' : 'HTTP ' + res.status);
  } catch (err) {
    callback.message = '请求失败：' + String((err && err.message) || err);
  }

  callback.duration_ms = Date.now() - startedAt;
  return callback;
}

async function main() {
  await preflight();
  console.log('[' + now() + '] 桥已启动，轮询间隔 ' + POLL_INTERVAL_MS + 'ms。到 Susy 里触发，结果会自动回写到面板。Ctrl+C 退出。');

  const done = new Set();

  while (true) {
    try {
      const res = await fetch(MOCK_BASE + '/api/panel/pending', { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      const tasks = (data && data.tasks) || [];

      for (const task of tasks) {
        if (done.has(task.id)) continue;
        done.add(task.id);
        if (done.size > 500) done.clear();

        console.log('[' + now() + '] 发出回调 submission_id=' + task.submission_id + '（' + task.payload.length + ' 条）');
        const callback = await pushTask(task);

        await fetch(MOCK_BASE + '/api/panel/pending/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: task.id, callback }),
        });

        console.log(
          '[' + now() + '] ' + (callback.success ? '成功' : '失败') +
          '：HTTP ' + callback.status + ' / ' + callback.message + '（' + callback.duration_ms + 'ms）'
        );
      }
    } catch (err) {
      console.log('[' + now() + '] 轮询出错（会继续重试）：' + ((err && err.message) || err));
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

main();
