// 参数数据存储
const parameters = {};

// 不同品种参考值数据存储
let breedReferenceData = null;
// 健康结论内容存储
let healthConclusionText = null;
// 健康结论模板内容存储
let healthConclusionTemplate = null;
// 反流模板内容存储
let regurgitationTemplates = {
    '1.MV': null,
    '2.TV': null,
    '3.PV': null,
    '4.AV': null
};

// CSV参考数据存储（按类型分别存储）
let csvReferenceData = {
    'M型': null,
    '非M型': null,
    '猫心超（含体重）': null
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

// 读取猫心超（含体重）参考值CSV文件
async function loadCatEchoCSVData() {
    try {
        const response = await fetch('docs/reference interval/猫心超_体重.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        // 找到表头行（第一行）
        if (lines.length < 2) {
            console.error('猫心超_体重.csv格式错误');
            return;
        }
        
        // 解析表头
        const headers = lines[0].split(',').map(h => h.trim());
        
        // 解析数据行
        csvReferenceData['猫心超（含体重）'] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[0] && !isNaN(parseFloat(values[0]))) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                csvReferenceData['猫心超（含体重）'].push(row);
            }
        }
        
        console.log('猫心超（含体重）CSV数据加载成功', csvReferenceData['猫心超（含体重）']);
        // CSV加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载猫心超_体重.csv文件失败:', error);
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

// 读取健康结论模板文件
async function loadHealthConclusionTemplate() {
    try {
        const response = await fetch('docs/md/result/1. health.md');
        const text = await response.text();
        healthConclusionTemplate = text;
        console.log('健康结论模板加载成功');
    } catch (error) {
        console.error('加载健康结论模板文件失败:', error);
        healthConclusionTemplate = null;
    }
}

// 读取反流模板文件
async function loadRegurgitationTemplate(type) {
    try {
        const fileName = type + '.md';
        const response = await fetch(`docs/md/regurgitation/${fileName}`);
        const text = await response.text();
        regurgitationTemplates[type] = text;
        console.log(`反流模板 ${type} 加载成功`);
        return text;
    } catch (error) {
        console.error(`加载反流模板文件失败: ${type}`, error);
        regurgitationTemplates[type] = null;
        return null;
    }
}

// 从健康结论模板中生成结论
function generateHealthConclusionFromTemplate(params) {
    if (!healthConclusionTemplate) {
        // 如果模板还未加载，使用默认内容
        if (healthConclusionText) {
            return healthConclusionText;
        } else {
            return '1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n2.心脏收缩、舒张功能未见明显异常。';
        }
    }
    
    const get = (key, defaultValue = '') => params[key] || defaultValue;
    
    // 获取反流情况
    const mitralRegurg = get('二尖瓣反流');
    const tricuspidRegurg = get('三尖瓣反流');
    const pulmonaryRegurg = get('肺动脉瓣反流');
    const aorticRegurg = get('主动脉瓣反流');
    const normalFlow = get('各瓣口血流正常');
    
    // 获取功能指标
    const eA = get('E/A', '');
    const eE = get('E/E\'', '');
    const esvi = get('ESVI', '');
    
    // 解析E/A值（可能包含特殊字符如＞、＜）
    let eANum = null;
    if (eA) {
        const eACleaned = eA.replace(/[＞<]/g, '').trim();
        eANum = parseFloat(eACleaned);
    }
    
    // 解析E/E'值
    let eENum = null;
    if (eE) {
        eENum = parseFloat(eE);
    }
    
    // 解析ESVI值
    let esviNum = null;
    if (esvi) {
        esviNum = parseFloat(esvi);
    }
    
    // 构建反流组合键
    let regurgitationKey = '';
    if (normalFlow) {
        regurgitationKey = '各瓣口血流正常';
    } else {
        const regurgitations = [];
        if (mitralRegurg) regurgitations.push('二尖瓣反流');
        if (tricuspidRegurg) regurgitations.push('三尖瓣反流');
        if (pulmonaryRegurg) regurgitations.push('肺动脉瓣反流');
        if (aorticRegurg) regurgitations.push('主动脉瓣反流');
        
        if (regurgitations.length === 0) {
            regurgitationKey = '各瓣口血流正常';
        } else {
            regurgitationKey = regurgitations.join(' ＋ ');
        }
    }
    
    // 从模板中提取结论1
    let conclusion1 = '';
    const lines = healthConclusionTemplate.split('\n');
    let inConclusion1 = false;
    let foundKey = false;
    let conclusion1Lines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // 检查是否进入结论1部分
        if (trimmedLine === '# 结论1') {
            inConclusion1 = true;
            continue;
        }
        
        // 检查是否进入结论2部分
        if (trimmedLine.startsWith('# 结论2') || trimmedLine.includes('如果E/A')) {
            break;
        }
        
        if (inConclusion1) {
            // 检查是否找到匹配的键（支持冒号后可能有空格）
            if (trimmedLine === regurgitationKey + '：' || trimmedLine === regurgitationKey + ':') {
                foundKey = true;
                continue;
            }
            
            // 如果找到键，收集后续内容直到下一个键或空行
            if (foundKey) {
                // 如果遇到空行且已有内容，结束收集
                if (trimmedLine === '' && conclusion1Lines.length > 0) {
                    break;
                }
                // 如果遇到下一个键（包含冒号且不是当前键），结束收集
                if (trimmedLine.includes('：') && trimmedLine !== regurgitationKey + '：' && trimmedLine !== regurgitationKey + ':') {
                    break;
                }
                // 收集非空行且不是键的行
                if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine !== regurgitationKey + '：' && trimmedLine !== regurgitationKey + ':') {
                    conclusion1Lines.push(trimmedLine);
                }
            }
        }
    }
    
    conclusion1 = conclusion1Lines.join('\n');
    
    // 从模板中提取结论2
    let conclusion2 = '';
    
    // 查找结论2部分（从"# 结论2"或包含"如果E/A"的行开始）
    let inConclusion2 = false;
    let startConclusion2Index = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (trimmedLine.startsWith('# 结论2') || trimmedLine.includes('如果E/A') || trimmedLine.includes('E/A＞1') || trimmedLine.includes('E/A＜1')) {
            inConclusion2 = true;
            startConclusion2Index = i;
            break;
        }
    }
    
    if (inConclusion2 && startConclusion2Index >= 0) {
        // 从结论2部分开始查找匹配的条件
        for (let i = startConclusion2Index; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // 跳过标题行和空行
            if (trimmedLine.startsWith('#') || trimmedLine === '') {
                continue;
            }
            
            // 检查条件匹配行（包含E/A、E/E'、ESVI的行）
            if (trimmedLine.includes('E/A') || trimmedLine.includes('E/E') || trimmedLine.includes('ESVI')) {
                // 解析条件
                const eACondition = trimmedLine.match(/E\/A([＞<≥≤=]+)(\d+(?:\.\d+)?)/);
                const eECondition = trimmedLine.match(/E\/E[''′]([＞<≥≤=]+)(\d+(?:\.\d+)?)/);
                const esviCondition = trimmedLine.match(/ESVI([＞<≥≤=]+)(\d+(?:\.\d+)?)/);
                
                let matches = true;
                
                // 检查E/A条件
                if (eACondition) {
                    const op = eACondition[1];
                    const value = parseFloat(eACondition[2]);
                    if (eANum === null) {
                        matches = false;
                    } else {
                        if (op === '＞' && eANum <= value) matches = false;
                        else if (op === '＜' && eANum >= value) matches = false;
                        else if (op === '≥' && eANum < value) matches = false;
                        else if (op === '≤' && eANum > value) matches = false;
                        else if (op === '=' && eANum !== value) matches = false;
                    }
                }
                
                // 检查E/E'条件（支持±符号，表示可选的）
                if (eECondition && matches) {
                    const op = eECondition[1];
                    const value = parseFloat(eECondition[2]);
                    const hasOptional = trimmedLine.includes('±');
                    if (eENum === null) {
                        // 如果条件中有±，表示可选，不匹配也不影响
                        if (!hasOptional) {
                            matches = false;
                        }
                    } else {
                        if (op === '＞' && eENum <= value) matches = false;
                        else if (op === '＜' && eENum >= value) matches = false;
                        else if (op === '≥' && eENum < value) matches = false;
                        else if (op === '≤' && eENum > value) matches = false;
                        else if (op === '=' && eENum !== value) matches = false;
                    }
                }
                
                // 检查ESVI条件（支持±符号）
                if (esviCondition && matches) {
                    const op = esviCondition[1];
                    const value = parseFloat(esviCondition[2]);
                    const hasOptional = trimmedLine.includes('±');
                    if (esviNum === null) {
                        // 如果条件中有±，表示可选，不匹配也不影响
                        if (!hasOptional) {
                            matches = false;
                        }
                    } else {
                        if (op === '＞' && esviNum <= value) matches = false;
                        else if (op === '＜' && esviNum >= value) matches = false;
                        else if (op === '≥' && esviNum < value) matches = false;
                        else if (op === '≤' && esviNum > value) matches = false;
                        else if (op === '=' && esviNum !== value) matches = false;
                    }
                }
                
                if (matches) {
                    // 收集下一行的结论内容
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine && !nextLine.startsWith('#') && !nextLine.includes('：') && 
                            !nextLine.includes('E/A') && !nextLine.includes('E/E') && !nextLine.includes('ESVI') &&
                            !nextLine.includes('如果') && !nextLine.includes('疾病类型')) {
                            conclusion2 = nextLine;
                            break; // 找到匹配的条件，停止搜索
                        }
                    }
                }
            }
        }
    }
    
    // 替换占位符
    const replacePlaceholders = (text) => {
        let result = text;
        result = result.replace(/{二尖瓣反流程度}/g, get('二尖瓣反流程度', ''));
        result = result.replace(/{三尖瓣反流程度}/g, get('三尖瓣反流程度', ''));
        result = result.replace(/{肺动脉瓣反流程度}/g, get('肺动脉瓣反流程度', ''));
        result = result.replace(/{主动脉瓣反流程度}/g, get('主动脉瓣反流程度', ''));
        return result;
    };
    
    conclusion1 = replacePlaceholders(conclusion1);
    
    // 组合结论1和结论2
    let finalConclusion = conclusion1;
    if (conclusion2) {
        finalConclusion += '\n' + conclusion2;
    }
    
    finalConclusion = finalConclusion || (healthConclusionText || '  1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n  2.心脏收缩、舒张功能未见明显异常。');
    
    // 清理编号格式：将"数字. "或"数字."改为"  数字."（去除编号后的空格，并在编号前添加2个空格）
    // 先处理"数字. "的情况
    finalConclusion = finalConclusion.replace(/^(\d+)\.\s+/gm, '  $1.');
    // 再处理行首没有2个空格的"数字."的情况
    finalConclusion = finalConclusion.replace(/^(?!  )(\d+)\./gm, '  $1.');
    
    return finalConclusion;
}

// 存储MD模板内容
let mdTemplates = {
    'MMVD': null,
    'HCM': null,
    '犬健康': null,
    '猫健康': null,
    '金毛': null,
    '猫(含体重）': null
};

// 含辛普森测量按钮状态
let simpsonEnabled = false;

// 根据疾病类型和参考范围生成模版文件名
function getTemplateFileName(diseaseType, referenceRange, useSimpson = false) {
    // 模版文件名映射规则
    // 注意：非辛普森版本的文件名是 "01_犬_正常心脏.md"，辛普森版本是 "01_犬_正常_simpson.md"
    // 金毛专用模版：当参考范围选择"金毛"时，优先使用金毛专用模版
    const templateMap = {
        'Normal': {
            'M型': useSimpson ? '01_犬_正常_simpson.md' : '01_犬_正常心脏.md',
            '非M型': useSimpson ? '01_犬_正常_simpson.md' : '01_犬_正常心脏.md',
            '金毛': useSimpson ? '01_犬_金毛_正常_simpson.md' : '01_犬_金毛_正常心脏.md',
            '猫': useSimpson ? '07_猫_正常_simpson.md' : '07_猫_正常心脏.md',
            '猫心超（含体重）': useSimpson ? '07_猫_正常（含体重）_simpson.md' : '07_猫_正常（含体重）.md',
            '兔子': useSimpson ? '11_兔_正常_simpson.md' : '11_兔_正常.md'
        },
        'MMVD': {
            '金毛': useSimpson ? '02_犬_金毛_MMVD_simpson.md' : '02_犬_金毛_MMVD.md',
            'default': useSimpson ? '02_犬_MMVD_simpson.md' : '02_犬_MMVD.md'
        },
        'HCM': {
            'default': useSimpson ? '08_猫_HCM_simpson.md' : '08_猫_HCM.md'
        },
        'PDA': {
            '金毛': useSimpson ? '04_犬_金毛_PDA_simpson.md' : '04_犬_PDA.md',  // 金毛PDA只有辛普森版本，非辛普森时使用默认
            'default': useSimpson ? '04_犬_PDA_simpson.md' : '04_犬_PDA.md'
        },
        'DCM': {
            '金毛': useSimpson ? '05_犬_金毛_DCM_simpson.md' : '05_犬_DCM.md',  // 金毛DCM只有辛普森版本，非辛普森时使用默认
            'default': useSimpson ? '05_犬_DCM_simpson.md' : '05_犬_DCM.md'
        },
        'RCM': {
            'default': useSimpson ? '09_猫_RCM_simpson.md' : '09_猫_RCM.md'
        },
        'TOF': {
            'default': useSimpson ? '10_猫_TOF_simpson.md' : '10_猫_TOF.md'
        }
    };
    
    const diseaseMap = templateMap[diseaseType];
    if (!diseaseMap) {
        return null;
    }
    
    // 如果有特定参考范围的映射，使用它；否则使用默认
    if (diseaseMap[referenceRange]) {
        return diseaseMap[referenceRange];
    } else if (diseaseMap['default']) {
        return diseaseMap['default'];
    }
    
    return null;
}

// 加载MD模板文件（新版本，支持新的文件命名规则）
async function loadMDTemplateNew(diseaseType, referenceRange, forceReload = false, useSimpson = false) {
    try {
        const fileName = getTemplateFileName(diseaseType, referenceRange, useSimpson);
        if (!fileName) {
            console.warn(`未找到模版文件: ${diseaseType}, ${referenceRange}, simpson=${useSimpson}`);
            return null;
        }
        
        // 添加时间戳参数来避免浏览器缓存
        const timestamp = forceReload ? `?t=${Date.now()}` : '';
        const folder = useSimpson ? 'simpson/' : '';
        const url = `docs/md/${folder}${encodeURIComponent(fileName)}${timestamp}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`加载MD模板失败: HTTP ${response.status}, ${url}`);
            return null;
        }
        
        // 确保使用 UTF-8 编码读取文本
        const text = await response.text();
        
        // 使用组合键存储模版
        const templateKey = `${diseaseType}_${referenceRange}_${useSimpson ? 'simpson' : 'normal'}`;
        mdTemplates[templateKey] = text;
        console.log(`MD模板 ${templateKey} 加载成功 (${fileName})`);
        return text;
    } catch (error) {
        console.error(`加载MD模板失败: ${diseaseType}, ${referenceRange}`, error);
        return null;
    }
}

// 加载MD模板文件（旧版本，保持兼容性）
async function loadMDTemplate(templateName, forceReload = false, useSimpson = false) {
    try {
        // 添加时间戳参数来避免浏览器缓存
        const timestamp = forceReload ? `?t=${Date.now()}` : '';
        // 如果启用辛普森，从simpson文件夹加载
        const folder = useSimpson ? 'simpson/' : '';
        const response = await fetch(`docs/md/${folder}模版-${templateName}.md${timestamp}`);
        const text = await response.text();
        mdTemplates[templateName] = text;
        console.log(`MD模板 ${templateName} 加载成功${useSimpson ? ' (辛普森)' : ''}`);
        return text;
    } catch (error) {
        console.error(`加载MD模板 ${templateName} 失败:`, error);
        return null;
    }
}

// 加载所有MD模板
async function loadAllMDTemplates(forceReload = false) {
    await loadMDTemplate('MMVD', forceReload, simpsonEnabled);
    await loadMDTemplate('HCM', forceReload, simpsonEnabled);
    await loadMDTemplate('犬健康', forceReload, simpsonEnabled);
    await loadMDTemplate('猫健康', forceReload, simpsonEnabled);
    await loadMDTemplate('金毛', forceReload, simpsonEnabled);
    await loadMDTemplate('猫(含体重）', forceReload, simpsonEnabled);
    // 重新加载模板后，如果已有选中的疾病类型，自动更新模板显示
    const activeDiseaseButton = document.querySelector('.disease-button.active');
    if (activeDiseaseButton) {
        generateTemplate();
    }
}

// 更新含辛普森测量按钮的显示状态
function updateSimpsonButtonVisibility() {
    const simpsonButton = document.getElementById('simpsonButton');
    if (simpsonButton) {
        // 按钮始终显示
            simpsonButton.style.display = 'block';
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
loadCatEchoCSVData();
loadBreedReferenceData();
loadHealthConclusion();
loadHealthConclusionTemplate();
// 预加载反流模板
loadRegurgitationTemplate('1.MV');
loadRegurgitationTemplate('2.TV');
loadRegurgitationTemplate('3.PV');
loadRegurgitationTemplate('4.AV');
loadAllMDTemplates();

// 更新体重引用值显示
function updateWeightReferenceDisplay() {
    const weightReferenceDisplay = document.getElementById('weightReferenceDisplay');
    if (!weightReferenceDisplay) return;
    
    const referenceRange = selectedReferenceRange;
    const weight = parameters['体重'];
    
    // 在M型、非M型或猫心超（含体重）参考范围，且输入了体重时才显示引用体重值
    if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
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
    if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
        // M型、非M型或猫心超（含体重）：根据体重查找参考数据
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
        'LVWs': ['LVFWs', 'LVWs'],  // 支持LVFWs（猫心超_v1.csv）和LVWs
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
    const weight = parameters['体重'];
    
    let referenceData = null;
    
    // 根据参考范围类型获取参考数据
    if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
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
    if (!referenceData) return null;
    
    // 参数名映射（与updateReferenceValues中的映射一致）
    const standardToCsvMap = {
        'IVSd': ['IVSd', 'IVSd '],
        'LVDd': ['LVIDd', 'LVDd'],
        'LVPWd': ['LVFWd', 'LVWd'],
        'IVSs': ['IVSs'],
        'LVDs': ['LVIDs', 'LVIDs ', 'LVDs'],
        'LVPWs': ['LVFWs', 'LVWs'],
        'LA': ['LA'],
        'AO': ['Ao', 'AO']
    };
    
    const csvColNames = standardToCsvMap[paramName] || [paramName];
    
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
    
    return null;
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
    
    // E: ≥ 2 标红（由updateEColor函数处理，这里不需要重复处理）
}

// 更新所有输入框的颜色（兼容旧函数名）
function updateIVSdAndLVWsColor() {
    updateReferenceBasedInputColors();
    updateSpecialLogicInputColors();
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
            
            // 禁用输入框（变灰，无法输入）
            laAoInput.disabled = true;

            // 根据数值标红：如果LA/AO ≥ 1.6，则标红
            const laAoNum = parseFloat(laAoValue);
            if (laAoNum >= 1.6) {
                laAoInput.style.color = 'red';
            }
        } else {
            // 如果 LA 或 AO 为空或无效，清空 LA/AO 并启用输入框
            laAoInput.value = '';
            laAoInput.disabled = false;
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
            // 仅在"猫"或"猫心超（含体重）"时显示
            if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫心超（含体重）') {
                eaFusionItem.style.display = 'block';
            } else {
                eaFusionItem.style.display = 'none';
                // 隐藏时清空EA融合的值
                eaFusionInput.value = '';
                delete parameters['EA融合'];
                // 重新启用 E、A、E/A 输入框
                updateEAInputsState();
            }
        }
    }
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
            // 更新E的颜色显示
            updateEColor();
            return;
        }
        
        const eaFusionValue = eaFusionInput.value.trim();
        
        // 如果 EA融合 有值，禁用 E、A、E/A 输入框
        if (eaFusionValue) {
            eInput.disabled = true;
            aInput.disabled = true;
            eAInput.disabled = true;
            // E输入框被禁用时，重置颜色
            eInput.style.color = '';
        } else {
            // 如果 EA融合 为空，启用 E、A、E/A 输入框
            eInput.disabled = false;
            aInput.disabled = false;
            eAInput.disabled = false;
            // 更新E的颜色显示
            updateEColor();
        }
    }
}

// 检查E值并设置颜色（当E>1.2时标红）
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
            // 如果E值 ≥ 2，标红
            if (eValue >= 2) {
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
        }
    }
    
    // 更新E值的颜色显示
    updateEColor();
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
        
        // 如果LA或AO变化，自动计算LA/AO
        if (paramName === 'LA' || paramName === 'AO') {
            calculateLAOverAO();
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
        
        // 如果E值变化，更新颜色显示
        if (paramName === 'E') {
            updateEColor();
        }
        
        // 如果参考值相关的参数变化，更新颜色显示
        if (['IVSd', 'LVDd', 'LVPWd', 'IVSs', 'LVDs', 'LVPWs', 'AO', 'LA'].includes(paramName)) {
            updateReferenceBasedInputColors();
        }
        
        // 如果特殊逻辑参数变化，更新颜色显示
        if (['FS', 'EF', 'VPA', 'VAO', 'E'].includes(paramName)) {
            updateSpecialLogicInputColors();
        }
        
        // 如果LA/AO变化，检查并更新颜色显示
        if (paramName === 'LA/AO') {
            updateLAOverAOColor();
        }
        
        // 如果反流速变化，计算压力差并更新颜色
        if (['二尖瓣反流速', '三尖瓣反流速', '肺动脉瓣反流速', '主动脉瓣反流速'].includes(paramName)) {
            updateRegurgitationPressure(paramName, value);
            updateRegurgitationVelocityColor();
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

// 疾病类型按钮点击事件（顶栏）
let selectedDiseaseType = '';

// 通用的疾病类型处理函数
function handleDiseaseTypeChange(diseaseType) {
    selectedDiseaseType = diseaseType;
    
    // 移除所有按钮的激活状态
        document.querySelectorAll('.disease-button').forEach(btn => {
            btn.classList.remove('active');
        });
    
    // 移除下拉框的激活状态
    const moreDiseaseSelect = document.getElementById('moreDiseaseSelect');
    if (moreDiseaseSelect) {
        moreDiseaseSelect.classList.remove('active');
    }
    
    // 激活对应的按钮（如果在顶栏）
    const activeButton = document.querySelector(`.disease-button[data-value="${diseaseType}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        // 如果是从顶栏按钮选择的，重置下拉框
        if (moreDiseaseSelect) {
            moreDiseaseSelect.value = '';
            moreDiseaseSelect.classList.remove('active');
        }
    } else {
        // 如果不在顶栏按钮中，说明是从下拉框选择的，激活下拉框
        if (moreDiseaseSelect && (diseaseType === 'PDA' || diseaseType === 'DCM' || diseaseType === 'RCM' || diseaseType === 'TOF')) {
            moreDiseaseSelect.value = diseaseType;
            moreDiseaseSelect.classList.add('active');
        }
    }
        
        // 根据疾病类型自动选择参考范围
        const referenceRangeSelect = document.getElementById('referenceRangeSelect');
        if (referenceRangeSelect) {
            // DCM、PDA、MMVD → 默认选择"非M型"
            if (selectedDiseaseType === 'DCM' || selectedDiseaseType === 'PDA' || selectedDiseaseType === 'MMVD' || selectedDiseaseType === 'Normal') {
                referenceRangeSelect.value = '非M型';
                selectedReferenceRange = '非M型';
                // 根据动物类型设置心率默认值
                setHeartRateDefault();
                updateReferenceValues();
                updateWeightReferenceDisplay();
                // 自动激活含辛普森测量按钮（因为选择了非M型）
                const simpsonButton = document.getElementById('simpsonButton');
                if (simpsonButton && !simpsonEnabled) {
                    simpsonButton.classList.add('active');
                    simpsonEnabled = true;
                    // 显示辛普森输入框
                    toggleSimpsonInputs();
                }
            }
            // HCM、RCM、TOF → 默认选择"猫"
            else if (selectedDiseaseType === 'HCM' || selectedDiseaseType === 'RCM' || selectedDiseaseType === 'TOF') {
                referenceRangeSelect.value = '猫';
                selectedReferenceRange = '猫';
                // 根据动物类型设置心率默认值
                setHeartRateDefault();
                updateSimpsonButtonVisibility();
                toggleWeightInput();
                updateReferenceValues();
            }
        }
        
        // 更新EA融合输入框的显示状态
        updateEAFusionVisibility();
    
    // 如果当前选择的参考范围是M型、非M型、金毛，自动激活含辛普森测量按钮
    const simpsonButton = document.getElementById('simpsonButton');
    if (simpsonButton && selectedReferenceRange) {
        if (selectedReferenceRange === 'M型' || selectedReferenceRange === '非M型' || selectedReferenceRange === '金毛') {
            if (!simpsonEnabled) {
                simpsonButton.classList.add('active');
                simpsonEnabled = true;
                // 显示辛普森输入框
                toggleSimpsonInputs();
            }
        } else if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫心超（含体重）') {
            // 选择猫或猫心超（含体重）时，默认不激活含辛普森测量
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
            } else {
                mmvdInputs.style.display = 'none';
                // 清除MMVD特定参数
                delete parameters['二尖瓣前叶厚度'];
                delete parameters['脱垂程度'];
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
            }
        }
        
        updateReferenceValues();
        
        // 根据疾病类型自动勾选瓣口血流标签
        setDefaultValveFlowTags(diseaseType);
        
        generateTemplate();
}

// 根据疾病类型自动勾选瓣口血流标签
function setDefaultValveFlowTags(diseaseType) {
    // 先取消所有瓣口血流标签的激活状态
    document.querySelectorAll('.valve-flow-tag').forEach(btn => {
        btn.classList.remove('active');
        const tag = btn.getAttribute('data-tag');
        toggleRegurgitationVelocityInput(tag, false);
    });
    
    // 根据疾病类型激活对应的标签
    let tagsToActivate = [];
    
    switch(diseaseType) {
        case 'Normal':
            tagsToActivate = ['各瓣口血流正常'];
            break;
        case 'MMVD':
            tagsToActivate = ['二尖瓣反流', '三尖瓣反流'];
            break;
        case 'HCM':
        case 'DCM':
        case 'RCM':
        case 'TOF':
            tagsToActivate = ['二尖瓣反流'];
            break;
        default:
            // 其他疾病类型不自动勾选
            return;
    }
    
    // 激活对应的标签
    tagsToActivate.forEach(tagName => {
        const button = document.querySelector(`.valve-flow-tag[data-tag="${tagName}"]`);
        if (button) {
            button.classList.add('active');
            toggleRegurgitationVelocityInput(tagName, true);
        }
    });
}

// 顶栏疾病类型按钮点击事件
document.querySelectorAll('.top-disease-selector .disease-button').forEach(button => {
    button.addEventListener('click', function() {
        const diseaseType = this.getAttribute('data-value');
        // 重置下拉框
        const moreDiseaseSelect = document.getElementById('moreDiseaseSelect');
        if (moreDiseaseSelect) {
            moreDiseaseSelect.value = '';
            moreDiseaseSelect.classList.remove('active');
        }
        handleDiseaseTypeChange(diseaseType);
    });
});

// 更多选择下拉框事件
const moreDiseaseSelect = document.getElementById('moreDiseaseSelect');
if (moreDiseaseSelect) {
    moreDiseaseSelect.addEventListener('change', function() {
        if (this.value) {
            handleDiseaseTypeChange(this.value);
        }
    });
}

// 参考范围下拉选择框事件
let selectedReferenceRange = '';
const referenceRangeSelect = document.getElementById('referenceRangeSelect');
if (referenceRangeSelect) {
    referenceRangeSelect.addEventListener('change', function() {
        selectedReferenceRange = this.value;
        
        // 根据动物类型设置心率默认值
        setHeartRateDefault();
        
        // 更新EA融合输入框的显示状态
        updateEAFusionVisibility();
        
        // 更新含辛普森测量按钮的显示状态
        updateSimpsonButtonVisibility();
        
        // 当选择M型、非M型、金毛时，自动激活含辛普森测量按钮
        const simpsonButton = document.getElementById('simpsonButton');
        if (simpsonButton) {
            if (selectedReferenceRange === 'M型' || selectedReferenceRange === '非M型' || selectedReferenceRange === '金毛') {
                if (!simpsonEnabled) {
                    simpsonButton.classList.add('active');
                    simpsonEnabled = true;
                    // 显示辛普森输入框
                    toggleSimpsonInputs();
                    // 重新加载当前选择的模版（使用辛普森版本）
                    if (selectedDiseaseType && selectedReferenceRange) {
                        loadMDTemplateNew(selectedDiseaseType, selectedReferenceRange, true, true).then(() => {
                            generateTemplate();
                        });
                    }
                }
            } else if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫心超（含体重）') {
                // 选择猫或猫心超（含体重）时，默认不激活含辛普森测量
                if (simpsonEnabled) {
                    simpsonButton.classList.remove('active');
                    simpsonEnabled = false;
                    // 隐藏辛普森输入框
                    toggleSimpsonInputs();
                    // 重新加载当前选择的模版（不使用辛普森版本）
                    if (selectedDiseaseType && selectedReferenceRange) {
                        loadMDTemplateNew(selectedDiseaseType, selectedReferenceRange, true, false).then(() => {
                            generateTemplate();
                        });
                    }
                }
            }
        }
        
        // 根据参考范围显示/隐藏体重输入框
        toggleWeightInput();
        // 更新参考值显示
        updateReferenceValues();
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
        // 重新加载当前选择的模版
        if (selectedDiseaseType && selectedReferenceRange) {
            await loadMDTemplateNew(selectedDiseaseType, selectedReferenceRange, true, simpsonEnabled);
        }
        // 重新生成模板
        generateTemplate();
    });
}

// 根据参考范围显示/隐藏体重输入框
function toggleWeightInput() {
    const weightWrapper = document.getElementById('weightInputWrapper');
    if (!weightWrapper) return;
    
    // 在参考选择为"猫"或"兔子"时隐藏体重输入框，其他情况都显示
    if (selectedReferenceRange === '猫' || selectedReferenceRange === '兔子') {
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
        // 选择其他参考范围时（M型、非M型、金毛、猫心超（含体重）），始终显示体重输入框
        weightWrapper.style.display = 'flex';
        // 更新引用体重值显示
        updateWeightReferenceDisplay();
    }
}

// 根据动物类型设置心率默认值
function setHeartRateDefault() {
    const heartRateInput = document.querySelector('input[data-param="心率"]');
    if (!heartRateInput) return;
    
    // 如果输入框已经有值，不覆盖
    if (heartRateInput.value.trim()) {
        return;
    }
    
    // 根据参考范围判断动物类型并设置默认值
    // 犬：M型、非M型、金毛 → 120-140
    // 猫、兔：猫、猫心超（含体重）、兔子 → 180-200
    if (selectedReferenceRange === 'M型' || selectedReferenceRange === '非M型' || selectedReferenceRange === '金毛') {
        // 犬
        heartRateInput.value = '120-140';
        parameters['心率'] = '120-140';
    } else if (selectedReferenceRange === '猫' || selectedReferenceRange === '猫心超（含体重）' || selectedReferenceRange === '兔子') {
        // 猫、兔
        heartRateInput.value = '180-200';
        parameters['心率'] = '180-200';
    }
}

// 根据含辛普森测量按钮状态显示/隐藏辛普森输入框
function toggleSimpsonInputs() {
    const edvSimpsonInput = document.getElementById('edvSimpsonInput');
    const esvSimpsonInput = document.getElementById('esvSimpsonInput');
    const efSimpsonInput = document.getElementById('efSimpsonInput');
    
    if (simpsonEnabled) {
        // 显示辛普森输入框
        if (edvSimpsonInput) edvSimpsonInput.style.display = 'block';
        if (esvSimpsonInput) esvSimpsonInput.style.display = 'block';
        if (efSimpsonInput) efSimpsonInput.style.display = 'block';
    } else {
        // 隐藏辛普森输入框并清空值
        if (edvSimpsonInput) {
            edvSimpsonInput.style.display = 'none';
            edvSimpsonInput.value = '';
            delete parameters['EDV辛普森'];
        }
        if (esvSimpsonInput) {
            esvSimpsonInput.style.display = 'none';
            esvSimpsonInput.value = '';
            delete parameters['ESV辛普森'];
        }
        if (efSimpsonInput) {
            efSimpsonInput.style.display = 'none';
            efSimpsonInput.value = '';
            delete parameters['EF辛普森'];
        }
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

// 反流程度按钮点击事件
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('regurgitation-severity-btn')) {
        const button = e.target;
        const buttonsContainer = button.closest('.regurgitation-severity-buttons');
        if (!buttonsContainer) return;
        
        const paramName = buttonsContainer.getAttribute('data-param');
        const value = button.getAttribute('data-value');
        
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
        
        // 更新模板
        generateTemplate();
    }
});

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
            // 各瓣口血流正常时，隐藏所有反流速输入框
            hideAllRegurgitationVelocityInputs();
            return;
    }
    
    if (inputItem) {
        if (isActive) {
            inputItem.style.display = 'flex';
            // 设置反流程度按钮组的默认值为"轻度"（如果还没有值）
            const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                if (severityParamName) {
                    // 检查是否已经有激活的按钮
                    const activeBtn = severityButtons.querySelector('.regurgitation-severity-btn.active');
                    if (!activeBtn) {
                        // 如果没有激活的按钮，激活"轻度"按钮
                        const mildBtn = severityButtons.querySelector('.regurgitation-severity-btn[data-value="轻度"]');
                        if (mildBtn) {
                            mildBtn.classList.add('active');
                            parameters[severityParamName] = '轻度';
                        }
                    } else {
                        // 如果有激活的按钮，确保参数值被设置
                        const selectedValue = activeBtn.getAttribute('data-value');
                        parameters[severityParamName] = selectedValue;
                    }
                }
            }
        } else {
            inputItem.style.display = 'none';
            // 清空输入框的值和参数
            const input = inputItem.querySelector('input[data-param]');
            if (input) {
                const paramName = input.getAttribute('data-param');
                input.value = '';
                delete parameters[paramName];
                // 清空对应的压力差显示
                updateRegurgitationPressure(paramName, '');
            }
            // 重置反流程度按钮组为默认值"轻度"
            const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                // 取消所有按钮的激活状态
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // 激活"轻度"按钮
                const mildBtn = severityButtons.querySelector('.regurgitation-severity-btn[data-value="轻度"]');
                if (mildBtn) {
                    mildBtn.classList.add('active');
                }
                delete parameters[severityParamName];
            }
        }
    }
}

// 隐藏所有反流速输入框
function hideAllRegurgitationVelocityInputs() {
    const inputs = ['mitralRegurgVelocityItem', 'tricuspidRegurgVelocityItem', 
                    'pulmonaryRegurgVelocityItem', 'aorticRegurgVelocityItem'];
    inputs.forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.style.display = 'none';
            const input = item.querySelector('input[data-param]');
            if (input) {
                const paramName = input.getAttribute('data-param');
                input.value = '';
                delete parameters[paramName];
                updateRegurgitationPressure(paramName, '');
            }
            // 重置反流程度按钮组为默认值"轻度"
            const severityButtons = item.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                // 取消所有按钮的激活状态
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // 激活"轻度"按钮
                const mildBtn = severityButtons.querySelector('.regurgitation-severity-btn[data-value="轻度"]');
                if (mildBtn) {
                    mildBtn.classList.add('active');
                }
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
        return (referenceRange === '猫' || referenceRange === '猫心超（含体重）') ? '猫' : '犬';
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
            'LVWs': ['LVFWs', 'LVWs'],  // 支持LVFWs（猫心超_体重.csv）和LVWs
            'LA': ['LA'],
            'AO': ['AO', 'Ao']
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
        // 注意：LVPWs 在 HTML 中使用，但模版中使用 LVWs，所以需要映射
        // 注意：Ao 在 HTML 中使用，但模版中使用 AO，所以需要映射
        // 注意：'二尖瓣反流'、'三尖瓣反流'、'主动脉瓣反流'、'肺动脉瓣反流' 是嵌套占位符，不在这里处理
        // 注意：'二尖瓣反流速'、'二尖瓣压力差' 等是嵌套占位符的内层，也不在这里处理
        const paramNames = ['IVSd', 'LVDd', 'LVPWd', 'IVSs', 'LVDs', 'LVPWs', 'EDV', 'ESV', 'EDVI', 'ESVI', 'FS', 'EF', 
                           'LA', 'AO', 'LA/AO', 'LA Volume', 'LAVi', 'VPA', 'VAO', 'E', 'A', 'E/A', 'EA融合', 'E/E\'', '心率',
                           'SAM', '假腱索', '左心房容量',
                           '脱垂程度', '二尖瓣前叶厚度'];
        
        // 参数名映射（HTML 中的参数名 -> 模版中的参数名）
        const paramNameMap = {
            'LVPWs': 'LVWs',      // HTML 中使用 LVPWs，但模版中使用 LVWs
            'LVPWd': 'LVWd',      // HTML 中使用 LVPWd，但模版中使用 LVWd
            'AO': 'AO',           // HTML 中使用 AO，模版中也使用 AO
            'LA/AO': 'LA/AO'      // HTML 中使用 LA/AO，模版中也使用 LA/AO
        };
        
        paramNames.forEach(paramName => {
            // 使用映射后的参数名（如果存在映射）
            const mappedParamName = paramNameMap[paramName] || paramName;
            // 使用原始参数名获取值（因为参数存储在HTML参数名下）
            const value = get(paramName, '');
            
            let formattedValue = '';
            
            // 特殊处理心率参数
            if (paramName === '心率') {
                if (value) {
                    // 检查是否为纯数字
                    const trimmedValue = value.trim();
                    const isPureNumber = /^\d+(\.\d+)?$/.test(trimmedValue);
                    
                    if (isPureNumber) {
                        // 纯数字：保留整数，输出为"约{整数}bpm"
                        const num = parseFloat(trimmedValue);
                        formattedValue = `约${Math.round(num)}bpm`;
                    } else {
                        // 包含字符：输出为"{原内容}bpm"
                        formattedValue = `${trimmedValue}bpm`;
                    }
                }
            } else {
                // 其他参数：EDV、ESV、EDVI、ESVI、FS、EF保留0位小数（整数），其他参数保留2位小数
                formattedValue = (paramName === 'EDV' || paramName === 'ESV' || paramName === 'EDVI' || paramName === 'ESVI' || paramName === 'FS' || paramName === 'EF') ? formatValue(value, true) : formatValue(value);
            }
            
            // 替换模版中的占位符（使用映射后的参数名）
            result = result.replace(new RegExp(`{${mappedParamName}}`, 'g'), formattedValue || '');
        });
        
        // 替换参考值（如 {IVSd参考值}, {LA参考值} 等）
        const refParamNames = ['IVSd', 'LVDd', 'LVWd', 'IVSs', 'LVDs', 'LVWs', 'LA', 'AO'];
        refParamNames.forEach(paramName => {
            const refValue = getReferenceValue(paramName);
            result = result.replace(new RegExp(`{${paramName}参考值}`, 'g'), refValue || '');
        });
        
        // 处理 LVPWs 和 LVPWd 的参考值（HTML 中使用这些名称，但模版中使用 LVWs 和 LVWd）
        const refParamNameMap = {
            'LVPWs': 'LVWs',
            'LVPWd': 'LVWd',
            'AO': 'AO'  // HTML 中使用 AO，模版中也使用 AO
        };
        Object.keys(refParamNameMap).forEach(htmlParamName => {
            const templateParamName = refParamNameMap[htmlParamName];
            const refValue = getReferenceValue(htmlParamName);  // 使用 HTML 参数名获取参考值
            // 替换模版中的占位符（使用模版中的参数名）
            result = result.replace(new RegExp(`{${templateParamName}参考值}`, 'g'), refValue || '');
        });
        
        // 处理EDV/ESV格式：不显示辛普森部分
        const edv = get('EDV', '');
        const esv = get('ESV', '');
        const edvFormatted = edv ? formatValue(edv, true) : '';
        const esvFormatted = esv ? formatValue(esv, true) : '';
        // 处理EDV辛普森和ESV辛普森
        const edvSimpson = get('EDV辛普森', '');
        const esvSimpson = get('ESV辛普森', '');
        const edvSimpsonFormatted = edvSimpson ? formatValue(edvSimpson, true) : '';
        const esvSimpsonFormatted = esvSimpson ? formatValue(esvSimpson, true) : '';
        // 替换EDV辛普森和ESV辛普森占位符
        result = result.replace(/{EDV辛普森}/g, edvSimpsonFormatted || '');
        result = result.replace(/{ESV辛普森}/g, esvSimpsonFormatted || '');
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
        
        // 处理EF格式：不显示辛普森部分，保留整数
        const ef = get('EF', '');
        const efFormatted = ef ? formatValue(ef, true) : '';
        // 处理EF辛普森
        const efSimpson = get('EF辛普森', '');
        const efSimpsonFormatted = efSimpson ? formatValue(efSimpson, true) : '';
        // 替换EF辛普森占位符
        result = result.replace(/{EF辛普森}/g, efSimpsonFormatted || '');
        result = result.replace(/{EF}%\/%（辛普森}/g, efFormatted ? `${efFormatted}%` : '%');
        result = result.replace(/{EF}\/%（辛普森）/g, efFormatted ? `${efFormatted}%` : '%');
        // 替换单独的EF占位符
        result = result.replace(/{EF}/g, efFormatted || '');
        
        // 处理FS格式：保留整数
        const fs = get('FS', '');
        const fsFormatted = fs ? formatValue(fs, true) : '';
        result = result.replace(/{FS}/g, fsFormatted || '');
        
        // 处理"各瓣口血流"占位符 - 已解除，不再处理此占位符
        // 占位符{各瓣口血流}将保持原样，不会被替换
        
        // 检查标签是否激活的辅助函数
        const isTagActive = (tagName) => {
            const button = document.querySelector(`.valve-flow-tag[data-tag="${tagName}"]`);
            return button && button.classList.contains('active');
        };
        
        // 处理嵌套占位符：先替换外层占位符（会生成包含内层占位符的文本）
        // 例如：{二尖瓣反流} -> 二尖瓣反流速：{二尖瓣反流速}m/s{二尖瓣压力差};
        // 例如：{二尖瓣反流程度2} -> 二尖瓣{二尖瓣反流程度}反流，
        const nestedPlaceholders = {
            // 各瓣口血流正常占位符
            '各瓣口血流正常': () => {
                const isActive = isTagActive('各瓣口血流正常');
                if (isActive) {
                    return '各瓣口未见明显反流、湍流；';
                }
                return '';
            },
            // 反流程度的嵌套占位符
            '二尖瓣反流程度2': () => {
                const isActive = isTagActive('二尖瓣反流');
                if (!isActive) {
                    return '';
                }
                return `二尖瓣{二尖瓣反流程度}反流，`;
            },
            '三尖瓣反流程度2': () => {
                const isActive = isTagActive('三尖瓣反流');
                if (!isActive) {
                    return '';
                }
                return `三尖瓣{三尖瓣反流程度}反流，`;
            },
            '肺动脉瓣反流程度2': () => {
                const isActive = isTagActive('肺动脉瓣反流');
                if (!isActive) {
                    return '';
                }
                return `肺动脉瓣{肺动脉瓣反流程度}反流，`;
            },
            '主动脉瓣反流程度2': () => {
                const isActive = isTagActive('主动脉瓣反流');
                if (!isActive) {
                    return '';
                }
                return `主动脉瓣{主动脉瓣反流程度}反流，`;
            },
            '二尖瓣反流': () => {
                const isActive = isTagActive('二尖瓣反流');
                const velocity = get('二尖瓣反流速', '');
                const pressure = get('二尖瓣压力差', '');
                
                // 如果标签未激活，返回空字符串
                if (!isActive) {
                    return '';
                }
                
                let content = '二尖瓣反流速：';
                if (velocity) {
                    content += `${formatValue(velocity)}m/s`;
                } else {
                    content += 'm/s';
                }
                if (pressure) {
                    content += `（${formatValue(pressure)}mmHg）`;
                } else {
                    content += '（mmHg）';
                }
                return content + ';';
            },
            '三尖瓣反流': () => {
                const isActive = isTagActive('三尖瓣反流');
                const velocity = get('三尖瓣反流速', '');
                const pressure = get('三尖瓣压力差', '');
                
                // 如果标签未激活，返回空字符串
                if (!isActive) {
                    return '';
                }
                
                let content = '三尖瓣反流速：';
                if (velocity) {
                    content += `${formatValue(velocity)}m/s`;
                } else {
                    content += 'm/s';
                }
                if (pressure) {
                    content += `（${formatValue(pressure)}mmHg）`;
                } else {
                    content += '（mmHg）';
                }
                return content + ';';
            },
            '肺动脉瓣反流': () => {
                const isActive = isTagActive('肺动脉瓣反流');
                const velocity = get('肺动脉瓣反流速', '');
                const pressure = get('肺动脉瓣压力差', '');
                
                // 如果标签未激活，返回空字符串
                if (!isActive) {
                    return '';
                }
                
                let content = '肺动脉瓣反流速：';
                if (velocity) {
                    content += `${formatValue(velocity)}m/s`;
                } else {
                    content += 'm/s';
                }
                if (pressure) {
                    content += `（${formatValue(pressure)}mmHg）`;
                } else {
                    content += '（mmHg）';
                }
                return content + ';';
            },
            '主动脉瓣反流': () => {
                const isActive = isTagActive('主动脉瓣反流');
                const velocity = get('主动脉瓣反流速', '');
                const pressure = get('主动脉瓣压力差', '');
                
                // 如果标签未激活，返回空字符串
                if (!isActive) {
                    return '';
                }
                
                let content = '主动脉瓣反流速：';
                if (velocity) {
                    content += `${formatValue(velocity)}m/s`;
                } else {
                    content += 'm/s';
                }
                if (pressure) {
                    content += `（${formatValue(pressure)}mmHg）`;
                } else {
                    content += '（mmHg）';
                }
                return content + ';';
            }
        };
        
        // 先替换嵌套占位符（会生成包含内层占位符的文本）
        // 记录哪些占位符被替换为空
        const emptyPlaceholders = new Set();
        
        // 检查反流占位符是否在连续行中且都为空
        const regurgitationPlaceholders = ['二尖瓣反流', '三尖瓣反流', '肺动脉瓣反流', '主动脉瓣反流'];
        
        // 先检查这些占位符是否都为空
        const regurgitationReplacements = {};
        regurgitationPlaceholders.forEach(key => {
            if (nestedPlaceholders[key]) {
                regurgitationReplacements[key] = nestedPlaceholders[key]();
            }
        });
        
        const allRegurgitationEmpty = regurgitationPlaceholders.every(key => 
            nestedPlaceholders[key] && regurgitationReplacements[key] === ''
        );
        
        // 如果所有反流占位符都为空，检查它们是否在连续行中，如果是则用一行空白行替换
        if (allRegurgitationEmpty) {
            // 构建匹配连续行的正则表达式（允许不同的前导空格）
            // 匹配模式：每行都是 可选空格 + {占位符} + 可选空格 + 换行
            const lines = regurgitationPlaceholders.map(key => `\\s*\\{${key}\\}\\s*`);
            // 匹配连续的这些行（允许中间有空行，但顺序要正确）
            const pattern = lines.join('\\n+');
            const regex = new RegExp(`(${pattern})\\n*`, 'gm');
            
            // 检查是否匹配到（不修改lastIndex）
            const testMatch = result.match(regex);
            if (testMatch) {
                // 如果找到连续的反流占位符行，用一行空白行替换
                result = result.replace(regex, '\n');
            }
        }
        
        // 处理所有嵌套占位符
        Object.keys(nestedPlaceholders).forEach(key => {
            const replacement = nestedPlaceholders[key]();
            // 如果替换结果为空
            if (replacement === '') {
                emptyPlaceholders.add(key);
                // 如果这个占位符不在已经处理过的连续反流占位符中，才单独移除
                // 或者如果连续反流占位符处理失败，也需要单独移除
                if (!allRegurgitationEmpty || !regurgitationPlaceholders.includes(key)) {
                    // 先尝试匹配单独成行的占位符（行首 + 占位符 + 可选空格 + 换行）
                    // 使用多行模式，匹配整行
                    const linePattern = new RegExp(`^\\s*\\{${key}\\}\\s*$`, 'gm');
                    if (linePattern.test(result)) {
                        // 如果匹配到单独成行的，移除整行（包括换行符）
                        result = result.replace(linePattern, '');
                    } else {
                        // 否则移除行中的占位符（只移除占位符本身，不包含前后空格）
                        // 这样可以避免在连续占位符之间留下多余空格
                        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), '');
                    }
                }
            } else {
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), replacement);
            }
        });
        
        // 清理空行：移除只包含空白字符的行（作为额外清理）
        result = result.replace(/^\s+$/gm, '');
        
        // 然后再替换内层的占位符（第二次遍历，处理嵌套占位符生成的内层占位符）
        // 处理反流程度占位符（格式：{二尖瓣反流程度}）
        const severityPlaceholders = [
            { key: '二尖瓣反流程度', param: '二尖瓣反流程度' },
            { key: '三尖瓣反流程度', param: '三尖瓣反流程度' },
            { key: '肺动脉瓣反流程度', param: '肺动脉瓣反流程度' },
            { key: '主动脉瓣反流程度', param: '主动脉瓣反流程度' }
        ];
        severityPlaceholders.forEach(({ key, param }) => {
            const value = get(param, '');
            // 替换反流程度占位符
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
        });
        
        // 注意：由于嵌套占位符已经处理了这些情况，这里主要处理模板中直接使用的内层占位符
        // 处理反流速占位符（格式：{二尖瓣反流速}m/s）
        const velocityPlaceholders = [
            { key: '二尖瓣反流速', param: '二尖瓣反流速', tag: '二尖瓣反流' },
            { key: '三尖瓣反流速', param: '三尖瓣反流速', tag: '三尖瓣反流' },
            { key: '肺动脉瓣反流速', param: '肺动脉瓣反流速', tag: '肺动脉瓣反流' },
            { key: '主动脉瓣反流速', param: '主动脉瓣反流速', tag: '主动脉瓣反流' }
        ];
        velocityPlaceholders.forEach(({ key, param, tag }) => {
            const isActive = isTagActive(tag);
            const value = get(param, '');
            if (value) {
                // 替换 {二尖瓣反流速}m/s 为 实际值m/s
                result = result.replace(new RegExp(`\\{${key}\\}m/s`, 'g'), `${formatValue(value)}m/s`);
                // 也替换单独的占位符
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), formatValue(value));
            } else if (isActive) {
                // 如果标签激活但值为空，返回 m/s
                result = result.replace(new RegExp(`\\{${key}\\}m/s`, 'g'), 'm/s');
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), '');
            } else {
                // 如果标签未激活，移除占位符
                result = result.replace(new RegExp(`\\{${key}\\}m/s`, 'g'), '');
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), '');
            }
        });
        
        // 处理反流压力差占位符（格式：{二尖瓣压力差}）
        const pressurePlaceholders = [
            { key: '二尖瓣压力差', param: '二尖瓣压力差', tag: '二尖瓣反流' },
            { key: '三尖瓣压力差', param: '三尖瓣压力差', tag: '三尖瓣反流' },
            { key: '肺动脉瓣压力差', param: '肺动脉瓣压力差', tag: '肺动脉瓣反流' },
            { key: '主动脉瓣压力差', param: '主动脉瓣压力差', tag: '主动脉瓣反流' }
        ];
        pressurePlaceholders.forEach(({ key, param, tag }) => {
            const isActive = isTagActive(tag);
            const value = get(param, '');
            if (value) {
                // 替换 {二尖瓣压力差} 为 （实际值mmHg）
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), `（${formatValue(value)}mmHg）`);
            } else if (isActive) {
                // 如果标签激活但值为空，返回 （mmHg）
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), '（mmHg）');
            } else {
                // 如果标签未激活，移除占位符
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), '');
            }
        });
        
        // 注意：不在这里清理编号格式，保持模板的原始缩进
        // 编号格式的清理将在提取"结论"部分时进行，而"所见"部分保持原始格式
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
        
        if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
            // M型、非M型或猫心超（含体重）：根据体重查找参考数据
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
        } else if (referenceRange === '兔子' && breedReferenceData && breedReferenceData['兔']) {
            // 兔子：从不同品种参考值中获取（CSV中为"兔"）
            referenceData = breedReferenceData['兔'];
        }
        
        // 检查是否有对应的MD模板（使用新的模版加载逻辑）
        let mdTemplate = null;
        const templateKey = `${diseaseType}_${referenceRange}_${simpsonEnabled ? 'simpson' : 'normal'}`;
        
        // 先尝试从缓存中获取
        if (mdTemplates[templateKey]) {
            mdTemplate = mdTemplates[templateKey];
        } else {
            // 如果缓存中没有，尝试加载（异步加载，这里先返回null，后续会在generateTemplate中处理）
            // 为了兼容性，也检查旧版本的模版键（但金毛已经使用新逻辑，不再使用旧键）
            const oldTemplateKeys = {
                'MMVD_M型_normal': 'MMVD',
                'MMVD_非M型_normal': 'MMVD',
                'HCM_猫_normal': 'HCM',
                'HCM_猫心超（含体重）_normal': 'HCM',
                'Normal_M型_normal': '犬健康',
                'Normal_非M型_normal': '犬健康',
                'Normal_猫_normal': '猫健康',
                'Normal_猫心超（含体重）_normal': '猫(含体重）'
                // 注意：金毛相关的模版不再使用旧键，统一使用新逻辑
            };
            
            const oldKey = oldTemplateKeys[templateKey];
            if (oldKey && mdTemplates[oldKey]) {
                mdTemplate = mdTemplates[oldKey];
            }
        }
        
        // 如果有MD模板，使用MD模板并替换占位符
        if (mdTemplate) {
            let result = templateConfig.replaceMDTemplatePlaceholders(mdTemplate, referenceData, referenceWeight, referenceRange);
            // 提取"所见"部分（从"# 所见"到"# 结论"之前）
            const findingsMatch = result.match(/#\s*所见\s*\n([\s\S]*?)(?=\n#\s*结论|$)/);
            if (findingsMatch) {
                let findings = findingsMatch[1];
                // 统一编号格式：将"数字. "或"数字."改为"  数字."（2个空格，点后面没有空格）
                // 匹配行首的编号格式（可能没有前导空格，或前导空格不是2个）
                findings = findings.replace(/^(\s*)(\d+)\.\s*/gm, (match, leadingSpaces, number) => {
                    // 统一为2个空格 + 数字 + 点（点后面没有空格）
                    return '  ' + number + '.';
                });
                // 在每个编号部分的内容结束后（下一个编号行之前）添加一个空白行
                // 匹配模式：编号行 + 该编号的所有内容（直到下一个编号行之前）+ 下一个编号行
                // 在下一个编号行之前插入空行
                // 使用更精确的正则：匹配编号行及其所有后续行（直到遇到下一个编号行）
                // 注意：使用 * 而不是 +，因为编号行后面可能直接是下一个编号行
                // 在每个编号部分的内容结束后（下一个编号行之前）添加一个空白行
                // 使用更可靠的方法：先按编号行分割，然后在每个部分之间插入空行
                // 匹配所有编号行位置
                const lines = findings.split('\n');
                let processedLines = [];
                let i = 0;
                let isFirstNumberedSection = true;
                
                while (i < lines.length) {
                    const line = lines[i];
                    // 检查是否是编号行（以"  "开头，后跟数字和点）
                    if (/^  \d+\./.test(line)) {
                        // 如果不是第一个编号部分，且processedLines不为空且最后一个元素不是空行，添加空行
                        if (!isFirstNumberedSection && processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                            processedLines.push('');
                        }
                        // 添加编号行
                        processedLines.push(line);
                        i++;
                        // 添加该编号的所有内容行（直到下一个编号行或文件结尾）
                        while (i < lines.length && !/^  \d+\./.test(lines[i])) {
                            processedLines.push(lines[i]);
                            i++;
                        }
                        // 如果还有下一个编号行，在它之前添加空行
                        if (i < lines.length && /^  \d+\./.test(lines[i])) {
                            processedLines.push('');
                        }
                        isFirstNumberedSection = false;
                    } else {
                        // 不是编号行，直接添加
                        processedLines.push(line);
                        i++;
                    }
                }
                
                findings = processedLines.join('\n');
                // 确保最后一行后面有一个空白行
                findings = findings.trimEnd() + '\n';
                // 清理多余的连续空白行（超过2个换行符的，保留为2个）
                findings = findings.replace(/\n{3,}/g, '\n\n');
                return findings;
            }
            // 如果没有找到"# 所见"标记，返回整个模板（去除"# 结论"之后的内容）
            const conclusionIndex = result.indexOf('# 结论');
            if (conclusionIndex !== -1) {
                let findings = result.substring(0, conclusionIndex);
                // 统一编号格式：将"数字. "或"数字."改为"  数字."（2个空格，点后面没有空格）
                findings = findings.replace(/^(\s*)(\d+)\.\s*/gm, (match, leadingSpaces, number) => {
                    // 统一为2个空格 + 数字 + 点（点后面没有空格）
                    return '  ' + number + '.';
                });
                // 在每个编号部分的内容结束后（下一个编号行之前）添加一个空白行
                // 使用逐行处理的方法确保正确插入空行
                const lines = findings.split('\n');
                let processedLines = [];
                let i = 0;
                let isFirstNumberedSection = true;
                
                while (i < lines.length) {
                    const line = lines[i];
                    // 检查是否是编号行（以"  "开头，后跟数字和点）
                    if (/^  \d+\./.test(line)) {
                        // 如果不是第一个编号部分，且processedLines不为空且最后一个元素不是空行，添加空行
                        if (!isFirstNumberedSection && processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                            processedLines.push('');
                        }
                        // 添加编号行
                        processedLines.push(line);
                        i++;
                        // 添加该编号的所有内容行（直到下一个编号行或文件结尾）
                        while (i < lines.length && !/^  \d+\./.test(lines[i])) {
                            processedLines.push(lines[i]);
                            i++;
                        }
                        // 如果还有下一个编号行，在它之前添加空行
                        if (i < lines.length && /^  \d+\./.test(lines[i])) {
                            processedLines.push('');
                        }
                        isFirstNumberedSection = false;
                    } else {
                        // 不是编号行，直接添加
                        processedLines.push(line);
                        i++;
                    }
                }
                
                findings = processedLines.join('\n');
                // 确保最后一行后面有一个空白行
                findings = findings.trimEnd() + '\n';
                // 清理多余的连续空白行（超过2个换行符的，保留为2个）
                findings = findings.replace(/\n{3,}/g, '\n\n');
                return findings;
            }
            let findings = result;
            // 统一编号格式：将"数字. "或"数字."改为"  数字."（2个空格，点后面没有空格）
            findings = findings.replace(/^(\s*)(\d+)\.\s*/gm, (match, leadingSpaces, number) => {
                // 统一为2个空格 + 数字 + 点（点后面没有空格）
                return '  ' + number + '.';
            });
            // 在每个编号部分的内容结束后（下一个编号行之前）添加一个空白行
            // 使用逐行处理的方法确保正确插入空行
            const lines = findings.split('\n');
            let processedLines = [];
            let i = 0;
            let isFirstNumberedSection = true;
            
            while (i < lines.length) {
                const line = lines[i];
                // 检查是否是编号行（以"  "开头，后跟数字和点）
                if (/^  \d+\./.test(line)) {
                    // 如果不是第一个编号部分，且processedLines不为空且最后一个元素不是空行，添加空行
                    if (!isFirstNumberedSection && processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
                        processedLines.push('');
                    }
                    // 添加编号行
                    processedLines.push(line);
                    i++;
                    // 添加该编号的所有内容行（直到下一个编号行或文件结尾）
                    while (i < lines.length && !/^  \d+\./.test(lines[i])) {
                        processedLines.push(lines[i]);
                        i++;
                    }
                    // 如果还有下一个编号行，在它之前添加空行
                    if (i < lines.length && /^  \d+\./.test(lines[i])) {
                        processedLines.push('');
                    }
                    isFirstNumberedSection = false;
                } else {
                    // 不是编号行，直接添加
                    processedLines.push(line);
                    i++;
                }
            }
            
            findings = processedLines.join('\n');
            // 确保最后一行后面有一个空白行
            findings = findings.trimEnd() + '\n';
            // 清理多余的连续空白行（超过2个换行符的，保留为2个）
            findings = findings.replace(/\n{3,}/g, '\n\n');
            return findings;
        }
        
        // 生成体重参考值文本（使用最终选择的体重值，而非输入的体重值）
        const weightText = referenceWeight ? ` (参考值：${referenceWeight}kg)` : '';
        
        let findings = `${animalType}侧卧位扫查：\n\n`;
        
        // 1. M型/2D部分（根据参考范围显示）
        let scanTypeText = 'M型/2D';
        if (referenceRange === '非M型') {
            scanTypeText = '2D';
        }
        findings += `  1.${scanTypeText} (mm)${weightText}\n\n`;
        
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
            'LVWs': ['LVFWs', 'LVWs'],  // 支持LVFWs（猫心超_体重.csv）和LVWs
            'LA': ['LA'],
            'AO': ['AO', 'Ao']
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
        
        findings += `     ${ivsd}${lvdd}\n`;
        findings += `     ${lvwd}${ivss}\n`;
        findings += `     ${lvds}${lvws}\n`;
        
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
        const fsFormatted = fs ? formatValue(fs, true) : '';
        const efFormatted = ef ? formatValue(ef, true) : '';
        
        // 不显示辛普森部分
        // EDV: ml                    ESV: ml
        const edvText = edvFormatted ? `EDV: ${edvFormatted}ml` : 'EDV: ml';
        const esvText = esvFormatted ? `ESV: ${esvFormatted}ml` : 'ESV: ml';
        const edvLine = edvText.padEnd(45, ' ');
        findings += `     ${edvLine}${esvText}\n`;
        
        // EDVI:                      ESVI:
        const edviLine = `EDVI: `.padEnd(45, ' ');
        findings += `     ${edviLine}ESVI: \n`;
        
        // FS: %                      EF: %
        const fsAligned = `FS: ${fsFormatted ? `${fsFormatted}%` : '%'}`.padEnd(45, ' ');
        const efText = efFormatted ? `EF: ${efFormatted}%` : 'EF: %';
        findings += `     ${fsAligned}${efText}\n\n`;
        
        // 2. 瓣膜异常部分
        findings += `  2.瓣膜异常：未见明显异常\n`;
        findings += `    各瓣叶移动：未见明显异常\n`;
        const la = get('LA', '');
        const ao = get('AO', '');
        const laAo = get('LA/AO', '');
        const laFormatted = la ? formatValue(la) : '';
        const aoFormatted = ao ? formatValue(ao) : '';
        const laAoFormatted = laAo ? formatValue(laAo) : '';
        
        // 获取LA和AO的参考值
        const laRef = getReferenceValue('LA');
        const aoRef = getReferenceValue('AO');
        
        // 格式化LA和AO，包含参考值
        const laText = laFormatted ? (laRef ? `LA： ${laFormatted}(${laRef})` : `LA： ${laFormatted}()`) : (laRef ? `LA： （${laRef}）` : `LA： （）`);
        const aoText = aoFormatted ? (aoRef ? `AO:  ${aoFormatted}(${aoRef})` : `AO:  ${aoFormatted}()`) : (aoRef ? `AO:  （${aoRef}）` : `AO:  ()`);
        
        findings += `     ${laText}\n`;
        findings += `     ${aoText}\n`;
        findings += `     LA/AO:  ${laAoFormatted || ''}\n\n`;
        
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
        
        findings += `  3.频谱多普勒： 未见明显异常；\n`;
        let dopplerLine = '';
        if (vpa) dopplerLine += `VPA: ${formatValue(vpa)} `;
        if (vao) dopplerLine += `VAO: ${formatValue(vao)} `;
        if (e) dopplerLine += `E: ${formatValue(e)} m/s `;
        if (a) dopplerLine += `A: ${formatValue(a)} m/s `;
        if (eA) dopplerLine += `E/A: ${formatValue(eA)} `;
        if (eaFusion) dopplerLine += `EA融合: ${formatValue(eaFusion)} `;
        if (eE) dopplerLine += `E/E': ${formatValue(eE)}`;
        
        if (dopplerLine) {
            findings += `     ${dopplerLine.trim()}\n`;
        } else {
            findings += `     E: m/s A: m/s E/A: ； E/E': \n`;
        }
        
        // 添加动态标签参数
        if (sam || falseChord || leftVentricleSimpson || leftAtrialVolume || mitralRegurgFlow || tricuspidRegurgFlow || aorticRegurgFlow || pulmonaryRegurgFlow) {
            findings += `\n`;
            if (sam) findings += `     SAM: ${formatValue(sam)}\n`;
            if (falseChord) findings += `    假腱索: ${formatValue(falseChord)}\n`;
            if (leftAtrialVolume) findings += `    左心房容量: ${formatValue(leftAtrialVolume)}\n`;
            if (mitralRegurgFlow) findings += `    二尖瓣反流: ${formatValue(mitralRegurgFlow)}\n`;
            if (tricuspidRegurgFlow) findings += `    三尖瓣反流: ${formatValue(tricuspidRegurgFlow)}\n`;
            if (aorticRegurgFlow) findings += `    主动脉瓣反流: ${formatValue(aorticRegurgFlow)}\n`;
            if (pulmonaryRegurgFlow) findings += `    肺动脉瓣反流: ${formatValue(pulmonaryRegurgFlow)}\n`;
        }
        findings += `\n`;
        
        // 4. 心率部分
        const heartRate = get('心率', '');
        let heartRateFormatted = '';
        if (heartRate) {
            // 检查是否为纯数字
            const trimmedValue = heartRate.trim();
            const isPureNumber = /^\d+(\.\d+)?$/.test(trimmedValue);
            
            if (isPureNumber) {
                // 纯数字：保留整数，输出为"约{整数}bpm"
                const num = parseFloat(trimmedValue);
                heartRateFormatted = `约${Math.round(num)}bpm`;
            } else {
                // 包含字符：输出为"{原内容}bpm"
                heartRateFormatted = `${trimmedValue}bpm`;
            }
        }
        findings += `  4.心率： ${heartRateFormatted || ''}`;
        
        // 清理编号格式：将"数字. "或"数字."改为"  数字."（去除编号后的空格，并在编号前添加2个空格）
        // 先处理"数字. "的情况
        findings = findings.replace(/^(\d+)\.\s+/gm, '  $1.');
        // 再处理行首没有2个空格的"数字."的情况
        findings = findings.replace(/^(?!  )(\d+)\./gm, '  $1.');
        
        // 在最后添加一个空白行
        return findings + '\n';
    },
    
    // 生成结论模板
    generateConclusion: (diseaseType, referenceRange, params) => {
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 获取参考数据（与generateFindings中相同的逻辑）
        const weight = get('体重', '');
        let referenceData = null;
        let referenceWeight = null;
        
        if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
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
        } else if (referenceRange === '兔子' && breedReferenceData && breedReferenceData['兔']) {
            // 兔子：从不同品种参考值中获取（CSV中为"兔"）
            referenceData = breedReferenceData['兔'];
        }
        
        
        // 检查是否有对应的MD模板
        let mdTemplate = null;
        
        // 使用新的模版加载逻辑
        const templateKey = `${diseaseType}_${referenceRange}_${simpsonEnabled ? 'simpson' : 'normal'}`;
        if (mdTemplates[templateKey]) {
            mdTemplate = mdTemplates[templateKey];
        } else {
            // 兼容旧版本的模版键
            const oldTemplateKeys = {
                'MMVD': 'MMVD',
                'HCM': 'HCM',
                'Normal_M型_normal': '犬健康',
                'Normal_非M型_normal': '犬健康',
                'Normal_猫_normal': '猫健康',
                'Normal_金毛_normal': '金毛',
                'Normal_猫心超（含体重）_normal': '猫(含体重）'
            };
            const oldKey = oldTemplateKeys[templateKey];
            if (oldKey && mdTemplates[oldKey]) {
                mdTemplate = mdTemplates[oldKey];
            }
            // 兼容旧版本的单独键名（MMVD和HCM）
            if (!mdTemplate && diseaseType === 'MMVD' && mdTemplates['MMVD']) {
                mdTemplate = mdTemplates['MMVD'];
            }
            if (!mdTemplate && diseaseType === 'HCM' && mdTemplates['HCM']) {
                mdTemplate = mdTemplates['HCM'];
            }
        }
        
        // 如果有MD模板，从模板中提取结论部分
        if (mdTemplate) {
            let result = templateConfig.replaceMDTemplatePlaceholders(mdTemplate, referenceData, referenceWeight, referenceRange);
            // 提取"结论"部分（从"# 结论"之后到文件末尾）
            const conclusionMatch = result.match(/#\s*结论\s*\n([\s\S]*?)$/);
            if (conclusionMatch) {
                let conclusion = conclusionMatch[1].trim();
                // 清理编号格式：将"数字. "或"数字."改为"  数字."（去除编号后的空格，并在编号前添加2个空格）
                // 先处理"数字. "的情况
                conclusion = conclusion.replace(/^(\d+)\.\s+/gm, '  $1.');
                // 再处理行首没有2个空格的"数字."的情况
                conclusion = conclusion.replace(/^(?!  )(\d+)\./gm, '  $1.');
                return conclusion;
            }
            // 如果没有找到"# 结论"标记，尝试查找"结论"关键字
            const conclusionIndex = result.indexOf('# 结论');
            if (conclusionIndex !== -1) {
                let conclusion = result.substring(conclusionIndex + '# 结论'.length).trim();
                // 去除开头的换行和空格
                conclusion = conclusion.replace(/^\s*\n+/, '').trim();
                // 清理编号格式：将"数字. "或"数字."改为"  数字."（去除编号后的空格，并在编号前添加2个空格）
                // 先处理"数字. "的情况
                conclusion = conclusion.replace(/^(\d+)\.\s+/gm, '  $1.');
                // 再处理行首没有2个空格的"数字."的情况
                conclusion = conclusion.replace(/^(?!  )(\d+)\./gm, '  $1.');
                return conclusion;
            }
        }
        
        // 如果没有MD模板，使用现有的生成逻辑
        let conclusion = '';
        
        // 如果是正常类型或未选择疾病类型（默认），使用健康结论模板
        if (diseaseType === 'Normal' || !diseaseType) {
            return generateHealthConclusionFromTemplate(params);
        }
        
        // 如果是MMVD类型，使用特定的结论格式
        if (diseaseType === 'MMVD') {
            conclusion += '  1.二尖瓣退行性病变：二尖瓣前叶增厚、轻度脱垂、轻度反流。\n';
            conclusion += '  2.左心室收缩功能尚可，舒张功能下降。\n';
            conclusion += '  3.三尖瓣轻度反流，疑轻度肺动脉高压。\n';
            // 清理编号格式：将"数字. "或"数字."改为"  数字."（去除编号后的空格，并在编号前添加2个空格）
            // 先处理"数字. "的情况
            conclusion = conclusion.replace(/^(\d+)\.\s+/gm, '  $1.');
            // 再处理行首没有2个空格的"数字."的情况
            conclusion = conclusion.replace(/^(?!  )(\d+)\./gm, '  $1.');
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
async function generateTemplate() {
    const diseaseType = selectedDiseaseType;
    const referenceRange = selectedReferenceRange;
    
    // 如果未选择疾病类型或参考范围，显示提示
    if (!diseaseType || !referenceRange) {
        document.getElementById('findingsText').value = '请选择疾病类型和参考，模板将自动生成。';
        document.getElementById('conclusionText').value = '请选择疾病类型和参考，模板将自动生成。';
        return;
    }

    // 先尝试加载所需的模版（如果还没有加载）
    const templateKey = `${diseaseType}_${referenceRange}_${simpsonEnabled ? 'simpson' : 'normal'}`;
    if (!mdTemplates[templateKey]) {
        await loadMDTemplateNew(diseaseType, referenceRange, false, simpsonEnabled);
    }

    // 使用模板配置生成所见部分
    const findings = templateConfig.generateFindings(diseaseType, referenceRange, parameters);
    
    // 使用模板配置生成结论部分
    const conclusion = templateConfig.generateConclusion(diseaseType, referenceRange, parameters);

    // 使用value设置文本内容，将换行符保留
    document.getElementById('findingsText').value = findings;
    document.getElementById('conclusionText').value = conclusion;
}


// 参数输入区域始终显示（已移除折叠功能）
document.addEventListener('DOMContentLoaded', function() {
    // 确保参数内容区域始终显示
    const parametersContent = document.getElementById('parametersContent');
    if (parametersContent) {
                parametersContent.style.display = 'block';
                parametersContent.classList.add('expanded');
    }
    
    // 页面加载时更新EA融合输入框的显示状态
    updateEAFusionVisibility();
    
    // 页面加载时检查 EA融合 的值，更新 E、A、E/A 输入框状态
    updateEAInputsState();
    
    // 页面加载时检查E值的颜色显示
    updateEColor();
    
    // 页面加载时检查辛普森输入框的显示状态
    toggleSimpsonInputs();
    
    // 页面加载时检查IVSd和LVWs的颜色显示
    updateIVSdAndLVWsColor();
    
    // 页面加载时检查LA/AO的颜色显示
    updateLAOverAOColor();
    
    // 页面加载时初始化反流速输入框的压力差和颜色
    ['二尖瓣反流速', '三尖瓣反流速', '肺动脉瓣反流速', '主动脉瓣反流速'].forEach(paramName => {
        const input = document.querySelector(`input[data-param="${paramName}"]`);
        if (input && input.value) {
            updateRegurgitationPressure(paramName, input.value);
        }
    });
    updateRegurgitationVelocityColor();
    
    // 页面加载时默认选择"正常"
    const normalButton = document.querySelector('.top-disease-selector .disease-button[data-value="Normal"]');
    if (normalButton) {
        // 模拟点击事件，触发所有相关逻辑
        normalButton.click();
            } else {
        // 如果按钮不存在，直接调用处理函数
        handleDiseaseTypeChange('Normal');
    }
    
    // 问题反馈功能
    const feedbackButton = document.getElementById('feedbackButton');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackModalClose = document.getElementById('feedbackModalClose');
    const feedbackCancel = document.getElementById('feedbackCancel');
    const feedbackSubmit = document.getElementById('feedbackSubmit');
    const feedbackText = document.getElementById('feedbackText');
    
    // 打开反馈对话框
    if (feedbackButton && feedbackModal) {
        feedbackButton.addEventListener('click', function() {
            feedbackModal.classList.add('show');
            feedbackText.focus();
        });
    }
    
    // 关闭反馈对话框
    function closeFeedbackModal() {
        if (feedbackModal) {
            feedbackModal.classList.remove('show');
            if (feedbackText) {
                feedbackText.value = '';
            }
        }
    }
    
    if (feedbackModalClose) {
        feedbackModalClose.addEventListener('click', closeFeedbackModal);
    }
    
    if (feedbackCancel) {
        feedbackCancel.addEventListener('click', closeFeedbackModal);
    }
    
    // 点击对话框外部关闭
    if (feedbackModal) {
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                closeFeedbackModal();
            }
        });
    }
    
    // 保存反馈到服务器logs文件夹
    async function saveFeedbackToFile(content) {
        if (!content || content.trim() === '') {
            alert('请输入反馈内容！');
            return;
        }
        
        // 获取当前选择的疾病类型和参考范围
        const currentDiseaseType = selectedDiseaseType || '未选择';
        const currentReferenceRange = selectedReferenceRange || '未选择';
        const simpsonStatus = simpsonEnabled ? '已激活' : '未激活';
        
        // 准备发送到服务器的数据
        const feedbackData = {
            content: content,
            diseaseType: currentDiseaseType,
            referenceRange: currentReferenceRange,
            simpsonStatus: simpsonStatus
        };
        
        try {
            // 发送POST请求到服务器
            const response = await fetch('/save_feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(feedbackData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 关闭对话框并显示提示
                closeFeedbackModal();
                alert(`反馈已保存到 logs 文件夹！\n文件名: ${result.filename}`);
            } else {
                alert('保存失败：' + result.message);
            }
        } catch (error) {
            console.error('保存反馈时出错:', error);
            // 如果服务器不可用，回退到下载方式
            alert('无法连接到服务器，将使用下载方式保存反馈。');
            saveFeedbackAsDownload(content, currentDiseaseType, currentReferenceRange, simpsonStatus);
    }
    }
    
    // 备用方案：如果服务器不可用，使用下载方式
    function saveFeedbackAsDownload(content, diseaseType, referenceRange, simpsonStatus) {
        const now = new Date();
        const timestamp = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const feedbackContent = `=== 问题反馈 ===
时间: ${timestamp}
疾病类型: ${diseaseType}
参考范围: ${referenceRange}
含辛普森测量: ${simpsonStatus}
---
反馈内容:
${content}
---
${'='.repeat(50)}

`;
        
        const blob = new Blob([feedbackContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `问题反馈_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        closeFeedbackModal();
        alert('反馈已下载，请手动保存到 logs 文件夹！');
    }
    
    // 提交反馈
    if (feedbackSubmit && feedbackText) {
        feedbackSubmit.addEventListener('click', function() {
            const content = feedbackText.value.trim();
            saveFeedbackToFile(content);
        });
        
        // 支持Ctrl+Enter快捷键提交
        feedbackText.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                const content = feedbackText.value.trim();
                saveFeedbackToFile(content);
            }
        });
    }

    // 复制功能
    function copyToClipboard(text, button) {
        if (!text || text.trim() === '') {
            return;
        }
        
        // 使用现代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                // 复制成功，显示反馈
                const originalText = button.innerHTML;
                button.classList.add('copied');
                button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已复制';
                
                setTimeout(function() {
                    button.classList.remove('copied');
                    button.innerHTML = originalText;
                }, 2000);
            }).catch(function(err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动选择文本复制');
            });
        } else {
            // 降级方案：使用传统方法
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                const originalText = button.innerHTML;
                button.classList.add('copied');
                button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 已复制';
                
                setTimeout(function() {
                    button.classList.remove('copied');
                    button.innerHTML = originalText;
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动选择文本复制');
            }
            document.body.removeChild(textArea);
        }
    }

    // 绑定复制按钮事件
    const copyFindingsBtn = document.getElementById('copyFindingsBtn');
    const copyConclusionBtn = document.getElementById('copyConclusionBtn');
    const findingsText = document.getElementById('findingsText');
    const conclusionText = document.getElementById('conclusionText');

    if (copyFindingsBtn && findingsText) {
        copyFindingsBtn.addEventListener('click', function() {
            copyToClipboard(findingsText.value, copyFindingsBtn);
        });
    }

    if (copyConclusionBtn && conclusionText) {
        copyConclusionBtn.addEventListener('click', function() {
            copyToClipboard(conclusionText.value, copyConclusionBtn);
        });
    }
});

