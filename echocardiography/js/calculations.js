
// 计算EDVI的函数
// EDVI = EDV / BSA, BSA = 0.101 * 体重^(2/3)
function calculateEDVI() {
    const edv = parseFloat(parameters['EDV']);
    const weight = parseFloat(parameters['体重']);
    const edviDisplay = document.getElementById('edviDisplay');

    if (!edv || !weight || isNaN(edv) || isNaN(weight) || weight <= 0) {
        edviDisplay.textContent = '-';
        edviDisplay.style.color = ''; // 重置颜色
        delete parameters['EDVI'];
        return;
    }

    // 计算BSA: BSA = 0.101 * 体重^(2/3)
    const bsa = 0.101 * Math.pow(weight, 2/3);

    // 计算EDVI: EDVI = EDV / BSA
    const edvi = edv / bsa;

    // 保留0位小数（整数）
    const edviRounded = edvi.toFixed(0);
    const edviNum = parseFloat(edviRounded);

    // 更新显示
    edviDisplay.textContent = edviRounded;

    // 如果EDVI > 100，标红显示
    if (edviNum > 100) {
        edviDisplay.style.color = 'red';
    } else {
        edviDisplay.style.color = '';
    }

    // 存储到parameters中，供模板生成使用
    parameters['EDVI'] = edviRounded;
}

// 计算ESVI的函数
// ESVI = ESV / BSA, BSA = 0.101 * 体重^(2/3)
function calculateESVI() {
    const esv = parseFloat(parameters['ESV']);
    const weight = parseFloat(parameters['体重']);
    const esviDisplay = document.getElementById('esviDisplay');

    if (!esv || !weight || isNaN(esv) || isNaN(weight) || weight <= 0) {
        esviDisplay.textContent = '-';
        esviDisplay.style.color = ''; // 重置颜色
        delete parameters['ESVI'];
        return;
    }

    // 计算BSA: BSA = 0.101 * 体重^(2/3)
    const bsa = 0.101 * Math.pow(weight, 2/3);

    // 计算ESVI: ESVI = ESV / BSA
    const esvi = esv / bsa;

    // 保留0位小数（整数）
    const esviRounded = esvi.toFixed(0);
    const esviNum = parseFloat(esviRounded);

    // 更新显示
    esviDisplay.textContent = esviRounded;

    // 如果ESVI > 35，标红显示
    if (esviNum > 35) {
        esviDisplay.style.color = 'red';
    } else {
        esviDisplay.style.color = '';
    }

    // 存储到parameters中，供模板生成使用
    parameters['ESVI'] = esviRounded;
}

// 计算并显示 LVIDDN 值
// LVIDDN = LVDd（cm）/[体重（kg）^0.294]
function calculateLVIDDN() {
    const lvddInput = document.querySelector('input[data-param="LVDd"]');
    const weightInput = document.getElementById('weightInput');
    const lviddnDisplay = document.getElementById('lviddnDisplay');

    if (lvddInput && weightInput && lviddnDisplay) {
        const lvddValue = parseFloat(lvddInput.value.trim());
        const weightValue = parseFloat(weightInput.value.trim());

        // 计算 LVIDDN
        if (!isNaN(lvddValue) && lvddValue > 0 && !isNaN(weightValue) && weightValue > 0) {
            // LVDd单位是mm，需要转换为cm
            const lvddCm = lvddValue / 10;
            // 计算公式: LVIDDN = LVDd（cm）/[体重（kg）^0.294]
            const weightPower = Math.pow(weightValue, 0.294);
            const lviddn = lvddCm / weightPower;

            // 保留适当的小数位数（通常保留2位小数）
            const lviddnRounded = lviddn.toFixed(2);

            lviddnDisplay.textContent = `LVIDDN ${lviddnRounded}`;

            // 同步到 parameters，供"结论"规则读取（例如 LVIDDN >= 1.7）
            parameters['LVIDDN'] = parseFloat(lviddnRounded);

            // 当 LVIDDN≥1.7 时，数值文本显示为红色，否则显示为黑色
            if (lviddn >= 1.7) {
                lviddnDisplay.style.color = '#e74c3c'; // 红色
            } else {
                lviddnDisplay.style.color = '#000000'; // 黑色
            }
        } else {
            // 即使没有输入值，也显示默认文本
            lviddnDisplay.textContent = 'LVIDDN -';
            lviddnDisplay.style.color = '#666'; // 灰色，表示暂无数据

            // 清空参数，避免旧值影响后续结论生成
            delete parameters['LVIDDN'];
        }
    }
}

// 自动计算 SI（球形指数）
// SI = 左心室长度 / 左心室宽度
function calculateSI() {
    const lvLengthInput = document.querySelector('input[data-param="左心室长度"]');
    const lvWidthInput = document.querySelector('input[data-param="左心室宽度"]');
    const siInput = document.querySelector('input[data-param="SI"]');

    if (!lvLengthInput || !lvWidthInput || !siInput) return;
    if (siInput.dataset.siManual === '1') {
        updateSpecialLogicInputColors();
        return;
    }

    const lvLength = parseFloat(lvLengthInput.value.trim().replace(',', '.'));
    const lvWidth = parseFloat(lvWidthInput.value.trim().replace(',', '.'));

    if (!Number.isNaN(lvLength) && !Number.isNaN(lvWidth) && lvWidth > 0) {
        const siValue = (lvLength / lvWidth).toFixed(2);
        siInput.value = siValue;
        parameters['SI'] = siValue;
    } else {
        siInput.value = '';
        delete parameters['SI'];
    }

    updateSpecialLogicInputColors();
}

// 自动计算 EDV 函数（Teicholz公式）
// EDV = [7/(2.4+LVDd)] * (LVDd^3)
function calculateEDV() {
    const lvddInput = document.querySelector('input[data-param="LVDd"]');
    const edvInput = document.querySelector('input[data-param="EDV"]');

    if (lvddInput && edvInput) {
        const lvddValueStr = lvddInput.value.trim();
        const lvddValue = parseFloat(lvddValueStr);

        // 如果LVDd为空或无效，清空EDV
        if (isNaN(lvddValue) || lvddValue <= 0) {
            edvInput.value = '';
            delete parameters['EDV'];
            delete parameters['EDV_raw'];
            const edviDisplay = document.getElementById('edviDisplay');
            if (edviDisplay) {
                edviDisplay.textContent = '-';
                edviDisplay.style.color = '';
            }
            delete parameters['EDVI'];
            return;
        }

        // 计算应该得到的EDV值
        const lvddCm = lvddValue / 10;
        const expectedEdv = (7 / (2.4 + lvddCm)) * Math.pow(lvddCm, 3);
        const expectedEdvRounded = (expectedEdv > 0.1 && expectedEdv < 1) ? expectedEdv.toFixed(1) : expectedEdv.toFixed(0);

        // 获取当前EDV值
        const edvCurrentValue = edvInput.value.trim();

        // 如果EDV输入框为空，或者是自动计算的值（与当前LVDd计算出的值匹配），则更新
        // 如果EDV输入框有值且与计算值不匹配，可能是用户手动输入的，不覆盖
        // 但如果EDV的值与计算值相差很大（超过50%），认为LVDd变化了，需要重新计算
        const shouldUpdate = !edvCurrentValue ||
                            edvCurrentValue === expectedEdvRounded ||
                            (Math.abs(parseFloat(edvCurrentValue) - expectedEdv) / Math.max(expectedEdv, 1) > 0.5);

        if (shouldUpdate) {
            // 重置颜色
            edvInput.style.color = '';

            // 使用已计算的EDV值
            const edv = expectedEdv;
            const edvRounded = expectedEdvRounded;

            edvInput.value = edvRounded;
            parameters['EDV'] = edvRounded;
            // 保存完整小数值用于后续计算
            parameters['EDV_raw'] = edv;

            // 如果EDV变化，仅自动计算EDVI（不再自动更新EF）
            calculateEDVI();
        }
    }
}

// 自动计算 ESV 函数（Teicholz公式）
// ESV = [7/(2.4+LVDs)] * (LVDs^3)
function calculateESV() {
    const lvdsInput = document.querySelector('input[data-param="LVDs"]');
    const esvInput = document.querySelector('input[data-param="ESV"]');

    if (lvdsInput && esvInput) {
        const lvdsValueStr = lvdsInput.value.trim();
        const lvdsValue = parseFloat(lvdsValueStr);

        // 如果LVDs为空或无效，清空ESV
        if (isNaN(lvdsValue) || lvdsValue <= 0) {
            esvInput.value = '';
            delete parameters['ESV'];
            delete parameters['ESV_raw'];
            const esviDisplay = document.getElementById('esviDisplay');
            if (esviDisplay) {
                esviDisplay.textContent = '-';
                esviDisplay.style.color = '';
            }
            delete parameters['ESVI'];
            return;
        }

        // 计算应该得到的ESV值
        const lvdsCm = lvdsValue / 10;
        const expectedEsv = (7 / (2.4 + lvdsCm)) * Math.pow(lvdsCm, 3);
        const expectedEsvRounded = (expectedEsv > 0.1 && expectedEsv < 1) ? expectedEsv.toFixed(1) : expectedEsv.toFixed(0);

        // 获取当前ESV值
        const esvCurrentValue = esvInput.value.trim();

        // 如果ESV输入框为空，或者是自动计算的值（与当前LVDs计算出的值匹配），则更新
        // 如果ESV输入框有值且与计算值不匹配，可能是用户手动输入的，不覆盖
        // 但如果ESV的值与计算值相差很大（超过50%），认为LVDs变化了，需要重新计算
        const shouldUpdate = !esvCurrentValue ||
                            esvCurrentValue === expectedEsvRounded ||
                            (Math.abs(parseFloat(esvCurrentValue) - expectedEsv) / Math.max(expectedEsv, 1) > 0.5);

        if (shouldUpdate) {
            // 重置颜色
            esvInput.style.color = '';

            // 使用已计算的ESV值
            const esv = expectedEsv;
            const esvRounded = expectedEsvRounded;

            esvInput.value = esvRounded;
            parameters['ESV'] = esvRounded;
            // 保存完整小数值用于后续计算
            parameters['ESV_raw'] = esv;

            // 保持输入框可编辑，不禁用

            // 如果ESV变化，仅自动计算ESVI（不再自动更新EF）
            calculateESVI();
        }
    }
}

// 自动计算 FS 函数
// FS = [LVDd - LVDs] / LVDd * 100，结果保留整数
// 依据 LVDd、LVDs 输入值的变化实时更新，同时保留手动输入功能（用户可随时手动修改）
function calculateFS() {
    const lvddInput = document.querySelector('input[data-param="LVDd"]');
    const lvdsInput = document.querySelector('input[data-param="LVDs"]');
    const fsInput = document.querySelector('input[data-param="FS"]');

    if (lvddInput && lvdsInput && fsInput) {
        const lvddValue = parseFloat(lvddInput.value.trim());
        const lvdsValue = parseFloat(lvdsInput.value.trim());

        // 重置颜色
        fsInput.style.color = '';

        if (!isNaN(lvddValue) && !isNaN(lvdsValue) && lvddValue > 0) {
            // FS = [LVDd - LVDs] / LVDd * 100
            const fs = ((lvddValue - lvdsValue) / lvddValue) * 100;
            const fsRounded = Math.round(fs).toString();

            fsInput.value = fsRounded;
            parameters['FS'] = fsRounded;
        } else {
            // 如果 LVDd 或 LVDs 为空或无效，清空 FS
            fsInput.value = '';
            delete parameters['FS'];
        }
    }
}

// 自动计算 EF 函数
// EF = [EDV(Teich) - ESV(Teich)] / EDV(Teich) * 100，结果保留整数
// 依据 Teich 所在输入框的 EDV、ESV 数值变化实时更新，同时保留手动输入功能（用户可随时手动修改）
function calculateEF() {
    const edvInput = document.querySelector('input[data-param="EDV"]');
    const esvInput = document.querySelector('input[data-param="ESV"]');
    const efInput = document.querySelector('input[data-param="EF"]');

    if (edvInput && esvInput && efInput) {
        const edvValue = parseFloat(edvInput.value.trim());
        const esvValue = parseFloat(esvInput.value.trim());

        // 重置颜色
        efInput.style.color = '';

        // 优先使用完整小数值（EDV/ESV 由 LVDd/LVDs 自动计算时保存），否则使用 Teich 输入框的值
        const edvForCalc = parameters['EDV_raw'] !== undefined ? parameters['EDV_raw'] : edvValue;
        const esvForCalc = parameters['ESV_raw'] !== undefined ? parameters['ESV_raw'] : esvValue;

        if (!isNaN(edvForCalc) && !isNaN(esvForCalc) && edvForCalc > 0) {
            // EF = [EDV - ESV] / EDV * 100
            const ef = ((edvForCalc - esvForCalc) / edvForCalc) * 100;
            const efRounded = Math.round(ef).toString();

            efInput.value = efRounded;
            parameters['EF'] = efRounded;
        } else {
            // 如果 EDV 或 ESV 为空或无效，清空 EF
            efInput.value = '';
            delete parameters['EF'];
        }
    }
}

// 更新LA/AO输入框的颜色
function updateLAOverAOColor() {
    const laAoInput = document.querySelector('input[data-param="LA/AO"]');
    if (!laAoInput) return;

    const laAoValue = parseFloat(laAoInput.value.trim());

    // 重置颜色
    laAoInput.style.color = '';

    if (!isNaN(laAoValue)) {
        // 如果LA/AO ≥ 1.6，则标红
        if (laAoValue >= 1.6) {
            laAoInput.style.color = 'red';
        }
    }
}

// readme 2.2：PA/Ao = PA / AO（2）；AO（2）为空时用主动脉 AO；保留 2 位小数（仅「右心高阶」开启时生效）
function calculatePAOverAo() {
    if (!rightHeartAdvancedEnabled) return;
    const paAoInputEarly = document.querySelector('input[data-param="PA/Ao"]');
    if (paAoInputEarly && paAoInputEarly.dataset.paAoManual === '1') {
        updatePAOverAoColor();
        return;
    }
    const paInput = document.querySelector('input[data-param="PA"]');
    const ao2Input = document.querySelector('input[data-param="AO2"]');
    const aoInput = document.querySelector('input[data-param="AO"]');
    const paAoInput = document.querySelector('input[data-param="PA/Ao"]');
    if (!paInput || !paAoInput) return;

    const paValue = parseFloat(paInput.value.trim());
    const ao2Raw = ao2Input ? ao2Input.value.trim() : '';
    const aoFallback = aoInput ? parseFloat(aoInput.value.trim()) : NaN;

    let denom = NaN;
    if (ao2Raw !== '') {
        const ao2 = parseFloat(ao2Raw);
        if (!isNaN(ao2) && ao2 !== 0) {
            denom = ao2;
        }
    } else if (!isNaN(aoFallback) && aoFallback !== 0) {
        denom = aoFallback;
    }

    paAoInput.style.color = '';

    if (!isNaN(paValue) && !isNaN(denom) && denom !== 0) {
        const ratio = (paValue / denom).toFixed(2);
        paAoInput.value = ratio;
        parameters['PA/Ao'] = ratio;
        const n = parseFloat(ratio);
        if (!isNaN(n) && n >= 1.1) {
            paAoInput.style.color = 'red';
        }
    } else {
        paAoInput.value = '';
        delete parameters['PA/Ao'];
    }
}

function updatePAOverAoColor() {
    const paAoInput = document.querySelector('input[data-param="PA/Ao"]');
    if (!paAoInput) return;
    paAoInput.style.color = '';
    const n = parseFloat(paAoInput.value.trim());
    if (!isNaN(n) && n >= 1.1) {
        paAoInput.style.color = 'red';
    }
}

// 自动计算 LA/AO 函数
function calculateLAOverAO() {
    const laInput = document.querySelector('input[data-param="LA"]');
    const aoInput = document.querySelector('input[data-param="AO"]');
    const laAoInput = document.querySelector('input[data-param="LA/AO"]');

    if (laInput && aoInput && laAoInput) {
        const laValue = parseFloat(laInput.value.trim());
        const aoValue = parseFloat(aoInput.value.trim());

        // 重置颜色
        laAoInput.style.color = '';

        if (!isNaN(laValue) && !isNaN(aoValue) && aoValue !== 0) {
            const laAoValue = (laValue / aoValue).toFixed(2);
            laAoInput.value = laAoValue;
            parameters['LA/AO'] = laAoValue;
            // LA/AO 始终保留手动输入功能，不禁用

            // 根据数值标红：如果LA/AO ≥ 1.6，则标红
            const laAoNum = parseFloat(laAoValue);
            if (laAoNum >= 1.6) {
                laAoInput.style.color = 'red';
            }
        } else {
            // 如果 LA 或 AO 为空或无效，清空 LA/AO
            laAoInput.value = '';
            delete parameters['LA/AO'];
            // 更新颜色（可能用户手动输入了值）
            updateLAOverAOColor();
        }
    }
}

// 计算LAVi的函数
// LAVi = LA Volume / 体重
function calculateLAVi() {
    const laVolume = parseFloat(parameters['LA Volume']);
    const weight = parseFloat(parameters['体重']);
    const laviDisplay = document.getElementById('laviDisplay');

    if (!laviDisplay) return;

    if (!laVolume || !weight || isNaN(laVolume) || isNaN(weight) || weight <= 0) {
        laviDisplay.textContent = '-';
        laviDisplay.classList.remove('red');
        delete parameters['LAVi'];
        return;
    }

    // 计算LAVi: LAVi = LA Volume / 体重
    const lavi = laVolume / weight;

    // 保留2位小数
    const laviRounded = lavi.toFixed(2);
    const laviNum = parseFloat(laviRounded);

    // 更新显示
    laviDisplay.textContent = laviRounded;

    // 如果LAVi ≥ 1.1，标红显示
    if (laviNum >= 1.1) {
        laviDisplay.classList.add('red');
    } else {
        laviDisplay.classList.remove('red');
    }

    // 存储到parameters中，供模板生成使用
    parameters['LAVi'] = laviRounded;
}

// 根据参考范围显示/隐藏 EA融合 输入框
function updateEAFusionVisibility() {
    const eaFusionInput = document.querySelector('input[data-param="EA融合"]');
    if (eaFusionInput) {
        const eaFusionItem = eaFusionInput.closest('.other-param-item');
        if (eaFusionItem) {
            // 仅在"猫"或"猫（含体重）"时显示
            if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫（含体重）') {
                eaFusionItem.style.display = 'block';
                updateEAInputsState();
                updateEAFusionColor();
            } else {
                eaFusionItem.style.display = 'none';
                // 隐藏时清空EA融合的值
                eaFusionInput.value = '';
                eaFusionInput.style.color = '';
                delete parameters['EA融合'];
                // 重新启用 E、A、E/A 输入框
                updateEAInputsState();
            }
        }
    }
}

// 仅「猫」「猫（含体重）」显示 LAD Max；数值 ≥16 标红（readme）
function updateMaxLadVisibility() {
    const row = document.getElementById('maxLadRow');
    const input = document.querySelector('input[data-param="LAD Max"]');
    if (!row || !input) return;
    if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫（含体重）') {
        row.style.display = '';
    } else {
        row.style.display = 'none';
        input.value = '';
        input.style.color = '';
        delete parameters['LAD Max'];
    }
    updateMaxLadColor();
}

// 参考为「猫」时不显示 LA Volume / LAVi（犬等非猫参考仍显示）
function updateLaVolumeVisibility() {
    const row = document.getElementById('laVolumeRow');
    if (!row) return;
    const laInput = row.querySelector('input[data-param="LA Volume"]');
    const laviDisplay = document.getElementById('laviDisplay');

    if (selectedReferenceRange === '猫') {
        row.style.display = 'none';
        if (laInput) {
            laInput.value = '';
            laInput.style.color = '';
        }
        if (laviDisplay) laviDisplay.textContent = '-';
        delete parameters['LA Volume'];
        delete parameters['LAVi'];
        delete parameters['LA Volume显示'];
        const showBtn = document.querySelector('#laVolumeInputItem button[data-param="LA Volume显示"][data-value="显示"]');
        if (showBtn) showBtn.classList.remove('active');
    } else {
        row.style.display = 'flex';
    }
}

function updateMaxLadColor() {
    const input = document.querySelector('input[data-param="LAD Max"]');
    if (!input) return;
    const row = document.getElementById('maxLadRow');
    if (row && row.style.display === 'none') {
        input.style.color = '';
        return;
    }
    const raw = (input.value || '').toString().trim();
    if (!raw) {
        input.style.color = '';
        return;
    }
    const v = parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(v)) {
        input.style.color = '';
        return;
    }
    input.style.color = v >= 16 ? 'red' : '';
}

// 根据 EA融合 的值启用/禁用 E、A、E/A 输入框
function updateEAInputsState() {
    const eaFusionInput = document.querySelector('input[data-param="EA融合"]');
    const eInput = document.querySelector('input[data-param="E"]');
    const aInput = document.querySelector('input[data-param="A"]');
    const eAInput = document.querySelector('input[data-param="E/A"]');

    if (eaFusionInput && eInput && aInput && eAInput) {
        // 如果EA融合输入框被隐藏，直接启用E、A、E/A输入框
        const eaFusionItem = eaFusionInput.closest('.other-param-item');
        if (eaFusionItem && eaFusionItem.style.display === 'none') {
            eInput.disabled = false;
            aInput.disabled = false;
            eAInput.disabled = false;
            // 更新E、E/A的颜色显示
            updateEColor();
            updateEAColor();
            eaFusionInput.style.color = '';
            return;
        }

        const eaFusionValue = eaFusionInput.value.trim();

        // 如果 EA融合 有值，禁用 E、A、E/A 输入框
        if (eaFusionValue) {
            eInput.disabled = true;
            aInput.disabled = true;
            eAInput.disabled = true;
            // 禁用时重置颜色
            eInput.style.color = '';
            eAInput.style.color = '';
            updateEAFusionColor();
        } else {
            // 如果 EA融合 为空，启用 E、A、E/A 输入框
            eInput.disabled = false;
            aInput.disabled = false;
            eAInput.disabled = false;
            // 更新E、E/A的颜色显示
            updateEColor();
            updateEAColor();
            updateEAFusionColor();
        }
    }
}

// 检查 EA融合 值（单位 m/s）：当值 ≥ 1.3 时标红（与 E 峰值阈值一致）
function updateEAFusionColor() {
    const eaFusionInput = document.querySelector('input[data-param="EA融合"]');
    if (!eaFusionInput) return;

    const eaFusionItem = eaFusionInput.closest('.other-param-item');
    if (eaFusionItem && eaFusionItem.style.display === 'none') {
        eaFusionInput.style.color = '';
        return;
    }

    const raw = (eaFusionInput.value || '').toString().trim();
    if (!raw) {
        eaFusionInput.style.color = '';
        return;
    }

    // 兼容 ≥1.3、1,35（小数逗号）、1.3m/s 等
    const cleaned = raw
        .replace(/[＜＞<＜>=＝≤≥]/g, '')
        .replace(/m\/s/ig, '')
        .replace(/,/g, '.')
        .trim();
    const num = parseFloat(cleaned);

    if (!isNaN(num) && num >= 1.3) {
        eaFusionInput.style.color = 'red';
    } else {
        eaFusionInput.style.color = '';
    }
}

// 检查E/A值并设置颜色（当E/A＞2时标红）
function updateEAColor() {
    const eAInput = document.querySelector('input[data-param="E/A"]');
    if (eAInput) {
        if (eAInput.disabled) {
            eAInput.style.color = '';
            return;
        }
        const eAValue = eAInput.value.trim();
        let shouldRed = false;
        if (eAValue === '＞2') {
            shouldRed = true;
        } else {
            const num = parseFloat(eAValue.replace(/[＞<＜]/g, '').trim());
            if (!isNaN(num) && num > 2) {
                shouldRed = true;
            }
        }
        eAInput.style.color = shouldRed ? 'red' : '';
    }
}

// 检查E值并设置颜色（当E≥1.3时标红）
function updateEColor() {
    const eInput = document.querySelector('input[data-param="E"]');
    if (eInput) {
        // 如果输入框被禁用（EA融合有值），不进行颜色更新
        if (eInput.disabled) {
            eInput.style.color = '';
            return;
        }

        const eValue = parseFloat(eInput.value.trim());

        if (!isNaN(eValue)) {
            // 如果E值 ≥ 1.3，标红
            if (eValue >= 1.3) {
                eInput.style.color = 'red';
            } else {
                eInput.style.color = '';
            }
        } else {
            // 如果值无效或为空，重置颜色
            eInput.style.color = '';
        }
    }
}

// 自动计算 E/A 函数
function calculateEOverA() {
    const eInput = document.querySelector('input[data-param="E"]');
    const aInput = document.querySelector('input[data-param="A"]');
    const eAInput = document.querySelector('input[data-param="E/A"]');

    if (eInput && aInput && eAInput) {
        // 如果输入框被禁用（EA融合有值），不进行计算
        if (eInput.disabled || aInput.disabled || eAInput.disabled) {
            return;
        }

        const eValue = parseFloat(eInput.value.trim());
        const aValue = parseFloat(aInput.value.trim());

        // 重置颜色
        eAInput.style.color = '';

        if (!isNaN(eValue) && !isNaN(aValue) && aValue !== 0) {
            const eAValue = eValue / aValue;
            let eAText = '';

            // 根据规则输出
            if (eAValue < 1) {
                eAText = '＜1';
            } else if (eAValue > 2) {
                eAText = '＞2';
            } else {
                eAText = '＞1';
            }

            eAInput.value = eAText;
            parameters['E/A'] = eAText;
        } else {
            // 如果 E 或 A 为空或无效，清空 E/A
            eAInput.value = '';
            delete parameters['E/A'];
            eAInput.style.color = '';
        }
    }

    // 更新E值的颜色显示
    updateEColor();
    updateEAColor();
}

// 自动计算 E/E'（E′ 在气泡内输入；主框可手动覆盖）
function calculateEOverEPrime() {
    const eInput = document.querySelector('input[data-param="E"]');
    const ePrimeInput = document.querySelector('input[data-param="E\'"]');
    const eOverEInput = document.querySelector('input[data-param="E/E\'"]');

    if (!eInput || !ePrimeInput || !eOverEInput) return;
    if (eOverEInput.disabled) {
        eOverEInput.style.color = '';
        return;
    }
    if (eOverEInput.dataset.eeManual === '1') {
        const raw = (eOverEInput.value || '').trim();
        if (raw) {
            parameters["E/E'"] = raw;
        } else {
            delete parameters["E/E'"];
            delete eOverEInput.dataset.eeManual;
        }
        updateEOverEPrimeColor();
        return;
    }

    const eValue = parseFloat((eInput.value || '').trim());
    const ePrimeValue = parseFloat((ePrimeInput.value || '').trim());

    if (!isNaN(eValue) && !isNaN(ePrimeValue) && ePrimeValue !== 0) {
        const eOverEValue = (eValue / ePrimeValue).toFixed(2);
        eOverEInput.value = eOverEValue;
        parameters["E/E'"] = eOverEValue;
    } else {
        eOverEInput.value = '';
        delete parameters["E/E'"];
    }
    updateEOverEPrimeColor();
}

/** E/E′ 主框：数值 ≥ 11 时标红 */
function updateEOverEPrimeColor() {
    const el = document.getElementById('eePrimeRatioInput');
    if (!el) return;
    if (el.disabled) {
        el.style.color = '';
        return;
    }
    const raw = (el.value || '').toString().trim();
    if (!raw) {
        el.style.color = '';
        return;
    }
    const cleaned = raw
        .replace(/[＜＞<＜>=＝≤≥]/g, '')
        .replace(/,/g, '.')
        .trim();
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 11) {
        el.style.color = 'red';
    } else {
        el.style.color = '';
    }
}

/** AT/ET：由气泡内 AT、ET 自动计算；主框可手动覆盖。比值≤0.30 标红 */
function calculateAtOverEt() {
    const atInput = document.querySelector('input[data-param="AT"]');
    const etInput = document.querySelector('input[data-param="ET"]');
    const atetInput = document.getElementById('atetRatioInput');
    if (!atInput || !etInput || !atetInput) return;
    if (atetInput.disabled) return;

    if (atetInput.dataset.atetManual === '1') {
        const raw = (atetInput.value || '').trim();
        const n = parseFloat(raw);
        if (raw) {
            parameters['AT/ET'] = raw;
            atetInput.style.color = (!isNaN(n) && n <= 0.30) ? 'red' : '';
        } else {
            delete parameters['AT/ET'];
            atetInput.style.color = '';
        }
        return;
    }

    const at = parseFloat((atInput.value || '').trim());
    const et = parseFloat((etInput.value || '').trim());

    if (!isNaN(at) && !isNaN(et) && et !== 0) {
        const ratio = at / et;
        const str = ratio.toFixed(2);
        atetInput.value = str;
        parameters['AT/ET'] = str;
        const n = parseFloat(str);
        atetInput.style.color = (!isNaN(n) && n <= 0.30) ? 'red' : '';
    } else {
        atetInput.value = '';
        atetInput.style.color = '';
        delete parameters['AT/ET'];
    }
}
