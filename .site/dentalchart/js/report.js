/**
 * 牙表报告自动生成（规则见 words.md）
 */
(function (global) {
    'use strict';

    const REPORT_EMPTY_TEXT = '';

    /** 齿缺（words.md ## 0）：该牙位仅允许此缩写，不可与其他牙病共存 */
    const MISSING_TOOTH_TERM = '0';

    const TERM_ALIASES = {
        PD: 'AL',
        O: '0',
        髓腔宽: '髓腔增宽'
    };

    function resolveTermAlias(term) {
        if (TERM_ALIASES[term]) return TERM_ALIASES[term];
        if (term.startsWith('疑')) {
            const baseTerm = term.slice(1);
            if (TERM_ALIASES[baseTerm]) return '疑' + TERM_ALIASES[baseTerm];
        }
        return term;
    }

    /** 所见/结论显示优先级：ONF/疑ONF＞AL＞FX＞RD＞RE＞其它＞0 */
    const REPORT_PRIORITY = ['ONF', '疑ONF', 'AL', 'FX', 'RD', 'RE'];

    /** 图例中已经建立的术语；不在此列表中的自由输入内容使用通用报告规则 */
    const KNOWN_TERMS = new Set([
        'AL', 'AT', 'CA', 'CWD', 'ED', 'EP', 'FE', 'FX', 'GH', 'GV', 'GP',
        'LPS', 'M', '0', 'OP', 'OM', 'ONF', '疑ONF', '髓腔增宽', 'PE', 'PP',
        'RD', 'RE', 'RL', 'ROT', 'RPC', 'RPO', 'RTR', 'X', 'XS', 'XSS'
    ]);
    const ONF_ALLOWED_TEETH = new Set([
        '101', '102', '103', '104', '105', '106', '107',
        '201', '202', '203', '204', '205', '206', '207'
    ]);

    function termAllowedOnTooth(term, toothNum) {
        return (term !== 'ONF' && term !== '疑ONF') || ONF_ALLOWED_TEETH.has(String(toothNum));
    }

    function getToothCount(teethStr) {
        if (!teethStr) return 0;
        return teethStr.split('、').filter(Boolean).length;
    }

    /** ≤2 颗：编号+后缀；≥3 颗：汇总表述 */
    function conclusionByCount(teethStr, fewSuffix, manyText) {
        return getToothCount(teethStr) <= 2 ? teethStr + fewSuffix : manyText;
    }

    /** 自定义/通用术语：1 颗显示牙号，≥2 颗显示“多齿” */
    function genericConclusion(teethStr, label) {
        return getToothCount(teethStr) >= 2
            ? '多齿' + label
            : teethStr + label;
    }

    /** 在原结论中加入“疑”，同时保留该疾病原有的数量规则 */
    function formatSuspectedConclusion(baseText, teethStr) {
        if (baseText.startsWith(teethStr)) {
            return teethStr + '疑' + baseText.slice(teethStr.length);
        }
        if (baseText.startsWith('多齿')) {
            return '多齿疑' + baseText.slice(2);
        }
        if (baseText.startsWith('多处')) {
            return '多处疑' + baseText.slice(2);
        }
        return '疑' + baseText;
    }

    const REPORT_RULES = {
        AL: {
            findingsLabel: '牙周齿槽骨丢失',
            conclusion: (teethStr) => conclusionByCount(teethStr, '牙周病', '多齿牙周病。')
        },
        '0': {
            findingsLabel: '齿缺',
            conclusion: (teethStr) => conclusionByCount(teethStr, '齿缺', '多齿缺')
        },
        FX: {
            findingsLabel: '齿折',
            conclusion: (teethStr) => conclusionByCount(teethStr, '齿折', '多齿齿折')
        },
        RE: {
            findingsLabel: '齿根暴露',
            conclusion: (teethStr) => conclusionByCount(teethStr, '齿根暴露', '多齿齿根暴露。')
        },
        RD: {
            findingsLabel: '乳齿未脱',
            conclusion: (teethStr) => conclusionByCount(teethStr, '乳齿未脱', '多齿乳齿未脱')
        },
        FE: {
            findingsLabel: '根分叉暴露',
            conclusion: (teethStr) => conclusionByCount(teethStr, '根分叉暴露', '多齿根分叉暴露。')
        },
        RTR: {
            findingsLabel: '齿根残留',
            conclusion: (teethStr) => conclusionByCount(teethStr, '齿根残留', '多处齿根残留。')
        },
        ONF: {
            findingsLabel: '口鼻瘘',
            conclusion: (teethStr) => conclusionByCount(teethStr, '口鼻瘘', '多齿口鼻瘘')
        },
        AT: {
            findingsLabel: '牙齿齿冠偏短',
            conclusion: (teethStr) => conclusionByCount(teethStr, '齿冠磨损', '多齿齿冠磨损')
        },
        RL: {
            findingsLabel: '牙吸收',
            conclusion: (teethStr) => conclusionByCount(teethStr, '牙吸收', '多齿牙吸收')
        },
        ROT: {
            findingsLabel: '牙旋转',
            conclusion: (teethStr) => (
                getToothCount(teethStr) >= 2
                    ? '多齿牙旋转'
                    : teethStr + '牙旋转'
            )
        },
        CWD: {
            findingsLabel: '牙齿拥挤',
            conclusion: (teethStr) => genericConclusion(teethStr, '牙齿拥挤')
        },
        '髓腔增宽': {
            findingsLabel: '髓腔增宽',
            conclusion: (teethStr) => genericConclusion(teethStr, '髓腔增宽')
        }
    };

    /** 其余快速标签使用统一规则：所见显示中文名称，结论按单齿/多齿生成。 */
    const GENERIC_REPORT_LABELS = {
        CA: '龋齿',
        ED: '釉质发育不良',
        EP: '齿龈瘤',
        GH: '牙龈增生',
        GV: '牙龈切除术',
        GP: '牙龈整形术',
        LPS: '淋巴细胞浆细胞性口炎',
        M: '牙齿活动',
        OP: '牙体修复术',
        OM: '口腔肿瘤',
        PE: '牙髓暴露',
        PP: '牙周袋',
        RPC: '闭合式牙根整平术',
        RPO: '开放式牙根整平术',
        X: '拔牙',
        XS: '切开齿龈瓣拔牙',
        XSS: '外科拔牙'
    };

    function genericReportRule(label) {
        return {
            findingsLabel: label,
            conclusion: (teethStr) => genericConclusion(teethStr, label)
        };
    }

    function getGenericReportRule(term) {
        if (GENERIC_REPORT_LABELS[term]) return genericReportRule(GENERIC_REPORT_LABELS[term]);
        if (term.startsWith('疑') && GENERIC_REPORT_LABELS[term.slice(1)]) {
            return genericReportRule('疑' + GENERIC_REPORT_LABELS[term.slice(1)]);
        }
        return null;
    }

    /** “疑+术语”自动继承原术语规则 */
    function getReportRule(term) {
        if (REPORT_RULES[term]) return REPORT_RULES[term];
        if (!term.startsWith('疑')) return null;

        const baseRule = REPORT_RULES[term.slice(1)];
        if (!baseRule) return null;
        return {
            findingsLabel: '疑' + baseRule.findingsLabel,
            conclusion: (teethStr) => {
                const baseConclusion = typeof baseRule.conclusion === 'function'
                    ? baseRule.conclusion(teethStr)
                    : baseRule.conclusion;
                return formatSuspectedConclusion(baseConclusion, teethStr);
            }
        };
    }

    function normalizeTermList(raw) {
        if (!raw) return [];
        return raw
            .toUpperCase()
            .split(/[\s,，;；、/]+/)
            .map(s => s.trim())
            .map(resolveTermAlias)
            .filter(Boolean);
    }

    function formatTeethList(teeth) {
        return teeth
            .slice()
            .sort((a, b) => Number(a) - Number(b))
            .join('、');
    }

    /** 所见用：连续牙位（编号相差 1）折叠为「起-止」，非连续用「、」分隔。
     *  例：303、304 → 303-304；303、304、305、306 → 303-306；302、304、305 → 302、304-305 */
    function formatTeethRange(teeth) {
        const sorted = teeth.slice().map(Number).sort((a, b) => a - b);
        if (!sorted.length) return '';
        const segments = [];
        let start = sorted[0];
        let prev = sorted[0];
        const flush = () => {
            segments.push(start === prev ? String(start) : start + '-' + prev);
        };
        for (let i = 1; i < sorted.length; i++) {
            const cur = sorted[i];
            if (cur === prev + 1) {
                prev = cur;
            } else {
                flush();
                start = cur;
                prev = cur;
            }
        }
        flush();
        return segments.join('、');
    }

    function getOrderedReportTerms(map) {
        const present = Object.keys(map).filter(
            term => map[term]?.length && (
                hasReportRule(term) || getGenericReportRule(term) || !KNOWN_TERMS.has(term)
            )
        );
        const pinned = new Set([...REPORT_PRIORITY, MISSING_TOOTH_TERM]);
        const others = present.filter(term => !pinned.has(term)).sort();
        const ordered = [];

        REPORT_PRIORITY.forEach(term => {
            if (present.includes(term)) ordered.push(term);
        });
        others.forEach(term => ordered.push(term));
        if (present.includes(MISSING_TOOTH_TERM)) {
            ordered.push(MISSING_TOOTH_TERM);
        }

        // 同一疾病的确诊组与疑似组相邻显示，确诊在前
        const grouped = [];
        const consumed = new Set();
        ordered.forEach(term => {
            if (consumed.has(term)) return;
            const baseTerm = term.startsWith('疑') ? term.slice(1) : term;
            const suspectedTerm = '疑' + baseTerm;

            if (term.startsWith('疑') && ordered.includes(baseTerm)) return;
            grouped.push(term);
            consumed.add(term);
            // 当前项本身就是疑似术语时，不要把自身重复加入。
            if (suspectedTerm !== term && ordered.includes(suspectedTerm)) {
                grouped.push(suspectedTerm);
                consumed.add(suspectedTerm);
            }
        });
        ordered.forEach(term => {
            if (!consumed.has(term)) grouped.push(term);
        });
        return grouped;
    }

    function ensurePeriod(text) {
        if (!text) return text;
        return /。$/u.test(text) ? text : text + '。';
    }

    /** 所见：单条句号结尾；多条用；分行，去掉行间「。；」重复，段末保留一个。 */
    function formatFindingsText(lines) {
        if (!lines.length) return '';
        if (lines.length === 1) return ensurePeriod(lines[0]);
        return lines.map(line => line.replace(/。$/u, '')).join('；\n') + '。';
    }

    /** 结论：单条/多条均以句号结尾；多条用；连接，避免「。；」重复 */
    function formatConclusionText(lines) {
        if (!lines.length) return '';
        if (lines.length === 1) return ensurePeriod(lines[0]);
        return lines.map(line => line.replace(/。$/u, '')).join('；') + '。';
    }

    function collectTermTeeth() {
        const map = {};
        document.querySelectorAll('.tooth-input').forEach(input => {
            const toothNum = input.id.replace('tooth-', '');
            normalizeTermList(input.value).forEach(term => {
                if (!termAllowedOnTooth(term, toothNum)) return;
                if (!map[term]) map[term] = [];
                if (!map[term].includes(toothNum)) map[term].push(toothNum);
            });
        });
        return map;
    }

    function collectTermTeethFromData(inputData) {
        const map = {};
        Object.entries(inputData || {}).forEach(([toothNum, value]) => {
            normalizeTermList(value).forEach(term => {
                if (!termAllowedOnTooth(term, toothNum)) return;
                if (!map[term]) map[term] = [];
                if (!map[term].includes(toothNum)) map[term].push(toothNum);
            });
        });
        return map;
    }

    function buildReport(inputData) {
        const map = collectTermTeethFromData(inputData);
        const findingsLines = [];
        const conclusionLines = [];
        getOrderedReportTerms(map).forEach(term => {
            const teeth = map[term];
            if (!teeth || !teeth.length) return;
            const rule = getReportRule(term) || getGenericReportRule(term) || {
                findingsLabel: term,
                conclusion: (teethStr) => genericConclusion(teethStr, term)
            };
            const teethStr = formatTeethList(teeth);
            findingsLines.push(rule.findingsLabel + '：' + formatTeethRange(teeth));
            conclusionLines.push(typeof rule.conclusion === 'function' ? rule.conclusion(teethStr) : rule.conclusion);
        });
        return {
            findings: findingsLines.length ? formatFindingsText(findingsLines) : REPORT_EMPTY_TEXT,
            conclusion: conclusionLines.length ? formatConclusionText(conclusionLines) : REPORT_EMPTY_TEXT,
            empty: findingsLines.length === 0
        };
    }

    function updateReport() {
        const map = collectTermTeeth();
        const findingsLines = [];
        const conclusionLines = [];

        getOrderedReportTerms(map).forEach(term => {
            const teeth = map[term];
            if (!teeth || !teeth.length) return;
            const rule = getReportRule(term) || getGenericReportRule(term) || {
                findingsLabel: term,
                conclusion: (teethStr) => genericConclusion(teethStr, term)
            };

            const teethStr = formatTeethList(teeth);
            findingsLines.push(rule.findingsLabel + '：' + formatTeethRange(teeth));
            conclusionLines.push(
                typeof rule.conclusion === 'function'
                    ? rule.conclusion(teethStr)
                    : rule.conclusion
            );
        });

        const findingsEl = document.getElementById('reportFindings');
        const conclusionEl = document.getElementById('reportConclusion');
        if (findingsEl) {
            const hasFindings = findingsLines.length > 0;
            findingsEl.value = hasFindings
                ? formatFindingsText(findingsLines)
                : REPORT_EMPTY_TEXT;
            findingsEl.classList.toggle('report-textarea--empty', !hasFindings);
        }
        if (conclusionEl) {
            const hasConclusion = conclusionLines.length > 0;
            conclusionEl.value = hasConclusion
                ? formatConclusionText(conclusionLines)
                : REPORT_EMPTY_TEXT;
            conclusionEl.classList.toggle('report-textarea--empty', !hasConclusion);
        }
    }

    function hasReportRule(term) {
        return !!getReportRule(term);
    }

    /** 图例排序：已配置报告规则的术语靠前（顺序与报告优先级一致） */
    function sortLegendTerms(termsOrder) {
        const withReport = termsOrder.filter(term => hasReportRule(term));
        const withoutReport = termsOrder.filter(term => !hasReportRule(term));
        const pinned = new Set([...REPORT_PRIORITY, MISSING_TOOTH_TERM]);
        const orderedWith = [];

        REPORT_PRIORITY.forEach(term => {
            if (withReport.includes(term)) orderedWith.push(term);
        });
        withReport
            .filter(term => !pinned.has(term))
            .sort()
            .forEach(term => orderedWith.push(term));
        if (withReport.includes(MISSING_TOOTH_TERM)) {
            orderedWith.push(MISSING_TOOTH_TERM);
        }
        return [...orderedWith, ...withoutReport];
    }

    function applyMissingToothRule(list) {
        if (list.includes(MISSING_TOOTH_TERM)) {
            return [MISSING_TOOTH_TERM];
        }
        return list;
    }

    global.DentalReport = {
        updateReport,
        hasReportRule,
        sortLegendTerms,
        applyMissingToothRule,
        REPORT_EMPTY_TEXT,
        MISSING_TOOTH_TERM,
        REPORT_PRIORITY,
        getOrderedReportTerms,
        REPORT_RULES,
        buildReport
    };
})(typeof window !== 'undefined' ? window : this);
