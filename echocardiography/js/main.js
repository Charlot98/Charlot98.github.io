// 参数输入区域始终显示（已移除折叠功能）
document.addEventListener('DOMContentLoaded', function() {
    setupAutoHideScrollbars();

    // 确保输入框事件监听器已绑定
    setupInputListeners();
    setLeftSidebarInputPlaceholders();

    // 确保参数内容区域始终显示
    const parametersContent = document.getElementById('parametersContent');
    if (parametersContent) {
                parametersContent.style.display = 'block';
                parametersContent.classList.add('expanded');
    }

    // 页面加载时更新EA融合输入框的显示状态
    updateEAFusionVisibility();
    updateMaxLadVisibility();
    updateLaVolumeVisibility();

    // 页面加载时检查 EA融合 的值，更新 E、A、E/A 输入框状态
    updateEAInputsState();

    // 页面加载时检查E值、E/A的颜色显示
    updateEColor();
    updateEAColor();
    calculateEOverEPrime();
    updateEOverEPrimeColor();
    calculateAtOverEt();

    // 页面加载时检查 EA融合 的颜色显示
    updateEAFusionColor();

    // 页面加载时检查辛普森输入框的显示状态
    toggleSimpsonInputs();

    // 页面加载时检查IVSd和LVWs的颜色显示
    updateIVSdAndLVWsColor();

    // 页面加载时检查LA/AO的颜色显示
    updateLAOverAOColor();
    updateMaxLadColor();
    updatePAOverAoColor();
    updateRPADColor();

    // 页面加载时初始化反流速输入框的压力差和颜色
    ['二尖瓣反流速', '三尖瓣反流速', '肺动脉瓣反流速', '主动脉瓣反流速'].forEach(paramName => {
        const input = document.querySelector(`input[data-param="${paramName}"]`);
        if (input && input.value) {
            updateRegurgitationPressure(paramName, input.value);
        }
    });
    updateRegurgitationVelocityColor();

    // 页面加载时默认选择"正常"
    const normalButton = document.querySelector('.disease-tag[data-value="Normal"]');
    if (normalButton) {
        // 模拟点击事件，触发所有相关逻辑
        normalButton.click();
            } else {
        // 如果按钮不存在，直接调用处理函数
        handleDiseaseTypeChange('Normal');
    }

    // 初次加载完成：允许之后的自动逻辑，但本需求要求"默认不激活"
    suppressInitialSimpsonAutoActivation = false;
    simpsonEnabled = false;
    const initSimpsonButton = document.getElementById('simpsonButton');
    if (initSimpsonButton) initSimpsonButton.classList.remove('active');
    toggleSimpsonInputs();

    // 默认不激活「右心高阶」
    rightHeartAdvancedEnabled = false;
    const rhInitBtn = document.getElementById('rightHeartAdvancedButton');
    if (rhInitBtn) rhInitBtn.classList.remove('active');
    delete parameters['右心高阶'];
    toggleRightHeartAdvancedInputs();

    leftHeartAdvancedEnabled = false;
    const lhInitBtn = document.getElementById('leftHeartAdvancedButton');
    if (lhInitBtn) lhInitBtn.classList.remove('active');
    delete parameters['左心高阶'];
    leftHeartAdvancedOnlyEnabled = false;
    delete parameters['仅左心高阶'];
    toggleLeftHeartAdvancedInputs();

    calculateTapseOverAo();
    generateTemplate();

    // 与 rAF 错开的首帧对齐：DOMContentLoaded 末尾顶栏布局已稳定，立即同步避免提示先出现在默认位再跳动
    if (window.syncClearHintWithTopBar) window.syncClearHintWithTopBar();

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            if (window.syncClearHintWithTopBar) window.syncClearHintWithTopBar();
        });
    });

    // 复制功能
    // 为每个按钮保存原始内容和定时器
    const buttonTimers = new Map();
    const buttonOriginalContent = new Map();

    function markRefreshButtonAfterSuccessfulCopy() {
        const rb = document.getElementById('refreshButton');
        if (rb) rb.classList.add('refresh-button--post-copy');
    }

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
                markRefreshButtonAfterSuccessfulCopy();

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
                markRefreshButtonAfterSuccessfulCopy();

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

    // 右侧栏「所见 / 结论」：双击进入编辑，失焦或 Esc 恢复只读；复制始终取当前 .value（含手动修改）
    function setupRightSidebarTemplateEditMode(textarea) {
        if (!textarea) return;
        textarea.addEventListener('dblclick', function (e) {
            e.preventDefault();
            if (!textarea.readOnly) return;
            textarea.readOnly = false;
            textarea.classList.add('template-text--editing');
            textarea.focus();
        });
        textarea.addEventListener('input', function () {
            if (!textarea.readOnly) {
                if (textarea.id === 'findingsText') setRightSidebarTemplateUserLocked('findings', true);
                else if (textarea.id === 'conclusionText') setRightSidebarTemplateUserLocked('conclusion', true);
            }
        });
        textarea.addEventListener('blur', function () {
            textarea.readOnly = true;
            textarea.classList.remove('template-text--editing');
        });
        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                textarea.blur();
            }
        });
    }

    // 绑定复制按钮事件
    const copyFindingsBtn = document.getElementById('copyFindingsBtn');
    const copyConclusionBtn = document.getElementById('copyConclusionBtn');
    const findingsText = document.getElementById('findingsText');
    const conclusionText = document.getElementById('conclusionText');

    if (copyFindingsBtn && findingsText) {
        setupRightSidebarTemplateEditMode(findingsText);
        copyFindingsBtn.addEventListener('click', function() {
            copyToClipboard(findingsText.value, copyFindingsBtn);
        });
    }

    if (copyConclusionBtn && conclusionText) {
        setupRightSidebarTemplateEditMode(conclusionText);
        copyConclusionBtn.addEventListener('click', function() {
            copyToClipboard(conclusionText.value, copyConclusionBtn);
        });
    }

    // 重新生成按钮：解锁并重新同步
    const regenFindingsBtn = document.getElementById('regenerateFindingsBtn');
    if (regenFindingsBtn) {
        regenFindingsBtn.addEventListener('click', function () {
            setRightSidebarTemplateUserLocked('findings', false);
            generateTemplate();
        });
    }
    const regenConclusionBtn = document.getElementById('regenerateConclusionBtn');
    if (regenConclusionBtn) {
        regenConclusionBtn.addEventListener('click', function () {
            setRightSidebarTemplateUserLocked('conclusion', false);
            generateTemplate();
        });
    }

});

/** 滚动条默认隐藏，滚动时短暂显示 */
function setupAutoHideScrollbars() {
    document.querySelectorAll('.auto-hide-scrollbar').forEach(function(el) {
        if (el.dataset.autoHideScrollbarBound === '1') return;
        el.dataset.autoHideScrollbarBound = '1';
        var timer = null;
        el.addEventListener('scroll', function() {
            el.classList.add('is-scrolling');
            clearTimeout(timer);
            timer = setTimeout(function() {
                el.classList.remove('is-scrolling');
            }, 800);
        }, { passive: true });
    });
}
