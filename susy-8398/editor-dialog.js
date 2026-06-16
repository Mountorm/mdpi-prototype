// Editor Selection Dialog - Vue 2 Instance
ELEMENT.locale(ELEMENT.lang.en);

// Generate fake editor data (200 records)
var baseEditors = [
    {
        name: 'Ariando',
        email: 'phyarian@nus.edu.sg',
        role: 'Editor-in-Chief<br>Section Board Member',
        section: 'section1',
        lastInviteDate: '4 Mar 2024',
        researchInterests: 'strongly correlated electron systems; complex oxide thin films; interfaces; heterostructures and superlattices; superconductivity; condensed matter physics',
        absenceDate: ''
    },
    {
        name: 'Abdeltif Amrane',
        email: 'abdeltif.amrane@univ-rennes1.fr',
        role: 'Associate Editor<br>Editorial Board Member<br>Guest Editor',
        section: 'section2',
        lastInviteDate: '30 Nov 2023',
        researchInterests: 'environmental engineering; combined processes; biological treatment; advanced (electrochemical) oxidation processes',
        absenceDate: ''
    },
    {
        name: 'Abílio Manuel Pinho de Jesus',
        email: 'ajesus@fe.up.pt',
        role: 'Topic Editor-in-Chief<br>Topic Associate Editor-in-Chief<br>Topic Editor',
        section: 'section1',
        lastInviteDate: '18 Oct 2022',
        researchInterests: 'manufacturing processes; machining; additive manufacturing; fatigue; fracture; structural integrity; numerical simulation; experimental validation',
        absenceDate: ''
    },
    {
        name: 'Adel Razek',
        email: 'adel.razek@centralesupelec.fr',
        role: 'Co-Editor-in-Chief<br>Section Associate Editor',
        section: 'section2',
        lastInviteDate: '12 Oct 2022',
        researchInterests: 'computational electromagnetics; coupled multi-physics modeling; design of electromagnetic systems; exposure assessment in electric vehicle; electromagnetic compatibility; nondestructive testing; smart material actuation; robotics; biomedicine',
        absenceDate: ''
    }
];

var fakeEditors = [];
for (var i = 0; i < 200; i++) {
    var base = baseEditors[i % baseEditors.length];
    fakeEditors.push({
        name: base.name + ' #' + (i + 1),
        email: base.email.replace('@', '+' + (i + 1) + '@'),
        role: base.role,
        section: (i % 2 === 0) ? 'section1' : 'section2',
        lastInviteDate: base.lastInviteDate,
        researchInterests: base.researchInterests,
        absenceDate: base.absenceDate
    });
}

var editorDialogApp = new Vue({
    el: '#editor-dialog-app',
    data: function() {
        return {
            dialogVisible: false,
            filters: {
                name: '',
                email: '',
                role: '',
                section: '',
                lastInviteDate: '',
                researchInterests: '',
                absenceDate: ''
            },
            filterRow: {
                name: '',
                email: '',
                role: '',
                section: '',
                lastInviteDate: '',
                researchInterests: '',
                absenceDate: ''
            },
            researchExactMatch: false,
            editors: fakeEditors,
            currentPage: 1,
            pageSize: 50,
            pageSizeOptions: [50, 100, 200, 500],
            jumpPage: 1
        };
    },
    computed: {
        filteredEditors: function() {
            var self = this;
            return this.editors.filter(function(item) {
                var nameMatch = self.filters.name === '' || item.name.toLowerCase().indexOf(self.filters.name.toLowerCase()) !== -1;
                var emailMatch = self.filters.email === '' || item.email.toLowerCase().indexOf(self.filters.email.toLowerCase()) !== -1;
                var roleMatch = self.filters.role === '' || item.role.toLowerCase().indexOf(self.filters.role.toLowerCase()) !== -1;
                var sectionMatch = self.filters.section === '' || (item.section && item.section.toLowerCase().indexOf(self.filters.section.toLowerCase()) !== -1);
                var researchMatch = (function() {
                    var q = self.filters.researchInterests.trim();
                    if (q === '') return true;
                    var text = item.researchInterests.toLowerCase();
                    var words = q.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 0; });
                    if (words.length === 0) return true;
                    if (self.researchExactMatch) {
                        return words.some(function(w) {
                            return self.matchWholeWord(text, w);
                        });
                    } else {
                        var exactPart = words.slice(0, words.length - 1).join(' ');
                        var lastPart = words[words.length - 1];
                        var phrase = exactPart.length > 0 ? exactPart + ' ' + lastPart : lastPart;
                        var escaped = self.escapeRe(phrase);
                        var re = new RegExp('(?:^|[\\s;,])' + escaped);
                        return re.test(text);
                    }
                })();
                var absenceMatch = self.filters.absenceDate === '' || item.absenceDate.toLowerCase().indexOf(self.filters.absenceDate.toLowerCase()) !== -1;
                return nameMatch && emailMatch && roleMatch && sectionMatch && researchMatch && absenceMatch;
            });
        },
        filteredTotal: function() {
            return this.filteredEditors.length;
        },
        totalPages: function() {
            if (this.pageSize === 'all') return 1;
            if (this.pageSize <= 0) return 1;
            var pages = Math.ceil(this.filteredTotal / this.pageSize);
            return pages > 0 ? pages : 1;
        },
        pagedEditors: function() {
            if (this.pageSize === 'all') {
                return this.filteredEditors;
            }
            var start = (this.currentPage - 1) * this.pageSize;
            var end = start + this.pageSize;
            return this.filteredEditors.slice(start, end);
        },
        pageList: function() {
            var pages = this.totalPages;
            var current = this.currentPage;
            var list = [];

            function addPage(page, type) {
                list.push({
                    key: 'p-' + page + '-' + type,
                    type: type,
                    page: page,
                    className: type === 'current' ? 'current' : '',
                    clickable: type === 'page'
                });
            }

            function addEllipsis(key) {
                list.push({
                    key: 'e-' + key,
                    type: 'ellipsis',
                    page: null,
                    className: 'ellipsis',
                    clickable: false
                });
            }

            if (pages <= 7) {
                for (var i = 1; i <= pages; i++) {
                    addPage(i, i === current ? 'current' : 'page');
                }
                return list;
            }

            if (current <= 4) {
                for (var j = 1; j <= 6; j++) {
                    addPage(j, j === current ? 'current' : 'page');
                }
                addEllipsis('right');
                addPage(pages, 'page');
            } else if (current >= pages - 3) {
                addPage(1, 'page');
                addEllipsis('left');
                for (var k = pages - 5; k <= pages; k++) {
                    addPage(k, k === current ? 'current' : 'page');
                }
            } else {
                addPage(1, 'page');
                addEllipsis('left');
                for (var m = current - 1; m <= current + 1; m++) {
                    addPage(m, m === current ? 'current' : 'page');
                }
                addEllipsis('right');
                addPage(pages, 'page');
            }

            return list;
        }
    },
    methods: {
        tableRowClassName: function(row) {
            if (row.rowIndex === 0) return 'filter-row';
            if (row.rowIndex > 0 && row.rowIndex % 2 === 0) return 'data-row-odd';
            return '';
        },
        onPrev: function() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.jumpPage = this.currentPage;
            }
        },
        onNext: function() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.jumpPage = this.currentPage;
            }
        },
        goToPage: function(page) {
            if (!page) return;
            if (page < 1) page = 1;
            if (page > this.totalPages) page = this.totalPages;
            this.currentPage = page;
            this.jumpPage = page;
        },
        onJump: function() {
            var page = parseInt(this.jumpPage, 10);
            if (isNaN(page)) {
                this.jumpPage = this.currentPage;
                return;
            }
            this.goToPage(page);
        },
        onPageSizeChange: function() {
            if (!this.pageSize || this.pageSize <= 0) {
                this.pageSize = 50;
            }
            this.currentPage = 1;
            this.jumpPage = 1;
        },
        onClearFilters: function() {
            this.filters = {
                name: '',
                email: '',
                role: '',
                section: '',
                lastInviteDate: '',
                researchInterests: '',
                absenceDate: ''
            };
            this.researchExactMatch = false;
            this.currentPage = 1;
            this.jumpPage = 1;
        },
        escapeRe: function(s) {
            var result = '';
            for (var i = 0; i < s.length; i++) {
                var c = s[i];
                if ('[\\^$.|?*+(){}'.indexOf(c) !== -1) {
                    result += '\\' + c;
                } else {
                    result += c;
                }
            }
            return result;
        },
        matchWholeWord: function(text, word) {
            var escaped = this.escapeRe(word);
            var re = new RegExp('(?:^|[\\s;,])' + escaped + '(?=[\\s;,]|$)');
            return re.test(text);
        },
        onInvite: function(row) {
            // Update the state1 module's editor name
            if (window.updateAcE) {
                window.updateAcE(row.name);
            }
            this.$message({
                message: 'Invited: ' + row.name,
                type: 'success'
            });
            this.dialogVisible = false;
        },
        openInvitationHistory: function() {
            $('#dialog-invitation-history').dialog('open');
        }
    }
});

// Wire up "Choose another editor" click (使用 class 选择器，支持多个按钮)
$(document).on('click', '.choose-editor-btn', function() {
    editorDialogApp.dialogVisible = true;
});
