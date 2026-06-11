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
    model: 'qwen-max',
  },
};
// =========================================================

const $ = id => document.getElementById(id);
const btnStart = $('btnStart'), btnStop = $('btnStop'), btnClear = $('btnClear');
const btnCopyTranscript = $('btnCopyTranscript');
const btnGenerateReport = $('btnGenerateReport');
const btnCopyReport = $('btnCopyReport'), btnExportPdf = $('btnExportPdf');
const transcriptEl = $('transcriptEl'), charCountEl = $('charCount');
const findingsContent = $('findingsContent'), conclusionContent = $('conclusionContent');
const reportActions = $('reportActions'), reportBody = $('reportBody');
const waveWrap = $('waveWrap'), recStatus = $('recStatus');

let ws = null, audioContext = null, mediaStream = null;
let workletNode = null, processor = null, sendTimer = null;
let sessionId = null, canSendAudio = false, inputSampleRate = 16000, peakLevel = 0;
let sampleBuffer = new Int16Array(0);
let finalSegments = [], interim = null, currentReport = null;
// streamAnchor：ASR 自动追加起始位置，[0, streamAnchor) 为用户可编辑的已确认内容
let streamAnchor = 0;

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const REPORT_SYSTEM_PROMPT = `你是一名专业兽医影像科医生。根据以下超声扫查转录内容，生成报告。
严格只输出如下 JSON，不要任何多余文字：
{
  "organs": [
    {"name": "器官名称", "findings": "所见描述", "is_normal": true或false}
  ],
  "conclusion": "综合结论，正常器官注明未见明显异常，异常器官列出发现"
}`;

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
}

function clearTranscript() {
  transcriptEl.value = '';
  streamAnchor = 0;
  finalSegments = [];
  interim = null;
  updateCharCount();
}

async function copyAllTranscript() {
  const text = transcriptEl.value;
  if (!text) { alert('暂无内容可复制'); return; }
  try {
    await navigator.clipboard.writeText(text);
    const orig = btnCopyTranscript.textContent;
    btnCopyTranscript.textContent = '已复制';
    setTimeout(() => { btnCopyTranscript.textContent = orig; }, 1500);
  } catch (e) {
    transcriptEl.focus();
    transcriptEl.select();
    document.execCommand('copy');
  }
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

function reportToPlainText(report) {
  const lines = ['超声所见', ''];
  (report.organs || []).forEach(o => {
    lines.push((o.name || '') + '：' + (o.findings || ''));
  });
  lines.push('', '结论', report.conclusion || '');
  return lines.join('\n');
}

function renderReport(report) {
  currentReport = report;
  findingsContent.innerHTML = '';
  (report.organs || []).forEach(organ => {
    const normal = isOrganNormal(organ.is_normal);
    const line = document.createElement('div');
    line.className = 'organ-line ' + (normal ? 'normal' : 'abnormal');
    line.innerHTML = '<span class="organ-name">' + escapeHtml(organ.name || '') + '：</span>' +
      escapeHtml(organ.findings || '');
    findingsContent.appendChild(line);
  });
  conclusionContent.textContent = report.conclusion || '';
  reportActions.classList.add('visible');
}

function showReportError(msg) {
  currentReport = null;
  findingsContent.innerHTML = '<div class="report-error">' + escapeHtml(msg) + '</div>';
  conclusionContent.textContent = '';
  reportActions.classList.remove('visible');
}

async function generateReport() {
  const apiKey = CONFIG.qwen.apiKey.trim();
  if (!apiKey) { alert('请在代码 CONFIG.qwen.apiKey 中填写通义 API Key'); return; }
  const transcript = getFullTranscript();
  if (!transcript) { alert('暂无转录内容，请先完成录音'); return; }

  btnGenerateReport.disabled = true;
  btnGenerateReport.textContent = '生成中…';
  showReportLoading();

  try {
    const res = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: CONFIG.qwen.model,
        messages: [
          { role: 'system', content: REPORT_SYSTEM_PROMPT },
          { role: 'user', content: '以下是超声扫查转录内容：\n\n' + transcript },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || data.message || JSON.stringify(data));
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('API 返回内容为空');
    const report = parseReportJson(content);
    if (!report.organs || !Array.isArray(report.organs)) throw new Error('JSON 格式不完整');
    renderReport(report);
  } catch (e) {
    showReportError('生成失败：' + e.message);
  } finally {
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
  } catch (e) { alert('复制失败：' + e.message); }
}

function exportReportPdf() {
  if (!currentReport) return;
  const wrap = document.createElement('div');
  wrap.id = 'reportPdfTarget';
  wrap.innerHTML =
    '<div style="font-size:18px;font-weight:700;margin-bottom:16px">兽医超声报告</div>' +
    '<div style="font-size:14px;font-weight:700;color:#374151;margin-bottom:8px">超声所见</div>' +
    findingsContent.innerHTML +
    '<div style="font-size:14px;font-weight:700;color:#374151;margin:16px 0 8px">结论</div>' +
    '<div style="font-size:16px;line-height:1.8">' + escapeHtml(currentReport.conclusion || '') + '</div>';
  document.body.appendChild(wrap);

  btnExportPdf.disabled = true;
  const orig = btnExportPdf.textContent;
  btnExportPdf.textContent = '导出中…';
  const filename = '超声报告_' + new Date().toISOString().slice(0, 10) + '.pdf';

  html2pdf().set({
    margin: [12, 12, 12, 12], filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(wrap).save().catch(e => alert('PDF 导出失败：' + e.message))
    .finally(() => {
      wrap.remove();
      btnExportPdf.disabled = false;
      btnExportPdf.textContent = orig;
    });
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
    alert('请在代码 CONFIG.xunfei 中填写讯飞鉴权信息'); return;
  }
  btnStart.disabled = true; interim = null; canSendAudio = false;
  sessionId = crypto.randomUUID(); sampleBuffer = new Int16Array(0); peakLevel = 0;
  resetReportPanel();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: true }
    });
  } catch(e) { alert('获取麦克风失败：' + e.message); btnStart.disabled = false; return; }

  try { await setupAudioCapture(); }
  catch(e) { alert('音频初始化失败：' + e.message); btnStart.disabled = false; return; }

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
  ws.onerror = () => alert('WebSocket 连接失败，请检查鉴权配置');
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

btnStart.onclick = startRecording;
btnStop.onclick = stopRecording;
btnGenerateReport.onclick = generateReport;
btnCopyReport.onclick = copyReportText;
btnExportPdf.onclick = exportReportPdf;
btnClear.onclick = () => {
  finalSegments = []; interim = null;
  renderResult(); resetReportPanel();
};
