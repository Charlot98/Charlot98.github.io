function isHcmFeatureTagActive(tagName) {
    const button = document.querySelector(`.valve-flow-tag-hcm[data-tag="${tagName}"]`);
    return !!(button && button.classList.contains('active'));
}

function setDefaultHcmFeatureTags() {
    if (typeof selectedDiseaseType === 'undefined' || selectedDiseaseType !== 'HCM') return;
    const sam = document.querySelector('.valve-flow-tag-hcm[data-tag="SAM"]');
    const lvot = document.querySelector('.valve-flow-tag-hcm[data-tag="左心室流出道湍流"]');
    if (sam) sam.classList.add('active');
    if (lvot) lvot.classList.add('active');
}

function clearHcmFeatureTags() {
    document.querySelectorAll('.valve-flow-tag-hcm').forEach(btn => btn.classList.remove('active'));
}

// 标签页按钮点击事件 - 动态添加/移除输入框
const activeTags = new Set(); // 存储已激活的标签
const dynamicInputsContainer = document.getElementById('dynamicTagInputs');

// 标签与参数名的映射
const tagToParamMap = {
    'SAM': 'SAM',
    '假腱索': '假腱索',
    '二尖瓣反流': '二尖瓣反流',
    '三尖瓣反流': '三尖瓣反流',
    '主动脉瓣反流': '主动脉瓣反流',
    '肺动脉瓣反流': '肺动脉瓣反流',
    '左心房容量': '左心房容量'
};

// 标签分类映射（内部标记）
const tagCategoryMap = {
    // 血液反流分类
    '二尖瓣反流': '血液反流',
    '三尖瓣反流': '血液反流',
    '主动脉瓣反流': '血液反流',
    '肺动脉瓣反流': '血液反流',
    // 特殊征象分类
    'SAM': '特殊征象',
    '假腱索': '特殊征象',
    '左心房容量': '特殊征象'
};

// 绑定标签按钮点击事件（使用事件委托，确保动态添加的按钮也能响应）
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tag-button')) {
        const button = e.target;
        const tag = button.getAttribute('data-tag');
        if (!tag) return;

        const paramName = tagToParamMap[tag];
        if (!paramName) return;

        // 切换按钮激活状态
        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            // 添加标签
            activeTags.add(tag);
            addTagInput(paramName, tag);
        } else {
            // 移除标签
            activeTags.delete(tag);
            removeTagInput(paramName);
        }

        // 更新模板
        generateTemplate();
    }
});

// 添加标签输入框的函数
function addTagInput(paramName, label) {
    // 检查是否已存在
    if (document.querySelector(`.other-param-input[data-param="${paramName}"]`)) {
        return;
    }

    // 确保 dynamicInputsContainer 存在
    if (!dynamicInputsContainer) {
        console.error('dynamicInputsContainer 不存在');
        return;
    }

    const item = document.createElement('div');
    item.className = 'other-param-item';
    item.setAttribute('data-tag-param', paramName);
    item.innerHTML = `
        <label class="other-param-label">${label}</label>
        <input type="text" class="other-param-input" data-param="${paramName}" placeholder="">
    `;

    dynamicInputsContainer.appendChild(item);

    // 为新输入框添加事件监听
    const input = item.querySelector('.other-param-input');
    input.addEventListener('input', function() {
        const paramName = this.getAttribute('data-param');
        const value = this.value.trim();

        if (value) {
            parameters[paramName] = value;
        } else {
            delete parameters[paramName];
        }

        generateTemplate();
    });
}

// 移除标签输入框的函数
function removeTagInput(paramName) {
    const item = document.querySelector(`.other-param-item[data-tag-param="${paramName}"]`);
    if (item) {
        item.remove();
        // 同时删除参数
        delete parameters[paramName];
        generateTemplate();
    }
}

// 反流程度按钮点击事件
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('regurgitation-unknown-btn')) {
        const button = e.target;
        const item = button.closest('.regurgitation-velocity-item');
        if (!item) return;

        const unknownParam = button.getAttribute('data-param');
        if (!unknownParam) return;

        const willBeActive = !button.classList.contains('active');

        // 切换按钮激活状态
        if (willBeActive) {
            button.classList.add('active');
            parameters[unknownParam] = '未测得';
        } else {
            button.classList.remove('active');
            delete parameters[unknownParam];
        }

        // 若标记为"未测得"，清空对应的反流速/压差参数，避免后续逻辑按数值生成
        if (willBeActive) {
            const velocityInput = item.querySelector('input[data-param]');
            if (velocityInput) {
                const velocityParam = velocityInput.getAttribute('data-param');
                velocityInput.value = '';
                if (velocityParam) delete parameters[velocityParam];
                updateRegurgitationPressure(velocityParam, '');
            }
            updateRegurgitationVelocityColor();
        }

        generateTemplate();
        return;
    }

    if (e.target.classList.contains('regurgitation-severity-btn')) {
        const button = e.target;
        const buttonsContainer = button.closest('.regurgitation-severity-buttons');
        if (!buttonsContainer) return;

        const paramName = buttonsContainer.getAttribute('data-param');
        const value = button.getAttribute('data-value');

        // 腱索断裂类型：允许两个按钮都不激活；再次点击已激活按钮则取消
        if (paramName === '腱索断裂类型' && button.classList.contains('active')) {
            buttonsContainer.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            delete parameters[paramName];
            generateTemplate();
            return;
        }

        // 取消同组其他按钮的激活状态
        buttonsContainer.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 激活当前按钮
        button.classList.add('active');

        // 更新参数值
        if (value) {
            parameters[paramName] = value;
        } else {
            delete parameters[paramName];
        }

        // 更新模板
        generateTemplate();
        return;
    }

    if (e.target.classList.contains('valve-flow-tag')) {
        const button = e.target;
        const tag = button.getAttribute('data-tag');
        if (!tag) return;

        // HCM 特征标签（SAM / 左心室流出道湍流）：不参与瓣口反流速输入框
        if (button.classList.contains('valve-flow-tag-hcm')) {
            const lvotBtn = document.querySelector('.valve-flow-tag-hcm[data-tag="左心室流出道湍流"]');
            if (tag === 'SAM') {
                const wasActive = button.classList.contains('active');
                button.classList.toggle('active');
                // 点亮 SAM 时默认一并点亮左心室流出道湍流；关闭 SAM 不联动，两标签均可单独切换
                if (!wasActive && button.classList.contains('active') && lvotBtn) {
                    lvotBtn.classList.add('active');
                }
            } else if (tag === '左心室流出道湍流') {
                button.classList.toggle('active');
            }
            generateTemplate();
            return;
        }

        const willBeActive = !button.classList.contains('active');

        // 如果点击"各瓣口血流正常"，取消其他所有反流标签的激活状态
        if (tag === '各瓣口血流正常') {
            if (willBeActive) {
                // 如果"各瓣口血流正常"将被激活，取消所有反流标签
                document.querySelectorAll('.valve-flow-tag-red').forEach(btn => {
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        const btnTag = btn.getAttribute('data-tag');
                        toggleRegurgitationVelocityInput(btnTag, false);
                    }
                });
            }
        } else {
            // 如果点击反流标签，取消"各瓣口血流正常"的激活状态
            const normalButton = document.querySelector('.valve-flow-tag-normal');
            if (normalButton && normalButton.classList.contains('active')) {
                normalButton.classList.remove('active');
                toggleRegurgitationVelocityInput('各瓣口血流正常', false);
            }
        }

        // 切换按钮激活状态
        button.classList.toggle('active');

        // 根据标签显示/隐藏对应的输入框
        toggleRegurgitationVelocityInput(tag, button.classList.contains('active'));
        if (typeof updateDpdtVisibilityByMitralRegurg === 'function') {
            updateDpdtVisibilityByMitralRegurg();
        }

        // 更新模板
        generateTemplate();
    }
});

// 保存单个瓣口的反流速数据到缓存（仅当输入框当前可见时保存，避免覆盖已有缓存）
function saveRegurgitationToCache(tag, inputItem) {
    if (!inputItem) return;
    if (inputItem.style.display === 'none') return;  // 已隐藏的不覆盖缓存
    const input = inputItem.querySelector('input[data-param]');
    const velocityParam = input ? input.getAttribute('data-param') : null;
    if (!velocityParam) return;
    const unknownParam = velocityParam.replace('反流速', '反流速未测得');
    const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
    const severityParam = severityButtons ? severityButtons.getAttribute('data-param') : null;
    const unknownBtn = inputItem.querySelector(`.regurgitation-unknown-btn[data-param="${unknownParam}"]`);
    const severityActive = severityButtons ? severityButtons.querySelector('.regurgitation-severity-btn.active') : null;
    regurgitationVelocityCache[tag] = {
        velocity: input ? (input.value || '').trim() : '',
        unknown: unknownBtn ? unknownBtn.classList.contains('active') : false,
        severity: severityActive ? severityActive.getAttribute('data-value') : null
    };
}

// 从缓存恢复单个瓣口的反流速数据到界面
function restoreRegurgitationFromCache(tag, inputItem) {
    const cached = regurgitationVelocityCache[tag];
    if (!cached || !inputItem) return false;
    const input = inputItem.querySelector('input[data-param]');
    const velocityParam = input ? input.getAttribute('data-param') : null;
    if (!velocityParam) return false;
    const unknownParam = velocityParam.replace('反流速', '反流速未测得');
    const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
    const severityParam = severityButtons ? severityButtons.getAttribute('data-param') : null;
    // 恢复反流速
    input.value = cached.velocity || '';
    if (cached.velocity) {
        parameters[velocityParam] = cached.velocity;
        updateRegurgitationPressure(velocityParam, cached.velocity);
    } else {
        delete parameters[velocityParam];
        updateRegurgitationPressure(velocityParam, '');
    }
    // 恢复未测得
    const unknownBtn = inputItem.querySelector(`.regurgitation-unknown-btn[data-param="${unknownParam}"]`);
    if (unknownBtn) {
        if (cached.unknown) {
            unknownBtn.classList.add('active');
            parameters[unknownParam] = '未测得';
        } else {
            unknownBtn.classList.remove('active');
            delete parameters[unknownParam];
        }
    }
    // 恢复反流程度
    if (severityButtons && severityParam && cached.severity) {
        severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${cached.severity}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            parameters[severityParam] = cached.severity;
        }
    }
    return true;
}

/** 肺动脉瓣、主动脉瓣反流默认勾选「未测得」 */
const REGURG_TAGS_DEFAULT_UNKNOWN = new Set(['肺动脉瓣反流', '主动脉瓣反流']);

function applyRegurgitationUnknownState(inputItem, enableUnknown) {
    if (!inputItem) return;
    const velocityInput = inputItem.querySelector('input[data-param]');
    if (!velocityInput) return;
    const velocityParam = velocityInput.getAttribute('data-param');
    const unknownParam = velocityParam ? velocityParam.replace('反流速', '反流速未测得') : null;
    const unknownBtn = unknownParam
        ? inputItem.querySelector(`.regurgitation-unknown-btn[data-param="${unknownParam}"]`)
        : null;
    if (!unknownBtn || !unknownParam) return;

    if (enableUnknown) {
        unknownBtn.classList.add('active');
        parameters[unknownParam] = '未测得';
        velocityInput.value = '';
        delete parameters[velocityParam];
        updateRegurgitationPressure(velocityParam, '');
    } else {
        unknownBtn.classList.remove('active');
        delete parameters[unknownParam];
    }
}

// 根据标签激活状态显示/隐藏反流速输入框
function toggleRegurgitationVelocityInput(tag, isActive) {
    let inputItem = null;

    switch(tag) {
        case '二尖瓣反流':
            inputItem = document.getElementById('mitralRegurgVelocityItem');
            break;
        case '三尖瓣反流':
            inputItem = document.getElementById('tricuspidRegurgVelocityItem');
            break;
        case '肺动脉瓣反流':
            inputItem = document.getElementById('pulmonaryRegurgVelocityItem');
            break;
        case '主动脉瓣反流':
            inputItem = document.getElementById('aorticRegurgVelocityItem');
            break;
        case '各瓣口血流正常':
            // 各瓣口血流正常时，隐藏所有反流速输入框（先保存到缓存）
            hideAllRegurgitationVelocityInputs();
            return;
    }

    if (inputItem) {
        if (isActive) {
            inputItem.style.display = 'flex';
            // 优先从缓存恢复
            const restored = restoreRegurgitationFromCache(tag, inputItem);
            if (!restored) {
                // 无缓存时，设置反流程度按钮组的默认值（若还没有激活按钮）
                const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
                if (severityButtons) {
                    const severityParamName = severityButtons.getAttribute('data-param');
                    if (severityParamName) {
                        const activeBtn = severityButtons.querySelector('.regurgitation-severity-btn.active');
                        if (!activeBtn) {
                            const defaultSeverity = getDefaultRegurgitationSeverityForParam(severityParamName);
                            const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${defaultSeverity}"]`);
                            if (defaultBtn) {
                                defaultBtn.classList.add('active');
                                parameters[severityParamName] = defaultSeverity;
                            }
                        } else {
                            const selectedValue = activeBtn.getAttribute('data-value');
                            parameters[severityParamName] = selectedValue;
                        }
                    }
                }
            }
            ensureRegurgitationSeverityParameters(inputItem);
            if (!restored && REGURG_TAGS_DEFAULT_UNKNOWN.has(tag)) {
                applyRegurgitationUnknownState(inputItem, true);
            }
            updateRegurgitationVelocityColor();
        } else {
            // 隐藏前保存到缓存
            saveRegurgitationToCache(tag, inputItem);
            inputItem.style.display = 'none';
            // 清空界面和 parameters（避免模板输出时带上未激活瓣口的数据）
            const input = inputItem.querySelector('input[data-param]');
            if (input) {
                const paramName = input.getAttribute('data-param');
                input.value = '';
                delete parameters[paramName];
                updateRegurgitationPressure(paramName, '');
            }
            inputItem.querySelectorAll('.regurgitation-unknown-btn').forEach(btn => {
                const unknownParam = btn.getAttribute('data-param');
                btn.classList.remove('active');
                if (unknownParam) delete parameters[unknownParam];
            });
            const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => btn.classList.remove('active'));
                const defaultSeverity = getDefaultRegurgitationSeverityForParam(severityParamName);
                const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${defaultSeverity}"]`);
                if (defaultBtn) defaultBtn.classList.add('active');
                delete parameters[severityParamName];
            }
        }
    }
}

// 隐藏所有反流速输入框（隐藏前保存到缓存，下次激活时可恢复）
function hideAllRegurgitationVelocityInputs() {
    const itemTagMap = [
        { id: 'mitralRegurgVelocityItem', tag: '二尖瓣反流' },
        { id: 'tricuspidRegurgVelocityItem', tag: '三尖瓣反流' },
        { id: 'pulmonaryRegurgVelocityItem', tag: '肺动脉瓣反流' },
        { id: 'aorticRegurgVelocityItem', tag: '主动脉瓣反流' }
    ];
    itemTagMap.forEach(({ id, tag }) => {
        const item = document.getElementById(id);
        if (item) {
            if (item.style.display !== 'none') saveRegurgitationToCache(tag, item);
            item.style.display = 'none';
            const input = item.querySelector('input[data-param]');
            if (input) {
                const paramName = input.getAttribute('data-param');
                input.value = '';
                delete parameters[paramName];
                updateRegurgitationPressure(paramName, '');
            }
            item.querySelectorAll('.regurgitation-unknown-btn').forEach(btn => {
                const unknownParam = btn.getAttribute('data-param');
                btn.classList.remove('active');
                if (unknownParam) delete parameters[unknownParam];
            });
            const severityButtons = item.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => btn.classList.remove('active'));
                const defaultSeverity = getDefaultRegurgitationSeverityForParam(severityParamName);
                const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${defaultSeverity}"]`);
                if (defaultBtn) defaultBtn.classList.add('active');
                delete parameters[severityParamName];
            }
        }
    });
}

// 计算反流压力差：4 * 反流速^2
function calculateRegurgitationPressure(velocity) {
    if (!velocity || isNaN(parseFloat(velocity))) {
        return null;
    }
    const vel = parseFloat(velocity);
    const pressure = 4 * Math.pow(vel, 2);
    return pressure.toFixed(1);
}

// 更新反流压力差显示
function updateRegurgitationPressure(paramName, velocity) {
    let displayId = null;
    let pressureParamName = null;

    switch(paramName) {
        case '二尖瓣反流速':
            displayId = 'mitralRegurgPressureDisplay';
            pressureParamName = '二尖瓣压力差';
            break;
        case '三尖瓣反流速':
            displayId = 'tricuspidRegurgPressureDisplay';
            pressureParamName = '三尖瓣压力差';
            break;
        case '肺动脉瓣反流速':
            displayId = 'pulmonaryRegurgPressureDisplay';
            pressureParamName = '肺动脉瓣压力差';
            break;
        case '主动脉瓣反流速':
            displayId = 'aorticRegurgPressureDisplay';
            pressureParamName = '主动脉瓣压力差';
            break;
    }

    if (displayId) {
        const display = document.getElementById(displayId);
        if (display) {
            if (velocity) {
                const pressure = calculateRegurgitationPressure(velocity);
                if (pressure) {
                    display.textContent = pressure;
                    if (pressureParamName) {
                        parameters[pressureParamName] = pressure;
                    }
                } else {
                    display.textContent = '-';
                    if (pressureParamName) {
                        delete parameters[pressureParamName];
                    }
                }
            } else {
                display.textContent = '-';
                if (pressureParamName) {
                    delete parameters[pressureParamName];
                }
            }
        }
    }
}

// 更新反流速输入框的颜色
function updateRegurgitationVelocityColor() {
    // 二尖瓣反流速：< 5 标蓝，> 6.5 标红
    const mitralInput = document.querySelector('input[data-param="二尖瓣反流速"]');
    if (mitralInput) {
        const value = parseFloat(mitralInput.value.trim());
        if (!isNaN(value)) {
            if (value < 5) {
                mitralInput.style.color = '#4a90e2';
            } else if (value > 6.5) {
                mitralInput.style.color = 'red';
            } else {
                mitralInput.style.color = '';
            }
        } else {
            mitralInput.style.color = '';
        }
    }

    // 三尖瓣反流速度：> 3.4 标红
    const tricuspidInput = document.querySelector('input[data-param="三尖瓣反流速"]');
    if (tricuspidInput) {
        const value = parseFloat(tricuspidInput.value.trim());
        if (!isNaN(value)) {
            if (value > 3.4) {
                tricuspidInput.style.color = 'red';
            } else {
                tricuspidInput.style.color = '';
            }
        } else {
            tricuspidInput.style.color = '';
        }
    }

    // 肺动脉瓣反流速：> 2 标红
    const pulmonaryInput = document.querySelector('input[data-param="肺动脉瓣反流速"]');
    if (pulmonaryInput) {
        const value = parseFloat(pulmonaryInput.value.trim());
        if (!isNaN(value)) {
            if (value > 2) {
                pulmonaryInput.style.color = 'red';
            } else {
                pulmonaryInput.style.color = '';
            }
        } else {
            pulmonaryInput.style.color = '';
        }
    }

    // 主动脉瓣反流速：> 2 标红
    const aorticInput = document.querySelector('input[data-param="主动脉瓣反流速"]');
    if (aorticInput) {
        const value = parseFloat(aorticInput.value.trim());
        if (!isNaN(value)) {
            if (value > 2) {
                aorticInput.style.color = 'red';
            } else {
                aorticInput.style.color = '';
            }
        } else {
            aorticInput.style.color = '';
        }
    }
}
