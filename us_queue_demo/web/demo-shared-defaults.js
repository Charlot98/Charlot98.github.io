/**
 * 局域网/多设备：127.0.0.1 与 192.168.* 的 localStorage 互不共享。
 * 未带 ?date= 时，各页在 localStorage/「今日」之前就采用这里的日期，与电脑打开
 * http://127.0.0.1:8000/web/queue_screen2.html?date=2026-05-05 的效果一致。
 *
 * 换演示日：只改下面两行（需存在对应 exports JSON）。
 */
window.QUEUE_DEMO_DEFAULT_WORK_DATE = "2026-05-05";
window.QUEUE_DEMO_DEFAULT_ROOM = "15";
