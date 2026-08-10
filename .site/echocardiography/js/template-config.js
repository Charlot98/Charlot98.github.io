/**
 * 模板配置入口
 * 所见逻辑见 template-findings.js，结论逻辑见 template-conclusion.js
 */
const templateConfig = {
    getParam: (key, defaultValue = '') => parameters[key] || defaultValue,

    formatNumber: (value) => {
        if (!value) return '';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toFixed(2);
    },

    getAnimalType: (referenceRange) => {
        if (referenceRange === '猫' || referenceRange === '猫（含体重）') return '猫';
        if (referenceRange === '兔子') return '兔';
        return '犬';
    },

    generateFindings: (diseaseType, referenceRange, params) =>
        generateFindingsText(diseaseType, referenceRange, params),

    generateConclusion: (diseaseType, referenceRange, params) =>
        generateConclusionText(diseaseType, referenceRange, params),
};

// 生成模板
