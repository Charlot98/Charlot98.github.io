
/**
 * 结论（Conclusion）模板生成
 * 依赖全局变量：parameters, selectedReferenceWeight, breedReferenceData,
 *               rightHeartAdvancedEnabled
 * 依赖函数：findReferenceDataByWeight, formatValue,
 *           generateHealthConclusionFromTemplate,
 *           getDefaultRegurgitationSeverityForParam,
 *           isHcmFeatureTagActive
 */

/** 左心房增大：LA/AO≥1.6；猫且填 LAD Max 时用 LAD Max≥16mm 替代 LA/AO */
function hasLeftAtrialEnlargement(get, referenceRange) {
    const laAoNum = parseFloat(get('LA/AO', ''));
    const isCatRef = referenceRange === '猫' || referenceRange === '猫（含体重）';
    const maxLadRaw = (get('LAD Max', '') || '').toString().trim();
    const maxLadNum = parseFloat(maxLadRaw.replace(',', '.'));
    const useMaxLadInsteadOfLaAo = isCatRef && maxLadRaw !== '' && !Number.isNaN(maxLadNum);
    return useMaxLadInsteadOfLaAo ? maxLadNum >= 16 : !Number.isNaN(laAoNum) && laAoNum >= 1.6;
}

/** HCM 结论第 2 条：仅描述左心房大小 */
function getHcmLeftAtriumConclusionText(get, referenceRange) {
    return hasLeftAtrialEnlargement(get, referenceRange)
        ? '左心房增大。'
        : '左心房未见明显增大。';
}

/** PDA 结论第 2 条：腔室大小与健康规则一致；无触发项时默认严重双腔过载表述 */
function getPdaChamberConclusionText(get, referenceRange) {
    const chamber = evaluateChamberSizeConclusion(get, referenceRange);
    if (chamber.hasAbnormality) {
        return chamber.text;
    }
    return '左心房、左心室严重容量过载；右心大小尚可。';
}

/**
 * 腔室大小结论（Normal / MMVD 等共用）
 * EDVI>100 / LVIDDN≥1.7 / 猫 LVDd≥20mm → 左心室容量过载；
 * 左房+猫左室同时满足 → 左心容量过载。
 */
function evaluateChamberSizeConclusion(get, referenceRange) {
    const edviNum = parseFloat(get('EDVI', ''));
    const lviddnNum = parseFloat(get('LVIDDN', ''));
    const isCatRef = referenceRange === '猫' || referenceRange === '猫（含体重）';
    const lvdMmForCat = parseFloat(get('LVDd', ''));
    const hasCatLvOverloadByLvdMm = isCatRef && !Number.isNaN(lvdMmForCat) && lvdMmForCat >= 20;

    const hasLvOverload =
        (!Number.isNaN(edviNum) && edviNum > 100) ||
        (!Number.isNaN(lviddnNum) && lviddnNum >= 1.7) ||
        hasCatLvOverloadByLvdMm;
    const hasLaEnlargement = hasLeftAtrialEnlargement(get, referenceRange);

    if (hasLaEnlargement && hasCatLvOverloadByLvdMm)
        return { text: '左心容量过载，其余腔室大小尚可。', hasAbnormality: true };
    if (hasLvOverload && hasLaEnlargement)
        return { text: '左心房容量过载，其余腔室大小尚可。', hasAbnormality: true };
    if (hasLvOverload)
        return { text: '左心室容量过载，其余各腔室大小尚可。', hasAbnormality: true };
    if (hasLaEnlargement)
        return { text: '左心房容量过载，其余各腔室大小尚可。', hasAbnormality: true };
    return { text: '心脏各腔室大小未见明显异常。', hasAbnormality: false };
}

/**
 * 收缩/舒张功能结论一行（Normal / MMVD / HCM 等共用）
 * 猫 + EA融合 → 舒张功能评估受限；E/A、E/E'、ESVI 规则与健康结论一致
 */
function buildSystolicDiastolicFuncConclusionLine(get, referenceRange, diseaseType, lineIndex) {
    const eaFusion = get('EA融合', '');
    const isCatReference = referenceRange === '猫' || referenceRange === '猫（含体重）';
    const hasEAFusion = isCatReference && eaFusion;

    const eAValue = get('E/A', '') || '';
    const eOverEValue = get("E/E'", '') || '';
    const esvi = get('ESVI', '') ? parseFloat(get('ESVI', '')) : NaN;

    let diastolicStatus = '未见明显异常';
    if (hasEAFusion) {
        diastolicStatus = '评估受限';
    } else {
        const eAClean = eAValue.replace(/[＜<]/g, '<').replace(/[＞>]/g, '>');
        if (eAClean.indexOf('>2') !== -1) diastolicStatus = '失代偿';
        else if (eAClean.indexOf('<1') !== -1) diastolicStatus = '下降';
        const eOverENum = eOverEValue ? parseFloat(eOverEValue) : NaN;
        if (diastolicStatus !== '失代偿' && !Number.isNaN(eOverENum) && eOverENum > 11) {
            diastolicStatus = '下降';
        }
    }

    let systolicStatus = '未见明显异常';
    if (!Number.isNaN(esvi)) {
        if (esvi >= 35 && esvi < 50) systolicStatus = '轻度下降';
        else if (esvi >= 50) systolicStatus = '下降';
    }

    let dpdtIndicatesSystolicDecline = false;
    if (diseaseType === 'MMVD') {
        const dpdtRaw = (get('dp/dt', '') || '').toString().trim();
        const dpdtNum = dpdtRaw ? parseFloat(dpdtRaw) : NaN;
        if (!Number.isNaN(dpdtNum) && dpdtNum < 1800) {
            dpdtIndicatesSystolicDecline = true;
            systolicStatus = '下降';
        }
    }

    const n = lineIndex;
    if (diastolicStatus === '评估受限') {
        const systolicText = systolicStatus === '未见明显异常' ? '左心室收缩功能尚可' : `左心室收缩功能${systolicStatus}`;
        return `  ${n}.${systolicText}，舒张功能评估受限。`;
    }
    if (diastolicStatus === '失代偿') {
        const systolicText = systolicStatus === '未见明显异常' ? '左心室收缩功能尚可' : `左心室收缩功能${systolicStatus}`;
        return `  ${n}.${systolicText}，舒张功能失代偿。`;
    }
    if (systolicStatus === '未见明显异常' && diastolicStatus === '未见明显异常') {
        return dpdtIndicatesSystolicDecline
            ? `  ${n}.左心室收缩功能下降，舒张功能未见明显异常。`
            : `  ${n}.左心室收缩、舒张功能未见明显异常。`;
    }
    if (systolicStatus === '未见明显异常') {
        return dpdtIndicatesSystolicDecline
            ? `  ${n}.左心室收缩功能下降，舒张功能${diastolicStatus}。`
            : `  ${n}.左心室收缩功能未见明显异常，舒张功能${diastolicStatus}。`;
    }
    if (diastolicStatus === '未见明显异常') {
        return `  ${n}.左心室收缩功能${systolicStatus}，舒张功能未见明显异常。`;
    }
    return `  ${n}.左心室收缩功能${systolicStatus}，舒张功能${diastolicStatus}。`;
}

function generateConclusionText(diseaseType, referenceRange, params) {
    const get = (key, defaultValue = '') => parameters[key] || defaultValue;

    // 获取参考数据
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : get('体重', '');
    let referenceData = null;
    let referenceWeight = null;

    if ((referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '猫（含体重）') && weight) {
        referenceData = findReferenceDataByWeight(weight, referenceRange);
        if (referenceData && referenceData['kg']) {
            referenceWeight = parseFloat(referenceData['kg']);
            if (isNaN(referenceWeight)) referenceWeight = null;
        }
    } else if (referenceRange === '猫' && breedReferenceData && breedReferenceData['猫']) {
        referenceData = breedReferenceData['猫'];
    } else if (referenceRange === '金毛' && breedReferenceData && breedReferenceData['金毛']) {
        referenceData = breedReferenceData['金毛'];
    } else if (referenceRange === '兔子' && breedReferenceData && breedReferenceData['兔']) {
        referenceData = breedReferenceData['兔'];
    }

    // HCM
    if (diseaseType === 'HCM') {
        const hcmSamActive = typeof isHcmFeatureTagActive === 'function' && isHcmFeatureTagActive('SAM');
        const hcmLvotActive = typeof isHcmFeatureTagActive === 'function' && isHcmFeatureTagActive('左心室流出道湍流');
        let line1 = '  1.左心室游离壁及室间隔广泛性增厚/局部增厚';
        if (hcmSamActive) line1 += '，二尖瓣前向运动（SAM）';
        if (hcmLvotActive) line1 += '，左心室流出道动态梗阻';
        line1 += '，提示HCM。(若老龄，建议排查高血压/甲亢)。\n';

        let conclusion = '';
        conclusion += line1;
        conclusion += `  2.${getHcmLeftAtriumConclusionText(get, referenceRange)}\n`;
        conclusion += buildSystolicDiastolicFuncConclusionLine(get, referenceRange, 'HCM', 3) + '\n';
        return conclusion;
    }

    // PDA
    if (diseaseType === 'PDA') {
        const ductDiam = (get('动脉导管直径', '') || '').toString().trim();
        const openingDiam = (get('开口直径', '') || '').toString().trim();
        const ductMm = ductDiam ? formatValue(ductDiam) : '';
        const openingMm = openingDiam ? formatValue(openingDiam) : '';

        let conclusion = '';
        conclusion += `  1.PDA（持续性左→右分流），动脉导管直径约${ductMm}mm，开口直径约${openingMm}mm。\n`;
        conclusion += `  2.${getPdaChamberConclusionText(get, referenceRange)}\n`;
        conclusion += '  3.左心室收缩功能下降，舒张功能尚可。\n';
        conclusion += '\n备注: 若进行手术/封堵治疗，建议术后当日、术后1个月、3个月、6个月、12个月各复查一次心超。\n';
        return conclusion;
    }

    // DCM：固定初始结论（由 JS 规则维护）
    if (diseaseType === 'DCM') {
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

        let regurgLine = '  2.各瓣口未见明显反流。\n';
        if (activeRegurg.length > 0) {
            const regurgDesc = formatMergedRegurgitationDescription(activeRegurg, (v) =>
                (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam)
            );
            regurgLine = `  2.${regurgDesc}。\n`;
        }

        let conclusion = '';
        conclusion += '  1.DCM（左心室、左心房容量过载，左心室球形指数下降，EF、FS下降，PEP/ET＞0.4，EPSS＞6.5mm），建议复查监测。\n';
        conclusion += regurgLine;
        conclusion += buildSystolicDiastolicFuncConclusionLine(get, referenceRange, 'DCM', 3) + '\n';
        return conclusion;
    }

    // =========================
    // 规则生成路径（Normal / MMVD / RCM / TOF 等）
    // =========================
    const isDogRuleBase =
        (diseaseType === 'Normal' || diseaseType === 'MMVD' || diseaseType === 'HCM'
            || diseaseType === 'PDA' || diseaseType === 'DCM' || diseaseType === 'RCM' || diseaseType === 'TOF'
            || !diseaseType) &&
        (referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '金毛'
            || referenceRange === '猫' || referenceRange === '猫（含体重）' || referenceRange === '兔子');

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
        let mmvdDeferredOtherRegurgLinesRaw = [];
        let mmvdDeferredOtherRegurgEnabled = false;
        let mmvdNeedsDefaultChamberSummary = false;

        if (diseaseType === 'MMVD' && mitralActive) {
            mmvdNeedsDefaultChamberSummary = true;

            const droop = (get('脱垂程度', '') || '').trim();
            const droopText = droop ? `${droop}脱垂` : '脱垂';
            const mitralSev = (get('二尖瓣反流程度', '') || '').trim() || getDefaultRegurgitationSeverityForParam('二尖瓣反流程度');
            const mitralText = `${mitralSev}反流`;
            const chordType = (get('腱索断裂类型', '') || '').trim();

            const mvVelRaw = (get('二尖瓣反流速', '') || '').toString().trim();
            const mvVel = Number.parseFloat(mvVelRaw);
            const mvExtra = !Number.isNaN(mvVel) && mvVel > 6.5;

            let mitralLine = `  1.二尖瓣退行性病变：二尖瓣前叶增厚、${droopText}、${mitralText}`;
            if (chordType) {
                if (mvExtra) {
                    mitralLine += `；${chordType}；`;
                    conclusion += mitralLine + '\n';
                    conclusion += `    收缩压偏高，建议排查高血压。\n`;
                } else {
                    mitralLine += `；${chordType}。`;
                    conclusion += mitralLine + '\n';
                }
            } else {
                if (mvExtra) {
                    mitralLine += '；';
                    conclusion += mitralLine + '\n';
                    conclusion += `    收缩压偏高，建议排查高血压。\n`;
                } else {
                    mitralLine += '。';
                    conclusion += mitralLine + '\n';
                }
            }

            const otherActiveRegurg = regurgTags.filter(v => v.tag !== '二尖瓣反流' && isTagActive(v.tag));
            if (otherActiveRegurg.length > 0) {
                const tvVelRaw = (get('三尖瓣反流速', '') || '').toString().trim();
                const tvVel = Number.parseFloat(tvVelRaw);
                const tvExtra = tvActive && !Number.isNaN(tvVel) && tvVel > 3.0;
                const hasExtraConclusionAny = mvExtra || tvExtra;

                if (!hasExtraConclusionAny) {
                    const parts = otherActiveRegurg.map(v => {
                        const sev = (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam);
                        return `${v.label}${sev}反流`;
                    });
                    mmvdDeferredOtherRegurgLinesRaw = [`${parts.join('、')}。`];
                } else {
                    mmvdDeferredOtherRegurgLinesRaw = [];
                    for (const v of otherActiveRegurg) {
                        const sev = (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam);
                        let rawLine = `${v.label}${sev}反流。`;
                        if (v.tag === '三尖瓣反流' && tvExtra) {
                            const doubt = tvVel < 3.4 ? `疑${sev}肺动脉高压。` : '肺动脉高压。';
                            rawLine = `${v.label}${sev}反流，${doubt}`;
                        }
                        mmvdDeferredOtherRegurgLinesRaw.push(rawLine);
                    }
                }
                mmvdDeferredOtherRegurgEnabled = true;
            }
        } else if (activeRegurg.length === 0 && normalActive) {
            conclusion += '  1.心脏各腔室大小、室壁厚度、各瓣口血流未见明显异常。\n';
        } else if (activeRegurg.length > 0) {
            let hasExtraConclusion = false;
            const mvVelRaw0 = (get('二尖瓣反流速', '') || '').toString().trim();
            const mvVel0 = Number.parseFloat(mvVelRaw0);
            if (isTagActive('二尖瓣反流') && !Number.isNaN(mvVel0) && mvVel0 > 6.5) hasExtraConclusion = true;
            const tvVelRaw0 = (get('三尖瓣反流速', '') || '').toString().trim();
            const tvVel0 = Number.parseFloat(tvVelRaw0);
            if (isTagActive('三尖瓣反流') && !Number.isNaN(tvVel0) && tvVel0 > 3.0) hasExtraConclusion = true;

            if (!hasExtraConclusion) {
                const regurgDesc = formatMergedRegurgitationDescription(activeRegurg, (v) =>
                    (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam)
                );
                conclusion += `  1.${regurgDesc}。\n`;
                conclusion += '  2.心脏各腔室大小未见明显异常。\n';
            } else {
                let index = 1;
                for (const v of regurgTags) {
                    if (!isTagActive(v.tag)) continue;
                    const sev = (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam);
                    let line = `  ${index}.${v.label}${sev}反流。`;

                    if (v.tag === '二尖瓣反流') {
                        const mvVelRaw = (get('二尖瓣反流速', '') || '').toString().trim();
                        const mvVel = Number.parseFloat(mvVelRaw);
                        if (!Number.isNaN(mvVel) && mvVel > 6.5) {
                            line = line.replace(/。$/, '；');
                            line += '收缩压偏高，建议排查高血压。';
                        }
                    }
                    if (v.tag === '三尖瓣反流') {
                        const tvVelRaw = (get('三尖瓣反流速', '') || '').toString().trim();
                        const tvVel = Number.parseFloat(tvVelRaw);
                        if (!Number.isNaN(tvVel) && tvVel > 3.0) {
                            line = line.replace(/。$/, '；');
                            line += tvVel < 3.4 ? '疑肺动脉高压。' : '肺动脉高压。';
                        }
                    }
                    conclusion += `${line}\n`;
                    index += 1;
                }
                conclusion += `  ${index}.心脏各腔室大小未见明显异常。\n`;
            }
        } else {
            conclusion += '  1.心脏各腔室大小、室壁厚度、各瓣口血流未见明显异常。\n';
        }

        // 容量/结构异常
        const chamber = evaluateChamberSizeConclusion(get, referenceRange);
        const numberedLinesForIndex = conclusion.trimEnd().split('\n').filter(l => /^\s*\d+\./.test(l)).length;
        let idx = numberedLinesForIndex + 1;

        let addedChamberSummary = false;
        if (chamber.hasAbnormality) {
            conclusion += `  ${idx}.${chamber.text}\n`;
            idx += 1;
            addedChamberSummary = true;
        }
        if (!addedChamberSummary && diseaseType === 'MMVD' && mmvdNeedsDefaultChamberSummary) {
            conclusion += `  ${idx}.${chamber.text}\n`;
        }

        // 收缩 / 舒张功能（与 HCM 第 3 条共用 buildSystolicDiastolicFuncConclusionLine）
        const nextIndex = conclusion.trimEnd().split('\n').filter(l => /^\s*\d+\./.test(l)).length + 1;
        conclusion += buildSystolicDiastolicFuncConclusionLine(get, referenceRange, diseaseType, nextIndex) + '\n';

        if (rightHeartAdvancedEnabled) {
            conclusion += `  ${nextIndex + 1}.左心室收缩功能尚可。\n`;
        }

        if (diseaseType === 'MMVD' && mmvdDeferredOtherRegurgEnabled && mmvdDeferredOtherRegurgLinesRaw.length > 0) {
            const numberedLines = conclusion.trimEnd().split('\n').filter(l => /^\s*\d+\./.test(l)).length;
            let idx = numberedLines + 1;
            for (const rawLine of mmvdDeferredOtherRegurgLinesRaw) {
                conclusion += `  ${idx}.${rawLine}\n`;
                idx += 1;
            }
        }

        return conclusion;
    }

    // 兜底（正常/未选中用健康模板）
    if (diseaseType === 'Normal' || !diseaseType) {
        return generateHealthConclusionFromTemplate(params);
    }

    // 其余疾病类型兜底
    let conclusion = `根据${referenceRange}参考范围，结合${diseaseType}的诊断标准：\n`;
    if (Object.keys(params).length > 0) {
        const paramList = Object.entries(params).map(([key, value]) => `${key} ${value}`).join('、');
        conclusion += `\n测量值：${paramList}。\n`;
    }
    conclusion += '\n（请根据实际测量值和参考范围进行专业判断）';
    return conclusion;
}
