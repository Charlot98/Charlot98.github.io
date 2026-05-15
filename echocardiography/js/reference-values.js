
// 体重输入框旁的「档位快捷按钮」已移除；参考体重档位仍随输入体重由 CSV 匹配（见体重 input 的 change 逻辑）
function updateWeightReferenceDisplay() {
    const weightReferenceDisplay = document.getElementById('weightReferenceDisplay');
    if (!weightReferenceDisplay) return;
    weightReferenceDisplay.textContent = '';
}

/** 体重公式类参考（TAPSE、FAC）：括号格式与 IVSd 等 CSV 参考值一致，由 updateReferenceValues 统一刷新 */
function updateFormulaReferenceSpans() {
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : parameters['体重'];
    const weightStr = weight != null ? String(weight).trim() : '';

    document.querySelectorAll('.reference-value[data-ref-source="formula"]').forEach((span) => {
        const formula = span.getAttribute('data-formula');
        if (formula === 'tapse') {
            const { str, min, max } = getTapseRefRangeFromWeight(weightStr);
            if (str && min != null && max != null) {
                span.textContent = `(${min.toFixed(2)}-${max.toFixed(2)})`;
            } else {
                span.textContent = '';
            }
        } else if (formula === 'fac') {
            const { str, min, max } = getFACRefRangeFromWeight(weightStr);
            if (str && min != null && max != null) {
                span.textContent = `（${min.toFixed(2)}-${max.toFixed(2)}）`;
            } else {
                span.textContent = '';
            }
        } else if (formula === 'sprime') {
            const { str, min, max } = getSPrimeRefRangeFromWeight(weightStr);
            if (str && min != null && max != null) {
                span.textContent = `(${min.toFixed(2)}-${max.toFixed(2)})`;
            } else {
                span.textContent = '';
            }
        }
    });
}

// 更新参数标签旁的参考值显示
function updateReferenceValues() {
    const referenceRange = selectedReferenceRange;
    // 优先使用选中的参考体重，如果没有则使用输入的体重
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : parameters['体重'];

    let referenceData = null;

    // 根据参考范围类型获取参考数据
    if ((referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '猫（含体重）') && weight) {
        // 犬≤3kg、犬＞3kg或猫（含体重）：根据体重查找参考数据
        referenceData = findReferenceDataByWeight(weight, referenceRange);
    } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
        // 猫：从不同品种参考值中获取
        referenceData = breedReferenceData['猫'];
    } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
        // 金毛：从不同品种参考值中获取
        referenceData = breedReferenceData['金毛'];
    } else if (referenceRange === '兔子' && breedReferenceData && breedReferenceData['兔']) {
        // 兔子：从不同品种参考值中获取（CSV中为"兔"）
        referenceData = breedReferenceData['兔'];
    }

    // 更新 CSV 来源的参考值（不含体重公式类，如 TAPSE / FAC）
    document.querySelectorAll('.reference-value:not([data-ref-source="formula"])').forEach(span => {
        if (!referenceData) { span.textContent = ''; return; }
        const key = span.getAttribute('data-csv-key') || span.getAttribute('data-param');
        const refValue = getRefValue(referenceData, key);
        span.textContent = refValue ? `(${refValue})` : '';
    });

    updateFormulaReferenceSpans();

    // 更新IVSd和LVWs的颜色显示
    updateIVSdAndLVWsColor();
}

// 解析参考值字符串，返回[min, max]数组
function parseReferenceValue(refValueStr) {
    if (!refValueStr) return null;

    // 移除括号和空格
    const cleaned = refValueStr.replace(/[()]/g, '').trim();

    // 尝试匹配各种格式：3-5, 3~5, 3.5-5.5, 3.5~5.5等
    const match = cleaned.match(/(\d+\.?\d*)\s*[-~]\s*(\d+\.?\d*)/);
    if (match) {
        const min = parseFloat(match[1]);
        const max = parseFloat(match[2]);
        if (!isNaN(min) && !isNaN(max)) {
            return { min, max };
        }
    }

    return null;
}

// 获取参考数据
function getReferenceData() {
    const referenceRange = selectedReferenceRange;
    // 优先使用选中的参考体重，如果没有则使用输入的体重
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : parameters['体重'];

    let referenceData = null;

    // 根据参考范围类型获取参考数据
    if ((referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '猫（含体重）') && weight) {
        referenceData = findReferenceDataByWeight(weight, referenceRange);
    } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
        referenceData = breedReferenceData['猫'];
    } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
        referenceData = breedReferenceData['金毛'];
    } else if (referenceRange === '兔子' && breedReferenceData && breedReferenceData['兔']) {
        referenceData = breedReferenceData['兔'];
    }

    return referenceData;
}

// 查找参数在参考数据中的值
function findReferenceValueForParam(paramName, referenceData) {
    const v = getRefValue(referenceData, paramName);
    return v || null;
}

// 更新需要参考值比较的输入框颜色（IVSd、LVDd、LVWd、IVSs、LVDs、LVWs、AO、LA）
function updateReferenceBasedInputColors() {
    const referenceData = getReferenceData();

    // 需要参考值比较的参数列表
    const paramsToCheck = [
        { param: 'IVSd', selector: 'input[data-param="IVSd"]' },
        { param: 'LVDd', selector: 'input[data-param="LVDd"]' },
        { param: 'LVPWd', selector: 'input[data-param="LVPWd"]' },
        { param: 'IVSs', selector: 'input[data-param="IVSs"]' },
        { param: 'LVDs', selector: 'input[data-param="LVDs"]' },
        { param: 'LVPWs', selector: 'input[data-param="LVPWs"]' },
        { param: 'AO', selector: 'input[data-param="AO"]' },
        { param: 'LA', selector: 'input[data-param="LA"]' }
    ];

    paramsToCheck.forEach(({ param, selector }) => {
        const input = document.querySelector(selector);
        if (!input) return;

        const value = parseFloat(input.value.trim());

        if (!referenceData) {
            // 如果没有参考数据，重置颜色
            input.style.color = '';
            return;
        }

        if (isNaN(value)) {
            // 如果输入值无效，重置颜色
            input.style.color = '';
            return;
        }

        // 查找参考值
        const refValue = findReferenceValueForParam(param, referenceData);

        if (refValue) {
            const refRange = parseReferenceValue(refValue);
            if (refRange) {
                if (value > refRange.max) {
                    input.style.color = 'red';
                } else if (value < refRange.min) {
                    input.style.color = '#4a90e2';
                } else {
                    input.style.color = '';
                }
            } else {
                input.style.color = '';
            }
        } else {
            input.style.color = '';
        }
    });
}

// 更新特殊逻辑参数的颜色（FS、EF、VPA、VAO、E）
function updateSpecialLogicInputColors() {
    // FS: < 25 标蓝，> 55 标红
    const fsInput = document.querySelector('input[data-param="FS"]');
    if (fsInput) {
        const fsValue = parseFloat(fsInput.value.trim());
        if (!isNaN(fsValue)) {
            if (fsValue < 25) {
                fsInput.style.color = '#4a90e2';
            } else if (fsValue > 55) {
                fsInput.style.color = 'red';
            } else {
                fsInput.style.color = '';
            }
        } else {
            fsInput.style.color = '';
        }
    }

    // EF: ≤ 50 标蓝，> 100 标红
    const efInput = document.querySelector('input[data-param="EF"]');
    if (efInput) {
        const efValue = parseFloat(efInput.value.trim());
        if (!isNaN(efValue)) {
            if (efValue > 100) {
                efInput.style.color = 'red';
            } else if (efValue <= 50) {
                efInput.style.color = '#4a90e2';
            } else {
                efInput.style.color = '';
            }
        } else {
            efInput.style.color = '';
        }
    }

    // VPA: ≥ 2 标红
    const vpaInput = document.querySelector('input[data-param="VPA"]');
    if (vpaInput) {
        const vpaValue = parseFloat(vpaInput.value.trim());
        if (!isNaN(vpaValue)) {
            if (vpaValue >= 2) {
                vpaInput.style.color = 'red';
            } else {
                vpaInput.style.color = '';
            }
        } else {
            vpaInput.style.color = '';
        }
    }

    // VAO: > 2 标红
    const vaoInput = document.querySelector('input[data-param="VAO"]');
    if (vaoInput) {
        const vaoValue = parseFloat(vaoInput.value.trim());
        if (!isNaN(vaoValue)) {
            if (vaoValue > 2) {
                vaoInput.style.color = 'red';
            } else {
                vaoInput.style.color = '';
            }
        } else {
            vaoInput.style.color = '';
        }
    }

    // dp/dt：<= 1800 标蓝，否则默认字体颜色
    const dpdtInput = document.querySelector('input[data-param="dp/dt"]');
    if (dpdtInput) {
        const dpdtRaw = dpdtInput.value.trim();
        const dpdtValue = dpdtRaw ? parseFloat(dpdtRaw) : NaN;
        if (!isNaN(dpdtValue)) {
            dpdtInput.style.color = dpdtValue <= 1800 ? '#4a90e2' : '';
        } else {
            dpdtInput.style.color = '';
        }
    }

    // EPSS（DCM）：> 6.5mm 标红
    const epssInput = document.querySelector('input[data-param="EPSS"]');
    if (epssInput) {
        const epssValue = parseFloat(epssInput.value.trim().replace(',', '.'));
        if (!isNaN(epssValue) && epssValue > 6.5) {
            epssInput.style.color = 'red';
        } else {
            epssInput.style.color = '';
        }
    }

    // SI 球形指数（DCM）：< 1.65 标红
    const siInput = document.querySelector('input[data-param="SI"]');
    if (siInput) {
        const siValue = parseFloat(siInput.value.trim().replace(',', '.'));
        if (!isNaN(siValue) && siValue < 1.65) {
            siInput.style.color = 'red';
        } else {
            siInput.style.color = '';
        }
    }

    // E: ≥ 1.3 标红（由 updateEColor 处理）
    // EA融合: ≥ 1.3 m/s 标红
    updateEAFusionColor();
    // E/E′: ≥ 11 标红
    updateEOverEPrimeColor();

    // TAPSE/Ao 显示区：与其它标红逻辑一并刷新（避免仅依赖 input 时偶发不同步）
    calculateTapseOverAo();
}

// 更新所有输入框的颜色（兼容旧函数名）
function updateIVSdAndLVWsColor() {
    updateReferenceBasedInputColors();
    updateSpecialLogicInputColors();
}
