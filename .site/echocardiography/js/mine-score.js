/**
 * MMVD MINE / MINE2 评分（犬）
 * LA/Ao、LVIDDn、FS、E 四项齐全才输出结论行；任一项缺参则整句不输出。
 */

function parseMineScoreParam(get, key) {
    const raw = (get(key, '') || '').toString().trim();
    if (!raw) return NaN;
    const n = parseFloat(raw.replace(',', '.'));
    return Number.isNaN(n) ? NaN : n;
}

function scoreMineLaAo(v) {
    if (v < 1.70) return 1;
    if (v <= 1.90) return 2;
    if (v <= 2.50) return 3;
    return 4;
}

function scoreMineLviddn(v) {
    if (v < 1.70) return 1;
    if (v <= 2.00) return 2;
    if (v <= 2.30) return 3;
    return 4;
}

function scoreMineFs(v) {
    if (v < 45) return 1;
    if (v <= 50) return 2;
    return 3;
}

function scoreMineE(v) {
    if (v < 1.20) return 1;
    if (v <= 1.50) return 2;
    return 3;
}

const MINE_SCORE_MAX = 14;
const MINE2_SCORE_MAX = 11;

function classifyMineSeverity(total) {
    if (total <= 5) return '轻度';
    if (total <= 7) return '中度';
    if (total <= 12) return '重度';
    return '晚期';
}

function classifyMine2Severity(total) {
    if (total <= 4) return '轻度';
    if (total <= 6) return '中度';
    if (total <= 10) return '重度';
    return '晚期';
}

/** @returns {string|null} 如「MINE：6/14（轻度）、MINE2：5/11（轻度）。」；缺参返回 null */
function buildMineConclusionLine(get) {
    const laAo = parseMineScoreParam(get, 'LA/AO');
    const lviddn = parseMineScoreParam(get, 'LVIDDN');
    const fs = parseMineScoreParam(get, 'FS');
    const e = parseMineScoreParam(get, 'E');

    if (Number.isNaN(laAo) || Number.isNaN(lviddn) || Number.isNaN(fs) || Number.isNaN(e)) {
        return null;
    }

    const mineTotal = scoreMineLaAo(laAo) + scoreMineLviddn(lviddn) + scoreMineFs(fs) + scoreMineE(e);
    const mine2Total = scoreMineLaAo(laAo) + scoreMineLviddn(lviddn) + scoreMineE(e);

    return `MINE：${mineTotal}/${MINE_SCORE_MAX}（${classifyMineSeverity(mineTotal)}）、MINE2：${mine2Total}/${MINE2_SCORE_MAX}（${classifyMine2Severity(mine2Total)}）。`;
}
