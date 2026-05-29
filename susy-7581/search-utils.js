// 搜索工具函数
class SearchUtils {
    static escapeHtml(s) {
        return String(s)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    static isEmailStrict(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    }

    static isIpv4(value) {
        return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(String(value || '').trim());
    }

    static isIpv6(value) {
        const v = String(value || '').trim();
        if (!v.includes(':')) return false;
        if (!/^[0-9a-fA-F:]+$/.test(v)) return false;
        const parts = v.split(':');
        return parts.length >= 3;
    }

    static isNumeric(value) {
        return /^\d+$/.test(String(value || '').trim());
    }

    static isHyphenId(value) {
        return /^[a-zA-Z][a-zA-Z0-9-]*-\d+$/i.test(String(value || '').trim());
    }

    static formatManuscriptDisplay(value) {
        const normalized = String(value || '').trim();
        if (!normalized) return '';
        // If input contains hyphen (journal-id pattern), preserve the journal prefix; otherwise treat as pure digits.
        if (normalized.includes('-')) {
            const parts = normalized.split('-');
            const journal = parts[0] || 'Unknown';
            const idPart = parts[1] || '';
            const digits = idPart.replace(/\D+/g, '');
            const suffix = digits ? digits.padStart(6, '0') : idPart;
            return `${journal}-${suffix} (pending review) Dr.Cui`;
        } else {
            const digits = normalized.replace(/\D+/g, '');
            const suffix = digits ? digits.padStart(6, '0') : normalized;
            return `Manuscript-${suffix} (pending review) Dr.Cui`;
        }
    }

    static formatInvoiceTitle(invoiceId, status) {
        const id = String(invoiceId || '').trim();
        if (!id) return '';
        const s = status ? String(status) : 'Paid';
        return `${id} (Invoice Id: ${id} - Status: ${s})`;
    }

    static formatSponsorshipTitle(options) {
        const name = options && options.name ? String(options.name) : '';
        const id = options && (options.id || options.id === 0) ? String(options.id) : '';
        const status = options && options.status ? String(options.status) : 'Paid';
        return `${name} (Id:${id}, Status: ${status})`;
    }

    static formatUserDisplay(user) {
        return `${user.name} <${user.email}> ID:${user.id}`;
    }

    static createResult(options) {
        return {
            id: `result-${++SearchUtils.resultIdCounter}`,
            icon: options.icon || 'search',
            title: options.title,
            subtitle: options.subtitle,
            actionLabel: options.actionLabel || 'Open',
            actionId: options.actionId,
            payload: options.payload || {},
            risk: options.risk,
        };
    }

    static resultKey(result) {
        const payload = result && result.payload ? JSON.stringify(result.payload) : '';
        return `${result.actionId || ''}|${payload}`;
    }
}

// 静态计数器
SearchUtils.resultIdCounter = 0;

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchUtils;
} else {
    window.SearchUtils = SearchUtils;
}
