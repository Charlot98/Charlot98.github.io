# 目标
在保持“所见/结论”整体风格不变的前提下，把当前依赖 Markdown 模板的逻辑逐步改造成 **AI/程序可维护** 的规则系统：
- `所见`：按固定顺序两列对齐输出
- `结论`：不再写死模板句子，按规则自动生成、自动编号、按重要等级排序

# 1）参数同义词字典（机器友好）
建议把所有测量字段统一成 **标准键（canonical key）**，并提供同义词列表（中文/英文/常见缩写/常见拼写错误）。后续 OCR、模板替换、参考值匹配都只认标准键。

下面用 YAML 表达（推荐实现时直接转成 JS 对象或 JSON）：

```yaml
measurements:
  IVSd:
    display: "IVSd"
    phase: "diastole"
    unit: "mm"
    synonyms:
      - "IVSd"
      - "舒张末期室间隔厚度"
      - "舒张期室间隔厚度"
  LVDd:
    display: "LVDd"
    phase: "diastole"
    unit: "mm"
    synonyms:
      - "LVDd"
      - "LVIDd"
      - "舒张末期左心室内径"
      - "舒张期左心室内径"
      - "舒张期左心室直径"
      - "舒张末期左心室直径"
  LVWd:
    display: "LVWd"
    phase: "diastole"
    unit: "mm"
    synonyms:
      - "LVWd"
      - "LVFWd"
      - "舒张末期左心室游离壁厚度"
      - "舒张期左心室游离壁厚度"
  IVSs:
    display: "IVSs"
    phase: "systole"
    unit: "mm"
    synonyms:
      - "IVSs"
      - "收缩期室间隔厚度"
      - "收缩末期室间隔厚度"
  LVDs:
    display: "LVDs"
    phase: "systole"
    unit: "mm"
    synonyms:
      - "LVDs"
      - "LVIDs"
      - "收缩末期左心室内径"
      - "收缩期左心室内径"
      - "收缩末期左心室直径"
      - "收缩期左心室直径"
  LVWs:
    display: "LVWs"
    phase: "systole"
    unit: "mm"
    synonyms:
      - "LVWs"
      - "LVFWs"
      - "收缩末期左心室游离壁厚度"
      - "收缩期左心室游离壁厚度"
  EDV_teich:
    display: "EDV (Teich)"
    phase: "diastole"
    unit: "ml"
    synonyms:
      - "EDV"
      - "EDV(teich)"
      - "舒张末期容积（ml）"
      - "舒张末期容积"
      - "EDVml"
      - "舒张末期左心室容量"
      - "舒张期左心室容量"
      - "舒张期左室容量"
      - "舒张末期左室容量"
      - "End-Diastolic Volume"
      - "End-Diastolic Volome"
  EDV_simpson:
    display: "EDV (Simpson)"
    phase: "diastole"
    unit: "ml"
    synonyms:
      - "EDV(simpson)"
      - "EDV（辛普森）"
      - "舒张末期容积的改良辛普森法"
      - "舒张末期容积辛普森法"
      - "舒张末期容积（辛普森）"
  ESV_teich:
    display: "ESV (Teich)"
    phase: "systole"
    unit: "ml"
    synonyms:
      - "ESV"
      - "ESV(teich)"
      - "收缩末期容积（ml）"
      - "收缩末期容积"
      - "ESVml"
      - "收缩末期左心室容量"
      - "收缩期左心室容量"
      - "收缩期左室容量"
      - "收缩末期左室容量"
      - "End-Systolic Volume"
      - "End-systolic Volome"
  ESV_simpson:
    display: "ESV (Simpson)"
    phase: "systole"
    unit: "ml"
    synonyms:
      - "ESV(simpson)"
      - "ESV（辛普森）"
      - "收缩末期容积的改良辛普森法"
      - "收缩末期容积辛普森法"
      - "收缩末期容积（辛普森）"
  EDVI:
    display: "EDVI"
    unit: "ml/m2"
    synonyms:
      - "EDVI"
      - "舒张末期容积指数"
      - "EDVI（ml/m2）"
      - "End-Diastolic Volume Index"
      - "End-Diatolic Volume Index"
  ESVI:
    display: "ESVI"
    unit: "ml/m2"
    synonyms:
      - "ESVI"
      - "收缩末期容积指数"
      - "ESVI（ml/m2）"
      - "End-Systolic Volume Index"
  FS:
    display: "FS"
    unit: "%"
    synonyms:
      - "FS"
      - "缩短分数"
      - "FS（%）"
      - "Fractional Shortening"
  EF_teich:
    display: "EF"
    unit: "%"
    synonyms:
      - "EF"
      - "EF(teich)"
      - "射血分数"
      - "左心室射血分数"
      - "LVEF"
      - "Left Ventricular Ejection Fraction"
      - "Ejection Fraction"
```

实现建议（不写代码时也可当规范使用）：
- **优先匹配**：同义词匹配时按“更长更具体”优先（避免 `EDV` 抢走 `EDV(simpson)`）
- **单位换算**：若 OCR 识别到 `cm`，统一换算为 `mm`（如适用）

# 2）所见（1.M-MODE/2D）两列排版规则
- **总体目标**：不依赖固定 Markdown 模板字符串；按规则生成，可稳定对齐
- **顺序（两列输出按此顺序填充）**：
  - IVSd、LVDd、LVWd、IVSs、LVDs、LVWs、EDV、ESV、EDVI、ESVI、FS、EF
- **两列布局**（保持现有视觉顺序不变）：
  mmode_2col_rows:
    - left:  IVSd
      right: LVDd
    - left:  LVWd
      right: IVSs
    - left:  LVDs
      right: LVWs
    - left:  [EDV_teich, EDV_simpson]
      right: [ESV_teich, ESV_simpson]
    - left:  EDVI
      right: ESVI
    - left:  FS
      right: EF_teich

# 3）结论生成规则（不依赖模板写死句子）
- **编号**：自动编号；保持现有结论缩进风格
- **排序**：按重要等级升序（数字越小越靠前）

## 3.1 分类：各瓣口血流
```yaml
conclusion_rules:
  category: "各瓣口血流"
  items:
    - key: "MV_regurg"
      priority: 2
      text: "{瓣名}{反流程度}反流"
      valve: "二尖瓣"
      extra:
        - when: "二尖瓣反流速 > 6.5"
          append: "收缩压偏高，建议排查高血压。"
    - key: "TV_regurg"
      priority: 3
      text: "{瓣名}{反流程度}反流"
      valve: "三尖瓣"
      extra:
        - when: "三尖瓣反流速 > 3.0"
          append: "疑肺动脉高压。"
        - when: "三尖瓣反流速 > 3.4"
          append: "肺动脉高压。"
    - key: "PV_regurg"
      priority: 4
      text: "{瓣名}{反流程度}反流"
      valve: "肺动脉瓣"
    - key: "AV_regurg"
      priority: 4
      text: "{瓣名}{反流程度}反流"
      valve: "主动脉瓣"
```

结论分为 2 部分（按顺序输出）：
1）第 1 部分：各瓣口血流、各腔室大小、室壁厚度
2）第 2 部分：左心室收缩功能、舒张功能

---

## 第 1 部分：各瓣口血流 / 室壁厚度 / 各腔室大小

- 总体原则：这三类中**任意一类有异常**，都单独一行描述；其他正常部分可合并或省略。
- 正常时（所有三类均正常）：
  - 输出一行：  
    `1.心脏各腔室大小、室壁厚度、各瓣口血流未见明显异常。`

- 若**仅瓣口血流异常**（腔室大小、室壁厚度正常）：
  - 输出两行，例如：  
    `1.二尖瓣轻度反流。`  
    `2.心脏各腔室大小、室壁厚度未见明显异常。`

- 若**存在“容量/结构”类异常**（例如 EDVI 升高、LVDDN 升高、LA/AO 升高），可以单独一行概括：
  - 左心室容量过载（容量异常）：  
    - 触发条件（任一满足）：  
      - `EDVI > 100`  
      - `LVDDN ≥ 1.7`  
    - 建议文案示例：  
      `左心室容量过载，其余各腔室大小尚可。`
  - 左心房增大：  
    - 条件：`LA/Ao ≥ 1.6`  
    - 文案示例：  
      `左心房增大，其余各腔室大小尚可。`

- 特殊“血流 + 压力”标记（附加在对应反流结论后）：
  - 二尖瓣反流速 `> 6.5 m/s`：  
    在该行最后追加  
    `收缩期高压，建议排查高血压。`
  - 三尖瓣反流速 `> 3.0 m/s` 且 `< 3.4 m/s`：  
    追加 `疑肺动脉高压。`
  - 三尖瓣反流速 `≥ 3.4 m/s`：  
    追加 `肺动脉高压。`（如需，可再追加“肺动脉增粗。”）

### 第 1 部分格式示例

- 示例 1（仅有瓣口血流异常）  
  `1.二尖瓣轻度反流。`  
  `2.心脏各腔室大小、室壁厚度未见明显异常。`

- 示例 2（容量异常 + 其他腔室尚可；不必重复“室壁厚度未见明显异常”）  
  `1.二尖瓣轻度反流。`  
  `2.左心室容量过载，其余各腔室大小尚可。`

- 示例 3（合并血流 + 高压提示）  
  `1.二尖瓣中度反流；收缩期高压，建议排查高血压。`  
  `2.心脏各腔室大小、室壁厚度未见明显异常。`

---

## 第 2 部分：左心室收缩 / 舒张功能

- 这一部分**始终保留一句话**，放在第 1 部分后面（可以视为结论的“功能总结”）。
- 正常时：  
  `左心室收缩、舒张功能未见明显异常。`
- 如有异常，则在同一行中描述收缩/舒张功能：

  - 舒张功能下降的触发条件（任一满足）：
    - `E/A < 1`
    - `E/E' > 11`  
    示例文案：  
    `左心室收缩功能未见明显异常，舒张功能下降。`

  - 收缩功能下降的触发条件（基于 ESVI）：
    - `35 ≤ ESVI < 50`：提示“左心室收缩功能轻度下降。”  
    - `ESVI ≥ 50`：提示“左心室收缩功能下降。”  
    可与舒张功能合并描述，例如：  
    `左心室收缩功能轻度下降，舒张功能下降。` 或  
    `左心室收缩功能下降，舒张功能未见明显异常。`

    - 舒张功能失代偿
      - 条件：E/A＞2
    - 示例文案：
      - `左心室收缩功能尚可，舒张功能失代偿`


### 第 2 部分格式示例

- 示例 1（舒张功能下降）：  
  `1.左心室收缩功能未见明显异常，舒张功能下降。`

- 示例 2（收缩和舒张均正常）：  
  `1.左心室收缩、舒张功能未见明显异常。`

- 示例 3（收缩功能下降）：  
  `1.左心室收缩功能下降，舒张功能尚可。`


  继续微调
  如果二尖瓣反流速＞6.5m/s，则二尖瓣反流结论单独列出，并追加“收缩压偏高，建议排查高血压”
  结论整体示例：
  1. 二尖瓣中度反流；收缩期高压，建议排查高血压。
  2. 三尖瓣微量反流。
  3. 左心室收缩、舒张功能尚可。


MMVD疾病模型下

脱垂程度，默认选择`轻度`

脱垂旁边新增小按钮，“疑部分腱索断裂”、“腱索断裂”；



所见：
2.瓣膜异常：二尖瓣前叶增厚（较厚处约：{二尖瓣前叶厚度}mm）、{脱垂程度}脱垂。

如果“疑部分腱索断裂”，则在所见追加：“二尖瓣前叶可见游离强回声亮线”，在结论中追加：“疑部分腱索断裂”。

如果“部分腱索断裂”，则在所见追加：“二尖瓣前叶可见游离强回声亮线”，在结论中追加：“部分腱索断裂”。

结论：
1. 二尖瓣退行性病变：二尖瓣前叶增厚、{脱垂程度}脱垂、{二尖瓣反流程度}反流。

追加结论示例：
1. 二尖瓣退行性病变：二尖瓣前叶增厚、{脱垂程度}脱垂、{二尖瓣反流程度}反流；疑部分腱索断裂。

追加结论示例：
1. 二尖瓣退行性病变：二尖瓣前叶增厚、{脱垂程度}脱垂、{二尖瓣反流程度}反流；部分腱索断裂。
  
追加结论示例：
1. 二尖瓣退行性病变：二尖瓣前叶增厚、{脱垂程度}脱垂、{二尖瓣反流程度}反流；部分腱索断裂；
   收缩期高压，建议排查高血压。



想法：
新增输入框按钮，快捷按键ctrl+K，调出中心输入框（居中显示，占上下高度、左右宽度约50%），输入关键词，快速更新所见、结论；

使用逻辑：输入”腱索断裂“、”中度脱垂“、”二尖瓣中度反流“，自动激活对应按钮，并生成初始版报告