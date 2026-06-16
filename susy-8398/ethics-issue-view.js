$(document).ready(function() {

    // ==========================================
    //  AcE editor name rotation list
    // ==========================================
    var aeNames = ['Kobe Bryant', 'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo'];
    var aeNameIndex = 0; // starts at Kobe Bryant

    // Always scoped to the persistent state1 module — never touch invitation records
    var $state1Name = function() { return $('#ae-state1-module .ae-editor-name'); };

    function getCurrentAeName() {
        return $state1Name().text().trim();
    }

    function rotateAeName() {
        aeNameIndex = (aeNameIndex + 1) % aeNames.length;
        var newName = aeNames[aeNameIndex];
        $state1Name().text(newName);
        updateAeNameColor(newName);
    }

    // Global function so the editor dialog can update the state1 name
    window.updateAcE = function(name) {
        $state1Name().text(name);
        var idx = aeNames.indexOf(name);
        if (idx >= 0) aeNameIndex = idx;
        if (!aePercentages[name]) {
            aePercentages[name] = Math.floor(Math.random() * 31) + 60;
        }
        if (!aeEmails[name]) {
            aeEmails[name] = name.toLowerCase().replace(/\s+/g, '.') + '@scau.edu.cn';
        }
        updateAeNameColor(name);
    };

    function formatDateTime() {
        var now = new Date();
        var pad = function(n) { return String(n).padStart(2, '0'); };
        return now.getFullYear() + '-' +
            pad(now.getMonth() + 1) + '-' +
            pad(now.getDate()) + ' ' +
            pad(now.getHours()) + ':' +
            pad(now.getMinutes()) + ':' +
            pad(now.getSeconds());
    }

    // ==========================================
    //  COI (Conflicts of Interests) percentage logic
    // ==========================================
    var aePercentages = {
        'Kobe Bryant': 60,
        'LeBron James': 85,
        'Stephen Curry': 45,
        'Kevin Durant': 72,
        'Giannis Antetokounmpo': 92
    };

    var aeEmails = {
        'Kobe Bryant': 'kobe.bryant@scau.edu.cn',
        'LeBron James': 'lebron.james@scau.edu.cn',
        'Stephen Curry': 'stephen.curry@scau.edu.cn',
        'Kevin Durant': 'kevin.durant@scau.edu.cn',
        'Giannis Antetokounmpo': 'giannis.antetokounmpo@scau.edu.cn'
    };

    function getPercentClass(pct) {
        if (pct >= 80) return 'coi-green';
        if (pct >= 50) return 'coi-orange';
        return 'coi-red';
    }

    function getPercentColor(pct) {
        if (pct >= 80) return '#148a14';
        if (pct >= 50) return '#e67e22';
        return '#dc3545';
    }

    function updateAeNameColor(name) {
        var pct = aePercentages[name] || 60;
        var color = getPercentColor(pct);
        $state1Name().css('color', color);
    }

    // ==========================================
    //  Initialize Dialogs
    // ==========================================
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

    $('#dialog-pending-comments').dialog({
        autoOpen: false,
        modal: true,
        width: 600
    });

    $('#dialog-invitation-history').dialog({
        autoOpen: false,
        modal: true,
        width: 900,
        dialogClass: 'invitation-history-dialog'
    });

    $('#dialog-coi').dialog({
        autoOpen: false,
        modal: true,
        width: 550
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

    // Delegated: pending comments link (works for dynamic records too)
    $(document).on('click', '.pending-comments-link', function(e) {
        e.preventDefault();
        $('#dialog-pending-comments').dialog('open');
    });

    // Delegated: invitation history links
    $(document).on('click', '.invitation-history-link', function(e) {
        e.preventDefault();
        $('#dialog-invitation-history').dialog('open');
    });

    // Also keep the old filter for pages that don't have .invitation-history-link class
    $('a[href="#"]').filter(function() {
        return $(this).text().trim() === 'click here to see invitation history';
    }).on('click', function(e) {
        e.preventDefault();
        $('#dialog-invitation-history').dialog('open');
    });

    // COI click handler — open dialog when clicking editor name
    $(document).on('click', '.ae-editor-name.coi-clickable', function() {
        var name = $(this).text().trim();
        var pct = aePercentages[name] || Math.floor(Math.random() * 31) + 60;
        var colorClass = getPercentClass(pct);
        var email = aeEmails[name] || name.toLowerCase().replace(/\s+/g, '.') + '@scau.edu.cn';
        $('#coi-email').text(email);
        $('#coi-percentage').text(pct + '% match')
            .removeClass('coi-green coi-orange coi-red')
            .addClass(colorClass);
        $('#dialog-coi').dialog('open');
    });

    // COI refresh button (update percentage for current state1 editor)
    $(document).on('click', '#coi-refresh', function() {
        var name = getCurrentAeName();
        var pct = aePercentages[name] || 60;
        var colorClass = getPercentClass(pct);
        var email = aeEmails[name] || name.toLowerCase().replace(/\s+/g, '.') + '@scau.edu.cn';
        $('#coi-email').text(email);
        $('#coi-percentage').text(pct + '% match')
            .removeClass('coi-green coi-orange coi-red')
            .addClass(colorClass);
    });

    // Copy email to clipboard
    $(document).on('click', '#coi-email', function() {
        var email = $(this).text().trim();
        var $el = $(this);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(function() {
                var origText = $el.text();
                $el.text('✓ Copied!');
                $el.addClass('coi-copied');
                setTimeout(function() {
                    $el.text(origText);
                    $el.removeClass('coi-copied');
                }, 1500);
            });
        } else {
            // Fallback
            var temp = $('<input>').val(email).appendTo('body').select();
            document.execCommand('copy');
            temp.remove();
            var origText = $el.text();
            $el.text('✓ Copied!');
            setTimeout(function() { $el.text(origText); }, 1500);
        }
    });

    // Load more button
    $(document).on('click', '.load-more-link', function(e) {
        e.preventDefault();
        alert('Loading more records...');
    });

    // Comment collapsible toggle (delegated)
    $(document).on('click', '.comment-toggle', function() {
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

    // ==========================================
    //  AcE Invite — click "Invite" in state1 module
    // ==========================================
    $(document).on('click', '#ae-state1-module .ae-invite-btn', function() {
        var editorName = getCurrentAeName();
        var dateStr = formatDateTime();
        var pct = aePercentages[editorName] || 60;
        var color = getPercentColor(pct);

        var recordHtml =
            '<div class="ae-invitation-record" style="padding:10px 20px;display:flex;align-items:flex-start;gap:12px;">' +
                '<div class="academic-editor-info" style="flex:1;">' +
                    '<span style="font-weight:700;">Academic Editor</span>' +
                    '<span class="ae-editor-name coi-clickable" style="margin-left:10px;color:' + color + ';cursor:pointer;">' + editorName + '</span>' +
                    '<a href="#" title="Send email"><span class="ms" style="font-size:18px;">mail</span></a>' +
                    '<a href="#" title="View Information"><span class="ms ms-filled" style="font-size:18px;">person</span></a>' +
                    '<a href="#" title="Note"><span class="ms" style="font-size:18px;">add_notes</span></a>' +
                    '<a href="#" title=""><img src="https://susy.mdpi.com/build/img/icon/clock-frame.png?eb182c3" alt="Clock" style="height:18px;vertical-align:middle;"></a>' +
                    '<span style="margin-left:10px;"><a href="#" class="pending-comments-link">5 Ethics Issue(s) Waiting Comments</a></span>' +
                    ' (<a href="#" class="invitation-history-link">click here to see invitation history</a><span>).</span>' +
                    '<div class="academic-editor-actions ae-invitation-actions">' +
                        'Invited at: ' + dateStr + '<br>' +
                        '<span class="ae-uninvite-btn">Uninvite</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="separator"></div>';

        $('#ae-invitation-records').append(recordHtml);

        // Rotate name for next invite
        rotateAeName();
    });

    // ==========================================
    //  AcE Uninvite — click "Uninvite" in a state2 record
    // ==========================================
    $(document).on('click', '.ae-uninvite-btn', function() {
        var $btn = $(this);
        var $actions = $btn.closest('.ae-invitation-actions');
        var dateStr = formatDateTime();

        // Append uninvited record below invited line
        $actions.append('Uninvited at: ' + dateStr + '<br>');

        // Remove the uninvite button (can't uninvite twice)
        $btn.remove();
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

    // ==========================================
    //  Initial COI color setup (Kobe Bryant = 60% → orange)
    // ==========================================
    updateAeNameColor('Kobe Bryant');

});
