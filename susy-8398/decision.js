$(document).ready(function() {
    
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
    
    // Submit Decision
    $('#submit-decision').on('click', function() {
        var decision = $('input[name="decision"]:checked').val();
        var comment = quill.root.innerHTML;
        var commentText = quill.getText().trim();
        var file = $('#issue-file')[0].files[0];
        
        // Validation
        if (!commentText || commentText === '') {
            alert('Please add a comment');
            return;
        }
        
        // Prepare data
        var formData = {
            decision: decision,
            comment: comment,
            hasFile: file ? true : false,
            fileName: file ? file.name : null
        };
        
        console.log('Submitting decision:', formData);
        
        // Show confirmation
        var decisionText = decision === 'no_action' ? 'No Action Required' : 
                          decision === 'correction' ? 'Correction' : 'Retraction';
        alert('Decision submitted successfully!\n\nDecision: ' + decisionText + '\nComment length: ' + commentText.length + ' characters' + (file ? '\nFile: ' + file.name : ''));
        
        // In real implementation, this would be an AJAX call
        // $.ajax({
        //     url: '/api/ethics-issue/decision',
        //     method: 'POST',
        //     data: formData,
        //     success: function(response) {
        //         window.location.href = '/success';
        //     }
        // });
    });
    
    // Cancel button
    $('.cancel-link').on('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.history.back();
        }
    });
    
    // Prevent form submission on Enter key in file input
    $('#issue-file').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
        }
    });
    
});
