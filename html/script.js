// 参数数据存储
const parameters = {};

// CSV参考数据存储
let csvReferenceData = null;

// 读取CSV文件
async function loadCSVData() {
    try {
        const response = await fetch('心超.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        // 找到表头行（包含"体重,IVSd"的行）
        let headerIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('体重') && lines[i].includes('IVSd')) {
                headerIndex = i;
                break;
            }
        }
        
        if (headerIndex === -1) {
            console.error('未找到CSV表头');
            return;
        }
        
        // 解析表头
        const headers = lines[headerIndex].split(',').map(h => h.trim());
        
        // 解析数据行
        csvReferenceData = [];
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[0] && !isNaN(parseFloat(values[0]))) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                csvReferenceData.push(row);
            }
        }
        
        console.log('CSV数据加载成功', csvReferenceData);
        // CSV加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载CSV文件失败:', error);
    }
}

// 根据体重查找参考数据（选择刚大于体重的数据）
function findReferenceDataByWeight(weight) {
    if (!csvReferenceData || !weight) {
        return null;
    }
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) {
        return null;
    }
    
    // 找到刚大于体重的数据行
    for (let i = 0; i < csvReferenceData.length; i++) {
        const rowWeight = parseFloat(csvReferenceData[i]['体重']);
        if (!isNaN(rowWeight) && rowWeight > weightValue) {
            return csvReferenceData[i];
        }
    }
    
    // 如果没有找到更大的，返回最后一行
    if (csvReferenceData.length > 0) {
        return csvReferenceData[csvReferenceData.length - 1];
    }
    
    return null;
}

// 页面加载时读取CSV
loadCSVData();

// 更新参数标签旁的参考值显示
function updateReferenceValues() {
    const referenceRange = selectedReferenceRange;
    const weight = parameters['体重'];
    
    // 只有在选择"非M型"且有体重时才显示参考值
    if (referenceRange !== '非M型' || !weight) {
        document.querySelectorAll('.reference-value').forEach(span => {
            span.textContent = '';
        });
        return;
    }
    
    // 根据体重查找参考数据
    const referenceData = findReferenceDataByWeight(weight);
    if (!referenceData) {
        document.querySelectorAll('.reference-value').forEach(span => {
            span.textContent = '';
        });
        return;
    }
    
    // 更新每个参数的参考值显示
    document.querySelectorAll('.reference-value').forEach(span => {
        const csvKey = span.getAttribute('data-csv-key');
        if (csvKey && referenceData[csvKey]) {
            span.textContent = `(${referenceData[csvKey]})`;
        } else {
            span.textContent = '';
        }
    });
}

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

// 输入框值变化时更新参数（支持所有类型的输入框和选择框）
document.querySelectorAll('.m-type-input, .other-param-input, .weight-input').forEach(input => {
    input.addEventListener('input', function() {
        const paramName = this.getAttribute('data-param');
        const value = this.value.trim();
        
        if (value) {
            parameters[paramName] = value;
        } else {
            delete parameters[paramName];
        }
        
        // 如果EDV或体重变化，自动计算EDVI
        if (paramName === 'EDV' || paramName === '体重') {
            calculateEDVI();
        }
        
        // 如果ESV或体重变化，自动计算ESVI
        if (paramName === 'ESV' || paramName === '体重') {
            calculateESVI();
        }
        
        // 如果体重变化，更新参考值显示
        if (paramName === '体重') {
            updateReferenceValues();
        }
        
        generateTemplate();
    });
});

// 为select元素添加change事件监听器
document.addEventListener('change', function(e) {
    if (e.target.matches('.other-param-input[data-param]')) {
        const paramName = e.target.getAttribute('data-param');
        const value = e.target.value.trim();
        
        if (value) {
            parameters[paramName] = value;
        } else {
            delete parameters[paramName];
        }
        
        generateTemplate();
    }
});

// 疾病类型按钮点击事件
let selectedDiseaseType = '';
document.querySelectorAll('.disease-button').forEach(button => {
    button.addEventListener('click', function() {
        // 移除其他按钮的激活状态
        document.querySelectorAll('.disease-button').forEach(btn => {
            btn.classList.remove('active');
        });
        // 激活当前按钮
        this.classList.add('active');
        selectedDiseaseType = this.getAttribute('data-value');
        
        // 如果选择HCM或RCM，自动选择"猫"参考范围
        if (selectedDiseaseType === 'HCM' || selectedDiseaseType === 'RCM') {
            const referenceRangeSelect = document.getElementById('referenceRangeSelect');
            if (referenceRangeSelect) {
                referenceRangeSelect.value = '猫';
                selectedReferenceRange = '猫';
            }
        }
        
        // 如果选择MMVD或DCM，自动选择"非M型"参考范围
        if (selectedDiseaseType === 'MMVD' || selectedDiseaseType === 'DCM') {
            const referenceRangeSelect = document.getElementById('referenceRangeSelect');
            if (referenceRangeSelect) {
                referenceRangeSelect.value = '非M型';
                selectedReferenceRange = '非M型';
            }
        }
        
        // 显示/隐藏MMVD特定输入框
        const mmvdInputs = document.getElementById('mmvdSpecificInputs');
        if (mmvdInputs) {
            if (selectedDiseaseType === 'MMVD') {
                mmvdInputs.style.display = 'grid';
            } else {
                mmvdInputs.style.display = 'none';
                // 清除MMVD特定参数
                delete parameters['二尖瓣前叶厚度'];
                delete parameters['增厚程度'];
                // 清除输入框的值
                const thicknessInput = mmvdInputs.querySelector('input[data-param="二尖瓣前叶厚度"]');
                const severitySelect = mmvdInputs.querySelector('select[data-param="增厚程度"]');
                if (thicknessInput) thicknessInput.value = '';
                if (severitySelect) severitySelect.value = '';
            }
        }
        
        updateReferenceValues();
        generateTemplate();
    });
});

// 参考范围下拉选择框事件
let selectedReferenceRange = '';
const referenceRangeSelect = document.getElementById('referenceRangeSelect');
if (referenceRangeSelect) {
    referenceRangeSelect.addEventListener('change', function() {
        selectedReferenceRange = this.value;
        updateReferenceValues();
        generateTemplate();
    });
}

// 标签页按钮点击事件 - 动态添加/移除输入框
const activeTags = new Set(); // 存储已激活的标签
const dynamicInputsContainer = document.getElementById('dynamicTagInputs');

// 标签与参数名的映射
const tagToParamMap = {
    'SAM': 'SAM',
    'CAM': 'CAM',
    '假腱索': '假腱索',
    '二尖瓣反流': '二尖瓣反流',
    '三尖瓣反流': '三尖瓣反流',
    '主动脉瓣反流': '主动脉瓣反流',
    '肺动脉瓣反流': '肺动脉瓣反流',
    '左心室辛普森': '左心室辛普森',
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
    'CAM': '特殊征象',
    '假腱索': '特殊征象',
    '左心室辛普森': '特殊征象',
    '左心房容量': '特殊征象'
};

document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', function() {
        const tag = this.getAttribute('data-tag');
        const paramName = tagToParamMap[tag];
        
        // 切换按钮激活状态
        this.classList.toggle('active');
        
        if (this.classList.contains('active')) {
            // 添加标签
            activeTags.add(tag);
            addTagInput(paramName, tag);
        } else {
            // 移除标签
            activeTags.delete(tag);
            removeTagInput(paramName);
        }
    });
});

// 添加标签输入框的函数
function addTagInput(paramName, label) {
    // 检查是否已存在
    if (document.querySelector(`.other-param-input[data-param="${paramName}"]`)) {
        return;
    }
    
    const item = document.createElement('div');
    item.className = 'other-param-item';
    item.setAttribute('data-tag-param', paramName);
    item.innerHTML = `
        <label class="other-param-label">${label}</label>
        <input type="text" class="other-param-input" data-param="${paramName}" placeholder="请输入数值">
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

// 模板配置对象（方便后续修改格式）
const templateConfig = {
    // 获取参数值的辅助函数
    getParam: (key, defaultValue = '') => {
        return parameters[key] || defaultValue;
    },
    
    // 格式化数值为2位小数（用于模板显示）
    formatNumber: (value) => {
        if (!value) return '';
        const num = parseFloat(value);
        if (isNaN(num)) return value; // 如果不是数字，返回原值
        return num.toFixed(2);
    },
    
    // 判断是犬还是猫
    getAnimalType: (referenceRange) => {
        return referenceRange === '猫' ? '猫' : '犬';
    },
    
    // 生成所见模板
    generateFindings: (diseaseType, referenceRange, params) => {
        const animalType = templateConfig.getAnimalType(referenceRange);
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 获取体重（如果有的话，可以从参数中获取，这里先留空）
        const weight = get('体重', '');
        const weightText = weight ? ` (参考值：${weight}kg)` : '';
        
        let findings = `${animalType}侧卧位扫查：\n\n`;
        
        // 1. M型/2D部分（根据参考范围显示）
        let scanTypeText = 'M型/2D';
        if (referenceRange === '非M型') {
            scanTypeText = '2D';
        }
        findings += `1. ${scanTypeText} (mm)${weightText}\n\n`;
        
        // 获取CSV参考数据（如果选择了非M型且有体重）
        let referenceData = null;
        if (referenceRange === '非M型') {
            const weight = get('体重', '');
            if (weight) {
                referenceData = findReferenceDataByWeight(weight);
            }
        }
        
        // 格式化数值为2位小数（EDVI和ESVI除外，它们已经是整数）
        const formatValue = (value, isInteger = false) => {
            if (!value) return '';
            const num = parseFloat(value);
            if (isNaN(num)) return value; // 如果不是数字，返回原值
            return isInteger ? num.toFixed(0) : num.toFixed(2);
        };
        
        // 格式化参数值
        // 格式：IVSd:5.0(5.65) 或 IVSd:（）
        const formatParamWithRef = (label, value, csvKey = null) => {
            let refValue = '';
            // 如果选择了非M型且有CSV参考数据，获取参考值
            if (referenceData && csvKey && referenceData[csvKey]) {
                refValue = referenceData[csvKey];
            }
            
            // 格式化数值为2位小数
            const formattedValue = value ? formatValue(value) : '';
            
            if (formattedValue) {
                return refValue ? `${label}:${formattedValue}(${refValue})` : `${label}:${formattedValue}()`;
            } else {
                return refValue ? `${label}:（${refValue}）` : `${label}:（）`;
            }
        };
        
        // 格式化参数值，用于对齐（固定宽度，确保左对齐）
        const formatParamAligned = (label, value, csvKey, width = 45) => {
            const paramText = formatParamWithRef(label, value, csvKey);
            return paramText.padEnd(width, ' ');
        };
        
        // M型参数，2列左对齐
        // 第一行：IVSd, LVDd
        // 第二行：LVWd, IVSs  
        // 第三行：LVDs, LVWs
        // 注意：HTML中使用LVPWd/LVPWs，CSV中使用LVWd/LVWs
        const colWidth = 45;
        const ivsd = formatParamAligned('IVSd', get('IVSd'), 'IVSd', colWidth);
        const lvdd = formatParamAligned('LVDd', get('LVDd'), 'LVDd', colWidth);
        const lvwd = formatParamAligned('LVWd', get('LVPWd'), 'LVWd', colWidth); // HTML参数名LVPWd映射到CSV列名LVWd
        const ivss = formatParamAligned('IVSs', get('IVSs'), 'IVSs', colWidth);
        const lvds = formatParamAligned('LVDs', get('LVDs'), 'LVDs', colWidth);
        const lvws = formatParamAligned('LVWs', get('LVPWs'), 'LVWs', colWidth); // HTML参数名LVPWs映射到CSV列名LVWs
        
        findings += `   ${ivsd}${lvdd}\n`;
        findings += `   ${lvwd}${ivss}\n`;
        findings += `   ${lvds}${lvws}\n`;
        
        const edv = get('EDV', '');
        const esv = get('ESV', '');
        const edvFormatted = edv ? formatValue(edv) : '';
        const esvFormatted = esv ? formatValue(esv) : '';
        
        const edvi = get('EDVI', '');
        const esvi = get('ESVI', '');
        
        // 简化显示：EDVI和ESVI以简洁格式显示
        const edvText = edvFormatted ? `${edvFormatted}/（辛普森）` : '/（辛普森）';
        const esvText = esvFormatted ? `${esvFormatted}/（辛普森）` : '/（辛普森）';
        const edviShort = edvi ? ` EDVI:${edvi}` : '';
        const esviShort = esvi ? ` ESVI:${esvi}` : '';
        
        const edvLine = `EDV: ${edvText}${edviShort}`.padEnd(45, ' ');
        findings += `   ${edvLine}ESV: ${esvText}${esviShort}\n`;
        
        const fs = get('FS', '');
        const ef = get('EF', '');
        const fsFormatted = fs ? formatValue(fs) : '';
        const efFormatted = ef ? formatValue(ef) : '';
        const fsText = fsFormatted ? `${fsFormatted}%` : '%';
        const efText = efFormatted ? `${efFormatted}%/${efFormatted}%（辛普森）` : '/%（辛普森）';
        const fsAligned = `FS:${fsText}`.padEnd(35, ' ');
        findings += `   ${fsAligned}EF:${efText}\n\n`;
        
        // 2. 瓣膜异常部分
        findings += `2. 瓣膜异常：未见明显异常\n`;
        findings += `    各瓣叶移动：未见明显异常\n`;
        const la = get('LA', '');
        const ao = get('Ao', '');
        const laAo = get('LA/Ao', '');
        const laFormatted = la ? formatValue(la) : '';
        const aoFormatted = ao ? formatValue(ao) : '';
        const laAoFormatted = laAo ? formatValue(laAo) : '';
        findings += `    LA： ${laFormatted || '（）'}\n`;
        findings += `    Ao:  ${aoFormatted || '()'}\n`;
        findings += `    LA/Ao:  ${laAoFormatted || ''}\n\n`;
        
        // 3. 频谱多普勒部分
        const pv = get('PV', '');
        const av = get('AV', '');
        const e = get('E', '');
        const a = get('A', '');
        const eA = get('E/A', '');
        const eaFusion = get('EA融合', '');
        const eE = get('E/E\'', '');
        
        // 动态标签参数 - 特殊征象
        const sam = get('SAM', '');
        const cam = get('CAM', '');
        const falseChord = get('假腱索', '');
        const leftVentricleSimpson = get('左心室辛普森', '');
        const leftAtrialVolume = get('左心房容量', '');
        
        // 动态标签参数 - 血液反流
        const mitralRegurgFlow = get('二尖瓣反流', '');
        const tricuspidRegurgFlow = get('三尖瓣反流', '');
        const aorticRegurgFlow = get('主动脉瓣反流', '');
        const pulmonaryRegurgFlow = get('肺动脉瓣反流', '');
        
        findings += `3. 频谱多普勒： 未见明显异常；\n`;
        let dopplerLine = '';
        if (pv) dopplerLine += `PV: ${formatValue(pv)} `;
        if (av) dopplerLine += `AV: ${formatValue(av)} `;
        if (e) dopplerLine += `E: ${formatValue(e)} m/s `;
        if (a) dopplerLine += `A: ${formatValue(a)} m/s `;
        if (eA) dopplerLine += `E/A: ${formatValue(eA)} `;
        if (eaFusion) dopplerLine += `EA融合: ${formatValue(eaFusion)} `;
        if (eE) dopplerLine += `E/E': ${formatValue(eE)}`;
        
        if (dopplerLine) {
            findings += `   ${dopplerLine.trim()}\n`;
        } else {
            findings += `   E: m/s A: m/s E/A: ； E/E': \n`;
        }
        
        // 添加动态标签参数
        if (sam || cam || falseChord || leftVentricleSimpson || leftAtrialVolume || mitralRegurgFlow || tricuspidRegurgFlow || aorticRegurgFlow || pulmonaryRegurgFlow) {
            findings += `\n`;
            if (sam) findings += `   SAM: ${formatValue(sam)}\n`;
            if (cam) findings += `   CAM: ${formatValue(cam)}\n`;
            if (falseChord) findings += `   假腱索: ${formatValue(falseChord)}\n`;
            if (leftVentricleSimpson) findings += `   左心室辛普森: ${formatValue(leftVentricleSimpson)}\n`;
            if (leftAtrialVolume) findings += `   左心房容量: ${formatValue(leftAtrialVolume)}\n`;
            if (mitralRegurgFlow) findings += `   二尖瓣反流: ${formatValue(mitralRegurgFlow)}\n`;
            if (tricuspidRegurgFlow) findings += `   三尖瓣反流: ${formatValue(tricuspidRegurgFlow)}\n`;
            if (aorticRegurgFlow) findings += `   主动脉瓣反流: ${formatValue(aorticRegurgFlow)}\n`;
            if (pulmonaryRegurgFlow) findings += `   肺动脉瓣反流: ${formatValue(pulmonaryRegurgFlow)}\n`;
        }
        findings += `\n`;
        
        // 4. 心率部分
        const heartRate = get('心率', '');
        findings += `4. 心率： ${heartRate || ''} bmp`;
        
        return findings;
    },
    
    // 生成结论模板
    generateConclusion: (diseaseType, referenceRange, params) => {
        let conclusion = '';
        
        // 如果是健康类型，使用特定的结论格式
        if (diseaseType === 'Health') {
            conclusion += '1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n';
            conclusion += '2.心脏收缩、舒张功能未见明显异常。\n';
            return conclusion;
        }
        
        // 如果是MMVD类型，使用特定的结论格式
        if (diseaseType === 'MMVD') {
            conclusion += '1. 二尖瓣退行性病变：二尖瓣前叶增厚、轻度脱垂、轻度反流。\n';
            conclusion += '2.左心室收缩功能尚可，舒张功能下降。\n';
            conclusion += '3.三尖瓣轻度反流，肺动脉高压可疑。\n';
            return conclusion;
        }
        
        // 其他疾病类型的结论格式
        conclusion += `根据${referenceRange}参考范围，结合${diseaseType}的诊断标准：\n`;
        
        if (Object.keys(params).length > 0) {
            const paramList = Object.entries(params).map(([key, value]) => `${key} ${value}`).join('、');
            conclusion += `\n测量值：${paramList}。\n`;
        }
        
        conclusion += '\n（请根据实际测量值和参考范围进行专业判断）';
        return conclusion;
    }
};

// 生成模板
function generateTemplate() {
    const diseaseType = selectedDiseaseType;
    const referenceRange = selectedReferenceRange;
    
    // 如果未选择疾病类型或参考范围，显示提示
    if (!diseaseType || !referenceRange) {
        document.getElementById('findingsText').textContent = '请选择疾病类型和参考，模板将自动生成。';
        document.getElementById('conclusionText').textContent = '请选择疾病类型和参考，模板将自动生成。';
        return;
    }

    // 使用模板配置生成所见部分
    const findings = templateConfig.generateFindings(diseaseType, referenceRange, parameters);
    
    // 使用模板配置生成结论部分
    const conclusion = templateConfig.generateConclusion(diseaseType, referenceRange, parameters);

    // 使用textContent显示纯文本，将换行符保留
    document.getElementById('findingsText').textContent = findings;
    document.getElementById('conclusionText').textContent = conclusion;
}

// 复制按钮功能
document.getElementById('copyButton').addEventListener('click', function() {
    const findings = document.getElementById('findingsText').textContent;
    const conclusion = document.getElementById('conclusionText').textContent;
    const fullTemplate = findings + '\n\n' + conclusion;
    
    navigator.clipboard.writeText(fullTemplate).then(() => {
        const originalText = this.textContent;
        this.textContent = '已复制！';
        this.classList.add('copied');
        
        setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('复制失败，请手动复制');
        console.error('复制失败:', err);
    });
});

