
/**
 * 所见（Findings）模板生成
 * 依赖全局变量：parameters, selectedReferenceWeight, breedReferenceData,
 *               simpsonEnabled, rightHeartAdvancedEnabled
 * 依赖函数：findReferenceDataByWeight, getRefValue, formatValue,
 *           padToDisplayWidth, stringDisplayWidth,
 *           getTapseRefRangeFromWeight, getFACRefRangeFromWeight,
 *           getDefaultRegurgitationSeverityForParam,
 *           isHcmFeatureTagActive
 */
function generateFindingsText(diseaseType, referenceRange, params) {
    const get = (key, defaultValue = '') => parameters[key] || defaultValue;

    // 所见首行动物类型
    const animalType =
        (referenceRange === '猫' || referenceRange === '猫（含体重）') ? '猫' :
        referenceRange === '兔子' ? '兔' : '犬';

    // 获取体重：优先使用选中的参考体重，如果没有则使用输入的体重
    const weight = selectedReferenceWeight !== null ? selectedReferenceWeight.toString() : get('体重', '');

    // 获取参考数据
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

    // =========================
    // 规则生成路径（覆盖所有当前支持的疾病+参考范围组合）
    // =========================
    const isDogRuleBase =
        (diseaseType === 'Normal' || diseaseType === 'MMVD' || diseaseType === 'HCM'
            || diseaseType === 'PDA' || diseaseType === 'DCM' || diseaseType === 'RCM' || diseaseType === 'TOF'
            || !diseaseType) &&
        (referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '金毛'
            || referenceRange === '猫' || referenceRange === '猫（含体重）' || referenceRange === '兔子');

    if (isDogRuleBase) {
        const getReferenceValue = (k) => getRefValue(referenceData, k);

        const valueByKey = (key) => {
            switch (key) {
                case 'IVSd': return get('IVSd', '');
                case 'LVDd': return get('LVDd', '');
                case 'LVWd': return get('LVPWd', '');
                case 'IVSs': return get('IVSs', '');
                case 'LVDs': return get('LVDs', '');
                case 'LVWs': return get('LVPWs', '');
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

        const colWidth = 26;
        const alignCol = (text) => padToDisplayWidth(text, colWidth);

        const rows = [
            { left: 'IVSd', right: 'LVDd' },
            { left: 'LVWd', right: 'IVSs' },
            { left: 'LVDs', right: 'LVWs' },
            { left: ['EDV_teich', 'EDV_simpson'], right: ['ESV_teich', 'ESV_simpson'] },
            { left: 'EDVI', right: 'ESVI' },
            { left: 'FS', right: ['EF_teich', 'EF_simpson'] }
        ];
        const isCatReferenceForLayout =
            referenceRange === '猫' || referenceRange === '猫（含体重）';
        const isDogReferenceForLayout =
            referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '金毛';

        const weightText =
            referenceRange === '金毛'
                ? `（参考：金毛）`
                : referenceRange === '兔子'
                    ? `（参考值: 兔）`
                    : (referenceWeight
                        ? `（参考值: ${referenceWeight}kg）`
                        : (get('体重') ? `（参考值: ${get('体重')}kg）` : ''));

        let findings = '';
        findings += `${animalType}侧卧位扫查:\n`;
        findings += `  1.M-MODE/2D (mm) ${weightText}\n`;

        const renderLeftRight = (leftText, rightText) => {
            findings += `    ${alignCol(leftText)}${rightText}\n`;
        };

        for (const r of rows) {
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
                findings += `    ${padToDisplayWidth(edvText, colWidth)}${esvText}\n`;
                continue;
            }

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
                if (diseaseType === 'DCM') {
                    const siRaw = (get('SI', '') || '').toString().trim();
                    const epssRaw = (get('EPSS', '') || '').toString().trim();
                    const siPart = siRaw ? formatValue(siRaw) : '';
                    const epssPart = epssRaw ? formatValue(epssRaw) : '';
                    renderLeftRight(
                        `EPSS: ${epssPart}mm`,
                        `球形指数: ${siPart}`
                    );
                }
                if (rightHeartAdvancedEnabled) {
                    const wStr = get('体重', '');
                    const { str: tapseRefStr } = getTapseRefRangeFromWeight(wStr);
                    const tapseVal = get('TAPSE', '');
                    const tapseFormatted = tapseVal ? formatValue(tapseVal) : '';
                    let tapseLeft;
                    if (tapseFormatted) {
                        tapseLeft = tapseRefStr
                            ? `TAPSE: ${tapseFormatted}mm（${tapseRefStr}）`
                            : `TAPSE: ${tapseFormatted}mm（）`;
                    } else {
                        tapseLeft = tapseRefStr ? `TAPSE:（${tapseRefStr}）` : `TAPSE:（）`;
                    }
                    renderLeftRight(tapseLeft, '');
                }
                continue;
            }

            if (r.left === 'EDVI' && r.right === 'ESVI') {
                if (isCatReferenceForLayout) continue;
                const edvi = valueByKey('EDVI');
                const esvi = valueByKey('ESVI');
                const edviText = edvi ? `EDVI: ${formatValue(edvi, true)}ml/m2` : 'EDVI: ml/m2';
                const esviText = esvi ? `ESVI: ${formatValue(esvi, true)}ml/m2` : 'ESVI: ml/m2';
                renderLeftRight(edviText, esviText);
                continue;
            }

            const leftKey = r.left;
            const rightKey = r.right;
            const leftRefKey = leftKey === 'LVWd' ? 'LVWd' : leftKey;
            const rightRefKey = rightKey === 'LVWs' ? 'LVWs' : rightKey;
            const leftText = formatParamWithRef(leftKey, valueByKey(leftKey), leftRefKey);
            let rightText = formatParamWithRef(rightKey, valueByKey(rightKey), rightRefKey);
            if (rightKey === 'LVDd' && isDogReferenceForLayout) {
                const lviddnRaw = (get('LVIDDN', '') || '').toString().trim();
                if (lviddnRaw) {
                    rightText += ` LVIDDN ${formatValue(lviddnRaw)}`;
                }
            }
            renderLeftRight(leftText, rightText);
        }

        findings += `\n`;
        if (diseaseType === 'HCM') {
            const hcmSamActive = typeof isHcmFeatureTagActive === 'function' && isHcmFeatureTagActive('SAM');
            if (hcmSamActive) {
                findings += `  2.瓣膜异常: 收缩期二尖瓣前向运动（SAM）；\n`;
                findings += `    心肌及运动异常: 左室流出道可见动态梗阻；\n`;
            } else {
                findings += `  2.瓣膜异常: 未见明显异常；\n`;
                findings += `    心肌及运动异常: 未见明显异常。\n`;
            }
        } else if (diseaseType === 'PDA') {
            findings += `  2.瓣膜异常: 未见明显异常；\n`;
            findings += `    心肌及运动异常: 未见明显异常。\n`;
            findings += `    可见一管腔样结构开口于肺动脉分叉处，直径约：mm，于肺动脉开口处直径约：mm。\n`;
        } else if (diseaseType === 'MMVD') {
            const thickness = get('二尖瓣前叶厚度', '');
            const droop = get('脱垂程度', '');
            const thickPart = `（较厚处约：${thickness || ''}mm）`;
            const droopText = droop ? `${droop}脱垂` : '脱垂';
            const line2Base = `  2.瓣膜异常: 二尖瓣前叶增厚${thickPart}、${droopText}`;
            const chordType = get('腱索断裂类型', '');
            if (chordType) {
                findings += `${line2Base}； 二尖瓣前叶可见游离强回声亮线。\n`;
            } else {
                findings += `${line2Base}。\n`;
            }
            findings += `    心肌及运动异常: 未见明显异常。\n`;
        } else {
            findings += `  2.瓣膜异常: 未见明显异常；\n`;
            findings += `    心肌及运动异常: 未见明显异常。\n`;
        }
        findings += `    ${formatParamWithRef('AO', get('AO', ''), 'AO')}\n`;
        findings += `    ${formatParamWithRef('LA', get('LA', ''), 'LA')}\n`;
        findings += `    LA/AO: ${formatValue(get('LA/AO', ''))}\n`;
        if (referenceRange === '猫' || referenceRange === '猫（含体重）') {
            const maxLadRaw = (get('LAD Max', '') || '').toString().trim();
            if (maxLadRaw) {
                findings += `    LAD Max: ${formatValue(maxLadRaw)}mm\n`;
            }
        }
        const laVolumeDisplay = (get('LA Volume显示', '不显示') || '').toString().trim();
        const lavi = get('LAVi', '');
        if (laVolumeDisplay === '显示') {
            findings += `    LA volume：${lavi ? formatValue(lavi) : ''}ml/kg；\n`;
        }
        if (rightHeartAdvancedEnabled) {
            const paAoVal = get('PA/Ao', '');
            findings += `    PA/Ao: ${paAoVal ? formatValue(paAoVal) : ''}（正常＜1.1）\n`;
            const facVal = get('FAC', '');
            const { str: facRefStrFindings } = getFACRefRangeFromWeight((get('体重', '') || '').toString().trim());
            const facParen = facRefStrFindings ? `（${facRefStrFindings}）` : '（参考值）';
            findings += `    RV FAC: ${facVal ? formatValue(facVal) : ''}%${facParen}\n`;
            const rpadVal = get('RPAD', '');
            findings += `    RPAD: ${rpadVal ? formatValue(rpadVal) : ''}%\n`;
        }
        findings += `\n`;

        // 3. 彩色多普勒
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
        const hcmLvotTurbulenceSuffix =
            diseaseType === 'HCM' && typeof isHcmFeatureTagActive === 'function' && isHcmFeatureTagActive('左心室流出道湍流')
                ? '，左室流出道可见湍流信号'
                : '';

        if (isTagActive('各瓣口血流正常') && activeFlows.length === 0) {
            findings += `  3.彩色多普勒检查  各瓣口未见明显反流、湍流${hcmLvotTurbulenceSuffix}；\n`;
        } else if (activeFlows.length > 0) {
            const regurgDesc = formatMergedRegurgitationDescription(activeFlows, (v) =>
                (get(v.severityParam, '') || '').trim() || getDefaultRegurgitationSeverityForParam(v.severityParam)
            );
            findings += `  3.彩色多普勒检查  ${regurgDesc}${hcmLvotTurbulenceSuffix}；\n`;
        } else {
            findings += `  3.彩色多普勒检查  各瓣口未见明显反流、湍流${hcmLvotTurbulenceSuffix}；\n`;
        }

        // 频谱多普勒
        const vpaFormattedInFindings = formatValue(get('VPA', ''));
        const vaoFormattedInFindings = formatValue(get('VAO', ''));
        if (rightHeartAdvancedEnabled) {
            const vtiRaw = get('VTI', '');
            const atetRaw = get('AT/ET', '');
            const vtiPart = vtiRaw ? formatValue(vtiRaw) : '';
            const atetPart = atetRaw ? formatValue(atetRaw) : '';
            findings += `    频谱多普勒检查\n`;
            findings += `    VPA：${vpaFormattedInFindings}m/s； VTI: ${vtiPart}cm； AT/ET: ${atetPart}（＜0.3 提示可能肺动脉高压）；\n`;
            findings += `    VAO: ${vaoFormattedInFindings}m/s；\n`;
        } else {
            findings += `    频谱多普勒检查  VPA: ${vpaFormattedInFindings}m/s；  VAO: ${vaoFormattedInFindings}m/s；\n`;
        }
        const eaFusionInFindings = get('EA融合', '');
        const isCatReferenceInFindings =
            referenceRange === '猫' || referenceRange === '猫（含体重）';
        if (isCatReferenceInFindings && eaFusionInFindings) {
            findings += `    EA融合: ${eaFusionInFindings}m/s；\n`;
        } else {
            const eFormattedInFindings = formatValue(get('E', ''));
            const aFormattedInFindings = formatValue(get('A', ''));
            const eEText = (get("E/E'", '') || '').toString().trim();
            const eENum = parseFloat(eEText);
            const eEFormatted = eEText ? (!isNaN(eENum) ? eENum.toFixed(2) : eEText) : '';
            const showEEField = !isCatReferenceInFindings || !!eEText;
            const mvPrefix = rightHeartAdvancedEnabled ? 'MV:   ' : '';
            let eaLine = `    ${mvPrefix}E: ${eFormattedInFindings}m/s，A: ${aFormattedInFindings}m/s，E/A${get('E/A', '')}；`;
            if (showEEField) {
                eaLine += ` E/E': ${eEFormatted}；`;
            }
            findings += `${eaLine}\n`;
        }

        // dp/dt：放在 E/A 所在行的下一行（由“显示”按钮控制）
        const dpdtDisplay = (get('dp/dt显示', '不显示') || '').toString().trim();
        const dpdtRaw = (get('dp/dt', '') || '').toString().trim();
        if (dpdtDisplay === '显示') {
            const dpdtValue = dpdtRaw ? formatValue(dpdtRaw) : '';
            findings += `    dp/dt：${dpdtValue}mmHg/s；\n`;
        }

        if (rightHeartAdvancedEnabled) {
            const eTV = formatValue(get('E（TV）', ''));
            const aTV = formatValue(get('A（TV）', ''));
            const eaTV = formatValue(get('E/A（TV）', ''));
            const sP = formatValue(get("S'", ''));
            findings += `    TV：  E:${eTV}m/s  A: ${aTV}m/s   E/A: ${eaTV}；  S':${sP}cm/s；\n`;
        }

        // 各瓣口反流速 + 压差
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
            velocityLines.push(`    二尖瓣反流速：${mitralVel ? `${formatValue(mitralVel)}m/s` : 'm/s'}（${mitralDp ? `${formatValue(mitralDp)}mmHg` : 'mmHg'}）；`);
        }
        if (isTagActive('三尖瓣反流') && !tricuspidUnknown) {
            const tricuspidVel = get('三尖瓣反流速', '');
            const tricuspidDp = get('三尖瓣压力差', '');
            velocityLines.push(`    三尖瓣反流速：${tricuspidVel ? `${formatValue(tricuspidVel)}m/s` : 'm/s'}（${tricuspidDp ? `${formatValue(tricuspidDp)}mmHg` : 'mmHg'}）；`);
        }
        if (isTagActive('肺动脉瓣反流') && !pulmonaryUnknown) {
            const pulmonaryVel = get('肺动脉瓣反流速', '');
            const pulmonaryDp = get('肺动脉瓣压力差', '');
            velocityLines.push(`    肺动脉瓣反流速：${pulmonaryVel ? `${formatValue(pulmonaryVel)}m/s` : 'm/s'}（${pulmonaryDp ? `${formatValue(pulmonaryDp)}mmHg` : 'mmHg'}）；`);
        }
        if (isTagActive('主动脉瓣反流') && !aorticUnknown) {
            const aorticVel = get('主动脉瓣反流速', '');
            const aorticDp = get('主动脉瓣压力差', '');
            velocityLines.push(`    主动脉瓣反流速：${aorticVel ? `${formatValue(aorticVel)}m/s` : 'm/s'}（${aorticDp ? `${formatValue(aorticDp)}mmHg` : 'mmHg'}）；`);
        }

        velocityLines.forEach(line => { findings += `${line}\n`; });
        if (unknownValves.length > 0) {
            findings += `    ${unknownValves.join('、')}反流速未测得；\n`;
        }

        if (rightHeartAdvancedEnabled) {
            const gs = get('GS', '');
            const fws = get('FWS', '');
            findings += `    右心室应变：GS：${gs ? formatValue(gs) : ''}% FWS：${fws ? formatValue(fws) : ''}%\n`;
        }

        findings += `\n`;

        // 4. 心率
        const heartRateRaw = (get('心率', '') || '').toString().trim();
        const heartRateText = heartRateRaw
            ? /[bB]pm\s*$/.test(heartRateRaw)
                ? heartRateRaw
                : (/^\d+(\.\d+)?$/.test(heartRateRaw)
                    ? `约${Math.round(parseFloat(heartRateRaw))}bpm`
                    : `${heartRateRaw}bpm`)
            : '';
        findings += `  4.心率: ${heartRateText}。\n`;

        findings = findings.replace(/^(\d+)\.\s+/gm, '  $1.');
        findings = findings.replace(/^(?!  )(\d+)\./gm, '  $1.');
        return findings + '\n';
    }

    // ─── 旧版路径（兜底，通常不应触发）───────────────────────────────────────
    const weightText =
        referenceRange === '兔子'
            ? ' (参考值：兔)'
            : referenceRange === '金毛'
                ? ' (参考：金毛)'
                : (referenceWeight
                    ? ` (参考值：${referenceWeight}kg)`
                    : '');

    let findings = `${animalType}侧卧位扫查：\n\n`;

    let scanTypeText = 'M型/2D';
    if (referenceRange === '犬＞3kg') scanTypeText = '2D';
    findings += `  1.${scanTypeText} (mm)${weightText}\n\n`;

    const getReferenceValue = (k) => getRefValue(referenceData, k);

    const formatParamWithRef = (label, value, csvKey = null) => {
        let refValue = '';
        if (referenceData && csvKey) refValue = getReferenceValue(csvKey);
        const formattedValue = value ? formatValue(value) : '';
        if (formattedValue) return refValue ? `${label}:${formattedValue}(${refValue})` : `${label}:${formattedValue}()`;
        return refValue ? `${label}:(${refValue})` : `${label}:()`;
    };

    const formatParamAligned = (label, value, csvKey, width = 45) => {
        return formatParamWithRef(label, value, csvKey).padEnd(width, ' ');
    };

    const colWidth = 45;
    const isDogReferenceForCompact =
        referenceRange === '犬≤3kg' || referenceRange === '犬＞3kg' || referenceRange === '金毛';
    let lvddCompact = formatParamAligned('LVDd', get('LVDd'), 'LVDd', colWidth);
    if (isDogReferenceForCompact) {
        const lviddnCompactRaw = (get('LVIDDN', '') || '').toString().trim();
        if (lviddnCompactRaw) {
            lvddCompact += ` LVIDDN ${formatValue(lviddnCompactRaw)}`;
        }
    }
    findings += `     ${formatParamAligned('IVSd', get('IVSd'), 'IVSd', colWidth)}${lvddCompact}\n`;
    findings += `     ${formatParamAligned('LVWd', get('LVPWd'), 'LVWd', colWidth)}${formatParamAligned('IVSs', get('IVSs'), 'IVSs', colWidth)}\n`;
    findings += `     ${formatParamAligned('LVDs', get('LVDs'), 'LVDs', colWidth)}${formatParamAligned('LVWs', get('LVPWs'), 'LVWs', colWidth)}\n`;

    const edvFormatted = get('EDV', '') ? formatValue(get('EDV', ''), true) : '';
    const esvFormatted = get('ESV', '') ? formatValue(get('ESV', ''), true) : '';
    const fsFormatted = get('FS', '') ? formatValue(get('FS', ''), true) : '';
    const efFormatted = get('EF', '') ? formatValue(get('EF', ''), true) : '';

    const edvText = edvFormatted ? `EDV: ${edvFormatted}ml` : 'EDV: ml';
    const esvText = esvFormatted ? `ESV: ${esvFormatted}ml` : 'ESV: ml';
    findings += `     ${edvText.padEnd(44, ' ')}${esvText}\n`;

    const isCatReferenceForCompact = referenceRange === '猫' || referenceRange === '猫（含体重）';
    if (!isCatReferenceForCompact) {
        findings += `     ${'EDVI: '.padEnd(45, ' ')}ESVI: \n`;
    }

    findings += `     ${`FS: ${fsFormatted ? `${fsFormatted}%` : '%'}`.padEnd(45, ' ')}${efFormatted ? `EF: ${efFormatted}%` : 'EF: %'}\n`;

    if (rightHeartAdvancedEnabled) {
        const { str: tapseRefStr } = getTapseRefRangeFromWeight(get('体重', ''));
        const tapse = get('TAPSE', '');
        const tapseFormatted = tapse ? formatValue(tapse) : '';
        const tapseLine = tapseFormatted
            ? (tapseRefStr ? `TAPSE: ${tapseFormatted}mm（${tapseRefStr}）` : `TAPSE: ${tapseFormatted}mm（）`)
            : (tapseRefStr ? `TAPSE:（${tapseRefStr}）` : `TAPSE:（）`);
        findings += `     ${tapseLine.padEnd(45, ' ')}\n`;
    }
    findings += `\n`;

    if (diseaseType === 'MMVD') {
        const thickness = get('二尖瓣前叶厚度', '');
        const droop = get('脱垂程度', '');
        const thickPart = `（较厚处约：${thickness || ''}mm）`;
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

    const laFormatted = get('LA', '') ? formatValue(get('LA', '')) : '';
    const aoFormatted = get('AO', '') ? formatValue(get('AO', '')) : '';
    const laAoFormatted = get('LA/AO', '') ? formatValue(get('LA/AO', '')) : '';
    const laRef = getReferenceValue('LA');
    const aoRef = getReferenceValue('AO');
    const laText = laFormatted ? (laRef ? `LA： ${laFormatted}(${laRef})` : `LA： ${laFormatted}()`) : (laRef ? `LA： （${laRef}）` : `LA： （）`);
    const aoText = aoFormatted ? (aoRef ? `AO:  ${aoFormatted}(${aoRef})` : `AO:  ${aoFormatted}()`) : (aoRef ? `AO:  （${aoRef}）` : `AO:  ()`);
    findings += `     ${laText}\n`;
    findings += `     ${aoText}\n`;
    findings += `     LA/AO: ${laAoFormatted || ''}\n`;
    if (referenceRange === '猫' || referenceRange === '猫（含体重）') {
        const maxLadRaw = (get('LAD Max', '') || '').toString().trim();
        if (maxLadRaw) findings += `     LAD Max: ${formatValue(maxLadRaw)}mm\n`;
    }
    if (rightHeartAdvancedEnabled) {
        const paAoCompact = get('PA/Ao', '');
        findings += `     PA/Ao: ${paAoCompact ? formatValue(paAoCompact) : ''}（正常＜1.1）\n`;
        const facCompact = get('FAC', '');
        const { str: facRefStrCompact } = getFACRefRangeFromWeight((get('体重', '') || '').toString().trim());
        const facParenCompact = facRefStrCompact ? `（${facRefStrCompact}）` : '（参考值）';
        findings += `     RV FAC: ${facCompact ? formatValue(facCompact) : ''}%${facParenCompact}\n`;
        const rpadCompact = get('RPAD', '');
        findings += `     RPAD: ${rpadCompact ? formatValue(rpadCompact) : ''}%\n`;
    }
    findings += `\n`;

    findings += `  3.频谱多普勒： 未见明显异常；\n`;
    let dopplerLine = '';
    const isCatReference = referenceRange === '猫' || referenceRange === '猫（含体重）';
    const eaFusion = get('EA融合', '');
    if (!rightHeartAdvancedEnabled) {
        const vpa = get('VPA', '');
        const vao = get('VAO', '');
        if (vpa) dopplerLine += `VPA: ${formatValue(vpa)} `;
        if (vao) dopplerLine += `VAO: ${formatValue(vao)} `;
    }
    if (eaFusion && isCatReference) {
        dopplerLine += `EA融合: ${formatValue(eaFusion)}m/s `;
    } else {
        const e = get('E', '');
        const a = get('A', '');
        const eA = get('E/A', '');
        const eE = get("E/E'", '');
        if (e) dopplerLine += `E: ${formatValue(e)} m/s `;
        if (a) dopplerLine += `A: ${formatValue(a)} m/s `;
        if (eA) dopplerLine += `E/A: ${formatValue(eA)} `;
        const eENum = parseFloat((eE || '').toString().trim());
        const eEFormatted = (eE || '').toString().trim()
            ? (!isNaN(eENum) ? eENum.toFixed(2) : formatValue(eE))
            : '';
        if (!isCatReference || eEFormatted) dopplerLine += `E/E': ${eEFormatted}`;
    }

    if (rightHeartAdvancedEnabled) {
        const vpaF = formatValue(get('VPA', ''));
        const vaoF = formatValue(get('VAO', ''));
        const vti = get('VTI', '');
        const atet = get('AT/ET', '');
        findings += `     频谱多普勒检查\n`;
        findings += `     VPA：${vpaF}m/s； VTI: ${vti ? formatValue(vti) : ''}cm； AT/ET: ${atet ? formatValue(atet) : ''}（＜0.3 提示可能肺动脉高压）；\n`;
        findings += `     VAO: ${vaoF}m/s；\n`;
    }

    if (dopplerLine.trim()) {
        let lineOut = dopplerLine.trim();
        if (rightHeartAdvancedEnabled && !(eaFusion && isCatReference)) lineOut = `MV:   ${lineOut}`;
        findings += `     ${lineOut}\n`;
    } else if (!rightHeartAdvancedEnabled) {
        findings += `     E: m/s A: m/s E/A: ；\n`;
    } else if (!(eaFusion && isCatReference)) {
        findings += `     MV:   E: m/s A: m/s E/A: ；\n`;
    }

    if (rightHeartAdvancedEnabled) {
        const eTV = formatValue(get('E（TV）', ''));
        const aTV = formatValue(get('A（TV）', ''));
        const eaTV = formatValue(get('E/A（TV）', ''));
        const sP = formatValue(get("S'", ''));
        findings += `     TV：  E:${eTV}m/s  A: ${aTV}m/s   E/A: ${eaTV}；  S':${sP}cm/s；\n`;
    }

    findings += `\n`;

    const heartRate = get('心率', '');
    let heartRateFormatted = '';
    if (heartRate) {
        const trimmedValue = heartRate.trim();
        const isPureNumber = /^\d+(\.\d+)?$/.test(trimmedValue);
        heartRateFormatted = isPureNumber
            ? `约${Math.round(parseFloat(trimmedValue))}bpm`
            : `${trimmedValue}bpm`;
    }
    findings += `  4.心率： ${heartRateFormatted || ''}`;

    findings = findings.replace(/^(\d+)\.\s+/gm, '  $1.');
    findings = findings.replace(/^(?!  )(\d+)\./gm, '  $1.');
    return findings + '\n';
}
