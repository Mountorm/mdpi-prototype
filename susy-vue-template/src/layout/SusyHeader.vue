<script setup>
import GlobalSearch from '@/components/GlobalSearch.vue'

const mockUser = 'susygoodgood@mdpi.com'

const journals = [
  { name: 'Active Journals', url: 'https://www.mdpi.com/about/journals' },
  { name: 'Journal Finder', url: 'https://www.mdpi.com/about/journalfinder' },
  { name: 'Proceedings Series', url: 'https://www.mdpi.com/about/proceedings' },
  { name: 'Propose a Journal', url: 'https://www.mdpi.com/about/journals/proposal' },
  { name: 'Transferred & Acquired Journals', url: 'https://www.mdpi.com/about/journals-transferred' },
  { name: 'Discontinued Titles', url: 'https://www.mdpi.com/about/journals-discontinued' },
]

const information = [
  {
    title: 'General Content',
    items: [
      { name: 'Open Access Policy', url: 'https://www.mdpi.com/openaccess' },
      { name: 'Editorial Process', url: 'https://www.mdpi.com/editorial_process' },
      { name: 'Publication Ethics', url: 'https://www.mdpi.com/ethics' },
      { name: 'Special Issues Guidelines', url: 'https://www.mdpi.com/special_issues_guidelines' },
      { name: 'Article Processing Charge', url: 'https://www.mdpi.com/apc' },
    ],
  },
  {
    title: 'Guidelines',
    items: [
      { name: 'For Authors', url: 'https://www.mdpi.com/authors' },
      { name: 'For Reviewers', url: 'https://www.mdpi.com/reviewers' },
      { name: 'For Editors', url: 'https://www.mdpi.com/editors' },
      { name: 'For Librarians', url: 'https://www.mdpi.com/librarians' },
    ],
  },
  {
    title: 'Partnerships',
    items: [
      { name: 'Institutional Open Access Program', url: 'https://www.mdpi.com/ioap' },
      { name: 'Societies', url: 'https://www.mdpi.com/societies' },
      { name: 'Conferences', url: 'https://www.mdpi.com/partnerships/conferences' },
      { name: 'Publishing Services', url: 'https://www.mdpi.com/publishing_services' },
    ],
  },
]

const about = [
  {
    title: 'Company',
    items: [
      { name: 'About Us', url: 'https://www.mdpi.com/about' },
      { name: 'Mission', url: 'https://www.mdpi.com/about/mission' },
      { name: 'Impact', url: 'https://www.mdpi.com/about/impact' },
      { name: 'History', url: 'https://www.mdpi.com/about/history' },
      { name: 'Leadership', url: 'https://www.mdpi.com/about/leadership' },
    ],
  },
  // 与真实顶栏一致：Company 条目分成两列，第二列没有标题
  {
    title: '\u00A0',
    items: [
      { name: 'Office Locations', url: 'https://www.mdpi.com/about/office-locations' },
      { name: 'Careers', url: 'https://www.mdpi.com/about/careers' },
      { name: 'Awards', url: 'https://www.mdpi.com/awards' },
      { name: 'Products', url: 'https://www.mdpi.com/about/products-solutions' },
      { name: 'Accessibility', url: 'https://www.mdpi.com/accessibility' },
    ],
  },
  {
    title: 'Media',
    items: [
      { name: 'News', url: 'https://www.mdpi.com/news' },
      { name: 'Blog', url: 'https://www.mdpi.com/blog' },
      { name: 'Press', url: 'https://www.mdpi.com/about/press' },
    ],
  },
  {
    title: 'Contact',
    items: [
      { name: 'Support', url: 'https://www.mdpi.com/support' },
      { name: 'Send Feedback', url: 'https://www.mdpi.com/support/feedback' },
    ],
  },
]

const accountMenu = [
  { name: 'Dashboard', url: '#' },
  { name: 'Manage Accounts', url: '#' },
  { name: 'Change Password', url: '#' },
  { name: 'Profile', url: '#' },
  { name: 'Logout', url: '#' },
]
</script>

<template>
  <header>
    <div id="topmenu" class="show-for-large">
      <ul class="!tw-flex">
        <li class="susy-logo">
          <router-link to="/" title="MDPI SuSy - Home Page">
            <img src="/build/img/SUSY_logo.svg" class="top-menu-susy-logo" alt="MDPI SuSy - Home Page" />
          </router-link>
        </li>

        <li class="drop-down topmenu-tab">
          <a href="javascript:void(0);" aria-haspopup="true" aria-expanded="false">
            Journals <i class="ms ms-keyboard-arrow-down"></i>
          </a>
          <div class="drop-down-wrapper journals-dropdown">
            <div class="cell small-12">
              <ul>
                <li v-for="item in journals" :key="item.name">
                  <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </li>

        <li class="topmenu-tab">
          <a href="https://www.mdpi.com/topics" target="_blank" rel="noopener noreferrer">Topics</a>
        </li>
        <li>
          <a href="https://www.mdpi.com/authors/english" target="_blank" rel="noopener noreferrer" class="topmenu-tab">
            Author Services
          </a>
        </li>

        <li class="drop-down topmenu-tab topmenu-tab-list">
          <a href="javascript:void(0);" aria-haspopup="true" aria-expanded="false">
            Information <i class="ms ms-keyboard-arrow-down"></i>
          </a>
          <div class="drop-down-wrapper grid-x information-dropdown">
            <div
              v-for="(group, index) in information"
              :key="group.title"
              class="cell small-4"
              :class="{ 'border-left-1': index > 0 }"
            >
              <div class="dropdown-title">{{ group.title }}</div>
              <ul>
                <li v-for="item in group.items" :key="item.name">
                  <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
                </li>
              </ul>
            </div>
            <div class="clear"></div>
          </div>
        </li>

        <li class="drop-down topmenu-tab topmenu-tab-list">
          <a href="javascript:void(0);" aria-haspopup="true" aria-expanded="false">
            About <i class="ms ms-keyboard-arrow-down"></i>
          </a>
          <div class="drop-down-wrapper grid-x about-dropdown">
            <div
              v-for="(group, index) in about"
              :key="group.title"
              class="cell small-3"
              :class="{ 'border-left-1': index >= 2 }"
            >
              <div class="dropdown-title">{{ group.title }}</div>
              <ul>
                <li v-for="item in group.items" :key="item.name">
                  <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </li>

        <li class="tw-flex-1 !tw-flex tw-items-center tw-justify-end">
          <div class="susy-global-search-li">
            <GlobalSearch />
          </div>
          <a href="javascript:void(0);" class="show-submit-dialog" role="button">
            <i class="ms ms-add"></i> Start Submission
          </a>
          <div class="user-profile"></div>
          <div class="drop-down" id="account-user-dropdown" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" aria-label="User menu">
            <span class="user-email" id="account-user-email" :title="mockUser">{{ mockUser }}</span>
            <i class="ms ms-keyboard-arrow-down"></i>
            <div class="drop-down-wrapper">
              <ul>
                <li v-for="item in accountMenu" :key="item.name">
                  <a :href="item.url">{{ item.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </header>
</template>
