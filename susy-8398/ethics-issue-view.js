$(document).ready(function() {
    
    // Add Watcher Dialog
    $('#dialog-add-watcher').dialog({
        autoOpen: false,
        width: 500,
        modal: true
    });
    
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
    
    // Notes Dialog
    $('#dialog-notes').dialog({
        autoOpen: false,
        width: 600,
        modal: true
    });
    
    $('.manuscript-special-issue-notes').on('click', function(e) {
        e.preventDefault();
        $('#dialog-notes').dialog('open');
    });
    
    // Feeds Dialog
    $('#dialog-feeds').dialog({
        autoOpen: false,
        width: 700,
        modal: true
    });
    
    $('.display-feeds-btn').on('click', function(e) {
        e.preventDefault();
        $('#dialog-feeds').dialog('open');
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
