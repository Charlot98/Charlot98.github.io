// 右侧提示层（固定于视口默认右侧栏区域）就绪后显示
function syncClearHintWithTopBar() {
    const snipHint = document.querySelector('.right-sidebar-snip-hint');
    const layer = document.getElementById('rightSidebarHintsLayer');
    if (!snipHint || !layer) return;
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        layer.classList.remove('is-ready');
        return;
    }
    layer.classList.add('is-ready');
}

window.syncClearHintWithTopBar = syncClearHintWithTopBar;

window.addEventListener('resize', function () {
    requestAnimationFrame(function () {
        if (window.syncClearHintWithTopBar) window.syncClearHintWithTopBar();
    });
});

function clearLegacyHintStorage() {
    try {
        window.localStorage.removeItem('rightSidebarClearHintLeft');
        window.localStorage.removeItem('rightSidebarClearHintTop');
        window.localStorage.removeItem('rightSidebarSnipHintLeft');
        window.localStorage.removeItem('rightSidebarSnipHintTop');
    } catch (_) {}
}

(function setupHintsLayerReadyHooks() {
    function scheduleSync() {
        requestAnimationFrame(syncClearHintWithTopBar);
    }
    window.addEventListener('load', scheduleSync, { once: true });
    document.addEventListener('DOMContentLoaded', scheduleSync, { once: true });
})();

// 点击「清空」时播放图标快速旋转两圈
function playRefreshIconSpin(button) {
    if (!button) return;
    const icon = button.querySelector('.refresh-icon');
    if (!icon) return;
    button.classList.remove('refresh-button--spin-once');
    void button.offsetWidth;
    button.classList.add('refresh-button--spin-once');
    const done = () => {
        button.classList.remove('refresh-button--spin-once');
    };
    icon.addEventListener('animationend', done, { once: true });
    window.setTimeout(done, 450);
}

// 设置「清空」按钮：清空已填写数据，并激活「正常」
function setupRefreshButton() {
    const refreshButton = document.getElementById('refreshButton');
    if (!refreshButton) return;
    clearLegacyHintStorage();

    refreshButton.addEventListener('click', async function () {
        refreshButton.classList.remove('refresh-button--post-copy');
        playRefreshIconSpin(refreshButton);

        Object.keys(parameters).forEach(k => delete parameters[k]);
        selectedReferenceWeight = null;
        simpsonDataCache = {};
        Object.keys(regurgitationVelocityCache).forEach(k => delete regurgitationVelocityCache[k]);

        const ocrStatus = document.getElementById('ocrStatus');
        if (ocrStatus) {
            ocrStatus.textContent = '可直接粘贴截图到页面，支持自动识别和回填';
        }

        document.querySelectorAll('input[type="text"]').forEach(el => { el.value = ''; });
        document.querySelectorAll('textarea').forEach(el => { el.value = ''; });
        clearRatioBubbleManualFlags();
        document.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
        selectedReferenceRange = '';
        document.querySelectorAll('.regurgitation-severity-btn').forEach(btn => { btn.classList.remove('active'); });
        const rhythmBtn = document.getElementById('rhythmIrregularButton');
        if (rhythmBtn) rhythmBtn.classList.remove('active');
        delete parameters['节律不齐'];
        handleDiseaseTypeChange('Normal');
        const dpdtShowBtn = document.querySelector('#dpdtInputItem button[data-param="dp/dt显示"][data-value="显示"]');
        if (dpdtShowBtn) dpdtShowBtn.classList.remove('active');
        delete parameters['dp/dt显示'];

        const laVolumeShowBtn = document.querySelector('#laVolumeInputItem button[data-param="LA Volume显示"][data-value="显示"]');
        if (laVolumeShowBtn) laVolumeShowBtn.classList.remove('active');
        delete parameters['LA Volume显示'];

        calculateLAVi();
        calculateEDVI();
        calculateESVI();
        calculateLVIDDN();
        calculateAtOverEt();
        calculateTapseOverAo();

        const simpsonButton = document.getElementById('simpsonButton');
        simpsonEnabled = false;
        if (simpsonButton) simpsonButton.classList.remove('active');
        toggleSimpsonInputs();

        rightHeartAdvancedEnabled = false;
        const rightHeartBtn = document.getElementById('rightHeartAdvancedButton');
        if (rightHeartBtn) rightHeartBtn.classList.remove('active');
        delete parameters['右心高阶'];
        toggleRightHeartAdvancedInputs();

        leftHeartAdvancedEnabled = false;
        const leftHeartBtn = document.getElementById('leftHeartAdvancedButton');
        if (leftHeartBtn) leftHeartBtn.classList.remove('active');
        delete parameters['左心高阶'];
        leftHeartAdvancedOnlyEnabled = false;
        delete parameters['仅左心高阶'];
        lvStrainSegmentValues = {};
        clearLvStrainSegmentColors();
        toggleLeftHeartAdvancedInputs();

        unlockRightSidebarTemplateText();
        generateTemplate();
    });

    requestAnimationFrame(function () {
        requestAnimationFrame(syncClearHintWithTopBar);
    });
}
