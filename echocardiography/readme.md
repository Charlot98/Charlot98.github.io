# 心超报告生成器（`echocardiography_dev`）

浏览器内使用的静态单页应用：左侧录入参数与选项，右侧生成「所见 / 结论」文本；数据来自本地 `docs/` 下的 CSV 与 Markdown 模板。

---

## 文件解释（树形）

```text
echocardiography_dev/
├── index.html                 页面入口：顶栏疾病/参考、左侧参数区（含 MMVD/HCM/DCM 专块）、
│                              瓣口与 HCM 标签、右侧所见/结论、固定背景层提示（清空/截图）、Tesseract CDN
├── styles.css                 全局样式（双栏布局、表单、右栏文本框、提示层、HCM 标签行等）
├── readme.md                  本说明
├── changelog.md               功能更新记录
├── sketching.md               部分疾病结论文案草稿（如 HCM），实现以 JS 规则为准
│
├── js/                        业务逻辑（按模块拆分；index.html 固定顺序加载，共享全局变量与函数）
│   ├── globals.js             全局状态：parameters、csvReferenceData、breedReferenceData 等
│   ├── utils.js               通用工具：格式化、字符串宽度、CSV 列别名、fetch 读 UTF-8 等
│   ├── data-loader.js         参考 CSV、品种表、健康结论模板（Normal 结论分支用）
│   ├── template-loader.js     模板缓存键、辛普森按钮显隐等（所见/结论主逻辑在 findings/conclusion）
│   ├── reference-values.js    按参考范围/体重刷新输入旁参考值
│   ├── calculations.js        派生指标：LAVi、EDVI、ESVI、LVIDDN、SI、E/A、瓣口压差与标色等
│   ├── ui-inputs.js           左侧输入监听、参数同步、自动计算触发（含 DCM 的 SI=长度/宽度）
│   ├── refresh.js             顶栏「清空」：重置参数/疾病/开关并刷新模板
│   ├── resize.js              右侧栏拖拽缩放
│   ├── ocr.js                 粘贴/拖拽图片 → Tesseract 识别 → 回填参数
│   ├── disease-selector.js    疾病/参考切换、MMVD·HCM·DCM 专块显隐、瓣口默认标签、顶栏辛普森等
│   ├── right-heart.js         「右心高阶」开关与 PA/Ao、FAC 等区块
│   ├── valve-tags.js          瓣口血流标签、反流速/程度、未测得逻辑；HCM 的 SAM / 左心室流出道湍流标签
│   ├── template-findings.js   所见生成：generateFindingsText（Normal/MMVD/HCM/PDA/DCM 等规则）
│   ├── template-conclusion.js 结论生成：generateConclusionText（腔室大小、HCM/PDA/DCM 规则等）
│   ├── template-config.js     templateConfig 入口，委托上述 findings / conclusion
│   ├── generate-template.js   调用 templateConfig 写入右侧 textarea
│   └── main.js                初始化默认「正常」、复制按钮、右栏编辑态等
│
└── docs/
    ├── reference_interval/    按体重或品种的参考值表（运行时由 data-loader 加载）
    │   ├── m_type_reference.csv            犬≤3kg 参考（按 kg）
    │   ├── non_m_type_reference.csv        犬＞3kg 参考（按 kg）
    │   ├── cat_echo_weight_reference.csv   猫（含体重）参考（按 kg）
    │   └── breed_reference.csv             猫 / 金毛 / 兔 等品种列
    │
    └── md/                    疾病所见/结论规格稿（供对照维护；当前生成逻辑在 JS，改 md 不会自动生效）
        ├── 04_dog_PDA.md
        ├── 04_dog_golden_PDA.md
        ├── 06_dog_PH_RV_enlargement.md
        ├── 08_cat_HCM.md
        ├── 09_cat_RCM.md
        └── 10_cat_TOF.md

```

---

## 脚本加载顺序（与 `index.html` 一致）

依赖关系为**自上而下**：先 `globals` / `utils`，再数据与模板，再计算与 UI，再 `template-findings` / `template-conclusion` / `template-config`，最后 `generate-template`、`main`。

1. `globals.js`  
2. `utils.js`  
3. `data-loader.js`  
4. `template-loader.js`  
5. `reference-values.js`  
6. `calculations.js`  
7. `ui-inputs.js`  
8. `refresh.js`  
9. `resize.js`  
10. `ocr.js`  
11. `disease-selector.js`  
12. `right-heart.js`  
13. `valve-tags.js`  
14. `template-findings.js`  
15. `template-conclusion.js`  
16. `template-config.js`  
17. `generate-template.js`  
18. `main.js`  

---

## 外部依赖

- **Tesseract.js**：由 `index.html` 从 `unpkg.com` 引入，用于 OCR；首次使用通常需联网加载 worker/语言包。

---

## 运行方式

在仓库本目录下用任意静态服务器打开（需能访问 `docs/` 相对路径），例如：

`http://127.0.0.1:端口/echocardiography_dev/index.html`

局域网访问请使用真实 `192.168.x.x`，勿使用 `198.18.x.x` 等虚拟网卡地址。
