// 参数数据存储
const parameters = {};

// 不同品种参考值数据存储
let breedReferenceData = null;
// 健康结论内容存储（默认值，后续可由 JS 模板覆盖）
let healthConclusionText = '  1.心脏各心室大小、各瓣口血流、各室壁厚度未见明显异常。\n  2.心脏收缩、舒张功能未见明显异常。';
// 健康结论模板内容存储（null = 直接使用 healthConclusionText）
let healthConclusionTemplate = null;
// 反流模板内容存储（后续改为 JS 内联）
let regurgitationTemplates = {
    '1.MV': null,
    '2.TV': null,
    '3.PV': null,
    '4.AV': null
};

// CSV参考数据存储（按类型分别存储）
let csvReferenceData = {
    '犬≤3kg': null,
    '犬＞3kg': null,
    '猫（含体重）': null
};

// 跟踪选中的参考体重（用于参考范围查找，不影响输入框）
let selectedReferenceWeight = null;

// 右侧栏所见/结论：用户手动编辑后，左侧参数更新不再自动覆盖对应文本框
let rightSidebarFindingsUserLocked = false;
let rightSidebarConclusionUserLocked = false;

