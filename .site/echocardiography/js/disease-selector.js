// 疾病类型按钮点击事件（顶栏）
let selectedDiseaseType = '';

function isMitralRegurgTagActive() {
    const mitralBtn = document.querySelector('.valve-flow-tag[data-tag="二尖瓣反流"]');
    return !!(mitralBtn && mitralBtn.classList.contains('active'));
}

// dp/dt：MMVD 或「二尖瓣反流」激活时显示输入框；有数值才写入所见
function updateDpdtVisibilityByMitralRegurg() {
    const dpdtItem = document.getElementById('dpdtInputItem');
    if (!dpdtItem) return;

    const mitralActive = isMitralRegurgTagActive();
    const shouldShowField = selectedDiseaseType === 'MMVD' || mitralActive;

    if (shouldShowField) {
        dpdtItem.style.display = 'flex';
    } else {
        dpdtItem.style.display = 'none';
        delete parameters['dp/dt'];
        const dpdtInput = dpdtItem.querySelector('input[data-param="dp/dt"]');
        if (dpdtInput) dpdtInput.value = '';
    }
    updateSpecialLogicInputColors();
}

// 通用的疾病类型处理函数
function handleDiseaseTypeChange(diseaseType) {
    saveSimpsonDataToCache();
    unlockRightSidebarTemplateText();
    // 再次点击当前疾病标签表示取消选择；无疾病选择时回到「正常」。
    const isDeselecting = selectedDiseaseType === diseaseType && diseaseType !== 'Normal';
    selectedDiseaseType = isDeselecting ? 'Normal' : diseaseType;

    // 移除所有按钮的激活状态，再激活当前或兜底的「正常」标签。
    document.querySelectorAll('.disease-tag').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = document.querySelector(`.disease-tag[data-value="${selectedDiseaseType}"]`);
    if (activeButton) activeButton.classList.add('active');

        // 根据疾病类型自动选择参考范围
        const referenceRangeSelect = document.getElementById('referenceRangeSelect');
        if (referenceRangeSelect) {
            // 仅当用户尚未选择参考范围（或当前参考范围与目标动物类型不匹配）时才自动切换
            const currentRange = selectedReferenceRange;
            const isDogRange = currentRange === '犬≤3kg' || currentRange === '犬＞3kg' || currentRange === '金毛';
            const isCatRange = currentRange === '猫' || currentRange === '猫（含体重）';

            // DCM、PDA、MMVD、Normal → 犬类疾病，仅在当前为空或为猫/兔参考时才切换为"犬＞3kg"
            if (selectedDiseaseType === 'DCM' || selectedDiseaseType === 'PDA' || selectedDiseaseType === 'MMVD' || selectedDiseaseType === 'Normal') {
                if (!currentRange || isCatRange || currentRange === '兔子') {
                    referenceRangeSelect.value = '犬＞3kg';
                    selectedReferenceRange = '犬＞3kg';
                }
                // 根据动物类型设置心率默认值
                setHeartRateDefault();
                updateReferenceValues();
                updateWeightReferenceDisplay();
                // 默认不自动激活含辛普森测量（仅用户点击时启用）
            }
            // HCM、RCM、TOF → 猫类疾病，仅在当前为空或为犬/兔参考时才切换为"猫"
            else if (selectedDiseaseType === 'HCM' || selectedDiseaseType === 'RCM' || selectedDiseaseType === 'TOF') {
                if (!currentRange || isDogRange || currentRange === '兔子') {
                    referenceRangeSelect.value = '猫';
                    selectedReferenceRange = '猫';
                }
                // 根据动物类型设置心率默认值
                setHeartRateDefault();
                updateSimpsonButtonVisibility();
                toggleWeightInput();
                updateReferenceValues();
            }
        }

        // 更新EA融合输入框的显示状态
        updateEAFusionVisibility();
        updateMaxLadVisibility();
        updateLaVolumeVisibility();

    // 如果当前选择的参考范围是犬≤3kg、犬＞3kg、金毛，自动激活含辛普森测量按钮
    const simpsonButton = document.getElementById('simpsonButton');
        if (!suppressInitialSimpsonAutoActivation && simpsonButton && selectedReferenceRange) {
        if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫（含体重）') {
            // 选择猫或猫（含体重）时，默认不激活含辛普森测量
            if (simpsonEnabled) {
                simpsonButton.classList.remove('active');
                simpsonEnabled = false;
                // 隐藏辛普森输入框
                toggleSimpsonInputs();
            }
        }
    }

        // 根据参考范围显示/隐藏体重输入框
        toggleWeightInput();

        // 显示/隐藏MMVD特定输入框
        const mmvdInputs = document.getElementById('mmvdSpecificInputs');
        if (mmvdInputs) {
            if (selectedDiseaseType === 'MMVD') {
                mmvdInputs.style.display = 'block';
                // 默认选择"轻度"（与 readme 规则一致）
                const severityButtons = mmvdInputs.querySelector('.regurgitation-severity-buttons[data-param="脱垂程度"]');
                if (severityButtons) {
                    const hasActive = severityButtons.querySelector('.regurgitation-severity-btn.active');
                    if (!hasActive) {
                        const mildBtn = severityButtons.querySelector('.regurgitation-severity-btn[data-value="轻度"]');
                        if (mildBtn) {
                            mildBtn.classList.add('active');
                            parameters['脱垂程度'] = mildBtn.getAttribute('data-value');
                        }
                    }
                }
            } else {
                mmvdInputs.style.display = 'none';
                // 清除MMVD特定参数
                delete parameters['二尖瓣前叶厚度'];
                delete parameters['脱垂程度'];
                delete parameters['腱索断裂类型'];
                // 清除输入框的值
                const thicknessInput = mmvdInputs.querySelector('input[data-param="二尖瓣前叶厚度"]');
                if (thicknessInput) thicknessInput.value = '';
                // 清除脱垂程度按钮组的激活状态
                const severityButtons = mmvdInputs.querySelector('.regurgitation-severity-buttons[data-param="脱垂程度"]');
                if (severityButtons) {
                    severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                }
                // 清除腱索断裂按钮组的激活状态
                const chordButtons = mmvdInputs.querySelector('.regurgitation-severity-buttons[data-param="腱索断裂类型"]');
                if (chordButtons) {
                    chordButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                }
            }
        }

        // HCM 特征标签：仅在 HCM 模型下显示；切离 HCM 时一并清除激活态。
        const myocardiumFeatureTagRow = document.getElementById('myocardiumFeatureTagRow');
        if (myocardiumFeatureTagRow) {
            myocardiumFeatureTagRow.classList.toggle('hcm-features-visible', selectedDiseaseType === 'HCM');
        }
        if (selectedDiseaseType !== 'HCM') {
            if (typeof clearHcmFeatureTags === 'function') clearHcmFeatureTags();
        }

        // DCM：EPSS / SI（球形指数）
        const dcmInputs = document.getElementById('dcmSpecificInputs');
        if (dcmInputs) {
            if (selectedDiseaseType === 'DCM') {
                dcmInputs.style.display = 'grid';
            } else {
                dcmInputs.style.display = 'none';
                delete parameters['EPSS'];
                delete parameters['SI'];
                delete parameters['左心室长度'];
                delete parameters['左心室宽度'];
                const epssInput = dcmInputs.querySelector('input[data-param="EPSS"]');
                const siInput = dcmInputs.querySelector('input[data-param="SI"]');
                const lvLengthInput = dcmInputs.querySelector('input[data-param="左心室长度"]');
                const lvWidthInput = dcmInputs.querySelector('input[data-param="左心室宽度"]');
                if (epssInput) {
                    epssInput.value = '';
                    epssInput.style.color = '';
                }
                if (siInput) {
                    siInput.value = '';
                    siInput.style.color = '';
                    delete siInput.dataset.siManual;
                }
                if (lvLengthInput) lvLengthInput.value = '';
                if (lvWidthInput) lvWidthInput.value = '';
            }
        }

        updateReferenceValues();

        // 根据疾病类型自动勾选瓣口血流标签
        setDefaultValveFlowTags(selectedDiseaseType);
        updateDpdtVisibilityByMitralRegurg();

        generateTemplate();
}

// 疾病模型切换时保留用户已选择的瓣口血流标签；仅 MMVD 确保二尖瓣反流处于激活状态。
function setDefaultValveFlowTags(diseaseType) {
    const normalButton = document.querySelector('.valve-flow-tag-normal[data-tag="各瓣口血流正常"]');
    const mitralButton = document.querySelector('.valve-flow-tag-red[data-tag="二尖瓣反流"]');

    if (diseaseType === 'Normal') {
        if (!normalButton || normalButton.classList.contains('active')) return;

        // 「各瓣口血流正常」与所有反流标签互斥，切回正常时同步清除反流输入项。
        document.querySelectorAll('.valve-flow-tag-red.active').forEach(button => {
            button.classList.remove('active');
            toggleRegurgitationVelocityInput(button.getAttribute('data-tag'), false);
        });
        normalButton.classList.add('active');
        return;
    }

    if (diseaseType !== 'MMVD') return;

    if (!mitralButton || mitralButton.classList.contains('active')) return;

    // 「各瓣口血流正常」与反流标签互斥；切换至 MMVD 时仅撤销该互斥状态，保留其他反流标签。
    if (normalButton) normalButton.classList.remove('active');
    mitralButton.classList.add('active');
    toggleRegurgitationVelocityInput('二尖瓣反流', true);
}

// 顶栏疾病类型按钮点击事件
document.querySelectorAll('.disease-tag').forEach(button => {
    button.addEventListener('click', function() {
        const diseaseType = this.getAttribute('data-value');
        handleDiseaseTypeChange(diseaseType);
        collapseMobileDiseaseModel();
    });
});

function collapseMobileDiseaseModel() {
    if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;
    const selector = document.querySelector('.top-disease-selector');
    const toggle = document.getElementById('mobileDiseaseToggle');
    if (selector) selector.classList.remove('mobile-disease-expanded');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function setupMobileDiseaseToggle() {
    const selector = document.querySelector('.top-disease-selector');
    const toggle = document.getElementById('mobileDiseaseToggle');
    if (!selector || !toggle) return;

    toggle.addEventListener('click', function() {
        const expanded = selector.classList.toggle('mobile-disease-expanded');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    const mediaQuery = window.matchMedia && window.matchMedia('(max-width: 768px)');
    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', function(event) {
            if (event.matches) collapseMobileDiseaseModel();
        });
    }
}

setupMobileDiseaseToggle();

// 参考范围下拉选择框事件
const referenceRangeSelect = document.getElementById('referenceRangeSelect');
if (referenceRangeSelect) {
    referenceRangeSelect.addEventListener('change', function() {
        saveSimpsonDataToCache();
        unlockRightSidebarTemplateText();
        selectedReferenceRange = this.value;
        // 重置选中的参考体重（当参考范围改变时）
        selectedReferenceWeight = null;

        // 根据动物类型设置心率默认值
        setHeartRateDefault();

        // 更新EA融合输入框的显示状态
        updateEAFusionVisibility();
        updateMaxLadVisibility();
        updateLaVolumeVisibility();

        // 更新含辛普森测量按钮的显示状态
        updateSimpsonButtonVisibility();

        // 当选择犬≤3kg、犬＞3kg、金毛时，自动激活含辛普森测量按钮（首次加载抑制）
        const simpsonButton = document.getElementById('simpsonButton');
        if (simpsonButton && !suppressInitialSimpsonAutoActivation) {
            if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫（含体重）') {
                // 选择猫或猫（含体重）时，默认不激活含辛普森测量
                if (simpsonEnabled) {
                    simpsonButton.classList.remove('active');
                    simpsonEnabled = false;
                    // 隐藏辛普森输入框
                    toggleSimpsonInputs();
                    if (selectedDiseaseType && selectedReferenceRange) {
                        generateTemplate();
                    }
                }
            }
        }

        // 根据参考范围显示/隐藏体重输入框
        toggleWeightInput();
        // 更新参考值显示
        updateReferenceValues();
        updateDpdtVisibilityByMitralRegurg();
        generateTemplate();
    });

}

// 含辛普森测量按钮事件
const simpsonButton = document.getElementById('simpsonButton');
if (simpsonButton) {
    simpsonButton.addEventListener('click', async function() {
        simpsonEnabled = !simpsonEnabled;
        if (simpsonEnabled) {
            this.classList.add('active');
        } else {
            this.classList.remove('active');
        }
        // 显示/隐藏辛普森输入框
        toggleSimpsonInputs();
        // 辛普森格式由 JS 动态注入，无需重新加载模板文件
        generateTemplate();
    });
}

// 右心高阶按钮（与含辛普森测量同款样式；后续高阶输入框显隐依赖此开关）
const rightHeartAdvancedButton = document.getElementById('rightHeartAdvancedButton');
if (rightHeartAdvancedButton) {
    rightHeartAdvancedButton.addEventListener('click', function() {
        rightHeartAdvancedEnabled = !rightHeartAdvancedEnabled;
        if (rightHeartAdvancedEnabled) {
            this.classList.add('active');
            parameters['右心高阶'] = '是';
        } else {
            this.classList.remove('active');
            delete parameters['右心高阶'];
        }
        toggleRightHeartAdvancedInputs();
        generateTemplate();
    });
}

// 右心高阶开启后：「仅显示含数值的参数」——右侧栏只输出有值的右心高阶项
const rightHeartValuesOnlyButton = document.getElementById('rightHeartValuesOnlyButton');
if (rightHeartValuesOnlyButton) {
    rightHeartValuesOnlyButton.addEventListener('click', function() {
        if (!rightHeartAdvancedEnabled) return;
        rightHeartValuesOnlyEnabled = !rightHeartValuesOnlyEnabled;
        if (rightHeartValuesOnlyEnabled) {
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            parameters['仅显示含数值的参数'] = '是';
        } else {
            this.classList.remove('active');
            this.setAttribute('aria-pressed', 'false');
            delete parameters['仅显示含数值的参数'];
        }
        generateTemplate();
    });
}

// 左心高阶按钮（左心室斑点追踪牛眼图显隐）
const leftHeartAdvancedButton = document.getElementById('leftHeartAdvancedButton');
if (leftHeartAdvancedButton) {
    leftHeartAdvancedButton.addEventListener('click', function() {
        leftHeartAdvancedEnabled = !leftHeartAdvancedEnabled;
        if (leftHeartAdvancedEnabled) {
            this.classList.add('active');
            parameters['左心高阶'] = '是';
        } else {
            this.classList.remove('active');
            delete parameters['左心高阶'];
        }
        toggleLeftHeartAdvancedInputs();
        generateTemplate();
    });
}

// 节律不齐按钮事件
const rhythmIrregularButton = document.getElementById('rhythmIrregularButton');
if (rhythmIrregularButton) {
    rhythmIrregularButton.addEventListener('click', function() {
        const willBeActive = !this.classList.contains('active');
        if (willBeActive) {
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            parameters['节律不齐'] = '是';
        } else {
            this.classList.remove('active');
            this.setAttribute('aria-pressed', 'false');
            delete parameters['节律不齐'];
        }
        generateTemplate();
    });
}

// 根据参考范围显示/隐藏体重输入框
function toggleWeightInput() {
    const weightWrapper = document.getElementById('weightInputWrapper');
    if (!weightWrapper) return;

    // 在参考选择为「猫」（固定品种参考）时隐藏体重输入框；兔与犬一样可填体重
    if (selectedReferenceRange === '猫') {
        weightWrapper.style.display = 'none';
        // 清除体重参数和输入框的值
        delete parameters['体重'];
        const weightInput = document.getElementById('weightInput');
        if (weightInput) {
            weightInput.value = '';
        }
        // 重新计算EDVI和ESVI（因为体重被清除了）
        calculateEDVI();
        calculateESVI();
        // 清空引用体重值显示
        updateWeightReferenceDisplay();
    } else {
        // 选择其他参考范围时（犬≤3kg、犬＞3kg、金毛、兔、猫（含体重）等），显示体重输入框
        weightWrapper.style.display = 'flex';
        // 更新引用体重值显示
        updateWeightReferenceDisplay();
    }
}

// 根据动物类型设置心率默认值
function setHeartRateDefault() {
    const heartRateInput = document.querySelector('input[data-param="心率"]');
    if (!heartRateInput) return;

    // 选择"猫"时，默认心率固定填写为 180-200（覆盖当前值）
    if (selectedReferenceRange === '猫') {
        heartRateInput.value = '180-200';
        parameters['心率'] = '180-200';
        return;
    }

    // 如果输入框已经有值，不覆盖
    if (heartRateInput.value.trim()) {
        return;
    }

    // 根据参考范围判断动物类型并设置默认值
    // 犬：犬≤3kg、犬＞3kg、金毛 → 120-140
    // 猫、兔：猫、猫（含体重）、兔子 → 180-200
    if (selectedReferenceRange === '犬≤3kg' || selectedReferenceRange === '犬＞3kg' || selectedReferenceRange === '金毛') {
        // 犬
        heartRateInput.value = '120-140';
        parameters['心率'] = '120-140';
    } else if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫（含体重）' || selectedReferenceRange === '兔子') {
        // 猫、兔
        heartRateInput.value = '180-200';
        parameters['心率'] = '180-200';
    }
}

// 保存当前辛普森数据到缓存（按疾病类型+参考范围）。在隐藏/切换前调用。
function saveSimpsonDataToCache() {
    if (!selectedDiseaseType || !selectedReferenceRange) return;
    const key = `${selectedDiseaseType}_${selectedReferenceRange}`;
    const edv = (parameters['EDV辛普森'] ?? document.getElementById('edvSimpsonInput')?.value?.trim() ?? '').toString();
    const esv = (parameters['ESV辛普森'] ?? document.getElementById('esvSimpsonInput')?.value?.trim() ?? '').toString();
    const ef = (parameters['EF辛普森'] ?? document.getElementById('efSimpsonInput')?.value?.trim() ?? '').toString();
    simpsonDataCache[key] = { EDV辛普森: edv, ESV辛普森: esv, EF辛普森: ef };
}

// 从缓存恢复辛普森数据到输入框和 parameters
function restoreSimpsonDataFromCache() {
    if (!simpsonEnabled || !selectedDiseaseType || !selectedReferenceRange) return;
    const key = `${selectedDiseaseType}_${selectedReferenceRange}`;
    const cached = simpsonDataCache[key];
    if (!cached) return;
    const edvSimpsonInput = document.getElementById('edvSimpsonInput');
    const esvSimpsonInput = document.getElementById('esvSimpsonInput');
    const efSimpsonInput = document.getElementById('efSimpsonInput');
    if (edvSimpsonInput) {
        edvSimpsonInput.value = cached.EDV辛普森 ?? '';
        if (cached.EDV辛普森) parameters['EDV辛普森'] = cached.EDV辛普森; else delete parameters['EDV辛普森'];
    }
    if (esvSimpsonInput) {
        esvSimpsonInput.value = cached.ESV辛普森 ?? '';
        if (cached.ESV辛普森) parameters['ESV辛普森'] = cached.ESV辛普森; else delete parameters['ESV辛普森'];
    }
    if (efSimpsonInput) {
        efSimpsonInput.value = cached.EF辛普森 ?? '';
        if (cached.EF辛普森) parameters['EF辛普森'] = cached.EF辛普森; else delete parameters['EF辛普森'];
    }
}
