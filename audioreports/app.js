// ============ API 配置区（需要修改时在此处编辑）============
const CONFIG = {
  // 讯飞实时语音转写
  xunfei: {
    appId: '5e2ad135',
    accessKeyId: '47541c947b9f9ed862ae6405606e59e1',
    apiSecret: 'NDg2MTk0NjU4YTY5NTJjYjA5YjFkOTU3',
  },
  // 通义千问
  qwen: {
    apiKey: 'sk-bfd1e89a6aef49db8066be4def8422bb',
    model: 'qwen3.7-max',
  },
};
// =========================================================

const $ = id => document.getElementById(id);

// ---- 自定义 Modal（替代 alert） ----
const modalOverlay = document.getElementById('modalOverlay');
const modalMsg     = document.getElementById('modalMsg');
const modalOkBtn   = document.getElementById('modalOk');
function showAlert(msg) {
  modalMsg.textContent = msg;
  modalOverlay.classList.add('visible');
  modalOkBtn.focus();
}
modalOkBtn.onclick = () => modalOverlay.classList.remove('visible');
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (historyOverlay.classList.contains('visible')) { closeHistoryPanel(); return; }
    modalOverlay.classList.remove('visible');
  }
});

const btnStart = $('btnStart'), btnStop = $('btnStop'), btnClear = $('btnClear');
const btnGenerateReport = $('btnGenerateReport');
const btnCopyReport = $('btnCopyReport');
const transcriptEl = $('transcriptEl'), charCountEl = $('charCount');
const findingsContent = $('findingsContent'), conclusionContent = $('conclusionContent');
const reportActions = $('reportActions'), reportBody = $('reportBody');
const waveWrap = $('waveWrap'), recStatus = $('recStatus');
const btnDog = $('btnDog'), btnCat = $('btnCat');
const sexToggle = $('sexToggle');
const examTypeChips = $('examTypeChips'), subOrganSelect = $('subOrganSelect');
const btnHistory = $('btnHistory'), btnHistoryClose = $('btnHistoryClose');
const historyOverlay = $('historyOverlay'), historyPanel = $('historyPanel');
const historyList = $('historyList'), historyCountEl = $('historyCount');
const btnExportHistory = $('btnExportHistory'), btnClearHistory = $('btnClearHistory');

const DB_NAME = 'ultrasound-assistant';
const DB_VERSION = 1;
const STORE_NAME = 'reports';
const MAX_HISTORY = 500;

let ws = null, audioContext = null, mediaStream = null;
let workletNode = null, processor = null, sendTimer = null;
let sessionId = null, canSendAudio = false, inputSampleRate = 16000, peakLevel = 0;
let sampleBuffer = new Int16Array(0);
let finalSegments = [], interim = null, currentReport = null;
let streamAnchor = 0;
let selectedSpecies = '犬';
let selectedSex = '雄性';
let activeHistoryId = null;
const activeExamTypes = new Set();
let autoDetected = new Set();

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

function setSelectedSex(sex) {
  selectedSex = sex;
  sexToggle.querySelectorAll('.sex-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sex === sex);
  });
}

function applyExamState(species, sex, examTypes, subOrgans) {
  selectedSpecies = species;
  btnDog.classList.toggle('active', species === '犬');
  btnCat.classList.toggle('active', species === '猫');
  setSelectedSex(sex);
  activeExamTypes.clear();
  autoDetected.clear();
  (examTypes || []).forEach(t => activeExamTypes.add(t));
  Array.from(subOrganSelect.options).forEach(o => {
    o.selected = (subOrgans || []).includes(o.value);
  });
  refreshChipUI();
}

function resetTranscriptState(text) {
  transcriptEl.value = text || '';
  streamAnchor = transcriptEl.value.length;
  finalSegments = [];
  interim = null;
  updateCharCount();
}

// ---------- IndexedDB 历史记录 ----------
function openHistoryDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHistoryRecord(record) {
  const db = await openHistoryDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  await trimHistoryRecords();
}

async function listHistoryRecords(limit = MAX_HISTORY) {
  const db = await openHistoryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('createdAt');
    const req = index.openCursor(null, 'prev');
    const results = [];
    req.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

async function deleteHistoryRecord(id) {
  const db = await openHistoryDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllHistoryRecords() {
  const db = await openHistoryDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function trimHistoryRecords() {
  const all = await listHistoryRecords(MAX_HISTORY + 50);
  if (all.length <= MAX_HISTORY) return;
  for (const item of all.slice(MAX_HISTORY)) await deleteHistoryRecord(item.id);
}

function formatHistoryTime(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatHistorySummary(item) {
  const types = (item.examTypes || []).filter(t => t !== '单腔')
    .map(t => EXAM_TYPE_DEFS[t]?.label || t).join('·');
  let label = `${item.species} · ${item.sex}`;
  if (types) label += ` · ${types}`;
  if (item.subOrgans?.length) label += ` · 单腔(${item.subOrgans.join('/')})`;
  return label;
}

function buildHistoryRecord(transcript, report) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    species: selectedSpecies,
    sex: selectedSex,
    examTypes: Array.from(activeExamTypes),
    subOrgans: Array.from(subOrganSelect.selectedOptions).map(o => o.value),
    transcript,
    report,
    model: CONFIG.qwen.model,
  };
}

async function persistCurrentReport(transcript, report) {
  try {
    const record = buildHistoryRecord(transcript, report);
    await saveHistoryRecord(record);
    activeHistoryId = record.id;
    await refreshHistoryUI();
  } catch (e) {
    console.warn('历史记录保存失败', e);
  }
}

function restoreHistoryRecord(record) {
  applyExamState(record.species, record.sex, record.examTypes, record.subOrgans);
  resetTranscriptState(record.transcript);
  renderReport(record.report);
  activeHistoryId = record.id;
  refreshHistoryList();
  closeHistoryPanel();
}

async function refreshHistoryUI() {
  const records = await listHistoryRecords();
  historyCountEl.textContent = records.length;
  historyCountEl.classList.toggle('visible', records.length > 0);
  if (historyOverlay.classList.contains('visible')) refreshHistoryList(records);
}

function refreshHistoryList(cachedRecords) {
  const render = records => {
    if (!records.length) {
      historyList.innerHTML = '<li class="history-empty">暂无历史记录<br>生成报告后将自动保存</li>';
      return;
    }
    historyList.innerHTML = records.map(item => {
      const preview = (item.transcript || '').replace(/\s+/g, ' ').slice(0, 80);
      const active = item.id === activeHistoryId ? ' active' : '';
      return `<li class="history-item${active}" data-id="${escapeHtml(item.id)}">
        <div class="history-item-time">${escapeHtml(formatHistoryTime(item.createdAt))}</div>
        <div class="history-item-summary">${escapeHtml(formatHistorySummary(item))}</div>
        <div class="history-item-preview">${escapeHtml(preview || '（无转录）')}</div>
        <div class="history-item-actions">
          <button type="button" class="history-restore">恢复</button>
          <button type="button" class="history-delete">删除</button>
        </div>
      </li>`;
    }).join('');
  };
  if (cachedRecords) { render(cachedRecords); return; }
  listHistoryRecords().then(render).catch(() => {
    historyList.innerHTML = '<li class="history-empty">读取历史记录失败</li>';
  });
}

function openHistoryPanel() {
  historyOverlay.classList.add('visible');
  refreshHistoryList();
}

function closeHistoryPanel() {
  historyOverlay.classList.remove('visible');
}

async function exportAllHistory() {
  const records = await listHistoryRecords();
  if (!records.length) { showAlert('暂无历史记录可导出'); return; }
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `超声报告历史_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function onHistoryListClick(e) {
  const itemEl = e.target.closest('.history-item');
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (e.target.classList.contains('history-delete')) {
    e.stopPropagation();
    if (!confirm('确定删除这条历史记录？')) return;
    await deleteHistoryRecord(id);
    if (activeHistoryId === id) activeHistoryId = null;
    await refreshHistoryUI();
    return;
  }
  if (!e.target.classList.contains('history-restore') && e.target.closest('.history-item-actions')) return;
  const records = await listHistoryRecords();
  const record = records.find(r => r.id === id);
  if (record) restoreHistoryRecord(record);
}

// ---- 初始化芯片 & 单腔下拉 ----
(function initExamSelectors() {
  EXAM_TYPES.forEach(t => {
    const chip = document.createElement('button');
    chip.className = 'exam-chip';
    chip.dataset.value = t.value;
    chip.textContent = t.label;
    chip.onclick = () => toggleChip(t.value, true);
    examTypeChips.appendChild(chip);
  });
  SINGLE_ORGANS.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    subOrganSelect.appendChild(opt);
  });
})();

function toggleChip(value, byUser) {
  if (activeExamTypes.has(value)) {
    activeExamTypes.delete(value);
    if (byUser) autoDetected.delete(value);
  } else {
    activeExamTypes.add(value);
  }
  refreshChipUI();
}

function refreshChipUI() {
  examTypeChips.querySelectorAll('.exam-chip').forEach(chip => {
    const v = chip.dataset.value;
    const isActive = activeExamTypes.has(v);
    const isAuto = autoDetected.has(v);
    chip.classList.toggle('active', isActive);
    chip.classList.toggle('auto-detected', isAuto && !isActive);
  });
  // 单腔下拉显隐
  const hasSingle = activeExamTypes.has('单腔');
  subOrganSelect.style.display = hasSingle ? 'inline-block' : 'none';
  if (!hasSingle) Array.from(subOrganSelect.options).forEach(o => { o.selected = false; });
}

// 从转录内容自动检测并更新物种、性别、检查类型
function autoDetectFromTranscript(text) {
  // 物种
  const species = detectSpecies(text);
  if (species && species !== selectedSpecies) {
    selectedSpecies = species;
    btnDog.classList.toggle('active', species === '犬');
    btnCat.classList.toggle('active', species === '猫');
  }

  // 性别
  const gender = detectGender(text);
  if (gender && gender !== selectedSex) setSelectedSex(gender);

  // 检查类型芯片：与当前文本完整同步（增/减）
  const nowDetected = new Set(detectExamTypes(text));
  let changed = false;

  // 之前自动激活、但文本里已不存在 → 移除
  for (const t of autoDetected) {
    if (!nowDetected.has(t)) {
      autoDetected.delete(t);
      activeExamTypes.delete(t);
      changed = true;
    }
  }

  // 文本里新出现的 → 激活
  for (const t of nowDetected) {
    if (!autoDetected.has(t)) { autoDetected.add(t); changed = true; }
    if (!activeExamTypes.has(t)) { activeExamTypes.add(t); changed = true; }
  }

  if (changed) refreshChipUI();
}

btnDog.onclick = () => {
  selectedSpecies = '犬';
  btnDog.classList.add('active'); btnCat.classList.remove('active');
};
btnCat.onclick = () => {
  selectedSpecies = '猫';
  btnCat.classList.add('active'); btnDog.classList.remove('active');
};
sexToggle.querySelectorAll('.sex-btn').forEach(btn => {
  btn.onclick = () => setSelectedSex(btn.dataset.sex);
});

function setRecording(active) {
  waveWrap.classList.toggle('active', active);
  recStatus.textContent = active ? '录音中' : '';
}

// ---------- 转录编辑区 ----------
function buildMachineTail() {
  let tail = finalSegments.map(s => s.text).join('');
  if (interim?.text) tail += interim.text;
  return tail;
}

function updateCharCount() {
  const n = transcriptEl.value.length;
  charCountEl.textContent = n + ' 字';
}

function syncTranscriptFromASR() {
  const prefix = transcriptEl.value.slice(0, streamAnchor);
  const tail = buildMachineTail();
  const atEnd = transcriptEl.selectionStart === transcriptEl.value.length &&
    transcriptEl.selectionEnd === transcriptEl.value.length;
  transcriptEl.value = prefix + tail;
  updateCharCount();
  if (atEnd) {
    transcriptEl.selectionStart = transcriptEl.selectionEnd = transcriptEl.value.length;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }
  autoDetectFromTranscript(transcriptEl.value);
}

function onTranscriptInput() {
  const val = transcriptEl.value;
  const tail = buildMachineTail();
  const expected = val.slice(0, streamAnchor) + tail;
  // 用户修改了内容（含中间编辑或尾部改写），将全文视为用户基准，重置 ASR 流状态
  if (val !== expected) {
    streamAnchor = val.length;
    finalSegments = [];
    interim = null;
  }
  updateCharCount();
  autoDetectFromTranscript(val);
}

function clearTranscript() {
  transcriptEl.value = '';
  streamAnchor = 0;
  finalSegments = [];
  interim = null;
  updateCharCount();
}

function getFullTranscript() {
  return transcriptEl.value.trim();
}

function renderResult() {
  syncTranscriptFromASR();
}

function resetReportPanel() {
  currentReport = null;
  reportActions.classList.remove('visible');
  findingsContent.innerHTML = '<div class="report-placeholder">转录完成后点击生成报告</div>';
  conclusionContent.textContent = '';
}

function showReportLoading() {
  currentReport = null;
  reportActions.classList.remove('visible');
  findingsContent.innerHTML =
    '<div class="report-loading"><div class="spinner"></div><span>正在生成报告，请稍候……</span></div>';
  conclusionContent.textContent = '';
}

function isOrganNormal(val) {
  if (val === true || val === 1) return true;
  if (val === false || val === 0) return false;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'true' || s === '是' || s === '正常') return true;
    if (s === 'false' || s === '否' || s === '异常') return false;
  }
  return !!val;
}

function parseReportJson(raw) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf('{'), end = text.lastIndexOf('}');
  if (start >= 0 && end > start) text = text.slice(start, end + 1);
  return JSON.parse(text);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const LYMPH_ORGAN_NAMES = new Set(['腹腔淋巴结', '肠道淋巴结', '髂内淋巴结', '下颌淋巴结', '内侧咽后淋巴结']);

// AI 有时返回非标准名（如"双肾"），映射回标准名
const ORGAN_NAME_ALIASES = {
  '双肾': '肾脏', '左肾': '肾脏', '右肾': '肾脏',
  '双侧肾脏': '肾脏', '肾': '肾脏',
  '双侧睾丸': '睾丸', '双侧卵巢': '卵巢', '双侧子宫': '子宫',
  '双侧肾上腺': '肾上腺',
};

function normalizeOrganName(name) {
  return ORGAN_NAME_ALIASES[name] || name;
}

function ensurePeriod(s) {
  if (!s) return s;
  const trimmed = s.trimEnd();
  const last = trimmed.slice(-1);
  if (!'。！？'.includes(last)) return trimmed + '。';
  return trimmed;
}

function buildConclusionItems(report, sortedOrgans) {
  const abnormal = Array.isArray(report.conclusion)
    ? report.conclusion.filter(Boolean).map(ensurePeriod)
    : (report.conclusion ? [ensurePeriod(report.conclusion)] : []);
  const normalOrgans = sortedOrgans.filter(o => isOrganNormal(o.is_normal));
  const normalRegular = normalOrgans.filter(o => !LYMPH_ORGAN_NAMES.has(normalizeOrganName(o.name))).map(o => normalizeOrganName(o.name));
  const normalLymph = normalOrgans.filter(o => LYMPH_ORGAN_NAMES.has(normalizeOrganName(o.name))).map(o => normalizeOrganName(o.name));
  const items = [...abnormal];
  if (normalRegular.length > 0) items.push(normalRegular.join('、') + '形态未见明显异常。');
  if (normalLymph.length > 0) items.push(normalLymph.join('、') + '未见明显增大。');
  return items;
}

function reportToPlainText(report) {
  const lines = ['超声所见', '', selectedSpecies + '仰卧位扫查：'];
  const sortedOrgans = sortOrgans(report.organs || []);
  sortedOrgans.forEach((o, i) => {
    lines.push(`${i + 1}. ${ensurePeriod(o.findings || '')}`);
  });
  lines.push('', '结论', '');
  buildConclusionItems(report, sortedOrgans).forEach((item, i) => {
    lines.push(`${i + 1}. ${item}`);
  });
  return lines.join('\n');
}

function sortOrgans(organs) {
  return [...organs].sort((a, b) => {
    const ai = ORGAN_ORDER.indexOf(normalizeOrganName(a.name));
    const bi = ORGAN_ORDER.indexOf(normalizeOrganName(b.name));
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    return av - bv;
  });
}

function renderReport(report) {
  currentReport = report;
  findingsContent.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'scan-header';
  header.textContent = selectedSpecies + '仰卧位扫查：';
  findingsContent.appendChild(header);
  const organs = sortOrgans(report.organs || []);
  organs.forEach((organ, idx) => {
    const normal = isOrganNormal(organ.is_normal);
    const line = document.createElement('div');
    line.className = 'organ-line ' + (normal ? 'normal' : 'abnormal');
    line.innerHTML = `<span class="organ-num">${idx + 1}. </span>` + escapeHtml(ensurePeriod(organ.findings || ''));
    findingsContent.appendChild(line);
  });
  const conclusionItems = buildConclusionItems(report, organs);
  conclusionContent.innerHTML = conclusionItems.length
    ? conclusionItems.map((item, i) => `${i + 1}. ${escapeHtml(item)}`).join('<br>')
    : '';
  reportActions.classList.add('visible');
}

function showReportError(msg) {
  currentReport = null;
  findingsContent.innerHTML = '<div class="report-error">' + escapeHtml(msg) + '</div>';
  conclusionContent.textContent = '';
  reportActions.classList.remove('visible');
}

let isGeneratingReport = false;

async function generateReport() {
  if (isGeneratingReport) return;
  const apiKey = CONFIG.qwen.apiKey.trim();
  if (!apiKey) { showAlert('请在代码 CONFIG.qwen.apiKey 中填写通义 API Key'); return; }
  const transcript = getFullTranscript();
  if (!transcript) { showAlert('暂无转录内容，请先完成录音'); return; }

  const types = Array.from(activeExamTypes);
  const subOrgans = Array.from(subOrganSelect.selectedOptions).map(o => o.value);
  if (types.length === 0) { showAlert('请先选择检查类型（或在转录中口述检查类型名称）'); return; }
  if (types.includes('单腔') && subOrgans.length === 0) { showAlert('单腔检查请选择器官'); return; }

  const basePrompt = buildSystemPrompt(types, selectedSpecies, selectedSex, subOrgans);
  if (!basePrompt) { showAlert('该检查类型暂无提示词，请联系开发'); return; }
  const matchedRules = detectDiseaseRules(transcript, selectedSpecies, selectedSex);
  const systemPrompt = appendDiseaseRules(basePrompt, matchedRules);

  isGeneratingReport = true;
  btnGenerateReport.disabled = true;
  btnGenerateReport.textContent = '生成中…';
  showReportLoading();

  try {
    const payload = {
        model: CONFIG.qwen.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '以下是超声扫查口述转录内容：\n\n' + transcript },
        ],
      };
    if (CONFIG.qwen.model.startsWith('qwen3.7')) payload.enable_thinking = false;
    const res = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || data.message || JSON.stringify(data));
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('API 返回内容为空');
    const report = parseReportJson(content);
    if (!report.organs || !Array.isArray(report.organs)) throw new Error('JSON 格式不完整');
    renderReport(report);
    await persistCurrentReport(transcript, report);
  } catch (e) {
    showReportError('生成失败：' + e.message);
  } finally {
    isGeneratingReport = false;
    btnGenerateReport.disabled = false;
    btnGenerateReport.textContent = '生成报告';
  }
}

async function copyReportText() {
  if (!currentReport) return;
  try {
    await navigator.clipboard.writeText(reportToPlainText(currentReport));
    const orig = btnCopyReport.textContent;
    btnCopyReport.textContent = '已复制';
    setTimeout(() => { btnCopyReport.textContent = orig; }, 1500);
  } catch (e) { showAlert('复制失败：' + e.message); }
}

// ---------- 讯飞鉴权 ----------
function urlEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase());
}
function buildUtc() {
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset(), sign = off >= 0 ? '+' : '-', abs = Math.abs(off);
  const tz = sign + pad(Math.floor(abs / 60)) + pad(abs % 60);
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + tz;
}
function randomHex(len) {
  const b = new Uint8Array(len / 2);
  crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}
function buildUrl(appId, accessKeyId, apiSecret) {
  const utc = buildUtc(), uuid = randomHex(32);
  const params = { accessKeyId, appId, audio_encode: 'pcm_s16le', lang: 'autodialect',
    pd: 'medical', role_type: '2', samplerate: '16000', utc, uuid };
  const baseString = Object.keys(params).sort().map(k =>
    urlEncode(k) + '=' + urlEncode(params[k])).join('&');
  const signature = CryptoJS.HmacSHA1(baseString, apiSecret).toString(CryptoJS.enc.Base64);
  return 'wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1?' +
    Object.keys(params).sort().map(k => urlEncode(k) + '=' + urlEncode(params[k])).join('&') +
    '&signature=' + urlEncode(signature);
}

// ---------- 讯飞结果解析 ----------
function parseResultPayload(msg) {
  let data = (msg.data !== undefined && msg.data !== null) ? msg.data : msg;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e) { return null; } }
  if (!data || typeof data !== 'object') return null;
  if (data.cn?.st) return data.cn.st;
  if (data.data?.cn?.st) return data.data.cn.st;
  return null;
}
function extractStText(st) {
  let text = '', role = '0';
  (st.rt || []).forEach(rt => (rt.ws || []).forEach(w => (w.cw || []).forEach(cw => {
    text += cw.w || '';
    if (cw.rl !== undefined && cw.rl !== 0 && cw.rl !== '0') role = String(cw.rl);
  })));
  return { text, role };
}
function applyTranscript(st) {
  const { text, role } = extractStText(st);
  if (!text) return false;
  if (st.type === 0 || st.type === '0') {
    const last = finalSegments[finalSegments.length - 1];
    if (last && last.role === role) last.text += text;
    else finalSegments.push({ role, text });
    interim = null;
  } else {
    interim = { role, text };
  }
  renderResult();
  return true;
}
function onHandshakeOk(extra) {
  sessionId = (extra && (extra.sessionId || extra.sid)) || sessionId;
  if (!canSendAudio) { canSendAudio = true; setRecording(true); }
  if (!sendTimer) startSendLoop();
}
function handleMessage(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch(e) { return; }
  if (msg.action === 'started' || msg.msg_type === 'started') { onHandshakeOk(msg); return; }
  if (msg.msg_type === 'action') {
    let d = msg.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e) { d = null; } }
    if (d?.action === 'started') { onHandshakeOk(d); return; }
  }
  if (msg.action === 'error') { stopRecording(); return; }
  const isAsr = msg.action === 'result' ||
    (msg.msg_type === 'result' && (!msg.res_type || msg.res_type === 'asr'));
  if (isAsr) {
    const st = parseResultPayload(msg);
    if (st) applyTranscript(st);
  }
}

// ---------- 音频处理 ----------
function downsampleTo16k(float32Data, inputRate) {
  if (inputRate === 16000) return floatTo16(float32Data);
  const ratio = inputRate / 16000, outLen = Math.floor(float32Data.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const s = Math.floor(i * ratio), e = Math.min(Math.floor((i+1)*ratio), float32Data.length);
    let sum = 0; for (let j = s; j < e; j++) sum += float32Data[j];
    out[i] = Math.max(-32768, Math.min(32767, Math.round(sum/(e-s||1)*32767)));
  }
  return out;
}
function floatTo16(f) {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) out[i] = Math.max(-32768, Math.min(32767, Math.round(f[i]*32767)));
  return out;
}
function onAudioFrame(input) {
  for (let i = 0; i < input.length; i++) peakLevel = Math.max(peakLevel, Math.abs(input[i]));
  if (canSendAudio) appendSamples(downsampleTo16k(input, inputSampleRate));
}
function appendSamples(samples) {
  const m = new Int16Array(sampleBuffer.length + samples.length);
  m.set(sampleBuffer); m.set(samples, sampleBuffer.length); sampleBuffer = m;
}
async function setupAudioCapture() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  await audioContext.resume();
  inputSampleRate = audioContext.sampleRate;
  const source = audioContext.createMediaStreamSource(mediaStream);
  const silent = audioContext.createGain();
  silent.gain.value = 0; silent.connect(audioContext.destination);
  if (audioContext.audioWorklet) {
    try {
      const code = `class P extends AudioWorkletProcessor{process(i){const c=i[0]?.[0];if(c?.length)this.port.postMessage(c.slice(0));return true}}registerProcessor('p',P)`;
      const url = URL.createObjectURL(new Blob([code], {type:'application/javascript'}));
      await audioContext.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      workletNode = new AudioWorkletNode(audioContext, 'p');
      workletNode.port.onmessage = e => onAudioFrame(e.data);
      source.connect(workletNode); workletNode.connect(silent);
      return;
    } catch(e) {}
  }
  processor = audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = e => onAudioFrame(e.inputBuffer.getChannelData(0));
  source.connect(processor); processor.connect(silent);
}
function sendPcmChunk(chunk) {
  ws.send(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength));
}
function startSendLoop() {
  if (sendTimer) return;
  sendTimer = setInterval(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !canSendAudio) return;
    while (sampleBuffer.length >= 640) {
      const c = sampleBuffer.slice(0, 640);
      sampleBuffer = sampleBuffer.slice(640);
      sendPcmChunk(c);
    }
  }, 40);
}

// ---------- 录音控制 ----------
async function startRecording() {
  const appId = CONFIG.xunfei.appId.trim();
  const accessKeyId = CONFIG.xunfei.accessKeyId.trim();
  const apiSecret = CONFIG.xunfei.apiSecret.trim();
  if (!appId || !accessKeyId || !apiSecret) {
    showAlert('请在代码 CONFIG.xunfei 中填写讯飞鉴权信息'); return;
  }
  btnStart.disabled = true; interim = null; canSendAudio = false;
  sessionId = crypto.randomUUID(); sampleBuffer = new Int16Array(0); peakLevel = 0;
  resetReportPanel();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true }
    });
  } catch(e) { showAlert('获取麦克风失败：' + e.message); btnStart.disabled = false; return; }

  try { await setupAudioCapture(); }
  catch(e) { showAlert('音频初始化失败：' + e.message); btnStart.disabled = false; return; }

  ws = new WebSocket(buildUrl(appId, accessKeyId, apiSecret));
  ws.onmessage = e => { if (typeof e.data === 'string') handleMessage(e.data); };
  ws.onopen = () => {
    btnStop.disabled = false;
    setTimeout(() => {
      if (!canSendAudio && ws?.readyState === WebSocket.OPEN) {
        canSendAudio = true; setRecording(true); startSendLoop();
      }
    }, 2000);
  };
  ws.onerror = () => showAlert('WebSocket 连接失败，请检查鉴权配置');
  ws.onclose = () => {
    setRecording(false); cleanupAudio();
    btnStart.disabled = false; btnStop.disabled = true;
  };
}

function stopRecording() {
  btnStop.disabled = true; setRecording(false);
  if (sendTimer) { clearInterval(sendTimer); sendTimer = null; }
  if (ws?.readyState === WebSocket.OPEN) {
    if (sampleBuffer.length > 0) { sendPcmChunk(sampleBuffer); sampleBuffer = new Int16Array(0); }
    ws.send(JSON.stringify({ end: true, sessionId }));
  }
  cleanupAudio();
}

function cleanupAudio() {
  canSendAudio = false;
  if (sendTimer) { clearInterval(sendTimer); sendTimer = null; }
  if (workletNode) { workletNode.disconnect(); workletNode = null; }
  if (processor) { processor.disconnect(); processor = null; }
  if (audioContext) { audioContext.close(); audioContext = null; }
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  sampleBuffer = new Int16Array(0);
}

function onGenerateReportShortcut(e) {
  if (!e.ctrlKey || e.key !== 'Enter' || e.shiftKey || e.altKey) return;
  if (modalOverlay.classList.contains('visible')) return;
  if (historyOverlay.classList.contains('visible')) return;
  if (isGeneratingReport) return;
  e.preventDefault();
  generateReport();
}

btnHistory.onclick = openHistoryPanel;
btnHistoryClose.onclick = closeHistoryPanel;
historyOverlay.addEventListener('click', e => {
  if (e.target === historyOverlay) closeHistoryPanel();
});
historyPanel.addEventListener('click', e => e.stopPropagation());
historyList.addEventListener('click', onHistoryListClick);
btnExportHistory.onclick = exportAllHistory;
btnClearHistory.onclick = async () => {
  const records = await listHistoryRecords();
  if (!records.length) { showAlert('暂无历史记录'); return; }
  if (!confirm(`确定清空全部 ${records.length} 条历史记录？此操作不可恢复。`)) return;
  await clearAllHistoryRecords();
  activeHistoryId = null;
  await refreshHistoryUI();
};
refreshHistoryUI();

btnStart.onclick = startRecording;
btnStop.onclick = stopRecording;
btnGenerateReport.onclick = generateReport;
document.addEventListener('keydown', onGenerateReportShortcut);
btnCopyReport.onclick = copyReportText;
transcriptEl.oninput = onTranscriptInput;
btnClear.onclick = () => {
  clearTranscript(); resetReportPanel();
  activeExamTypes.clear(); autoDetected.clear(); refreshChipUI();
  activeHistoryId = null;
};
