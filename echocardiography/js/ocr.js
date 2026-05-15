// OCR：粘贴/拖拽/选择图片 → 识别参数 → 自动回填
function setupOCR() {
    // 避免重复绑定
    if (window.__echoOcrInitialized) return;
    window.__echoOcrInitialized = true;

    const ocrStatus = document.getElementById('ocrStatus');

    const canUseTesseract = typeof window.Tesseract !== 'undefined';
if (!canUseTesseract) {
        if (ocrStatus) ocrStatus.textContent = 'OCR库未加载（请检查网络/CDN）';
        return;
    }

    function setBusy(isBusy) {
        // 仅用于更新状态文案，不再控制按钮样式
        if (isBusy && ocrStatus) {
            ocrStatus.textContent = 'OCR识别中…';
        }
    }

    function setStatus(text) {
        if (ocrStatus) ocrStatus.textContent = text || '';
    }

    // #region OCR预热：加速首次识别（避免冷启动模型/worker初始化）
    let __ocrWarmPromise = null;
    function prewarmOcrEngine() {
        if (__ocrWarmPromise) return __ocrWarmPromise;
        __ocrWarmPromise = (async () => {
            try {
if (ocrStatus) ocrStatus.textContent = 'OCR模块预加载中…';
                // 用一个极小的空白 canvas 触发一次 recognize，让 Tesseract 先完成语言/worker初始化
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
await window.Tesseract.recognize(canvas, 'eng', {
                    tessedit_pageseg_mode: 6,
                    logger: () => {}
                });
} catch (_) {
                // 预热失败也不影响后续识别
} finally {
                // 预热结束后恢复状态文案
                setStatus('可直接粘贴截图到页面，支持自动识别和回填');
            }
        })();
        return __ocrWarmPromise;
    }
    // 页面打开后立即开始预热（不阻塞渲染）
    prewarmOcrEngine();

    function extractFirstImageFromClipboardEvent(e) {
        const items = e.clipboardData?.items;
        if (!items) return null;
        for (const item of items) {
            if (item.type && item.type.startsWith('image/')) {
                return item.getAsFile();
            }
        }
        return null;
    }

    /**
     * 轻度预处理：仅灰度+反色+对比度，保留更多细节
     */
    async function preprocessImageLight(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                try {
                    const scale = Math.min(img.width, img.height) < 500 ? 2 : 1;
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.filter = 'grayscale(100%) invert(1) contrast(1.3)';
                    ctx.drawImage(img, 0, 0, w, h);
                    ctx.filter = 'none';
                    URL.revokeObjectURL(url);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('toBlob failed'));
                    }, 'image/png', 1);
                } catch (e) {
                    URL.revokeObjectURL(url);
                    reject(e);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Image load failed'));
            };
            img.src = url;
        });
    }

    /**
     * 重度预处理：放大+对比度+锐化，针对模糊图
     */
    async function preprocessImageForOcr(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                try {
                    const minDim = Math.min(img.width, img.height);
                    const scale = minDim < 400 ? 3 : minDim < 600 ? 2.5 : 1;
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.filter = 'grayscale(100%) invert(1) contrast(1.5)';
                    ctx.drawImage(img, 0, 0, w, h);
                    ctx.filter = 'none';

                    // 锐化：提升模糊字符边缘清晰度
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const data = imageData.data;
                    const tmp = new Uint8ClampedArray(data);
                    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
                    const side = 3;
                    const half = Math.floor(side / 2);
                    for (let y = half; y < h - half; y++) {
                        for (let x = half; x < w - half; x++) {
                            for (let c = 0; c < 3; c++) {
                                let sum = 0;
                                for (let ky = 0; ky < side; ky++) {
                                    for (let kx = 0; kx < side; kx++) {
                                        const i = ((y + ky - half) * w + (x + kx - half)) * 4 + c;
                                        sum += data[i] * kernel[ky * side + kx];
                                    }
                                }
                                const idx = (y * w + x) * 4 + c;
                                tmp[idx] = Math.max(0, Math.min(255, sum));
                            }
                            tmp[(y * w + x) * 4 + 3] = data[(y * w + x) * 4 + 3];
                        }
                    }
                    for (let i = 0; i < data.length; i++) data[i] = tmp[i];
                    ctx.putImageData(imageData, 0, 0);

                    URL.revokeObjectURL(url);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('toBlob failed'));
                    }, 'image/png', 1);
                } catch (e) {
                    URL.revokeObjectURL(url);
                    reject(e);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Image load failed'));
            };
            img.src = url;
        });
    }

    function normalizeOcrText(raw) {
        if (!raw) return '';
        return raw
            .replace(/ /g, ' ')
            .replace(/[，、]/g, ',')
            .replace(/[·．]/g, '.')
            .replace(/[：]/g, ':')
            .replace(/[（）]/g, ' ')
            .replace(/mm\b/gi, ' mm')
            .replace(/cm\b/gi, ' cm')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function mapKeyToParam(key) {
        const k = key.toUpperCase().replace(/\s+/g, '');
        const map = {
            'IVSD': 'IVSd',
            'IVSDD': 'IVSd',
            'IVSDD.': 'IVSd',
            'IVSDD:': 'IVSd',
            'IVSD:': 'IVSd',
            'LVDD': 'LVDd',
            'LVIDD': 'LVDd',
            'LVIDD.': 'LVDd',
            'LVIDD:': 'LVDd',
            'LVPWD': 'LVPWd',
            'LVWD': 'LVPWd',
            'LVFWD': 'LVPWd',
            'LVDS': 'LVDs',
            'LVIDS': 'LVDs',
            'LVPWS': 'LVPWs',
            'LVWS': 'LVPWs',
            'LVFWS': 'LVPWs',
            'AO': 'AO',
            'AO.': 'AO',
            'LA': 'LA',
            'E': 'E',
            'A': 'A',
            'E\'': 'E\'',
            'E/E\'': 'E/E\'',
            'FS': 'FS',
            'EF': 'EF'
        };
        return map[k] || null;
    }

    function parseValue(rawValue, paramKey = '') {
        if (!rawValue) return null;
        const originalRaw = String(rawValue);
        const hasRealDigits = /\d/.test(originalRaw);
        let raw = originalRaw;

        // 数字字母错读：OCR 常把数字里的 5/1/0 识成字母（例如 Sl、Im）
        // 注意：这里发生在"正则捕获的数值片段"上，不会影响到字段名/单位文本。
        raw = raw
            .replace(/[sS]/g, '5')
            .replace(/[oO]/g, '0')
            .replace(/[iIlL]/g, '1');

        // 允许：5.2 / 5,2 / 5·2 / 52 等；·、．视为小数点
        const cleaned = raw
            .replace(/[,，·．]/g, '.')
            .replace(/[^\d.]+/g, ' ')
            .trim()
            .split(' ')[0];
        if (!cleaned) return null;
        let num = Number.parseFloat(cleaned);
        if (Number.isNaN(num)) return null;

        // 若原始值完全不含数字（例如 Sl -> 51），对于 EDV/ESV 取首位更稳妥
        if ((paramKey === 'EDV' || paramKey === 'ESV') && !hasRealDigits && !cleaned.includes('.') && cleaned.length >= 2) {
            num = Number.parseFloat(cleaned[0]);
        }

        // IVSs：有时被识成 36% 这类"两位数缺小数点"的形式，推断为除以 10
        if (paramKey === 'IVSs' && !cleaned.includes('.') && num >= 20 && num <= 99) {
            num = Math.round((num / 10) * 100) / 100;
        }

        // 小数点丢失：746→7.46、1090→10.90（心超数值多为 1–30 mm / 1–100%）
        if (!/\./.test(cleaned) && /^\d{3,4}$/.test(cleaned)) {
            const n = num;
            if (n >= 100 && n <= 9999) {
                const inferred = n / 100;
                if (inferred >= 1 && inferred <= 150) num = Math.round(inferred * 100) / 100;
            }
        }
        return num;
    }

    function parseOcrToParamValues(text) {
        const normalized = normalizeOcrText(text);
        if (!normalized) return {};

        // 先用同义词把中文/英文描述统一替换成标准缩写，方便后续正则匹配
        // 这些同义词完全写在本文件中，不依赖 readme.md
        let unified = normalized
            // 先消除干扰行：%IVS Thck / %LVPW Thck 是百分比增厚率行，与 IVSs/LVPWs 无关，会误触发同名字段匹配
            .replace(/%\s*IVS\s*Th[a-zA-Z]*/gi, 'PCTIVS_THCK')
            .replace(/%\s*LVPW?\s*Th[a-zA-Z]*/gi, 'PCTLVPW_THCK')
            // LVs Mass（左室质量）行携带负号，会干扰相邻数值解析；用无害 token 替换
            .replace(/LVs?\s*Mass\b[^\n]*/gi, 'LVMASS_ROW')
            // IVSd
            .replace(/舒张末期室间隔厚度/gi, 'IVSd')
            .replace(/舒张期室间隔厚度/gi, 'IVSd')
            // LVDd（含 LVIDd）
            .replace(/舒张末期左心室内径/gi, 'LVDd')
            .replace(/舒张期左心室内径/gi, 'LVDd')
            .replace(/舒张期左心室直径/gi, 'LVDd')
            .replace(/舒张末期左心室直径/gi, 'LVDd')
            .replace(/\bLVIDd\b/gi, 'LVDd')
            // OCR 常见错读：Wid -> LVDd（示意图里出现）
            .replace(/\bWid\b/gi, 'LVDd')
            // LVWd（含 LVFWd）
            .replace(/舒张末期左心室游离壁厚度/gi, 'LVWd')
            .replace(/舒张期左心室游离壁厚度/gi, 'LVWd')
            .replace(/\bLVFWd\b/gi, 'LVWd')
            // IVSs：readme 约定仅识别字面 IVSs，不同义词替换
            // LVDs（含 LVIDs）
            .replace(/收缩末期左心室内径/gi, 'LVDs')
            .replace(/收缩期左心室内径/gi, 'LVDs')
            .replace(/收缩末期左心室直径/gi, 'LVDs')
            .replace(/收缩期左心室直径/gi, 'LVDs')
            .replace(/\bLVIDs\b/gi, 'LVDs')
            // LVWs（含 LVFWs）
            .replace(/收缩末期左心室游离壁厚度/gi, 'LVWs')
            .replace(/收缩期左心室游离壁厚度/gi, 'LVWs')
            .replace(/\bLVFWs\b/gi, 'LVWs')
            // OCR 常见错读：LPWs -> LVWs（示意图里出现）
            .replace(/\bLPWs\b/gi, 'LVWs')
            .replace(/\bLPW[sS]\b/gi, 'LVWs')
            // OCR 常见拼写：LVPWThck -> LVPWs（用于厚度类字段兜底）
            .replace(/LVPWThck/gi, 'LVPWs')
            // EDV、ESV：readme 约定仅对应 EDV(Teich)、ESV(Teich)；统一成带 (Teich) 便于正则只抓 Teich 容积
            // 宽松匹配 Teich 各种 OCR 误读：Telch / Tetch / Teach / Teloh 等（括号内 T 起头 3-6 字母）
            .replace(/\bEDV\s*\(T[a-zA-Z]{3,6}\)/gi, 'EDV(Teich)')
            .replace(/\bESV\s*\(T[a-zA-Z]{3,6}\)/gi, 'ESV(Teich)')
            .replace(/EDV\(teich\)/gi, 'EDV(Teich)')
            .replace(/EDV\s*[iI]\s*Teich\)?/gi, 'EDV(Teich)')
            .replace(/舒张末期容积（?ml）?/gi, 'EDV(Teich)')
            .replace(/舒张末期左心室容量/gi, 'EDV(Teich)')
            .replace(/舒张期左心室容量/gi, 'EDV(Teich)')
            .replace(/ESV\(teich\)/gi, 'ESV(Teich)')
            .replace(/ESV\s*[iI]\s*Teich\)?/gi, 'ESV(Teich)')
            .replace(/ESM\s*[iI]\s*Teich\)?/gi, 'ESV(Teich)')
            .replace(/收缩末期容积（?ml）?/gi, 'ESV(Teich)')
            .replace(/收缩末期左心室容量/gi, 'ESV(Teich)')
            .replace(/收缩期左心室容量/gi, 'ESV(Teich)')
            // LA、AO 直径（不将 LA/AO 比值整行替换为标签，避免误识别比值；LA/AO 由 LA、AO 自动计算）
            .replace(/\bL[Aa]\s*Diam\b/gi, 'LA')
            .replace(/\bA[oO]\s*Diam\b/gi, 'AO')
            .replace(/\bE\s*Vel\b/gi, 'E')
            .replace(/\bA\s*Vel\b/gi, 'A')
            // 不将 E/A Ratio 整行替换为 E/A 标签：比值由 E、A 自动计算，OCR 只填 E、A
            .replace(/\bE\s*'\s*(?:Lat|Sep|Ava)\b/gi, 'E\'')
            .replace(/\bE\s*\/\s*E\s*'\s*(?:Lat|Sep|Ava)\b/gi, 'E/E\'')
            // FS（含 %FS）
            .replace(/%\s*FS/gi, 'FS')
            .replace(/缩短分数/gi, 'FS')
            .replace(/Fractional Shortening/gi, 'FS')
            // EF（Teich）
            .replace(/EF\(teich\)/gi, 'EF')
            .replace(/射血分数/gi, 'EF')
            .replace(/左心室射血分数/gi, 'EF')
            .replace(/\bLVEF\b/gi, 'EF')
            .replace(/Left Ventricular Ejection Fraction/gi, 'EF')
            .replace(/Ejection Fraction/gi, 'EF');

        // 再修正少量常见 OCR 误识别：LVIDd→LVDd、IVSd大小写、s/5 混淆等
        const fixed = unified
            .replace(/\bLVlDd\b/gi, 'LVIDd')
            .replace(/\bLVlDs\b/gi, 'LVIDs')
            // IVSd/IVSs 首字母 I 常被误读为小写 l 或数字 1
            .replace(/\b[l1]VSd\b/g, 'IVSd')
            .replace(/\b[l1]VSs\b/g, 'IVSs')
            .replace(/\bIVS[dD]\b/g, 'IVSd')
            .replace(/\bLVPW[dD]\b/g, 'LVPWd')
            .replace(/\bLVPW[sS]\b/g, 'LVPWs')
            // IVSs：readme 仅 IVSs <- IVSs，不归一 IVS5/IVSS 等变体
            // LVIDs、LVPWs 同理
            .replace(/\bLVID5\b/gi, 'LVIDs')
            .replace(/\bLVPW5\b/gi, 'LVPWs');
            // EDV(Teich) 常见误读：EOV / E0V（0与D混淆）
        const fixedWithEdvAlias = fixed
            .replace(/\bEOV\b/gi, 'EDV(Teich)')
            .replace(/\bE0V\b/gi, 'EDV(Teich)');

        const results = {};

        // 只识别 1.M-MODE 段对应的字段：
        // IVSd、LVDd、LVWd、IVSs、LVDs、LVWs、EDV（Teich）、ESV（Teich）、FS、EF（Teich）
        // 规则：在字段名（或同义词已统一为字段名后）后面找到出现的第一个数字
        const patterns = [
            // 厚度/腔径：允许数字字母错读（例如 S436）
            { key: 'IVSd',  re: /\bIVSd\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVIDd', re: /\bLVIDd\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVDd',  re: /\bLVDd\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVPWd', re: /\bLVPWd\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVWd',  re: /\bLVWd\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            // IVSs：readme 仅 IVSs <- IVSs（正则 /i 仍可匹配 IVSS 等大小写变体）
            { key: 'IVSs',  re: /\bIVSs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVIDs', re: /\bLVIDs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVDs',  re: /\bLVDs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVPWs', re: /\bLVPWs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'LVWs',  re: /\bLVWs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            // 非 M 型 / 频谱多普勒 OCR：LA、AO 单独识别（排除 LA/AO 比值行，避免把比值误填到 LA 或 AO）
            { key: 'LA',    re: /\bLA\b(?!\s*\/\s*AO)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'AO',    re: /(?<!\bLA\s*\/\s*)\bAO\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'E\'',   re: /\bE\s*'\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            { key: 'E/E\'', re: /\bE\s*\/\s*E\s*'\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            // E、A 单独识别：E 用 (?!\s*\/) 排除 E/A、E/E′；A 排除 E/A 比值行中的 A（E/A 由 calculateEOverA 自动算）
            { key: 'E',     re: /\bE\b(?!\s*\/)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            { key: 'A',     re: /(?<!\bE\s*\/\s*)\bA\b(?!\s*\/)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 1 },
            // EDV、ESV：readme 仅识别 EDV(Teich)、ESV(Teich)（及 EDV Teich / 无括号变体），不抓裸 EDV/ESV（避免与 Simpson 等混淆）
            { key: 'EDV_TEICH', re: /\bEDV\s*\(\s*Teich\s*\)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            { key: 'EDV_TEICH', re: /\bEDV\s*Teich\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            { key: 'ESV_TEICH', re: /\bESV\s*\(\s*Teich\s*\)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            { key: 'ESV_TEICH', re: /\bESV\s*Teich\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/i, priority: 2 },
            { key: 'FS',    re: /\bFS\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i, priority: 1 },
            // EF(Teich) 优先于普通 EF
            { key: 'EF_TEICH', re: /\bEF\s*\(\s*Teich\s*\)\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i, priority: 2 },
            { key: 'EF_TEICH', re: /\bEF\s*Teich\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i, priority: 2 },
            { key: 'EF',    re: /\bEF\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i, priority: 1 }
        ];

        const resultPriority = {};
        for (const p of patterns) {
            const m = fixedWithEdvAlias.match(p.re);
            if (!m) continue;
            const parseKey =
                p.key === 'EDV_TEICH' ? 'EDV' :
                p.key === 'ESV_TEICH' ? 'ESV' :
                p.key === 'EF_TEICH' ? 'EF' :
                p.key;
            const valueNum = parseValue(m[1], parseKey);
            if (valueNum === null) continue;
            // 先用 mapKeyToParam 做一次映射（处理 LVIDd/LVFWs 等），否则直接用 key 自身
            const baseKey =
                p.key === 'EF_TEICH' ? 'EF' :
                p.key === 'EDV_TEICH' ? 'EDV' :
                p.key === 'ESV_TEICH' ? 'ESV' :
                p.key;
            const mapped = mapKeyToParam(baseKey) || mapKeyToParam(baseKey.toUpperCase());
            const targetParam = mapped || baseKey;
            if (!targetParam) continue;

            const priority = p.priority || 0;
            if (resultPriority[targetParam] !== undefined && resultPriority[targetParam] > priority) {
                continue;
            }

            // 简化：不根据单位做 cm→mm 换算，直接使用识别到的数值
            results[targetParam] = valueNum;
            resultPriority[targetParam] = priority;
        }

        // IVSs 稳定性增强：仅字面 IVSs；合理区间 1–30 mm 内再 matchAll 择优
        const isIvssPlausible = (v) => Number.isFinite(v) && v >= 1 && v <= 30;
        if (!isIvssPlausible(Number(results['IVSs']))) {
            const ivssCandidatePatterns = [
                /\bIVSs\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/ig
            ];
            const ivssCandidates = [];
            for (const re of ivssCandidatePatterns) {
                for (const m of fixedWithEdvAlias.matchAll(re)) {
                    const n = parseValue(m[1], 'IVSs');
                    if (n !== null) ivssCandidates.push(n);
                }
            }
            const plausible = ivssCandidates.filter(isIvssPlausible);
            if (plausible.length > 0) {
                results['IVSs'] = plausible[0];
                resultPriority['IVSs'] = Math.max(resultPriority['IVSs'] || 0, 1);
            }
        }

        // EDV 稳定性增强：仅 EDV(Teich) / EDV Teich；范围校验 + 候选回退（不再回退裸 EDV）
        const isEdvPlausible = (v) => Number.isFinite(v) && v >= 1 && v <= 500;
        if (!isEdvPlausible(Number(results['EDV']))) {
            const edvCandidatePatterns = [
                /\bEDV\s*\(\s*Teich\s*\)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/ig,
                /\bEDV\s*Teich\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/ig
            ];
            const edvCandidates = [];
            for (const re of edvCandidatePatterns) {
                for (const m of fixedWithEdvAlias.matchAll(re)) {
                    const n = parseValue(m[1], 'EDV');
                    if (n !== null) edvCandidates.push(n);
                }
            }
            const plausible = edvCandidates.filter(isEdvPlausible);
            if (plausible.length > 0) {
                results['EDV'] = plausible[0];
                resultPriority['EDV'] = Math.max(resultPriority['EDV'] || 0, 1);
            }
        }

        // ESV 稳定性增强：仅 ESV(Teich) / ESV Teich
        const isEsvPlausible = (v) => Number.isFinite(v) && v >= 1 && v <= 500;
        if (!isEsvPlausible(Number(results['ESV']))) {
            const esvCandidatePatterns = [
                /\bESV\s*\(\s*Teich\s*\)[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/ig,
                /\bESV\s*Teich\b[^\d\-+]*?([0-9SIlOo]+(?:[.,][0-9SIlOo]+)?)/ig
            ];
            const esvCandidates = [];
            for (const re of esvCandidatePatterns) {
                for (const m of fixedWithEdvAlias.matchAll(re)) {
                    const n = parseValue(m[1], 'ESV');
                    if (n !== null) esvCandidates.push(n);
                }
            }
            const plausibleEsv = esvCandidates.filter(isEsvPlausible);
            if (plausibleEsv.length > 0) {
                results['ESV'] = plausibleEsv[0];
                resultPriority['ESV'] = Math.max(resultPriority['ESV'] || 0, 1);
            }
        }

        return results;
    }

    function writeParamsToInputs(paramValues) {
        const entries = Object.entries(paramValues);
        if (entries.length === 0) return 0;

        let written = 0;
        for (const [param, value] of entries) {
            const input = document.querySelector(`input[data-param="${param}"]`);
            if (!input) continue;
            input.value = String(value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            written++;
        }
        return written;
    }

    /** 与 1.M-MODE 相关的 OCR 可填字段；仅当本次识别命中其中任一项时才清空这些输入框 */
    const OCR_MMODE_FIELD_PARAMS = ['IVSd', 'LVDd', 'LVPWd', 'IVSs', 'LVDs', 'LVPWs', 'EDV', 'ESV', 'FS', 'EF', 'TAPSE', 'EDVI', 'ESVI'];

    function ocrParsedContainsMMode(paramValues) {
        if (!paramValues || typeof paramValues !== 'object') return false;
        return OCR_MMODE_FIELD_PARAMS.some((p) => Object.prototype.hasOwnProperty.call(paramValues, p));
    }

    // OCR 回填前：仅当识别到 M 型相关内容时清空 1.M-MODE 字段，避免粘贴非 M 型截图时误清空已有 M 型数据
    function clearMModeFieldsBeforeOcrWrite() {
        OCR_MMODE_FIELD_PARAMS.forEach((param) => {
            const input = document.querySelector(`input[data-param="${param}"]`);
            if (!input) return;
            if (input.value === '') return;
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // 兜底清理自动计算缓存值
        delete parameters['EDV_raw'];
        delete parameters['ESV_raw'];
    }

    let __ocrRunCounter = 0;
    async function runOcrFromFile(file) {
        if (!file) return;
        const runId = `ocr_${++__ocrRunCounter}`;
        const t0 = performance.now();
// 重要：不要等待 warmup Promise，避免 warmup 卡死导致粘贴 OCR 永无响应
        if (__ocrWarmPromise) {
}
        setBusy(true);
        setStatus('OCR预处理中…');
        try {
            const pre0 = performance.now();
            const preprocessed = await preprocessImageForOcr(file);
            const pre1 = performance.now();
            const light0 = performance.now();
            const lightProcessed = await preprocessImageLight(file);
            const light1 = performance.now();
setStatus('OCR识别中…（可稍等几秒）');
            const opts = {
                tessedit_pageseg_mode: 6,
                logger: (m) => {
                    if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
                        setStatus(`OCR识别中… ${(m.progress * 100).toFixed(0)}%`);
                    }
                }
            };
            const rec0 = performance.now();
            const [{ data: d1 }, { data: d2 }] = await Promise.all([
                window.Tesseract.recognize(preprocessed, 'eng', opts),
                window.Tesseract.recognize(lightProcessed, 'eng', opts)
            ]);
            const rec1 = performance.now();
const parse0 = performance.now();
            const p1 = parseOcrToParamValues(d1?.text || '');
            const p2 = parseOcrToParamValues(d2?.text || '');
            const paramValues = { ...p1, ...p2 };

            // 双路 OCR 的 IVSs 择优合并，避免后写覆盖前写导致退化
            const isIvssPlausible = (v) => Number.isFinite(v) && v >= 1 && v <= 30;
            const ivss1 = Number(p1['IVSs']);
            const ivss2 = Number(p2['IVSs']);
            if (isIvssPlausible(ivss1) && !isIvssPlausible(ivss2)) {
                paramValues['IVSs'] = ivss1;
            } else if (!isIvssPlausible(ivss1) && isIvssPlausible(ivss2)) {
                paramValues['IVSs'] = ivss2;
            } else if (isIvssPlausible(ivss1) && isIvssPlausible(ivss2)) {
                // 两者都合理时，优先预处理更强的第一路
                paramValues['IVSs'] = ivss1;
            }
            // 双路 OCR 的 EDV/ESV 择优合并，避免漏识别/误识别覆盖（与 Teich 容积解析一致，1–500 ml）
            const isTeichVolPlausible = (v) => Number.isFinite(v) && v >= 1 && v <= 500;
            const edv1 = Number(p1['EDV']);
            const edv2 = Number(p2['EDV']);
            if (isTeichVolPlausible(edv1) && !isTeichVolPlausible(edv2)) {
                paramValues['EDV'] = edv1;
            } else if (!isTeichVolPlausible(edv1) && isTeichVolPlausible(edv2)) {
                paramValues['EDV'] = edv2;
            } else if (isTeichVolPlausible(edv1) && isTeichVolPlausible(edv2)) {
                paramValues['EDV'] = edv1;
            }
            const esv1 = Number(p1['ESV']);
            const esv2 = Number(p2['ESV']);
            if (isTeichVolPlausible(esv1) && !isTeichVolPlausible(esv2)) {
                paramValues['ESV'] = esv1;
            } else if (!isTeichVolPlausible(esv1) && isTeichVolPlausible(esv2)) {
                paramValues['ESV'] = esv2;
            } else if (isTeichVolPlausible(esv1) && isTeichVolPlausible(esv2)) {
                paramValues['ESV'] = esv1;
            }
            if (ocrParsedContainsMMode(paramValues)) {
                clearMModeFieldsBeforeOcrWrite();
            }
            const written = writeParamsToInputs(paramValues);
            const parse1 = performance.now();
// OCR结束后不再自动隐藏：让预览图片保持显示

            if (written > 0) {
                setStatus(`已回填 ${written} 项：${Object.keys(paramValues).join('、')}`);
            } else {
                setStatus('未识别到可回填的字段（建议裁剪到测量值区域再粘贴）');
            }
        } catch (err) {
            console.error('OCR失败:', err);
            setStatus('OCR失败（请换更清晰/更小范围的截图再试）');
            // OCR失败也不再自动隐藏：允许用户查看预处理结果
        } finally {
            setBusy(false);
        }
    }

    // 粘贴：直接从剪贴板取图片
    document.addEventListener('paste', async (e) => {
const img = extractFirstImageFromClipboardEvent(e);
        if (!img) return;
        e.preventDefault();
await runOcrFromFile(img);
    });

    // 拖拽：拖拽图片到页面任意位置
    document.addEventListener('dragover', (e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
            e.preventDefault();
        }
    });
    document.addEventListener('drop', async (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (!file || !file.type?.startsWith('image/')) return;
        e.preventDefault();
        await runOcrFromFile(file);
    });

    setStatus('可直接粘贴截图到页面，支持自动识别和回填');
}

// 立即尝试绑定（如果DOM已加载）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        disableInputMemory();
        setupInputListeners();
        setupTooltips();
        setupRefreshButton();
        setupRightSidebarResize();
        setupOCR();
        calculateLVIDDN();
    });
} else {
    disableInputMemory();
    setupInputListeners();
    setupTooltips();
    setupRefreshButton();
    setupRightSidebarResize();
    setupOCR();
    calculateLVIDDN();
}

// 为select元素添加change事件监听器
document.addEventListener('change', function(e) {
    if (e.target.matches('.other-param-input[data-param]')) {
        const paramName = e.target.getAttribute('data-param');
        const value = e.target.value.trim();

        if (value) {
            parameters[paramName] = value;
        } else {
            delete parameters[paramName];
        }

        generateTemplate();
    }
});
