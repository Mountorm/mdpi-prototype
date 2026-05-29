// ===== DOM Elements =====
const msStateDisplay = document.getElementById('msStateDisplay');
const msStateEdit = document.getElementById('msStateEdit');
const msStateLinked = document.getElementById('msStateLinked');
const msEditInput = document.getElementById('msEditInput');
const msLinkedValue = document.getElementById('msLinkedValue');
const msLinkedManuscript = document.getElementById('msLinkedManuscript');
const msLinkBtn = document.getElementById('msLinkBtn');
const msRelinkBtn = document.getElementById('msRelinkBtn');
const msConfirmBtn = document.getElementById('msConfirmBtn');
const msCancelBtn = document.getElementById('msCancelBtn');

const ethicsLabel = document.getElementById('ethicsLabel');
const ethStateEdit = document.getElementById('ethStateEdit');
const ethStateLinked = document.getElementById('ethStateLinked');
const ethEditSelect = document.getElementById('ethEditSelect');
const ethLinkedValue = document.getElementById('ethLinkedValue');
const ethRelinkBtn = document.getElementById('ethRelinkBtn');
const ethConfirmBtn = document.getElementById('ethConfirmBtn');
const ethCancelBtn = document.getElementById('ethCancelBtn');

let currentMsId = 'acoustics-4208428';
let currentEthId = '';

// ===== Manuscript ID =====

function updateMsConfirmBtn() {
  const hasValue = msEditInput.value.trim();
  msConfirmBtn.style.opacity = hasValue ? '1' : '0.4';
  msConfirmBtn.style.pointerEvents = hasValue ? 'auto' : 'none';
}

msLinkBtn.addEventListener('click', () => {
  msEditInput.value = currentMsId;
  msStateDisplay.classList.add('hidden');
  msStateEdit.classList.remove('hidden');
  updateMsConfirmBtn();
  msEditInput.focus();
  msEditInput.select();
});

msRelinkBtn.addEventListener('click', () => {
  msEditInput.value = currentMsId;
  msStateLinked.classList.add('hidden');
  msStateEdit.classList.remove('hidden');
  updateMsConfirmBtn();
  msEditInput.focus();
  msEditInput.select();

  // 取消关联时，同时隐藏 ethics issue 区域
  currentEthId = '';
  ethEditSelect.value = '';
  ethicsLabel.classList.add('hidden');
  ethStateEdit.classList.add('hidden');
  ethStateLinked.classList.add('hidden');
});

msConfirmBtn.addEventListener('click', () => {
  const val = msEditInput.value.trim();
  if (!val) return;

  currentMsId = val;
  msLinkedValue.textContent = val;
  msLinkedManuscript.textContent = val;

  msStateEdit.classList.add('hidden');
  msStateLinked.classList.remove('hidden');

  showEthicsSection();
});

msCancelBtn.addEventListener('click', () => {
  msStateEdit.classList.add('hidden');
  if (msLinkedValue.textContent) {
    msStateLinked.classList.remove('hidden');
  } else {
    msStateDisplay.classList.remove('hidden');
  }
});

// 输入框为空时禁用对勾按钮
msEditInput.addEventListener('input', updateMsConfirmBtn);

msEditInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && msEditInput.value.trim()) msConfirmBtn.click();
  if (e.key === 'Escape') msCancelBtn.click();
});

// ===== Ethics Issue =====

function updateEthConfirmBtn() {
  const hasValue = ethEditSelect.value;
  ethConfirmBtn.style.opacity = hasValue ? '1' : '0.4';
  ethConfirmBtn.style.pointerEvents = hasValue ? 'auto' : 'none';
}

function showEthicsSection() {
  ethicsLabel.classList.remove('hidden');
  ethEditSelect.value = currentEthId;
  ethStateLinked.classList.add('hidden');
  ethStateEdit.classList.remove('hidden');

  // 首次出现时隐藏 cancel 按钮
  ethCancelBtn.classList.add('hidden');
  updateEthConfirmBtn();
  ethEditSelect.focus();
}

ethEditSelect.addEventListener('change', updateEthConfirmBtn);

ethRelinkBtn.addEventListener('click', () => {
  ethEditSelect.value = currentEthId;
  ethStateLinked.classList.add('hidden');
  ethStateEdit.classList.remove('hidden');
  // 编辑修改时显示 cancel 按钮
  ethCancelBtn.classList.remove('hidden');
  updateEthConfirmBtn();
  ethEditSelect.focus();
});

ethConfirmBtn.addEventListener('click', () => {
  const val = ethEditSelect.value;
  if (!val) return;

  currentEthId = val;
  ethLinkedValue.textContent = ethEditSelect.options[ethEditSelect.selectedIndex].text;

  ethStateEdit.classList.add('hidden');
  ethStateLinked.classList.remove('hidden');
});

ethCancelBtn.addEventListener('click', () => {
  ethStateEdit.classList.add('hidden');
  if (currentEthId) {
    ethStateLinked.classList.remove('hidden');
  }
});

ethEditSelect.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') ethConfirmBtn.click();
  if (e.key === 'Escape' && !ethCancelBtn.classList.contains('hidden')) ethCancelBtn.click();
});
