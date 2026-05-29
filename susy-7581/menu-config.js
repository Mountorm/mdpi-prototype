// SuSy Configuration
const MENU_CONFIG = {
    // Navigation links
    navigation: [
        { text: 'Journals', href: 'https://deployment.susy-mdpi.mdpi.dev/about/journals/', target: '_blank' },
        { text: 'Topics', href: 'https://deployment.susy-mdpi.mdpi.dev/topics', target: '_blank' },
        { 
            text: 'Information', 
            href: 'https://deployment.susy-mdpi.mdpi.dev/guidelines',
            target: '_blank',
            hasDropdown: true,
            dropdownType: 'grid',
            dropdownItems: [
                {
                    title: 'Information',
                    items: [
                        { text: 'For Authors', href: 'https://deployment.susy-mdpi.mdpi.dev/authors', target: '_blank' },
                        { text: 'For Reviewers', href: 'https://deployment.susy-mdpi.mdpi.dev/reviewers', target: '_blank' },
                        { text: 'For Editors', href: 'https://deployment.susy-mdpi.mdpi.dev/editors', target: '_blank' },
                        { text: 'For Librarians', href: 'https://deployment.susy-mdpi.mdpi.dev/librarians', target: '_blank' },
                        { text: 'For Publishers', href: 'https://deployment.susy-mdpi.mdpi.dev/publishing_service', target: '_blank' },
                        { text: 'For Societies', href: 'https://deployment.susy-mdpi.mdpi.dev/societies', target: '_blank' },
                        { text: 'For Conference Organizers', href: 'https://deployment.susy-mdpi.mdpi.dev/conference_organizers', target: '_blank' }
                    ]
                },
                {
                    title: 'Contents',
                    items: [
                        { text: 'Article Processing Charges', href: 'https://deployment.susy-mdpi.mdpi.dev/about/apc', target: '_blank' },
                        { text: 'Open Access Policy', href: 'https://deployment.susy-mdpi.mdpi.dev/about/openaccess', target: '_blank' },
                        { text: 'Institutional Open Access Program', href: 'https://deployment.susy-mdpi.mdpi.dev/about/memberships', target: '_blank' },
                        { text: 'Special Issues Guidelines', href: 'https://deployment.susy-mdpi.mdpi.dev/special_issues_guidelines', target: '_blank' },
                        { text: 'Editorial Process', href: 'https://deployment.susy-mdpi.mdpi.dev/editorial_process', target: '_blank' },
                        { text: 'Awards', href: 'https://deployment.susy-mdpi.mdpi.dev/awards', target: '_blank' },
                        { text: 'Research and Publication Ethics', href: 'https://deployment.susy-mdpi.mdpi.dev/ethics', target: '_blank' }
                    ]
                }
            ]
        },
        { text: 'Author Services', href: 'https://deployment.susy-mdpi.mdpi.dev/authors/english', target: '_blank' },
        { 
            text: 'Initiatives', 
            href: 'javascript:void(0);',
            hasDropdown: true,
            dropdownItems: [
                { text: 'Sciforum', href: 'https://dev.sciforum.mdpi.dev', target: '_blank' },
                { text: 'MDPI Books', href: 'https://deployment.susy-mdpi.mdpi.dev/books', target: '_blank' },
                { text: 'Preprints.org', href: 'https://zhou.sciprints.mdpi.dev', target: '_blank' },
                { text: 'Scilit', href: 'https://www.scilit.com', target: '_blank' },
                { text: 'SciProfiles', href: 'https://develop.sciprofile.mdpi.dev', target: '_blank' },
                { text: 'Encyclopedia', href: 'https://dev.encyclopedia.mdpi.dev', target: '_blank' },
                { text: 'JAMS', href: 'https://jams.pub', target: '_blank' },
                { text: 'Proceedings Series', href: 'https://deployment.susy-mdpi.mdpi.dev/about/proceedings', target: '_blank' }
            ]
        },
        { 
            text: 'About', 
            href: 'https://deployment.susy-mdpi.mdpi.dev/about',
            target: '_blank',
            hasDropdown: true,
            dropdownItems: [
                { text: 'Overview', href: 'https://deployment.susy-mdpi.mdpi.dev/about', target: '_blank' },
                { text: 'Contact', href: 'https://deployment.susy-mdpi.mdpi.dev/about/contact', target: '_blank' },
                { text: 'Careers', href: 'https://careers.mdpi.com', target: '_blank' }
            ]
        }
    ],

    // Asset URLs
    assets: {
        logo: 'https://deployment.susy.mdpi.dev/build/img/icon/SUSY_logo.svg?56d587c',
    },

    // User information
    user: {
        email: 'hongqiang.cui@mdpi.com',
        notificationCount: '44'
    }
};

function getMenuConfig() { return MENU_CONFIG; }
function getNavigationLinks() { return MENU_CONFIG.navigation; }
function getAssets() { return MENU_CONFIG.assets; }
function getUserInfo() { return MENU_CONFIG.user; }
