// 搜索UI组件模块
class SearchUI {
    constructor() {
        this.modal = null;
        this.modalTitle = null;
        this.modalBody = null;
        this.modalConfirmHandler = null;
        this.init();
    }

    init() {
        this.modal = document.getElementById('susyModal');
        this.modalTitle = document.getElementById('susyModalTitle');
        this.modalBody = document.getElementById('susyModalBody');
        this.ensureModalEvents();
    }

    // 设置面板打开状态
    setPanelOpen(panel, open) {
        if (open) {
            panel.classList.add('is-open');
            panel.setAttribute('aria-hidden', 'false');
        } else {
            panel.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    // 设置输入框状态
    setInputState(input, open) {
        if (open) {
            input.classList.add('is-panel-open');
        } else {
            input.classList.remove('is-panel-open');
        }
    }

    // 更新清除按钮可见性
    updateClearButtonVisibility(input, clearBtn) {
        const hasValue = String(input.value || '').length > 0;
        clearBtn.hidden = !hasValue;
        clearBtn.classList.toggle('is-visible', hasValue);
    }

    // 渲染筛选卡片
    renderCards(cardList, commandDefinitions, LABELS_BY_FILTER) {
        cardList.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'command-filter-bar';

        const available = new Set(commandDefinitions.map((x) => x.filterKey).filter(Boolean));
        const explicitAllowList = Array.isArray(window.SUSY_ALLOWED_FILTERS) ? window.SUSY_ALLOWED_FILTERS : null;
        const ordered = ['user', 'manuscript', 'ip', 'invoice', 'sponsorship'];
        const chips = [{ id: 'all', label: LABELS_BY_FILTER.all, filter: 'all' }];

        ordered.forEach((key) => {
            if (!available.has(key)) return;
            if (explicitAllowList && !explicitAllowList.includes(key)) return;
            chips.push({ id: key, label: LABELS_BY_FILTER[key] || key, filter: key });
        });

        if (chips.length <= 1) {
            return;
        }

        chips.forEach((c) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'command-filter-chip';
            btn.dataset.filter = c.filter;
            if (c.risk === 'high') delete btn.dataset.risk;
            btn.textContent = c.label;
            wrap.appendChild(btn);
        });

        cardList.appendChild(wrap);
    }

    // 高亮筛选芯片
    highlightChips(cardList, activeFilter) {
        const chips = cardList.querySelectorAll('.command-filter-chip');
        chips.forEach((c) => {
            c.classList.toggle('is-active', (c.dataset.filter || 'all') === activeFilter);
        });
    }

    // 渲染最近操作
    renderRecent(recentList, recentActions, recentClearBtn) {
        recentList.innerHTML = '';
        recentClearBtn.hidden = recentActions.length === 0;
        recentClearBtn.disabled = recentActions.length === 0;
        if (!recentActions.length) {
            const empty = document.createElement('div');
            empty.className = 'command-results-empty';
            empty.textContent = 'No recent actions yet.';
            recentList.appendChild(empty);
            return;
        }

        recentActions.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'command-recent-item';
            if (entry.risk === 'high') item.dataset.risk = 'high';
            item.dataset.index = String(index);
            item.innerHTML = `
                <div class="command-recent-icon"><span class="material-symbols-rounded">${SearchUtils.escapeHtml(entry.icon || 'star')}</span></div>
                <div class="command-recent-texts">
                    <div class="command-recent-title">${SearchUtils.escapeHtml(entry.title)}</div>
                    <div class="command-recent-desc">${SearchUtils.escapeHtml(entry.subtitle || '')}</div>
                </div>
                <div class="command-recent-meta">${SearchUtils.escapeHtml(entry.time || '')}</div>
            `;
            recentList.appendChild(item);
        });
    }

    // 渲染骨架屏
    renderSkeletonRows(resultsList, count) {
        for (let i = 0; i < count; i += 1) {
            const row = document.createElement('div');
            row.className = 'command-result-item is-skeleton';
            row.innerHTML = `
                <div class="command-result-main">
                    <div class="command-result-icon"><span class="command-skeleton-line" data-size="icon"></span></div>
                    <div class="command-skeleton-block">
                        <div class="command-skeleton-line" data-size="title"></div>
                        <div class="command-skeleton-line" data-size="subtitle"></div>
                    </div>
                </div>
                <div class="command-result-action"><span class="command-skeleton-line" data-size="action"></span></div>
            `;
            resultsList.appendChild(row);
        }
    }

    // 排序结果
    sortResults(results) {
        if (!Array.isArray(results) || results.length === 0) return [];
        const stable = results.map((r, idx) => ({ r, idx }));
        stable.sort((a, b) => {
            const aRisk = a.r.risk === 'high' ? 1 : 0;
            const bRisk = b.r.risk === 'high' ? 1 : 0;
            if (aRisk !== bRisk) return aRisk - bRisk;
            return a.idx - b.idx;
        });
        return stable.map((x) => x.r);
    }

    // 渲染搜索结果
    renderResults(resultsList, resultsSection, resultsEmpty, state) {
        const q = String(state.query || '').trim();
        resultsList.innerHTML = '';
        state.renderedResults = [];

        if (!q) {
            resultsSection.hidden = true;
            resultsEmpty.hidden = true;
            return;
        }

        resultsSection.hidden = false;

        const results = this.sortResults(state.results);
        state.renderedResults = results;

        if (!results.length && !state.loading) {
            resultsEmpty.textContent = 'No direct actions found.';
            resultsEmpty.hidden = false;
            return;
        }

        resultsEmpty.hidden = true;
        results.forEach((result, index) => {
            const row = document.createElement('div');
            row.className = 'command-result-item';
            row.dataset.index = String(index);
            if (result.risk === 'high') row.dataset.risk = 'high';
            row.innerHTML = `
                <div class="command-result-main">
                    <div class="command-result-icon"><span class="material-symbols-rounded">${SearchUtils.escapeHtml(result.icon || 'search')}</span></div>
                    <div>
                        <div class="command-result-title">${SearchUtils.escapeHtml(result.title)}</div>
                        <div class="command-result-subtitle">${SearchUtils.escapeHtml(result.subtitle || '')}</div>
                    </div>
                </div>
                <div class="command-result-action">${SearchUtils.escapeHtml(result.actionLabel || 'Open')}</div>
            `;
            resultsList.appendChild(row);
        });

        // Keep a single skeleton placeholder visible while there is any pending source.
        if (state.loading && (state.pendingPrimaryCount + state.pendingSecondaryCount) > 0) {
            this.renderSkeletonRows(resultsList, 1);
        }
    }

    // 打开模态框
    openModal(options) {
        if (!this.modal || !this.modalTitle || !this.modalBody) return;
        this.modalTitle.textContent = options.title || '';
        this.modalBody.innerHTML = options.bodyHtml || '';
        const footer = this.modal.querySelector('.susy-modal-footer');
        if (footer) {
            footer.innerHTML = options.footerHtml || '<button class="susy-modal-btn" type="button" data-close="true">OK</button>';
        }
        this.modalConfirmHandler = options.onConfirm || null;
        this.modal.classList.add('is-open');
        this.modal.setAttribute('aria-hidden', 'false');
    }

    // 关闭模态框
    closeModal() {
        if (!this.modal || !this.modalTitle || !this.modalBody) return;
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        this.modalTitle.textContent = '';
        this.modalBody.innerHTML = '';
        const footer = this.modal.querySelector('.susy-modal-footer');
        if (footer) {
            footer.innerHTML = '<button class="susy-modal-btn" type="button" data-close="true">OK</button>';
        }
        this.modalConfirmHandler = null;
    }

    // 确保模态框事件绑定
    ensureModalEvents() {
        if (!this.modal) return;
        if (this.modal.dataset.bound === 'true') return;
        this.modal.dataset.bound = 'true';
        this.modal.addEventListener('click', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement)) return;
            if (t.dataset.close === 'true') {
                this.closeModal();
                return;
            }
            if (t.dataset.action === 'confirm') {
                const h = this.modalConfirmHandler;
                this.closeModal();
                if (typeof h === 'function') h();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('is-open')) {
                this.closeModal();
            }
        });
    }
}

// 导出搜索UI类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchUI;
} else {
    window.SearchUI = SearchUI;
}
