// 稿件搜索功能模块
class ManuscriptSearch {
    constructor() {
        // 初始化稿件搜索模块
    }

    // 检查是否支持该查询类型
    canHandle(query) {
        return SearchUtils.isNumeric(query) || SearchUtils.isHyphenId(query);
    }

    // 构建稿件搜索结果
    buildResults(value) {
        // 20% chance of random failure
        if (Math.random() < 0.2) {
            return [];
        }
        
        const display = SearchUtils.formatManuscriptDisplay(value);
        return [
            SearchUtils.createResult({
                icon: 'description',
                title: display,
                subtitle: 'Quick find manuscript (Editorial Office)',
                actionLabel: 'Open',
                actionId: 'open-manuscript-editorial',
                payload: { manuscriptId: String(value || '').trim() },
            }),
            SearchUtils.createResult({
                icon: 'edit',
                title: display,
                subtitle: 'Quick find manuscript (English Office)',
                actionLabel: 'Open',
                actionId: 'open-manuscript-english',
                payload: { manuscriptId: String(value || '').trim() },
            }),
        ];
    }

    // 获取命令定义
    getCommandDefinitions() {
        return [
            {
                id: 'editorial-quick-manuscript',
                icon: '📄',
                title: 'Quick find manuscript (Editorial Office)',
                description: 'Numeric ID or XX-ID',
                intentType: 'manuscript',
                sampleInput: 'Energies-130901',
                inputType: 'Manuscript ID',
                filterKey: 'manuscript',
            },
            {
                id: 'english-quick-manuscript',
                icon: '✏️',
                title: 'Quick find manuscript (English Office)',
                description: 'Numeric ID or XX-ID',
                intentType: 'manuscript',
                sampleInput: '130901',
                inputType: 'Manuscript ID',
                filterKey: 'manuscript',
            },
        ];
    }

    // 获取动作处理器
    getActionHandlers() {
        return {
            'open-manuscript-editorial': (payload) => alert(`Opening Editorial workspace for ${payload.manuscriptId}`),
            'open-manuscript-english': (payload) => alert(`Opening English Editing workspace for ${payload.manuscriptId}`),
        };
    }
}

// 导出稿件搜索类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManuscriptSearch;
} else {
    window.ManuscriptSearch = ManuscriptSearch;
}
