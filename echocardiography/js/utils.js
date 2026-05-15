
// ─────────────────────────────────────────────
// 参考值工具：全局共用，避免在多处重复定义
// ─────────────────────────────────────────────

/**
 * 格式化数值为字符串（默认 2 位小数；isInteger=true 时保留 0 位）。
 * 非数字原样返回，空值返回 ''。
 */
function formatValue(value, isInteger = false) {
    if (value === undefined || value === null || value === '') return '';
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return isInteger ? num.toFixed(0) : num.toFixed(2);
}

/**
 * EDV / ESV 专用格式化：0.1–1 之间保留 1 位小数，其余整数。
 */
function formatEDVESV(value) {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return (num > 0.1 && num < 1) ? num.toFixed(1) : num.toFixed(0);
}


/**
 * 返回单个字符的"显示宽度"（全角中日韩 = 2，其余 = 1）。
 * 用于在等宽字体下对齐两列输出。
 */
function charDisplayWidth(ch) {
    const cp = ch.codePointAt(0);
    if (
        (cp >= 0x1100 && cp <= 0x115F) || // Hangul Jamo
        (cp >= 0x2E80 && cp <= 0xA4CF) || // CJK, radicals, Yi
        (cp >= 0xAC00 && cp <= 0xD7A3) || // Hangul Syllables
        (cp >= 0xF900 && cp <= 0xFAFF) || // CJK Compatibility Ideographs
        (cp >= 0xFE10 && cp <= 0xFE19) || // Vertical forms
        (cp >= 0xFE30 && cp <= 0xFE6F) || // CJK Compatibility Forms
        (cp >= 0xFF00 && cp <= 0xFF60) || // Fullwidth forms
        (cp >= 0xFFE0 && cp <= 0xFFE6)    // Fullwidth symbols
    ) { return 2; }
    return 1;
}

/** 计算字符串的显示宽度（全角字符按 2 计）。 */
function stringDisplayWidth(s) {
    let w = 0;
    for (const ch of String(s)) w += charDisplayWidth(ch);
    return w;
}

/** 按显示宽度补空格到 targetWidth（保证中英文混排时两列对齐）。 */
function padToDisplayWidth(s, targetWidth) {
    const str = String(s);
    const w = stringDisplayWidth(str);
    if (w >= targetWidth) return str;
    return str + ' '.repeat(targetWidth - w);
}

/** CSV列名别名映射：标准参数名 → 可能的CSV列名列表 */
const CSV_PARAM_ALIASES = {
    'IVSd':  ['IVSd', 'IVSd '],
    'LVDd':  ['LVIDd', 'LVDd'],
    'LVWd':  ['LVFWd', 'LVWd'],
    'IVSs':  ['IVSs'],
    'LVDs':  ['LVIDs', 'LVIDs ', 'LVDs'],
    'LVWs':  ['LVFWs', 'LVWs'],
    'LA':    ['LA'],
    'AO':    ['Ao', 'AO'],
    'Ao':    ['Ao', 'AO'],
};

/**
 * 从参考数据行中查找参数值，自动处理列名别名和大小写。
 * @param {Object|null} referenceData - CSV 行对象
 * @param {string} csvKey - 参数名（标准名或 CSV 列名）
 * @returns {string} 参考值字符串，未找到时返回 ''
 */
function getRefValue(referenceData, csvKey) {
    if (!referenceData || !csvKey) return '';
    if (referenceData[csvKey]) return referenceData[csvKey];
    const aliases = CSV_PARAM_ALIASES[csvKey] || [csvKey];
    for (const alias of aliases) {
        if (referenceData[alias]) return referenceData[alias];
        const aliasLower = alias.trim().toLowerCase();
        for (const key in referenceData) {
            if (key.trim().toLowerCase() === aliasLower) return referenceData[key];
        }
    }
    return '';
}

/**
 * 瓣口反流描述：同程度合并（所见彩色多普勒等）
 * 例：二尖瓣轻度 + 三尖瓣轻度 + 主动脉瓣微量 → 二尖瓣、三尖瓣轻度反流，主动脉瓣微量反流
 * @param {Array<{label: string}>} activeFlowItems 已激活瓣口（按展示顺序）
 * @param {(item: object) => string} getSeverity 返回程度，如 轻度、微量
 */
function formatMergedRegurgitationDescription(activeFlowItems, getSeverity) {
    if (!activeFlowItems || activeFlowItems.length === 0) return '';

    const groups = [];
    for (const item of activeFlowItems) {
        const severity = getSeverity(item);
        let group = groups.find(g => g.severity === severity);
        if (!group) {
            group = { severity, labels: [] };
            groups.push(group);
        }
        group.labels.push(item.label);
    }

    return groups.map(g => `${g.labels.join('、')}${g.severity}反流`).join('，');
}

/**
 * 瓣口反流描述：同程度合并（所见彩色多普勒等）
 * 例：二尖瓣轻度 + 三尖瓣轻度 + 主动脉瓣微量 → 二尖瓣、三尖瓣轻度反流，主动脉瓣微量反流
 * @param {Array<{label: string}>} activeFlowItems 已激活瓣口（按展示顺序）
 * @param {(item: object) => string} getSeverity 返回程度，如 轻度、微量
 */
function formatMergedRegurgitationDescription(activeFlowItems, getSeverity) {
    if (!activeFlowItems || activeFlowItems.length === 0) return '';

    const groups = [];
    for (const item of activeFlowItems) {
        const severity = getSeverity(item);
        let group = groups.find(g => g.severity === severity);
        if (!group) {
            group = { severity, labels: [] };
            groups.push(group);
        }
        group.labels.push(item.label);
    }

    return groups.map(g => `${g.labels.join('、')}${g.severity}反流`).join('，');
}
