$(document).ready(function() {

    // Max file size: 100 MB
    var MAX_FILE_SIZE = 100 * 1024 * 1024;

    // Initialize Quill Editor
    var quill = new Quill('#suggestion-editor', {
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
        placeholder: 'Enter your suggestion here...'
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
    $('#submit-decision').on('click', function() {
        var suggestionHtml = quill.root.innerHTML;
        var suggestionText = quill.getText().trim();
        var fileInput = $('#issue-file')[0];
        var file = fileInput.files[0];

        // Validation: suggestion must not be empty
        if (!suggestionText) {
            alert('Please add a suggestion before submitting.');
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

        if (file) {
            $('#submitted-file').html('<i class="fa fa-paperclip"></i> ' + $('<span>').text(file.name).html());
        } else {
            $('#submitted-file').empty();
        }

        // Swap form for the read-only submitted view
        $('#suggestion-form-box').hide();
        $('#suggestion-submitted-box').show();

        // In real implementation, this would be an AJAX call:
        // $.ajax({
        //     url: '/api/ethics-issue/suggestion',
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
