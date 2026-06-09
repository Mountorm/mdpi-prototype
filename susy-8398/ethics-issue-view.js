$(document).ready(function() {
    
    // Initialize Dialogs
    $('#dialog-add-watcher').dialog({
        autoOpen: false,
        modal: true,
        width: 500
    });
    
    $('#dialog-notes').dialog({
        autoOpen: false,
        modal: true,
        width: 600
    });
    
    $('#dialog-feeds').dialog({
        autoOpen: false,
        modal: true,
        width: 700
    });
    
    $('#dialog-pending-suggestions').dialog({
        autoOpen: false,
        modal: true,
        width: 600
    });
    
    $('#dialog-invitation-history').dialog({
        autoOpen: false,
        modal: true,
        width: 900
    });
    
    // Dialog Event Handlers
    $('#add-watcher').on('click', function() {
        $('#dialog-add-watcher').dialog('open');
    });
    
    $('#dialog-add-watcher form').on('submit', function(e) {
        e.preventDefault();
        var email = $('#watcher-email').val();
        if (!email || email.trim() === '') {
            alert('Please enter an email address');
            return;
        }
        alert('Watcher added: ' + email);
        $('#dialog-add-watcher').dialog('close');
        $('#watcher-email').val('');
    });
    
    $('.manuscript-special-issue-notes').on('click', function(e) {
        e.preventDefault();
        $('#dialog-notes').dialog('open');
    });
    
    $('.display-feeds-btn').on('click', function(e) {
        e.preventDefault();
        $('#dialog-feeds').dialog('open');
    });
    
    $('.pending-suggestions-link').on('click', function(e) {
        e.preventDefault();
        $('#dialog-pending-suggestions').dialog('open');
    });
    
    // Invitation history links (multiple in academic editor sections)
    $('a[href="#"]').filter(function() {
        return $(this).text().trim() === 'click here to see invitation history';
    }).on('click', function(e) {
        e.preventDefault();
        $('#dialog-invitation-history').dialog('open');
    });
    
    // Load more button
    $('.load-more-link').on('click', function(e) {
        e.preventDefault();
        alert('Loading more records...');
        // In real implementation, this would load more data via AJAX
    });

    // Suggestion collapsible toggle
    $('.suggestion-toggle').on('click', function() {
        var targetId = $(this).data('target');
        var $body = $('#' + targetId);
        var $more = $(this).find('.toggle-label-more');
        var $less = $(this).find('.toggle-label-less');

        if ($body.hasClass('collapsed')) {
            $body.removeClass('collapsed').addClass('expanded');
            $more.hide();
            $less.show();
        } else {
            $body.removeClass('expanded').addClass('collapsed');
            $more.show();
            $less.hide();
        }
    });

    // Dev notes: draggable and collapsible
    $('.ae-note').each(function() {
        var $note = $(this);
        
        // Make draggable by header
        $note.draggable({
            handle: '.ae-note-header',
            containment: 'window',
            scroll: false
        });
        
        // Toggle collapse
        $note.find('.ae-note-toggle').on('click', function() {
            $note.toggleClass('collapsed');
            if ($note.hasClass('collapsed')) {
                $(this).text('+');
            } else {
                $(this).text('−');
            }
        });
    });
    
    // Toggle Files
    $('#toggle-files').on('click', function(e) {
        e.preventDefault();
        $('#files-list').toggle();
        if ($('#files-list').is(':visible')) {
            $(this).text('Collapse [-]');
        } else {
            $(this).text('Display Files [+]');
        }
    });
    
    // Edit Description
    $('.change-desc-btn').on('click', function() {
        $('#content-desc').hide();
        $(this).hide();
        $('#edit-desc').show();
    });
    
    $('.cancel-desc').on('click', function(e) {
        e.preventDefault();
        $('#edit-desc').hide();
        $('#content-desc').show();
        $('.change-desc-btn').show();
    });
    
    $('.submit-desc').on('click', function() {
        alert('Description updated successfully!');
        $('#edit-desc').hide();
        $('#content-desc').show();
        $('.change-desc-btn').show();
    });
    
    // Upload Form
    $('#upload-form').on('submit', function(e) {
        e.preventDefault();
        alert('File uploaded successfully!');
    });
    
});
