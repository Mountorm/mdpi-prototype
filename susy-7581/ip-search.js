// IP搜索功能模块
class IpSearch {
    constructor() {
        // 初始化IP搜索模块
    }

    // 检查是否支持该查询类型
    canHandle(query) {
        return SearchUtils.isIpv4(query) || SearchUtils.isIpv6(query);
    }

    // 构建IP搜索结果
    buildResults(value) {
        // 20% chance of random failure
        // if (Math.random() < 0.2) {
        //   return [];
        // }
        
        return [
            SearchUtils.createResult({
                icon: 'public',
                title: String(value || '').trim(),
                subtitle: 'Search IP',
                actionLabel: 'View',
                actionId: 'view-ip',
                payload: { ip: String(value || '').trim() },
            }),
        ];
    }

    // 获取命令定义
    getCommandDefinition() {
        return {
            id: 'search-ip',
            icon: '🌐',
            title: 'Search IP',
            description: 'IPv4 or IPv6',
            intentType: 'ip',
            sampleInput: '192.168.1.1',
            inputType: 'IP Address',
            filterKey: 'ip',
        };
    }

    // 获取动作处理器
    getActionHandler() {
        return {
            'view-ip': (payload) => alert(`Viewing IP intelligence for ${payload.ip}`),
        };
    }
}

// 导出IP搜索类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IpSearch;
} else {
    window.IpSearch = IpSearch;
}
