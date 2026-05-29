/**
 * Mock API Service for Cloudflare Workers
 * 模拟三个 API 接口
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 头设置
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 预检请求
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      // 路由处理
      if (method === 'POST' && path === '/api/v2/ingest/submission') {
        return handleIngestSubmission(request, corsHeaders);
      }

      if (method === 'GET' && path.match(/^\/api\/v2\/documents\/[^/]+\/status$/)) {
        const documentHash = path.split('/')[4];
        return handleDocumentStatus(documentHash, corsHeaders);
      }

      if (method === 'GET' && path.match(/^\/api\/v2\/reports\/[^/]+\/issues_summary$/)) {
        const documentHash = path.split('/')[4];
        return handleIssuesSummary(documentHash, corsHeaders);
      }

      // 404 处理
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: `Path ${path} not found`,
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

/**
 * 处理 POST /api/v2/ingest/submission
 */
async function handleIngestSubmission(request, corsHeaders) {
  const url = new URL(request.url);
  const susySubmissionId = url.searchParams.get('susy_submission_id');
  const force = url.searchParams.get('force') === 'true';

  // 验证参数
  if (!susySubmissionId) {
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        message: 'susy_submission_id is required',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  // 生成 16 位 hash，尾数与 submission_id 一致
  const lastDigit = susySubmissionId.toString().slice(-1);
  const hash = generateMockHash16(susySubmissionId, lastDigit);

  // 模拟响应数据
  const responseData = {
    date: new Date().toISOString(),
    note: null,
    result: {
      document_hashes: [hash],
      count: 1,
    },
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(responseData).length.toString(),
      'Server': 'uvicorn',
      ...corsHeaders,
    },
  });
}

/**
 * 处理 GET /api/v2/documents/{document_hash}/status
 */
async function handleDocumentStatus(documentHash, corsHeaders) {
  // 获取 hash 尾数
  const lastDigit = documentHash.slice(-1);
  
  let status;
  
  if (lastDigit === '0') {
    // 尾数是 0：随机返回 pending, in_progress, failed
    const statuses = ['pending', 'in_progress', 'failed'];
    status = statuses[Math.floor(Math.random() * statuses.length)];
  } else {
    // 尾数不是 0：返回 done
    status = 'done';
  }

  const responseData = {
    date: new Date().toISOString(),
    note: null,
    result: {
      status,
    },
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * 处理 GET /api/v2/reports/{document_hash}/issues_summary
 */
async function handleIssuesSummary(documentHash, corsHeaders) {
  // 获取 hash 尾数
  const lastDigit = documentHash.slice(-1);
  
  // 尾数是 9：返回错误
  if (lastDigit === '9') {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to retrieve issues summary',
        details: 'Document analysis service unavailable',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
  
  // 尾数是 0：返回空 result
  if (lastDigit === '0') {
    const responseData = {
      date: new Date().toISOString(),
      note: null,
      result: {},
    };
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
  
  // 初始化所有字段为无问题状态
  let authors = { warning_count: 0, severe_warning_count: 0 };
  let references = { warning_count: 0, severe_warning_count: 0 };
  let aiWriting = {
    severe_warning_count: 0,
    proportions: {
      human_proportion: 1.0,
      maybe_ai_proportion: 0.0,
      likely_ai_proportion: 0.0,
    },
  };
  let peerReviewReports = [
    {
      human_proportion: 1.0,
      maybe_ai_proportion: 0.0,
      likely_ai_proportion: 0.0,
    },
  ];
  
  // 根据尾数设置问题
  switch (lastDigit) {
    case '1':
      // authors 只有普通问题（warning > 0，severe warning = 0）且 ai writing 有问题
      authors = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: 0,
      };
      aiWriting = generateAIIssueWithBoth(); // human < 0.7，likely 和 maybe 都不为 0
      break;
      
    case '2':
      // authors 有严重问题（只有 severe warning > 0，warning = 0）
      authors = {
        warning_count: 0,
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      break;
      
    case '3':
      // references 只有普通问题
      references = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: 0,
      };
      break;
      
    case '4':
      // references 有严重问题（只有 severe warning > 0，warning = 0）
      references = {
        warning_count: 0,
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      break;
      
    case '5':
      // authors + references 都只有普通问题
      authors = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: 0,
      };
      references = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: 0,
      };
      break;
      
    case '6':
      // authors + references 都有严重问题（只有 severe），且 peer_review_reports 有问题
      authors = {
        warning_count: 0,
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      references = {
        warning_count: 0,
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      peerReviewReports = [generatePeerReviewIssue()];
      break;
      
    case '7':
      // 所有项都有问题（warning 和 severe 都大于 0），human 都小于 0.7
      authors = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      references = {
        warning_count: Math.floor(Math.random() * 5) + 1, // 1-5
        severe_warning_count: Math.floor(Math.random() * 3) + 1, // 1-3
      };
      aiWriting = generateAIIssue();
      peerReviewReports = [generatePeerReviewIssue()];
      break;
      
    case '8':
      // 无问题（默认值已设置）
      break;
  }
  
  const responseData = {
    date: new Date().toISOString(),
    note: null,
    result: {
      issues_summary: {
        authors,
        references,
        ai_writing: aiWriting,
        peer_review_reports: peerReviewReports,
      },
      report_link: 'https://deployment.susy.mdpi.dev/',
    },
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * 生成 16 位模拟哈希值，尾数与指定数字一致
 */
function generateMockHash16(seed, lastDigit) {
  const hash = Array.from({ length: 15 }, (_, i) => {
    const char = ((seed.charCodeAt(i % seed.length) + i) % 16).toString(16);
    return char;
  }).join('');
  return hash + lastDigit;
}

/**
 * 生成 AI 写作问题（human < 0.7）
 */
function generateAIIssue() {
  const humanProportion = 0.3 + Math.random() * 0.39; // 0.3 - 0.69
  const remaining = 1.0 - humanProportion;
  const maybeAIProportion = Math.random() * remaining;
  const likelyAIProportion = remaining - maybeAIProportion;
  
  return {
    severe_warning_count: Math.floor(Math.random() * 3) + 1,
    proportions: {
      human_proportion: parseFloat(humanProportion.toFixed(2)),
      maybe_ai_proportion: parseFloat(maybeAIProportion.toFixed(2)),
      likely_ai_proportion: parseFloat(likelyAIProportion.toFixed(2)),
    },
  };
}

/**
 * 生成 AI 写作问题（human < 0.7，且 likely 和 maybe 都不为 0）
 */
function generateAIIssueWithBoth() {
  const humanProportion = 0.3 + Math.random() * 0.39; // 0.3 - 0.69
  const remaining = 1.0 - humanProportion;
  
  // 确保 maybe 和 likely 都不为 0
  const minValue = 0.05; // 最小值 5%
  const maybeAIProportion = minValue + Math.random() * (remaining - 2 * minValue);
  const likelyAIProportion = remaining - maybeAIProportion;
  
  return {
    severe_warning_count: Math.floor(Math.random() * 3) + 1,
    proportions: {
      human_proportion: parseFloat(humanProportion.toFixed(2)),
      maybe_ai_proportion: parseFloat(maybeAIProportion.toFixed(2)),
      likely_ai_proportion: parseFloat(likelyAIProportion.toFixed(2)),
    },
  };
}

/**
 * 生成评审报告问题（human < 0.7）
 */
function generatePeerReviewIssue() {
  const humanProportion = 0.3 + Math.random() * 0.39; // 0.3 - 0.69
  const remaining = 1.0 - humanProportion;
  const maybeAIProportion = Math.random() * remaining;
  const likelyAIProportion = remaining - maybeAIProportion;
  
  return {
    human_proportion: parseFloat(humanProportion.toFixed(2)),
    maybe_ai_proportion: parseFloat(maybeAIProportion.toFixed(2)),
    likely_ai_proportion: parseFloat(likelyAIProportion.toFixed(2)),
  };
}
