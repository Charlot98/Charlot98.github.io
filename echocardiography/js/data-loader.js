
// ─────────────────────────────────────────────

/**
 * 加载体重型 CSV 参考数据（犬≤3kg / 犬＞3kg / 猫（含体重）），通用逻辑提取。
 * @param {string} url    - CSV 文件路径
 * @param {string} key    - csvReferenceData 存储键
 */
async function loadWeightBasedCSV(url, key) {
    try {
        const response = await fetch(url);
        if (!response.ok) { console.error(`加载 ${url} 失败: HTTP ${response.status}`); return; }
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
        if (!response.ok) { console.error(`加载 breed_reference.csv 失败: HTTP ${response.status}`); return; }
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
    return healthConclusionText;
}
