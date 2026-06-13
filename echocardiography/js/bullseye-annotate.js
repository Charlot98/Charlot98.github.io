/**
 * 牛眼图标注工具：对齐几何 + 填写 ground truth + 导出 JSON
 */
(function() {
    const SEGMENT_NAMES = {
        1: '基底部前壁', 2: '基底部前壁间隔', 3: '基底部间隔', 4: '基底部下壁',
        5: '基底部后壁', 6: '基底部侧壁', 7: '近段前壁', 8: '近段前壁间隔',
        9: '近段间隔', 10: '近段下壁', 11: '近段后壁', 12: '近段侧壁',
        13: '远段前壁', 14: '远段间隔', 15: '远段下壁', 16: '远段侧壁', 17: '心尖'
    };

    /** 标准 SVG 环半径比（88 / 63 / 37 / 12） */
    const RING_RATIO = { outer: 88, mid: 63, inner: 37, apex: 12 };

    const WEDGE_ANGLES = [
        { seg: 1, midSeg: 7,  startDeg: 300, endDeg: 360 },
        { seg: 2, midSeg: 8,  startDeg: 240, endDeg: 300 },
        { seg: 3, midSeg: 9,  startDeg: 180, endDeg: 240 },
        { seg: 4, midSeg: 10, startDeg: 120, endDeg: 180 },
        { seg: 5, midSeg: 11, startDeg: 60,  endDeg: 120 },
        { seg: 6, midSeg: 12, startDeg: 0,   endDeg: 60  }
    ];
    const QUAD_ANGLES = [
        { seg: 13, startDeg: 270, endDeg: 360 },
        { seg: 14, startDeg: 180, endDeg: 270 },
        { seg: 15, startDeg: 90,  endDeg: 180 },
        { seg: 16, startDeg: 0,   endDeg: 90  }
    ];

    const canvas = document.getElementById('annotateCanvas');
    const ctx = canvas.getContext('2d');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const overlayCtx = overlayCanvas.getContext('2d');
    const canvasWrap = document.getElementById('canvasWrap');
    const statusBar = document.getElementById('statusBar');
    const segGrid = document.getElementById('segGrid');
    const sliderCx = document.getElementById('sliderCx');
    const sliderCy = document.getElementById('sliderCy');
    const sliderROuter = document.getElementById('sliderROuter');
    const sliderRMid = document.getElementById('sliderRMid');
    const sliderRInner = document.getElementById('sliderRInner');
    const sliderRApex = document.getElementById('sliderRApex');

    /** GE E90 样本校准环比例（与 bullseye-geometry.js 一致） */
    const SAMPLE_RING_RATIOS = { mid: 0.6627, inner: 0.3353, apex: 0.1652 };
    let ringProfile = null;

    let sourceCanvas = null;
    let sourceCtx = null;
    let bullseye = null;
    let centroids = {};
    let dragging = false;

    function setStatus(msg) {
        statusBar.textContent = msg;
    }

    function ringsFromRatios(outerR, ratios) {
        const r = Number(outerR);
        return {
            outer: r,
            mid: r * ratios.mid,
            inner: r * ratios.inner,
            apex: r * ratios.apex
        };
    }

    function defaultRingsFromOuter(outerR) {
        return ringsFromRatios(outerR, {
            mid: RING_RATIO.mid / RING_RATIO.outer,
            inner: RING_RATIO.inner / RING_RATIO.outer,
            apex: RING_RATIO.apex / RING_RATIO.outer
        });
    }

    function sampleRingsFromOuter(outerR) {
        const ratios = ringProfile && ringProfile.ringRatios
            ? ringProfile.ringRatios
            : SAMPLE_RING_RATIOS;
        return ringsFromRatios(outerR, ratios);
    }

    function polarXY(cx, cy, deg, radius) {
        const rad = deg * Math.PI / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    }

    /** 按可调四环半径计算 17 节段质心（图像像素坐标） */
    function computeCentroidsCustom(cx, cy, rings) {
        const centroids = {};
        const rBasal = (rings.mid + rings.outer) / 2;
        const rMidSeg = (rings.inner + rings.mid) / 2;
        const rApical = (rings.apex + rings.inner) / 2;

        WEDGE_ANGLES.forEach(function(w) {
            const midDeg = (w.startDeg + w.endDeg) / 2;
            centroids[w.seg] = polarXY(cx, cy, midDeg, rBasal);
            centroids[w.midSeg] = polarXY(cx, cy, midDeg, rMidSeg);
        });
        QUAD_ANGLES.forEach(function(q) {
            const midDeg = (q.startDeg + q.endDeg) / 2;
            centroids[q.seg] = polarXY(cx, cy, midDeg, rApical);
        });
        centroids[17] = { x: cx, y: cy };
        return centroids;
    }

    function buildSegGrid() {
        segGrid.innerHTML = '';
        for (let seg = 1; seg <= 17; seg++) {
            const item = document.createElement('div');
            item.className = 'seg-item';
            item.dataset.seg = String(seg);
            item.innerHTML =
                '<span class="seg-no">' + seg + '</span>' +
                '<span class="seg-name" title="' + SEGMENT_NAMES[seg] + '">' + SEGMENT_NAMES[seg] + '</span>' +
                '<input type="text" id="seg-' + seg + '" inputmode="decimal" placeholder="—" autocomplete="off">';
            segGrid.appendChild(item);
        }
    }

    function getRingsFromSliders() {
        let outer = Number(sliderROuter.value);
        let mid = Number(sliderRMid.value);
        let inner = Number(sliderRInner.value);
        let apex = Number(sliderRApex.value);
        outer = Math.max(20, outer);
        mid = Math.max(10, Math.min(mid, outer - 4));
        inner = Math.max(5, Math.min(inner, mid - 4));
        apex = Math.max(3, Math.min(apex, inner - 3));
        return { outer: outer, mid: mid, inner: inner, apex: apex };
    }

    function getBullseyeFromSliders() {
        if (!sourceCanvas) return null;
        const cx = Number(sliderCx.value);
        const cy = Number(sliderCy.value);
        const rings = getRingsFromSliders();
        return {
            cx: cx,
            cy: cy,
            r: rings.outer,
            scale: rings.outer / RING_RATIO.outer,
            rings: rings
        };
    }

    function syncRingSliderOutputs(rings) {
        document.getElementById('outROuter').textContent = Math.round(rings.outer);
        document.getElementById('outRMid').textContent = Math.round(rings.mid);
        document.getElementById('outRInner').textContent = Math.round(rings.inner);
        document.getElementById('outRApex').textContent = Math.round(rings.apex);
    }

    function applyRingsToSliders(rings, skipClampWrite) {
        sliderROuter.value = Math.round(rings.outer);
        sliderRMid.value = Math.round(rings.mid);
        sliderRInner.value = Math.round(rings.inner);
        sliderRApex.value = Math.round(rings.apex);
        if (!skipClampWrite) {
            const clamped = getRingsFromSliders();
            sliderRMid.value = Math.round(clamped.mid);
            sliderRInner.value = Math.round(clamped.inner);
            sliderRApex.value = Math.round(clamped.apex);
            syncRingSliderOutputs(clamped);
        } else {
            syncRingSliderOutputs(rings);
        }
    }

    function syncSlidersFromBullseye() {
        if (!bullseye) return;
        sliderCx.value = Math.round(bullseye.cx);
        sliderCy.value = Math.round(bullseye.cy);
        document.getElementById('outCx').textContent = Math.round(bullseye.cx);
        document.getElementById('outCy').textContent = Math.round(bullseye.cy);

        const rings = bullseye.rings || defaultRingsFromOuter(bullseye.r);
        applyRingsToSliders(rings, true);
    }

    function updateSliderRanges() {
        if (!sourceCanvas) return;
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const maxR = Math.round(Math.min(w, h) * 0.55);
        sliderCx.min = 0;
        sliderCx.max = w;
        sliderCy.min = 0;
        sliderCy.max = h;
        sliderROuter.min = 20;
        sliderROuter.max = maxR;
        sliderRMid.min = 10;
        sliderRMid.max = maxR;
        sliderRInner.min = 5;
        sliderRInner.max = maxR;
        sliderRApex.min = 3;
        sliderRApex.max = maxR;
    }

    function refreshGeometry() {
        bullseye = getBullseyeFromSliders();
        if (!bullseye) return;
        centroids = computeCentroidsCustom(bullseye.cx, bullseye.cy, bullseye.rings);
        syncSlidersFromBullseye();
        redraw();
    }

    function scaleAllRings(factor) {
        const rings = getRingsFromSliders();
        applyRingsToSliders({
            outer: rings.outer * factor,
            mid: rings.mid * factor,
            inner: rings.inner * factor,
            apex: rings.apex * factor
        });
        refreshGeometry();
    }

    function resetRingRatios() {
        const outer = Number(sliderROuter.value);
        applyRingsToSliders(defaultRingsFromOuter(outer));
        refreshGeometry();
    }

    function applySampleProfileRatios() {
        const outer = Number(sliderROuter.value);
        applyRingsToSliders(sampleRingsFromOuter(outer));
        refreshGeometry();
        const label = ringProfile && ringProfile.label ? ringProfile.label : '初步校准样本';
        setStatus('已应用样本四环比例：' + label);
    }

    async function loadRingProfile() {
        if (typeof bullseyeLoadRingProfile === 'function') {
            await bullseyeLoadRingProfile('samples/GE-E90-ring-profile.json');
            if (typeof BULLSEYE_RING_PROFILES !== 'undefined' && BULLSEYE_RING_PROFILES['ge-e90']) {
                ringProfile = { label: 'GE E90', ringRatios: BULLSEYE_RING_PROFILES['ge-e90'].ratios };
            }
            return;
        }
        try {
            const res = await fetch('samples/GE-E90-ring-profile.json');
            if (res.ok) ringProfile = await res.json();
        } catch (_) { /* 离线打开 HTML 时用内置比例 */ }
    }

    function redraw() {
        if (!sourceCanvas) return;

        const wrapW = canvasWrap.clientWidth - 24;
        const maxW = wrapW > 0 ? wrapW : sourceCanvas.width;
        const scale = Math.min(1, maxW / sourceCanvas.width);
        const dispW = Math.max(1, Math.round(sourceCanvas.width * scale));
        const dispH = Math.max(1, Math.round(sourceCanvas.height * scale));

        canvas.width = dispW;
        canvas.height = dispH;
        overlayCanvas.width = dispW;
        overlayCanvas.height = dispH;

        ctx.drawImage(sourceCanvas, 0, 0, dispW, dispH);
        overlayCtx.clearRect(0, 0, dispW, dispH);

        if (!bullseye || !Object.keys(centroids).length) return;

        const sx = dispW / sourceCanvas.width;
        const sy = dispH / sourceCanvas.height;
        const rings = bullseye.rings || defaultRingsFromOuter(bullseye.r);
        const cx = bullseye.cx * sx;
        const cy = bullseye.cy * sy;
        const octx = overlayCtx;

        octx.save();
        octx.lineJoin = 'round';

        function strokeRing(radius, color, width, dash) {
            octx.save();
            octx.strokeStyle = 'rgba(0,0,0,0.55)';
            octx.lineWidth = width + 2;
            octx.setLineDash(dash || []);
            octx.beginPath();
            octx.arc(cx, cy, radius, 0, Math.PI * 2);
            octx.stroke();
            octx.strokeStyle = color;
            octx.lineWidth = width;
            octx.beginPath();
            octx.arc(cx, cy, radius, 0, Math.PI * 2);
            octx.stroke();
            octx.restore();
        }

        strokeRing(rings.apex * sx, '#e040fb', 2, [3, 3]);
        strokeRing(rings.inner * sx, '#00e5ff', 2.5, [6, 4]);
        strokeRing(rings.mid * sx, '#ffab40', 2.5, [6, 4]);
        strokeRing(rings.outer * sx, '#69f0ae', 3, []);

        const patchHalfBase = Math.max(22, Math.round(rings.outer * 0.13));
        const basalSegs = new Set([1, 2, 3, 4, 5, 6]);

        Object.keys(centroids).forEach(function(seg) {
            const c = centroids[seg];
            const px = c.x * sx;
            const py = c.y * sy;
            const segNum = Number(seg);
            let half = basalSegs.has(segNum) ? patchHalfBase * 1.25 : patchHalfBase;
            if (segNum === 17) half = patchHalfBase * 0.85;
            half *= sx;

            octx.fillStyle = 'rgba(25, 118, 210, 0.18)';
            octx.fillRect(px - half, py - half, half * 2, half * 2);
            octx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            octx.lineWidth = 2;
            octx.strokeRect(px - half, py - half, half * 2, half * 2);
            octx.strokeStyle = '#448aff';
            octx.lineWidth = 1.5;
            octx.strokeRect(px - half, py - half, half * 2, half * 2);

            octx.fillStyle = 'rgba(0,0,0,0.6)';
            octx.beginPath();
            octx.arc(px, py, 6, 0, Math.PI * 2);
            octx.fill();
            octx.fillStyle = '#448aff';
            octx.beginPath();
            octx.arc(px, py, 5, 0, Math.PI * 2);
            octx.fill();

            octx.font = 'bold 11px system-ui,sans-serif';
            octx.textAlign = 'center';
            octx.textBaseline = 'middle';
            octx.lineWidth = 3;
            octx.strokeStyle = 'rgba(0,0,0,0.75)';
            octx.strokeText(seg, px, py);
            octx.fillStyle = '#fff';
            octx.fillText(seg, px, py);
        });

        octx.fillStyle = 'rgba(0,0,0,0.65)';
        octx.beginPath();
        octx.arc(cx, cy, 7, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = '#ff5252';
        octx.beginPath();
        octx.arc(cx, cy, 6, 0, Math.PI * 2);
        octx.fill();
        octx.restore();
    }

    function initFromImageCenter() {
        if (!sourceCanvas) return;
        const fallbackOuter = Math.min(sourceCanvas.width, sourceCanvas.height) * 0.32;
        initBullseyeFromDetection(null, fallbackOuter);
        applyRingsToSliders(sampleRingsFromOuter(bullseye.r));
        refreshGeometry();
    }

    function loadImageToCanvas(file) {
        return new Promise(function(resolve, reject) {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = function() {
                try {
                    const minDim = Math.min(img.width, img.height);
                    const scale = minDim < 500 ? 500 / minDim : 1;
                    const c = document.createElement('canvas');
                    c.width = Math.round(img.width * scale);
                    c.height = Math.round(img.height * scale);
                    const x = c.getContext('2d');
                    x.drawImage(img, 0, 0, c.width, c.height);
                    URL.revokeObjectURL(url);
                    resolve({ canvas: c, ctx: x });
                } catch (e) {
                    URL.revokeObjectURL(url);
                    reject(e);
                }
            };
            img.onerror = function() {
                URL.revokeObjectURL(url);
                reject(new Error('图片加载失败'));
            };
            img.src = url;
        });
    }

    function initBullseyeFromDetection(detected, fallbackOuter) {
        const outer = detected ? detected.r : fallbackOuter;
        const rings = detected && detected.rings
            ? detected.rings
            : defaultRingsFromOuter(outer);
        bullseye = {
            cx: detected ? detected.cx : sourceCanvas.width / 2,
            cy: detected ? detected.cy : sourceCanvas.height / 2,
            r: rings.outer,
            scale: rings.outer / RING_RATIO.outer,
            rings: rings
        };
        syncSlidersFromBullseye();
        centroids = computeCentroidsCustom(bullseye.cx, bullseye.cy, bullseye.rings);
    }

    async function loadImageFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        setStatus('加载图片中…');
        try {
            const { canvas: c, ctx: x } = await loadImageToCanvas(file);
            sourceCanvas = c;
            sourceCtx = x;
            canvasWrap.classList.remove('empty');

            updateSliderRanges();
            initFromImageCenter();
            redraw();
            requestAnimationFrame(function() { redraw(); });
            setStatus('已加载；请拖动对齐圆心与四环');
        } catch (e) {
            setStatus('加载失败：' + e.message);
        }
    }

    function collectGroundTruth() {
        const segments = {};
        for (let seg = 1; seg <= 17; seg++) {
            const raw = (document.getElementById('seg-' + seg).value || '').trim();
            if (raw === '') continue;
            const num = parseFloat(raw);
            if (!isNaN(num)) segments[String(seg)] = num;
        }
        const gsRaw = (document.getElementById('inputGs').value || '').trim();
        const gs = gsRaw === '' ? null : parseFloat(gsRaw);
        return {
            gs: isNaN(gs) ? null : gs,
            segments: segments
        };
    }

    function exportJson() {
        if (!sourceCanvas) {
            setStatus('请先加载截图');
            return;
        }
        bullseye = getBullseyeFromSliders();
        const gt = collectGroundTruth();
        const payload = {
            version: 1,
            createdAt: new Date().toISOString(),
            vendor: (document.getElementById('inputVendor').value || '').trim(),
            notes: (document.getElementById('inputNotes').value || '').trim(),
            imageSize: { width: sourceCanvas.width, height: sourceCanvas.height },
            imageDataUrl: sourceCanvas.toDataURL('image/png'),
            geometry: {
                cx: bullseye.cx,
                cy: bullseye.cy,
                r: bullseye.r,
                scale: bullseye.scale,
                rings: bullseye.rings
            },
            groundTruth: gt
        };

        const vendor = payload.vendor || 'bullseye';
        const date = new Date().toISOString().slice(0, 10);
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = vendor.replace(/[^\w\u4e00-\u9fff-]+/g, '_') + '_' + date + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        setStatus('已导出 JSON（含截图 ' + payload.imageSize.width + '×' + payload.imageSize.height + '）');
    }

    function importJson(file) {
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const data = JSON.parse(reader.result);
                if (!data.imageDataUrl) throw new Error('缺少 imageDataUrl');

                const img = new Image();
                img.onload = function() {
                    sourceCanvas = document.createElement('canvas');
                    sourceCanvas.width = img.width;
                    sourceCanvas.height = img.height;
                    sourceCtx = sourceCanvas.getContext('2d');
                    sourceCtx.drawImage(img, 0, 0);
                    canvasWrap.classList.remove('empty');
                    updateSliderRanges();

                    if (data.geometry) {
                        const g = data.geometry;
                        const rings = g.rings || defaultRingsFromOuter(g.r);
                        if (rings.apex == null && rings.inner != null) {
                            rings.apex = rings.inner * RING_RATIO.apex / RING_RATIO.inner;
                        }
                        bullseye = {
                            cx: g.cx,
                            cy: g.cy,
                            r: rings.outer,
                            scale: g.scale || rings.outer / RING_RATIO.outer,
                            rings: rings
                        };
                        syncSlidersFromBullseye();
                        centroids = computeCentroidsCustom(bullseye.cx, bullseye.cy, bullseye.rings);
                    }

                    document.getElementById('inputVendor').value = data.vendor || '';
                    document.getElementById('inputNotes').value = data.notes || '';
                    document.getElementById('inputGs').value =
                        data.groundTruth && data.groundTruth.gs != null ? String(data.groundTruth.gs) : '';

                    for (let seg = 1; seg <= 17; seg++) {
                        const el = document.getElementById('seg-' + seg);
                        const val = data.groundTruth && data.groundTruth.segments
                            ? data.groundTruth.segments[String(seg)]
                            : undefined;
                        el.value = val != null ? String(val) : '';
                    }

                    redraw();
                    setStatus('已导入标注：' + (data.vendor || '未命名'));
                };
                img.src = data.imageDataUrl;
            } catch (e) {
                setStatus('导入失败：' + e.message);
            }
        };
        reader.readAsText(file);
    }

    function canvasToSourceCoords(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (sourceCanvas.width / canvas.width);
        const y = (clientY - rect.top) * (sourceCanvas.height / canvas.height);
        return { x, y };
    }

    function bindEvents() {
        buildSegGrid();

        document.addEventListener('paste', function(e) {
            const items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    e.preventDefault();
                    loadImageFile(items[i].getAsFile());
                    return;
                }
            }
        });

        document.addEventListener('dragover', function(e) {
            if (e.dataTransfer.types.includes('Files')) e.preventDefault();
        });
        document.addEventListener('drop', function(e) {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                e.preventDefault();
                loadImageFile(file);
            }
        });

        canvas.addEventListener('mousedown', function(e) {
            if (!sourceCanvas) return;
            dragging = true;
            const p = canvasToSourceCoords(e.clientX, e.clientY);
            sliderCx.value = Math.round(p.x);
            sliderCy.value = Math.round(p.y);
            refreshGeometry();
        });
        window.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            const p = canvasToSourceCoords(e.clientX, e.clientY);
            sliderCx.value = Math.max(0, Math.min(sourceCanvas.width, Math.round(p.x)));
            sliderCy.value = Math.max(0, Math.min(sourceCanvas.height, Math.round(p.y)));
            refreshGeometry();
        });
        window.addEventListener('mouseup', function() { dragging = false; });

        canvas.addEventListener('wheel', function(e) {
            if (!sourceCanvas || !bullseye) return;
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.97 : 1.03;
            scaleAllRings(factor);
        }, { passive: false });

        [sliderCx, sliderCy, sliderROuter, sliderRMid, sliderRInner, sliderRApex].forEach(function(el) {
            el.addEventListener('input', refreshGeometry);
        });

        document.getElementById('btnResetRings').addEventListener('click', resetRingRatios);
        document.getElementById('btnApplyProfile').addEventListener('click', applySampleProfileRatios);

        document.getElementById('btnDetect').addEventListener('click', function() {
            if (!sourceCanvas) return;
            initFromImageCenter();
            setStatus('圆心已重置为图像中心（四环已按样本比例初始化）');
        });

        document.getElementById('btnExport').addEventListener('click', exportJson);
        document.getElementById('btnImport').addEventListener('click', function() {
            document.getElementById('fileImportJson').click();
        });
        document.getElementById('fileImportJson').addEventListener('change', function(e) {
            const f = e.target.files[0];
            if (f) importJson(f);
            e.target.value = '';
        });

        document.getElementById('btnClearSeg').addEventListener('click', function() {
            for (let seg = 1; seg <= 17; seg++) {
                document.getElementById('seg-' + seg).value = '';
            }
        });

        window.addEventListener('resize', function() {
            if (sourceCanvas) redraw();
        });
    }

    loadRingProfile().then(function() {
        bindEvents();
    });
})();
