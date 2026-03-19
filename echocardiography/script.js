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


// 跟踪选中的参考体重（用于参考范围查找，不影响输入框）
let selectedReferenceWeight = null;

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

// 辛普森数据缓存：按「疾病类型_参考范围」存储，切换疾病/参考/辛普森按钮时保留，刷新清空时清除
let simpsonDataCache = {};

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

// 更新体重引用值显示 - 显示多个体重选择范围
function updateWeightReferenceDisplay() {
    const weightReferenceDisplay = document.getElementById('weightReferenceDisplay');
    if (!weightReferenceDisplay) return;
    
    const referenceRange = selectedReferenceRange;
    const weight = parameters['体重'];
    
    // 在M型、非M型或猫心超（含体重）参考范围，且输入了体重时才显示引用体重值
    if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
        const dataArray = csvReferenceData[referenceRange];
        if (!dataArray || dataArray.length === 0) {
            weightReferenceDisplay.textContent = '';
            return;
        }
        
        const weightValue = parseFloat(weight);
        if (isNaN(weightValue)) {
            weightReferenceDisplay.textContent = '';
            return;
        }
        
        // 找到当前体重所在的位置和相邻的体重值
        let currentIndex = -1;
        let prevWeight = null;
        let currentWeight = null;
        let nextWeight = null;
        let foundExact = false;
        
        // 查找等于或最接近的体重值
        for (let i = 0; i < dataArray.length; i++) {
            const rowWeight = parseFloat(dataArray[i]['kg']);
            if (!isNaN(rowWeight)) {
                if (rowWeight === weightValue) {
                    // 找到完全匹配的体重值
                    currentIndex = i;
                    currentWeight = rowWeight;
                    foundExact = true;
                    // 获取前一个和后一个体重值
                    if (i > 0) {
                        prevWeight = parseFloat(dataArray[i - 1]['kg']);
                    }
                    if (i < dataArray.length - 1) {
                        nextWeight = parseFloat(dataArray[i + 1]['kg']);
                    }
                    break;
                } else if (rowWeight > weightValue) {
                    // 找到第一个大于输入体重的值
                    currentIndex = i;
                    currentWeight = rowWeight;
                    // 获取前一个体重值
                    if (i > 0) {
                        prevWeight = parseFloat(dataArray[i - 1]['kg']);
                    }
                    // 获取下一个体重值（如果存在且不同）
                    if (i < dataArray.length - 1) {
                        const nextRowWeight = parseFloat(dataArray[i + 1]['kg']);
                        if (!isNaN(nextRowWeight) && nextRowWeight !== rowWeight) {
                            nextWeight = nextRowWeight;
                        }
                    }
                    break;
                }
            }
        }
        
        // 如果没有找到大于的值，使用最后一个值
        if (currentIndex === -1 && dataArray.length > 0) {
            for (let i = dataArray.length - 1; i >= 0; i--) {
                const rowWeight = parseFloat(dataArray[i]['kg']);
                if (!isNaN(rowWeight)) {
                    currentIndex = i;
                    currentWeight = rowWeight;
                    if (i > 0) {
                        prevWeight = parseFloat(dataArray[i - 1]['kg']);
                    }
                    break;
                }
            }
        }
        
        // 构建显示内容：显示多个可点击的体重选择范围
        weightReferenceDisplay.innerHTML = '';
        if (currentIndex >= 0 && currentWeight !== null) {
            const weightOptions = [];
            const addedWeights = new Set(); // 用于去重
            
            // 如果有前一个体重值，添加前一个选项
            if (prevWeight !== null && !isNaN(prevWeight) && !addedWeights.has(prevWeight)) {
                weightOptions.push({ weight: prevWeight, isCurrent: false });
                addedWeights.add(prevWeight);
            }
            
            // 显示当前体重值
            if (!addedWeights.has(currentWeight)) {
                weightOptions.push({ weight: currentWeight, isCurrent: foundExact });
                addedWeights.add(currentWeight);
            }
            
            // 如果有下一个体重值，添加下一个选项（确保不重复）
            if (nextWeight !== null && !isNaN(nextWeight) && !addedWeights.has(nextWeight)) {
                weightOptions.push({ weight: nextWeight, isCurrent: false });
                addedWeights.add(nextWeight);
            }
            
            if (weightOptions.length > 0) {
                // 创建容器
                const container = document.createElement('span');
                container.style.display = 'inline-flex';
                container.style.gap = '4px';
                container.style.alignItems = 'center';
                
                // 确定应该激活哪个按钮：优先使用选中的参考体重，如果没有则使用最接近输入体重的值（中间的选项）
                let weightToActivate = null;
                if (selectedReferenceWeight !== null) {
                    weightToActivate = selectedReferenceWeight;
                } else {
                    // 如果没有选中的参考体重，需要找到最接近输入体重的值
                    // 遍历weightOptions，找到与输入体重差值最小的选项
                    let minDiff = Infinity;
                    let closestOptionWeight = null;
                    
                    for (let i = 0; i < weightOptions.length; i++) {
                        const diff = Math.abs(weightOptions[i].weight - weightValue);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestOptionWeight = weightOptions[i].weight;
                        }
                    }
                    
                    // 使用最接近的选项（通常是中间的选项）
                    weightToActivate = closestOptionWeight !== null ? closestOptionWeight : currentWeight;
                }
                
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/05f58e13-e211-436c-a191-0963c2a2ae6e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:785',message:'Determining weight to activate',data:{selectedReferenceWeight,currentWeight,weightValue,weightToActivate,weightOptionsCount:weightOptions.length,weightOptions:weightOptions.map(o=>o.weight)},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                weightOptions.forEach((option, index) => {
                    // 创建可点击的体重按钮
                    const weightBtn = document.createElement('button');
                    weightBtn.type = 'button';
                    weightBtn.className = 'weight-option-btn';
                    weightBtn.textContent = `${option.weight}kg`;
                    weightBtn.dataset.weight = option.weight;
                    
                    // #region agent log
                    fetch('http://127.0.0.1:7244/ingest/05f58e13-e211-436c-a191-0963c2a2ae6e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:818',message:'Weight button activation check',data:{optionWeight:option.weight,weightToActivate,isMatch:Math.abs(option.weight - weightToActivate) < 0.001,optionIndex:index,buttonPosition:index === 0 ? 'left' : index === 1 ? 'middle' : index === 2 ? 'right' : 'unknown'},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    
                    // 只激活与weightToActivate完全匹配的按钮（确保只有一个被激活）
                    // 使用严格相等比较，避免浮点数精度问题
                    if (weightToActivate !== null && Math.abs(option.weight - weightToActivate) < 0.001) {
                        weightBtn.classList.add('active');
                    }
                    
                    // 添加点击事件
                    weightBtn.addEventListener('click', function() {
                        // 设置选中的参考体重值（不修改输入框）
                        const selectedWeight = parseFloat(this.dataset.weight);
                        selectedReferenceWeight = selectedWeight;
                        
                        // 更新参考值显示和体重显示框
                        updateReferenceValues();
                        updateWeightReferenceDisplay();
                        
                        // 更新模板
                        generateTemplate();
                    });
                    
                    container.appendChild(weightBtn);
                    
                    // 添加分隔符（最后一个不添加）
                    if (index < weightOptions.length - 1) {
                        const separator = document.createElement('span');
                        separator.textContent = '/';
                        separator.style.margin = '0 2px';
                        separator.style.color = '#999';
                        container.appendChild(separator);
                    }
                });
                
                weightReferenceDisplay.appendChild(container);
            }
        }
        return;
    }
    
    // 如果没有引用体重值，清空显示
    weightReferenceDisplay.textContent = '';
}

// 更新参数标签旁的参考值显示
function updateReferenceValues() {
    const referenceRange = selectedReferenceRange;
    // 优先使用选中的参考体重，如果没有则使用输入的体重
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : parameters['体重'];

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
    // 优先使用选中的参考体重，如果没有则使用输入的体重
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : parameters['体重'];
    
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

// 计算并显示 LVDDN 值
// LVDDn = LVDd（cm）/[体重（kg）^0.294]
function calculateLVDDN() {
    const lvddInput = document.querySelector('input[data-param="LVDd"]');
    const weightInput = document.getElementById('weightInput');
    const lvddnDisplay = document.getElementById('lvddnDisplay');
    
    if (lvddInput && weightInput && lvddnDisplay) {
        const lvddValue = parseFloat(lvddInput.value.trim());
        const weightValue = parseFloat(weightInput.value.trim());
        
        // 计算LVDDN
        if (!isNaN(lvddValue) && lvddValue > 0 && !isNaN(weightValue) && weightValue > 0) {
            // LVDd单位是mm，需要转换为cm
            const lvddCm = lvddValue / 10;
            // 计算公式: LVDDn = LVDd（cm）/[体重（kg）^0.294]
            const weightPower = Math.pow(weightValue, 0.294);
            const lvddn = lvddCm / weightPower;
            
            // 保留适当的小数位数（通常保留2位小数）
            const lvddnRounded = lvddn.toFixed(2);
            
            lvddnDisplay.textContent = `LVDDN ${lvddnRounded}`;
            
            // 同步到 parameters，供“结论”规则读取（例如 LVDDN >= 1.7）
            parameters['LVDDN'] = parseFloat(lvddnRounded);
            
            // 当LVDDN≥1.7时，数值文本显示为红色，否则显示为黑色
            if (lvddn >= 1.7) {
                lvddnDisplay.style.color = '#e74c3c'; // 红色
            } else {
                lvddnDisplay.style.color = '#000000'; // 黑色
            }
        } else {
            // 即使没有输入值，也显示默认文本
            lvddnDisplay.textContent = 'LVDDN -';
            lvddnDisplay.style.color = '#666'; // 灰色，表示暂无数据
            
            // 清空参数，避免旧值影响后续结论生成
            delete parameters['LVDDN'];
        }
    }
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
// 使用事件委托，确保在DOM加载后也能正常工作
function setupInputListeners() {
    document.querySelectorAll('.m-type-input, .other-param-input, .weight-input').forEach(input => {
        input.addEventListener('input', function() {
            const paramName = this.getAttribute('data-param');
            const value = this.value.trim();
            
            if (value) {
                parameters[paramName] = value;
            } else {
                delete parameters[paramName];
            }
            
            // 如果体重变化，自动计算LVDDN
            if (paramName === '体重') {
                calculateLVDDN();
            }
            
            // 如果LVDd变化，自动计算LVDDN（不再自动计算EDV/FS）
            if (paramName === 'LVDd') {
                calculateLVDDN();
                updateSpecialLogicInputColors();
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
            if (['FS', 'EF', 'VPA', 'VAO', 'E', 'dp/dt'].includes(paramName)) {
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

                // 若用户输入了反流速数值，则取消该瓣口的“未测得”标记
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
            if (paramName === '体重') {
                // 用户手动输入体重时，自动选择最接近的体重值
                let referenceRange = selectedReferenceRange;
                const weight = parameters['体重'];
                const weightValue = weight ? parseFloat(weight) : NaN;

                // 优化体重自动选择：
                // 体重 <= 3.0kg 自动选择 M型（犬＜3kg）
                // 体重 > 3.0kg 自动选择 非M型（犬＞3kg）
                if (!Number.isNaN(weightValue) && weightValue <= 3.0) {
                    const referenceRangeSelect = document.getElementById('referenceRangeSelect');
                    if (referenceRangeSelect && referenceRangeSelect.value !== 'M型') {
                        referenceRangeSelect.value = 'M型';
                    }
                    selectedReferenceRange = 'M型';
                    referenceRange = 'M型';
                    selectedReferenceWeight = null;

                    // 与参考范围切换一致：M型 默认激活含辛普森测量
                    const simpsonButton = document.getElementById('simpsonButton');
                    if (simpsonButton && !simpsonEnabled) {
                        simpsonButton.classList.add('active');
                        simpsonEnabled = true;
                        toggleSimpsonInputs();
                    }
                } else if (!Number.isNaN(weightValue) && weightValue > 3.0) {
                    const referenceRangeSelect = document.getElementById('referenceRangeSelect');
                    if (referenceRangeSelect && referenceRangeSelect.value !== '非M型') {
                        referenceRangeSelect.value = '非M型';
                    }
                    selectedReferenceRange = '非M型';
                    referenceRange = '非M型';
                    selectedReferenceWeight = null;

                    // 与参考范围切换一致：非M型 默认激活含辛普森测量
                    const simpsonButton = document.getElementById('simpsonButton');
                    if (simpsonButton && !simpsonEnabled) {
                        simpsonButton.classList.add('active');
                        simpsonEnabled = true;
                        toggleSimpsonInputs();
                    }
                }
                
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/05f58e13-e211-436c-a191-0963c2a2ae6e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1915',message:'Weight input changed',data:{referenceRange,weight,selectedReferenceWeightBefore:selectedReferenceWeight},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                if ((referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '猫心超（含体重）') && weight) {
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
                            
                            // #region agent log
                            fetch('http://127.0.0.1:7244/ingest/05f58e13-e211-436c-a191-0963c2a2ae6e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1945',message:'Found closest weight',data:{weightValue,closestWeight,minDiff},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                            // #endregion
                            
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
                
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/05f58e13-e211-436c-a191-0963c2a2ae6e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:1955',message:'Selected reference weight set',data:{selectedReferenceWeightAfter:selectedReferenceWeight},timestamp:Date.now(),runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                updateReferenceValues();
                updateWeightReferenceDisplay();
                // 体重变化时自动更新"所见"模板
                generateTemplate();
            } else {
                generateTemplate();
            }
        });
    });

    // dp/dt：显示开关（两按钮），仅影响 MMVD 所见是否输出 dp/dt 行
    const dpdtBtns = document.querySelectorAll('#dpdtInputItem button[data-param="dp/dt显示"]');
    if (dpdtBtns && dpdtBtns.length > 0) {
        dpdtBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const value = btn.getAttribute('data-value') || '';
                dpdtBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (value === '显示') {
                    parameters['dp/dt显示'] = '显示';
                } else {
                    delete parameters['dp/dt显示'];
                }
                updateSpecialLogicInputColors();
                generateTemplate();
            });
        });
        
        // 默认“不显示”
        const activeBtn = document.querySelector('#dpdtInputItem button[data-param="dp/dt显示"].active');
        const activeVal = activeBtn ? (activeBtn.getAttribute('data-value') || '') : '';
        if (activeVal !== '显示') {
            delete parameters['dp/dt显示'];
        }
    }
}

// 设置 tooltip 提示功能
function setupTooltips() {
    const tooltip = document.getElementById('infoTooltip');
    if (!tooltip) return;
    
    // Tooltip 内容定义（LVDDN、EDV Teich、ESV Teich 使用原生 title，与右下角一致）
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

// 设置刷新按钮 - 清空已填写数据，并激活"健康"（正常）
function setupRefreshButton() {
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // 清空 parameters 对象（所见/结论模板依赖此数据）
            Object.keys(parameters).forEach(k => delete parameters[k]);
            selectedReferenceWeight = null;
            simpsonDataCache = {};

            // OCR提示词恢复默认
            const ocrStatus = document.getElementById('ocrStatus');
            if (ocrStatus) {
                ocrStatus.textContent = '可直接粘贴截图到页面，支持自动识别和回填';
            }

            // 清空所有输入框
            document.querySelectorAll('input[type="text"]').forEach(el => { el.value = ''; });
            document.querySelectorAll('textarea').forEach(el => { el.value = ''; });
            // 清空所有下拉框
            document.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
            // 取消所有反流程度按钮的激活状态
            document.querySelectorAll('.regurgitation-severity-btn').forEach(btn => { btn.classList.remove('active'); });
            // 重置“节律不齐”按钮与参数
            const rhythmBtn = document.getElementById('rhythmIrregularButton');
            if (rhythmBtn) rhythmBtn.classList.remove('active');
            delete parameters['节律不齐'];
            // 激活"正常"（健康），并更新模板
            handleDiseaseTypeChange('Normal');
        });
    }
}

// 设置右侧栏垂直高度手动调节
function setupRightSidebarResize() {
    const rightSidebar = document.getElementById('rightSidebar');
    const resizeHandle = document.getElementById('rightSidebarResizeHandle');
    if (!rightSidebar || !resizeHandle) return;

    const TOP_OFFSET = 42;
    const MIN_HEIGHT = 400;
    const BOTTOM_BUFFER = 24; // 预留底部空间，避免超出视口

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = rightSidebar.offsetHeight;
        // 每次拖拽时动态计算上限，确保不超出视口
        const MAX_HEIGHT = Math.max(MIN_HEIGHT, window.innerHeight - TOP_OFFSET - BOTTOM_BUFFER);

        function onMouseMove(e) {
            const deltaY = e.clientY - startY;
            let newHeight = startHeight + deltaY;
            newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
            rightSidebar.style.height = newHeight + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    });
}

// OCR：粘贴/拖拽/选择图片 → 识别参数 → 自动回填
function setupOCR() {
    // 避免重复绑定
    if (window.__echoOcrInitialized) return;
    window.__echoOcrInitialized = true;

    const ocrStatus = document.getElementById('ocrStatus');

    const canUseTesseract = typeof window.Tesseract !== 'undefined';
    if (!canUseTesseract) {
        if (ocrStatus) ocrStatus.textContent = 'OCR库未加载（请检查网络/CDN）';
        return;
    }

    function setBusy(isBusy) {
        // 仅用于更新状态文案，不再控制按钮样式
        if (isBusy && ocrStatus) {
            ocrStatus.textContent = 'OCR识别中…';
        }
    }

    function setStatus(text) {
        if (ocrStatus) ocrStatus.textContent = text || '';
    }

    function extractFirstImageFromClipboardEvent(e) {
        const items = e.clipboardData?.items;
        if (!items) return null;
        for (const item of items) {
            if (item.type && item.type.startsWith('image/')) {
                return item.getAsFile();
            }
        }
        return null;
    }

    function normalizeOcrText(raw) {
        if (!raw) return '';
        return raw
            .replace(/\u00A0/g, ' ')
            .replace(/[，、]/g, ',')
            .replace(/[：]/g, ':')
            .replace(/[（）]/g, ' ')
            .replace(/mm\b/gi, ' mm')
            .replace(/cm\b/gi, ' cm')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function mapKeyToParam(key) {
        const k = key.toUpperCase().replace(/\s+/g, '');
        const map = {
            'IVSD': 'IVSd',
            'IVSDD': 'IVSd',
            'IVSDD.': 'IVSd',
            'IVSDD:': 'IVSd',
            'IVSD:': 'IVSd',
            'LVDD': 'LVDd',
            'LVIDD': 'LVDd',
            'LVIDD.': 'LVDd',
            'LVIDD:': 'LVDd',
            'LVPWD': 'LVPWd',
            'LVWD': 'LVPWd',
            'LVFWD': 'LVPWd',
            'IVSS': 'IVSs',
            'LVDS': 'LVDs',
            'LVIDS': 'LVDs',
            'LVPWS': 'LVPWs',
            'LVWS': 'LVPWs',
            'LVFWS': 'LVPWs',
            'AO': 'AO',
            'AO.': 'AO',
            'LA': 'LA',
            'FS': 'FS',
            'EF': 'EF',
            'VPA': 'VPA',
            'VAO': 'VAO',
            // Diastolic / chambers（OCR）
            'E': 'E',
            'A': 'A',
            'LA_AO': 'LA/AO'
        };
        return map[k] || null;
    }

    function parseValue(rawValue) {
        if (!rawValue) return null;
        // 允许：5.2 / 5,2 / 52（配单位 cm→mm）等
        const cleaned = rawValue
            .replace(/[,，]/g, '.')
            .replace(/[^\d.]+/g, ' ')
            .trim()
            .split(' ')[0];
        if (!cleaned) return null;
        const num = Number.parseFloat(cleaned);
        if (Number.isNaN(num)) return null;
        return num;
    }

    function parseOcrToParamValues(text) {
        const normalized = normalizeOcrText(text);
        if (!normalized) return {};

        // 先用同义词把中文/英文描述统一替换成标准缩写，方便后续正则匹配
        // 这些同义词完全写在本文件中，不依赖 readme.md
        let unified = normalized
            // IVSd
            .replace(/舒张末期室间隔厚度/gi, 'IVSd')
            .replace(/舒张期室间隔厚度/gi, 'IVSd')
            // LVDd（含 LVIDd）
            .replace(/舒张末期左心室内径/gi, 'LVDd')
            .replace(/舒张期左心室内径/gi, 'LVDd')
            .replace(/舒张期左心室直径/gi, 'LVDd')
            .replace(/舒张末期左心室直径/gi, 'LVDd')
            .replace(/\bLVIDd\b/gi, 'LVDd')
            // LVWd（含 LVFWd）
            .replace(/舒张末期左心室游离壁厚度/gi, 'LVWd')
            .replace(/舒张期左心室游离壁厚度/gi, 'LVWd')
            .replace(/\bLVFWd\b/gi, 'LVWd')
            // IVSs
            .replace(/收缩期室间隔厚度/gi, 'IVSs')
            .replace(/收缩末期室间隔厚度/gi, 'IVSs')
            // LVDs（含 LVIDs）
            .replace(/收缩末期左心室内径/gi, 'LVDs')
            .replace(/收缩期左心室内径/gi, 'LVDs')
            .replace(/收缩末期左心室直径/gi, 'LVDs')
            .replace(/收缩期左心室直径/gi, 'LVDs')
            .replace(/\bLVIDs\b/gi, 'LVDs')
            // LVWs（含 LVFWs）
            .replace(/收缩末期左心室游离壁厚度/gi, 'LVWs')
            .replace(/收缩期左心室游离壁厚度/gi, 'LVWs')
            .replace(/\bLVFWs\b/gi, 'LVWs')
            // EDV（Teich）
            .replace(/EDV\(teich\)/gi, 'EDV')
            .replace(/舒张末期容积（?ml）?/gi, 'EDV')
            .replace(/舒张末期左心室容量/gi, 'EDV')
            .replace(/舒张期左心室容量/gi, 'EDV')
            // ESV（Teich）
            .replace(/ESV\(teich\)/gi, 'ESV')
            .replace(/收缩末期容积（?ml）?/gi, 'ESV')
            .replace(/收缩末期左心室容量/gi, 'ESV')
            .replace(/收缩期左心室容量/gi, 'ESV')
            // FS
            .replace(/缩短分数/gi, 'FS')
            .replace(/Fractional Shortening/gi, 'FS')
            // EF（Teich）
            .replace(/EF\(teich\)/gi, 'EF')
            .replace(/射血分数/gi, 'EF')
            .replace(/左心室射血分数/gi, 'EF')
            .replace(/\bLVEF\b/gi, 'EF')
            .replace(/Left Ventricular Ejection Fraction/gi, 'EF')
            .replace(/Ejection Fraction/gi, 'EF')
            // LA/AO：先统一为 LA_AO，避免后续 AO 正则误命中
            .replace(/\bLA\s*\/\s*AO\b/gi, 'LA_AO')
            .replace(/\bLA\s*\/\s*A0\b/gi, 'LA_AO')
            .replace(/左房\s*\/\s*主动脉/gi, 'LA_AO')
            .replace(/左心房\s*\/\s*主动脉/gi, 'LA_AO')
            // E/A：避免 A 正则误命中 E/A 标签里的 A
            .replace(/\bE\s*\/\s*A\b/gi, 'E_A');

        // 再修正少量常见 OCR 误识别：LVIDd→LVDd、IVSd大小写、0/O 等
        const fixed = unified
            .replace(/\bLVlDd\b/gi, 'LVIDd')
            .replace(/\bLVlDs\b/gi, 'LVIDs')
            .replace(/\bIVS[dD]\b/g, 'IVSd')
            .replace(/\bLVPW[dD]\b/g, 'LVPWd')
            .replace(/\bLVPW[sS]\b/g, 'LVPWs');

        const results = {};

        // 只识别 1.M-MODE 段对应的字段：
        // IVSd、LVDd、LVWd、IVSs、LVDs、LVWs、EDV（Teich）、ESV（Teich）、FS、EF（Teich）
        // 规则：在字段名（或同义词已统一为字段名后）后面找到出现的第一个数字
        const patterns = [
            { key: 'IVSd',  re: /\bIVSd\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVIDd', re: /\bLVIDd\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVDd',  re: /\bLVDd\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVPWd', re: /\bLVPWd\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVWd',  re: /\bLVWd\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'IVSs',  re: /\bIVSs\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVIDs', re: /\bLVIDs\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVDs',  re: /\bLVDs\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVPWs', re: /\bLVPWs\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LVWs',  re: /\bLVWs\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'EDV',   re: /\bEDV\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'ESV',   re: /\bESV\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'FS',    re: /\bFS\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'EF',    re: /\bEF\b[^\d\-+]*([0-9]+(?:[.,][0-9]+)?)/i },
            // E / A / AO / LA / LA/AO（Diastolic）
            { key: 'E',      re: /\bE\b(?!\s*\/)\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'A',      re: /\bA\b(?!\s*\/)\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'AO',     re: /\bAO\b\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LA',     re: /\bLA\b\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/i },
            { key: 'LA_AO', re: /\bLA_AO\b\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/i }
        ];

        for (const p of patterns) {
            const m = fixed.match(p.re);
            if (!m) continue;
            const valueNum = parseValue(m[1]);
            if (valueNum === null) continue;
            // 先用 mapKeyToParam 做一次映射（处理 LVIDd/LVFWs 等），否则直接用 key 自身
            const mapped = mapKeyToParam(p.key) || mapKeyToParam(p.key.toUpperCase());
            const targetParam = mapped || p.key;
            if (!targetParam) continue;

            // 简化：不根据单位做 cm→mm 换算，直接使用识别到的数值
            results[targetParam] = valueNum;
        }

        return results;
    }

    function writeParamsToInputs(paramValues) {
        const entries = Object.entries(paramValues);
        if (entries.length === 0) return 0;

        let written = 0;
        for (const [param, value] of entries) {
            const input = document.querySelector(`input[data-param="${param}"]`);
            if (!input) continue;
            input.value = String(value);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            written++;
        }
        return written;
    }

    async function runOcrFromFile(file) {
        if (!file) return;
        setBusy(true);
        setStatus('OCR识别中…（可稍等几秒）');
        try {
            const { data } = await window.Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    if (m?.status === 'recognizing text' && typeof m.progress === 'number') {
                        setStatus(`OCR识别中… ${(m.progress * 100).toFixed(0)}%`);
                    }
                }
            });
            const text = data?.text || '';
            const paramValues = parseOcrToParamValues(text);
            const written = writeParamsToInputs(paramValues);
            if (written > 0) {
                setStatus(`已回填 ${written} 项：${Object.keys(paramValues).join('、')}`);
            } else {
                setStatus('未识别到可回填的字段（建议裁剪到测量值区域再粘贴）');
            }
        } catch (err) {
            console.error('OCR失败:', err);
            setStatus('OCR失败（请换更清晰/更小范围的截图再试）');
        } finally {
            setBusy(false);
        }
    }

    // 粘贴：直接从剪贴板取图片
    document.addEventListener('paste', async (e) => {
        const img = extractFirstImageFromClipboardEvent(e);
        if (!img) return;
        e.preventDefault();
        await runOcrFromFile(img);
    });

    // 拖拽：拖拽图片到页面任意位置
    document.addEventListener('dragover', (e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
            e.preventDefault();
        }
    });
    document.addEventListener('drop', async (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (!file || !file.type?.startsWith('image/')) return;
        e.preventDefault();
        await runOcrFromFile(file);
    });

    setStatus('可直接粘贴截图到页面，支持自动识别和回填');
}

// 立即尝试绑定（如果DOM已加载）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        disableInputMemory();
        setupInputListeners();
        setupTooltips();
        setupRefreshButton();
        setupRightSidebarResize();
        setupOCR();
        calculateLVDDN();
    });
} else {
    disableInputMemory();
    setupInputListeners();
    setupTooltips();
    setupRefreshButton();
    setupRightSidebarResize();
    setupOCR();
    calculateLVDDN();
}

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
    saveSimpsonDataToCache();
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
                // 默认选择“轻度”（与 readme 规则一致）
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

        // dp/dt：仅在 MMVD 模型中显示
        const dpdtItem = document.getElementById('dpdtInputItem');
        if (dpdtItem) {
            if (selectedDiseaseType === 'MMVD') {
                dpdtItem.style.display = 'flex';
            } else {
                dpdtItem.style.display = 'none';
                delete parameters['dp/dt'];
                delete parameters['dp/dt显示'];
                const dpdtInput = dpdtItem.querySelector('input[data-param="dp/dt"]');
                if (dpdtInput) dpdtInput.value = '';
                // 默认：不显示
                const dpdtBtns = dpdtItem.querySelectorAll('button[data-param="dp/dt显示"]');
                if (dpdtBtns && dpdtBtns.length > 0) {
                    dpdtBtns.forEach(b => b.classList.remove('active'));
                    const notShowBtn = dpdtItem.querySelector('button[data-param="dp/dt显示"][data-value="不显示"]');
                    if (notShowBtn) notShowBtn.classList.add('active');
                }
            }
            updateSpecialLogicInputColors();
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
        saveSimpsonDataToCache();
        selectedReferenceRange = this.value;
        // 重置选中的参考体重（当参考范围改变时）
        selectedReferenceWeight = null;
        
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
        restoreSimpsonDataFromCache();
    } else {
        // 隐藏前先保存到缓存，再清空
        saveSimpsonDataToCache();
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

        // 若标记为“未测得”，清空对应的反流速/压差参数，避免后续逻辑按数值生成
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
            // 设置反流程度按钮组的默认值（若还没有激活按钮）
            const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                if (severityParamName) {
                    const getDefaultSeverity = (paramName) => {
                        // 肺动脉瓣/主动脉瓣默认优先“微量”
                        if (paramName === '肺动脉瓣反流程度' || paramName === '主动脉瓣反流程度') return '微量';
                        return '轻度';
                    };

                    // 检查是否已经有激活的按钮
                    const activeBtn = severityButtons.querySelector('.regurgitation-severity-btn.active');
                    if (!activeBtn) {
                        // 如果没有激活的按钮，激活默认按钮
                        const defaultSeverity = getDefaultSeverity(severityParamName);
                        const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${defaultSeverity}"]`);
                        if (defaultBtn) {
                            defaultBtn.classList.add('active');
                            parameters[severityParamName] = defaultSeverity;
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

            // 清空“未测得”按钮状态与参数
            inputItem.querySelectorAll('.regurgitation-unknown-btn').forEach(btn => {
                const unknownParam = btn.getAttribute('data-param');
                btn.classList.remove('active');
                if (unknownParam) delete parameters[unknownParam];
            });

            // 重置反流程度按钮组为默认值
            const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                const getDefaultSeverity = (paramName) => {
                    if (paramName === '肺动脉瓣反流程度' || paramName === '主动脉瓣反流程度') return '微量';
                    return '轻度';
                };
                // 取消所有按钮的激活状态
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const defaultSeverity = getDefaultSeverity(severityParamName);
                const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${defaultSeverity}"]`);
                if (defaultBtn) defaultBtn.classList.add('active');
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

            // 清空“未测得”按钮状态与参数
            item.querySelectorAll('.regurgitation-unknown-btn').forEach(btn => {
                const unknownParam = btn.getAttribute('data-param');
                btn.classList.remove('active');
                if (unknownParam) delete parameters[unknownParam];
            });

            // 重置反流程度按钮组为默认值
            const severityButtons = item.querySelector('.regurgitation-severity-buttons');
            if (severityButtons) {
                const severityParamName = severityButtons.getAttribute('data-param');
                const getDefaultSeverity = (paramName) => {
                    if (paramName === '肺动脉瓣反流程度' || paramName === '主动脉瓣反流程度') return '微量';
                    return '轻度';
                };
                // 取消所有按钮的激活状态
                severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                const defaultSeverity = getDefaultSeverity(severityParamName);
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
        
        // EDV和ESV格式化：当值在0.1到1之间时，保留1位小数，否则保留整数
        const formatEDVESV = (value) => {
            if (!value) return '';
            const num = parseFloat(value);
            if (isNaN(num)) return value; // 如果不是数字，返回原值
            return (num > 0.1 && num < 1) ? num.toFixed(1) : num.toFixed(0);
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
            // EDV、ESV、EF需要特殊处理，跳过它们（在后面单独处理）
            if (paramName === 'EDV' || paramName === 'ESV' || paramName === 'EF') {
                return;
            }
            
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
                // 其他参数：EDVI、ESVI、FS保留0位小数（整数），其他参数保留2位小数
                if (paramName === 'EDVI' || paramName === 'ESVI' || paramName === 'FS') {
                    formattedValue = formatValue(value, true);
                } else {
                    formattedValue = formatValue(value);
                }
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
        
        // 处理EDV/ESV格式：使用Teich输入框数值
        const edv = get('EDV', '');
        const esv = get('ESV', '');
        const edvFormatted = edv ? formatEDVESV(edv) : '';
        const esvFormatted = esv ? formatEDVESV(esv) : '';
        // 处理EDV辛普森和ESV辛普森
        const edvSimpson = get('EDV辛普森', '');
        const esvSimpson = get('ESV辛普森', '');
        const edvSimpsonFormatted = edvSimpson ? formatEDVESV(edvSimpson) : '';
        const esvSimpsonFormatted = esvSimpson ? formatEDVESV(esvSimpson) : '';
        // 替换EDV辛普森和ESV辛普森占位符
        if (simpsonEnabled) {
            // 含辛普森测量激活时，显示辛普森值（如果有值），如果没有值则替换为空字符串
            // 这样模板格式 {EDV}ml/{EDV辛普森}ml（辛普森）会显示为 {EDV}ml/ml（辛普森）
            result = result.replace(/{EDV辛普森}/g, edvSimpsonFormatted || '');
            result = result.replace(/{ESV辛普森}/g, esvSimpsonFormatted || '');
        } else {
            // 含辛普森测量未激活时，移除辛普森占位符
            result = result.replace(/{EDV辛普森}/g, '');
            result = result.replace(/{ESV辛普森}/g, '');
        }
        // 替换EDV和ESV占位符（包括辛普森格式）
        // 注意：如果simpsonEnabled为true，需要保留辛普森格式
        if (simpsonEnabled) {
            // 含辛普森测量激活时，保留辛普森格式
            // 格式：{EDV}ml/{EDV辛普森}ml（辛普森） 或 {EDV}ml/ml（辛普森）
            // 先处理包含辛普森的格式
            result = result.replace(/{EDV}ml\/ml（辛普森）/g, edvFormatted ? `${edvFormatted}ml/ml（辛普森）` : 'ml/ml（辛普森）');
            result = result.replace(/{ESV}ml\/ml（辛普森）/g, esvFormatted ? `${esvFormatted}ml/ml（辛普森）` : 'ml/ml（辛普森）');
            result = result.replace(/{EDV}\/（辛普森）/g, edvFormatted ? `${edvFormatted}ml/（辛普森）` : 'ml/（辛普森）');
            result = result.replace(/{ESV}\/（辛普森）/g, esvFormatted ? `${esvFormatted}ml/（辛普森）` : 'ml/（辛普森）');
        } else {
            // 不含辛普森测量时，统一转换为不显示辛普森
            result = result.replace(/{EDV}ml\/ml（辛普森）/g, edvFormatted ? `${edvFormatted}ml` : 'ml');
            result = result.replace(/{ESV}ml\/ml（辛普森）/g, esvFormatted ? `${esvFormatted}ml` : 'ml');
            result = result.replace(/{EDV}\/（辛普森）/g, edvFormatted ? `${edvFormatted}ml` : 'ml');
            result = result.replace(/{ESV}\/（辛普森）/g, esvFormatted ? `${esvFormatted}ml` : 'ml');
        }
        // 替换单独的EDV和ESV占位符
        result = result.replace(/{EDV}/g, edvFormatted || '');
        result = result.replace(/{ESV}/g, esvFormatted || '');
        
        // 处理EDVI/ESVI格式：不显示值
        result = result.replace(/{EDVI}/g, '');
        result = result.replace(/{ESVI}/g, '');
        
        // 处理EF格式：不显示辛普森部分，保留整数（手动输入）
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

        // 清理“仅空白字符”的行（常见于占位符整行被替换为空时，留下缩进空行）
        // 只移除含空格/Tab 的空行，不影响模板中真正的空行（只有 \n 的那种）
        result = result.replace(/^[ \t]+\n/gm, '');

        // 3.彩色多普勒检查这一行：如果尾部是中文逗号，统一改为中文分号
        // 例如只激活三尖瓣/肺动脉瓣反流时，会出现“...反流，”的结尾
        result = result.replace(/^(3\.\s*彩色多普勒检查[^\n]*?)，\s*$/gm, '$1；');
        // 防御：如果模板本身结尾已写“；”，避免出现“，；”
        result = result.replace(/，；/g, '；');

        // 定向修复：第3段反流明细在仅激活部分瓣膜时，容易出现“多一行空行”
        // 目标：E/A 这一行结束后，直接跟第一条“X尖瓣反流速”明细，中间不留空行
        // 同时：各条反流明细之间不出现额外空行
        const regurgStartRe = /(E:\s*[^\n]*\n)(?:\s*\n)+(\s*(?:二尖瓣反流速|三尖瓣反流速|肺动脉瓣反流速|主动脉瓣反流速))/g;
        result = result.replace(regurgStartRe, '$1$2');
        const regurgBetweenRe = /(\n\s*(?:二尖瓣反流速|三尖瓣反流速|肺动脉瓣反流速|主动脉瓣反流速)[^\n]*\n)(?:\s*\n)+(\s*(?:二尖瓣反流速|三尖瓣反流速|肺动脉瓣反流速|主动脉瓣反流速))/g;
        result = result.replace(regurgBetweenRe, '$1$2');

        // 结论：瓣口血流结论（用于模板中的 {瓣口血流结论}）
        const buildValveFlowConclusion = () => {
            const regurgTags = [
                { tag: '二尖瓣反流', label: '二尖瓣', severityParam: '二尖瓣反流程度', velocityParam: '二尖瓣反流速' },
                { tag: '三尖瓣反流', label: '三尖瓣', severityParam: '三尖瓣反流程度', velocityParam: '三尖瓣反流速' },
                { tag: '肺动脉瓣反流', label: '肺动脉瓣', severityParam: '肺动脉瓣反流程度', velocityParam: '肺动脉瓣反流速' },
                { tag: '主动脉瓣反流', label: '主动脉瓣', severityParam: '主动脉瓣反流程度', velocityParam: '主动脉瓣反流速' }
            ];

            const activeRegurg = regurgTags.filter(v => isTagActive(v.tag));
            const normalActive = isTagActive('各瓣口血流正常');

            // 有任何反流：另起一行描述血流异常（同一条结论项内换行）
            if (activeRegurg.length > 0) {
                const parts = activeRegurg.map(v => {
                    const sev = (get(v.severityParam, '') || '').trim();
                    return `${v.label}${sev || ''}反流`;
                });

                let sentence = `\n    各瓣口血流异常：${parts.join('、')}。`;

                // 额外规则：二尖瓣反流速 > 6.5m/s
                const mvActive = isTagActive('二尖瓣反流');
                if (mvActive) {
                    const mvVelRaw = (get('二尖瓣反流速', '') || '').toString().trim();
                    const mvVel = Number.parseFloat(mvVelRaw);
                    if (!Number.isNaN(mvVel) && mvVel > 6.5) {
                        sentence += '收缩压偏高，建议排查高血压。';
                    }
                }

                return sentence;
            }

            // 无反流：若“各瓣口血流正常”激活 → 固定结论；否则也给一个合理默认
            if (normalActive) return '各瓣口血流未见明显异常。';
            return '各瓣口血流未见明显异常。';
        };

        result = result.replace(/{瓣口血流结论}/g, buildValveFlowConclusion());
        
        // 注意：不在这里清理编号格式，保持模板的原始缩进
        // 编号格式的清理将在提取"结论"部分时进行，而"所见"部分保持原始格式
        return result;
    },
    
    // 生成所见模板
    generateFindings: (diseaseType, referenceRange, params) => {
        const animalType = templateConfig.getAnimalType(referenceRange);
        const get = (key, defaultValue = '') => templateConfig.getParam(key, defaultValue);
        
        // 获取体重：优先使用选中的参考体重，如果没有则使用输入的体重
        const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : get('体重', '');
        
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

        // =========================
        // 规则生成（不依赖 Markdown 模板）
        // 当前覆盖：Normal（犬） + MMVD（犬）→ 使用与 Normal 一致的规则框架
        // =========================
        const isDogRuleBase =
            (diseaseType === 'Normal' || diseaseType === 'MMVD' || !diseaseType) &&
            (referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '金毛');

        if (isDogRuleBase) {
            const formatValue = (value, isInteger = false) => {
                if (value === undefined || value === null || value === '') return '';
                const num = parseFloat(value);
                if (isNaN(num)) return String(value);
                return isInteger ? num.toFixed(0) : num.toFixed(2);
            };

            // 参数名映射（将CSV列名映射到标准参数名）
            const standardToCsvMap = {
                'IVSd': ['IVSd', 'IVSd '],
                'LVDd': ['LVIDd', 'LVDd'],
                'LVWd': ['LVFWd', 'LVWd', 'LVWd '],
                'IVSs': ['IVSs'],
                'LVDs': ['LVIDs', 'LVIDs ', 'LVDs'],
                'LVWs': ['LVFWs', 'LVWs', 'LVWs '],
                'LA': ['LA'],
                'AO': ['AO', 'Ao']
            };

            const getReferenceValue = (csvKey) => {
                if (!referenceData || !csvKey) return '';
                if (referenceData[csvKey]) return referenceData[csvKey];
                const csvColNames = standardToCsvMap[csvKey] || [csvKey];
                for (const csvColName of csvColNames) {
                    if (referenceData[csvColName]) return referenceData[csvColName];
                    const trimmedColName = csvColName.trim().toLowerCase();
                    for (const key in referenceData) {
                        if (key.trim().toLowerCase() === trimmedColName) return referenceData[key];
                    }
                }
                return '';
            };

            // canonical key -> 当前输入值（页面参数名映射）
            const valueByKey = (key) => {
                switch (key) {
                    case 'IVSd': return get('IVSd', '');
                    case 'LVDd': return get('LVDd', '');
                    case 'LVWd': return get('LVPWd', ''); // 页面：LVPWd
                    case 'IVSs': return get('IVSs', '');
                    case 'LVDs': return get('LVDs', '');
                    case 'LVWs': return get('LVPWs', ''); // 页面：LVPWs
                    case 'EDV_teich': return get('EDV', '');
                    case 'EDV_simpson': return get('EDV辛普森', '');
                    case 'ESV_teich': return get('ESV', '');
                    case 'ESV_simpson': return get('ESV辛普森', '');
                    case 'EDVI': return get('EDVI', '');
                    case 'ESVI': return get('ESVI', '');
                    case 'FS': return get('FS', '');
                    case 'EF_teich': return get('EF', '');
                    case 'EF_simpson': return get('EF辛普森', '');
                    default: return get(key, '');
                }
            };

            const formatParamWithRef = (label, value, refKey = null) => {
                const refValue = refKey ? getReferenceValue(refKey) : '';
                const formattedValue = value ? formatValue(value) : '';
                if (formattedValue) return refValue ? `${label}: ${formattedValue}（${refValue}）` : `${label}: ${formattedValue}（）`;
                return refValue ? `${label}:（${refValue}）` : `${label}:（）`;
            };

            // 两列间距：左列补齐宽度（越小两列越靠近）
            // 注意：包含中文全角括号/标点时，padEnd按“字符数”补齐会导致视觉不齐；
            // 这里按“显示宽度”（全角=2，半角=1）补齐，保证两列稳定对齐。
            const colWidth = 30;

            const charDisplayWidth = (ch) => {
                const cp = ch.codePointAt(0);
                // 简化版 East Asian Width：常见全角/中日韩字符视为2列宽
                if (
                    (cp >= 0x1100 && cp <= 0x115F) || // Hangul Jamo
                    (cp >= 0x2E80 && cp <= 0xA4CF) || // CJK, radicals, Yi
                    (cp >= 0xAC00 && cp <= 0xD7A3) || // Hangul Syllables
                    (cp >= 0xF900 && cp <= 0xFAFF) || // CJK Compatibility Ideographs
                    (cp >= 0xFE10 && cp <= 0xFE19) || // Vertical forms
                    (cp >= 0xFE30 && cp <= 0xFE6F) || // CJK Compatibility Forms
                    (cp >= 0xFF00 && cp <= 0xFF60) || // Fullwidth forms
                    (cp >= 0xFFE0 && cp <= 0xFFE6)    // Fullwidth symbols
                ) {
                    return 2;
                }
                return 1;
            };

            const stringDisplayWidth = (s) => {
                let w = 0;
                for (const ch of String(s)) w += charDisplayWidth(ch);
                return w;
            };

            const padToDisplayWidth = (s, targetWidth) => {
                const str = String(s);
                let w = stringDisplayWidth(str);
                if (w >= targetWidth) return str;
                return str + ' '.repeat(targetWidth - w);
            };

            const alignCol = (text) => padToDisplayWidth(text, colWidth);

            // readme: mmode_2col_rows
            const rows = [
                { left: 'IVSd', right: 'LVDd' },
                { left: 'LVWd', right: 'IVSs' },
                { left: 'LVDs', right: 'LVWs' },
                { left: ['EDV_teich', 'EDV_simpson'], right: ['ESV_teich', 'ESV_simpson'] },
                { left: 'EDVI', right: 'ESVI' },
                { left: 'FS', right: ['EF_teich', 'EF_simpson'] }
            ];

            const weightText =
                referenceRange === '金毛'
                    ? `（参考：金毛）`
                    : (referenceWeight
                        ? `（参考值: ${referenceWeight}kg）`
                        : (get('体重') ? `（参考值: ${get('体重')}kg）` : ''));

            let findings = '';
            findings += `犬侧卧位扫查:\n`;
            findings += `  1.M-MODE/2D (mm) ${weightText}\n`;

            const renderLeftRight = (leftText, rightText) => {
                // 缩进与 "1.M-MODE/2D" 中的 "M" 对齐（前面 4 个空格）
                findings += `    ${alignCol(leftText)}${rightText}\n`;
            };

            for (const r of rows) {
                // EDV/ESV 行（Teich/Simpson）
                if (Array.isArray(r.left) && Array.isArray(r.right) && r.left[0] === 'EDV_teich') {
                    const edvTeich = valueByKey('EDV_teich');
                    const edvSimp = simpsonEnabled ? valueByKey('EDV_simpson') : '';
                    const esvTeich = valueByKey('ESV_teich');
                    const esvSimp = simpsonEnabled ? valueByKey('ESV_simpson') : '';

                    const edvBase = edvTeich ? `EDV: ${formatValue(edvTeich, true)}ml` : 'EDV: ml';
                    const esvBase = esvTeich ? `ESV: ${formatValue(esvTeich, true)}ml` : 'ESV: ml';

                    let edvText = edvBase;
                    let esvText = esvBase;

                    if (simpsonEnabled) {
                        const edvSimpPart = edvSimp ? `${formatValue(edvSimp, true)}ml` : 'ml';
                        const esvSimpPart = esvSimp ? `${formatValue(esvSimp, true)}ml` : 'ml';
                        edvText = `${edvBase}/${edvSimpPart}（辛普森）`;
                        esvText = `${esvBase}/${esvSimpPart}（辛普森）`;
                    }
                    renderLeftRight(edvText, esvText);
                    continue;
                }

                // FS/EF 行（EF Teich/Simpson）
                if (r.left === 'FS' && Array.isArray(r.right)) {
                    const fs = valueByKey('FS');
                    const efTeich = valueByKey('EF_teich');
                    const efSimp = simpsonEnabled ? valueByKey('EF_simpson') : '';
                    const fsText = fs ? `FS: ${formatValue(fs, true)}%` : 'FS: %';
                    const efBase = efTeich ? `EF: ${formatValue(efTeich, true)}%` : 'EF: %';

                    let efText = efBase;
                    if (simpsonEnabled) {
                        const efSimpPart = efSimp ? `${formatValue(efSimp, true)}%` : '%';
                        efText = `${efBase}/${efSimpPart}（辛普森）`;
                    }
                    renderLeftRight(fsText, efText);
                    continue;
                }

                // EDVI/ESVI 行：无参考值，显示为“EDVI: {值}ml/m2”
                if (r.left === 'EDVI' && r.right === 'ESVI') {
                    const edvi = valueByKey('EDVI');
                    const esvi = valueByKey('ESVI');
                    const edviText = edvi ? `EDVI: ${formatValue(edvi, true)}ml/m2` : 'EDVI: ml/m2';
                    const esviText = esvi ? `ESVI: ${formatValue(esvi, true)}ml/m2` : 'ESVI: ml/m2';
                    renderLeftRight(edviText, esviText);
                    continue;
                }

                const leftKey = r.left;
                const rightKey = r.right;
                const leftLabel = leftKey;
                const rightLabel = rightKey;

                const leftRefKey = leftKey === 'LVWd' ? 'LVWd' : leftKey;
                const rightRefKey = rightKey === 'LVWs' ? 'LVWs' : rightKey;

                const leftText = formatParamWithRef(leftLabel, valueByKey(leftKey), leftRefKey);
                const rightText = formatParamWithRef(rightLabel, valueByKey(rightKey), rightRefKey);
                renderLeftRight(leftText, rightText);
            }

            findings += `\n`;
            if (diseaseType === 'MMVD') {
                const thickness = get('二尖瓣前叶厚度', '');
                const droop = get('脱垂程度', '');
                const thickPart = thickness ? `（较厚处约：${thickness}mm）` : '';
                const droopText = droop ? `${droop}脱垂` : '脱垂';
                const line2Base = `  2.瓣膜异常: 二尖瓣前叶增厚${thickPart}、${droopText}`;

                const chordType = get('腱索断裂类型', '');
                if (chordType) {
                    findings += `${line2Base}； 二尖瓣前叶可见游离强回声亮线。\n`;
                } else {
                    findings += `${line2Base}。\n`;
                }
            } else {
                findings += `  2.瓣膜异常: 未见明显异常；\n`;
                findings += `    心肌及运动异常: 未见明显异常。\n`;
            }
            findings += `    ${formatParamWithRef('AO', get('AO', ''), 'AO')}\n`;
            findings += `    ${formatParamWithRef('LA', get('LA', ''), 'LA')}\n`;
            findings += `    LA/AO:  ${formatValue(get('LA/AO', ''))}\n`;
            const lavi = get('LAVi', '');
            if (lavi) {
                findings += `    LA Volume:  ${formatValue(lavi)}ml/kg\n`;
            }
            findings += `\n`;

            // 3. 彩色多普勒检查：根据左侧标签动态描述各瓣口血流
            const isTagActive = (tagName) => {
                const button = document.querySelector(`.valve-flow-tag[data-tag="${tagName}"]`);
                return button && button.classList.contains('active');
            };
            const regurgFlowTags = [
                { tag: '二尖瓣反流', label: '二尖瓣', severityParam: '二尖瓣反流程度' },
                { tag: '三尖瓣反流', label: '三尖瓣', severityParam: '三尖瓣反流程度' },
                { tag: '肺动脉瓣反流', label: '肺动脉瓣', severityParam: '肺动脉瓣反流程度' },
                { tag: '主动脉瓣反流', label: '主动脉瓣', severityParam: '主动脉瓣反流程度' }
            ];
            const activeFlows = regurgFlowTags.filter(v => isTagActive(v.tag));

            if (isTagActive('各瓣口血流正常') && activeFlows.length === 0) {
                findings += `  3.彩色多普勒检查  各瓣口未见明显反流、湍流；\n`;
            } else if (activeFlows.length > 0) {
                const parts = activeFlows.map(v => {
                    const sev = (get(v.severityParam, '') || '').trim();
                    return `${v.label}${sev || ''}反流`;
                });
                findings += `  3.彩色多普勒检查  ${parts.join('，')}；\n`;
            } else {
                // 未明确勾选“正常”也未勾选具体反流标签时，兜底按正常描述
                findings += `  3.彩色多普勒检查  各瓣口未见明显反流、湍流；\n`;
            }

            // 频谱多普勒 + E/A、E/E'
            findings += `    频谱多普勒检查  VPA: ${get('VPA', '')}m/s；  VAO: ${get('VAO', '')}m/s；\n`;
            findings += `    E: ${get('E', '')}m/s，A: ${get('A', '')}m/s，E/A${get('E/A', '')}； E/E': ${get("E/E'", '')}；\n`;

            // MMVD：在 E/A 行下一行展示 dp/dt（输入为空则不显示）
            if (diseaseType === 'MMVD') {
                const dpdtDisplay = (get('dp/dt显示', '不显示') || '').toString().trim();
                const dpdtRaw = (get('dp/dt', '') || '').toString().trim();
                if (dpdtDisplay === '显示' && dpdtRaw) {
                    findings += `    dP/dt：${formatValue(dpdtRaw)}mmHg/s\n`;
                }
            }

            // 在 E/A 行下面补充各瓣口反流速 + 压差（若有）
            // “未测得”按钮：若激活，则把对应瓣口速度行替换为“XXX反流速未测得；”，并对多个未测得瓣口进行合并书写
            const unknownValves = [];
            const mitralUnknown = get('二尖瓣反流速未测得', '');
            if (isTagActive('二尖瓣反流') && mitralUnknown) unknownValves.push('二尖瓣');

            const tricuspidUnknown = get('三尖瓣反流速未测得', '');
            if (isTagActive('三尖瓣反流') && tricuspidUnknown) unknownValves.push('三尖瓣');

            const pulmonaryUnknown = get('肺动脉瓣反流速未测得', '');
            if (isTagActive('肺动脉瓣反流') && pulmonaryUnknown) unknownValves.push('肺动脉瓣');

            const aorticUnknown = get('主动脉瓣反流速未测得', '');
            if (isTagActive('主动脉瓣反流') && aorticUnknown) unknownValves.push('主动脉瓣');

            const velocityLines = [];
            if (isTagActive('二尖瓣反流') && !mitralUnknown) {
                const mitralVel = get('二尖瓣反流速', '');
                const mitralDp = get('二尖瓣压力差', '');
                const velText = mitralVel ? formatValue(mitralVel) : 'm/s';
                const dpText = mitralDp ? `${formatValue(mitralDp)}mmHg` : 'mmHg';
                velocityLines.push(`    二尖瓣反流速：${velText}（${dpText}）；`);
            }
            if (isTagActive('三尖瓣反流') && !tricuspidUnknown) {
                const tricuspidVel = get('三尖瓣反流速', '');
                const tricuspidDp = get('三尖瓣压力差', '');
                const velText = tricuspidVel ? formatValue(tricuspidVel) : 'm/s';
                const dpText = tricuspidDp ? `${formatValue(tricuspidDp)}mmHg` : 'mmHg';
                velocityLines.push(`    三尖瓣反流速：${velText}（${dpText}）；`);
            }
            if (isTagActive('肺动脉瓣反流') && !pulmonaryUnknown) {
                const pulmonaryVel = get('肺动脉瓣反流速', '');
                const pulmonaryDp = get('肺动脉瓣压力差', '');
                const velText = pulmonaryVel ? formatValue(pulmonaryVel) : 'm/s';
                const dpText = pulmonaryDp ? `${formatValue(pulmonaryDp)}mmHg` : 'mmHg';
                velocityLines.push(`    肺动脉瓣反流速：${velText}（${dpText}）；`);
            }
            if (isTagActive('主动脉瓣反流') && !aorticUnknown) {
                const aorticVel = get('主动脉瓣反流速', '');
                const aorticDp = get('主动脉瓣压力差', '');
                const velText = aorticVel ? formatValue(aorticVel) : 'm/s';
                const dpText = aorticDp ? `${formatValue(aorticDp)}mmHg` : 'mmHg';
                velocityLines.push(`    主动脉瓣反流速：${velText}（${dpText}）；`);
            }

            // 输出仍有数值的反流速行（不包括“未测得”瓣口）
            if (velocityLines.length > 0) {
                velocityLines.forEach(line => {
                    findings += `${line}\n`;
                });
            }

            // “未测得”放在有反流速下一行
            if (unknownValves.length > 0) {
                findings += `    ${unknownValves.join('、')}反流速未测得；\n`;
            }

            findings += `\n`;

            // 心率：自动带单位 bpm（若用户已输入 bpm 则不重复追加）
            const heartRateRaw = (get('心率', '') || '').toString().trim();
            const heartRateText = heartRateRaw
                ? /[bB]pm\s*$/.test(heartRateRaw)
                    ? heartRateRaw
                    : (/^\d+(\.\d+)?$/.test(heartRateRaw)
                        ? `约${Math.round(parseFloat(heartRateRaw))}bpm`
                        : `${heartRateRaw}bpm`)
                : '';
            findings += `  4.心率: ${heartRateText}。\n`;

            // 统一编号格式（与模板路径保持一致）
            findings = findings.replace(/^(\d+)\.\s+/gm, '  $1.');
            findings = findings.replace(/^(?!  )(\d+)\./gm, '  $1.');
            return findings + '\n';
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
                // 为了让两列 padEnd 对齐稳定，避免使用全角括号（显示宽度不等于字符串长度）
                return refValue ? `${label}:(${refValue})` : `${label}:()`;
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
        if (diseaseType === 'MMVD') {
            const thickness = get('二尖瓣前叶厚度', '');
            const droop = get('脱垂程度', '');
            const thickPart = thickness ? `（较厚处约：${thickness}mm）` : '';
            const droopText = droop ? `${droop}脱垂` : '脱垂';
            const line2Base = `  2.瓣膜异常：二尖瓣前叶增厚${thickPart}、${droopText}`;
            
            const chordType = get('腱索断裂类型', '');
            if (chordType) {
                findings += `${line2Base}； 二尖瓣前叶可见游离强回声亮线。\n`;
            } else {
                findings += `${line2Base}。\n`;
            }
            findings += `    各瓣叶移动：未见明显异常\n`;
        } else {
            findings += `  2.瓣膜异常：未见明显异常\n`;
            findings += `    各瓣叶移动：未见明显异常\n`;
        }
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
        // 优先使用选中的参考体重，如果没有则使用输入的体重
        const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : get('体重', '');
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

        // =========================
        // 规则生成（不依赖 Markdown 模板）
        // 当前覆盖：Normal（犬） + MMVD（犬）→ 使用与 Normal 一致的规则框架
        // =========================
        const isDogRuleBase =
            (diseaseType === 'Normal' || diseaseType === 'MMVD' || !diseaseType) &&
            (referenceRange === 'M型' || referenceRange === '非M型' || referenceRange === '金毛');

        if (isDogRuleBase) {
            const isTagActive = (tagName) => {
                const button = document.querySelector(`.valve-flow-tag[data-tag="${tagName}"]`);
                return button && button.classList.contains('active');
            };

            const regurgTags = [
                { tag: '二尖瓣反流', label: '二尖瓣', severityParam: '二尖瓣反流程度' },
                { tag: '三尖瓣反流', label: '三尖瓣', severityParam: '三尖瓣反流程度' },
                { tag: '肺动脉瓣反流', label: '肺动脉瓣', severityParam: '肺动脉瓣反流程度' },
                { tag: '主动脉瓣反流', label: '主动脉瓣', severityParam: '主动脉瓣反流程度' }
            ];
            const activeRegurg = regurgTags.filter(v => isTagActive(v.tag));
            const normalActive = isTagActive('各瓣口血流正常');
            const mitralActive = isTagActive('二尖瓣反流');
            const tvActive = isTagActive('三尖瓣反流');

            let conclusion = '';
            // MMVD：其余反流（非二尖瓣）延后到结论末尾生成
            let mmvdDeferredOtherRegurgLinesRaw = [];
            let mmvdDeferredOtherRegurgEnabled = false;
            let mmvdNeedsDefaultChamberSummary = false;

            if (diseaseType === 'MMVD' && mitralActive) {
                // 1）二尖瓣退行性病变（固定为第 1 条）
                mmvdNeedsDefaultChamberSummary = true;

                const droop = (get('脱垂程度', '') || '').trim();
                const droopText = droop ? `${droop}脱垂` : '脱垂';
                const mitralSev = (get('二尖瓣反流程度', '') || '').trim();
                const mitralText = mitralSev ? `${mitralSev}反流` : '反流';
                const chordType = (get('腱索断裂类型', '') || '').trim();

                const mvVelRaw = (get('二尖瓣反流速', '') || '').toString().trim();
                const mvVel = Number.parseFloat(mvVelRaw);
                const mvExtra = !Number.isNaN(mvVel) && mvVel > 6.5;

                let mitralLine = `  1.二尖瓣退行性病变：二尖瓣前叶增厚、${droopText}、${mitralText}`;
                if (chordType) {
                    if (mvExtra) {
                        // 按示例：疑部分腱索断裂后换行追加“收缩压偏高...”
                        mitralLine += `；${chordType}；`;
                        conclusion += mitralLine + '\n';
                        conclusion += `    收缩压偏高，建议排查高血压。\n`;
                    } else {
                        mitralLine += `；${chordType}。`;
                        conclusion += mitralLine + '\n';
                    }
                } else {
                    if (mvExtra) {
                        // MV>6.5：血压提示单独一行，但不新增编号（便于阅读）
                        mitralLine += '；';
                        conclusion += mitralLine + '\n';
                        conclusion += `    收缩压偏高，建议排查高血压。\n`;
                    } else {
                        mitralLine += '。';
                        conclusion += mitralLine + '\n';
                    }
                }

                // 2）其余反流：延后到结论末尾，按 Normal 的“合并/拆分”逻辑生成
                const otherActiveRegurg = regurgTags.filter(v => v.tag !== '二尖瓣反流' && isTagActive(v.tag));
                if (otherActiveRegurg.length > 0) {
                    const tvVelRaw = (get('三尖瓣反流速', '') || '').toString().trim();
                    const tvVel = Number.parseFloat(tvVelRaw);
                    const tvExtra = tvActive && !Number.isNaN(tvVel) && tvVel > 3.0;
                    const hasExtraConclusionAny = mvExtra || tvExtra; // Normal：MV/TV 任一触发追加则拆分

                    if (!hasExtraConclusionAny) {
                        // 合并为一行
                        const parts = otherActiveRegurg.map(v => {
                            const sev = (get(v.severityParam, '') || '').trim();
                            return `${v.label}${sev || ''}反流`;
                        });
                        mmvdDeferredOtherRegurgLinesRaw = [`${parts.join('、')}。`];
                    } else {
                        // 拆分为多行（顺序：三尖瓣 > 肺动脉瓣 > 主动脉瓣）
                        mmvdDeferredOtherRegurgLinesRaw = [];
                        for (const v of otherActiveRegurg) {
                            const sev = (get(v.severityParam, '') || '').trim();
                            let rawLine = `${v.label}${sev || ''}反流。`;
                            if (v.tag === '三尖瓣反流') {
                                if (tvExtra) {
                                    const doubt = tvVel < 3.4
                                        ? (sev ? `疑${sev}肺动脉高压。` : '疑肺动脉高压。')
                                        : '肺动脉高压。';
                                    rawLine = `${v.label}${sev || ''}反流，${doubt}`;
                                }
                            }
                            mmvdDeferredOtherRegurgLinesRaw.push(rawLine);
                        }
                    }
                    mmvdDeferredOtherRegurgEnabled = true;
                }
            } else if (activeRegurg.length === 0 && normalActive) {
                // 正常：结论为一条，血流和腔室合在一起（与“所见”保持相同的首行缩进）
                conclusion += '  1.心脏各腔室大小、室壁厚度、各瓣口血流未见明显异常。\n';
            } else if (activeRegurg.length > 0) {
                // 有瓣口血流异常：
                // 1）如果所有瓣口都没有追加结论（如高压提示），则合并为一行
                // 2）若任一瓣口触发追加结论，则每个瓣口单独一行

                // 先预判哪些瓣口会触发“追加结论”
                let hasExtraConclusion = false;
                const mvVelRaw0 = (get('二尖瓣反流速', '') || '').toString().trim();
                const mvVel0 = Number.parseFloat(mvVelRaw0);
                if (isTagActive('二尖瓣反流') && !Number.isNaN(mvVel0) && mvVel0 > 6.5) {
                    hasExtraConclusion = true;
                }
                const tvVelRaw0 = (get('三尖瓣反流速', '') || '').toString().trim();
                const tvVel0 = Number.parseFloat(tvVelRaw0);
                if (isTagActive('三尖瓣反流') && !Number.isNaN(tvVel0) && tvVel0 > 3.0) {
                    hasExtraConclusion = true;
                }

                if (!hasExtraConclusion) {
                    // 情况 1：无追加结论 → 合并为一行
                    const parts = activeRegurg.map(v => {
                        const sev = (get(v.severityParam, '') || '').trim();
                        return `${v.label}${sev || ''}反流`;
                    });
                    conclusion += `  1.${parts.join('、')}。\n`;
                    conclusion += '  2.心脏各腔室大小、室壁厚度未见明显异常。\n';
                } else {
                    // 情况 2：存在追加结论 → 每个瓣口单独一行，按 regurgTags 顺序编号
                    let index = 1;
                    for (const v of regurgTags) {
                        if (!isTagActive(v.tag)) continue;

                        const sev = (get(v.severityParam, '') || '').trim();
                        let line = `  ${index}.${v.label}${sev || ''}反流。`;

                        // 二尖瓣：反流速 > 6.5m/s
                        if (v.tag === '二尖瓣反流') {
                            const mvVelRaw = (get('二尖瓣反流速', '') || '').toString().trim();
                            const mvVel = Number.parseFloat(mvVelRaw);
                            if (!Number.isNaN(mvVel) && mvVel > 6.5) {
                                line = line.replace(/。$/, '；');
                                line += '收缩压偏高，建议排查高血压。';
                            }
                        }

                        // 三尖瓣：反流速 > 3.0 m/s
                        if (v.tag === '三尖瓣反流') {
                            const tvVelRaw = (get('三尖瓣反流速', '') || '').toString().trim();
                            const tvVel = Number.parseFloat(tvVelRaw);
                            if (!Number.isNaN(tvVel) && tvVel > 3.0) {
                                line = line.replace(/。$/, '；');
                                if (tvVel < 3.4) {
                                    line += '疑肺动脉高压。';
                                } else {
                                    line += '肺动脉高压。';
                                }
                            }
                        }

                        conclusion += `${line}\n`;
                        index += 1;
                    }

                    // 血流结论之后，再给一行腔室/室壁总结
                    conclusion += `  ${index}.心脏各腔室大小、室壁厚度未见明显异常。\n`;
                }
            } else {
                // 既未勾选“各瓣口血流正常”，也无具体反流标签时，兜底按正常处理
                conclusion += '  1.心脏各腔室大小、室壁厚度、各瓣口血流未见明显异常。\n';
            }

            // =========================
            // 容量/结构类异常：可单独一行概括（Normal & MMVD 共用）
            // EDVI 升高 / LVDDN 升高 / LA/AO 升高
            // =========================
            const edviNum = parseFloat(get('EDVI', ''));
            const lvddnNum = parseFloat(get('LVDDN', ''));
            const laAoNum = parseFloat(get('LA/AO', ''));

            const numberedLinesForIndex = conclusion
                .trimEnd()
                .split('\n')
                .filter(l => /^\s*\d+\./.test(l)).length;
            let idx = numberedLinesForIndex + 1;

            const hasLvOverload =
                (!Number.isNaN(edviNum) && edviNum > 100) ||
                (!Number.isNaN(lvddnNum) && lvddnNum >= 1.7);
            const hasLaEnlargement = !Number.isNaN(laAoNum) && laAoNum >= 1.6;

            let addedChamberSummary = false;
            if (hasLvOverload && hasLaEnlargement) {
                conclusion += `  ${idx}.左心容量过载，其余腔室大小尚可。\n`;
                idx += 1;
                addedChamberSummary = true;
            } else if (hasLvOverload) {
                conclusion += `  ${idx}.左心室容量过载，其余各腔室大小尚可。\n`;
                idx += 1;
                addedChamberSummary = true;
            } else if (hasLaEnlargement) {
                conclusion += `  ${idx}.左心房增大，其余各腔室大小尚可。\n`;
                idx += 1;
                addedChamberSummary = true;
            }

            // MMVD 特定：若没有“容量/结构”异常，仍要保证第 2 行为腔室/室壁总结
            if (!addedChamberSummary && diseaseType === 'MMVD' && mmvdNeedsDefaultChamberSummary) {
                conclusion += `  ${idx}.心脏各腔室大小、室壁厚度未见明显异常。\n`;
            }
            
            // ===== 第 2 部分：左心室收缩 / 舒张功能 =====
            // 计算下一条结论的编号
            const nextIndex = conclusion
                .trimEnd()
                .split('\n')
                .filter(l => /^\s*\d+\./.test(l)).length + 1;

            const eAValue = get('E/A', '') || '';
            const eOverEValue = get("E/E'", '') || '';
            const esviRaw = get('ESVI', '');
            const esvi = esviRaw ? parseFloat(esviRaw) : NaN;

            // 舒张功能判断（readme 规则补全：E/A > 2 => 舒张功能失代偿）
            let diastolicStatus = '未见明显异常';
            const eAClean = eAValue.replace(/[＜<]/g, '<').replace(/[＞>]/g, '>');
            // 约定：calculateEOverA 输出一般为 '＜1'、'＞1'、'＞2'
            if (eAClean.indexOf('>2') !== -1) {
                diastolicStatus = '失代偿';
            } else if (eAClean.indexOf('<1') !== -1) {
                diastolicStatus = '下降';
            }

            const eOverENum = eOverEValue ? parseFloat(eOverEValue) : NaN;
            // 若已是失代偿，则不再覆盖；否则 E/E' > 11 => 下降
            if (diastolicStatus !== '失代偿' && !Number.isNaN(eOverENum) && eOverENum > 11) {
                diastolicStatus = '下降';
            }

            // 收缩功能判断（基于 ESVI）
            let systolicStatus = '未见明显异常';
            if (!Number.isNaN(esvi)) {
                if (esvi >= 35 && esvi < 50) {
                    systolicStatus = '轻度下降';
                } else if (esvi >= 50) {
                    systolicStatus = '下降';
                }
            }

            // MMVD：dp/dt < 1800mmHg/s 时，认为收缩功能“下降”
            let dpdtIndicatesSystolicDecline = false;
            if (diseaseType === 'MMVD') {
                const dpdtRaw = (get('dp/dt', '') || '').toString().trim();
                const dpdtNum = dpdtRaw ? parseFloat(dpdtRaw) : NaN;
                if (!Number.isNaN(dpdtNum) && dpdtNum < 1800) {
                    dpdtIndicatesSystolicDecline = true;
                    systolicStatus = '下降';
                }
            }

            // 组合结论句（readme 示例：舒张功能失代偿时用“收缩尚可，舒张功能失代偿”）
            let funcLine = '';
            if (diastolicStatus === '失代偿') {
                const systolicText = (systolicStatus === '未见明显异常')
                    ? '左心室收缩功能尚可'
                    : `左心室收缩功能${systolicStatus}`;
                funcLine = `  ${nextIndex}.${systolicText}，舒张功能失代偿。`;
            } else if (systolicStatus === '未见明显异常' && diastolicStatus === '未见明显异常') {
                funcLine = dpdtIndicatesSystolicDecline
                    ? `  ${nextIndex}.左心室收缩功能下降，舒张功能未见明显异常。`
                    : `  ${nextIndex}.左心室收缩、舒张功能未见明显异常。`;
            } else if (systolicStatus === '未见明显异常') {
                funcLine = dpdtIndicatesSystolicDecline
                    ? `  ${nextIndex}.左心室收缩功能下降，舒张功能${diastolicStatus}。`
                    : `  ${nextIndex}.左心室收缩功能未见明显异常，舒张功能${diastolicStatus}。`;
            } else if (diastolicStatus === '未见明显异常') {
                funcLine = `  ${nextIndex}.左心室收缩功能${systolicStatus}，舒张功能未见明显异常。`;
            } else {
                funcLine = `  ${nextIndex}.左心室收缩功能${systolicStatus}，舒张功能${diastolicStatus}。`;
            }

            conclusion += funcLine + '\n';

            // MMVD：其余反流（非二尖瓣）放到结论末尾，排序三尖瓣 > 肺动脉瓣 > 主动脉瓣
            if (diseaseType === 'MMVD' && mmvdDeferredOtherRegurgEnabled && mmvdDeferredOtherRegurgLinesRaw.length > 0) {
                const numberedLines = conclusion
                    .trimEnd()
                    .split('\n')
                    .filter(l => /^\s*\d+\./.test(l)).length;
                let idx = numberedLines + 1;
                for (const rawLine of mmvdDeferredOtherRegurgLinesRaw) {
                    conclusion += `  ${idx}.${rawLine}\n`;
                    idx += 1;
                }
            }

            return conclusion;
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
                // 清理编号格式：统一为“  数字.”（与所见首行缩进一致）
                conclusion = conclusion.replace(/^\s*(\d+)\.\s*/gm, '  $1.');
                return conclusion;
            }
            // 如果没有找到"# 结论"标记，尝试查找"结论"关键字
            const conclusionIndex = result.indexOf('# 结论');
            if (conclusionIndex !== -1) {
                let conclusion = result.substring(conclusionIndex + '# 结论'.length).trim();
                // 去除开头的换行和空格
                conclusion = conclusion.replace(/^\s*\n+/, '').trim();
                // 清理编号格式：统一为“  数字.”
                conclusion = conclusion.replace(/^\s*(\d+)\.\s*/gm, '  $1.');
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
    // 如果模板已缓存但内容仍是旧版本（没有新占位符），自动强制重载一次，确保修改立即生效
    if (mdTemplates[templateKey] && !mdTemplates[templateKey].includes('{瓣口血流结论}')) {
        // 仅对本次新增占位符做兼容性重载，避免对所有场景产生额外网络开销
        const maybeOld = mdTemplates[templateKey].includes('各瓣口血流未见明显异常');
        if (maybeOld) {
            await loadMDTemplateNew(diseaseType, referenceRange, true, simpsonEnabled);
        }
    }

    // 使用模板配置生成所见部分
    let findings = templateConfig.generateFindings(diseaseType, referenceRange, parameters);
    
    // 使用模板配置生成结论部分
    let conclusion = templateConfig.generateConclusion(diseaseType, referenceRange, parameters);

    // 节律不齐：在“所见”心率处补充，并在“结论”末尾追加
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

    // 使用value设置文本内容，将换行符保留
    document.getElementById('findingsText').value = findings;
    document.getElementById('conclusionText').value = conclusion;
}


// 参数输入区域始终显示（已移除折叠功能）
document.addEventListener('DOMContentLoaded', function() {
    // 确保输入框事件监听器已绑定
    setupInputListeners();
    
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
    
    // 复制功能
    // 为每个按钮保存原始内容和定时器
    const buttonTimers = new Map();
    const buttonOriginalContent = new Map();
    
    function copyToClipboard(text, button) {
        if (!text || text.trim() === '') {
            return;
        }
        
        // 如果按钮还没有保存原始内容，先保存
        if (!buttonOriginalContent.has(button)) {
            buttonOriginalContent.set(button, button.innerHTML);
        }
        
        // 清除之前的定时器（如果存在）
        if (buttonTimers.has(button)) {
            clearTimeout(buttonTimers.get(button));
            buttonTimers.delete(button);
        }
        
        // 恢复按钮的原始状态（如果当前是"已复制"状态）
        if (button.classList.contains('copied')) {
            button.classList.remove('copied');
            button.innerHTML = buttonOriginalContent.get(button);
        }
        
        // 使用现代 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                // 复制成功，显示反馈
                button.classList.add('copied');
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                // 设置定时器恢复按钮
                const timer = setTimeout(function() {
                    button.classList.remove('copied');
                    button.innerHTML = buttonOriginalContent.get(button);
                    buttonTimers.delete(button);
                }, 2000);
                buttonTimers.set(button, timer);
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
                button.classList.add('copied');
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                // 设置定时器恢复按钮
                const timer = setTimeout(function() {
                    button.classList.remove('copied');
                    button.innerHTML = buttonOriginalContent.get(button);
                    buttonTimers.delete(button);
                }, 2000);
                buttonTimers.set(button, timer);
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

