```
超声排队叫号demo/
├── README.md
├── data/
│   └── .gitkeep                            # 占位；SQLite 运行时写入 queue_base.db
├── web/                                    # 前端静态页与图标
│   ├── demo-static-api.js                  # GitHub Pages：拦截 :18080，localStorage 模拟
│   ├── demo-shared-defaults.js             # 演示用默认业务日期/房间（局域网与 localhost 一致）
│   ├── queue_screen1.html
│   ├── queue_screen1_operator.html
│   ├── queue_screen2.html
│   ├── dashboard.html
│   ├── backboard.html
│   ├── image.png
│   ├── logo1.png
│   └── logo2.png
├── scripts/                                # Python 工具（均在项目根解析路径）
│   ├── serve_lan.py                        # 静态站 0.0.0.0，局域网访问
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