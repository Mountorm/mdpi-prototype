<template>
  <div class="da-layout">
    <!-- 顶部信息栏 -->
    <div class="da-header">
      <div class="da-header__left">
        <span class="da-page-title">Detection Assistant</span>
        <span class="da-ms-id">nutrients-4224751</span>
      </div>
      <div class="da-header__actions">
        <div class="da-toggle">
          <el-switch v-model="showOnlyIssues" size="small" />
          <span>Only issues</span>
        </div>
        <el-button type="primary" class="susy-btn" size="small" :loading="loading" @click="handleRedetectAll">
          Re-detect All
        </el-button>
      </div>
    </div>

    <!-- 统计概览条 -->
    <div class="da-stats-bar">
      <div class="da-stat da-stat--error">
        <XCircle class="da-stat__icon" />
        <span class="da-stat__num">{{ overallStats.error }}</span>
        <span class="da-stat__label">Severe</span>
      </div>
      <div class="da-stat da-stat--warning">
        <AlertTriangle class="da-stat__icon" />
        <span class="da-stat__num">{{ overallStats.warning }}</span>
        <span class="da-stat__label">Warning</span>
      </div>
      <div class="da-stat da-stat--success">
        <CheckCircle class="da-stat__icon" />
        <span class="da-stat__num">{{ overallStats.healthy }}</span>
        <span class="da-stat__label">Passed</span>
      </div>
      <div class="da-stat da-stat--confirmed">
        <UserCheck class="da-stat__icon" />
        <span class="da-stat__num">{{ overallStats.confirmed }}</span>
        <span class="da-stat__label">Resolved</span>
      </div>
      <div class="da-progress-wrap">
        <div class="da-progress-bar">
          <div class="da-progress-seg da-progress-seg--error" :style="{ width: pct(overallStats.error) }" />
          <div class="da-progress-seg da-progress-seg--warning" :style="{ width: pct(overallStats.warning) }" />
          <div class="da-progress-seg da-progress-seg--success" :style="{ width: pct(overallStats.healthy) }" />
          <div class="da-progress-seg da-progress-seg--confirmed" :style="{ width: pct(overallStats.confirmed) }" />
        </div>
      </div>
    </div>

    <!-- 主体：内容 + 右侧导航 -->
    <div class="da-body">
      <!-- 检测内容 -->
      <div class="da-content">
        <div v-if="loading" class="da-loading">
          <div class="da-spinner" />
          <p>Running detection analysis...</p>
        </div>

        <template v-else>
          <div
            v-for="section in sections"
            :key="section.id"
            :id="'section-' + section.id"
            class="da-section"
          >
            <!-- Section 标题行 -->
            <div class="da-section__head">
              <div class="da-section__meta">
                <span class="da-section__name">{{ section.title }}</span>
                <span v-if="section.description" class="da-section__desc">{{ section.description }}</span>
              </div>
              <el-button text size="small" :loading="sectionLoading === section.id" @click="handleRedetectSection(section.id)">
                <template #icon><RefreshCcw class="h-3.5 w-3.5" /></template>
                Re-detect
              </el-button>
            </div>

            <!-- 检测项列表 -->
            <div v-if="sectionLoading === section.id" class="da-section__loading">
              <Loader2 class="h-4 w-4 animate-spin" />
            </div>
            <div v-else class="da-items">
              <template v-for="item in getFilteredItems(section.items)" :key="item.id">
                <!-- Ethicality / Ethicality Plan B item：可折叠，无状态图标 -->
                <div v-if="item.ethicality || item.ethicalityB" class="da-item da-item--eth">
                  <div class="da-item__body">
                    <!-- 文件名行：点击折叠/展开 -->
                    <div class="da-eth-file__head" @click="toggleEthItem(item.id)">
                      <div class="da-eth-file__left">
                        <ChevronDown v-if="!ethExpandedItems[item.id]" class="da-eth-file__chevron" />
                        <ChevronUp v-else class="da-eth-file__chevron" />
                        <span class="da-eth-file__name">{{ item.title }}</span>
                        <template v-if="getEthStats(item).severe || getEthStats(item).warning">
                          <span v-if="getEthStats(item).severe" class="da-eth__tag da-eth__tag--error">{{ getEthStats(item).severe }} </span>
                          <span v-if="getEthStats(item).warning" class="da-eth__tag da-eth__tag--warning">{{ getEthStats(item).warning }} </span>
                        </template>
                        <span v-else class="da-eth__ok">No issues</span>
                      </div>
                      <div class="da-item__actions" @click.stop>
                        <button class="da-view-report-btn" @click="handleViewReport(item)">
                          <FileText class="h-3.5 w-3.5" />
                          View Report
                        </button>
                        <el-button size="small" plain @click="handleDownload(item)">
                          <template #icon><Download class="h-3.5 w-3.5" /></template>
                          Download
                        </el-button>
                        <el-popover
                          :ref="el => setPopoverRef(item.id, el)"
                          placement="bottom-end"
                          :width="340"
                          trigger="click"
                          popper-class="da-confirm-pop"
                          @show="onPopoverShow(item.id)"
                        >
                          <template #reference>
                            <button :class="['da-confirm-btn', item.confirmed ? 'da-confirm-btn--done' : '']">
                              <UserCheck v-if="item.confirmed" class="h-3.5 w-3.5" />
                              <span>{{ item.confirmed ? 'Resolved' : 'Resolve' }}</span>
                            </button>
                          </template>
                          <div class="da-cpop">
                            <div class="da-cpop__head">
                              <span class="da-cpop__title">Resolve this check</span>
                              <button class="da-cpop__close" @click="closePopover(item.id)">✕</button>
                            </div>
                            <p class="da-cpop__hint">Select a reason:</p>
                            <div class="da-cpop__options">
                              <label v-for="option in resolveOptions" :key="option"
                                :class="['da-cpop__option', { 'da-cpop__option--selected': popoverSelections[item.id] === option }]"
                                @click="popoverSelections[item.id] = option">
                                <span class="da-cpop__radio" :class="{ 'da-cpop__radio--checked': popoverSelections[item.id] === option }" />
                                <span class="da-cpop__option-text">{{ option }}</span>
                              </label>
                            </div>
                            <div class="da-cpop__footer">
                              <button class="da-cpop__cancel" @click="closePopover(item.id)">Cancel</button>
                              <button :class="['da-cpop__submit', { 'da-cpop__submit--disabled': !popoverSelections[item.id] }]"
                                :disabled="!popoverSelections[item.id]"
                                @click="commitConfirmInline(section.id, item.id)">Resolve</button>
                            </div>
                          </div>
                        </el-popover>
                      </div>
                    </div>

                    <!-- 折叠内容 Plan A -->
                    <div v-if="item.ethicality && ethExpandedItems[item.id]" class="da-eth">
                      <!-- Authors -->
                      <div class="da-eth__row">
                        <span class="da-eth__label">Authors</span>
                        <template v-if="item.ethicality.issues_summary.authors.warning_count === 0 && item.ethicality.issues_summary.authors.severe_warning_count === 0">
                          <span class="da-eth__ok">No issues</span>
                        </template>
                        <template v-else>
                          <span v-if="item.ethicality.issues_summary.authors.severe_warning_count" class="da-eth__tag da-eth__tag--error">{{ item.ethicality.issues_summary.authors.severe_warning_count }} </span>
                          <span v-if="item.ethicality.issues_summary.authors.warning_count" class="da-eth__tag da-eth__tag--warning">{{ item.ethicality.issues_summary.authors.warning_count }} </span>
                        </template>
                      </div>
                      <!-- References -->
                      <div class="da-eth__row">
                        <span class="da-eth__label">References</span>
                        <template v-if="item.ethicality.issues_summary.references.warning_count === 0 && item.ethicality.issues_summary.references.severe_warning_count === 0">
                          <span class="da-eth__ok">No issues</span>
                        </template>
                        <template v-else>
                          <span v-if="item.ethicality.issues_summary.references.severe_warning_count" class="da-eth__tag da-eth__tag--error">{{ item.ethicality.issues_summary.references.severe_warning_count }} </span>
                          <span v-if="item.ethicality.issues_summary.references.warning_count" class="da-eth__tag da-eth__tag--warning">{{ item.ethicality.issues_summary.references.warning_count }} </span>
                          <span class="da-eth__label">这里可以展开具体的有问题的reference（待确定）</span>
                        </template>
                      </div>
                      <div v-if="isDetailsOpen(item.id + '-refs') && item.ethicality.references_html" class="da-html da-eth__html" v-html="item.ethicality.references_html" />
                      <!-- AI Writing + Peer Review Reports -->
                      <div class="da-eth__row da-eth__row--ai">
                        <span class="da-eth__label">AI Writing</span>
                        <div class="da-eth__ai-table">
                          <div class="da-eth__ai-row">
                            <span class="da-eth__ai-row-label">Manuscript</span>
                            <div class="da-eth__ai-bar">
                              <div class="da-eth__ai-seg da-eth__ai-seg--human" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.human_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--maybe" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.maybe_ai_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--likely" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.likely_ai_proportion) }" />
                            </div>
                            <div class="da-eth__ai-nums">
                              <span class="da-eth__ai-num da-eth__ai-num--human">{{ pct100(item.ethicality.issues_summary.ai_writing.human_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--maybe">{{ pct100(item.ethicality.issues_summary.ai_writing.maybe_ai_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--likely">{{ pct100(item.ethicality.issues_summary.ai_writing.likely_ai_proportion) }}</span>
                            </div>
                          </div>
                          <div v-for="(rpt, ri) in item.ethicality.issues_summary.peer_review_reports" :key="ri" class="da-eth__ai-row">
                            <span class="da-eth__ai-row-label">Report {{ ri + 1 }}</span>
                            <div class="da-eth__ai-bar">
                              <div class="da-eth__ai-seg da-eth__ai-seg--human" :style="{ width: pct100(rpt.human_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--maybe" :style="{ width: pct100(rpt.maybe_ai_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--likely" :style="{ width: pct100(rpt.likely_ai_proportion) }" />
                            </div>
                            <div class="da-eth__ai-nums">
                              <span class="da-eth__ai-num da-eth__ai-num--human">{{ pct100(rpt.human_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--maybe">{{ pct100(rpt.maybe_ai_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--likely">{{ pct100(rpt.likely_ai_proportion) }}</span>
                            </div>
                          </div>
                          <div class="da-eth__ai-legend-row">
                            <span class="da-eth__ai-dot da-eth__ai-dot--human" />Low
                            <span class="da-eth__ai-dot da-eth__ai-dot--maybe" />Medium
                            <span class="da-eth__ai-dot da-eth__ai-dot--likely" />High
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 折叠内容 Plan B -->
                    <div v-if="item.ethicalityB && ethExpandedItems[item.id]" class="da-eth">
                      <!-- Authors -->
                      <div class="da-eth__row da-eth__row--col">
                        <div class="da-eth__label-row">
                          <span class="da-eth__label">Authors</span>
                          <template v-if="!item.ethicalityB.authors.length">
                            <span class="da-eth__ok">No issues</span>
                          </template>
                          <template v-else>
                            <span v-if="item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level==='severe').length,0)" class="da-eth__tag da-eth__tag--error">{{ item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level==='severe').length,0) }}</span>
                            <span v-if="item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level!=='severe').length,0)" class="da-eth__tag da-eth__tag--warning">{{ item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level!=='severe').length,0) }}</span>
                          </template>
                        </div>
                        <template v-if="item.ethicalityB.authors.length">
                          <button class="da-rb__details-toggle da-eth__sub-toggle" @click="toggleDetails(item.id + '-authors-all')">
                            <ChevronUp v-if="isDetailsOpen(item.id + '-authors-all')" class="h-3.5 w-3.5" />
                            <ChevronDown v-else class="h-3.5 w-3.5" />
                            {{ isDetailsOpen(item.id + '-authors-all') ? 'Hide' : 'Show' }} Details
                          </button>
                          <div v-if="isDetailsOpen(item.id + '-authors-all')" class="da-ethb__list da-eth__sub-content">
                            <div v-for="(author, ai) in item.ethicalityB.authors" :key="ai" class="da-ethb__author-block">
                              <div class="da-ethb__author-name">
                                {{ author.name }}
                                <span v-if="author.email" class="da-ethb__author-email">&lt;{{ author.email }}&gt;</span>
                              </div>
                              <ul class="da-ethb__issue-list">
                                <li v-for="(issue, ii) in author.issues" :key="ii" class="da-ethb__issue-item">
                                  <span :class="['da-eth__tag', issue.level === 'severe' ? 'da-eth__tag--error' : 'da-eth__tag--warning']">Issue Name</span>
                                  <span class="da-ethb__issue-text">{{ issue.text }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </template>
                      </div>

                      <!-- References -->
                      <div class="da-eth__row da-eth__row--col">
                        <div class="da-eth__label-row">
                          <span class="da-eth__label">References</span>
                          <template v-if="!item.ethicalityB.references.length">
                            <span class="da-eth__ok">No issues</span>
                          </template>
                          <template v-else>
                            <span v-if="item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level==='severe').length" class="da-eth__tag da-eth__tag--error">{{ item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level==='severe').length }}</span>
                            <span v-if="item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level!=='severe').length" class="da-eth__tag da-eth__tag--warning">{{ item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level!=='severe').length }}</span>
                          </template>
                        </div>
                        <template v-if="item.ethicalityB.references.length">
                          <button class="da-rb__details-toggle da-eth__sub-toggle" @click="toggleDetails(item.id + '-refs-all')">
                            <ChevronUp v-if="isDetailsOpen(item.id + '-refs-all')" class="h-3.5 w-3.5" />
                            <ChevronDown v-else class="h-3.5 w-3.5" />
                            {{ isDetailsOpen(item.id + '-refs-all') ? 'Hide' : 'Show' }} Details
                          </button>
                          <div v-if="isDetailsOpen(item.id + '-refs-all')" class="da-ethb__list da-eth__sub-content">
                            <div v-for="(ref, ri) in item.ethicalityB.references" :key="ri" class="da-ethb__ref-block">
                              <div class="da-ethb__ref-title">
                                <span class="da-ethb__ref-index">{{ ref.index }}</span>
                                <span class="da-ethb__ref-text">{{ ref.title }}</span>
                              </div>
                              <div class="da-ethb__ref-tags">
                                <span v-for="(p, pi) in ref.problems" :key="pi" :class="['da-eth__tag', p.level === 'severe' ? 'da-eth__tag--error' : 'da-eth__tag--warning']">{{ p.text }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>

                      <!-- AI Writing -->
                      <div class="da-eth__row da-eth__row--col">
                        <div class="da-eth__label-row">
                          <span class="da-eth__label">AI Writing</span>
                          <template v-if="item.ethicalityB.ai_writing.manuscript_score < 20 && item.ethicalityB.ai_writing.peer_review_reports.every(r=>r.score < 20)">
                            <span class="da-eth__ok">No issues</span>
                          </template>
                          <template v-else>
                            <span v-if="[item.ethicalityB.ai_writing.manuscript_score, ...item.ethicalityB.ai_writing.peer_review_reports.map(r=>r.score)].filter(s=>s>=40).length" class="da-eth__tag da-eth__tag--error">{{ [item.ethicalityB.ai_writing.manuscript_score, ...item.ethicalityB.ai_writing.peer_review_reports.map(r=>r.score)].filter(s=>s>=40).length }}</span>
                            <span v-if="[item.ethicalityB.ai_writing.manuscript_score, ...item.ethicalityB.ai_writing.peer_review_reports.map(r=>r.score)].filter(s=>s>=20&&s<40).length" class="da-eth__tag da-eth__tag--warning">{{ [item.ethicalityB.ai_writing.manuscript_score, ...item.ethicalityB.ai_writing.peer_review_reports.map(r=>r.score)].filter(s=>s>=20&&s<40).length }}</span>
                          </template>
                        </div>
                        <button class="da-rb__details-toggle da-eth__sub-toggle" @click="toggleDetails(item.id + '-ai-all')">
                          <ChevronUp v-if="isDetailsOpen(item.id + '-ai-all')" class="h-3.5 w-3.5" />
                          <ChevronDown v-else class="h-3.5 w-3.5" />
                          {{ isDetailsOpen(item.id + '-ai-all') ? 'Hide' : 'Show' }} Details
                        </button>
                        <div v-if="isDetailsOpen(item.id + '-ai-all')" class="da-ethb__list da-eth__sub-content">
                          <div class="da-ethb__ai-chip-row">
                            <span class="da-ethb__ai-chip-label">Manuscript</span>
                            <span :class="['da-ethb__score-badge', item.ethicalityB.ai_writing.manuscript_score >= 40 ? 'da-ethb__score-badge--severe' : item.ethicalityB.ai_writing.manuscript_score >= 20 ? 'da-ethb__score-badge--warning' : 'da-ethb__score-badge--ok']">{{ item.ethicalityB.ai_writing.manuscript_score }}</span>
                            <span class="da-ethb__ai-chip-hint">{{ item.ethicalityB.ai_writing.manuscript_score >= 40 ? 'High' : item.ethicalityB.ai_writing.manuscript_score >= 20 ? 'Medium' : 'Low' }}</span>
                          </div>
                          <div v-for="(rpt, ri) in item.ethicalityB.ai_writing.peer_review_reports" :key="ri" class="da-ethb__ai-chip-row">
                            <span class="da-ethb__ai-chip-label">Report {{ ri + 1 }}</span>
                            <span :class="['da-ethb__score-badge', rpt.score >= 40 ? 'da-ethb__score-badge--severe' : rpt.score >= 20 ? 'da-ethb__score-badge--warning' : 'da-ethb__score-badge--ok']">{{ rpt.score }}</span>
                            <span class="da-ethb__ai-chip-hint">{{ rpt.score >= 40 ? 'High' : rpt.score >= 20 ? 'Medium' : 'Low' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="item.confirmed" class="da-item__confirmed-info da-item__confirmed-info--eth">
                      <UserCheck class="h-3 w-3" />{{ item.confirmed.user }}
                      <Calendar class="h-3 w-3 ml-2" />{{ item.confirmed.time }}
                      <span v-if="item.confirmed.note" class="da-item__confirmed-note">{{ item.confirmed.note }}</span>
                    </div>
                  </div>
                </div>

                <!-- 普通 item -->
                <div v-else :class="['da-item', `da-item--${item.confirmed ? 'confirmed' : item.status}`]">
                  <!-- 状态指示条 -->
                  <!-- <div class="da-item__stripe" /> -->

                  <!-- 图标 -->
                  <div class="da-item__icon-wrap">
                    <component :is="getItemStatus(item).icon" :class="['da-item__icon', getItemStatus(item).color]" />
                  </div>

                  <!-- 主内容 -->
                  <div class="da-item__body">
                    <div class="da-item__top">
                      <div class="da-item__info">
                        <span class="da-item__title">{{ item.title }}</span>
                        <span v-if="item.description" class="da-item__desc">{{ item.description }}</span>
                      </div>
                      <div class="da-item__actions">
                        <template v-if="item.ethicality">
                          <button class="da-view-report-btn" @click="handleViewReport(item)">
                            <FileText class="h-3.5 w-3.5" />
                            View Report
                          </button>
                          <el-button size="small" plain @click="handleDownload(item)">
                            <template #icon><Download class="h-3.5 w-3.5" /></template>
                            Download
                          </el-button>
                        </template>
                        <!-- Resolve popover -->
                        <el-popover
                          :ref="el => setPopoverRef(item.id, el)"
                          placement="bottom-end"
                          :width="340"
                          trigger="click"
                          popper-class="da-confirm-pop"
                          @show="onPopoverShow(item.id)"
                        >
                          <template #reference>
                            <button :class="['da-confirm-btn', item.confirmed ? 'da-confirm-btn--done' : '']">
                              <UserCheck v-if="item.confirmed" class="h-3.5 w-3.5" />
                              <span>{{ item.confirmed ? 'Resolved' : 'Resolve' }}</span>
                            </button>
                          </template>
                          <div class="da-cpop">
                            <div class="da-cpop__head">
                              <span class="da-cpop__title">Resolve this check</span>
                              <button class="da-cpop__close" @click="closePopover(item.id)">✕</button>
                            </div>
                            <p class="da-cpop__hint">Select a reason:</p>
                            <div class="da-cpop__options">
                              <label
                                v-for="option in resolveOptions"
                                :key="option"
                                :class="['da-cpop__option', { 'da-cpop__option--selected': popoverSelections[item.id] === option }]"
                                @click="popoverSelections[item.id] = option"
                              >
                                <span class="da-cpop__radio" :class="{ 'da-cpop__radio--checked': popoverSelections[item.id] === option }" />
                                <span class="da-cpop__option-text">{{ option }}</span>
                              </label>
                            </div>
                            <div class="da-cpop__footer">
                              <button class="da-cpop__cancel" @click="closePopover(item.id)">Cancel</button>
                              <button
                                :class="['da-cpop__submit', { 'da-cpop__submit--disabled': !popoverSelections[item.id] }]"
                                :disabled="!popoverSelections[item.id]"
                                @click="commitConfirmInline(section.id, item.id)"
                              >Resolve</button>
                            </div>
                          </div>
                        </el-popover>
                      </div>
                    </div>

                    <!-- 统一的 results 列表：每个 result 块结构相同 -->
                    <div v-if="item.status !== 'healthy' && !item.ethicality" class="da-results">
                      <div
                        v-for="(rb, ri) in item.results"
                        :key="ri"
                        class="da-rb"
                      >
                        <!-- result 文字 -->
                        <p class="da-rb__result">{{ rb.result }}</p>
                        <!-- 作者行（可选），用上边框分隔 -->
                        <div v-if="rb.author" class="da-rb__author">
                          <span class="da-rb__author-name">{{ rb.author.name }}</span>
                          <span v-if="rb.author.email" class="da-rb__author-email">&lt;{{ rb.author.email }}&gt;</span>
                        </div>
                        <!-- details 展开 -->
                        <template v-if="rb.details?.length || rb.htmlContent">
                          <button class="da-rb__details-toggle" @click="toggleDetails(item.id + '-' + ri)">
                            <ChevronUp v-if="isDetailsOpen(item.id + '-' + ri)" class="h-3.5 w-3.5" />
                            <ChevronDown v-else class="h-3.5 w-3.5" />
                            {{ isDetailsOpen(item.id + '-' + ri) ? 'Hide' : 'Show' }} Details
                            <span v-if="rb.detailsType !== 'html' && rb.details">({{ rb.details.length }})</span>
                          </button>
                          <div v-if="isDetailsOpen(item.id + '-' + ri)" class="da-rb__details">
                            <!-- html 模式：渲染后端返回的自定义 HTML -->
                            <div v-if="rb.detailsType === 'html'" class="da-html" v-html="rb.htmlContent" />
                            <!-- list 模式（默认）：通用无序列表 -->
                            <ul v-else-if="rb.details">
                              <li v-for="(d, di) in rb.details" :key="di">
                                <div class="da-rb__details-dot"></div>
                                <span>{{ d }}</span>
                              </li>
                            </ul>
                          </div>
                        </template>
                      </div>
                    </div>

                    <!-- Ethicality 专属渲染 -->
                    <div v-if="item.ethicality" class="da-eth">
                      <!-- Authors -->
                      <div class="da-eth__row">
                        <span class="da-eth__label">Authors</span>
                        <template v-if="item.ethicality.issues_summary.authors.warning_count === 0 && item.ethicality.issues_summary.authors.severe_warning_count === 0">
                          <span class="da-eth__ok">No issues</span>
                        </template>
                        <template v-else>
                          <span v-if="item.ethicality.issues_summary.authors.severe_warning_count" class="da-eth__tag da-eth__tag--error">
                            {{ item.ethicality.issues_summary.authors.severe_warning_count }} 
                          </span>
                          <span v-if="item.ethicality.issues_summary.authors.warning_count" class="da-eth__tag da-eth__tag--warning">
                            {{ item.ethicality.issues_summary.authors.warning_count }} 
                          </span>
                        </template>
                      </div>
                      <!-- References -->
                      <div class="da-eth__row">
                        <span class="da-eth__label">References</span>
                        <template v-if="item.ethicality.issues_summary.references.warning_count === 0 && item.ethicality.issues_summary.references.severe_warning_count === 0">
                          <span class="da-eth__ok">No issues</span>
                        </template>
                        <template v-else>
                          <span v-if="item.ethicality.issues_summary.references.severe_warning_count" class="da-eth__tag da-eth__tag--error">
                            {{ item.ethicality.issues_summary.references.severe_warning_count }} 
                          </span>
                          <span v-if="item.ethicality.issues_summary.references.warning_count" class="da-eth__tag da-eth__tag--warning">
                            {{ item.ethicality.issues_summary.references.warning_count }} 
                          </span>
                          <span class="da-eth__label">这里可以展开具体的有问题的reference（待确定）</span>
                          <!-- <button v-if="item.ethicality.references_html" class="da-rb__details-toggle" @click="toggleDetails(item.id + '-refs')">
                            <ChevronUp v-if="isDetailsOpen(item.id + '-refs')" class="h-3.5 w-3.5" />
                            <ChevronDown v-else class="h-3.5 w-3.5" />
                            {{ isDetailsOpen(item.id + '-refs') ? 'Hide' : 'Show' }} Details
                          </button> -->
                        </template>
                      </div>
                      <div v-if="isDetailsOpen(item.id + '-refs') && item.ethicality.references_html" class="da-html da-eth__html" v-html="item.ethicality.references_html" />
                      <!-- AI Writing + Peer Review Reports: 紧凑比例行 -->
                      <div class="da-eth__row da-eth__row--ai">
                        <span class="da-eth__label">AI Writing</span>
                        <div class="da-eth__ai-table">
                          <div class="da-eth__ai-row">
                            <span class="da-eth__ai-row-label">Manuscript</span>
                            <div class="da-eth__ai-bar">
                              <div class="da-eth__ai-seg da-eth__ai-seg--human" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.human_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--maybe" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.maybe_ai_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--likely" :style="{ width: pct100(item.ethicality.issues_summary.ai_writing.likely_ai_proportion) }" />
                            </div>
                            <div class="da-eth__ai-nums">
                              <span class="da-eth__ai-num da-eth__ai-num--human">{{ pct100(item.ethicality.issues_summary.ai_writing.human_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--maybe">{{ pct100(item.ethicality.issues_summary.ai_writing.maybe_ai_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--likely">{{ pct100(item.ethicality.issues_summary.ai_writing.likely_ai_proportion) }}</span>
                            </div>
                          </div>
                          <div v-for="(rpt, ri) in item.ethicality.issues_summary.peer_review_reports" :key="ri" class="da-eth__ai-row">
                            <span class="da-eth__ai-row-label">Report {{ ri + 1 }}</span>
                            <div class="da-eth__ai-bar">
                              <div class="da-eth__ai-seg da-eth__ai-seg--human" :style="{ width: pct100(rpt.human_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--maybe" :style="{ width: pct100(rpt.maybe_ai_proportion) }" />
                              <div class="da-eth__ai-seg da-eth__ai-seg--likely" :style="{ width: pct100(rpt.likely_ai_proportion) }" />
                            </div>
                            <div class="da-eth__ai-nums">
                              <span class="da-eth__ai-num da-eth__ai-num--human">{{ pct100(rpt.human_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--maybe">{{ pct100(rpt.maybe_ai_proportion) }}</span>
                              <span class="da-eth__ai-num da-eth__ai-num--likely">{{ pct100(rpt.likely_ai_proportion) }}</span>
                            </div>
                          </div>
                          <!-- 图例 -->
                          <div class="da-eth__ai-legend-row">
                            <span class="da-eth__ai-dot da-eth__ai-dot--human" />Low
                            <span class="da-eth__ai-dot da-eth__ai-dot--maybe" />Medium
                            <span class="da-eth__ai-dot da-eth__ai-dot--likely" />High
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 解决信息 -->
                    <div v-if="item.confirmed" class="da-item__confirmed-info">
                      <UserCheck class="h-3 w-3" />{{ item.confirmed.user }}
                      <Calendar class="h-3 w-3 ml-2" />{{ item.confirmed.time }}
                      <span v-if="item.confirmed.note" class="da-item__confirmed-note">{{ item.confirmed.note }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <div v-if="getFilteredItems(section.items).length === 0" class="da-section__empty">
                <CheckCircle class="h-4 w-4 text-green-500" />
                All checks passed in this section
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 右侧 section 导航 -->
      <nav class="da-nav">
        <div class="da-nav__label">Sections</div>
        <div
          v-for="section in sections"
          :key="section.id"
          class="da-nav__item"
          @click="scrollToSection(section.id)"
        >
          <div class="da-nav__row">
            <span class="da-nav__title">{{ section.title }}</span>
            <div class="da-nav__badges">
              <template v-if="section.items.some(i => i.ethicality || i.ethicalityB)">
                <span v-if="getEthNavStats(section.items).severe" class="da-badge da-badge--error">{{ getEthNavStats(section.items).severe }}</span>
                <span v-if="getEthNavStats(section.items).warning" class="da-badge da-badge--warning">{{ getEthNavStats(section.items).warning }}</span>
              </template>
              <template v-else>
                <span v-if="getStats(section.items).error" class="da-badge da-badge--error">{{ getStats(section.items).error }}</span>
                <span v-if="getStats(section.items).warning" class="da-badge da-badge--warning">{{ getStats(section.items).warning }}</span>
                <span v-if="getStats(section.items).confirmed" class="da-badge da-badge--confirmed">{{ getStats(section.items).confirmed }}</span>
              </template>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>


<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, Calendar, CheckCircle, ChevronDown, ChevronUp, Download, FileText, Loader2, RefreshCcw, UserCheck, XCircle } from 'lucide-vue-next'
import { detectionConfig } from '../migrated-detection/detection-config.js'
import './DetectionAssistant.css'

const statusMap = {
  healthy: { icon: CheckCircle, color: 'text-green-500', label: 'Passed', tagType: 'success' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Warning', tagType: 'warning' },
  error: { icon: XCircle, color: 'text-red-500', label: 'Failed', tagType: 'danger' },
  resolved: { icon: UserCheck, color: 'text-gray-400', label: 'Resolved', tagType: 'info' },
}

const sections = ref(detectionConfig.map((s) => ({
  ...s,
  items: s.items.map((i) => ({ ...i, confirmed: undefined }))
})))

// ethicality item 折叠状态：默认展开每个 section 中第一个 ethicality/ethicalityB item
const ethExpandedItems = reactive((() => {
  const map = {}
  detectionConfig.forEach(s => {
    const ethItems = s.items.filter(i => i.ethicality || i.ethicalityB)
    ethItems.forEach((item, idx) => { map[item.id] = idx === 0 })
  })
  return map
})())

function toggleEthItem(itemId) { ethExpandedItems[itemId] = !ethExpandedItems[itemId] }

// 计算某个 ethicality item 的 severe / warning 总数（Plan A & B 通用）
function getEthStats(item) {
  if (item.ethicality) {
    const s = item.ethicality.issues_summary
    return {
      severe: (s.authors?.severe_warning_count || 0) + (s.references?.severe_warning_count || 0),
      warning: (s.authors?.warning_count || 0) + (s.references?.warning_count || 0),
    }
  }
  if (item.ethicalityB) {
    const b = item.ethicalityB
    const severe = b.authors.reduce((n, a) => n + a.issues.filter(i => i.level === 'severe').length, 0)
      + b.references.filter(r => r.level === 'severe').length
    const warning = b.authors.reduce((n, a) => n + a.issues.filter(i => i.level === 'warning').length, 0)
      + b.references.filter(r => r.level === 'warning').length
    return { severe, warning }
  }
  return { severe: 0, warning: 0 }
}

// 导航栏 Ethicality section 只取第一个文件的统计
function getEthNavStats(items) {
  const first = items.find(i => i.ethicality || i.ethicalityB)
  if (!first) return { severe: 0, warning: 0 }
  return getEthStats(first)
}

const loading = ref(false)
const sectionLoading = ref(null)
const showOnlyIssues = ref(false)
const activeSection = ref(sections.value[0]?.id)

const resolveOptions = [
  'Resolved with responsible person, the detected problem will not affect the paper processing',
  'Have solved the problems and it can be continued',
  'The detection is wrong',
]
// popover refs & per-item selections
const popoverRefs = reactive({})
const popoverSelections = reactive({})

function setPopoverRef(itemId, el) {
  if (el) popoverRefs[itemId] = el
}
function onPopoverShow(itemId) {
  // pre-fill with existing confirmed note if any
  const allItems = sections.value.flatMap(s => s.items)
  const item = allItems.find(i => i.id === itemId)
  if (item?.confirmed?.note && !popoverSelections[itemId]) {
    popoverSelections[itemId] = item.confirmed.note
  }
}
function closePopover(itemId) {
  popoverRefs[itemId]?.hide?.()
}
function commitConfirmInline(sectionId, itemId) {
  const note = popoverSelections[itemId]
  if (!note) return
  const info = {
    user: 'Current User',
    time: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    note,
  }
  sections.value = sections.value.map((section) =>
    section.id === sectionId
      ? { ...section, items: section.items.map((item) => item.id === itemId ? { ...item, confirmed: info } : item) }
      : section
  )
  closePopover(itemId)
}

function getStats(items) {
  const list = items || sections.value.flatMap((s) => s.items)
  let healthy = 0, warning = 0, error = 0, confirmed = 0
  list.forEach((item) => {
    if (item.confirmed) confirmed++
    else if (item.status === 'healthy') healthy++
    else if (item.status === 'warning') warning++
    else if (item.status === 'error') error++
  })
  return { healthy, warning, error, confirmed, total: healthy + warning + error + confirmed }
}

const overallStats = computed(() => getStats())

function pct(n) {
  const t = overallStats.value.total
  return t ? (n / t * 100).toFixed(1) + '%' : '0%'
}

function pct100(ratio) {
  return ((ratio || 0) * 100).toFixed(0) + '%'
}

function getFilteredItems(items) {
  if (!showOnlyIssues.value) return items
  return items.filter((item) => !item.confirmed && (item.status === 'warning' || item.status === 'error'))
}

function getItemStatus(item) {
  if (item.confirmed) return statusMap.resolved
  return statusMap[item.status] || statusMap.healthy
}

const expandedDetails = reactive({})
function toggleDetails(itemId) { expandedDetails[itemId] = !expandedDetails[itemId] }
function isDetailsOpen(itemId) { return !!expandedDetails[itemId] }

function scrollToSection(id) {
  activeSection.value = id
  const el = document.getElementById('section-' + id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onContentScroll() {
  for (const section of sections.value) {
    const el = document.getElementById('section-' + section.id)
    if (el && el.getBoundingClientRect().top <= 90) activeSection.value = section.id
  }
}

onMounted(() => window.addEventListener('scroll', onContentScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onContentScroll))

function handleRedetectAll() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 2000)
}

function handleRedetectSection(sectionId) {
  sectionLoading.value = sectionId
  setTimeout(() => { sectionLoading.value = null }, 1500)
}

function handleViewReport(item) {
  // TODO: 跳转或弹出 ethicality 完整报告
  console.log('View report for:', item.title)
}

function handleDownload(item) {
  const content = `Detection Report: ${item.title}\n\nResult: ${item.result}\n\nGenerated on: ${new Date().toLocaleString()}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
