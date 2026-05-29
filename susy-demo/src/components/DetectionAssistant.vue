<template>
  <div class="da-layout">
    <!-- 顶部信息栏 -->
    <div class="da-header">
      <div class="da-header__left">
        <span class="da-page-title">Detection Assistant</span>
        <span class="da-ms-id">nutrients-4224751</span>
        <span class="da-header__sep">|</span>
        <span class="material-symbols-outlined da-file-ver__icon">description</span>
        <span class="da-file-ver__name">{{ currentFileVersion.name }}</span>
        <button class="da-refresh-btn" title="Get latest file version" @click="handleRefreshFile">
          <span class="material-symbols-outlined" :class="{ 'da-refresh-btn--spin': refreshing }">refresh</span>
        </button>
        <!-- 切换文件功能暂时注释
        <button class="da-file-ver__name da-file-ver__name--btn" @click="fileVerDialogVisible = true">
          {{ currentFileVersion.name }}
          <span class="material-symbols-outlined" style="font-size:13px;">unfold_more</span>
        </button>
        <span v-if="currentFileVersion.isLatest" class="da-file-ver__tag da-file-ver__tag--latest">Latest</span>
        <span v-else class="da-file-ver__tag da-file-ver__tag--outdated">Not latest</span>
        -->
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
        <span class="material-symbols-outlined da-stat__icon">cancel</span>
        <span class="da-stat__num">{{ overallStats.error }}</span>
        <span class="da-stat__label">Severe</span>
      </div>
      <div class="da-stat da-stat--warning">
        <span class="material-symbols-outlined da-stat__icon">warning</span>
        <span class="da-stat__num">{{ overallStats.warning }}</span>
        <span class="da-stat__label">Warning</span>
      </div>
      <div class="da-stat da-stat--success">
        <span class="material-symbols-outlined da-stat__icon">check_circle</span>
        <span class="da-stat__num">{{ overallStats.healthy }}</span>
        <span class="da-stat__label">Passed</span>
      </div>
      <div class="da-stat da-stat--confirmed">
        <span class="material-symbols-outlined da-stat__icon">how_to_reg</span>
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
          <p>Running detection ...</p>
        </div>

        <!-- 整个检测助手没有结果的空状态 -->
        <div v-else-if="hasNoDetectionResults" class="da-empty-state">
          <span class="material-symbols-outlined da-empty-state__icon">hourglass_empty</span>
          <h3 class="da-empty-state__title">Detection in Progress</h3>
          <p class="da-empty-state__desc">
            Detection is currently running for this manuscript. Please refresh the page later to view the detection results.
          </p>
          <el-button type="primary" class="susy-btn" @click="handleRedetectAll">
            View Results (Demo)
          </el-button>
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
                <template #icon><span class="material-symbols-outlined" style="font-size:14px;">refresh</span></template>
                Re-detect
              </el-button>
            </div>

            <!-- 检测项列表 -->
            <div v-if="sectionLoading === section.id" class="da-section__loading">
              <span class="material-symbols-outlined da-spinner-icon">progress_activity</span>
            </div>
            <div v-else class="da-items">
              <!-- Ethicality section：当前文件非 PDF 时只显示提示，不显示 item -->
              <template v-if="section.items.some(i => i.ethicality || i.ethicalityB || i.ethicalityPending || i.ethicalityFailed) && !(/\.pdf$/i.test(currentFileVersion.name))">
                <div class="da-section__empty da-section__empty--muted">
                  <span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">info</span>
                  No results available for the current file. 
                </div>
              </template>
              
              <!-- 正常渲染 items（非 PDF 时过滤掉 ethicality items） -->
              <template v-else>
                <template v-for="item in getFilteredItems(section.items)" :key="item.id">
                <!-- Ethicality item：可折叠，无状态图标 -->
                <div v-if="(item.ethicality || item.ethicalityB || item.ethicalityPending || item.ethicalityFailed) && /\.pdf$/i.test(currentFileVersion.name)" class="da-item da-item--eth">
                  <div class="da-item__body">
                    <!-- 文件名行：点击折叠/展开 -->
                    <div class="da-eth-file__head" @click="toggleEthItem(item.id)">
                      <div class="da-eth-file__left">
                        <span class="material-symbols-outlined da-eth-file__chevron">{{ ethExpandedItems[item.id] ? 'expand_less' : 'expand_more' }}</span>
                        <span class="da-eth-file__name">{{ item.fileName }}</span>
                        <!-- 正常检测结果 -->
                        <template v-if="(item.ethicality || item.ethicalityB) && (getEthStats(item).severe || getEthStats(item).warning)">
                          <span v-if="getEthStats(item).severe" class="da-eth__tag da-eth__tag--error">{{ getEthStats(item).severe }}</span>
                          <span v-if="getEthStats(item).warning" class="da-eth__tag da-eth__tag--warning">{{ getEthStats(item).warning }}</span>
                        </template>
                        <template v-else-if="item.ethicality || item.ethicalityB">
                          <span class="da-eth__ok">No issues</span>
                        </template>
                      </div>
                      <div class="da-item__actions" @click.stop>
                        <!-- 正常状态才显示 View Report 和 Resolve -->
                        <template v-if="item.ethicality || item.ethicalityB">
                          <button class="da-view-report-btn" @click="handleViewReport(item)">
                            <span class="material-symbols-outlined" style="font-size:14px;">description</span>
                            View Report
                          </button>
                        </template>
                        <!-- 所有状态都显示 Download -->
                        <el-button size="small" plain @click="handleDownload(item)">
                          <template #icon><span class="material-symbols-outlined" style="font-size:14px;">download</span></template>
                          Download
                        </el-button>
                        <!-- 正常状态才显示 Resolve -->
                        <template v-if="item.ethicality || item.ethicalityB">
                          <el-popover
                            v-if="item.status !== 'healthy'"
                            :ref="el => setPopoverRef(item.id, el)"
                            placement="bottom-end"
                            :width="340"
                            trigger="click"
                            popper-class="da-confirm-pop"
                            @show="onPopoverShow(item.id)"
                          >
                            <template #reference>
                              <button :class="['da-confirm-btn', item.confirmed ? 'da-confirm-btn--done' : '']">
                                <span v-if="item.confirmed" class="material-symbols-outlined" style="font-size:14px;">how_to_reg</span>
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
                        </template>
                      </div>
                    </div>

                    <!-- Pending 状态内容 -->
                    <div v-if="item.ethicalityPending && ethExpandedItems[item.id]" class="da-eth">
                      <div class="da-eth__pending-content">
                        <span class="material-symbols-outlined da-eth__pending-icon">hourglass_top</span>
                        <span class="da-eth__pending-text">Detection in progress. Results will be available shortly.</span>
                      </div>
                    </div>

                    <!-- Failed 状态内容 -->
                    <div v-if="item.ethicalityFailed && ethExpandedItems[item.id]" class="da-eth">
                      <div class="da-eth__failed-content">
                        <span class="material-symbols-outlined da-eth__failed-icon">error</span>
                        <span class="da-eth__failed-text">Ethicality detection failed. Please check the manuscript file or <a href="#" class="da-eth__retry-link" @click.prevent="handleRetryEthicality(item)">Retry</a>.</span>
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
                          <!-- <span class="da-eth__label">这里可以展开具体的有问题的reference（待确定）</span> -->
                        </template>
                      </div>
                      <div v-if="isDetailsOpen(item.id + '-refs') && item.ethicality.references_html" class="da-html da-eth__html" v-html="item.ethicality.references_html" />
                      <!-- AI Writing + Peer Review Reports -->
                      <div class="da-eth__row da-eth__row--donuts">
                        <span class="da-eth__label">AI Writing</span>
                        <div class="da-donut-row">
                          <AiWritingDonut :ai-writing="item.ethicality.issues_summary.ai_writing" label="Manuscript" />
                          <AiWritingDonut
                            v-for="(rpt, ri) in item.ethicality.issues_summary.peer_review_reports"
                            :key="ri"
                            :ai-writing="rpt"
                            :label="`Report ${ri + 1}`"
                          />
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
                            <span class="material-symbols-outlined" style="font-size:14px;">{{ isDetailsOpen(item.id + '-authors-all') ? 'expand_less' : 'expand_more' }}</span>
                            {{ isDetailsOpen(item.id + '-authors-all') ? 'Hide' : 'Show' }} Details
                          </button>
                          <div v-if="isDetailsOpen(item.id + '-authors-all')" class="da-ethb__list da-eth__sub-content">
                            <div v-for="(author, ai) in item.ethicalityB.authors" :key="ai" class="da-ethb__author-block">
                              <div class="da-ethb__author-name">
                                {{ author.name }}
                                <span v-if="author.email" class="da-ethb__author-email">&lt;{{ author.email }}&gt;</span>
                              </div>
                              <div class="da-ethb__issue-tags">
                                <span v-for="(issue, ii) in author.issues" :key="ii"
                                  :class="['da-eth__tag', issue.level === 'severe' ? 'da-eth__tag--error' : 'da-eth__tag--warning']">
                                  {{ issue.text }}
                                </span>
                              </div>
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
                            <span class="material-symbols-outlined" style="font-size:14px;">{{ isDetailsOpen(item.id + '-refs-all') ? 'expand_less' : 'expand_more' }}</span>
                            {{ isDetailsOpen(item.id + '-refs-all') ? 'Hide' : 'Show' }} Details
                          </button>
                          <div v-if="isDetailsOpen(item.id + '-refs-all')" class="da-ethb__list da-eth__sub-content">
                            <div v-for="(ref, ri) in item.ethicalityB.references" :key="ri" class="da-ethb__ref-block">
                              <div class="da-ethb__ref-title">
                                <span class="da-ethb__ref-index">{{ ref.index }}</span>
                                <span class="da-ethb__ref-text">{{ ref.title }}</span>
                                <a v-if="ref.doi" :href="'https://doi.org/' + ref.doi" target="_blank" class="da-ethb__doi-link">DOI: {{ ref.doi }}</a>
                              </div>
                              <div class="da-ethb__ref-tags">
                                <span v-for="(p, pi) in ref.problems" :key="pi" :class="['da-eth__tag', p.level === 'severe' ? 'da-eth__tag--error' : 'da-eth__tag--warning']">{{ p.text }}</span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>

                      <!-- AI Writing (Plan B) -->
                      <div class="da-eth__row da-eth__row--donuts da-eth__row--col">
                        <div class="da-eth__label-row">
                          <span class="da-eth__label">AI Writing</span>
                        </div>
                        <div class="da-donut-row">
                          <AiWritingDonut :ai-writing="item.ethicalityB.ai_writing" label="Manuscript" />
                          <AiWritingDonut
                            v-for="(rpt, ri) in item.ethicalityB.ai_writing.peer_review_reports"
                            :key="ri"
                            :ai-writing="rpt"
                            :label="`Report ${ri + 1}`"
                          />
                        </div>
                      </div>
                    </div>

                    <div v-if="item.confirmed" class="da-item__confirmed-info da-item__confirmed-info--eth">
                      <span class="material-symbols-outlined" style="font-size:12px;">how_to_reg</span>{{ item.confirmed.user }}
                      <span class="material-symbols-outlined ml-2" style="font-size:12px;">calendar_today</span>{{ item.confirmed.time }}
                      <span v-if="item.confirmed.note" class="da-item__confirmed-note">{{ item.confirmed.note }}</span>
                    </div>
                  </div>
                </div>

                <!-- 普通 item（排除 ethicality item） -->
                <div v-else-if="!item.ethicality && !item.ethicalityB" :class="['da-item', `da-item--${item.confirmed ? 'confirmed' : item.status}`]">
                  <!-- 状态指示条 -->
                  <!-- <div class="da-item__stripe" /> -->

                  <!-- 图标 -->
                  <div class="da-item__icon-wrap">
                    <span class="material-symbols-outlined da-item__icon" :class="getItemStatus(item).color">{{ getItemStatus(item).icon }}</span>
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
                            <span class="material-symbols-outlined" style="font-size:14px;">description</span>
                            View Report
                          </button>
                          <el-button size="small" plain @click="handleDownload(item)">
                            <template #icon><span class="material-symbols-outlined" style="font-size:14px;">download</span></template>
                            Download
                          </el-button>
                        </template>
                        <!-- Resolve popover -->
                        <el-popover
                          v-if="item.status !== 'healthy'"
                          :ref="el => setPopoverRef(item.id, el)"
                          placement="bottom-end"
                          :width="340"
                          trigger="click"
                          popper-class="da-confirm-pop"
                          @show="onPopoverShow(item.id)"
                        >
                          <template #reference>
                            <button :class="['da-confirm-btn', item.confirmed ? 'da-confirm-btn--done' : '']">
                              <span v-if="item.confirmed" class="material-symbols-outlined" style="font-size:14px;">how_to_reg</span>
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
                        <p class="da-rb__result">
                          <template v-if="rb.resultSlots">
                            <template v-for="(seg, si) in parseResultSlots(rb.result, rb.resultSlots)" :key="si">
                              <span v-if="seg.type === 'text'">{{ seg.content }}</span>
                              <a v-else-if="seg.type === 'link'" :href="seg.href" :target="seg.target || '_blank'" class="da-rb__link">{{ seg.content }}</a>
                              <el-tooltip v-else-if="seg.type === 'tooltip'" :content="seg.tooltip" placement="top" :show-after="200">
                                <span class="da-rb__tooltip-icon material-symbols-outlined">{{ seg.icon || 'info' }}</span>
                              </el-tooltip>
                            </template>
                          </template>
                          <template v-else>{{ rb.result }}</template>
                        </p>
                        <!-- 作者行（可选），用上边框分隔 -->
                        <div v-if="rb.author" class="da-rb__author">
                          <span class="da-rb__author-name">{{ rb.author.name }}</span>
                          <span v-if="rb.author.email" class="da-rb__author-email">&lt;{{ rb.author.email }}&gt;</span>
                        </div>
                        <!-- details 展开 -->
                        <template v-if="rb.details?.length || rb.htmlContent">
                          <button class="da-rb__details-toggle" @click="toggleDetails(item.id + '-' + ri)">
                            <span class="material-symbols-outlined" style="font-size:14px;">{{ isDetailsOpen(item.id + '-' + ri) ? 'expand_less' : 'expand_more' }}</span>
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
                          <!-- <span class="da-eth__label">这里可以展开具体的有问题的reference（待确定）</span> -->
                          <!-- <button v-if="item.ethicality.references_html" class="da-rb__details-toggle" @click="toggleDetails(item.id + '-refs')">
                            <ChevronUp v-if="isDetailsOpen(item.id + '-refs')" class="h-3.5 w-3.5" />
                            <ChevronDown v-else class="h-3.5 w-3.5" />
                            {{ isDetailsOpen(item.id + '-refs') ? 'Hide' : 'Show' }} Details
                          </button> -->
                        </template>
                      </div>
                      <div v-if="isDetailsOpen(item.id + '-refs') && item.ethicality.references_html" class="da-html da-eth__html" v-html="item.ethicality.references_html" />
                      <!-- AI Writing + Peer Review Reports -->
                      <div class="da-eth__row da-eth__row--donuts">
                        <span class="da-eth__label">AI Writing</span>
                        <div class="da-donut-row">
                          <AiWritingDonut :ai-writing="item.ethicality.issues_summary.ai_writing" label="Manuscript" />
                          <AiWritingDonut
                            v-for="(rpt, ri) in item.ethicality.issues_summary.peer_review_reports"
                            :key="ri"
                            :ai-writing="rpt"
                            :label="`Report ${ri + 1}`"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- 解决信息 -->
                    <div v-if="item.confirmed" class="da-item__confirmed-info">
                      <span class="material-symbols-outlined" style="font-size:12px;">how_to_reg</span>{{ item.confirmed.user }}
                      <span class="material-symbols-outlined ml-2" style="font-size:12px;">calendar_today</span>{{ item.confirmed.time }}
                      <span v-if="item.confirmed.note" class="da-item__confirmed-note">{{ item.confirmed.note }}</span>
                    </div>
                  </div>
                </div>
              </template>
              </template>

              <!-- 其他 section 的空状态提示 -->
              <div v-if="!section.items.some(i => i.ethicality || i.ethicalityB || i.ethicalityPending || i.ethicalityFailed) && getFilteredItems(section.items).length === 0" class="da-section__empty">
                <span class="material-symbols-outlined" style="font-size:16px;color:#16a34a;">check_circle</span>
                All checks passed in this section
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 右侧 section 导航 -->
      <nav v-if="!loading && !hasNoDetectionResults" class="da-nav">
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
                <template v-if="/\.pdf$/i.test(currentFileVersion.name)">
                  <span v-if="getEthNavStats(section.items).severe" class="da-badge da-badge--error">{{ getEthNavStats(section.items).severe }}</span>
                  <span v-if="getEthNavStats(section.items).warning" class="da-badge da-badge--warning">{{ getEthNavStats(section.items).warning }}</span>
                </template>
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

  <!-- File Version Dialog — 暂时注释
  <el-dialog v-model="fileVerDialogVisible" title="Manuscript Files" width="720px" :close-on-click-modal="false">
    <div class="da-fvd">
      <div v-for="(log, i) in fileVersionLog" :key="i"
        :class="['da-fvd__row', { 'da-fvd__row--active': fileVerSelected === log.name }]"
        @click="fileVerSelected = log.name"
      >
        <span class="material-symbols-outlined da-fvd__row-icon">description</span>
        <div class="da-fvd__row-body">
            <div class="da-fvd__row-top">
              <span class="da-fvd__row-name">{{ log.name }}</span>
              <span v-if="i === 0" class="da-file-ver__tag--latest">Latest</span>
            </div>
          <div class="da-fvd__row-meta">
            <span>{{ log.time }}</span>
            <span class="da-fvd__meta-sep">·</span>
            <span class="da-fvd__meta-actor">{{ log.actor }}</span>
          </div>
        </div>
        <span v-if="fileVerSelected === log.name" class="material-symbols-outlined da-fvd__row-check">check_circle</span>
      </div>
    </div>
    <template #footer>
      <el-button size="small" @click="fileVerDialogVisible = false">Cancel</el-button>
      <button :class="['da-apply-btn', { 'da-apply-btn--disabled': fileVerSelected === currentFileVersion.name }]" :disabled="fileVerSelected === currentFileVersion.name" @click="handleApplyVersion">Apply</button>
    </template>
  </el-dialog>
  -->

  <!-- 确认切换到最新文件弹窗 -->
  <el-dialog v-model="confirmDialogVisible" title="New File Version Available" width="480px" :close-on-click-modal="false">
    <div class="da-confirm-new">
      <p class="da-confirm-new__text">
        A newer file version is available: <b>{{ latestFileName }}</b>
      </p>
      <p class="da-confirm-new__hint">
The detection will run in the background. Please refresh the page later to view the latest detection results.      </p>
    </div>
    <template #footer>
      <el-button size="small" @click="confirmDialogVisible = false">Cancel</el-button>
      <el-button size="small" type="primary" class="dm-btn-primary" @click="confirmSwitchToLatest">Start Detection</el-button>
    </template>
  </el-dialog>
</template>


<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { detectionConfig } from '../migrated-detection/detection-config.js'
import AiWritingDonut from './AiWritingDonut.vue'
import './DetectionAssistant.css'

const statusMap = {
  healthy:  { icon: 'check_circle',  color: 'text-green-500',  label: 'Passed',   tagType: 'success' },
  warning:  { icon: 'warning',        color: 'text-yellow-500', label: 'Warning',  tagType: 'warning' },
  error:    { icon: 'cancel',         color: 'text-red-500',    label: 'Failed',   tagType: 'danger'  },
  resolved: { icon: 'how_to_reg',     color: 'text-gray-400',   label: 'Resolved', tagType: 'info'    },
}

// ── Ethicality 写死数据 ──
const ethicalityData = {
  issues_summary: {
    authors: { warning_count: 2, severe_warning_count: 1 },
    references: { warning_count: 3, severe_warning_count: 0 },
    ai_writing: { human_proportion: 0.52, maybe_ai_proportion: 0.28, likely_ai_proportion: 0.20 },
    peer_review_reports: [
      { human_proportion: 0.80, maybe_ai_proportion: 0.12, likely_ai_proportion: 0.08 },
      { human_proportion: 0.45, maybe_ai_proportion: 0.30, likely_ai_proportion: 0.25 },
    ],
  },
}

const ethicalityBData = {
  authors: [
    {
      name: 'Dr. John Smith', email: 'john.smith@example.com',
      issues: [
        { level: 'severe',  text: 'Card' },
        { level: 'warning', text: 'Poor Topic Similarity' },
      ],
    },
    {
      name: 'Prof. Li Wei', email: 'li.wei@example.com',
      issues: [{ level: 'warning', text: 'Poor Topic Similarity' }],
    },
  ],
  references: [
    {
      index: '[1]',
      title: 'Studies of the mechanism by which hepatic citrate synthase activity increases in vitamin B12 deprivation.',
      doi: '10.1042/bj0870078',
      problems: [
        { text: 'Out of scope',   level: 'warning' },
        { text: 'Out of context', level: 'warning' },
      ],
    },
    {
      index: '[12]',
      title: 'Reduced expression of citrate synthase leads to excessive superoxide formation and cell apoptosis',
      doi: '10.1038/s41419-020-2638-4',
      problems: [
        { text: 'Outdated',   level: 'warning' },
        { text: 'Corrected',  level: 'severe'  },
      ],
    },
  ],
  ai_writing: {
    maybe_ai_proportion: 0.28,
    likely_ai_proportion: 0.20,
    peer_review_reports: [
      { maybe_ai_proportion: 0.12, likely_ai_proportion: 0.08 },
      { maybe_ai_proportion: 0.18, likely_ai_proportion: 0.22 },
    ],
  },
}

const ethicalitySectionId = 'section-eth'
const ethicalityItemId    = 'item-eth-v4'
const ethicalityBItemId   = 'item-eth-v3'
const ethicalityPendingId = 'item-eth-v2'
const ethicalityFailedId  = 'item-eth-v1'

// 初始状态为空，模拟首次进入页面时没有检测结果
const sections = ref([])

// ethicality item 折叠状态：默认展开第一个
const ethExpandedItems = reactive((() => {
  const map = {}
  detectionConfig.forEach(s => {
    const ethItems = s.items.filter(i => i.ethicality || i.ethicalityB)
    ethItems.forEach((item, idx) => { map[item.id] = idx === 0 })
  })
  map[ethicalityItemId]    = true
  map[ethicalityBItemId]   = false
  map[ethicalityPendingId] = false
  map[ethicalityFailedId]  = false
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
      + b.references.flatMap(r => r.problems).filter(p => p.level === 'severe').length
    const warning = b.authors.reduce((n, a) => n + a.issues.filter(i => i.level !== 'severe').length, 0)
      + b.references.flatMap(r => r.problems).filter(p => p.level !== 'severe').length
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

// 判断是否完全没有检测结果
const hasNoDetectionResults = computed(() => {
  // 如果没有任何 section，认为没有结果
  if (!sections.value || sections.value.length === 0) {
    return true
  }
  
  // 如果所有 section 的所有 item 都没有实际检测数据，则认为没有结果
  return sections.value.every(section => {
    // 如果 section 没有 items，跳过
    if (!section.items || section.items.length === 0) {
      return true
    }
    
    return section.items.every(item => {
      // 对于 ethicality item，检查是否有实际数据
      if (item.ethicality || item.ethicalityB) {
        return false // 有 ethicality 数据，说明有结果
      }
      
      // 对于 pending 或 failed 状态，也算作"有结果"（虽然不是成功的结果）
      if (item.ethicalityPending || item.ethicalityFailed) {
        return false
      }
      
      // 对于普通 item，检查是否有 results 数据
      return !item.results || item.results.length === 0
    })
  })
})

// 页面级文件版本
const currentFileVersion = ref({ name: 'peer-review-v1.pdf', isLatest: false })

// 刷新按钮状态
const refreshing = ref(false)

// 确认弹窗
const confirmDialogVisible = ref(false)
const latestFileName = ref('manuscript-v2.docx')

/* === 切换文件功能暂时注释 ===
const fileVerDialogVisible = ref(false)
const fileVerSelected = ref(currentFileVersion.value.name)

const fileVersionOptions = [
  { name: 'manuscript-v3.docx',  fileType: 'Manuscript (Word/ZIP)',    isPdf: false },
  { name: 'peer-review.v2.pdf',  fileType: 'Manuscript (PDF Version)', isPdf: true  },
]

const fileVersionLog = [
  { name: 'peer-review-v2.pdf',   fileType: 'Manuscript (PDF Version)', time: '2026-04-08 08:05:27', actor: 'Maura Zhao uploaded at Editor Ajax Upload File',  detected: true },
  { name: 'manuscript-v3.docx',   fileType: 'Manuscript (Word/ZIP)',    time: '2026-04-08 08:05:27', actor: 'Maura Zhao uploaded at Editor Ajax Upload File',  detected: true  },
  { name: 'manuscript-v2.zip',    fileType: 'Manuscript (Word/ZIP)',    time: '2026-04-05 14:22:10', actor: 'Maura Zhao uploaded at Peer review',               detected: true  },
  { name: 'manuscript-undetected.docx',   fileType: 'Manuscript (Word/ZIP)',    time: '2026-04-02 10:40:59', actor: 'Maura Zhao uploaded at Peer review',               detected: false },
  { name: 'peer-review-v1.pdf',   fileType: 'Manuscript (PDF Version)', time: '2026-04-02 10:37:24', actor: 'Maura Zhao uploaded at Editor Ajax Upload File',  detected: true  },
  { name: 'manuscript-v1.docx',   fileType: 'Manuscript (Word/ZIP)',    time: '2026-04-02 04:57:01', actor: 'Evelyn Du uploaded at Upload step 0',              detected: true  },
]

function handleApplyVersion() {
  const selected = fileVersionLog.find(f => f.name === fileVerSelected.value)
  const isPdf = /\.pdf$/i.test(fileVerSelected.value)
  const isLatest = fileVerSelected.value === fileVersionLog[0]?.name

  prevFileVersionName.value = currentFileVersion.value.name
  currentFileVersion.value = { name: fileVerSelected.value, isLatest, isPdf }
  fileVerDialogVisible.value = false
  detectionBanner.value = null

  if (selected?.detected) {
    // 已检测过：短暂 loading 后直接显示
    handleRedetectAll()
  } else {
    // 未检测过：显示异步提示 banner，不触发 loading
    detectionBanner.value = 'pending'
  }
}
=== 切换文件功能暂时注释结束 === */

// 刷新文件版本
function handleRefreshFile() {
  if (refreshing.value) return
  refreshing.value = true

  // 模拟获取最新文件信息
  setTimeout(() => {
    refreshing.value = false
    // 模拟：当前文件不是最新
    if (!currentFileVersion.value.isLatest) {
      // 弹窗询问
      confirmDialogVisible.value = true
    }
    // 如果是最新，不做任何操作
  }, 800)
}

// 确认切换到最新文件
function confirmSwitchToLatest() {
  currentFileVersion.value = { name: latestFileName.value, isLatest: true }
  confirmDialogVisible.value = false
}

const resolveOptions = [
  'Confirmed with responsible person, the detected problem will not affect the paper processing',
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

// 解析 result 模板字符串，将 {{key}} 替换为对应的 slot 节点
function parseResultSlots(result, slots) {
  const parts = result.split(/({{[^}]+}})/)
  return parts.map(part => {
    const match = part.match(/^{{(.+)}}$/)
    if (match) {
      const key = match[1]
      return slots[key] ? { ...slots[key] } : { type: 'text', content: part }
    }
    return { type: 'text', content: part }
  }).filter(seg => seg.content !== '')
}

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
  setTimeout(() => {
    // 加载实际的检测数据
    sections.value = [
      ...detectionConfig.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i, confirmed: undefined }))
      })),
      {
        id: ethicalitySectionId,
        title: 'Ethicality',
        items: [
          { id: ethicalityItemId,    title: '', status: 'error',   results: [], confirmed: undefined, ethicality:  ethicalityData,  fileName: 'peer-review-v4.pdf' },
          { id: ethicalityBItemId,   title: '', status: 'error',   results: [], confirmed: undefined, ethicalityB: ethicalityBData, fileName: 'peer-review-v3.pdf（暂时不需要实现）' },
          { id: ethicalityPendingId, title: '', status: 'pending', results: [], confirmed: undefined, ethicalityPending: true,      fileName: 'peer-review-v2.pdf' },
          { id: ethicalityFailedId,  title: '', status: 'failed',  results: [], confirmed: undefined, ethicalityFailed: true,       fileName: 'peer-review-v1.pdf' },
        ],
      },
    ]
    loading.value = false
  }, 2000)
}

function handleRedetectSection(sectionId) {
  sectionLoading.value = sectionId
  setTimeout(() => { sectionLoading.value = null }, 1500)
}

function handleViewReport(item) {
  // TODO: 跳转或弹出 ethicality 完整报告
  console.log('View report for:', item.title)
}

function handleRetryEthicality(item) {
  // TODO: 重新触发检测
  console.log('Retry ethicality detection for:', item.id)
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
