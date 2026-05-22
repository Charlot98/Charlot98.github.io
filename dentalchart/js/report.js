/**
 * 牙表报告自动生成（规则见 words.md）
 */
(function (global) {
    'use strict';

    const REPORT_EMPTY_TEXT = '标注牙表后内容将自动生成';

    /** 齿缺（words.md ## 0）：该牙位仅允许此缩写，不可与其他牙病共存 */
    const MISSING_TOOTH_TERM = '0';

    /** 所见/结论显示优先级：ONF＞AL＞FX＞RD＞RE＞其它＞0 */
    const REPORT_PRIORITY = ['ONF', 'AL', 'FX', 'RD', 'RE'];

    function getToothCount(teethStr) {
        if (!teethStr) return 0;
        return teethStr.split('、').filter(Boolean).length;
    }

    /** ≤2 颗：编号+后缀；≥3 颗：汇总表述 */
    function conclusionByCount(teethStr, fewSuffix, manyText) {
        return getToothCount(teethStr) <= 2 ? teethStr + fewSuffix : manyText;
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
        }
    };

    function normalizeTermList(raw) {
        if (!raw) return [];
        return raw
            .toUpperCase()
            .replace(/[，；;、]/g, ',')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }

    function formatTeethList(teeth) {
        return teeth
            .slice()
            .sort((a, b) => Number(a) - Number(b))
            .join('、');
    }

    function getOrderedReportTerms(map) {
        const present = Object.keys(map).filter(
            term => map[term]?.length && hasReportRule(term)
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
        return ordered;
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
                if (!map[term]) map[term] = [];
                if (!map[term].includes(toothNum)) map[term].push(toothNum);
            });
        });
        return map;
    }

    function updateReport() {
        const map = collectTermTeeth();
        const findingsLines = [];
        const conclusionLines = [];

        getOrderedReportTerms(map).forEach(term => {
            const teeth = map[term];
            if (!teeth || !teeth.length) return;
            const rule = REPORT_RULES[term];
            if (!rule) return;

            const teethStr = formatTeethList(teeth);
            findingsLines.push(rule.findingsLabel + '：' + teethStr);
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
        return Object.prototype.hasOwnProperty.call(REPORT_RULES, term);
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
        REPORT_RULES
    };
})(typeof window !== 'undefined' ? window : this);
