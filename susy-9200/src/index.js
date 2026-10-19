/**
 * SUSY-9200 Mock Service (Cloudflare Worker)
 *
 * 能力 1：POST /api/v2/ingest/peer_review_report?susy_submission_id=X
 *         Susy 系统真实调用；按面板配置的返回码返回 201 / 400 / 404 / 500
 * 能力 2：出站回调 POST {SUSY_CALLBACK_BASE}/{ms_id}，ms_id = susy_submission_id
 *         包体 = 面板配置的报告数组；带 susy-api-token；不重试
 * 面板  ：GET /  配置（存 Durable Object）+ 事件日志（收到/发出各一条，最近 200 条）
 *
 * 关键取舍：
 * - 先返回 201，再用 ctx.waitUntil 后台回调（真实系统不会等回调完成才回 201）
 * - 名单必须存服务端：Susy 触发的那一刻要读到你手填的真实 reviewer_rel_id / round_number
 * - 用 Durable Object 而非 KV：强一致（面板刚保存、Susy 立刻触发就能读到），且不需要额外的 KV 权限
 * - 未配置的 submission_id 直接返 404，避免 Mock 编造 reviewer ID 导致 Susy 报 Invalid
 */

import { DurableObject } from 'cloudflare:workers';
import { renderPanel } from './panel.js';

const SUSY_CALLBACK_BASE =
  'https://susy-9200.susy.mdpi.dev/restapi/open_api/submit/review_report/check_result';

const CFG_PREFIX = 'cfg:';
const LOG_KEY = 'logs';
// 事件日志：一次完整交互 = 2 条事件（收到 + 发出），按时间从旧到新追加
const LOG_LIMIT = 200;
const CALLBACK_TIMEOUT_MS = 15000;
const RETURN_CODES = [201, 400, 404, 500];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // ---- 能力 1：Susy 调用的 ingest 接口 ----
      if (path === '/api/v2/ingest/peer_review_report' && method === 'POST') {
        return await handleIngest(request, env, ctx);
      }

      // ---- 面板接口 ----
      if (path === '/api/panel/config' && method === 'GET') {
        return await handleGetConfig(url, env);
      }
      if (path === '/api/panel/config' && method === 'POST') {
        return await handleSaveConfig(request, env);
      }
      if (path === '/api/panel/config' && method === 'DELETE') {
        return await handleDeleteConfig(url, env);
      }
      if (path === '/api/panel/configs' && method === 'GET') {
        return await handleListConfigs(env);
      }
      if (path === '/api/panel/logs' && method === 'GET') {
        return json(200, { logs: await readLogs(env) });
      }
      // 连通性探针：固定目标、不接受外部传入 URL（避免变成 SSRF 跳板）
      if (path === '/api/panel/probe' && method === 'GET') {
        return await handleProbe();
      }
      // 待发队列：供本机桥脚本 bridge.mjs 取任务
      if (path === '/api/panel/pending' && method === 'GET') {
        const data = await storeFetch(env, '/pending');
        return json(200, { tasks: (data && data.tasks) || [] });
      }
      if (path === '/api/panel/pending/result' && method === 'POST') {
        let payload;
        try {
          payload = await request.json();
        } catch (e) {
          return json(400, { error: 'Bad Request', message: '请求体不是合法 JSON' });
        }
        if (!payload || !payload.id) {
          return json(400, { error: 'Bad Request', message: 'id is required' });
        }
        const callback = payload.callback || null;
        await storeFetch(env, '/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: payload.id,
            callback,
            by: (callback && callback.by) || 'bridge',
          }),
        });
        return json(200, { ok: true });
      }
      if (path === '/api/panel/logs' && method === 'DELETE') {
        await storeFetch(env, '/logs', { method: 'DELETE' });
        return json(200, { ok: true });
      }

      // ---- 面板页面 ----
      if ((path === '/' || path === '/panel') && method === 'GET') {
        return new Response(renderPanel(), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      return json(404, { error: 'Not Found', message: 'Path ' + method + ' ' + path + ' not found' });
    } catch (error) {
      return json(500, { error: 'Internal Server Error', message: String(error && error.message) });
    }
  },
};

/* ------------------------------ 能力 1 ------------------------------ */

/**
 * Susy 触发的 ingest。
 * 无论成功失败，都会写一条 kind='in' 的事件（含来源信息与返回给 Susy 的响应体）；
 * 成功发起回调后，再由 recordDispatch 追加一条 kind='out' 的事件。
 */
async function handleIngest(request, env, ctx) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get('susy_submission_id');
  const info = requestInfo(request, url, submissionId);

  let code = 201;
  let body = null;
  let note = '';
  let payload = [];
  let dispatch = null; // 'bridge'（入队等桥发）| 'direct'（边缘直发）| null（不发起回调）
  let status = 'skipped';

  if (!submissionId) {
    code = 400;
    body = { error: 'Bad Request', message: 'susy_submission_id is required' };
    note = '缺少 susy_submission_id 参数，未发起回调';
  } else {
    const config = await readConfig(env, submissionId);

    if (!config) {
      // 不编造 reviewer 名单：Susy 侧一定校验不过，返 404 便于区分"忘了保存配置"和"链路坏了"
      code = 404;
      body = {
        error: 'Not Found',
        message:
          'No mock config for susy_submission_id=' +
          submissionId +
          '。请先在 ' +
          url.origin +
          ' 面板保存配置后再触发。',
      };
      note = 'Mock 里没有该 submission_id 的配置，未发起回调（请先在面板保存配置）';
    } else {
      payload = buildPayload(config.items);
      const returnCode = Number(config.return_code) || 201;

      if (returnCode !== 201) {
        // 面板强制返回的错误码：只用于测 Susy 的容错，不发起回调
        code = returnCode;
        body = forcedErrorBody(returnCode);
        note = '面板强制返回码 ' + returnCode + '，未发起回调';
      } else {
        body = {
          date: new Date().toISOString(),
          note: null,
          result: { submission_id: submissionId, count: payload.length },
        };
        dispatch = String(env.CALLBACK_MODE || 'bridge').toLowerCase() === 'direct' ? 'direct' : 'bridge';
        // bridge 模式的 pending 才会被本机桥脚本取走；direct 模式用 sending，避免被桥重复发一次
        status = dispatch === 'bridge' ? 'pending' : 'sending';
      }
    }
  }

  const eventId = newId();
  const targetUrl = dispatch ? SUSY_CALLBACK_BASE + '/' + encodeURIComponent(submissionId) : null;

  // 先返 201（真实系统不会等回调完成才回 201），事件由后台写入
  ctx.waitUntil(
    saveEvent(env, {
      id: eventId,
      time: new Date().toISOString(),
      kind: 'in',
      ...info,
      status_code: code,
      response: body,
      note,
      payload,
      status,
      target_url: targetUrl,
    })
  );

  if (dispatch === 'direct') {
    ctx.waitUntil(
      pushToSusy(env, submissionId, payload)
        .then((callback) => recordDispatch(env, { id: eventId, callback, by: 'edge' }))
        .catch((err) =>
          recordDispatch(env, {
            id: eventId,
            by: 'edge',
            callback: {
              url: targetUrl,
              status: 0,
              success: false,
              message: '请求失败：' + String((err && err.message) || err),
              raw: '',
              duration_ms: 0,
            },
          })
        )
    );
  }

  return json(code, body);
}

/**
 * 把请求体发给 Susy（出站回调）
 */
async function pushToSusy(env, msId, payload) {
  const url = SUSY_CALLBACK_BASE + '/' + encodeURIComponent(msId);
  const startedAt = Date.now();
  const result = {
    url,
    status: 0,
    success: false,
    message: '',
    raw: '',
    duration_ms: 0,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'susy-api-token': env.SUSY_API_TOKEN || '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CALLBACK_TIMEOUT_MS),
    });

    result.status = res.status;
    const text = await res.text();
    result.raw = text.slice(0, 2000);

    let body = null;
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = null;
    }

    // 成功判定：HTTP 2xx 且 body.success 不是 false
    result.success = res.ok && !(body && body.success === false);
    result.message =
      (body && (body.message || body.error)) || (res.ok ? 'OK' : 'HTTP ' + res.status);
  } catch (err) {
    const name = err && err.name;
    result.message =
      name === 'TimeoutError'
        ? '请求超时（' + CALLBACK_TIMEOUT_MS / 1000 + 's）'
        : '请求失败：' + String((err && err.message) || err);
  }

  result.duration_ms = Date.now() - startedAt;
  return result;
}

/**
 * 面板保存的 item 结构已经等于回调包体的一行，这里只做数字归一化
 */
function buildPayload(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const proportions = (item && item.data && item.data.ai_proportions) || {};
    return {
      reviewer_rel_id: Number(item.reviewer_rel_id),
      round_number: Number(item.round_number),
      data: {
        severe_warning_count: Number((item.data && item.data.severe_warning_count) || 0),
        ai_proportions: {
          human_proportion: round2(proportions.human_proportion),
          maybe_ai_proportion: round2(proportions.maybe_ai_proportion),
          likely_ai_proportion: round2(proportions.likely_ai_proportion),
        },
      },
    };
  });
}

function round2(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
}

function forcedErrorBody(code) {
  const map = {
    400: { error: 'Bad Request', message: 'Mock 按面板配置返回 400' },
    404: { error: 'Not Found', message: 'Mock 按面板配置返回 404' },
    500: { error: 'Internal Server Error', message: 'Mock 按面板配置返回 500' },
  };
  return map[code] || { error: 'Error', message: 'Mock 按面板配置返回 ' + code };
}

/* ------------------------------ 面板接口 ------------------------------ */

async function handleGetConfig(url, env) {
  const submissionId = url.searchParams.get('submission_id');
  if (!submissionId) return json(400, { error: 'Bad Request', message: 'submission_id is required' });
  const config = await readConfig(env, submissionId);
  return json(200, config ? { found: true, config } : { found: false });
}

async function handleSaveConfig(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json(400, { error: 'Bad Request', message: '请求体不是合法 JSON' });
  }

  const submissionId = String(body.submission_id || '').trim();
  if (!submissionId) {
    return json(400, { error: 'Bad Request', message: 'submission_id 不能为空' });
  }

  const returnCode = Number(body.return_code) || 201;
  if (RETURN_CODES.indexOf(returnCode) === -1) {
    return json(400, { error: 'Bad Request', message: 'return_code 只能是 201 / 400 / 404 / 500' });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (returnCode === 201 && rawItems.length === 0) {
    return json(400, {
      error: 'Bad Request',
      message: '返回码为 201 时至少需要一行报告数据（否则会推空数组给 Susy）',
    });
  }

  const items = [];
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i] || {};
    const reviewerRelId = Number(item.reviewer_rel_id);
    const roundNumber = Number(item.round_number);
    if (!Number.isInteger(reviewerRelId) || reviewerRelId <= 0) {
      return json(400, {
        error: 'Bad Request',
        message: '第 ' + (i + 1) + ' 行的 reviewer_rel_id 必须是正整数',
      });
    }
    if (!Number.isInteger(roundNumber) || roundNumber <= 0) {
      return json(400, {
        error: 'Bad Request',
        message: '第 ' + (i + 1) + ' 行的 round_number 必须是正整数',
      });
    }
    const proportions = (item.data && item.data.ai_proportions) || {};
    items.push({
      reviewer_rel_id: reviewerRelId,
      round_number: roundNumber,
      data: {
        severe_warning_count: Number((item.data && item.data.severe_warning_count) || 0),
        ai_proportions: {
          human_proportion: round2(proportions.human_proportion),
          maybe_ai_proportion: round2(proportions.maybe_ai_proportion),
          likely_ai_proportion: round2(proportions.likely_ai_proportion),
        },
      },
    });
  }

  const config = {
    submission_id: submissionId,
    return_code: returnCode,
    items,
    updated_at: new Date().toISOString(),
  };

  await storeFetch(env, '/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return json(200, { ok: true, config });
}

async function handleDeleteConfig(url, env) {
  const submissionId = url.searchParams.get('submission_id');
  if (!submissionId) return json(400, { error: 'Bad Request', message: 'submission_id is required' });
  await storeFetch(env, '/config?id=' + encodeURIComponent(submissionId), { method: 'DELETE' });
  return json(200, { ok: true });
}

async function handleListConfigs(env) {
  const data = await storeFetch(env, '/configs');
  return json(200, { ids: (data && data.ids) || [] });
}

/**
 * 连通性探针：从 Cloudflare 边缘测试能否访问 Susy dev 环境
 * 只允许固定目标，不接受外部传入 URL
 */
async function handleProbe() {
  const targets = [
    { name: 'susy-dev-root', url: 'https://susy-9200.susy.mdpi.dev/' },
    { name: 'control-example', url: 'https://example.com/' },
  ];
  const results = [];
  for (const target of targets) {
    const startedAt = Date.now();
    const item = { name: target.name, url: target.url, status: 0, duration_ms: 0, error: '' };
    try {
      const res = await fetch(target.url, {
        method: 'GET',
        signal: AbortSignal.timeout(12000),
      });
      item.status = res.status;
      await res.text();
    } catch (err) {
      item.error = String((err && err.name) + ': ' + ((err && err.message) || err));
    }
    item.duration_ms = Date.now() - startedAt;
    results.push(item);
  }
  return json(200, { results });
}

/* ------------------------------ 存储（Durable Object） ------------------------------ */

function store(env) {
  return env.MOCK_STORE.get(env.MOCK_STORE.idFromName('global'));
}

/** 通过内部接口访问存储；存储出错直接抛出，避免被静默吞掉 */
async function storeFetch(env, path, init) {
  const res = await store(env).fetch('https://store' + path, init);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('store ' + path + ' 返回非 JSON（HTTP ' + res.status + '）');
  }
  if (!res.ok) {
    throw new Error(
      'store ' + path + ' 返回 HTTP ' + res.status + '：' + ((data && (data.message || data.error)) || '')
    );
  }
  return data;
}

async function readConfig(env, submissionId) {
  const data = await storeFetch(env, '/config?id=' + encodeURIComponent(submissionId));
  return data && data.config ? data.config : null;
}

/** 事件日志按时间从旧到新返回，不依赖存储顺序（DO 代码更新滞后时也不会颠倒） */
async function readLogs(env) {
  const data = await storeFetch(env, '/logs');
  const logs = data && Array.isArray(data.logs) ? data.logs : [];
  return logs.slice().sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

/**
 * 全局单实例存储：面板配置 + 回调记录
 * 强一致，面板保存后 Susy 立刻触发也能读到（KV 的最终一致会在这里挖坑）
 */
export class MockStore extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // 配置
      if (path === '/config' && method === 'POST') {
        const config = await request.json();
        await this.ctx.storage.put(CFG_PREFIX + config.submission_id, config);
        return json(200, { ok: true, config });
      }
      if (path === '/config' && method === 'GET') {
        const id = url.searchParams.get('id') || '';
        const config = await this.ctx.storage.get(CFG_PREFIX + id);
        return json(200, { config: config || null });
      }
      if (path === '/config' && method === 'DELETE') {
        const id = url.searchParams.get('id') || '';
        await this.ctx.storage.delete(CFG_PREFIX + id);
        return json(200, { ok: true });
      }
      if (path === '/configs' && method === 'GET') {
        const map = await this.ctx.storage.list({ prefix: CFG_PREFIX });
        const ids = Array.from(map.keys()).map((k) => String(k).slice(CFG_PREFIX.length));
        return json(200, { ids });
      }

      // 事件日志（旧 -> 新追加，只留最近 LOG_LIMIT 条）
      if (path === '/logs' && method === 'GET') {
        const logs = (await this.ctx.storage.get(LOG_KEY)) || [];
        return json(200, { logs });
      }
      if (path === '/logs' && method === 'POST') {
        const entry = await request.json();
        const logs = (await this.ctx.storage.get(LOG_KEY)) || [];
        logs.push(entry);
        await this.ctx.storage.put(LOG_KEY, logs.slice(-LOG_LIMIT));
        return json(200, { ok: true });
      }
      if (path === '/logs' && method === 'DELETE') {
        await this.ctx.storage.put(LOG_KEY, []);
        return json(200, { ok: true });
      }

      // 待发队列：只有 kind='in' 且 status='pending' 的事件需要本机桥脚本发送
      if (path === '/pending' && method === 'GET') {
        const logs = (await this.ctx.storage.get(LOG_KEY)) || [];
        return json(200, {
          tasks: logs.filter((l) => l.kind === 'in' && l.status === 'pending'),
        });
      }

      // 回调完成：更新对应的 in 事件，并追加一条 out 事件（同一次写入，保证日志顺序）
      if (path === '/dispatch' && method === 'POST') {
        const data = await request.json();
        const logs = (await this.ctx.storage.get(LOG_KEY)) || [];
        const idx = logs.findIndex((l) => l.id === data.id);
        if (idx === -1) {
          return json(404, { error: 'Not Found', message: 'task ' + data.id + ' not found' });
        }

        const cb = data.callback || null;
        const success = !!(cb && cb.success);
        const source = logs[idx];

        logs[idx] = {
          ...source,
          status: success ? 'done' : 'failed',
          by: data.by || 'bridge',
          dispatched_at: new Date().toISOString(),
        };

        logs.push({
          id: newId(),
          // 发出时刻 = 当前时间往前推实际耗时，日志顺序更贴近真实时序
          time: new Date(Date.now() - ((cb && cb.duration_ms) || 0)).toISOString(),
          kind: 'out',
          method: 'POST',
          url: (cb && cb.url) || source.target_url || '',
          path: '/restapi/open_api/submit/review_report/check_result',
          submission_id: source.submission_id,
          source_id: data.id,
          by: data.by || (cb && cb.by) || 'bridge',
          status_code: (cb && cb.status) || 0,
          success,
          message: (cb && cb.message) || '',
          duration_ms: (cb && cb.duration_ms) || 0,
          payload_count: (source.payload || []).length,
          payload: source.payload || [],
          response: (cb && cb.raw) || '',
        });

        await this.ctx.storage.put(LOG_KEY, logs.slice(-LOG_LIMIT));
        return json(200, { ok: true });
      }

      return json(404, { error: 'Not Found', message: 'store path ' + path });
    } catch (error) {
      return json(500, { error: 'Store Error', message: String(error && error.message) });
    }
  }
}

/* ------------------------------ 事件日志 ------------------------------ */

function newId() {
  return Date.now().toString(36) + '-' + Math.random().toString(16).slice(2, 8);
}

/** ingest 请求的来源信息，面板上用来核对"这次到底是不是 Susy 打的" */
function requestInfo(request, url, submissionId) {
  return {
    method: request.method,
    path: url.pathname,
    query: url.search,
    url: url.toString(),
    submission_id: submissionId || null,
    ip: request.headers.get('CF-Connecting-IP') || '',
    country: request.headers.get('CF-IPCountry') || '',
    ua: request.headers.get('User-Agent') || '',
  };
}

/** 追加一条事件；写日志失败不能影响接口本身，但要在 wrangler tail 里看得见 */
async function saveEvent(env, event) {
  try {
    await storeFetch(env, '/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error('事件写入失败：', String((e && e.message) || e));
  }
}

/** 回调完成：更新对应 in 事件的状态，并由存储追加 out 事件（一次写，保证先后顺序） */
async function recordDispatch(env, payload) {
  try {
    await storeFetch(env, '/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('回调结果写入失败：', String((e && e.message) || e));
  }
}

/* ------------------------------ 工具 ------------------------------ */

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
