# 超声排队叫号 项目文件说明

本文档用于解释当前目录下每个文件/子目录的作用，便于后续维护、重构和迁移。

## 目录概览

- `web/`：前端演示页面（HTML）与静态图（`logo`、`image`）；页面通过相对路径读取上级目录的 `exports/`。
- `scripts/`：Python 工具链（拉取排队数据、本地叫号代理、工作站导出、扫码剃毛等）；均以「项目根目录」解析 `超声排队叫号/`、`exports/`、`data/`。
- `data/`：运行期数据目录；`call_number_proxy.py` 使用的 SQLite 数据库默认为 `data/queue_base.db`。
- `exports/`：按日期、房间导出的排队接口快照（如 `RH_GET99LIST_<date>_room<N>.json`），各页面主要数据源。
- `analysis/`：自二进制中提取的字符串/ PDB 摘录，仅供对照与逆向参考。
- `archive/`：与主数据流命名不一致的历史 JSON 副本等。
- `超声排队叫号/`：院内主程序侧部署资源（配置、报表模板、预编译标记等，非本仓库可运行源码）。

---

## 一、`超声排队叫号/` 目录（主程序部署资源）

### `超声排队叫号/ClientOption.ini`

- 客户端连接配置文件。
- 关键配置项：
  - `ServerIP`：服务端 IP 地址。
  - `ServerPort`：服务端端口。
  - `Room`：当前终端/检查室编号。
- 作用：客户端启动后依据该配置连接后端服务并按房间号处理叫号业务。

### `超声排队叫号/bin/App_Code.compiled`

- ASP.NET 预编译标记文件。
- 含虚拟路径 `/CNAMURegisterWeb/App_Code/` 与程序集信息 `App_Code`。
- 作用：用于运行时定位已编译代码，不包含可直接阅读的业务源码。

### `超声排队叫号/剃毛单打印 - 2025-10-15-初版.frx`

- 早期版 FastReport 报表模板（`.frx`）。
- 主要用于打印剃毛/排队相关票据，字段来自业务对象（如宠物信息、签到时间、顺序号、类型等）。
- 作用：作为历史模板版本，便于追溯早期打印样式和字段绑定方式。

### `超声排队叫号/剃毛单打印-2025-12-26.frx`

- 迭代版 FastReport 报表模板。
- 与初版相比，部分字段绑定和版式有调整（例如排队号展示字段变更）。
- 作用：用于当前或近期打印流程，支持最新业务文案/格式。

### `超声排队叫号/剃毛单打印.frx`

- 默认使用的 FastReport 模板（通常可视为“当前生效模板”）。
- 包含“超声排队”票据内容与温馨提示文案。
- 作用：打印前台给用户的排队凭条/提示单，字段由业务程序动态注入。

### `超声排队叫号/DevExpress.XtraLayout.v10.2.xml`

- DevExpress 组件的 XML 文档文件（API 注释/说明文档）。
- 非业务代码文件，不承载本项目业务逻辑。
- 作用：为开发期控件调用提供 IntelliSense 注释与参考。

---

## 二、`web/` 前端页面（演示入口）

以下文件位于 `web/` 目录；浏览器需能访问到同级的 `exports/`（见下文「运行方式」）。

### `web/queue_screen1.html`（列表工作端）

- 双栏：心超 / 非心超（腹超与其它），展示“未完成 + 队列桶为 `listnocall` 或 `custom`”的候诊行。
- 数据：`../exports/RH_GET99LIST_<date>_room<room>.json` + 代理 `custom_rows`、`case_states`。
- 交互：叫号（可经本地代理转真实叫号服务或仅 TTS 播报）、双击切换剃毛标记、点击状态在“未叫号/叫号未到”间切换；`localStorage` 仅用于叫号服务开关与跨页刷新信号。

### `web/queue_screen1_operator.html`（卡片操作端）

- 卡片栅格视图，同一病例多检查项合并展示；支持搜索、即将做（soon）人数配置、首位的腹超/心超高亮边框。
- 与列表端共用同日 JSON、`custom_rows`、`case_states`，另读写 `display_settings`（如腹超/心超 soon 上限）。
- 交互：长按或菜单修改病例状态、调用代理叫号、卡片分区点击等（细节见页面内脚本）。

### `web/queue_screen2.html`（大厅展示端）

- 只读大屏：左栏腹超/其它、右栏心超；**业务日期**与 `queue_screen1` / `queue_screen1_operator` / `dashboard` **共用**（`localStorage` + `BroadcastChannel`，跨标签页实时同步）；也可通过 URL `?date=` 首次指定；`room` 可选。
- 数据同源合并后按签到时间等规则排序；状态与 soon 集合由 `case_states` + `display_settings` 决定；检查项目名称经映射表简写（与下文「超声项目显示简化逻辑」一致）。

### `web/dashboard.html`（总览表）

- 表格化展示当日（及过滤条件下）全部相关行，含统计卡片、排序、手工新增行、行内改项目名与电话覆盖等。
- `case_states` 驱动行状态；电话可写在 `localStorage` 覆盖层，不替代服务端字段；可在演示中关闭定时刷新（`ENABLE_LIVE_POLLING`），改用「刷新」按钮。

### `web/backboard.html`

- 占位页（标题级页面），预留扩展。

---

## 说明与建议

- 当前仓库中，`超声排队叫号/` 目录更像“部署资源包”，并不包含完整可维护源码。
- 若要做深度改造，建议补充：
  - 客户端主程序源码（如 C# WinForms/WPF 或 Web 后端代码）
  - 数据库表结构与接口文档
  - 打印模板版本管理说明（模板启用规则、字段定义）

## 超声项目显示简化逻辑
应用至 `web/queue_screen1_operator.html`、`web/queue_screen2.html`。

简化对应（全称 -> 简称）：

- `超声检查（颈部肿物）`->`颈部肿物`
- `超声心脏（检查）` -> `心超`
- `超声检查（消化系统）` -> `消化`
- `超声检查（胃肠道）` -> `胃肠`
- `超声检查（腹腔筛查套餐）` -> `腹腔筛查`
- `超声检查（泌尿系统）` -> `泌尿`
- `超声检查（腹腔检查套餐）` -> `腹腔检查`
- `超声检查（单腔其他）` -> `单腔`
- `超声检查（膝关节）`→`膝关节`
- `超声检查（胸膜腔肿物）`→`胸膜腔肿物扫查`
- `超声检查（全腹扫查套餐）` -> `全腹`
- `急诊超声T-FAST` -> `T-FAST`
- `急诊超声A-FAST` -> `A-FAST`
- `超声排查腹膜腔积液` -> `排查腹膜腔积液`
- `超声心脏（检查+左心高阶测量）` -> `心超+左心`
- `超声心脏（检查+左右心高阶测量）` -> `心超+左右心`
- `超声心脏（检查+右心高阶测量）` -> `心超+右心`
- `超声检查（双眼）`-> `双眼`
- `超声造影（肝脏）`->`超声造影(肝脏)`
- `超声检查（体表肿物扫查）`-> `体表肿物`
- `超声引导排空（胸腔液）`->`排空(胸腔液)`
- `超声引导排空（腹腔液）`->`排空(腹腔液)`
- `超声引导排空（尿液）`->`排空(尿液)`
- `超声引导排空（心包积液）`->`排空(心包液)`
- `超声造影（肝脏）`->`超声造影(肝脏)`
- `超声造影（心脏）`->`超声造影(心脏)`
- `超声造影（胆囊）`->`超声造影(胆囊)`
- `超声造影（胰腺）`->`超声造影(胰腺)`
- `超声造影`->`超声造影`
- `超声介入（前列腺囊肿）`->`介入(前列腺囊肿)`
- `超声介入（胆囊）`->`介入(前列腺囊肿)`
- `超声介入（sub维护）`->`sub维护`
- `超声介入活检取样tru-cut`->`tru-cut`
- `超声介入瘤内注射`
- `超声介入（其他）`

补充说明：

- 若项目名不在映射表中，会走通用简化规则：去括号内容、去“超声检查/超声”前缀，保留核心词。



## 状态逻辑修正
第1层 正常排队
- `未叫号`，蓝色
- `暂离留号`，黄色
  
第2层 过号
- `叫号未到`，灰色

第3层 已完成
- `已完成`，绿色

状态筛选框：正常排队、过号、已完成

---

## demo 整体逻辑结构

本节描述本仓库「超声排队叫号 demo」在业务和实现上的主干逻辑（按数据流与角色组织）。

### 1. 角色与页面分工

- **工作端（`web/queue_screen1.html`）**：以表格行为主，方便逐项叫号、改剃毛/过号类状态。
- **操作端（`web/queue_screen1_operator.html`）**：以卡片为主，突出「下一个是谁」、检索与批量视角下的操作。
- **展示端（`web/queue_screen2.html`）**：面向候诊区大屏，只读、强对比样式、项目名称简写。
- **管理/总览（`web/dashboard.html`）**：一览+筛选+统计+手工补录与电话等字段维护。
- **遗留部署包（`超声排队叫号/`）**：与院内正式客户端/打印等相关，不参与上述 HTML 的直接运行链。

### 2. 数据源与合并规则

- **主快照**：`exports/RH_GET99LIST_<date>_room<room>.json`（由业务系统导出或抓取），结构在页面内通过 `flatten` / `flatten99` 展平为多行。
- **手工/补录行**：经本地 HTTP 代理提供的 `custom_rows`，与主快照合并；这类行 `queue_bucket` 常为 `custom`。
- **展示与筛选口径**：多页只保留 `queue_bucket` 为 `listnocall` 或 `custom` 的候诊相关行（完成态等会被滤掉或单独统计，视页面而定）。
- **心超 vs 腹超/其它**：以行内 `kind` / `kind_group` 是否含「心」划分渠道；展示端两栏、操作端卡片分组均依赖该规则。

### 3. 跨页一致状态：`case_states` 与 `display_settings`

- **`case_states` / `case_state`**：按 `case_key`（由 `patient_id`、`serial_no` 等稳定的业务键推导）存每条病例的**本地覆盖状态**——如 `nocall` / `hold` / `pass` / `completed`、剃毛标记、开始检查时间等。列表/卡片上的「未叫号、暂离留号、叫号未到、已完成」等展示优先服从该映射，再与源数据 `rh_status` 等综合（各页 `normalize` 逻辑略有差异但语义一致）。
- **`display_settings`**：例如腹超/心超「即将做」人数上限（soon limit），操作端写入、展示端读出，用于大屏高亮「下几位」。

### 4. 叫号链路

- 本地代理根路径一般为 **`当前协议//主机:18080`**；`web/queue_screen1.html` 另可用 query **`?proxy=`** 显式指定（并会去掉末尾的 `/call` 再拼接口）。
- 工作端请求 `POST .../call`，将日期、房间、动作（如首次叫号 / 重呼）及行数据转发到**真实叫号服务**（示例脚本中叫号机地址、端口可调）；失败时常回退为浏览器 **TTS 本地播报**。
- **`custom` 行**通常只播报、不调用外部叫号。
- **浏览器 TTS**：`web/queue_screen1.html` 与 `queue_screen1_operator.html` 中 `ENABLE_BROWSER_TTS` 为 `false` 时，不朗读叫号文案（仍可向远程 `/call` 发请求，由「启用叫号服务」勾选控制）。

### 5. 浏览器侧协同

- **`localStorage`**：用途包括跨标签页通知「强制刷新」时间戳、叫号服务开关、Dashboard 电话覆盖、**四页业务日期同步键** `queue_demo_shared_work_date`（与 `BroadcastChannel` `queue_demo_work_date_v1` 配合，使 `queue_screen1` / `operator` / `screen2` / `dashboard` 选中的日期一致并实时同步）等；**不是**队列主存储。
- **轮询**：正式用时页面可对 JSON 与代理接口定时 `fetch`；本仓库演示默认在 `ENABLE_LIVE_POLLING = false` 下关闭定时拉取，避免演示环境无后端时持续 404/报错；需实时刷新时改为 `true` 或依赖手动刷新。

### 6. 与 README 后文业务规则的关系

- **「超声项目显示简化逻辑」**：主要作用于 `web/queue_screen1_operator.html`、`web/queue_screen2.html` 等项目名字段展示。
- **「状态逻辑修正」**：与 `case_states` 展示层级、颜色及筛选语义对应，三层为正常排队 / 过号 / 已完成。

### 7. 运行前提（简要）

- 在**项目根目录**启动静态服务，使 `web/` 与 `exports/` 处在正确的相对路径下，例如：`python3 -m http.server 8000`，再访问 `http://localhost:8000/web/queue_screen1.html`。
- **局域网访问**：静态文件与代理均需对局域网网卡监听（不要用仅 `127.0.0.1`）。可使用：
  - `python3 scripts/serve_lan.py`（默认端口 8000，绑定 `0.0.0.0`；可用环境变量 `PORT` 修改）；
  - 或手动：`python3 -m http.server 8000 --bind 0.0.0.0`（在项目根执行）。
  - 代理 `scripts/call_number_proxy.py` 已默认为 `0.0.0.0:18080`。手机/其它电脑请用 **`http://<电脑局域网IP>:8000/web/...`** 打开页面，页面内请求会指向同一主机的 **18080**，请确保防火墙放行 **8000** 与 **18080**。
- 代理与叫号服务按环境自行启动或关闭（仅 TTS 模式可不依赖叫号服务）；代理脚本：`python3 scripts/call_number_proxy.py`。
- **演示模式**：`web/` 下各页脚本中 `ENABLE_LIVE_POLLING` 默认为 `false`，已关闭定时拉取 `exports`/代理；需更新数据时请用页面上的「刷新」、修改业务日期，或将其改回 `true` 恢复轮询。

---

## 仓库文件树与功能说明

下列为重组后的**目录树**（与当前仓库一致）。

```
超声排队叫号demo/
├── README.md
├── data/
│   └── .gitkeep                            # 占位；SQLite 运行时写入 queue_base.db
├── web/                                    # 前端静态页与图标
│   ├── queue_screen1.html
│   ├── queue_screen1_operator.html
│   ├── queue_screen2.html
│   ├── dashboard.html
│   ├── backboard.html
│   ├── image.png
│   ├── logo1.png
│   └── logo2.png
├── scripts/                                # Python 工具（均在项目根解析路径）
│   ├── serve_lan.py                      # 静态站绑定 0.0.0.0，便于局域网访问
│   ├── call_number_proxy.py                # HTTP :18080：/call、/custom_rows、/case_state(s)、/display_settings
│   ├── fetch_queue_data.py                 # RH_GET01/99 → exports/
│   ├── sync_today_exports.py               # 定时调用 fetch_queue_data
│   ├── auto_remove_skin.py                 # 扫码 RH_RemoveSkin
│   ├── fetch_ws_cases.py                   # 工作站 DB 导出（全字段）
│   └── fetch_ws_cases_minimal.py           # 工作站 DB 导出（精简字段）
├── analysis/                               # 二进制字符串 / PDB 摘录（对照用）
│   ├── app_code_strings.txt
│   ├── app_code_strings_utf16.txt
│   ├── cnamuclient_strings.txt
│   ├── cnamuclient_strings_utf16.txt
│   ├── cnamuclient_utf16_strings.txt
│   └── cnamuclient_pdb_strings.txt
├── archive/                                # 历史快照（命名与 exports 不完全一致时可放此处）
│   ├── RH_GET01LIST_2026-04-21.json
│   └── RH_GET99LIST_2026-04-21.json
├── exports/                                # 接口 JSON/CSV 主目录（RH_GET*_room<N>）
└── 超声排队叫号/                          # 院内部署资源包
    ├── ClientOption.ini
    ├── bin/App_Code.compiled
    ├── 剃毛单打印*.frx
    ├── DevExpress.XtraLayout.v10.2.xml
    └── readme.md
```

说明：`fetch_ws_cases*.py` 默认引用的「超声报告工作站圣天硬狗网络版/config/…」若未随仓库提供，仅在有该目录与数据库环境时可运行；与 `exports/` 排队 JSON 链路相互独立，可作辅助数据源。