// 参数数据存储
const parameters = {};

// 不同品种参考值数据存储
let breedReferenceData = null;
// 健康结论内容存储
let healthConclusionText = null;

// CSV参考数据存储（按类型分别存储）
let csvReferenceData = {
    'M型': null,
    '非M型': null
};

// 读取CSV文件（心超数据.csv - 非M型）
async function loadCSVData() {
    try {
        const response = await fetch('docs/reference interval/心超数据.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        // 找到表头行（第一行）
        if (lines.length < 2) {
            console.error('心超数据.csv格式错误');
            return;
        }
        
        // 解析表头
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 解析数据行
        csvReferenceData['非M型'] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[0] && !isNaN(parseFloat(values[0]))) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                csvReferenceData['非M型'].push(row);
            }
        }
        
        console.log('非M型CSV数据加载成功', csvReferenceData['非M型']);
        // CSV加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载CSV文件失败:', error);
    }
}

// 读取M型参考值CSV文件
async function loadMTypeCSVData() {
    try {
        const response = await fetch('docs/reference interval/M型参考值.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        // 找到表头行（第一行）
        if (lines.length < 2) {
            console.error('M型参考值.csv格式错误');
            return;
        }
        
        // 解析表头
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 解析数据行
        csvReferenceData['M型'] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[0] && !isNaN(parseFloat(values[0]))) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                csvReferenceData['M型'].push(row);
            }
        }
        
        console.log('M型CSV数据加载成功', csvReferenceData['M型']);
        // CSV加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载M型CSV文件失败:', error);
    }
}

// 读取不同品种参考值CSV文件
async function loadBreedReferenceData() {
    try {
        const response = await fetch('docs/reference interval/不同品种参考值.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            console.error('不同品种参考值.csv格式错误');
            return;
        }
        
        // 第一行是表头（跳过第一列空列）
        const headerLine = lines[0];
        const headerParts = headerLine.split(',');
        const headers = [];
        for (let i = 1; i < headerParts.length; i++) {
            headers.push(headerParts[i].trim());
        }
        
        // 解析数据行
        breedReferenceData = {};
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const breedName = values[0] ? values[0].trim() : '';
            if (breedName) {
                const row = {};
                headers.forEach((header, index) => {
                    const valueIndex = index + 1; // 因为跳过了第一列
                    const value = values[valueIndex] ? values[valueIndex].trim() : '';
                    row[header] = value;
                });
                breedReferenceData[breedName] = row;
            }
        }
        
        console.log('不同品种参考值加载成功', breedReferenceData);
        // 加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载不同品种参考值文件失败:', error);
    }
}

// 根据体重查找参考数据（优先选择等于体重的数值，如果没有则选择刚大于体重的第一个值）
function findReferenceDataByWeight(weight, referenceRange) {
    const dataArray = csvReferenceData[referenceRange];
    if (!dataArray || !weight) {
        return null;
    }
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) {
        return null;
    }
    
    // 首先查找是否有等于输入体重的数据
    for (let i = 0; i < dataArray.length; i++) {
        const rowWeight = parseFloat(dataArray[i]['kg']);
        if (!isNaN(rowWeight) && rowWeight === weightValue) {
            return dataArray[i];
        }
    }
    
    // 如果没有等于的，查找刚大于体重的第一个数据行（使用kg列）
    for (let i = 0; i < dataArray.length; i++) {
        const rowWeight = parseFloat(dataArray[i]['kg']);
        if (!isNaN(rowWeight) && rowWeight > weightValue) {
            return dataArray[i];
        }
    }
    
    // 如果没有找到更大的，返回最后一行
    if (dataArray.length > 0) {
        return dataArray[dataArray.length - 1];
    }
    
    return null;
}

// 读取健康结论文件
async function loadHealthConclusion() {
    try {
        const response = await fetch('docs/健康结论.txt');
        const text = await response.text();
        healthConclusionText = text.trim();
        console.log('健康结论加载成功', healthConclusionText);
    } catch (error) {
        console.error('加载健康结论文件失败:', error);
        // 如果加载失败，使用默认的健康结论
        healthConclusionText = '1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n2.心脏收缩、舒张功能未见明显异常。';
    }
}

// 存储MD模板内容
let mdTemplates = {
    'MMVD': null,
    'HCM': null,
    '犬健康': null,
    '猫健康': null
};

// 加载MD模板文件
async function loadMDTemplate(templateName, forceReload = false) {
    try {
        // 添加时间戳参数来避免浏览器缓存
        const timestamp = forceReload ? `?t=${Date.now()}` : '';
        const response = await fetch(`docs/md/模版-${templateName}.md${timestamp}`);
        const text = await response.text();
        mdTemplates[templateName] = text;
        console.log(`MD模板 ${templateName} 加载成功`);
        return text;
    } catch (error) {
        console.error(`加载MD模板 ${templateName} 失败:`, error);
        return null;
    }
}

// 加载所有MD模板
async function loadAllMDTemplates(forceReload = false) {
    await loadMDTemplate('MMVD', forceReload);
    await loadMDTemplate('HCM', forceReload);
    await loadMDTemplate('犬健康', forceReload);
    await loadMDTemplate('猫健康', forceReload);
    // 重新加载模板后，如果已有选中的疾病类型，自动更新模板显示
    const activeDiseaseButton = document.querySelector('.disease-button.active');
    if (activeDiseaseButton) {
        generateTemplate();
    }
}

// 重新加载所有模板并更新显示
async function reloadTemplates() {
    console.log('重新加载模板文件...');
    await loadAllMDTemplates(true); // 强制重新加载，避免缓存
    console.log('模板重新加载完成');
}

// 页面加载时读取CSV和健康结论
loadCSVData();
loadMTypeCSVData();
loadBreedReferenceData();
loadHealthConclusion();
loadAllMDTemplates();

// 更新体重引用值显示
function updateWeightReferenceDisplay() {
    const weightReferenceDisplay = document.getElementById('weightReferenceDisplay');
    if (!weightReferenceDisplay) return;
    
    const referenceRange = selectedReferenceRange;
    const weight = parameters['体重'];
    
    // 只有在M型或非M型参考范围，且输入了体重时才显示引用体重值
    if ((referenceRange === 'M型' || referenceRange === '非M型') && weight) {
        const referenceData = findReferenceDataByWeight(weight, referenceRange);
        if (referenceData && referenceData['kg']) {
            const referenceWeight = parseFloat(referenceData['kg']);
            if (!isNaN(referenceWeight)) {
                weightReferenceDisplay.textContent = `(${referenceWeight}kg)`;
                return;
            }
        }
    }
    
    // 如果没有引用体重值，清空显示
    weightReferenceDisplay.textContent = '';
}

// 更新参数标签旁的参考值显示
function updateReferenceValues() {
    const referenceRange = selectedReferenceRange;
    const weight = parameters['体重'];

    let referenceData = null;

    // 根据参考范围类型获取参考数据
    if ((referenceRange === 'M型' || referenceRange === '非M型') && weight) {
        // M型或非M型：根据体重查找参考数据
        referenceData = findReferenceDataByWeight(weight, referenceRange);
    } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
        // 猫：从不同品种参考值中获取
        referenceData = breedReferenceData['猫'];
    } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
        // 金毛：从不同品种参考值中获取
        referenceData = breedReferenceData['金毛'];
    }
    
    // 如果没有参考数据，清除显示
    if (!referenceData) {
        document.querySelectorAll('.reference-value').forEach(span => {
            span.textContent = '';
        });
        return;
    }
    
    // 参数名映射（将CSV列名映射到标准参数名）
    // 标准参数名 -> CSV列名（反向映射，支持多种可能的列名）
    const standardToCsvMap = {
        'IVSd': ['IVSd', 'IVSd '],
        'LVDd': ['LVIDd', 'LVDd'],
        'LVWd': ['LVFWd', 'LVWd'],
        'IVSs': ['IVSs'],
        'LVDs': ['LVIDs', 'LVIDs ', 'LVDs'],
        'LVWs': ['LVWs'],
        'LA': ['LA'],
        'Ao': ['Ao', 'AO']  // 支持Ao和AO两种写法
    };
    
    // 更新每个参数的参考值显示
    document.querySelectorAll('.reference-value').forEach(span => {
        const csvKey = span.getAttribute('data-csv-key');
        const paramName = span.getAttribute('data-param');
        
        let refValue = null;
        
        // 确定要查找的标准参数名（优先使用csvKey，否则使用paramName）
        const targetParam = csvKey || paramName;
        
        if (targetParam) {
            // 方法1：直接使用csvKey查找（如果csvKey就是CSV中的列名）
            if (csvKey && referenceData[csvKey]) {
                refValue = referenceData[csvKey];
            } else {
                // 方法2：通过标准参数名找到对应的CSV列名，然后查找
                const csvColNames = standardToCsvMap[targetParam] || [targetParam];
                for (const csvColName of csvColNames) {
                    // 尝试精确匹配（包括尾随空格）
                    if (referenceData[csvColName]) {
                        refValue = referenceData[csvColName];
                        break;
                    }
                    // 尝试去除空格后匹配（不区分大小写）
                    const trimmedColName = csvColName.trim().toLowerCase();
                    for (const key in referenceData) {
                        if (key.trim().toLowerCase() === trimmedColName) {
                            refValue = referenceData[key];
                            break;
                        }
                    }
                    if (refValue) break;
                }
            }
        }
        
        if (refValue) {
            span.textContent = `(${refValue})`;
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
        
        // 如果体重变化，更新参考值显示和引用体重值，并自动更新模板
        if (paramName === '体重') {
            updateReferenceValues();
            updateWeightReferenceDisplay();
            // 体重变化时自动更新"所见"模板
            generateTemplate();
        } else {
            generateTemplate();
        }
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
        
        // 如果选择HCM，自动选择"猫"参考范围
        if (selectedDiseaseType === 'HCM') {
            const referenceRangeSelect = document.getElementById('referenceRangeSelect');
            if (referenceRangeSelect) {
                referenceRangeSelect.value = '猫';
                selectedReferenceRange = '猫';
                // 根据参考范围显示/隐藏体重输入框
                toggleWeightInput();
                // 更新参考值显示
                updateReferenceValues();
            }
        }
        
        // 如果选择MMVD，自动选择"非M型"参考范围
        if (selectedDiseaseType === 'MMVD') {
            const referenceRangeSelect = document.getElementById('referenceRangeSelect');
            if (referenceRangeSelect) {
                referenceRangeSelect.value = '非M型';
                selectedReferenceRange = '非M型';
                // 更新参考值显示和引用体重值
                updateReferenceValues();
                updateWeightReferenceDisplay();
            }
        }
        
        // 如果选择健康，自动选择"非M型"参考范围
        if (selectedDiseaseType === 'Health') {
            const referenceRangeSelect = document.getElementById('referenceRangeSelect');
            if (referenceRangeSelect) {
                referenceRangeSelect.value = '非M型';
                selectedReferenceRange = '非M型';
                // 更新参考值显示和引用体重值
                updateReferenceValues();
                updateWeightReferenceDisplay();
            }
        }
        
        // 根据参考范围显示/隐藏体重输入框
        toggleWeightInput();
        
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
        // 根据参考范围显示/隐藏体重输入框
        toggleWeightInput();
        // 更新参考值显示
        updateReferenceValues();
        generateTemplate();
    });
}

// 根据参考范围显示/隐藏体重输入框
function toggleWeightInput() {
    const weightWrapper = document.getElementById('weightInputWrapper');
    if (!weightWrapper) return;
    
    // 仅在参考选择为"猫"时隐藏体重输入框，其他情况都显示
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
        // 选择其他参考范围时（M型、非M型、金毛），始终显示体重输入框
        weightWrapper.style.display = 'flex';
        // 更新引用体重值显示
        updateWeightReferenceDisplay();
    }
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
    
    // 替换MD模板中的占位符
    replaceMDTemplatePlaceholders: (template, referenceData, referenceWeight, referenceRange) => {
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 格式化数值为2位小数（EDVI和ESVI除外，它们已经是整数）
        const formatValue = (value, isInteger = false) => {
            if (!value) return '';
            const num = parseFloat(value);
            if (isNaN(num)) return value; // 如果不是数字，返回原值
            return isInteger ? num.toFixed(0) : num.toFixed(2);
        };
        
        // 从参考数据中获取参考值的辅助函数
        const standardToCsvMap = {
            'IVSd': ['IVSd', 'IVSd '],
            'LVDd': ['LVIDd', 'LVDd'],
            'LVWd': ['LVFWd', 'LVWd'],
            'IVSs': ['IVSs'],
            'LVDs': ['LVIDs', 'LVIDs ', 'LVDs'],
            'LVWs': ['LVWs'],
            'LA': ['LA'],
            'Ao': ['Ao', 'AO']
        };
        
        const getReferenceValue = (csvKey) => {
            if (!referenceData || !csvKey) return '';
            
            if (referenceData[csvKey]) {
                return referenceData[csvKey];
            }
            
            const csvColNames = standardToCsvMap[csvKey] || [csvKey];
            for (const csvColName of csvColNames) {
                if (referenceData[csvColName]) {
                    return referenceData[csvColName];
                }
                const trimmedColName = csvColName.trim().toLowerCase();
                for (const key in referenceData) {
                    if (key.trim().toLowerCase() === trimmedColName) {
                        return referenceData[key];
                    }
                }
            }
            return '';
        };
        
        let result = template;
        
        // 替换体重
        result = result.replace(/{体重}/g, referenceWeight ? `${referenceWeight}` : '');
        
        // 替换参考范围
        result = result.replace(/{参考范围}/g, referenceRange || '');
        
        // 替换所有参数值（如 {EDV}, {FS}, {E} 等）
        const paramNames = ['IVSd', 'LVDd', 'LVWd', 'IVSs', 'LVDs', 'LVWs', 'EDV', 'ESV', 'EDVI', 'ESVI', 'FS', 'EF', 
                           'LA', 'Ao', 'LA/Ao', 'VPA', 'VAO', 'E', 'A', 'E/A', 'EA融合', 'E/E\'', '心率',
                           'SAM', '假腱索', '左心房容量',
                           '二尖瓣反流', '三尖瓣反流', '主动脉瓣反流', '肺动脉瓣反流', '脱垂程度', '二尖瓣前叶厚度'];
        
        paramNames.forEach(paramName => {
            const value = get(paramName, '');
            // EDV、ESV、EDVI、ESVI保留0位小数（整数），其他参数保留2位小数
            const formattedValue = (paramName === 'EDV' || paramName === 'ESV' || paramName === 'EDVI' || paramName === 'ESVI') ? formatValue(value, true) : formatValue(value);
            result = result.replace(new RegExp(`{${paramName}}`, 'g'), formattedValue || '');
        });
        
        // 替换参考值（如 {IVSd参考值}, {LA参考值} 等）
        const refParamNames = ['IVSd', 'LVDd', 'LVWd', 'IVSs', 'LVDs', 'LVWs', 'LA', 'Ao'];
        refParamNames.forEach(paramName => {
            const refValue = getReferenceValue(paramName);
            result = result.replace(new RegExp(`{${paramName}参考值}`, 'g'), refValue || '');
        });
        
        // 处理EDV/ESV格式：不显示辛普森部分
        const edv = get('EDV', '');
        const esv = get('ESV', '');
        const edvFormatted = edv ? formatValue(edv, true) : '';
        const esvFormatted = esv ? formatValue(esv, true) : '';
        // 替换EDV和ESV占位符（包括辛普森格式，统一转换为不显示辛普森）
        result = result.replace(/{EDV}ml\/ml（辛普森）/g, edvFormatted ? `${edvFormatted}ml` : 'ml');
        result = result.replace(/{ESV}ml\/ml（辛普森）/g, esvFormatted ? `${esvFormatted}ml` : 'ml');
        result = result.replace(/{EDV}\/（辛普森）/g, edvFormatted ? `${edvFormatted}ml` : 'ml');
        result = result.replace(/{ESV}\/（辛普森）/g, esvFormatted ? `${esvFormatted}ml` : 'ml');
        // 替换单独的EDV和ESV占位符
        result = result.replace(/{EDV}/g, edvFormatted || '');
        result = result.replace(/{ESV}/g, esvFormatted || '');
        
        // 处理EDVI/ESVI格式：不显示值
        result = result.replace(/{EDVI}/g, '');
        result = result.replace(/{ESVI}/g, '');
        
        // 处理EF格式：不显示辛普森部分
        const ef = get('EF', '');
        const efFormatted = ef ? formatValue(ef) : '';
        result = result.replace(/{EF}%\/%（辛普森}/g, efFormatted ? `${efFormatted}%` : '%');
        result = result.replace(/{EF}\/%（辛普森）/g, efFormatted ? `${efFormatted}%` : '%');
        // 替换单独的EF占位符
        result = result.replace(/{EF}/g, efFormatted || '');
        
        // 处理FS格式：FS: %
        result = result.replace(/{FS}/g, '%');
        
        return result;
    },
    
    // 生成所见模板
    generateFindings: (diseaseType, referenceRange, params) => {
        const animalType = templateConfig.getAnimalType(referenceRange);
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 获取体重（如果有的话，可以从参数中获取，这里先留空）
        const weight = get('体重', '');
        
        // 获取参考数据（支持所有参考范围类型）
        let referenceData = null;
        let referenceWeight = null; // 最终选择的体重值
        
        if ((referenceRange === 'M型' || referenceRange === '非M型') && weight) {
            // M型或非M型：根据体重查找参考数据
            referenceData = findReferenceDataByWeight(weight, referenceRange);
            // 获取最终选择的体重值（从CSV中匹配的体重）
            if (referenceData && referenceData['kg']) {
                referenceWeight = parseFloat(referenceData['kg']);
                if (isNaN(referenceWeight)) {
                    referenceWeight = null;
                }
            }
        } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
            // 猫：从不同品种参考值中获取
            referenceData = breedReferenceData['猫'];
        } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
            // 金毛：从不同品种参考值中获取
            referenceData = breedReferenceData['金毛'];
        }
        
        // 检查是否有对应的MD模板
        let mdTemplate = null;
        let templateName = null;
        
        if (diseaseType === 'MMVD' && mdTemplates['MMVD']) {
            mdTemplate = mdTemplates['MMVD'];
            templateName = 'MMVD';
        } else if (diseaseType === 'HCM' && mdTemplates['HCM']) {
            mdTemplate = mdTemplates['HCM'];
            templateName = 'HCM';
        } else if (diseaseType === 'Health') {
            if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '金毛') && mdTemplates['犬健康']) {
                mdTemplate = mdTemplates['犬健康'];
                templateName = '犬健康';
            } else if (referenceRange === '猫' && mdTemplates['猫健康']) {
                mdTemplate = mdTemplates['猫健康'];
                templateName = '猫健康';
            }
        }
        
        // 如果有MD模板，使用MD模板并替换占位符
        if (mdTemplate) {
            let result = templateConfig.replaceMDTemplatePlaceholders(mdTemplate, referenceData, referenceWeight, referenceRange);
            // 提取"所见"部分（从"# 所见"到"# 结论"之前）
            const findingsMatch = result.match(/#\s*所见\s*\n([\s\S]*?)(?=\n#\s*结论|$)/);
            if (findingsMatch) {
                return findingsMatch[1].trim();
            }
            // 如果没有找到"# 所见"标记，返回整个模板（去除"# 结论"之后的内容）
            const conclusionIndex = result.indexOf('# 结论');
            if (conclusionIndex !== -1) {
                return result.substring(0, conclusionIndex).trim();
            }
            return result.trim();
        }
        
        // 生成体重参考值文本（使用最终选择的体重值，而非输入的体重值）
        const weightText = referenceWeight ? ` (参考值：${referenceWeight}kg)` : '';
        
        let findings = `${animalType}侧卧位扫查：\n\n`;
        
        // 1. M型/2D部分（根据参考范围显示）
        let scanTypeText = 'M型/2D';
        if (referenceRange === '非M型') {
            scanTypeText = '2D';
        }
        findings += `1. ${scanTypeText} (mm)${weightText}\n\n`;
        
        // 格式化数值为2位小数（EDVI和ESVI除外，它们已经是整数）
        const formatValue = (value, isInteger = false) => {
            if (!value) return '';
            const num = parseFloat(value);
            if (isNaN(num)) return value; // 如果不是数字，返回原值
            return isInteger ? num.toFixed(0) : num.toFixed(2);
        };
        
        // 参数名映射（将CSV列名映射到标准参数名）
        const standardToCsvMap = {
            'IVSd': ['IVSd', 'IVSd '],
            'LVDd': ['LVIDd', 'LVDd'],
            'LVWd': ['LVFWd', 'LVWd'],
            'IVSs': ['IVSs'],
            'LVDs': ['LVIDs', 'LVIDs ', 'LVDs'],
            'LVWs': ['LVWs'],
            'LA': ['LA'],
            'Ao': ['Ao', 'AO']
        };
        
        // 从参考数据中获取参考值的辅助函数
        const getReferenceValue = (csvKey) => {
            if (!referenceData || !csvKey) return '';
            
            // 方法1：直接使用csvKey查找
            if (referenceData[csvKey]) {
                return referenceData[csvKey];
            }
            
            // 方法2：通过标准参数名找到对应的CSV列名，然后查找
            const csvColNames = standardToCsvMap[csvKey] || [csvKey];
            for (const csvColName of csvColNames) {
                // 尝试精确匹配（包括尾随空格）
                if (referenceData[csvColName]) {
                    return referenceData[csvColName];
                }
                // 尝试去除空格后匹配（不区分大小写）
                const trimmedColName = csvColName.trim().toLowerCase();
                for (const key in referenceData) {
                    if (key.trim().toLowerCase() === trimmedColName) {
                        return referenceData[key];
                    }
                }
            }
            
            return '';
        };
        
        // 格式化参数值
        // 格式：IVSd:5.0(2.2-4.0) 或 IVSd:（2.2-4.0）
        const formatParamWithRef = (label, value, csvKey = null) => {
            let refValue = '';
            if (referenceData && csvKey) {
                refValue = getReferenceValue(csvKey);
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
        // EDV和ESV保留0位小数（整数）
        const edvFormatted = edv ? formatValue(edv, true) : '';
        const esvFormatted = esv ? formatValue(esv, true) : '';
        
        const edvi = get('EDVI', '');
        const esvi = get('ESVI', '');
        const edviFormatted = edvi ? formatValue(edvi, true) : '';
        const esviFormatted = esvi ? formatValue(esvi, true) : '';
        
        const fs = get('FS', '');
        const ef = get('EF', '');
        const fsFormatted = fs ? formatValue(fs) : '';
        const efFormatted = ef ? formatValue(ef) : '';
        
        // 不显示辛普森部分
        // EDV: ml                    ESV: ml
        const edvText = edvFormatted ? `EDV: ${edvFormatted}ml` : 'EDV: ml';
        const esvText = esvFormatted ? `ESV: ${esvFormatted}ml` : 'ESV: ml';
        const edvLine = edvText.padEnd(45, ' ');
        findings += `   ${edvLine}${esvText}\n`;
        
        // EDVI:                      ESVI:
        const edviLine = `EDVI: `.padEnd(45, ' ');
        findings += `   ${edviLine}ESVI: \n`;
        
        // FS: %                      EF: %
        const fsAligned = `FS: ${fsFormatted ? `${fsFormatted}%` : '%'}`.padEnd(45, ' ');
        const efText = efFormatted ? `EF: ${efFormatted}%` : 'EF: %';
        findings += `   ${fsAligned}${efText}\n\n`;
        
        // 2. 瓣膜异常部分
        findings += `2. 瓣膜异常：未见明显异常\n`;
        findings += `    各瓣叶移动：未见明显异常\n`;
        const la = get('LA', '');
        const ao = get('Ao', '');
        const laAo = get('LA/Ao', '');
        const laFormatted = la ? formatValue(la) : '';
        const aoFormatted = ao ? formatValue(ao) : '';
        const laAoFormatted = laAo ? formatValue(laAo) : '';
        
        // 获取LA和Ao的参考值
        const laRef = getReferenceValue('LA');
        const aoRef = getReferenceValue('Ao');
        
        // 格式化LA和Ao，包含参考值
        const laText = laFormatted ? (laRef ? `LA： ${laFormatted}(${laRef})` : `LA： ${laFormatted}()`) : (laRef ? `LA： （${laRef}）` : `LA： （）`);
        const aoText = aoFormatted ? (aoRef ? `Ao:  ${aoFormatted}(${aoRef})` : `Ao:  ${aoFormatted}()`) : (aoRef ? `Ao:  （${aoRef}）` : `Ao:  ()`);
        
        findings += `    ${laText}\n`;
        findings += `    ${aoText}\n`;
        findings += `    LA/Ao:  ${laAoFormatted || ''}\n\n`;
        
        // 3. 频谱多普勒部分
        const vpa = get('VPA', '');
        const vao = get('VAO', '');
        const e = get('E', '');
        const a = get('A', '');
        const eA = get('E/A', '');
        const eaFusion = get('EA融合', '');
        const eE = get('E/E\'', '');
        
        // 动态标签参数 - 特殊征象
        const sam = get('SAM', '');
        const falseChord = get('假腱索', '');
        const leftAtrialVolume = get('左心房容量', '');
        
        // 动态标签参数 - 血液反流
        const mitralRegurgFlow = get('二尖瓣反流', '');
        const tricuspidRegurgFlow = get('三尖瓣反流', '');
        const aorticRegurgFlow = get('主动脉瓣反流', '');
        const pulmonaryRegurgFlow = get('肺动脉瓣反流', '');
        
        findings += `3. 频谱多普勒： 未见明显异常；\n`;
        let dopplerLine = '';
        if (vpa) dopplerLine += `VPA: ${formatValue(vpa)} `;
        if (vao) dopplerLine += `VAO: ${formatValue(vao)} `;
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
        if (sam || falseChord || leftVentricleSimpson || leftAtrialVolume || mitralRegurgFlow || tricuspidRegurgFlow || aorticRegurgFlow || pulmonaryRegurgFlow) {
            findings += `\n`;
            if (sam) findings += `   SAM: ${formatValue(sam)}\n`;
            if (falseChord) findings += `   假腱索: ${formatValue(falseChord)}\n`;
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
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 获取参考数据（与generateFindings中相同的逻辑）
        const weight = get('体重', '');
        let referenceData = null;
        let referenceWeight = null;
        
        if ((referenceRange === 'M型' || referenceRange === '非M型') && weight) {
            referenceData = findReferenceDataByWeight(weight, referenceRange);
            if (referenceData && referenceData['kg']) {
                referenceWeight = parseFloat(referenceData['kg']);
                if (isNaN(referenceWeight)) {
                    referenceWeight = null;
                }
            }
        } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
            referenceData = breedReferenceData['猫'];
        } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
            referenceData = breedReferenceData['金毛'];
        }
        
        
        // 检查是否有对应的MD模板
        let mdTemplate = null;
        
        if (diseaseType === 'MMVD' && mdTemplates['MMVD']) {
            mdTemplate = mdTemplates['MMVD'];
        } else if (diseaseType === 'HCM' && mdTemplates['HCM']) {
            mdTemplate = mdTemplates['HCM'];
        } else if (diseaseType === 'Health') {
            if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '金毛') && mdTemplates['犬健康']) {
                mdTemplate = mdTemplates['犬健康'];
            } else if (referenceRange === '猫' && mdTemplates['猫健康']) {
                mdTemplate = mdTemplates['猫健康'];
            }
        }
        
        // 如果有MD模板，从模板中提取结论部分
        if (mdTemplate) {
            let result = templateConfig.replaceMDTemplatePlaceholders(mdTemplate, referenceData, referenceWeight, referenceRange);
            // 提取"结论"部分（从"# 结论"之后到文件末尾）
            const conclusionMatch = result.match(/#\s*结论\s*\n([\s\S]*?)$/);
            if (conclusionMatch) {
                return conclusionMatch[1].trim();
            }
            // 如果没有找到"# 结论"标记，尝试查找"结论"关键字
            const conclusionIndex = result.indexOf('# 结论');
            if (conclusionIndex !== -1) {
                const conclusionText = result.substring(conclusionIndex + '# 结论'.length).trim();
                // 去除开头的换行和空格
                return conclusionText.replace(/^\s*\n+/, '').trim();
            }
        }
        
        // 如果没有MD模板，使用现有的生成逻辑
        let conclusion = '';
        
        // 如果是健康类型或未选择疾病类型（默认），使用健康结论.txt的内容
        if (diseaseType === 'Health' || !diseaseType) {
            if (healthConclusionText) {
                return healthConclusionText;
            } else {
                // 如果文件还未加载完成，使用默认内容
                conclusion += '1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n';
                conclusion += '2.心脏收缩、舒张功能未见明显异常。';
                return conclusion;
            }
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

// 折叠/展开参数输入区域
document.addEventListener('DOMContentLoaded', function() {
    const collapseToggleBtn = document.getElementById('collapseToggleBtn');
    const parametersContent = document.getElementById('parametersContent');
    
    if (collapseToggleBtn && parametersContent) {
        collapseToggleBtn.addEventListener('click', function() {
            const isCollapsed = parametersContent.style.display === 'none';
            
            if (isCollapsed) {
                // 展开
                parametersContent.style.display = 'block';
                parametersContent.classList.add('expanded');
                collapseToggleBtn.classList.remove('collapsed');
                collapseToggleBtn.querySelector('.collapse-text').textContent = '折叠参数输入';
                collapseToggleBtn.querySelector('.collapse-icon').textContent = '▲';
            } else {
                // 折叠
                parametersContent.style.display = 'none';
                parametersContent.classList.remove('expanded');
                collapseToggleBtn.classList.add('collapsed');
                collapseToggleBtn.querySelector('.collapse-text').textContent = '展开参数输入';
                collapseToggleBtn.querySelector('.collapse-icon').textContent = '▼';
            }
        });
    }
    
    
    // 页面加载时默认选择"健康"
    const healthButton = document.querySelector('.disease-button[data-value="Health"]');
    if (healthButton) {
        // 模拟点击事件，触发所有相关逻辑
        healthButton.click();
    }
});

