// 赞助搜索功能模块
class SponsorshipSearch {
    constructor() {
        // 初始化赞助搜索模块
    }

    // 检查是否支持该查询类型
    canHandle(query) {
        // 赞助搜索只支持纯数字ID
        return SearchUtils.isNumeric(query) && query.length <= 3;
    }

    // 构建赞助搜索结果
    buildResults(numericId) {
        // 20% chance of random failure
        if (Math.random() < 0.2) {
            return [];
        }
        
        const id = String(numericId || '').trim();
        return [
            SearchUtils.createResult({
                icon: 'volunteer_activism',
                title: SearchUtils.formatSponsorshipTitle({
                    name: '1st International Congress on Childhood Obesity and Hypertension',
                    id,
                    status: 'Paid',
                }),
                subtitle: 'Quick find sponsorship',
                actionLabel: 'Open',
                actionId: 'view-sponsorship',
                payload: { sponsorshipId: id, status: 'Paid' },
            }),
        ];
    }

    // 获取命令定义
    getCommandDefinition() {
        return {
            id: 'quick-sponsorship',
            icon: '🎓',
            title: 'Quick find sponsorship',
            description: 'Numeric ID only',
            intentType: 'sponsorship',
            sampleInput: '15',
            inputType: 'Sponsorship ID',
            filterKey: 'sponsorship',
        };
    }

    // 获取动作处理器
    getActionHandlers() {
        return {
            'view-sponsorship': (payload) => alert(`Opening sponsorship ${payload.sponsorshipId}`),
            'keyword-sponsorship': (payload) => alert(`Searching sponsorships for "${payload.term}"`),
        };
    }
}

// 导出赞助搜索类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SponsorshipSearch;
} else {
    window.SponsorshipSearch = SponsorshipSearch;
}
