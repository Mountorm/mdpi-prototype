document.addEventListener('DOMContentLoaded', function () {
  const DEFAULT_PLACEHOLDER = 'Search';

  // DOM元素
  const triggerBtn = document.getElementById('commandSearchTrigger');
  const input = document.getElementById('commandSearchInput');
  const panel = document.getElementById('commandPanel');
  const cardList = document.getElementById('commandCardList');
  const recentList = document.getElementById('commandRecentList');
  const resultsSection = document.getElementById('commandResults');
  const resultsList = document.getElementById('commandResultsList');
  const resultsEmpty = document.getElementById('commandResultsEmpty');
  const clearBtn = document.getElementById('commandSearchClear');
  const recentClearBtn = document.getElementById('commandRecentClear');

  if (!triggerBtn || !input || !panel || !cardList || !recentList || !resultsSection || !resultsList || !resultsEmpty || !clearBtn || !recentClearBtn) return;

  // 初始化搜索模块
  const searchUI = new SearchUI();
  const userSearch = new UserSearch();
  const manuscriptSearch = new ManuscriptSearch();
  const ipSearch = new IpSearch();
  const invoiceSearch = new InvoiceSearch();
  const sponsorshipSearch = new SponsorshipSearch();

  // 状态管理
  const state = {
    filter: 'all',
    query: '',
    results: [],
    renderedResults: [],
    loading: false,
    plan: null,
    pendingPrimaryCount: 0,
    pendingSecondaryCount: 0,
  };

  // 标签定义
  const LABELS_BY_FILTER = {
    all: 'All',
    user: 'User',
    manuscript: 'Manuscript',
    ip: 'IP',
    invoice: 'Invoice',
    sponsorship: 'Sponsorship',
  };

  // 收集所有命令定义
  function getAllCommandDefinitions() {
    const definitions = [
      userSearch.getCommandDefinition(),
      ipSearch.getCommandDefinition(),
      sponsorshipSearch.getCommandDefinition(),
    ];
    
    // 添加稿件搜索的多个定义
    definitions.push(...manuscriptSearch.getCommandDefinitions());
    
    // 添加发票搜索的多个定义
    definitions.push(...invoiceSearch.getCommandDefinitions());
    
    return definitions;
  }

  // 收集所有动作处理器
  function getAllActionHandlers() {
    const handlers = {
      ...userSearch.getActionHandler(),
      ...ipSearch.getActionHandler(),
    };
    
    // 添加稿件搜索的处理器
    Object.assign(handlers, manuscriptSearch.getActionHandlers());
    
    // 添加发票搜索的处理器
    Object.assign(handlers, invoiceSearch.getActionHandlers());
    
    // 添加赞助搜索的处理器
    Object.assign(handlers, sponsorshipSearch.getActionHandlers());
    
    return handlers;
  }

  // 最近操作数据
  const recentActions = [
    {
      icon: 'person',
      title: 'Hongqiang Cui <hongqiang.cui@mdpi.com> ID:10086',
      subtitle: 'Show User Overview',
      actionId: 'view-user',
      payload: { email: 'hongqiang.cui@mdpi.com', userId: 10086, name: 'Hongqiang Cui' },
      time: '10 minutes ago',
    },
    {
      icon: 'description',
      title: 'Energies-130901 (pending review ) Dr.Cui',
      subtitle: 'Quick find manuscript (Editorial Office)',
      actionId: 'open-manuscript-editorial',
      payload: { manuscriptId: 'SUSY-130901' },
      time: '28 minutes ago',
    },
    {
      icon: 'receipt_long',
      title: 'foods-1570200 (Invoice Id: foods-1570200 - Status: Paid)',
      subtitle: 'Quick find invoice',
      actionId: 'view-invoice-detail',
      payload: { invoiceId: 'foods-1570200', status: 'Paid' },
      time: '1 hour ago',
    },
    {
      icon: 'public',
      title: '192.168.1.8',
      subtitle: 'Search IP',
      actionId: 'view-ip',
      payload: { ip: '192.168.1.8' },
      time: '2 hours ago',
    },
  ];

  // 动作处理器
  const ACTION_HANDLERS = getAllActionHandlers();

  // 搜索延迟配置
  const PRIMARY_DELAY_MS = 350;
  const SECONDARY_DELAY_MS = 2000;
  let searchSeq = 0;
  let primaryTimer = null;
  let secondaryTimer = null;

  // 合并结果
  function mergeResults(next) {
    const existingKeys = new Set(state.results.map((r) => SearchUtils.resultKey(r)));
    next.forEach((r) => {
      const k = SearchUtils.resultKey(r);
      if (existingKeys.has(k)) return;
      existingKeys.add(k);
      state.results.push(r);
    });
  }

  // 取消待处理的搜索
  function cancelPendingSearch() {
    if (primaryTimer) {
      clearTimeout(primaryTimer);
      primaryTimer = null;
    }
    if (secondaryTimer) {
      clearTimeout(secondaryTimer);
      secondaryTimer = null;
    }
  }

  // 为特定源构建结果
  function buildResultsForSource(source, plan) {
    switch (source) {
      case 'user':
        return userSearch.buildResults(plan.email);
      case 'ip':
        return ipSearch.buildResults(plan.ip);
      case 'manuscript':
        return manuscriptSearch.buildResults(plan.hyphenId || plan.numericId || plan.query);
      case 'invoice':
        return invoiceSearch.buildResults(plan.hyphenId || plan.numericId || plan.query);
      case 'sponsorship':
        return sponsorshipSearch.buildResults(plan.numericId);
      default:
        return [];
    }
  }

  // 预测搜索计划
  function predictSearchPlan(query) {
    const q = String(query || '').trim();
    const allow = (key) => state.filter === 'all' || state.filter === key;

    if (SearchUtils.isEmailStrict(q)) {
      return {
        query: q,
        primary: allow('user') ? ['user'] : [],
        secondary: [],
        email: q,
      };
    }

    if (SearchUtils.isIpv4(q) || SearchUtils.isIpv6(q)) {
      return {
        query: q,
        primary: allow('ip') ? ['ip'] : [],
        secondary: [],
        ip: q,
      };
    }

    if (SearchUtils.isNumeric(q)) {
      const len = q.length;
      const primary = [];
      const secondary = [];

      if (len <= 3) {
        if (allow('sponsorship')) primary.push('sponsorship');
        if (allow('manuscript')) secondary.push('manuscript');
        if (allow('invoice')) secondary.push('invoice');
      } else {
        if (allow('manuscript')) primary.push('manuscript');
        if (allow('invoice')) primary.push('invoice');
        if (allow('sponsorship')) secondary.push('sponsorship');
      }

      return { query: q, primary, secondary, numericId: q };
    }

    if (SearchUtils.isHyphenId(q)) {
      const primary = [];
      if (allow('manuscript')) primary.push('manuscript');
      if (allow('invoice')) primary.push('invoice');
      return { query: q, primary, secondary: [], hyphenId: q };
    }

    return { query: q, primary: [], secondary: [], nameLike: q };
  }

  // 开始分层搜索
  function startLayeredSearch(query) {
    const q = String(query || '').trim();
    searchSeq += 1;
    const seq = searchSeq;

    cancelPendingSearch();

    state.query = q;
    state.results = [];
    state.renderedResults = [];
    state.plan = null;
    state.pendingPrimaryCount = 0;
    state.pendingSecondaryCount = 0;
    state.loading = !!q;
    searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);

    if (!q) {
      state.loading = false;
      return;
    }

    const plan = predictSearchPlan(q);
    state.plan = plan;
    state.pendingPrimaryCount = Array.isArray(plan.primary) ? plan.primary.length : 0;
    state.pendingSecondaryCount = Array.isArray(plan.secondary) ? plan.secondary.length : 0;
    state.loading = (plan.primary && plan.primary.length > 0) || state.pendingSecondaryCount > 0;
    searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);

    primaryTimer = setTimeout(function () {
      if (seq !== searchSeq) return;
      const primaryResults = [];
      (plan.primary || []).forEach((source) => {
        primaryResults.push(...buildResultsForSource(source, plan));
      });
      mergeResults(primaryResults);
      state.pendingPrimaryCount = 0;
      searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);

      if (!Array.isArray(plan.secondary) || plan.secondary.length === 0) {
        state.loading = false;
        searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);
      }
    }, PRIMARY_DELAY_MS);

    secondaryTimer = setTimeout(function () {
      if (seq !== searchSeq) return;
      const secondaryResults = [];
      (plan.secondary || []).forEach((source) => {
        secondaryResults.push(...buildResultsForSource(source, plan));
      });
      mergeResults(secondaryResults);
      state.pendingSecondaryCount = 0;
      state.loading = false;
      searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);
    }, SECONDARY_DELAY_MS);
  }

  // 更新最近历史
  function updateRecentHistory(result) {
    const key = SearchUtils.resultKey(result);
    const existingIdx = recentActions.findIndex((x) => SearchUtils.resultKey(x) === key);
    if (existingIdx >= 0) {
      recentActions.splice(existingIdx, 1);
    }
    recentActions.unshift({
      icon: result.icon,
      title: result.title,
      subtitle: result.subtitle,
      actionId: result.actionId,
      payload: result.payload,
      risk: result.risk,
      time: 'Just now',
    });
    if (recentActions.length > 5) recentActions.length = 5;
    searchUI.renderRecent(recentList, recentActions, recentClearBtn);
  }

  // 清除查询
  function clearQuery(keepPanelOpen) {
    cancelPendingSearch();
    input.value = '';
    state.query = '';
    state.results = [];
    state.loading = false;
    searchUI.renderResults(resultsList, resultsSection, resultsEmpty, state);
    searchUI.updateClearButtonVisibility(input, clearBtn);
    if (keepPanelOpen) {
      searchUI.setPanelOpen(panel, true);
      searchUI.setInputState(input, true);
      input.focus();
    }
  }

  // 显示搜索内容区域
  function showSearchContent(actionId) {
    // 隐藏所有内容区域
    const allSections = document.querySelectorAll('.search-content-section');
    allSections.forEach(section => section.style.display = 'none');
    
    // 根据actionId显示对应的内容区域
    let targetSection = null;
    switch (actionId) {
      case 'view-user':
        targetSection = document.getElementById('user-search-content');
        break;
      case 'open-manuscript-editorial':
      case 'open-manuscript-english':
        targetSection = document.getElementById('manuscript-search-content');
        break;
      case 'view-ip':
        targetSection = document.getElementById('ip-search-content');
        break;
      case 'view-invoice-detail':
        targetSection = document.getElementById('invoice-search-content');
        break;
      case 'view-sponsorship':
        targetSection = document.getElementById('sponsorship-search-content');
        break;
    }
    
    if (targetSection) {
      targetSection.style.display = 'block';
      // 滚动到内容区域
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 运行动作
  function runAction(result, fromRecent) {
    // 显示对应的内容区域
    showSearchContent(result.actionId);
    
    // 可以在这里添加具体的业务逻辑
    const handler = ACTION_HANDLERS[result.actionId];
    if (handler) {
      // 暂时注释掉alert，改为在页面中显示
      // handler(result.payload || {}, result);
      console.log(`执行操作: ${result.title}`, result.payload);
    }
    
    if (!fromRecent) updateRecentHistory(result);
    input.focus();
    input.select();
  }


  // 执行结果
  function executeResult(result, fromRecent) {
    if (!result) return;
    runAction(result, fromRecent);
  }

  // 处理最近操作点击
  function handleRecentClick(idx) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= recentActions.length) return;
    const entry = recentActions[idx];
    executeResult(entry, true);
    recentActions.splice(idx, 1);
    entry.time = 'Just now';
    recentActions.unshift(entry);
    searchUI.renderRecent(recentList, recentActions, recentClearBtn);
  }

  // 更新结果
  function updateResults() {
    state.query = input.value;
    startLayeredSearch(state.query);
    searchUI.updateClearButtonVisibility(input, clearBtn);
  }

  // 附加事件监听器
  function attachEvents() {
    input.placeholder = DEFAULT_PLACEHOLDER;

    triggerBtn.addEventListener('click', function () {
      searchUI.setPanelOpen(panel, true);
      searchUI.setInputState(input, true);
      updateResults();
      input.focus();
      input.select();
    });

    recentClearBtn.addEventListener('click', function () {
      recentActions.length = 0;
      searchUI.renderRecent(recentList, recentActions, recentClearBtn);
    });

    clearBtn.addEventListener('click', function () {
      clearQuery(true);
      updateResults();
    });

    input.addEventListener('focus', function () {
      searchUI.setPanelOpen(panel, true);
      searchUI.setInputState(input, true);
      updateResults();
    });

    input.addEventListener('click', function () {
      searchUI.setPanelOpen(panel, true);
    });

    input.addEventListener('input', function () {
      searchUI.setPanelOpen(panel, true);
      updateResults();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (String(input.value || '').length) {
          clearQuery(true);
          updateResults();
          e.preventDefault();
          return;
        }
        searchUI.setPanelOpen(panel, false);
        searchUI.setInputState(input, false);
        input.blur();
        return;
      }

      if (e.key === 'Enter') {
        if (state.results.length > 0) {
          executeResult(state.results[0], false);
        }
      }
    });

    resultsList.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const row = t.closest('.command-result-item');
      if (!row) return;
      const idx = Number(row.dataset.index);
      if (!Number.isInteger(idx)) return;
      executeResult(state.renderedResults[idx], false);
    });

    recentList.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const row = t.closest('.command-recent-item');
      if (!row) return;
      const idx = Number(row.dataset.index);
      if (!Number.isInteger(idx)) return;
      handleRecentClick(idx);
    });

    // 筛选芯片事件
    cardList.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const chip = t.closest('.command-filter-chip');
      if (!chip) return;
      const next = chip.dataset.filter || 'all';
      state.filter = state.filter === next ? 'all' : next;
      searchUI.highlightChips(cardList, state.filter);
      updateResults();
    });

    document.addEventListener('click', function (e) {
      const t = e.target;
      if (!(t instanceof Node)) return;
      const searchRoot = document.getElementById('topCommandSearch');
      if (!searchRoot) return;
      if (!searchRoot.contains(t) && !panel.contains(t)) {
        searchUI.setPanelOpen(panel, false);
        searchUI.setInputState(input, false);
      }
    });
  }

  // 初始化
  const commandDefinitions = getAllCommandDefinitions();
  searchUI.renderCards(cardList, commandDefinitions, LABELS_BY_FILTER);
  searchUI.highlightChips(cardList, state.filter);
  searchUI.renderRecent(recentList, recentActions, recentClearBtn);
  attachEvents();
  updateResults();
});
