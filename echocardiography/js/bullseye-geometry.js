/**
 * 牛眼图四环几何：节段质心、环比例配置（OCR 与标注工具共用）
 */
const BULLSEYE_WEDGE_ANGLES = [
    { seg: 1, midSeg: 7,  startDeg: 300, endDeg: 360 },
    { seg: 2, midSeg: 8,  startDeg: 240, endDeg: 300 },
    { seg: 3, midSeg: 9,  startDeg: 180, endDeg: 240 },
    { seg: 4, midSeg: 10, startDeg: 120, endDeg: 180 },
    { seg: 5, midSeg: 11, startDeg: 60,  endDeg: 120 },
    { seg: 6, midSeg: 12, startDeg: 0,   endDeg: 60  }
];
const BULLSEYE_QUAD_ANGLES = [
    { seg: 13, startDeg: 270, endDeg: 360 },
    { seg: 14, startDeg: 180, endDeg: 270 },
    { seg: 15, startDeg: 90,  endDeg: 180 },
    { seg: 16, startDeg: 0,   endDeg: 90  }
];

/** 环比例配置：由标注样本校准 */
const BULLSEYE_RING_PROFILES = {
    standard: {
        label: 'AHA 标准',
        ratios: { mid: 63 / 88, inner: 37 / 88, apex: 12 / 88 }
    },
    'ge-e90': {
        label: 'GE E90',
        ratios: { mid: 0.6627, inner: 0.3353, apex: 0.1652 }
    }
};

/** 默认 OCR 使用 GE E90 校准（可由标注样本覆盖） */
let BULLSEYE_DEFAULT_PROFILE = 'ge-e90';

function bullseyeRingsFromOuter(outerR, profileKey) {
    const key = profileKey || BULLSEYE_DEFAULT_PROFILE;
    const profile = BULLSEYE_RING_PROFILES[key] || BULLSEYE_RING_PROFILES['ge-e90'];
    const r = Number(outerR);
    return {
        outer: r,
        mid: r * profile.ratios.mid,
        inner: r * profile.ratios.inner,
        apex: r * profile.ratios.apex
    };
}

function bullseyeApplyRingProfile(bullseye, profileKey) {
    const key = profileKey || BULLSEYE_DEFAULT_PROFILE;
    bullseye.profileKey = key;
    bullseye.rings = bullseyeRingsFromOuter(bullseye.r, key);
    bullseye.scale = bullseye.r / 88;
    return bullseye;
}

function bullseyePolarXY(cx, cy, deg, radius) {
    const rad = deg * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function bullseyeComputeCentroids(bullseye) {
    const cx = bullseye.cx;
    const cy = bullseye.cy;
    const rings = bullseye.rings || bullseyeRingsFromOuter(bullseye.r, bullseye.profileKey);
    const centroids = {};
    const rBasal = (rings.mid + rings.outer) / 2;
    const rMidSeg = (rings.inner + rings.mid) / 2;
    const rApical = (rings.apex + rings.inner) / 2;

    BULLSEYE_WEDGE_ANGLES.forEach(function(w) {
        const midDeg = (w.startDeg + w.endDeg) / 2;
        centroids[w.seg] = bullseyePolarXY(cx, cy, midDeg, rBasal);
        centroids[w.midSeg] = bullseyePolarXY(cx, cy, midDeg, rMidSeg);
    });
    BULLSEYE_QUAD_ANGLES.forEach(function(q) {
        const midDeg = (q.startDeg + q.endDeg) / 2;
        centroids[q.seg] = bullseyePolarXY(cx, cy, midDeg, rApical);
    });
    centroids[17] = { x: cx, y: cy };
    return centroids;
}

function bullseyeAngleToWedgeSeg(angleDeg, midOffset) {
    if (angleDeg >= 300) return 1 + midOffset;
    if (angleDeg < 60) return 6 + midOffset;
    if (angleDeg < 120) return 5 + midOffset;
    if (angleDeg < 180) return 4 + midOffset;
    if (angleDeg < 240) return 3 + midOffset;
    return 2 + midOffset;
}

function bullseyeAngleToApicalSeg(angleDeg) {
    if (angleDeg >= 270) return 13;
    if (angleDeg >= 180) return 14;
    if (angleDeg >= 90) return 15;
    return 16;
}

function bullseyeWordToSegment(wx, wy, bullseye) {
    const rings = bullseye.rings || bullseyeRingsFromOuter(bullseye.r, bullseye.profileKey);
    const dx = wx - bullseye.cx;
    const dy = wy - bullseye.cy;
    const dist = Math.hypot(dx, dy);
    const rNorm = dist / rings.outer;
    if (rNorm > 1.1 || rNorm < 0.03) return null;

    let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    const apexNorm = rings.apex / rings.outer;
    const innerNorm = rings.inner / rings.outer;
    const midNorm = rings.mid / rings.outer;

    if (rNorm <= apexNorm * 1.25) return 17;
    if (rNorm <= innerNorm * 1.08) return bullseyeAngleToApicalSeg(angleDeg);
    if (rNorm <= midNorm * 1.08) return bullseyeAngleToWedgeSeg(angleDeg, 6);
    return bullseyeAngleToWedgeSeg(angleDeg, 0);
}

/** 从 samples/*.json 加载并注册环比例配置 */
async function bullseyeLoadRingProfile(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return false;
        const data = await res.json();
        if (!data.id || !data.ringRatios) return false;
        BULLSEYE_RING_PROFILES[data.id] = {
            label: data.label || data.id,
            ratios: data.ringRatios
        };
        BULLSEYE_DEFAULT_PROFILE = data.id;
        return true;
    } catch (_) {
        return false;
    }
}
