(function () {
    'use strict';

    var expandableReports = document.querySelectorAll('.manuscript-version, .report-round, .reviewer-block');

    expandableReports.forEach(function (report) {
        var indicator = report.querySelector('.file-disclosure, .reviewer-heading .material-symbols-outlined');

        if (indicator) {
            indicator.textContent = report.open ? 'expand_more' : 'chevron_right';
        }

        report.addEventListener('toggle', function () {
            if (indicator) {
                indicator.textContent = report.open ? 'expand_more' : 'chevron_right';
            }
        });
    });

    var menuItems = document.querySelectorAll('.menu-item');
    var viewPanels = document.querySelectorAll('.report-view');
    var mainReportView = document.querySelector('.main-report-view');
    var copyButton = document.querySelector('.copy-script-button');
    var scriptSource = document.querySelector('.script-source');
    var copyFeedback = document.querySelector('.copy-feedback');

    menuItems.forEach(function (menuItem) {
        menuItem.addEventListener('click', function (event) {
            var targetView = menuItem.getAttribute('data-view');

            event.preventDefault();
            menuItems.forEach(function (item) {
                item.classList.toggle('menu-item--active', item === menuItem);
            });
            if (mainReportView) {
                mainReportView.hidden = targetView === 'process';
            }
            viewPanels.forEach(function (panel) {
                panel.hidden = panel.getAttribute('data-view-panel') !== targetView;
            });
        });
    });

    if (copyButton && scriptSource) {
        copyButton.addEventListener('click', function () {
            var text = scriptSource.value;
            var showCopied = function () {
                copyFeedback.textContent = 'Copied';
                setTimeout(function () {
                    copyFeedback.textContent = '';
                }, 1800);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(showCopied);
                return;
            }

            scriptSource.select();
            document.execCommand('copy');
            showCopied();
        });
    }
}());
