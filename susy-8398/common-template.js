/**
 * Common Template - 公共页面模板
 * 用于 state1/state2/state3 页面共享的 HTML 结构
 */

var CommonTemplate = {

    // 渲染 <head> 部分
    renderHead: function(title) {
        return '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>' + (title || 'Ethics Issue View - Prototype') + '</title>' +
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0">' +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
            '<link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">' +
            '<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">' +
            '<link rel="stylesheet" href="ethics-issue-view.css">' +
            '<link rel="stylesheet" href="nav.css">';
    },

    // 渲染 Manuscript Information
    renderManuscriptInfo: function() {
        return '<div class="manuscript-info">' +
            '<h3>Manuscript Information</h3>' +
            '<fieldset id="manuscriptDetails">' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Assigned Editor</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">Hongqiang Cui</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Journal</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word"><i>Energies</i></div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Type</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">Article</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Open Review</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">No</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Number of Pages</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">10</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Manuscript Status</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">Website online</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Title</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">' +
                        '<a href="#" title="View the published paper" target="_blank">Test for susy-8398</a>' +
                    '</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Authors</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">' +
                        '<table class="general-table"><tbody>' +
                            '<tr><td>Dr.</td><td style="max-width:200px;">Author <b>One</b> <b>*</b></td><td style="max-width:200px;"><a href="javascript:void(0);" class="tooltip-info" title="Display the author\'s email">authorone@uhu.edu.cn</a></td><td><span class="tooltip-info" title="China">CN</span></td><td style="max-width:100px;"><div class="text-truncate">Department of SuSy</div></td></tr>' +
                            '<tr><td>Mr.</td><td style="max-width:200px;">Author <b>Two</b></td><td style="max-width:200px;"><a href="javascript:void(0);" class="tooltip-info color-gray" title="Don\'t display the author\'s email">authortwo@math.uol.edu.pk</a></td><td><span class="tooltip-info" title="Pakistan">PK</span></td><td style="max-width:100px;"><div class="text-truncate">Department of SuSy</div></td></tr>' +
                            '<tr><td>Mr.</td><td style="max-width:200px;">Author <b>Three</b></td><td style="max-width:200px;"><a href="javascript:void(0);" class="tooltip-info color-gray" title="Don\'t display the author\'s email">authorthree@cmt.edu.pk</a></td><td><span class="tooltip-info" title="Pakistan">PK</span></td><td style="max-width:100px;"><div class="text-truncate">Department of Shenzhen</div></td></tr>' +
                            '<tr><td>Dr.</td><td style="max-width:200px;">Author <b>Four</b></td><td style="max-width:200px;"><a href="javascript:void(0);" class="tooltip-info color-gray" title="Don\'t display the author\'s email">authorfour@uoradea.ro</a></td><td><span class="tooltip-info" title="Romania">RO</span></td><td style="max-width:100px;"><div class="text-truncate">Department of Information</div></td></tr>' +
                        '</tbody></table>' +
                    '</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Keywords</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">SuSy;MDPI;Test;Shenzhen</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Submitted to Section</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">E: Section Name</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Submitted to Special Issue</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">SI Name</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Submission Received</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">01 June 2026</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Accepted</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">02 June 2026</div>' +
                '</div>' +
                '<div class="row grid-x grid-padding-x grid-margin-y">' +
                    '<div class="cell small-12 medium-6 large-2">Published</div>' +
                    '<div class="cell small-12 medium-6 large-8 break-word">03 June 2026</div>' +
                '</div>' +
            '</fieldset>' +
        '</div>';
    },

    // 渲染 Ethics Issue 区域
    renderEthicsIssue: function() {
        return '<div class="ethics-issue-box">' +
            '<div class="ethics-issue-header">' +
                '<h3>Ethics Issue - 10086</h3>' +
                '<a href="#" class="edit-issue-btn">Edit Issue</a>' +
            '</div>' +
            '<table class="details-table">' +
                '<tr><th>Issue Status</th><td>In Progress</td><th>Submission Date</th><td>2026-06-01 12:34:56</td></tr>' +
                '<tr><th>Priority</th><td>Normal</td><th>Issue Type</th><td>Citation Irregularities</td></tr>' +
                '<tr><th>Doi Id</th><td>10.3390/test10086</td><th>Manuscript ID</th><td><a href="#" target="_blank">energies-2011803</a></td></tr>' +
                '<tr><th>Assigned Editor</th><td>Hongqiang Cui (hongqiang.cui@mdpi.com)</td><th>Complainant Name/E-Mail</th><td>Elon Musk (musk@x.com)</td></tr>' +
                '<tr><th>Watchers</th><td>' +
                    '<div style="margin-bottom:5px;">Dr.Lin(lin@mdpi.com) <a href="#" class="text-muted" title="Delete Watcher" onclick="return confirm(\'Are you sure to delete this watcher?\');"><i class="fa fa-trash"></i></a></div>' +
                    '<div><i id="add-watcher" class="fa fa-lg fa-plus-circle" title="Add Watcher"></i></div>' +
                '</td><th>Result</th><td></td></tr>' +
                '<tr><th>Title of Complaint</th><td>citation misuse / references</td><th>Related Manuscripts</th><td></td></tr>' +
            '</table>' +
        '</div>';
    },

    // 渲染 Content Sections（Description + Files + Feeds + Comments）
    renderContentSections: function() {
        return '<div class="content-sections">' +
            '<!-- Description -->' +
            '<div class="content-box">' +
                '<h4>Description:</h4>' +
                '<div id="content-desc"><p>这里是描述</p><p>这里是描述</p></div>' +
                '<a href="javascript:void(0);" class="edit-icon change-desc-btn" title="Revised Description"><i class="ms ms-edit"></i></a>' +
                '<div id="edit-desc" style="display:none;">' +
                    '<textarea rows="6" placeholder="Revised Description"></textarea>' +
                    '<div style="margin-top:10px;"><button class="btn-primary submit-desc">Submit</button> <a href="javascript:void(0);" class="cancel-desc">Cancel</a></div>' +
                '</div>' +
            '</div>' +
            '<!-- File Attachments -->' +
            '<div class="content-box upfile">' +
                '<a href="#" class="green-link" id="toggle-files">Display Files [+]</a>' +
                '<div id="files-list" style="display:none;margin-top:15px;">' +
                    '<p class="text-muted text-italic">No Files</p>' +
                    '<div style="margin-top:20px;">' +
                        '<form id="upload-form"><div style="margin-bottom:10px;"><input type="file" name="attachment"><p></p><button type="submit" class="btn-primary">Upload</button></div></form>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<!-- Display Feeds -->' +
            '<div style="padding:10px 20px 10px 170px;"><a href="#" class="green-link display-feeds-btn">Display Feeds</a></div>' +
            '<!-- Comments -->' +
            '<div class="separator"></div>' +
            '<div class="comment-box">' +
                '<div class="comment-header"><span class="comment-author">Hongqiang Cui</span><span class="comment-date">2026-05-09 11:04:08</span></div>' +
                '<div class="comment-content"><p>Create Issue</p></div>' +
                '<a href="javascript:void(0);" class="edit-icon" title="Add Revised Comment"><i class="ms ms-edit"></i></a>' +
            '</div>' +
            '<div class="separator"></div>' +
            '<div class="change-history-box"><li>Ethics Type updated from <i>Unassigned/other</i> to <i>Citation irregularities</i></li></div>' +
            '<div class="comment-box">' +
                '<div class="comment-header"><span class="comment-author">Hongqiang Cui</span><span class="comment-date">2026-05-09 11:04:08</span></div>' +
                '<div class="comment-content"><p>Edit Issue</p></div>' +
                '<a href="javascript:void(0);" class="edit-icon" title="Add Revised Comment"><i class="ms ms-edit"></i></a>' +
            '</div>' +
            '<div class="separator"></div>';
    },

    // Academic Editor 公共头部
    _aeHeader: function() {
        return '<div style="padding:10px 20px;display:flex;align-items:flex-start;gap:12px;">' +
            '<div class="academic-editor-info" style="flex:1;">' +
                '<span style="font-weight:700;">Academic Editor</span>' +
                '<span style="margin-left:10px;color:#148a14;">Kobe Bryant</span>' +
                '<a href="#" title="Send email"><span class="ms" style="font-size:18px;">mail</span></a>' +
                '<a href="#" title="View Information"><span class="ms ms-filled" style="font-size:18px;">person</span></a>' +
                '<a href="#" title="Note"><span class="ms" style="font-size:18px;">add_notes</span></a>' +
                '<a href="#" title=""><img src="https://susy.mdpi.com/build/img/icon/clock-frame.png?eb182c3" alt="Clock" style="height:18px;vertical-align:middle;"></a>' +
                '<span style="margin-left:10px;"><a href="#" class="pending-comments-link">5 Ethics Issue(s) Waiting Comments</a></span>' +
                ' (<a href="#">click here to see invitation history</a><span>).</span>';
    },

    // State 1: 未邀请
    renderState1: function() {
        return this._aeHeader() +
            '<div class="academic-editor-actions">' +
                '<span>Invite</span> or <span class="choose-editor-btn">Choose another editor</span> to make a comment' +
            '</div></div></div>';
    },

    // State 2: 已邀请
    renderState2: function() {
        return this._aeHeader() +
            '<div class="academic-editor-actions">' +
                'Invited at: 2026-06-01 10:20:16<br>' +
                '<span>Uninvite</span> or <span class="choose-editor-btn">Choose another editor</span> to make a comment' +
            '</div></div></div>';
    },

    // State 3: 已收到建议
    renderState3: function() {
        return this._aeHeader() +
            '<div class="academic-editor-actions">' +
                '<div class="comment-box" style="border:none;padding:0 0 2px 6px;margin-top:8px;">' +
                    '<div class="comment-collapsible">' +
                        '<div class="comment-body collapsed" id="comment-body-1">' +
                            '<div class="comment-content">' +
                                '<p>After thorough review of the manuscript and the ethics complaint regarding citation irregularities, I have carefully examined all the evidence presented by both the complainant and the authors.</p>' +
                                '<p>My assessment is as follows:</p>' +
                                '<p>1. The authors should provide additional clarification on the citation methodology in Section 3.2, particularly regarding the self-citation practices that have been flagged.</p>' +
                                '<p>2. A correction notice should be published to address the citation irregularities identified in the reference list, specifically citations [12], [15], and [23].</p>' +
                                '<p>3. The reference list requires revision to properly acknowledge all cited sources and remove any duplicate entries that misrepresent the original works.</p>' +
                                '<p>4. The authors should also address the concern raised about the potential overlap with previously published work by the same research group.</p>' +
                                '<p>5. A written response from the authors explaining the citation choices should be submitted within 30 days.</p>' +
                                '<p>I believe these steps will adequately address the concerns raised while maintaining the integrity of the published work.</p>' +
                            '</div>' +
                        '</div>' +
                        '<a href="javascript:void(0);" class="comment-toggle" data-target="comment-body-1">' +
                            '<span class="toggle-label-more">Show more <i class="fa fa-angle-down"></i></span>' +
                            '<span class="toggle-label-less" style="display:none;">Show less <i class="fa fa-angle-up"></i></span>' +
                        '</a>' +
                    '</div>' +
                    '<div style="margin-top:6px;font-size:14px;">Signature: Dr. Kobe Bryant</div>' +
                    '<div style="margin-top:6px;"><a href="#" class="green-link"><i class="fa fa-paperclip"></i> supporting-document.pdf</a></div>' +
                '</div>' +
                '<div style="margin-top:8px;padding-top:8px;font-size:14px;color:#555;">(Comment IP: 192.168.1.15) (09 June 2026)</div>' +
            '</div></div></div>';
    },

    // 渲染 State 1 学编模块（持久化在页面底部，与 index.html 一致）
    renderState1Module: function() {
        return '<div id="ae-invitation-records"></div>' +
            '<div class="separator"></div>' +
            '<div id="ae-state1-module" style="padding:10px 20px;display:flex;align-items:flex-start;gap:12px;">' +
                '<div class="academic-editor-info" style="flex:1;">' +
                    '<span style="font-weight:700;">Academic Editor</span>' +
                    '<span class="ae-editor-name" style="margin-left:10px;color:#148a14;">Kobe Bryant</span>' +
                    '<a href="#" title="Send email"><span class="ms" style="font-size:18px;">mail</span></a>' +
                    '<a href="#" title="View Information"><span class="ms ms-filled" style="font-size:18px;">person</span></a>' +
                    '<a href="#" title="Note"><span class="ms" style="font-size:18px;">add_notes</span></a>' +
                    '<a href="#" title=""><img src="https://susy.mdpi.com/build/img/icon/clock-frame.png?eb182c3" alt="Clock" style="height:18px;vertical-align:middle;"></a>' +
                    '<span style="margin-left:10px;"><a href="#" class="pending-comments-link">5 Ethics Issue(s) Waiting Comments</a></span>' +
                    ' (<a href="#" class="invitation-history-link">click here to see invitation history</a><span>).</span>' +
                    '<div class="academic-editor-actions">' +
                        '<span class="ae-invite-btn">Invite</span> or <span class="choose-editor-btn">Choose another editor</span> to make a comment' +
                    '</div>' +
                '</div>' +
            '</div>';
    },

    // 渲染 Add Comment 按钮 + content-sections 关闭
    renderContentFooter: function() {
        return '<div style="padding:10px 20px;">' +
            '<div style="text-align:right;"><button class="btn-primary" style="float:none;">Add Comment</button></div>' +
        '</div></div>';
    },

    // 渲染所有 Dialogs
    renderDialogs: function() {
        return '<div id="dialog-add-watcher" style="display:none;" title="Add Watcher">' +
            '<form><div style="margin-bottom:15px;"><label><span style="color:#dc3545;">*</span> Email</label>' +
            '<input type="text" id="watcher-email" placeholder="Add Watcher email" style="width:100%;padding:8px;border:1px solid #ced4da;border-radius:4px;margin-top:5px;"></div>' +
            '<button type="submit" class="btn-primary" style="float:none;">Add</button></form></div>' +
        '<div id="dialog-notes" style="display:none;" title="Ethics Issue Notes">' +
            '<p><strong>Note added by Admin User on 2026-01-22:</strong></p><p>Initial assessment completed. Case requires full investigation due to severity of allegations.</p>' +
            '<hr style="margin:15px 0;"><p><strong>Note added by Hongqiang Cui on 2026-01-25:</strong></p><p>Authors have been cooperative and provided requested documentation promptly.</p></div>' +
        '<div id="dialog-feeds" style="display:none;" title="Issue Feed">' +
            '<div style="max-height:400px;overflow-y:auto;">' +
                '<p><strong>2026-05-09 11:04:08</strong> - Hongqiang Cui updated Issue Status</p>' +
                '<p><strong>2026-05-09 11:04:08</strong> - Hongqiang Cui updated Ethics Type</p>' +
                '<p><strong>2026-05-09 11:04:08</strong> - Hongqiang Cui added comment</p>' +
                '<p><strong>2026-05-09 11:03:35</strong> - Hongqiang Cui created issue</p>' +
            '</div></div>' +
        '<div id="dialog-pending-comments" style="display:none;" title="Waiting Comment Ethics Issues">' +
            '<table class="pending-comments-table" style="width:100%;border-collapse:collapse;">' +
            '<thead><tr><th>Ethics Issues ID</th><th>Invited Date</th></tr></thead>' +
            '<tbody>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10085">Ethics Issue - 10085</a></td><td>2026-02-25 10:37:53</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10084">Ethics Issue - 10084</a></td><td>2026-03-10 14:22:15</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10083">Ethics Issue - 10083</a></td><td>2026-03-15 09:45:32</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10082">Ethics Issue - 10082</a></td><td>2026-04-05 16:18:47</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10081">Ethics Issue - 10081</a></td><td>2026-05-12 11:29:08</td></tr>' +
            '</tbody></table></div>' +
        '<div id="dialog-invitation-history" style="display:none;" title="Invitation History">' +
            '<table class="invitation-history-table" style="width:100%;border-collapse:collapse;">' +
            '<thead><tr><th>Ethics Issues ID</th><th>Status</th><th>Email Actions</th><th>Ethics Issues Status</th></tr></thead>' +
            '<tbody>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10088">Ethics Issue - 10088</a></td><td>Invited</td><td><div><strong>Invitation:</strong> Invited on 25 February 2026 10:37:53</div></td><td>In Progress</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10087">Ethics Issue - 10087</a></td><td>Comment Received</td><td><div><strong>Invitation:</strong> Invited on 10 January 2026 09:15:22</div></td><td>Closed</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10086">Ethics Issue - 10086</a></td><td>Uninvited</td><td><div><strong>Invitation:</strong> Invited on 5 December 2025 16:42:33</div><div><strong>Uninvited:</strong> Uninvited on 15 December 2025 09:30:00</div></td><td>New</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10085">Ethics Issue - 10085</a></td><td>Invited</td><td><div><strong>Invitation:</strong> Invited on 28 November 2025 13:20:18</div></td><td>In Progress</td></tr>' +
                '<tr><td><a href="#" title="View Ethics Issue - 10084">Ethics Issue - 10084</a></td><td>Comment Received</td><td><div><strong>Invitation:</strong> Invited on 15 October 2025 10:10:10</div></td><td>Closed</td></tr>' +
            '</tbody>' +
            '<tfoot><tr><td colspan="4" class="load-more-cell"><a href="#" class="load-more-link" title="Load more records"><i class="fa fa-refresh"></i> Load More</a></td></tr></tfoot>' +
            '</table></div>';
    },

    // 渲染 Editor Selection Dialog
    renderEditorDialog: function() {
        return '<div id="editor-dialog-app">' +
            '<el-dialog class="editor-dialog" title="Select Editor" :visible.sync="dialogVisible" width="1320px" top="5vh" :close-on-click-modal="false">' +
            '<div class="editor-table-wrapper">' +
            '<el-table :data="[filterRow].concat(pagedEditors)" border height="670" style="width:100%" :scroll-gutter="0" :show-header="true" :row-class-name="tableRowClassName">' +
                '<el-table-column prop="name" label="Name" width="110"><template slot-scope="scope"><div v-if="scope.$index===0"><el-input v-model="filters.name" size="mini" clearable></el-input></div><a v-else href="javascript:void(0);" class="editor-table-link" title="click here to see invitation history">{{ scope.row.name }}</a></template></el-table-column>' +
                '<el-table-column prop="email" label="Email" width="160"><template slot-scope="scope"><div v-if="scope.$index===0"><el-input v-model="filters.email" size="mini" clearable></el-input></div><div v-else>{{ scope.row.email }}</div></template></el-table-column>' +
                '<el-table-column prop="role" label="Role" width="200"><template slot-scope="scope"><div v-if="scope.$index===0"><el-select v-model="filters.role" size="mini" clearable placeholder="Select"><el-option label="Section Board Member" value="Section Board Member"></el-option><el-option label="Editorial Board Member" value="Editorial Board Member"></el-option><el-option label="Guest Editor" value="Guest Editor"></el-option><el-option label="Topic Associate Editor-in-Chief" value="Topic Associate Editor-in-Chief"></el-option></el-select></div><div v-else class="multi-line" v-html="scope.row.role"></div></template></el-table-column>' +
                '<el-table-column prop="section" label="Section" width="180"><template slot-scope="scope"><div v-if="scope.$index===0"><el-select v-model="filters.section" size="mini" clearable placeholder="Select"><el-option label="section1" value="section1"></el-option><el-option label="section2" value="section2"></el-option></el-select></div><div v-else class="multi-line" v-html="scope.row.section"></div></template></el-table-column>' +
                '<el-table-column prop="lastInviteDate" label="Last Invite Date" sortable width="150"><template slot-scope="scope"><div v-if="scope.$index===0"></div><div v-else>{{ scope.row.lastInviteDate }}</div></template></el-table-column>' +
                '<el-table-column prop="researchInterests" label="Research Interests" min-width="200"><template slot-scope="scope"><div v-if="scope.$index===0" style="display:flex;align-items:center;gap:4px;"><el-input v-model="filters.researchInterests" size="mini" clearable style="flex:1;"></el-input><el-checkbox v-model="researchExactMatch" size="mini">exact</el-checkbox><el-tooltip placement="top" effect="dark"><div slot="content" style="max-width:280px;line-height:1.6;"><div><strong>On:</strong> Returns results that contain any of the exact terms you typed.</div><div style="margin-top:6px;"><strong>Off:</strong> Prefix search — each term you enter matches anything starting with it.</div></div><span class="ms" style="font-size:18px;">info</span></el-tooltip></div><div v-else class="multi-line">{{ scope.row.researchInterests }}</div></template></el-table-column>' +
                '<el-table-column prop="absenceDate" label="Absence Date" width="110"><template slot-scope="scope"><div v-if="scope.$index===0"><el-input v-model="filters.absenceDate" size="mini" clearable></el-input></div><div v-else>{{ scope.row.absenceDate }}</div></template></el-table-column>' +
                '<el-table-column label="Action" width="110" align="center"><template slot-scope="scope"><div v-if="scope.$index===0"><a href="javascript:void(0);" @click="onClearFilters" class="editor-table-link">Clear All</a></div><div v-else><span class="editor-table-link" @click="onInvite(scope.row)" style="margin-right:8px;">Invite</span><el-tooltip content="Academic Editor Notes" placement="top"><a href="#" title="Copy"><span class="ms" style="font-size:18px;">add_notes</span></a></el-tooltip><el-tooltip content="Invitation History" placement="top"><img src="https://susy.mdpi.com/build/img/icon/notebooks.png?a5ce4b8" alt="History" style="width:16px;height:16px;margin-left:8px;cursor:pointer;vertical-align:middle;" /></el-tooltip></div></template></el-table-column>' +
            '</el-table></div>' +
            '<nav class="pagination_nav" aria-label="Pagination">' +
                '<ul class="pagination margin-0">' +
                    '<li :class="{disabled:currentPage===1}" @click="onPrev"><span v-if="currentPage===1">Prev </span><a v-else href="javascript:void(0);">Prev </a></li>' +
                    '<li v-for="item in pageList" :key="item.key" :class="item.className" @click="item.clickable && goToPage(item.page)"><span v-if="item.type===\'current\'">{{ item.page }}</span><span v-else-if="item.type===\'ellipsis\'">...</span><a v-else href="javascript:void(0);" :aria-label="\'Page \'+item.page">{{ item.page }}</a></li>' +
                    '<li :class="{disabled:currentPage===totalPages}" @click="onNext"><span v-if="currentPage===totalPages">Next </span><a v-else href="javascript:void(0);">Next </a></li>' +
                    '<li class="ui-paging-tool"><ul><li>Jump</li><li><input id="jump_page" type="text" v-model.number="jumpPage" size="2"></li><li><a class="pagination-jump" href="javascript:void(0);" @click="onJump">GO</a></li></ul></li>' +
                '</ul>' +
                '<div class="per-page-wrap"><span>View</span><select class="page-limit-select" v-model.number="pageSize" @change="onPageSizeChange"><option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option></select></div>' +
            '</nav></el-dialog></div>';
    },

    // 渲染 Dev Notes
    renderDevNotes: function() {
        return '<div class="ae-note collapsed" id="ae-note-3">' +
            '<div class="ae-note-header"><span class="ae-note-title">Note for prototype</span><span class="ae-note-toggle">+</span></div>' +
            '<div class="ae-note-body">' +
            '<p><strong>只新增了academic editor的部分，其余部分未做改动</strong></p>' +
            '<ul>' +
                '<li>当状态不为closed且没有AcE给出建议时，在页面comment的最下方显示academic editor comment部分（state1），样式可参考manuscript AcE decision部分</li>' +
                '<li>默认AcE的设定：与稿件最终decision为同一人，若absent或不再属于EBM或处于absent，顺延至期刊设定的默认EBM；若期刊默认EBM处于absent，顺延至EBM列表顺序第一人，以此类推。</li>' +
                '<li>X Ethics Issue(s) Comments 为尚未给出建议的（且未被uninvited）issues数量</li>' +
                '<li>invitation history 为所有参与ethics issues comment的记录；其中Status列值枚举为：Invited、Uninvited、Comment Received</li>' +
                '<li>一旦AcE给出建议了，就生成了一条comment记录。（state3）</li>' +
                '<li>展示AcE建议的内容，超出5行时要折叠并允许展开；始终显示签名和附件。</li>' +
                '<li>点击choose editor后，在comment最下方可重新显示待邀请的state1</li>' +
            '</ul></div></div>';
    },

    // 渲染底部 JS 引用
    renderScripts: function() {
        return '<script src="https://code.jquery.com/jquery-3.7.1.min.js"><\/script>' +
            '<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"><\/script>' +
            '<script src="https://unpkg.com/vue@2/dist/vue.js"><\/script>' +
            '<script src="https://unpkg.com/element-ui/lib/index.js"><\/script>' +
            '<script src="https://unpkg.com/element-ui/lib/umd/locale/en.js"><\/script>' +
            '<script src="ethics-issue-view.js"><\/script>' +
            '<script src="editor-dialog.js"><\/script>' +
            '<script src="nav.js"><\/script>';
    },

    // 初始化整个页面
    // stateNumber: 1, 2, 或 3
    initPage: function(stateNumber) {
        var headHtml = this.renderHead('Ethics Issue - State ' + stateNumber + ' - Prototype');
        document.head.innerHTML = headHtml;

        var stateRenderer;
        switch(stateNumber) {
            case 1: stateRenderer = this.renderState1(); break;
            case 2: stateRenderer = this.renderState2(); break;
            case 3: stateRenderer = this.renderState3(); break;
        }

        var bodyHtml = '<div id="maincol">' +
            this.renderManuscriptInfo() +
            this.renderEthicsIssue() +
            this.renderContentSections() +
            stateRenderer +
            (stateNumber === 3 ? this.renderState1Module() : '') +
            this.renderContentFooter() +
            this.renderDialogs() +
        '</div>' +
        this.renderEditorDialog() +
        this.renderDevNotes();

        document.body.innerHTML = bodyHtml;
    }
};
