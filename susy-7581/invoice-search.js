// 发票搜索功能模块
class InvoiceSearch {
    constructor() {
        // 初始化发票搜索模块
    }

    // 检查是否支持该查询类型
    canHandle(query) {
        return SearchUtils.isNumeric(query) || SearchUtils.isHyphenId(query);
    }

    // 构建发票搜索结果
    buildResults(value) {
        // 20% chance of random failure
        if (Math.random() < 0.2) {
            return [];
        }
        
        const invoiceId = String(value || '').trim();
        return [
            SearchUtils.createResult({
                icon: 'receipt_long',
                title: SearchUtils.formatInvoiceTitle(invoiceId, 'Paid'),
                subtitle: 'Quick find invoice',
                actionLabel: 'Open',
                actionId: 'view-invoice-detail',
                payload: { invoiceId, status: 'Paid' },
            }),
        ];
    }

    // 获取命令定义
    getCommandDefinitions() {
        return [
            {
                id: 'quick-invoices',
                icon: '💰',
                title: 'Quick find invoices',
                description: 'Not supported in remote demo',
                intentType: 'invoice',
                sampleInput: 'foods-1570200',
                inputType: 'Invoice ID',
                filterKey: 'invoice',
            },
            {
                id: 'invoice-by-id',
                icon: '🧾',
                title: 'Quick find invoice',
                description: 'Numeric ID or XX-ID',
                intentType: 'invoice',
                sampleInput: 'foods-1570200',
                inputType: 'Invoice ID',
                filterKey: 'invoice',
            },
        ];
    }

    // 获取动作处理器
    getActionHandlers() {
        return {
            'search-invoices': (payload) => alert(`Searching invoices for "${payload.term}"`),
            'view-invoice-detail': (payload) => alert(`Opening invoice ${payload.invoiceId}`),
        };
    }
}

// 导出发票搜索类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvoiceSearch;
} else {
    window.InvoiceSearch = InvoiceSearch;
}
