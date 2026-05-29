function syncSelects(a, b) {
  const sa = document.getElementById(a);
  const sb = document.getElementById(b);
  if (!sa || !sb) return;

  const sync = (from, to) => {
    to.value = from.value;
  };

  sa.addEventListener('change', () => sync(sa, sb));
  sb.addEventListener('change', () => sync(sb, sa));
}

syncSelects('viewCount', 'viewCountBottom');

function bindPager(root) {
  const jump = root.querySelector('.jump-input');
  const go = root.querySelector('.go-btn');
  if (!jump || !go) return;

  go.addEventListener('click', () => {
    const val = String(jump.value || '').trim();
    if (!val) return;
    jump.value = val.replace(/\D+/g, '') || '1';
  });
}

document.querySelectorAll('.controls').forEach(bindPager);

(function initTitlePopover(){
  const icons = Array.from(document.querySelectorAll('.tiny-flag'));
  if (!icons.length) return;

  const popover = document.createElement('div');
  popover.className = 'title-popover';
  popover.innerHTML = `
    <div class="tp-section-head">
      <span class="tp-section-label">Title</span>
      <button class="tp-copy-btn" type="button" data-copy-target="title" aria-label="Copy title">
        <span class="material-icons">content_copy</span>
        <span class="tp-copy-feedback" aria-hidden="true"></span>
      </button>
    </div>
    <div class="tp-title"></div>
    <div class="tp-section-head tp-abstract-head">
      <span class="tp-section-label tp-abstract-label">Abstract</span>
      <button class="tp-copy-btn" type="button" data-copy-target="abstract" aria-label="Copy abstract">
        <span class="material-icons">content_copy</span>
        <span class="tp-copy-feedback" aria-hidden="true"></span>
      </button>
    </div>
    <div class="tp-abstract"></div>
    <div class="tp-line">
      <span class="tp-label">AI recommendation</span>
      <span class="tp-score"></span>
    </div>
  `;
  document.body.appendChild(popover);
  popover.style.display = 'none';
  popover.style.opacity = '0';

  let activeIcon = null;
  let showTimeout = null;
  let hideTimeout = null;
  const SHOW_DELAY = 200; // 悬停显示延迟
  const HIDE_DELAY = 300; // 离开隐藏延迟
  const ABSTRACT_MAX_LINES = 8;
  const COPY_FEEDBACK_DURATION = 1400;

  function scoreTier(score){
    if (score >= 90) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  }

  function clampTextToLines(element, fullText, lineCount){
    element.textContent = fullText;

    if (!fullText) {
      return;
    }

    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const maxHeight = Math.ceil(lineHeight * lineCount);

    if (!Number.isFinite(lineHeight) || element.scrollHeight <= maxHeight + 1) {
      return;
    }

    const hasWhitespace = /\s/.test(fullText);
    const units = hasWhitespace ? fullText.split(/\s+/) : Array.from(fullText);
    const joinText = (count) => hasWhitespace
      ? units.slice(0, count).join(' ')
      : units.slice(0, count).join('');

    let low = 0;
    let high = units.length;

    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      element.textContent = `${joinText(mid).trimEnd()}…`;

      if (element.scrollHeight <= maxHeight + 1) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }

    element.textContent = `${joinText(low).trimEnd()}…`;
  }

  function resetCopyFeedback(){
    popover.querySelectorAll('.tp-copy-btn').forEach((button) => {
      button.classList.remove('is-copied', 'is-failed');
      const feedbackEl = button.querySelector('.tp-copy-feedback');
      if (feedbackEl) {
        feedbackEl.textContent = '';
      }
      if (button._feedbackTimer) {
        clearTimeout(button._feedbackTimer);
        button._feedbackTimer = null;
      }
    });
  }

  async function copyText(text){
    if (!text) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // fallback below
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  }

  function showCopyFeedback(button, success){
    const feedbackEl = button.querySelector('.tp-copy-feedback');
    if (!feedbackEl) return;

    button.classList.remove('is-copied', 'is-failed');
    feedbackEl.textContent = success ? 'Copied' : 'Failed';
    button.classList.add(success ? 'is-copied' : 'is-failed');

    if (button._feedbackTimer) {
      clearTimeout(button._feedbackTimer);
    }

    button._feedbackTimer = setTimeout(() => {
      button.classList.remove('is-copied', 'is-failed');
      feedbackEl.textContent = '';
      button._feedbackTimer = null;
    }, COPY_FEEDBACK_DURATION);
  }

  function setContent(icon){
    const title = icon.dataset.title || 'This is the title of the manuscript.';
    const rawAbstract = (icon.dataset.abstract || '').trim();
    const score = icon.dataset.score;
    const numScore = score ? parseInt(score, 10) : null;
    
    const titleEl = popover.querySelector('.tp-title');
    titleEl.textContent = title;
    titleEl.dataset.fullText = title;

    const abstractHeadEl = popover.querySelector('.tp-abstract-head');
    const abstractEl = popover.querySelector('.tp-abstract');
    abstractEl.dataset.fullText = rawAbstract;

    if (rawAbstract) {
      abstractHeadEl.style.display = 'flex';
      abstractEl.style.display = 'block';
      abstractEl.textContent = rawAbstract;
    } else {
      abstractHeadEl.style.display = 'none';
      abstractEl.style.display = 'none';
      abstractEl.textContent = '';
    }

    resetCopyFeedback();
    
    const scoreEl = popover.querySelector('.tp-score');
    const line = popover.querySelector('.tp-line');

    if (Number.isInteger(numScore)){
      line.style.display = 'flex';
      scoreEl.textContent = `${numScore}`;
      scoreEl.className = `tp-score ${scoreTier(numScore)}`;
    } else {
      line.style.display = 'none';
      scoreEl.textContent = '';
      scoreEl.className = 'tp-score';
    }
  }

  function position(icon){
    const rect = icon.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 先放到可见以测量高度
    popover.style.visibility = 'hidden';
    popover.style.display = 'block';
    const popHeight = popover.offsetHeight;
    popover.style.display = activeIcon ? 'block' : 'none';
    popover.style.visibility = 'visible';

    const prefersTop = spaceBelow < popHeight + 12 && spaceAbove > spaceBelow;
    const top = prefersTop
      ? rect.top + window.scrollY - popHeight - 10
      : rect.bottom + window.scrollY + 8;
    const left = rect.left + window.scrollX - 6;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.classList.toggle('top', prefersTop);
    popover.classList.toggle('bottom', !prefersTop);
  }

  function closePopover(){
    if (activeIcon){
      activeIcon.classList.remove('is-active');
      activeIcon = null;
    }
    popover.style.opacity = '0';
    setTimeout(() => {
      if (!activeIcon) {
        popover.style.display = 'none';
      }
    }, 200);
  }

  function openPopover(icon){
    if (activeIcon === icon){
      return;
    }
    if (activeIcon){
      activeIcon.classList.remove('is-active');
    }
    activeIcon = icon;
    activeIcon.classList.add('is-active');
    setContent(icon);
    popover.style.display = 'block';
    popover.style.visibility = 'hidden';

    const abstractEl = popover.querySelector('.tp-abstract');
    if (abstractEl.style.display !== 'none') {
      clampTextToLines(abstractEl, abstractEl.dataset.fullText || '', ABSTRACT_MAX_LINES);
    }

    position(icon);
    popover.style.visibility = 'visible';
    // 触发重排以启用过渡效果
    popover.offsetHeight;
    popover.style.opacity = '1';
  }

  function clearAllTimeouts(){
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  icons.forEach((icon) => {
    if (!icon.dataset.title) {
      icon.dataset.title = 'This is the title of the manuscript.';
    }

    // 鼠标进入图标
    icon.addEventListener('mouseenter', () => {
      clearAllTimeouts();
      showTimeout = setTimeout(() => {
        openPopover(icon);
      }, SHOW_DELAY);
    });

    // 鼠标离开图标
    icon.addEventListener('mouseleave', () => {
      clearAllTimeouts();
      hideTimeout = setTimeout(() => {
        closePopover();
      }, HIDE_DELAY);
    });
  });

  // 鼠标进入浮窗
  popover.addEventListener('mouseenter', () => {
    clearAllTimeouts();
  });

  popover.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('.tp-copy-btn');
    if (!copyButton) return;

    event.stopPropagation();
    const copyTarget = copyButton.dataset.copyTarget;
    const text = copyTarget === 'abstract'
      ? (popover.querySelector('.tp-abstract').dataset.fullText || '')
      : (popover.querySelector('.tp-title').dataset.fullText || '');

    const copied = await copyText(text);
    showCopyFeedback(copyButton, copied);
  });

  // 鼠标离开浮窗
  popover.addEventListener('mouseleave', () => {
    clearAllTimeouts();
    hideTimeout = setTimeout(() => {
      closePopover();
    }, HIDE_DELAY);
  });

  window.addEventListener('scroll', () => {
    if (activeIcon) {
      closePopover();
    }
  }, true);
  
  window.addEventListener('resize', () => {
    if (activeIcon){
      const abstractEl = popover.querySelector('.tp-abstract');
      if (abstractEl.style.display !== 'none') {
        clampTextToLines(abstractEl, abstractEl.dataset.fullText || '', ABSTRACT_MAX_LINES);
      }
      position(activeIcon);
    }
  });
})();

// Score color tiers
function getScoreTier(score){
  if (score >= 90) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
}

// Apply color tiers to all score texts
function applyScoreColors(){
  const texts = document.querySelectorAll('.score-text');
  texts.forEach(text => {
    const score = parseInt(text.dataset.score, 10);
    if (!Number.isNaN(score)) {
      text.className = `score-text ${getScoreTier(score)}`;
    }
  });
}

// Table sorting functionality
function initTableSorting(){
  const table = document.querySelector('.table');
  const tbody = table.querySelector('tbody');
  const sortArrows = table.querySelectorAll('.sort-arrow');

  function sortTable(dir){
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const scoreA = parseInt(a.dataset.score, 10) || 0;
      const scoreB = parseInt(b.dataset.score, 10) || 0;
      return dir === 'ASC' ? scoreA - scoreB : scoreB - scoreA;
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  sortArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      const dir = arrow.dataset.sort;
      sortTable(dir);
      sortArrows.forEach(a => a.classList.remove('is-active'));
      arrow.classList.add('is-active');
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  applyScoreColors();
  initTableSorting();
});
