
// 含辛普森测量按钮状态
let simpsonEnabled = false;
// 右心高阶测量（后续 TAPSE / PA/Ao 等字段依赖此开关）
let rightHeartAdvancedEnabled = false;
// 首次加载时：抑制脚本自动激活"含辛普森测量"（让按钮默认不激活）
let suppressInitialSimpsonAutoActivation = true;

// 辛普森数据缓存：按「疾病类型_参考范围」存储，切换疾病/参考/辛普森按钮时保留，刷新清空时清除
let simpsonDataCache = {};

// 瓣口反流速数据缓存：切换瓣口反流状态时保留输入内容，下次激活时恢复；刷新时清空
const regurgitationVelocityCache = {};

/** 肺动脉瓣/主动脉瓣默认「微量」，二尖瓣/三尖瓣默认「轻度」（与 index 中程度按钮初始态一致） */
function getDefaultRegurgitationSeverityForParam(severityParamName) {
    if (severityParamName === '肺动脉瓣反流程度' || severityParamName === '主动脉瓣反流程度') return '微量';
    return '轻度';
}

/**
 * 将当前反流条目的程度按钮状态同步进 parameters。
 * 修复：缓存无 severity 仍 return true 跳过初始化、或仅 DOM 默认「轻度」未写入 parameters 时，
 * 模板/所见/结论出现「二尖瓣反流」而无「轻度」等程度。
 */
function ensureRegurgitationSeverityParameters(inputItem) {
    if (!inputItem) return;
    const severityButtons = inputItem.querySelector('.regurgitation-severity-buttons');
    if (!severityButtons) return;
    const severityParamName = severityButtons.getAttribute('data-param');
    if (!severityParamName) return;
    let activeBtn = severityButtons.querySelector('.regurgitation-severity-btn.active');
    if (!activeBtn) {
        const def = getDefaultRegurgitationSeverityForParam(severityParamName);
        const defaultBtn = severityButtons.querySelector(`.regurgitation-severity-btn[data-value="${def}"]`);
        if (defaultBtn) {
            severityButtons.querySelectorAll('.regurgitation-severity-btn').forEach((btn) => btn.classList.remove('active'));
            defaultBtn.classList.add('active');
            activeBtn = defaultBtn;
        }
    }
    if (activeBtn) {
        const v = activeBtn.getAttribute('data-value');
        if (v) parameters[severityParamName] = v;
    }
}

// 更新含辛普森测量按钮的显示状态
function updateSimpsonButtonVisibility() {
    const simpsonButton = document.getElementById('simpsonButton');
    if (simpsonButton) {
        // 按钮始终显示
            simpsonButton.style.display = 'block';
    }
    const rightHeartBtn = document.getElementById('rightHeartAdvancedButton');
    if (rightHeartBtn) {
        rightHeartBtn.style.display = 'block';
    }
}

// 页面加载时读取CSV和健康结论
loadCSVData();
loadMTypeCSVData();
loadCatEchoCSVData();
loadBreedReferenceData();
