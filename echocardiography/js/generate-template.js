function unlockRightSidebarTemplateText() {
    rightSidebarFindingsUserLocked = false;
    rightSidebarConclusionUserLocked = false;
    const b1 = document.getElementById('regenerateFindingsBtn');
    const b2 = document.getElementById('regenerateConclusionBtn');
    if (b1) b1.style.display = 'none';
    if (b2) b2.style.display = 'none';
}

function setRightSidebarTemplateUserLocked(field, locked) {
    if (field === 'findings') {
        rightSidebarFindingsUserLocked = !!locked;
        const btn = document.getElementById('regenerateFindingsBtn');
        if (btn) btn.style.display = locked ? 'inline-flex' : 'none';
    } else if (field === 'conclusion') {
        rightSidebarConclusionUserLocked = !!locked;
        const btn = document.getElementById('regenerateConclusionBtn');
        if (btn) btn.style.display = locked ? 'inline-flex' : 'none';
    }
}

// 生成模板
async function generateTemplate() {
    const diseaseType = selectedDiseaseType;
    const referenceRange = selectedReferenceRange;
    const findingsEl = document.getElementById('findingsText');
    const conclusionEl = document.getElementById('conclusionText');

    // 如果未选择疾病类型或参考范围，显示提示
    if (!diseaseType || !referenceRange) {
        unlockRightSidebarTemplateText();
        if (findingsEl) findingsEl.value = '请选择疾病类型和参考，模板将自动生成。';
        if (conclusionEl) conclusionEl.value = '请选择疾病类型和参考，模板将自动生成。';
        return;
    }

    // 使用模板配置生成所见部分
    let findings = templateConfig.generateFindings(diseaseType, referenceRange, parameters);

    // 使用模板配置生成结论部分
    let conclusion = templateConfig.generateConclusion(diseaseType, referenceRange, parameters);

    // 节律不齐：在"所见"心率处补充，并在"结论"末尾追加
    if (parameters['节律不齐']) {
        if (typeof findings === 'string' && findings.includes('4.心率') && !findings.includes('节律不齐')) {
            findings = findings.replace(/(4\.心率[:：]\s*[^\n。]*?)。/g, '$1，节律不齐。');
        }

        if (typeof conclusion === 'string' && !conclusion.includes('心脏节律不齐')) {
            const lines = conclusion.trimEnd().split('\n').filter(Boolean);
            const numberedLines = lines.filter(l => /^\s*\d+\./.test(l));
            let nextIndex = 1;
            if (numberedLines.length > 0) {
                const m = numberedLines[numberedLines.length - 1].match(/^\s*(\d+)\./);
                if (m && m[1]) nextIndex = parseInt(m[1], 10) + 1;
            }
            conclusion = conclusion.trimEnd() + `\n  ${nextIndex}.心脏节律不齐，建议结合ECG评估。`;
        }
    }

    // 所见标点规范：英文分号统一为中文分号
    if (typeof findings === 'string') {
        findings = findings.replace(/;/g, '；');
    }

    if (findingsEl && !rightSidebarFindingsUserLocked) {
        findingsEl.value = findings;
    }
    if (conclusionEl && !rightSidebarConclusionUserLocked) {
        conclusionEl.value = conclusion;
    }
}
