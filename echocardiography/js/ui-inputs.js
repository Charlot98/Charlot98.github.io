// 输入框值变化时更新参数（支持所有类型的输入框和选择框）
// 使用事件委托，确保在DOM加载后也能正常工作
function setupInputListeners() {
    document.querySelectorAll('.m-type-input, .other-param-input, .weight-input').forEach(input => {
        input.addEventListener('input', function() {
            const paramName = this.getAttribute('data-param');
            const value = this.value.trim();

            // 源字段变化时解除「主框手动覆盖」，以便重新自动计算
            if (paramName === 'PA' || paramName === 'AO2' || paramName === 'AO') {
                const el = document.getElementById('paAoRatioInput');
                if (el) delete el.dataset.paAoManual;
            }
            if (paramName === 'RPADmax' || paramName === 'RPADmin') {
                const el = document.getElementById('rpadRatioInput');
                if (el) delete el.dataset.rpadManual;
            }
            if (paramName === 'AT' || paramName === 'ET') {
                const el = document.getElementById('atetRatioInput');
                if (el) delete el.dataset.atetManual;
            }
            // E/E′ 主框手动输入后：改 E 不解除手动覆盖（避免误清空）；改 E′ 则恢复由 E÷E′ 自动计算
            if (paramName === "E'") {
                const el = document.getElementById('eePrimeRatioInput');
                if (el) delete el.dataset.eeManual;
            }

            if (value) {
                parameters[paramName] = value;
            } else {
                delete parameters[paramName];
            }

            if (paramName === 'PA/Ao') {
                this.dataset.paAoManual = '1';
            }
            if (paramName === 'RPAD') {
                this.dataset.rpadManual = '1';
            }
            if (paramName === 'AT/ET') {
                this.dataset.atetManual = '1';
            }
            if (paramName === "E/E'") {
                this.dataset.eeManual = '1';
            }
            if (paramName === 'SI') {
                this.dataset.siManual = '1';
            }

            // 如果体重变化，自动计算 LVIDDN
            if (paramName === '体重') {
                calculateLVIDDN();
                updateReferenceValues();
            }

            // 如果LVDd变化，自动计算 LVIDDN（不再自动计算EDV/FS）
            if (paramName === 'LVDd') {
                calculateLVIDDN();
                updateSpecialLogicInputColors();
            }

            // DCM：左心室长度/宽度变化时，自动计算 SI（球形指数）
            if (paramName === '左心室长度' || paramName === '左心室宽度') {
                const siInput = document.getElementById('siRatioInput');
                if (siInput) delete siInput.dataset.siManual;
                calculateSI();
            }

            // 如果LVDs变化，仅更新颜色（不再自动计算ESV/FS）
            if (paramName === 'LVDs') {
                updateSpecialLogicInputColors();
            }

            // 如果EDV或ESV被手动编辑，仅清除对应的_raw值（不再自动计算EF）
            if (paramName === 'EDV') {
                delete parameters['EDV_raw'];
                updateSpecialLogicInputColors();
            }
            if (paramName === 'ESV') {
                delete parameters['ESV_raw'];
                updateSpecialLogicInputColors();
            }

            // 如果EDV或体重变化，自动计算EDVI
            if (paramName === 'EDV' || paramName === '体重') {
                calculateEDVI();
            }

            // 如果ESV或体重变化，自动计算ESVI
            if (paramName === 'ESV' || paramName === '体重') {
                calculateESVI();
            }

            // 如果LA或AO变化，自动计算LA/AO
            if (paramName === 'LA' || paramName === 'AO') {
                calculateLAOverAO();
                calculatePAOverAo();
            }

            if (paramName === 'TAPSE' || paramName === 'AO') {
                calculateTapseOverAo();
            }

            if (paramName === 'PA' || paramName === 'AO2') {
                calculatePAOverAo();
            }

            if (paramName === 'RPADmax' || paramName === 'RPADmin') {
                calculateRPAD();
            }

            // 如果LA Volume或体重变化，自动计算LAVi
            if (paramName === 'LA Volume' || paramName === '体重') {
                calculateLAVi();
            }

            // 如果EA融合变化，更新E、A、E/A输入框的状态
            if (paramName === 'EA融合') {
                updateEAInputsState();
            }

            // 如果E或A变化，自动计算E/A
            if (paramName === 'E' || paramName === 'A') {
                calculateEOverA();
            }

            // 如果E或E'变化，自动计算E/E'
            if (paramName === 'E' || paramName === "E'") {
                calculateEOverEPrime();
            }

            if (paramName === 'AT' || paramName === 'ET') {
                calculateAtOverEt();
            }

            // 如果E值变化，更新颜色显示
            if (paramName === 'E') {
                updateEColor();
            }
            if (paramName === 'E/A') {
                updateEAColor();
            }

            // 如果参考值相关的参数变化，更新颜色显示
            if (['IVSd', 'LVDd', 'LVPWd', 'IVSs', 'LVDs', 'LVPWs', 'AO', 'LA'].includes(paramName)) {
                updateReferenceBasedInputColors();
            }

            // 如果特殊逻辑参数变化，更新颜色显示
            if (['FS', 'EF', 'EPSS', 'SI', 'VPA', 'VAO', 'E', 'dp/dt', 'EA融合', "E/E'"].includes(paramName)) {
                updateSpecialLogicInputColors();
            }
            // dp/dt：当输入框有内容时，自动跳转为"显示"
            if (paramName === 'dp/dt' && value) {
                const dpdtItem = document.getElementById('dpdtInputItem');
                if (dpdtItem) {
                    const showBtn = dpdtItem.querySelector('button[data-param="dp/dt显示"][data-value="显示"]');
                    if (showBtn) {
                        showBtn.classList.add('active');
                        parameters['dp/dt显示'] = '显示';
                    }
                }
            }

            // LA Volume：当输入框有内容时，自动跳转为"显示"
            if (paramName === 'LA Volume' && value) {
                const laVolumeItem = document.getElementById('laVolumeInputItem');
                if (laVolumeItem) {
                    const showBtn = laVolumeItem.querySelector('button[data-param="LA Volume显示"][data-value="显示"]');
                    if (showBtn) {
                        showBtn.classList.add('active');
                        parameters['LA Volume显示'] = '显示';
                    }
                }
            }

            // 如果LA/AO变化，检查并更新颜色显示
            if (paramName === 'LA/AO') {
                updateLAOverAOColor();
            }

            if (paramName === 'LAD Max') {
                updateMaxLadColor();
            }

            if (paramName === 'PA/Ao') {
                updatePAOverAoColor();
            }

            if (paramName === 'RPAD') {
                updateRPADColor();
            }

            if (paramName === 'AT/ET') {
                calculateAtOverEt();
            }

            // 如果反流速变化，计算压力差并更新颜色
            if (['二尖瓣反流速', '三尖瓣反流速', '肺动脉瓣反流速', '主动脉瓣反流速'].includes(paramName)) {
                updateRegurgitationPressure(paramName, value);
                updateRegurgitationVelocityColor();

                // 若用户输入了反流速数值，则取消该瓣口的"未测得"标记
                if (value) {
                    const unknownMap = {
                        '二尖瓣反流速': '二尖瓣反流速未测得',
                        '三尖瓣反流速': '三尖瓣反流速未测得',
                        '肺动脉瓣反流速': '肺动脉瓣反流速未测得',
                        '主动脉瓣反流速': '主动脉瓣反流速未测得'
                    };
                    const unknownParam = unknownMap[paramName];
                    if (unknownParam) {
                        delete parameters[unknownParam];
                        const unknownBtn = document.querySelector(`.regurgitation-unknown-btn[data-param="${unknownParam}"]`);
                        if (unknownBtn) unknownBtn.classList.remove('active');
                    }
                }
            }

            // 如果体重变化，自动选择最接近的体重值（中间的选项），更新参考值显示和引用体重值，并自动更新模板
            // （generateTemplate 由末尾的 generateTemplateDeferred 统一触发，此处不再单独调用）
            if (paramName === '体重') {
                // 用户手动输入体重时，自动选择最接近的体重值
                let referenceRange = selectedReferenceRange;
                const weight = parameters['体重'];
                const weightValue = weight ? parseFloat(weight) : NaN;

                // 优化体重自动选择：
                // 体重 <= 3.0kg 自动选择犬≤3kg
                // 体重 > 3.0kg 自动选择犬＞3kg
                // 已选参考「金毛」时不因体重改写参考，仅用户手动改下拉框才切换
                if (selectedReferenceRange !== '金毛') {
                    if (!Number.isNaN(weightValue) && weightValue <= 3.0) {
                        const referenceRangeSelect = document.getElementById('referenceRangeSelect');
                        if (referenceRangeSelect && referenceRangeSelect.value !== '犬≤3kg') {
                            referenceRangeSelect.value = '犬≤3kg';
                        }
                        selectedReferenceRange = '犬≤3kg';
                        referenceRange = '犬≤3kg';
                        selectedReferenceWeight = null;

                        // 默认不自动激活含辛普森测量（仅用户点击时启用）
                    } else if (!Number.isNaN(weightValue) && weightValue > 3.0) {
                        const referenceRangeSelect = document.getElementById('referenceRangeSelect');
                        if (referenceRangeSelect && referenceRangeSelect.value !== '犬＞3kg') {
                            referenceRangeSelect.value = '犬＞3kg';
                        }
                        selectedReferenceRange = '犬＞3kg';
                        referenceRange = '犬＞3kg';
                        selectedReferenceWeight = null;

                        // 默认不自动激活含辛普森测量（仅用户点击时启用）
                    }
                }

if ((referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '猫（含体重）') && weight) {
                    const dataArray = csvReferenceData[referenceRange];
                    if (dataArray && dataArray.length > 0) {
                        if (!isNaN(weightValue)) {
                            // 查找最接近的体重值
                            let closestWeight = null;
                            let minDiff = Infinity;

                            for (let i = 0; i < dataArray.length; i++) {
                                const rowWeight = parseFloat(dataArray[i]['kg']);
                                if (!isNaN(rowWeight)) {
                                    const diff = Math.abs(rowWeight - weightValue);
                                    if (diff < minDiff) {
                                        minDiff = diff;
                                        closestWeight = rowWeight;
                                    }
                                    // 如果找到完全匹配的，直接使用
                                    if (rowWeight === weightValue) {
                                        closestWeight = rowWeight;
                                        break;
                                    }
                                }
                            }

// 自动选择最接近的体重值（中间的选项）
                            if (closestWeight !== null) {
                                selectedReferenceWeight = closestWeight;
                            }
                        }
                    }
                } else {
                    // 如果不是基于体重的参考范围，重置选中的参考体重
                    selectedReferenceWeight = null;
                }

updateReferenceValues();
                updateWeightReferenceDisplay();
            }
            // 所有输入统一通过防抖延迟更新模板，避免每次按键同步阻塞主线程
            generateTemplateDeferred();
        });
        input.addEventListener('change', function() {
            const pn = this.getAttribute('data-param');
            if (pn === 'TAPSE' || pn === 'AO') {
                calculateTapseOverAo();
            }
        });
    });


}

// 左侧栏单位：在带 .input-with-unit-suffix 的输入框内常显（.unit-suffix），不再用 placeholder 显示单位；
// 辛普森三个框另保留 placeholder「辛普森」作来源提示（单位仍用 .unit-suffix）
function setLeftSidebarInputPlaceholders() {
    const leftSidebar = document.querySelector('.left-sidebar');
    if (!leftSidebar) return;

    const unitPlaceholderMap = {
        '体重': 'kg',
        'IVSd': 'mm',
        'LVDd': 'mm',
        'LVPWd': 'mm',
        'IVSs': 'mm',
        'LVDs': 'mm',
        'LVPWs': 'mm',
        'EDV': 'ml',
        'EDV辛普森': 'ml',
        'ESV': 'ml',
        'ESV辛普森': 'ml',
        'EDVI': 'ml/m2',
        'ESVI': 'ml/m2',
        'FS': '%',
        'TAPSE': 'mm',
        'EF': '%',
        'EF辛普森': '%',
        '二尖瓣前叶厚度': 'mm',
        'AO': 'mm',
        'LA': 'mm',
        'LA/AO': '',
        'LAD Max': 'mm',
        'PA': 'mm',
        'AO2': 'mm',
        'PA/Ao': '',
        'FAC': '%',
        'RPADmax': 'mm',
        'RPADmin': 'mm',
        'RPAD': '%',
        'LA Volume': 'ml',
        'VPA': 'm/s',
        'VAO': 'm/s',
        'VTI': 'cm',
        'AT': 'ms',
        'ET': 'ms',
        'AT/ET': '',
        'E（TV）': 'm/s',
        'A（TV）': 'm/s',
        'E/A（TV）': '',
        "S'": 'cm/s',
        'GS': '%',
        'GS（LV）': '%',
        'FWS': '%',
        'E': 'm/s',
        'A': 'm/s',
        "E'": 'm/s',
        'E/A': '',
        "E/E'": '',
        'EA融合': 'm/s',
        'dp/dt': 'mmHg/s',
        '二尖瓣反流速': 'm/s',
        '三尖瓣反流速': 'm/s',
        '肺动脉瓣反流速': 'm/s',
        '主动脉瓣反流速': 'm/s',
        '心率': 'bpm'
    };

    const simpsonHintParams = ['EDV辛普森', 'ESV辛普森', 'EF辛普森'];

    leftSidebar.querySelectorAll('input[type="text"]').forEach((input) => {
        const paramName = input.getAttribute('data-param');
        if (!paramName) return;
        input.placeholder = simpsonHintParams.includes(paramName) ? '辛普森' : '';
        const unitText = unitPlaceholderMap[paramName];
        const wrapper = input.closest('.input-with-unit-suffix');
        if (wrapper) {
            const suffixEl = wrapper.querySelector('.unit-suffix');
            if (suffixEl) {
                if (unitText !== undefined && unitText !== '') {
                    suffixEl.textContent = unitText;
                    suffixEl.style.display = '';
                } else {
                    suffixEl.textContent = '';
                    suffixEl.style.display = 'none';
                }
            }
        }
    });
}

// 强制处理"显示"开关点击（避免绑定时机/重复初始化导致的失效）
// 说明：这些按钮在不同模块里可能被重置/重建，直接绑定 click 可能出现偶发失效；
// 这里使用 capture 阶段统一接管，确保点击后参数与样式一定同步。
document.addEventListener('click', function(e) {
    const dpdtBtn = e.target.closest?.('button[data-param="dp/dt显示"][data-value="显示"]');
    if (dpdtBtn) {
        e.preventDefault();
        e.stopPropagation();
        const willShow = !dpdtBtn.classList.contains('active');
        dpdtBtn.classList.toggle('active', willShow);

        if (willShow) {
            parameters['dp/dt显示'] = '显示';
        } else {
            delete parameters['dp/dt显示'];
        }

        updateSpecialLogicInputColors();
        generateTemplate();

        return;
    }

    const laBtn = e.target.closest?.('button[data-param="LA Volume显示"][data-value="显示"]');
    if (laBtn) {
        e.preventDefault();
        e.stopPropagation();

        const willShow = !laBtn.classList.contains('active');
        laBtn.classList.toggle('active', willShow);

        if (willShow) {
            parameters['LA Volume显示'] = '显示';
        } else {
            delete parameters['LA Volume显示'];
        }

        generateTemplate();

}
}, true);

// 设置 tooltip 提示功能
function setupTooltips() {
    const tooltip = document.getElementById('infoTooltip');
    if (!tooltip) return;

    // Tooltip 内容定义（LVIDDN、EDV Teich、ESV Teich 使用原生 title，与右下角一致）
    const tooltipContent = {
    };

    // 获取所有 tooltip 触发器
    const triggers = document.querySelectorAll('.tooltip-trigger');

    // 用于跟踪 tooltip 是否应该显示
    let tooltipTimeout = null;
    let tooltipShowTimeout = null;

    // 显示 tooltip 的函数
    function showTooltip(event, content, triggerElement, tooltipType) {
        // 清除之前的隐藏定时器
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }

        // 清除之前的显示定时器
        if (tooltipShowTimeout) {
            clearTimeout(tooltipShowTimeout);
            tooltipShowTimeout = null;
        }

        // 延迟显示tooltip（copy-text类型0.4秒，其他0.2秒）
        const delay = tooltipType === 'copy-text' ? 400 : 200;
        tooltipShowTimeout = setTimeout(() => {
            tooltip.innerHTML = content.html;
            tooltip.style.display = 'block';

            // 简单的位置设置：显示在鼠标位置附近
            const x = event.clientX + 15;
            const y = event.clientY + 15;

            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            tooltip.style.transform = 'none';

            // 清除所有特殊类名
            tooltip.classList.remove('tooltip-left', 'tooltip-subtle', 'tooltip-bottom', 'tooltip-top');

            tooltipShowTimeout = null;
        }, delay);
    }

    // 隐藏 tooltip 的函数（带延迟，允许鼠标移动到 tooltip 上）
    function hideTooltip() {
        // 清除显示定时器（如果还在等待显示）
        if (tooltipShowTimeout) {
            clearTimeout(tooltipShowTimeout);
            tooltipShowTimeout = null;
        }

        tooltipTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
            tooltip.style.visibility = '';
            tooltip.classList.remove('tooltip-left'); // 移除左侧显示类
            tooltip.classList.remove('tooltip-subtle'); // 移除不醒目样式类
            tooltip.classList.remove('tooltip-bottom'); // 移除下方显示类
            tooltip.classList.remove('tooltip-top'); // 移除上方显示类
            tooltipTimeout = null;
        }, 100); // 100ms 延迟，给鼠标移动到 tooltip 的时间
    }

    // 取消隐藏 tooltip
    function cancelHideTooltip() {
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
    }

    triggers.forEach(trigger => {
        const tooltipType = trigger.getAttribute('data-tooltip');
        if (!tooltipType || !tooltipContent[tooltipType]) return;

        const content = tooltipContent[tooltipType];

        // 鼠标进入触发器时显示 tooltip
        trigger.addEventListener('mouseenter', function(event) {
            showTooltip(event, content, trigger, tooltipType);
        });

        // 鼠标离开触发器时，延迟隐藏 tooltip（允许鼠标移动到 tooltip 上）
        trigger.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });

    // tooltip 本身的鼠标事件：鼠标进入 tooltip 时取消隐藏
    tooltip.addEventListener('mouseenter', function() {
        cancelHideTooltip();
    });

    // 鼠标离开 tooltip 时隐藏
    tooltip.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
        tooltip.style.visibility = '';
        tooltip.classList.remove('tooltip-left'); // 移除左侧显示类
        tooltip.classList.remove('tooltip-subtle'); // 移除不醒目样式类
        tooltip.classList.remove('tooltip-bottom'); // 移除下方显示类
        tooltip.classList.remove('tooltip-top'); // 移除上方显示类
    });
}

// 禁用所有输入的记忆功能（刷新后不恢复历史数据）
function disableInputMemory() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.setAttribute('autocomplete', 'off');
    });
}
