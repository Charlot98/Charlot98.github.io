
// ─────────────────────────────────────────────

/**
 * 加载体重型 CSV 参考数据（犬≤3kg / 犬＞3kg / 猫（含体重）），通用逻辑提取。
 * @param {string} url    - CSV 文件路径
 * @param {string} key    - csvReferenceData 存储键
 */
async function loadWeightBasedCSV(url, key) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) { console.error(`${url} 格式错误`); return; }
        const headers = lines[0].split(',').map(h => h.trim());
        csvReferenceData[key] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values[0] && !isNaN(parseFloat(values[0]))) {
                const row = {};
                headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
                csvReferenceData[key].push(row);
            }
        }
        updateReferenceValues();
    } catch (e) {
        console.error(`加载 ${url} 失败:`, e);
    }
}

// 便捷入口（保留原名供外部调用兼容）
async function loadCSVData()      { await loadWeightBasedCSV('docs/reference_interval/non_m_type_reference.csv',  '犬＞3kg'); }
async function loadMTypeCSVData() { await loadWeightBasedCSV('docs/reference_interval/m_type_reference.csv', '犬≤3kg'); }
async function loadCatEchoCSVData(){ await loadWeightBasedCSV('docs/reference_interval/cat_echo_weight_reference.csv', '猫（含体重）'); }

// 读取品种参考 CSV（breed_reference.csv）
async function loadBreedReferenceData() {
    try {
        const response = await fetch('docs/reference_interval/breed_reference.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            console.error('breed_reference.csv 格式错误');
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

        console.log('breed_reference.csv 加载成功', breedReferenceData);
        // 加载完成后，更新参考值显示
        updateReferenceValues();
    } catch (error) {
        console.error('加载 breed_reference.csv 失败:', error);
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
