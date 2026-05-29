// Simple client-side router for SuSy Prototype
(function() {
    function handleRoute() {
        const path = window.location.pathname;
        
        switch(path) {
            case '/det':
                // Redirect to det.html
                window.location.href = 'det.html';
                break;
            case '/':
                // Default to index.html
                if (window.location.href.endsWith('/')) {
                    window.location.href = 'index.html';
                }
                break;
            default:
                // Handle other routes if needed
                break;
        }
    }

    // Handle initial page load
    document.addEventListener('DOMContentLoaded', handleRoute);
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleRoute);
})();