$(document).ready(function() {

    // Max file size: 100 MB
    var MAX_FILE_SIZE = 100 * 1024 * 1024;

    // Initialize Quill Editor
    var quill = new Quill('#comment-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        },
        placeholder: 'Enter your comment here...'
    });

    // File size validation
    $('#issue-file').on('change', function() {
        var file = this.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            alert('The selected file exceeds the 100 MB size limit. Please choose a smaller file.');
            this.value = '';
        }
    });

    // Submit
    $('#submit-comment').on('click', function() {
        var suggestionHtml = quill.root.innerHTML;
        var suggestionText = quill.getText().trim();
        var signature = $('#editor-signature').val().trim();
        var fileInput = $('#issue-file')[0];
        var file = fileInput.files[0];

        // Validation: comment must not be empty
        if (!suggestionText) {
            alert('Please add a comment before submitting.');
            return;
        }

        // Validate file size (guard again in case onChange was bypassed)
        if (file && file.size > MAX_FILE_SIZE) {
            alert('The selected file exceeds the 100 MB size limit. Please choose a smaller file.');
            return;
        }

        // Build submitted timestamp
        var now = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : n; };
        var dateStr = now.getFullYear() + '-' +
                      pad(now.getMonth() + 1) + '-' +
                      pad(now.getDate()) + ' ' +
                      pad(now.getHours()) + ':' +
                      pad(now.getMinutes()) + ':' +
                      pad(now.getSeconds());

        // Populate submitted view
        $('#submitted-date').text(dateStr);
        $('#submitted-content').html(suggestionHtml);
        $('#submitted-author').text("Academic Editor Comment");

        if (file) {
            $('#submitted-file').html('<a href="#" class="green-link" title="Download ' + $('<span>').text(file.name).html() + '"><i class="fa fa-paperclip"></i> ' + $('<span>').text(file.name).html() + '</a>');
        } else {
            $('#submitted-file').empty();
        }

        // Display signature if provided
        if (signature) {
            $('#submitted-signature').html('<strong>Signature:</strong> ' + $('<span>').text(signature).html());
        } else {
            $('#submitted-signature').empty();
        }

        // Swap form for the read-only submitted view
        $('#comment-form-box').hide();
        $('#comment-submitted-box').show();

        // In real implementation, this would be an AJAX call:
        // $.ajax({
        //     url: '/api/ethics-issue/comment',
        //     method: 'POST',
        //     data: formData,
        //     success: function(response) { ... }
        // });
    });

    // Cancel button
    $('.cancel-link').on('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.history.back();
        }
    });

});
