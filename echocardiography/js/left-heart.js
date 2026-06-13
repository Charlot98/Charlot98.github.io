/**
 * 牛眼图节段几何（与 lv-strain-bullseye.svg 一致，修改 SVG 时同步此处）
 * 圆心 (130,130)；环半径 12 / 37 / 63 / 88
 * 1–6 基底 r63–88，7–12 近段 r37–63；楔区从 300° 起顺时针每 60°
 * 13–16 远段 r12–37 四象限；17 心尖 r≤12
 */
const LV_STRAIN_GEOMETRY = {
    cx: 130,
    cy: 130,
    radii: { apex: 12, apical: 37, mid: 63, basal: 88 },
    sixWedges: [
        { seg: 1, midSeg: 7,  startDeg: 300, endDeg: 360 },
        { seg: 2, midSeg: 8,  startDeg: 240, endDeg: 300 },
        { seg: 3, midSeg: 9,  startDeg: 180, endDeg: 240 },
        { seg: 4, midSeg: 10, startDeg: 120, endDeg: 180 },
        { seg: 5, midSeg: 11, startDeg: 60,  endDeg: 120 },
        { seg: 6, midSeg: 12, startDeg: 0,   endDeg: 60  }
    ],
    fourQuadrants: [
        { seg: 13, startDeg: 270, endDeg: 360 },
        { seg: 14, startDeg: 180, endDeg: 270 },
        { seg: 15, startDeg: 90,  endDeg: 180 },
        { seg: 16, startDeg: 0,   endDeg: 90  }
    ],
    apexSeg: 17
};

/** 各节段编号/标签锚点（固定几何中心，避免 getBBox 与描边切换导致位移） */
const LV_STRAIN_SEGMENT_CENTROIDS = (function() {
    const result = {};
    const { cx, cy, radii, sixWedges, fourQuadrants, apexSeg } = LV_STRAIN_GEOMETRY;
    for (var i = 0; i < sixWedges.length; i++) {
        var w = sixWedges[i];
        var mid = (w.startDeg + w.endDeg) / 2 * Math.PI / 180;
        var rBasal = (radii.mid + radii.basal) / 2;
        var rMid = (radii.apical + radii.mid) / 2;
        result[w.seg] = { x: cx + rBasal * Math.cos(mid), y: cy + rBasal * Math.sin(mid) };
        result[w.midSeg] = { x: cx + rMid * Math.cos(mid), y: cy + rMid * Math.sin(mid) };
    }
    for (var j = 0; j < fourQuadrants.length; j++) {
        var q = fourQuadrants[j];
        var qmid = (q.startDeg + q.endDeg) / 2 * Math.PI / 180;
        var rApical = (radii.apex + radii.apical) / 2;
        result[q.seg] = { x: cx + rApical * Math.cos(qmid), y: cy + rApical * Math.sin(qmid) };
    }
    result[apexSeg] = { x: cx, y: cy };
    return result;
})();

/** 17 节段中文名（与 guide.md 一致） */
const LV_STRAIN_SEGMENT_NAMES = {
    1: '基底部前壁',
    2: '基底部前壁间隔',
    3: '基底部间隔',
    4: '基底部下壁',
    5: '基底部后壁',
    6: '基底部侧壁',
    7: '近段前壁',
    8: '近段前壁间隔',
    9: '近段间隔',
    10: '近段下壁',
    11: '近段后壁',
    12: '近段侧壁',
    13: '远段前壁',
    14: '远段间隔',
    15: '远段下壁',
    16: '远段侧壁',
    17: '心尖'
};

/** 节段英文方位（hover 提示用） */
const LV_STRAIN_SEGMENT_ENGLISH = {
    1: 'ANT', 2: 'ANT SEPT', 3: 'SEPT', 4: 'INF', 5: 'POST', 6: 'LAT',
    7: 'ANT', 8: 'ANT SEPT', 9: 'SEPT', 10: 'INF', 11: 'POST', 12: 'LAT',
    13: 'ANT', 14: 'SEPT', 15: 'INF', 16: 'LAT', 17: 'APEX'
};

/** hover：编号 + 中文名 +（英文大写），如「1基底部前壁（ANT）」 */
function getLvStrainSegmentHoverTitle(seg) {
    const name = LV_STRAIN_SEGMENT_NAMES[seg];
    const en = LV_STRAIN_SEGMENT_ENGLISH[seg];
    if (!name) return '';
    return en ? String(seg) + name + '（' + en.toUpperCase() + '）' : String(seg) + name;
}

function getLvStrainSegTooltipEl() {
    const host = document.getElementById('lvStrainBullseyeHost');
    if (!host) return null;
    let tip = host.querySelector('.lv-strain-seg-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.className = 'lv-strain-seg-tooltip';
        tip.setAttribute('role', 'tooltip');
        host.appendChild(tip);
    }
    return tip;
}

function showLvStrainSegTooltip(seg, clientX, clientY) {
    const host = document.getElementById('lvStrainBullseyeHost');
    const tip = getLvStrainSegTooltipEl();
    if (!host || !tip) return;
    const text = getLvStrainSegmentHoverTitle(seg);
    if (!text) return;
    tip.textContent = text;
    tip.classList.add('visible');
    const hostRect = host.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let x = clientX - hostRect.left + 10;
    let y = clientY - hostRect.top - tipRect.height - 8;
    if (x + tipRect.width > hostRect.width - 4) {
        x = hostRect.width - tipRect.width - 4;
    }
    if (x < 4) x = 4;
    if (y < 4) y = clientY - hostRect.top + 12;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
}

function hideLvStrainSegTooltip() {
    const tip = getLvStrainSegTooltipEl();
    if (tip) tip.classList.remove('visible');
}

/** 写入各节段 path 的 title（仅 hover 显示） */
function applyLvStrainSegmentHoverTitles(svg) {
    if (!svg) svg = document.querySelector('.lv-strain-bullseye');
    if (!svg) return;
    var annotG = svg.querySelector('#lv-strain-seg-annotations');
    if (annotG) annotG.remove();
    for (var seg = 1; seg <= 17; seg++) {
        var path = svg.querySelector('[data-seg="' + seg + '"]');
        if (!path) continue;
        path.setAttribute('data-name', LV_STRAIN_SEGMENT_NAMES[seg] || '');
        var titleText = getLvStrainSegmentHoverTitle(seg);
        var titleEl = path.querySelector('title');
        if (!titleEl) {
            titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            path.insertBefore(titleEl, path.firstChild);
        }
        titleEl.textContent = titleText;
    }
}

/** 节段着色：单击切换 异常（红）/ 正常（默认透明） */
const LV_STRAIN_COLOR_CLASSES = {
    red: 'lv-strain-seg--red'
};

/** 节段编号 → 手动标记颜色（仅 red 或空） */
let lvStrainSegmentColors = {};

const LV_STRAIN_BULLSEYE_SRC   = 'lv-strain-bullseye.svg';
const LV_STRAIN_BULLSEYE_LABEL = '左心室应变 17 节段牛眼图';

// ─── 显隐 ─────────────────────────────────────────────────────────────────────

/** 拖拽/缩放时右侧栏活动区域左边界（视口中线，默认加载位置仍由 CSS 预留卡片位） */
function getRightSidebarMinLeft() {
    return window.innerWidth / 2;
}

function toggleLeftHeartAdvancedInputs() {
    const panel = document.getElementById('lvStrainPanel');
    const active = leftHeartAdvancedEnabled || leftHeartAdvancedOnlyEnabled;
    if (panel) {
        panel.classList.toggle('lv-strain-panel--inactive', !active);
        panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    }
    const onlyToggle = document.getElementById('lvStrainOnlyToggle');
    if (onlyToggle) onlyToggle.checked = !!leftHeartAdvancedOnlyEnabled;
}

function setLeftHeartAdvancedOnlyEnabled(enabled, options) {
    const skipTemplate = options && options.skipTemplate;
    leftHeartAdvancedOnlyEnabled = !!enabled;
    const toggle = document.getElementById('lvStrainOnlyToggle');
    if (toggle) toggle.checked = leftHeartAdvancedOnlyEnabled;
    if (leftHeartAdvancedOnlyEnabled) {
        parameters['仅左心高阶'] = '是';
    } else {
        delete parameters['仅左心高阶'];
    }
    toggleLeftHeartAdvancedInputs();
    if (!skipTemplate && typeof generateTemplate === 'function') generateTemplate();
}

function activateLeftHeartAdvanced() {
    if (leftHeartAdvancedEnabled) return;
    leftHeartAdvancedEnabled = true;
    const btn = document.getElementById('leftHeartAdvancedButton');
    if (btn) btn.classList.add('active');
    parameters['左心高阶'] = '是';
    toggleLeftHeartAdvancedInputs();
    if (typeof generateTemplate === 'function') generateTemplate();
}

function bindLvStrainOnlyToggle() {
    const toggle = document.getElementById('lvStrainOnlyToggle');
    if (!toggle || toggle.dataset.lvStrainOnlyBound === '1') return;
    toggle.dataset.lvStrainOnlyBound = '1';
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    toggle.addEventListener('change', function(e) {
        e.stopPropagation();
        setLeftHeartAdvancedOnlyEnabled(toggle.checked);
    });
}

function bindLvStrainPanelActivate() {
    const panel = document.getElementById('lvStrainPanel');
    if (!panel || panel.dataset.lvStrainActivateBound === '1') return;
    panel.dataset.lvStrainActivateBound = '1';
    panel.addEventListener('click', function(e) {
        if (e.target.closest('.lv-strain-only-toggle')) return;
        if (!panel.classList.contains('lv-strain-panel--inactive')) return;
        activateLeftHeartAdvanced();
    });
}

// ─── 颜色渲染 ─────────────────────────────────────────────────────────────────

function applyLvStrainSegmentFill(segEl, colorKey) {
    if (!segEl) return;
    Object.values(LV_STRAIN_COLOR_CLASSES).forEach(function(cls) {
        segEl.classList.remove(cls);
    });
    if (colorKey && LV_STRAIN_COLOR_CLASSES[colorKey]) {
        segEl.classList.add(LV_STRAIN_COLOR_CLASSES[colorKey]);
    }
}

function renderLvStrainSegmentColors() {
    const svg = document.querySelector('.lv-strain-bullseye');
    if (!svg) return;
    svg.querySelectorAll('.lv-strain-seg').forEach(function(el) {
        const seg = el.getAttribute('data-seg');
        applyLvStrainSegmentFill(el, lvStrainSegmentColors[seg] || null);
    });
    renderLvStrainSegmentNumbers();
}

function applyLvStrainSegmentColors(colorMap) {
    if (!colorMap || typeof colorMap !== 'object') return;
    Object.keys(colorMap).forEach(function(seg) {
        const key   = String(seg);
        const color = colorMap[seg];
        if (color && LV_STRAIN_COLOR_CLASSES[color]) {
            lvStrainSegmentColors[key] = color;
        } else {
            delete lvStrainSegmentColors[key];
        }
    });
    renderLvStrainSegmentColors();
}

function getLvStrainSegmentColors() {
    return Object.assign({}, lvStrainSegmentColors);
}

function clearLvStrainSegmentColors() {
    lvStrainSegmentColors = {};
    lvStrainSegmentValues = {};
    const svg = document.querySelector('.lv-strain-bullseye');
    if (!svg) return;
    svg.querySelectorAll('.lv-strain-seg').forEach(function(el) {
        applyLvStrainSegmentFill(el, null);
    });
    renderLvStrainSegmentLabels();
}

function bindLvStrainEraser() {
    const btn = document.getElementById('lvStrainEraserBtn');
    if (!btn || btn.dataset.lvStrainEraserBound === '1') return;
    btn.dataset.lvStrainEraserBound = '1';
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        clearLvStrainSegmentColors();
        if (typeof generateTemplateDeferred === 'function') generateTemplateDeferred();
    });
}

function mountLvStrainBullseye(el) {
    const host = document.getElementById('lvStrainBullseyeHost');
    const wrap = document.getElementById('lvStrainMapWrap');
    if (host) {
        const btn = host.querySelector('.lv-strain-eraser-btn');
        if (btn) host.insertBefore(el, btn);
        else host.appendChild(el);
        return;
    }
    const legend = wrap && wrap.querySelector('.lv-strain-map-legend');
    if (legend && wrap) wrap.insertBefore(el, legend);
    else if (wrap) wrap.appendChild(el);
}

// ─── 数值管理 ─────────────────────────────────────────────────────────────────

/** 批量写入节段数值 */
function setLvStrainSegmentValues(valuesMap) {
    if (!valuesMap || typeof valuesMap !== 'object') return;
    Object.keys(valuesMap).forEach(function(seg) {
        const val = valuesMap[seg];
        if (val === null || val === undefined || val === '') {
            delete lvStrainSegmentValues[String(seg)];
        } else {
            lvStrainSegmentValues[String(seg)] = parseFloat(val);
        }
    });
    renderLvStrainSegmentLabels();
}

/** 供报告模板读取 */
function getLvStrainSegmentValues() {
    return Object.assign({}, lvStrainSegmentValues);
}

// ─── SVG 数值标签 ─────────────────────────────────────────────────────────────

/** 返回节段在 SVG 坐标系中的固定标签锚点 */
function getLvSegmentCentroidSvg(seg) {
    return LV_STRAIN_SEGMENT_CENTROIDS[seg] || null;
}

function applyLvStrainSegNoStyle(textEl, onRed) {
    textEl.setAttribute('class', 'lv-strain-seg-no' + (onRed ? ' lv-strain-seg-no--on-red' : ''));
}

/** 首次创建 17 个编号节点（坐标固定，之后只更新样式） */
function ensureLvStrainSegmentNumbers(svg) {
    var numsG = svg.querySelector('#lv-strain-seg-numbers');
    if (!numsG) {
        numsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        numsG.id = 'lv-strain-seg-numbers';
        numsG.classList.add('lv-strain-overlay');
        svg.appendChild(numsG);
    }
    if (numsG.dataset.ready === '1') return numsG;

    for (var seg = 1; seg <= 17; seg++) {
        var c = getLvSegmentCentroidSvg(seg);
        if (!c) continue;
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('data-seg', String(seg));
        text.setAttribute('x', c.x.toFixed(1));
        text.setAttribute('y', c.y.toFixed(1));
        text.textContent = String(seg);
        applyLvStrainSegNoStyle(text, false);
        numsG.appendChild(text);
    }
    numsG.dataset.ready = '1';

    var valueLabels = svg.querySelector('#lv-strain-value-labels');
    if (valueLabels) svg.insertBefore(numsG, valueLabels);
    return numsG;
}

/** 在 SVG 内渲染所有节段的数值文本标签 */
function renderLvStrainSegmentLabels() {
    const svg = document.querySelector('.lv-strain-bullseye');
    if (!svg) return;

    var labelsG = svg.querySelector('#lv-strain-value-labels');
    if (!labelsG) {
        labelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelsG.id = 'lv-strain-value-labels';
        labelsG.classList.add('lv-strain-overlay');
        svg.appendChild(labelsG);
    }

    // 清空旧标签
    while (labelsG.firstChild) labelsG.removeChild(labelsG.firstChild);

    // 为每个有数值的节段添加 <text>
    Object.keys(lvStrainSegmentValues).forEach(function(seg) {
        var val = lvStrainSegmentValues[seg];
        var c   = getLvSegmentCentroidSvg(Number(seg));
        if (!c) return;
        var colorKey = lvStrainSegmentColors[seg];
        var onRed = colorKey === 'red';
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'lv-strain-seg-value' + (onRed ? ' lv-strain-seg-no--on-red' : ''));
        text.setAttribute('x', c.x.toFixed(1));
        text.setAttribute('y', c.y.toFixed(1));
        text.textContent = String(val);
        labelsG.appendChild(text);
    });

    // 数值标签始终置于最上层（避免被网格/壁厚帽遮挡）
    updateLvStrainSegmentNumbers();
    svg.appendChild(labelsG);
}

/** 更新节段编号样式（坐标固定，不重绘） */
function updateLvStrainSegmentNumbers() {
    const svg = document.querySelector('.lv-strain-bullseye');
    if (!svg) return;

    var numsG = ensureLvStrainSegmentNumbers(svg);
    for (var seg = 1; seg <= 17; seg++) {
        var text = numsG.querySelector('[data-seg="' + seg + '"]');
        if (!text) continue;
        var hasValue = lvStrainSegmentValues[String(seg)] !== undefined;
        text.style.display = hasValue ? 'none' : '';
        applyLvStrainSegNoStyle(text, lvStrainSegmentColors[String(seg)] === 'red');
    }

    var valueLabels = svg.querySelector('#lv-strain-value-labels');
    if (valueLabels) svg.insertBefore(numsG, valueLabels);
}

/** @deprecated 别名，供旧调用 */
function renderLvStrainSegmentNumbers() {
    updateLvStrainSegmentNumbers();
}

// ─── 交互：单击切换；按住左键滑动多选后统一变色 ───────────────────────────────

/** @type {{ active: boolean, moved: boolean, targetColor: string|null, selected: Set<number>, startSeg: number|null }} */
let lvStrainPaintState = {
    active: false,
    moved: false,
    targetColor: null,
    selected: new Set(),
    startSeg: null
};

function toggleLvStrainSegmentAbnormal(seg) {
    const key = String(seg);
    const next = lvStrainSegmentColors[key] === 'red' ? null : 'red';
    const patch = {};
    patch[key] = next;
    applyLvStrainSegmentColors(patch);
    renderLvStrainSegmentLabels();
    if (typeof generateTemplateDeferred === 'function') generateTemplateDeferred();
}

function setLvStrainSegmentsColor(segs, colorKey) {
    const patch = {};
    segs.forEach(function(seg) {
        patch[String(seg)] = colorKey;
    });
    applyLvStrainSegmentColors(patch);
    renderLvStrainSegmentLabels();
}

function updateLvStrainDragPreview(svg) {
    svg.querySelectorAll('.lv-strain-seg').forEach(function(el) {
        el.classList.remove('lv-strain-seg--drag-preview');
    });
    lvStrainPaintState.selected.forEach(function(seg) {
        const el = svg.querySelector('[data-seg="' + seg + '"]');
        if (el) el.classList.add('lv-strain-seg--drag-preview');
    });
}

function addLvStrainPaintSegment(svg, seg) {
    if (!seg || lvStrainPaintState.selected.has(seg)) return;
    lvStrainPaintState.selected.add(seg);
    updateLvStrainDragPreview(svg);
}

function finishLvStrainPaint(svg) {
    if (!lvStrainPaintState.active) return;

    const moved = lvStrainPaintState.moved;
    const startSeg = lvStrainPaintState.startSeg;
    const selected = Array.from(lvStrainPaintState.selected);
    const targetColor = lvStrainPaintState.targetColor;

    lvStrainPaintState.active = false;
    lvStrainPaintState.moved = false;
    lvStrainPaintState.startSeg = null;
    lvStrainPaintState.selected = new Set();
    lvStrainPaintState.targetColor = null;
    updateLvStrainDragPreview(svg);

    if (!moved && startSeg) {
        toggleLvStrainSegmentAbnormal(startSeg);
        return;
    }
    if (selected.length > 0) {
        setLvStrainSegmentsColor(selected, targetColor);
        if (typeof generateTemplateDeferred === 'function') generateTemplateDeferred();
    }
}

function initLvStrainBullseyeInteraction(svg) {
    if (!svg || svg.dataset.lvStrainReady === '1') return;
    svg.dataset.lvStrainReady = '1';
    svg.style.touchAction = 'none';

    function segFromEventTarget(target) {
        if (!target || !target.closest) return 0;
        const el = target.closest('.lv-strain-seg');
        if (!el) return 0;
        return Number(el.getAttribute('data-seg')) || 0;
    }

    function beginPaint(seg) {
        hideLvStrainSegTooltip();
        const key = String(seg);
        const isRed = lvStrainSegmentColors[key] === 'red';
        lvStrainPaintState.active = true;
        lvStrainPaintState.moved = false;
        lvStrainPaintState.targetColor = isRed ? null : 'red';
        lvStrainPaintState.selected = new Set([seg]);
        lvStrainPaintState.startSeg = seg;
        updateLvStrainDragPreview(svg);
    }

    svg.querySelectorAll('.lv-strain-seg').forEach(function(segEl) {
        segEl.addEventListener('pointerdown', function(e) {
            if (e.button !== 0) return;
            e.preventDefault();
            const seg = Number(segEl.getAttribute('data-seg'));
            if (!seg) return;
            if (typeof segEl.setPointerCapture === 'function') {
                segEl.setPointerCapture(e.pointerId);
            }
            beginPaint(seg);
        });

        segEl.addEventListener('pointerenter', function(e) {
            if (lvStrainPaintState.active && (e.buttons & 1) !== 0) {
                lvStrainPaintState.moved = true;
                const seg = Number(segEl.getAttribute('data-seg'));
                addLvStrainPaintSegment(svg, seg);
                hideLvStrainSegTooltip();
                return;
            }
            const seg = Number(segEl.getAttribute('data-seg'));
            if (seg) showLvStrainSegTooltip(seg, e.clientX, e.clientY);
        });

        segEl.addEventListener('pointermove', function(e) {
            if (lvStrainPaintState.active) return;
            const seg = Number(segEl.getAttribute('data-seg'));
            if (seg) showLvStrainSegTooltip(seg, e.clientX, e.clientY);
        });

        segEl.addEventListener('pointerleave', function() {
            hideLvStrainSegTooltip();
        });
    });

    svg.addEventListener('pointerleave', function() {
        hideLvStrainSegTooltip();
    });

    svg.addEventListener('pointermove', function(e) {
        if (!lvStrainPaintState.active || (e.buttons & 1) === 0) return;
        const seg = segFromEventTarget(document.elementFromPoint(e.clientX, e.clientY));
        if (!seg) return;
        lvStrainPaintState.moved = true;
        addLvStrainPaintSegment(svg, seg);
    });

    function onPaintEnd() {
        finishLvStrainPaint(svg);
    }
    window.addEventListener('pointerup', onPaintEnd);
    window.addEventListener('pointercancel', onPaintEnd);

    renderLvStrainSegmentColors();
    applyLvStrainSegmentHoverTitles(svg);
    renderLvStrainSegmentLabels();
}

// ─── SVG 加载 ─────────────────────────────────────────────────────────────────

function loadLvStrainBullseyeSvg() {
    const wrap = document.getElementById('lvStrainMapWrap');
    bindLvStrainEraser();
    if (!wrap || wrap.querySelector('svg.lv-strain-bullseye, img.lv-strain-bullseye')) return;

    fetch(LV_STRAIN_BULLSEYE_SRC)
        .then(function(res) {
            if (!res.ok) throw new Error(String(res.status));
            return res.text();
        })
        .then(function(svgText) {
            const temp = document.createElement('div');
            temp.innerHTML = svgText.trim();
            const svg = temp.querySelector('svg');
            if (!svg) return;
            svg.classList.add('lv-strain-bullseye');
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', LV_STRAIN_BULLSEYE_LABEL);
            mountLvStrainBullseye(svg);
            initLvStrainBullseyeInteraction(svg);
        })
        .catch(function() {
            const img = document.createElement('img');
            img.src = LV_STRAIN_BULLSEYE_SRC;
            img.className = 'lv-strain-bullseye';
            img.alt = LV_STRAIN_BULLSEYE_LABEL;
            mountLvStrainBullseye(img);
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        bindLvStrainOnlyToggle();
        bindLvStrainPanelActivate();
        loadLvStrainBullseyeSvg();
    });
} else {
    bindLvStrainOnlyToggle();
    bindLvStrainPanelActivate();
    loadLvStrainBullseyeSvg();
}
