/**
 * Demo Navigation - 悬浮导航
 * 在 state1/state2/state3 页面间切换
 */
$(document).ready(function() {
    // 页面映射
    var pages = [
        { file: 'state1.html', label: 'State 1: Default' },
        { file: 'state2.html', label: 'State 2: Invited' },
        { file: 'state3.html', label: 'State 3: Suggestion Received' },
        { file: 'index.html', label: 'All' },
        { file: 'suggestion.html', label: 'Suggestion Page' }
    ];

    // 获取当前文件名
    var currentFile = window.location.pathname.split('/').pop() || 'state1.html';

    // 构建导航 HTML
    var navHtml = '<nav class="demo-nav" id="demo-nav">';
    pages.forEach(function(page) {
        var isActive = (page.file === currentFile) ? ' class="active"' : '';
        navHtml += '<a href="' + page.file + '"' + isActive + '>' + page.label + '</a>';
    });
    navHtml += '</nav>';
    navHtml += '<button class="demo-nav-toggle" id="demo-nav-toggle">DEMO</button>';

    // 插入到 body 开头
    $('body').prepend(navHtml).addClass('has-demo-nav');

    // 收起/展开功能
    var $nav = $('#demo-nav');
    var $toggle = $('#demo-nav-toggle');

    $toggle.on('click', function() {
        $nav.toggleClass('collapsed');
        if ($nav.hasClass('collapsed')) {
            $toggle.addClass('visible');
        } else {
            $toggle.removeClass('visible');
        }
    });

    // 鼠标悬停在左边缘时展开
    $(document).on('mousemove', function(e) {
        if (e.clientX < 5 && $nav.hasClass('collapsed')) {
            $nav.removeClass('collapsed');
            $toggle.removeClass('visible');
        }
    });
});
