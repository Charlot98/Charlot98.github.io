/** TAPSE 参考区间（readme 2.1）：下限 4.777×W^0.297，上限 7.640×W^0.297，W 为左侧栏体重（kg） */
function getTapseRefRangeFromWeight(weightStr) {
    const W = parseFloat(weightStr);
    if (isNaN(W) || W <= 0) return { min: null, max: null, str: '' };
    const pow = Math.pow(W, 0.297);
    const min = 4.777 * pow;
    const max = 7.640 * pow;
    return {
        min,
        max,
        str: `${min.toFixed(2)}-${max.toFixed(2)}`
    };
}

/** readme 2.3 FAC 参考区间：下限 46.34×W^(-0.097)，上限 76.92×W^(-0.097)，W 为体重 kg */
function getFACRefRangeFromWeight(weightStr) {
    const W = parseFloat(weightStr);
    if (isNaN(W) || W <= 0) return { min: null, max: null, str: '' };
    const pow = Math.pow(W, -0.097);
    const min = 46.34 * pow;
    const max = 76.92 * pow;
    return {
        min,
        max,
        str: `${min.toFixed(2)}-${max.toFixed(2)}`
    };
}

/** readme 2.6 S'（TV）参考：下限 4.262×W^0.233，上限 11.178×W^0.233，W 为体重 kg */
function getSPrimeRefRangeFromWeight(weightStr) {
    const W = parseFloat(weightStr);
    if (isNaN(W) || W <= 0) return { min: null, max: null, str: '' };
    const pow = Math.pow(W, 0.233);
    const min = 4.262 * pow;
    const max = 11.178 * pow;
    return {
        min,
        max,
        str: `${min.toFixed(2)}-${max.toFixed(2)}`
    };
}

/** readme 2.4：RPAD = (RPADmax − RPADmin) / RPADmax × 100；≤30% 标红；主框可手动覆盖 */
function calculateRPAD() {
    if (!rightHeartAdvancedEnabled) return;
    const dIn = document.querySelector('input[data-param="RPADmax"]');
    const sIn = document.querySelector('input[data-param="RPADmin"]');
    const rIn = document.querySelector('input[data-param="RPAD"]');
    if (!dIn || !sIn || !rIn) return;
    if (rIn.dataset.rpadManual === '1') {
        updateRPADColor();
        return;
    }
    const d = parseFloat(dIn.value.trim());
    const s = parseFloat(sIn.value.trim());
    rIn.style.color = '';
    if (!isNaN(d) && !isNaN(s) && d !== 0) {
        const pct = ((d - s) / d) * 100;
        const rounded = pct.toFixed(2);
        rIn.value = rounded;
        parameters['RPAD'] = rounded;
        if (parseFloat(rounded) <= 30) {
            rIn.style.color = 'red';
        }
    } else {
        rIn.value = '';
        delete parameters['RPAD'];
    }
}

function updateRPADColor() {
    const rIn = document.querySelector('input[data-param="RPAD"]');
    if (!rIn) return;
    rIn.style.color = '';
    const n = parseFloat(rIn.value.trim());
    if (!isNaN(n) && n <= 30) {
        rIn.style.color = 'red';
    }
}

/** 清除 PA/Ao、RPAD、AT/ET、E/E′、SI 主框的手动覆盖标记（全页刷新等场景调用） */
function clearRatioBubbleManualFlags() {
    const pa = document.getElementById('paAoRatioInput');
    if (pa) delete pa.dataset.paAoManual;
    const rp = document.getElementById('rpadRatioInput');
    if (rp) delete rp.dataset.rpadManual;
    const at = document.getElementById('atetRatioInput');
    if (at) delete at.dataset.atetManual;
    const ee = document.getElementById('eePrimeRatioInput');
    if (ee) delete ee.dataset.eeManual;
    const si = document.getElementById('siRatioInput');
    if (si) delete si.dataset.siManual;
}

/** TAPSE/AO = TAPSE(mm) ÷ AO(mm)，左侧展示 2 位小数；依赖主 AO（2. 瓣膜区） */
function calculateTapseOverAo() {
    const tapseIn = document.querySelector('input[data-param="TAPSE"]');
    const aoIn = document.querySelector('input[data-param="AO"]');
    const disp = document.getElementById('tapseAoRatioDisplay');
    if (!disp) return;
    disp.classList.remove('tapse-ao-ratio--low', 'tapse-ao-ratio--muted');
    disp.style.removeProperty('color');
    if (!tapseIn || !aoIn) {
        disp.textContent = '-';
        disp.classList.add('tapse-ao-ratio--muted');
        return;
    }
    const t = parseFloat(tapseIn.value.trim());
    const ao = parseFloat(aoIn.value.trim());
    if (!isNaN(t) && t > 0 && !isNaN(ao) && ao > 0) {
        const ratio = t / ao;
        disp.textContent = ratio.toFixed(2);
        if (ratio <= 0.65) {
            disp.classList.add('tapse-ao-ratio--low');
        }
    } else {
        disp.textContent = '-';
        disp.classList.add('tapse-ao-ratio--muted');
    }
}

function toggleRightHeartAdvancedInputs() {
    const tapseRow = document.getElementById('tapseInputRow');
    const paAoRow = document.getElementById('paAoAdvancedRow');
    const rpadRow = document.getElementById('rpadAdvancedRow');
    const vpaVaoWrap = document.getElementById('vpaVaoWrap');
    const tvTricuspidRow = document.getElementById('tvTricuspidRow');
    const gsFwsRow = document.getElementById('gsFwsRow');

    if (rightHeartAdvancedEnabled) {
        if (tapseRow) {
            tapseRow.style.display = '';
            calculateTapseOverAo();
        }
        if (paAoRow) {
            paAoRow.style.display = '';
            calculatePAOverAo();
        }
        if (rpadRow) {
            rpadRow.style.display = '';
            calculateRPAD();
        }
        if (vpaVaoWrap) vpaVaoWrap.classList.add('right-heart-advanced');
        if (tvTricuspidRow) tvTricuspidRow.style.display = 'grid';
        if (gsFwsRow) gsFwsRow.style.display = 'flex';
        updateReferenceValues();
    } else {
        if (tapseRow) tapseRow.style.display = 'none';
        if (paAoRow) paAoRow.style.display = 'none';
        if (rpadRow) rpadRow.style.display = 'none';
        if (vpaVaoWrap) vpaVaoWrap.classList.remove('right-heart-advanced');
        if (tvTricuspidRow) tvTricuspidRow.style.display = 'none';
        if (gsFwsRow) gsFwsRow.style.display = 'none';
        // 关闭时仅隐藏区块，不清空输入与 parameters，便于再次开启时恢复原内容
    }
}

// 根据含辛普森测量按钮状态显示/隐藏辛普森输入框（含单位的外层包裹）
function toggleSimpsonInputs() {
    const edvSimpsonInput = document.getElementById('edvSimpsonInput');
    const esvSimpsonInput = document.getElementById('esvSimpsonInput');
    const efSimpsonInput = document.getElementById('efSimpsonInput');
    const edvSimpsonWrap = document.getElementById('edvSimpsonInputWrap');
    const esvSimpsonWrap = document.getElementById('esvSimpsonInputWrap');
    const efSimpsonWrap = document.getElementById('efSimpsonInputWrap');

    if (simpsonEnabled) {
        if (edvSimpsonWrap) edvSimpsonWrap.style.display = '';
        if (esvSimpsonWrap) esvSimpsonWrap.style.display = '';
        if (efSimpsonWrap) efSimpsonWrap.style.display = '';
        restoreSimpsonDataFromCache();
    } else {
        saveSimpsonDataToCache();
        if (edvSimpsonInput) {
            edvSimpsonInput.value = '';
            delete parameters['EDV辛普森'];
        }
        if (esvSimpsonInput) {
            esvSimpsonInput.value = '';
            delete parameters['ESV辛普森'];
        }
        if (efSimpsonInput) {
            efSimpsonInput.value = '';
            delete parameters['EF辛普森'];
        }
        if (edvSimpsonWrap) edvSimpsonWrap.style.display = 'none';
        if (esvSimpsonWrap) esvSimpsonWrap.style.display = 'none';
        if (efSimpsonWrap) efSimpsonWrap.style.display = 'none';
    }
}
