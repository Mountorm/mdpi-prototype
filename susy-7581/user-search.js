// 用户搜索功能模块
class UserSearch {
    constructor() {
        this.demoUserMap = {
            'hongqiang.cui@mdpi.com': { name: 'Hongqiang Cui', id: 10086 },
            'susy@mdpi.com': { name: 'Susy Smith', id: 10087 },
            'john.doe@mdpi.com': { name: 'John Doe', id: 10088 },
            'chief.editor@mdpi.com': { name: 'Chief Editor', id: 10089 },
        };
    }

    // 检查是否支持该查询类型
    canHandle(query) {
        return SearchUtils.isEmailStrict(query);
    }

    // 构建用户搜索结果
    buildResults(email) {
        // 20% chance of random failure
        // if (Math.random() < 0.2) {
        //   return [];
        // }

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const userInfo = this.demoUserMap[normalizedEmail] || {
            name: email.split('@')[0],
            id: 'N/A',
        };

        const displayTitle = SearchUtils.formatUserDisplay({
            name: userInfo.name,
            email,
            id: userInfo.id,
        });

        return [
            SearchUtils.createResult({
                icon: 'person',
                title: displayTitle,
                subtitle: 'Open user overview',
                actionLabel: 'Open',
                actionId: 'view-user',
                payload: { email, userId: userInfo.id, name: userInfo.name },
            }),
        ];
    }

    // 获取命令定义
    getCommandDefinition() {
        return {
            id: 'user-overview',
            icon: '👤',
            title: 'Show User Overview',
            description: 'Email only',
            intentType: 'email',
            sampleInput: 'susy@mdpi.com',
            inputType: 'Email',
            filterKey: 'user',
        };
    }

    // 获取动作处理器
    getActionHandler() {
        return {};
    }
}

// 导出用户搜索类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserSearch;
} else {
    window.UserSearch = UserSearch;
}
