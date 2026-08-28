const columns = [
  ["xray-report", "X线报告"], ["xray-teaching", "X线带教"], ["xray-shooting", "X线拍摄"],
  ["ct-review", "CT/MRI审核"], ["ct-report", "CT/MRI报告"],
  ["ct-scan-teaching", "CT/MRI扫查带教"], ["ct-scan", "CT/MRI扫查"],
  ["us-room-1", "超声一号屋"], ["us-room-2", "超声二号屋"],
  ["us-room-3", "超声三号屋"], ["us-room-4", "超声四号屋"],
  ["us-report", "超声报告"], ["us-coordination-teaching", "超声统筹带教"],
  ["us-new-coordination", "超声新人统筹"], ["night", "夜班"],
];

const groups = [
  ["高级医师", ["戴榕全", "刘蕾", "张博闻", "白璐", "张志轩", "吴璇", "邝怡", "曲艺", "陈可欣", "李铭婕"]],
  ["中级医师", ["简乐诗", "刘慜思", "张秋梅", "曲莹莹"]],
  ["三年级", ["马萌", "江蓝", "王兆雪", "冯军利", "张若邈"]],
  ["二年级", ["付诗懿", "冯芷珊", "刘亦婷", "于丛爽", "戴睿", "袁芳"]],
  ["一年级", ["彭竻川", "张伊雯", "徐李祥瑞", "林雨睿", "梁思思", "沈烨"]],
  ["老助理", ["张明扬", "杨思琪", "赵家慧", "刘越", "王成龙", "赵家琳", "路萌", "马析淳"]],
  ["新助理", ["安姝嫣", "李晓阳", "杨俊杰", "苏镜秋", "闫娜", "段艺涵"]],
];
const previousWeekStaffByDate = {
  "2026-08-24": ["戴榕全", "张博闻", "陈可欣", "邝怡", "张秋梅", "曲莹莹", "戴睿", "张明扬", "苏镜秋", "路萌", "闫娜", "江蓝", "杨思琪", "袁芳", "冯芷珊", "梁思思", "刘亦婷", "彭竻川", "张若邈", "沈烨", "张伊雯", "王兆雪", "徐李祥瑞", "冯军利", "刘越", "赵家琳", "安姝嫣", "杨俊杰"],
  "2026-08-25": ["张博闻", "白璐", "吴璇", "李铭婕", "简乐诗", "刘慜思", "戴睿", "马析淳", "林雨睿", "赵家琳", "李晓阳", "刘越", "赵家慧", "袁芳", "于丛爽", "付诗懿", "刘亦婷", "王兆雪", "徐李祥瑞", "江蓝", "沈烨", "张伊雯", "张若邈", "梁思思", "路萌", "段艺涵", "安姝嫣", "闫娜", "苏镜秋"],
  "2026-08-26": ["张志轩", "曲艺", "陈可欣", "简乐诗", "刘慜思", "王成龙", "苏镜秋", "彭竻川", "杨俊杰", "王兆雪", "刘越", "赵家琳", "于丛爽", "冯芷珊", "付诗懿", "张若邈", "徐李祥瑞", "冯军利", "张伊雯", "赵家慧", "江蓝", "林雨睿", "马析淳", "闫娜", "李晓阳", "沈烨"],
  "2026-08-27": ["白璐", "邝怡", "陈可欣", "李铭婕", "刘慜思", "曲莹莹", "袁芳", "杨思琪", "于丛爽", "安姝嫣", "刘越", "李晓阳", "段艺涵", "冯军利", "赵家琳", "马析淳", "冯芷珊", "付诗懿", "马萌", "梁思思", "彭竻川", "林雨睿", "江蓝", "王成龙", "路萌", "杨俊杰", "苏镜秋"],
  "2026-08-28": ["白璐", "张志轩", "李铭婕", "张秋梅", "曲莹莹", "戴睿", "赵家慧", "杨俊杰", "彭竻川", "闫娜", "段艺涵", "张若邈", "王成龙", "张明扬", "于丛爽", "冯芷珊", "江蓝", "刘亦婷", "王兆雪", "沈烨", "张伊雯", "马萌", "梁思思", "刘越", "安姝嫣", "李晓阳", "徐李祥瑞"],
  "2026-08-29": ["戴榕全", "白璐", "吴璇", "陈可欣", "简乐诗", "张秋梅", "戴睿", "马析淳", "安姝嫣", "刘越", "李晓阳", "杨思琪", "袁芳", "于丛爽", "马萌", "张明扬", "王兆雪", "林雨睿", "冯军利", "冯芷珊", "刘亦婷", "赵家慧", "徐李祥瑞", "王成龙", "路萌", "杨俊杰", "闫娜"],
  "2026-08-30": ["戴榕全", "张博闻", "张志轩", "吴璇", "李铭婕", "简乐诗", "刘慜思", "张秋梅", "曲莹莹", "戴睿", "赵家慧", "张伊雯", "赵家琳", "沈烨", "马萌", "路萌", "张明扬", "袁芳", "于丛爽", "付诗懿", "彭竻川", "冯军利", "马析淳", "段艺涵", "苏镜秋", "梁思思", "林雨睿"],
};
const people = groups.flatMap(([, names]) => names);
const groupByPerson = new Map(groups.flatMap(([group, names]) => names.map((name) => [name, group])));
const groupStarts = new Set(groups.slice(1).map(([, names]) => names[0]));
const thirdGrade = new Set(groups[2][1]);
const residents = new Set([...groups[3][1], ...groups[4][1]]);
const assistants = new Set([...groups[5][1], ...groups[6][1]]);
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const LOCAL_VERSIONS_KEY = "department-schedule.local-versions.v1";
const LOCAL_DRAFT_KEY = "department-schedule.local-draft.v1";
let schedule = {};
let preferences = {};
let versions = [];
let currentVersion = null;
let currentPeriodKey = "";
let query = "";
let heatmapChart = null;
let showShiftLabels = false;
let tableMoveSource = null;
let tableStatus = "拖动姓名调整岗位或夜班日期";
let heatmapSwapSource = null;
let heatmapSwapStatus = "点击热力格选择换班，再点击蓝框候选格完成互换";

const dateLabel = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return { date, day: `${date.getMonth() + 1}月${date.getDate()}日`, weekday: `周${weekdays[date.getDay()]}` };
};

function personClass(person) {
  if (thirdGrade.has(person)) return "third";
  if (residents.has(person)) return "resident";
  if (assistants.has(person)) return "assistant";
  return "physician";
}

function renderTable() {
  const table = document.querySelector("#schedule-table");
  const dates = Object.keys(schedule).sort();
  const conflictKeys = getWhiteShiftConflictKeys();
  table.querySelector("thead").innerHTML = `<tr><th class="date-head">日期</th>${columns.map(([id, label]) => `<th class="${id === "night" ? "night-head" : ""}">${label}</th>`).join("")}</tr>`;
  table.querySelector("tbody").innerHTML = dates.map((dateKey, index) => {
    const { date, day, weekday } = dateLabel(dateKey);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const weekEnd = date.getDay() === 0 && index < dates.length - 1;
    const cells = columns.map(([id]) => {
      const names = (schedule[dateKey][id] || []).filter((name) => !query || name.includes(query));
      const eligible = tableMoveSource && canMoveAssignment(tableMoveSource, dateKey, id);
      return `<td data-date="${dateKey}" data-column="${id}" class="${id === "night" ? "night-cell" : ""} ${eligible ? "is-drop-eligible" : ""}">${names.length ? names.map((name) => `<span draggable="true" data-person="${name}" data-date="${dateKey}" data-column="${id}" class="person-chip ${personClass(name)} ${query && name.includes(query) ? "match" : ""} ${id !== "night" && conflictKeys.has(`${dateKey}::${name}`) ? "is-conflict" : ""} ${tableMoveSource?.person === name && tableMoveSource?.dateKey === dateKey && tableMoveSource?.columnId === id ? "is-drag-source" : ""}" ${id !== "night" && conflictKeys.has(`${dateKey}::${name}`) ? `title="${name}当日存在多个白班"` : ""}>${name}</span>`).join("") : `<span class="empty-cell">—</span>`}</td>`;
    }).join("");
    return `<tr class="${weekend ? "weekend" : ""} ${weekEnd ? "week-end" : ""}"><th><strong>${day}</strong><span>${weekday}</span></th>${cells}</tr>`;
  }).join("");
  const status = document.querySelector("#table-filter-state");
  const conflictMessage = conflictKeys.size ? ` · ${conflictKeys.size}处同日多白班冲突` : "";
  status.textContent = `${query ? `仅显示“${query}” · ` : ""}${tableStatus}${conflictMessage}`;
  status.classList.toggle("has-conflicts", conflictKeys.size > 0);
}

function weekNumber(dateKey) {
  const firstDate = new Date(`${Object.keys(schedule).sort()[0]}T00:00:00`);
  const currentDate = new Date(`${dateKey}T00:00:00`);
  return Math.floor((currentDate - firstDate) / 86400000 / 7);
}

function hasWhiteShift(person, dateKey) {
  return Object.entries(schedule[dateKey] || {}).some(([shiftId, names]) => (
    shiftId !== "night"
    && !["annual-leave", "expansion", "management"].includes(shiftId)
    && names.includes(person)
  ));
}

function whiteShiftIdsFor(person, dateKey) {
  return Object.entries(schedule[dateKey] || {})
    .filter(([shiftId, names]) => shiftId !== "night" && names.includes(person))
    .map(([shiftId]) => shiftId);
}

function getWhiteShiftConflictKeys() {
  const conflicts = new Set();
  Object.keys(schedule).forEach((dateKey) => {
    people.forEach((person) => {
      if (whiteShiftIdsFor(person, dateKey).length > 1) conflicts.add(`${dateKey}::${person}`);
    });
  });
  return conflicts;
}

function canMoveAssignment(source, targetDateKey, targetColumnId) {
  if (!source || !schedule[targetDateKey]) return false;
  if ((schedule[targetDateKey][targetColumnId] || []).includes(source.person)) return false;
  if (source.columnId === "night") {
    return targetColumnId === "night"
      && weekNumber(source.dateKey) === weekNumber(targetDateKey)
      && hasWhiteShift(source.person, targetDateKey)
      && !String(preferences[`${source.person}::${targetDateKey}`] || "").includes("no-night");
  }
  if (targetColumnId === "night") return false;
  return true;
}

function moveAssignment(source, targetDateKey, targetColumnId) {
  if (!canMoveAssignment(source, targetDateKey, targetColumnId)) return;
  const movesPairedNight = source.columnId !== "night"
    && targetDateKey !== source.dateKey
    && (schedule[source.dateKey].night || []).includes(source.person);
  schedule[source.dateKey][source.columnId] = (schedule[source.dateKey][source.columnId] || [])
    .filter((person) => person !== source.person);
  schedule[targetDateKey][targetColumnId] = [...new Set([...(schedule[targetDateKey][targetColumnId] || []), source.person])];
  if (movesPairedNight) {
    schedule[source.dateKey].night = (schedule[source.dateKey].night || [])
      .filter((person) => person !== source.person);
    schedule[targetDateKey].night = [...new Set([...(schedule[targetDateKey].night || []), source.person])];
  }
  const targetLabel = columns.find(([id]) => id === targetColumnId)?.[1] || targetColumnId;
  tableStatus = source.columnId === "night"
    ? `${source.person}夜班已移至${dateLabel(targetDateKey).day}`
    : movesPairedNight
      ? `${source.person}白班已移至${dateLabel(targetDateKey).day}${targetLabel}，夜班已同步移动`
      : `${source.person}已移至${dateLabel(targetDateKey).day}${targetLabel}`;
  tableMoveSource = null;
  heatmapSwapSource = null;
  heatmapSwapStatus = "排班已调整，可重新选择热力图换班";
  renderTable();
  renderHeatmap();
}

function updateDropHighlights(activeCell = null) {
  document.querySelectorAll("#schedule-table tbody td").forEach((cell) => {
    const eligible = canMoveAssignment(tableMoveSource, cell.dataset.date, cell.dataset.column);
    cell.classList.toggle("is-drop-eligible", eligible);
    cell.classList.toggle("is-drop-active", eligible && cell === activeCell);
  });
  document.querySelectorAll("#schedule-table .person-chip").forEach((chip) => {
    chip.classList.toggle("is-drag-source", Boolean(
      tableMoveSource
      && chip.dataset.person === tableMoveSource.person
      && chip.dataset.date === tableMoveSource.dateKey
      && chip.dataset.column === tableMoveSource.columnId
    ));
  });
}

function shiftsFor(person, dateKey) {
  return Object.entries(schedule[dateKey] || {})
    .filter(([, names]) => names.includes(person))
    .map(([shift]) => shift);
}

function cellStyle(shifts) {
  const operational = shifts.filter((shift) => !["night", "annual-leave", "expansion", "management"].includes(shift));
  const hasNight = shifts.includes("night");
  if (!shifts.length) return { category: "none", marker: "", hasNight, label: "无排班" };
  if (shifts.includes("annual-leave")) return { category: "other", marker: "年", hasNight, label: "年假" };
  if (shifts.includes("expansion")) return { category: "other", marker: "拓", hasNight, label: "拓展" };
  if (shifts.includes("management")) return { category: "other", marker: "管", hasNight, label: "管理" };
  if (operational.some((shift) => shift.startsWith("xray"))) return { category: "xray", marker: "X", hasNight, label: "X线" };
  if (operational.some((shift) => shift.startsWith("ct"))) return { category: "ct", marker: "CT", hasNight, label: "CT/MRI" };
  if (operational.some((shift) => shift.startsWith("us"))) return { category: "us", marker: "US", hasNight, label: "超声" };
  return { category: hasNight ? "night" : "other", marker: hasNight ? "夜" : "", hasNight, label: hasNight ? "夜班" : "其它" };
}

function parsePreference(raw) {
  if (!raw) return {};
  const contentValues = new Set(["annual-leave", "rest", "xray", "ct", "us", "expansion", "no-night", "management"]);
  const exclusiveValues = new Set(["annual-leave", "rest", "expansion", "management"]);
  let content;
  let tone;
  raw.split("+").map((part) => part === "work" ? "day" : part).forEach((part) => {
    if (part === "day" || part === "night") tone = part;
    else if (contentValues.has(part)) content = part;
  });
  if (exclusiveValues.has(content)) return { content };
  if (content === "no-night" && tone === "night") tone = undefined;
  return { content, tone };
}

function dominantModality(shifts) {
  if (shifts.some((shift) => shift.startsWith("xray-"))) return "xray";
  if (shifts.some((shift) => shift.startsWith("ct-"))) return "ct";
  if (shifts.some((shift) => shift.startsWith("us-"))) return "us";
  return null;
}

function shiftIdsForSwapCategory(person, dateKey, category) {
  return whiteShiftIdsFor(person, dateKey).filter((shiftId) => (
    category === "xray" ? shiftId.startsWith("xray-")
      : category === "ct" ? shiftId.startsWith("ct-")
        : category === "us" ? shiftId.startsWith("us-")
          : false
  ));
}

function isExclusiveRestPreference(person, dateKey) {
  return ["annual-leave", "rest", "expansion", "management"]
    .includes(parsePreference(preferences[`${person}::${dateKey}`]).content);
}

function canReceiveSwapDay(person, dateKey, movesNight) {
  const parsed = parsePreference(preferences[`${person}::${dateKey}`]);
  return shiftsFor(person, dateKey).length === 0
    && !isExclusiveRestPreference(person, dateKey)
    && !(movesNight && parsed.content === "no-night");
}

function isHeatmapSwapCandidate(person, dateKey, category) {
  if (!heatmapSwapSource || !category) return false;
  const source = heatmapSwapSource;
  if (person === source.person
    || dateKey === source.dateKey
    || groupByPerson.get(person) !== source.group
    || category !== source.category) return false;
  const sourceShiftIds = shiftIdsForSwapCategory(source.person, source.dateKey, source.category).sort();
  const targetShiftIds = shiftIdsForSwapCategory(person, dateKey, category).sort();
  const sourceHasOnlySelectedShift = whiteShiftIdsFor(source.person, source.dateKey).length === sourceShiftIds.length;
  const targetHasOnlySelectedShift = whiteShiftIdsFor(person, dateKey).length === targetShiftIds.length;
  const sameConcreteShifts = sourceShiftIds.length > 0
    && sourceShiftIds.length === targetShiftIds.length
    && sourceShiftIds.every((shiftId, index) => shiftId === targetShiftIds[index]);
  const sourceMovesNight = (schedule[source.dateKey].night || []).includes(source.person);
  const targetMovesNight = (schedule[dateKey].night || []).includes(person);
  return sourceHasOnlySelectedShift
    && targetHasOnlySelectedShift
    && sameConcreteShifts
    && canReceiveSwapDay(person, source.dateKey, targetMovesNight)
    && canReceiveSwapDay(source.person, dateKey, sourceMovesNight);
}

function updateHeatmapSwapStatus() {
  const status = document.querySelector("#heatmap-swap-status");
  if (!status) return;
  status.textContent = heatmapSwapStatus;
  status.classList.toggle("is-active", Boolean(heatmapSwapSource));
}

function swapHeatmapAssignments(target) {
  const source = heatmapSwapSource;
  if (!source || !isHeatmapSwapCandidate(target.person, target.dateKey, target.category)) return;
  const sourceShiftIds = shiftIdsForSwapCategory(source.person, source.dateKey, source.category);
  const targetShiftIds = shiftIdsForSwapCategory(target.person, target.dateKey, target.category);
  const affectedSlots = new Map();
  sourceShiftIds.forEach((shiftId) => affectedSlots.set(`${source.dateKey}::${shiftId}`, { dateKey: source.dateKey, shiftId }));
  targetShiftIds.forEach((shiftId) => affectedSlots.set(`${target.dateKey}::${shiftId}`, { dateKey: target.dateKey, shiftId }));
  affectedSlots.forEach(({ dateKey, shiftId }) => {
    const isSourceSlot = dateKey === source.dateKey && sourceShiftIds.includes(shiftId);
    const isTargetSlot = dateKey === target.dateKey && targetShiftIds.includes(shiftId);
    schedule[dateKey][shiftId] = [...new Set((schedule[dateKey][shiftId] || []).map((person) => {
      if (isSourceSlot && person === source.person) return target.person;
      if (isTargetSlot && person === target.person) return source.person;
      return person;
    }))];
  });

  if (source.dateKey !== target.dateKey) {
    const sourceHadNight = (schedule[source.dateKey].night || []).includes(source.person);
    const targetHadNight = (schedule[target.dateKey].night || []).includes(target.person);
    schedule[source.dateKey].night = (schedule[source.dateKey].night || []).filter((person) => person !== source.person);
    schedule[target.dateKey].night = (schedule[target.dateKey].night || []).filter((person) => person !== target.person);
    if (targetHadNight) schedule[source.dateKey].night = [...new Set([...(schedule[source.dateKey].night || []), target.person])];
    if (sourceHadNight) schedule[target.dateKey].night = [...new Set([...(schedule[target.dateKey].night || []), source.person])];
  }

  const categoryLabels = { xray: "X线报告", ct: "CT/MRI", us: "超声" };
  const sourceRestWasUnmet = parsePreference(preferences[`${source.person}::${source.dateKey}`]).content === "rest";
  heatmapSwapStatus = sourceRestWasUnmet
    ? `${source.person}与${target.person}的同种${categoryLabels[source.category]}班已互换，${source.person}的指定休息已满足；可点“保存到云端”`
    : `${source.person}与${target.person}的同种${categoryLabels[source.category]}班已互换；可点“保存到云端”`;
  tableStatus = heatmapSwapStatus;
  heatmapSwapSource = null;
  renderTable();
  renderHeatmap();
}

function handleHeatmapSwapClick(custom) {
  if (!custom?.swappable) {
    heatmapSwapSource = null;
    heatmapSwapStatus = "该单元格没有可交换的X线、CT/MRI或超声白班";
    renderHeatmap();
    return;
  }
  if (!heatmapSwapSource) {
    heatmapSwapSource = {
      person: custom.person,
      dateKey: custom.dateKey,
      category: custom.category,
      group: groupByPerson.get(custom.person),
    };
    const categoryLabels = { xray: "X线报告", ct: "CT/MRI", us: "超声" };
    const isUnmetRest = parsePreference(preferences[`${custom.person}::${custom.dateKey}`]).content === "rest";
    heatmapSwapStatus = isUnmetRest
      ? `已选择${custom.person} ${custom.dateLabel}未满足的指定休息，蓝框为同等级、同班种且双方日期均可休息的换班人员`
      : `已选择${custom.person} ${custom.dateLabel} ${categoryLabels[custom.category]}，蓝框为同等级、同班种且双方日期均可休息的换班人员`;
    renderHeatmap();
    return;
  }
  if (custom.person === heatmapSwapSource.person && custom.dateKey === heatmapSwapSource.dateKey) {
    heatmapSwapSource = null;
    heatmapSwapStatus = "已取消热力图换班选择";
    renderHeatmap();
    return;
  }
  if (isHeatmapSwapCandidate(custom.person, custom.dateKey, custom.category)) {
    swapHeatmapAssignments(custom);
    return;
  }
  heatmapSwapSource = null;
  heatmapSwapStatus = "所选单元格不满足同等级、同班种及双方休息日互换条件，已取消选择";
  renderHeatmap();
}

function isWorkDay(person, dateKey) {
  if (previousWeekStaffByDate[dateKey]) return previousWeekStaffByDate[dateKey].includes(person);
  const parsed = parsePreference(preferences[`${person}::${dateKey}`]);
  return shiftsFor(person, dateKey).length > 0
    || ["annual-leave", "expansion", "management"].includes(parsed.content)
    || parsed.tone === "day"
    || parsed.tone === "night";
}

function getStreakSeverityByCell(currentDates) {
  const allDates = [...Object.keys(previousWeekStaffByDate), ...currentDates].sort();
  const currentDateSet = new Set(currentDates);
  const severity = new Map();
  people.forEach((person) => {
    let run = [];
    const flushRun = () => {
      if (run.length >= 6) {
        const level = run.length > 6 ? "streak-over" : "streak-six";
        run.filter((dateKey) => currentDateSet.has(dateKey))
          .forEach((dateKey) => severity.set(`${person}::${dateKey}`, level));
      }
      run = [];
    };
    allDates.forEach((dateKey, index) => {
      const previousDateKey = allDates[index - 1];
      const hasDateGap = previousDateKey
        && (new Date(`${dateKey}T00:00:00`) - new Date(`${previousDateKey}T00:00:00`)) !== 86400000;
      if (hasDateGap) flushRun();
      if (isWorkDay(person, dateKey)) run.push(dateKey);
      else flushRun();
    });
    flushRun();
  });
  return severity;
}

function mainHeatmapCategory(preference, shifts) {
  const parsed = parsePreference(preference);
  if (["annual-leave", "expansion", "management"].includes(parsed.content)) return "other";
  if (parsed.tone === "night") return "night";
  if (parsed.tone === "day") return "day";
  if (parsed.content === "no-night") {
    if (!shifts.length) return "none";
    if (showShiftLabels) return dominantModality(shifts) || (shifts.includes("night") ? "night" : "other");
    return shifts.includes("night") ? "night" : "day";
  }
  if (["xray", "ct", "us"].includes(parsed.content)) return showShiftLabels ? parsed.content : "day";
  if (shifts.includes("night") && !shifts.some((shift) => shift !== "night")) return "night";
  if (showShiftLabels) return dominantModality(shifts) || (shifts.length ? "other" : "none");
  if (shifts.includes("night")) return "night";
  if (shifts.length) return "day";
  return "none";
}

function mainHeatmapMarker(preference, shifts, restHonored) {
  const parsed = parsePreference(preference);
  if (parsed.content === "annual-leave") return "年";
  if (parsed.content === "expansion") return "拓";
  if (parsed.content === "management") return "管";
  if (parsed.content === "rest") return restHonored ? "休" : "待";
  if (parsed.content === "no-night") return "白";
  if (parsed.content === "xray") return "X";
  if (parsed.content === "ct") return "CT";
  if (parsed.content === "us") return "US";
  if (parsed.tone) return "";
  if (!showShiftLabels) return "";
  const modality = dominantModality(shifts);
  return modality === "xray" ? "X" : modality === "ct" ? "CT" : modality === "us" ? "US" : "";
}

function renderHeatmap() {
  updateHeatmapSwapStatus();
  const currentDates = Object.keys(schedule).sort();
  const heatmapDates = currentDates;
  const streakSeverityByCell = getStreakSeverityByCell(currentDates);
  const axisCategories = heatmapDates.flatMap((dateKey, dateIndex) => (
    dateIndex > 0 && dateIndex % 7 === 0
      ? ["", String(new Date(`${dateKey}T00:00:00`).getDate())]
      : [String(new Date(`${dateKey}T00:00:00`).getDate())]
  ));
  const visiblePeople = people;
  document.querySelector("#people-count").textContent = visiblePeople.length;
  const container = document.querySelector("#heatmap");
  const panelWidth = document.querySelector("#heatmap-view").clientWidth
    || document.querySelector(".app-shell").clientWidth;
  const chartHorizontalMargins = 86 + 16;
  const heatmapCellSize = Math.max(
    36,
    Math.floor((panelWidth - chartHorizontalMargins) / axisCategories.length),
  );
  const groupGap = 0.45;
  const visibleBoundaries = [10, 14, 19, 25, 31, 39];
  const yPositions = visiblePeople.map((_, personIndex) => (
    personIndex + visibleBoundaries.filter((boundary) => personIndex >= boundary).length * groupGap
  ));
  const personByY = new Map(yPositions.map((position, index) => [position, visiblePeople[index]]));
  const colors = {
    day: "rgba(0, 144, 242, 0.56)",
    night: "rgba(15, 66, 148, 0.88)",
    other: "rgba(215, 175, 0, 0.50)",
    previous: "rgba(100, 116, 139, 0.42)",
    none: "rgba(232, 238, 245, 0.92)",
    xray: "rgba(0, 144, 242, 0.62)",
    ct: "rgba(34, 160, 120, 0.55)",
    us: "rgba(220, 120, 160, 0.55)",
    conflict: "rgba(220, 38, 38, 0.78)",
  };
  const shiftLabels = Object.fromEntries(columns);
  Object.assign(shiftLabels, { "annual-leave": "年假", expansion: "拓展", management: "管理" });
  const points = visiblePeople.flatMap((person, personIndex) => heatmapDates.map((dateKey, dateIndex) => {
    const x = dateIndex + Math.floor(dateIndex / 7);
    const shifts = shiftsFor(person, dateKey);
    const preference = preferences[`${person}::${dateKey}`];
    const parsed = parsePreference(preference);
    const restHonored = parsed.content === "rest" && shifts.length === 0;
    const category = mainHeatmapCategory(preference, shifts);
    const isUnscheduledNoNight = parsed.content === "no-night" && shifts.length === 0;
    const swapCategory = dominantModality(shifts);
    const isSwapSelected = Boolean(heatmapSwapSource
      && person === heatmapSwapSource.person
      && dateKey === heatmapSwapSource.dateKey);
    const isSwapCandidate = isHeatmapSwapCandidate(person, dateKey, swapCategory);
    const streakSeverity = streakSeverityByCell.get(`${person}::${dateKey}`);
    const hasWhiteConflict = whiteShiftIdsFor(person, dateKey).length > 1;
    const labels = shifts.map((shift) => shiftLabels[shift] || shift);
    const { day, weekday } = dateLabel(dateKey);
    const shiftDescription = parsed.content === "rest"
      ? restHonored ? "普通休息（已满足）" : `${labels.join("、")}；普通休息未满足`
      : labels.length ? labels.join("、") : "无排班";
    const streakDescription = streakSeverity === "streak-six" ? "；连续工作6天"
      : streakSeverity === "streak-over" ? "；连续工作超过6天" : "";
    const pointClassName = isSwapSelected ? "heatmap-swap-selected"
      : isSwapCandidate ? "heatmap-swap-candidate"
        : [
          swapCategory ? "heatmap-swap-ready" : "",
          isUnscheduledNoNight ? "heatmap-no-night-empty" : "",
          streakSeverity || "",
        ].filter(Boolean).join(" ");
    return {
      x,
      y: yPositions[personIndex],
      value: 1,
      color: hasWhiteConflict ? colors.conflict
        : isUnscheduledNoNight ? "transparent"
          : colors[category],
      className: pointClassName,
      custom: {
        person,
        dateKey,
        dateLabel: `${day} ${weekday}`,
        shifts: `${hasWhiteConflict ? `${shiftDescription}；同日多白班冲突` : shiftDescription}${streakDescription}`,
        marker: mainHeatmapMarker(preference, shifts, restHonored),
        noNight: parsed.content === "no-night",
        conflict: hasWhiteConflict,
        category: swapCategory,
        swappable: Boolean(swapCategory),
        streakSeverity,
      },
    };
  }));
  const chartHeight = 48 + 28 + (yPositions.at(-1) + 1.1) * heatmapCellSize;
  const chartWidth = chartHorizontalMargins + axisCategories.length * heatmapCellSize;
  container.style.height = `${chartHeight}px`;
  container.style.width = `${chartWidth}px`;
  container.innerHTML = "";
  if (heatmapChart) heatmapChart.destroy();
  const stage = document.createElement("div");
  stage.className = "heatmap-stage";
  stage.style.width = `${chartWidth}px`;
  stage.style.height = `${chartHeight}px`;
  const chartHost = document.createElement("div");
  chartHost.className = "heatmap-chart-host";
  const frozenXAxis = document.createElement("div");
  frozenXAxis.className = "heatmap-frozen-x";
  frozenXAxis.innerHTML = axisCategories.map((label, index) => label
    ? `<span style="left:${86 + (index + 0.5) * heatmapCellSize}px">${label}</span>`
    : "").join("");
  const frozenYAxis = document.createElement("div");
  frozenYAxis.className = "heatmap-frozen-y";
  const yAxisRange = yPositions.at(-1) + 1.1;
  frozenYAxis.innerHTML = yPositions.map((position, index) => (
    `<span style="top:${48 + ((position + 0.55) / yAxisRange) * (chartHeight - 48 - 28)}px">${visiblePeople[index]}</span>`
  )).join("");
  stage.append(chartHost, frozenXAxis, frozenYAxis);
  container.append(stage);
  heatmapChart = window.Highcharts.chart(chartHost, {
    chart: {
      type: "heatmap",
      width: chartWidth,
      height: chartHeight,
      backgroundColor: "transparent",
      animation: false,
      spacing: [0, 0, 0, 0],
      marginTop: 48,
      marginRight: 16,
      marginBottom: 28,
      marginLeft: 86,
      alignTicks: false,
    },
    title: { text: undefined },
    accessibility: { enabled: false },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      type: "linear",
      opposite: true,
      offset: 2,
      min: -0.5,
      max: axisCategories.length - 0.5,
      startOnTick: false,
      endOnTick: false,
      tickPositions: axisCategories.map((_, index) => index),
      minPadding: 0,
      maxPadding: 0,
      lineWidth: 0,
      tickLength: 0,
      labels: {
        enabled: false,
      },
      title: { text: undefined },
    },
    yAxis: {
      type: "linear",
      reversed: true,
      offset: 4,
      min: -0.55,
      max: yPositions.at(-1) + 0.55,
      startOnTick: false,
      endOnTick: false,
      tickPositions: yPositions,
      minPadding: 0,
      maxPadding: 0,
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      labels: {
        enabled: false,
      },
      title: { text: undefined },
    },
    tooltip: {
      enabled: true,
      outside: true,
      useHTML: true,
      headerFormat: "",
      pointFormat: "<b>{point.custom.person}</b><br>{point.custom.dateLabel}<br>{point.custom.shifts}",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      borderColor: "#b8c8da",
      borderRadius: 8,
      shadow: true,
      style: { color: "#26384f", fontSize: "12px" },
    },
    plotOptions: {
      series: {
        animation: false,
        clip: false,
        states: { inactive: { opacity: 1 } },
        point: { events: { click() { handleHeatmapSwapClick(this.options.custom); } } },
      },
      heatmap: { clip: false, turboThreshold: 0, pointPadding: 0 },
    },
    series: [{
      type: "heatmap",
      name: "排班",
      data: points,
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.38)",
      nullColor: colors.none,
      colsize: 1,
      rowsize: 1,
      pointPadding: 0,
      clip: false,
      turboThreshold: 0,
      states: { hover: { brightness: 0.06, borderColor: "rgba(0, 0, 0, 0.56)", borderWidth: 1 } },
      dataLabels: {
        enabled: true,
        formatter() { return this.point.options.custom?.marker || ""; },
        style: { color: "#27364a", fontSize: "11px", fontWeight: "700", textOutline: "none" },
      },
    }],
  });
  const yAxis = heatmapChart.yAxis[0];
  [...frozenYAxis.children].forEach((label, index) => {
    label.style.top = `${yAxis.toPixels(yPositions[index], false)}px`;
  });
}

async function exportExcel() {
  const button = document.querySelector("#export-button");
  button.disabled = true;
  button.textContent = "导出中…";
  try {
    const workbook = new window.ExcelJS.Workbook();
    workbook.creator = "科室排班总览";
    const totalSheet = workbook.addWorksheet("排班总表", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    totalSheet.addRow(["日期", ...columns.map(([, label]) => label)]);
    const header = totalSheet.getRow(1);
    header.height = 25;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF175EA8" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    const dates = Object.keys(schedule).sort();
    dates.forEach((dateKey, index) => {
      const { day, weekday, date } = dateLabel(dateKey);
      const row = totalSheet.addRow([`${day} ${weekday}`, ...columns.map(([id]) => (schedule[dateKey][id] || []).join("、"))]);
      row.height = 31;
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = { bottom: { style: "thin", color: { argb: "FFD9E1EA" } }, right: { style: "thin", color: { argb: "FFD9E1EA" } } };
        if (date.getDay() === 0 || date.getDay() === 6) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F9FF" } };
      });
      if (date.getDay() === 0 && index < dates.length - 1) totalSheet.addRow([]).height = 7;
    });
    totalSheet.getColumn(1).width = 16;
    columns.forEach((_, index) => { totalSheet.getColumn(index + 2).width = 19; });

    const heatmapSheet = workbook.addWorksheet("人员热力图", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    heatmapSheet.addRow(["姓名", ...dates.map((dateKey) => new Date(`${dateKey}T00:00:00`).getDate())]);
    heatmapSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FF344054" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF2FA" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    const fillColors = { none: "FFE8EEF5", xray: "FF0090F2", ct: "FF00D781", us: "FFDD287A", other: "FFD7AF00", night: "FF0F4294" };
    people.forEach((person) => {
      const row = heatmapSheet.addRow([person, ...dates.map((dateKey) => {
        const style = cellStyle(shiftsFor(person, dateKey));
        return `${style.marker}${style.hasNight ? "夜" : ""}`;
      })]);
      row.height = 24;
      dates.forEach((dateKey, dateIndex) => {
        const style = cellStyle(shiftsFor(person, dateKey));
        const cell = row.getCell(dateIndex + 2);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColors[style.category] } };
        cell.font = { bold: true, color: { argb: style.category === "none" ? "FF9AA7B5" : "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = { top: { style: "thin", color: { argb: "FF475467" } }, left: { style: "thin", color: { argb: "FF475467" } }, bottom: { style: "thin", color: { argb: "FF475467" } }, right: { style: "thin", color: { argb: "FF475467" } } };
      });
    });
    heatmapSheet.getColumn(1).width = 13;
    dates.forEach((_, index) => { heatmapSheet.getColumn(index + 2).width = 4.5; });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `科室排班_2026年9月_${currentVersion?.label || "当前版本"}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    tableStatus = "Excel已导出";
    renderTable();
  } finally {
    button.disabled = false;
    button.textContent = "导出 Excel";
  }
}

function formatPeriod(periodKey) {
  const [start, end] = String(periodKey || "").split("_");
  if (!start || !end) return "2026.08.31 — 09.27";
  const startParts = start.split("-");
  const endParts = end.split("-");
  return `${startParts[0]}.${startParts[1]}.${startParts[2]} — ${endParts[1]}.${endParts[2]}`;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function readLocalValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocalValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function versionNumberOf(item) {
  return item?.versionNumber
    || Number(String(item?.label || "").match(/第(\d+)版/)?.[1])
    || 0;
}

function makeCloudMeta(version, payload = null) {
  return {
    id: version.id,
    label: `${version.label}（云端）`,
    status: "云端保存",
    versionNumber: version.versionNumber,
    periodKey: version.periodKey,
    cloud: true,
    createdAt: version.createdAt,
    ...(payload ? { payload } : {}),
  };
}

async function fetchCloudVersions() {
  if (!globalThis.ScheduleApi) return [];
  const session = await ScheduleApi.checkSession();
  if (!session.authenticated && !ScheduleApi.hasToken()) return [];
  try {
    if (!session.authenticated) await ScheduleApi.ensureAccess();
    const result = await ScheduleApi.listVersions();
    return (result.versions || []).map((item) => makeCloudMeta(item));
  } catch {
    return [];
  }
}

function currentPayload(versionNumber, label) {
  const dates = Object.keys(schedule).sort();
  return {
    version: versionNumber,
    label,
    status: "本地保存",
    periodKey: currentPeriodKey || `${dates[0]}_${dates.at(-1)}`,
    savedAt: new Date().toISOString(),
    preferences: cloneData(preferences),
    schedule: cloneData(schedule),
  };
}

function renderVersionOptions(selectedId) {
  const select = document.querySelector("#version-select");
  select.innerHTML = versions.map((item) => `<option value="${item.id}">${item.label}</option>`).join("");
  if (selectedId) select.value = selectedId;
}

function makeDraftMeta(payload) {
  return {
    id: "local-draft",
    label: "暂存草稿",
    status: "仅保存在本地",
    localDraft: true,
    payload,
  };
}

async function saveDraft() {
  const button = document.querySelector("#draft-button");
  const originalText = button.textContent;
  try {
    button.disabled = true;
    button.textContent = "暂存中…";
    const payload = currentPayload(currentVersion?.versionNumber, "暂存草稿");
    writeLocalValue(LOCAL_DRAFT_KEY, payload);
    const draftMeta = makeDraftMeta(payload);
    versions = [draftMeta, ...versions.filter((item) => !item.localDraft)];
    currentVersion = draftMeta;
    renderVersionOptions(draftMeta.id);
    document.querySelector("#version-status").textContent = "暂存草稿 · 仅保存在本地";
    tableStatus = "当前调整已暂存，刷新页面后仍可恢复";
    renderTable();
  } catch {
    tableStatus = "暂存失败：浏览器本地存储不可用";
    renderTable();
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function saveAsNewVersion() {
  const button = document.querySelector("#save-version-button");
  const originalText = button.textContent;
  try {
    button.disabled = true;
    button.textContent = "保存中…";
    if (!globalThis.ScheduleApi) throw new Error("排班云端接口未加载");
    const versionNumbers = versions.map((item) => versionNumberOf(item));
    const nextVersionNumber = Math.max(29, ...versionNumbers) + 1;
    const label = `第${nextVersionNumber}版`;
    const payload = currentPayload(nextVersionNumber, label);
    payload.status = "云端保存";

    const cloudResult = await ScheduleApi.createVersion(payload);
    const cloudVersion = cloudResult.version;
    const cloudPayload = cloudVersion.payload || payload;
    const meta = makeCloudMeta(cloudVersion, cloudPayload);
    meta.label = `${cloudVersion.label}（云端）`;

    const localMirror = {
      id: `local-v${cloudVersion.versionNumber}-${Date.now()}`,
      label: `${cloudVersion.label}（本地备份）`,
      status: "本地备份",
      versionNumber: cloudVersion.versionNumber,
      local: true,
      payload: cloneData(cloudPayload),
    };
    const savedVersions = readLocalValue(LOCAL_VERSIONS_KEY, []);
    writeLocalValue(LOCAL_VERSIONS_KEY, [localMirror, ...savedVersions]);
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    versions = [meta, ...versions.filter((item) => !item.localDraft && item.id !== meta.id)];
    currentVersion = meta;
    currentPeriodKey = cloudPayload.periodKey || payload.periodKey;
    renderVersionOptions(meta.id);
    document.querySelector("#version-status").textContent = `${meta.label} · ${meta.status}`;
    tableStatus = `换班结果已保存为${cloudVersion.label}（云端）`;
    renderTable();
  } catch (error) {
    tableStatus = `保存失败：${error.message || "云端不可用"}`;
    renderTable();
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function loadVersion(versionId) {
  const meta = versions.find((item) => item.id === versionId);
  if (!meta) throw new Error("未找到排班版本");
  const loading = document.querySelector("#loading-screen");
  loading.textContent = `正在载入${meta.label}…`;
  loading.classList.remove("is-hidden");
  let payload;
  if (meta.payload) payload = cloneData(meta.payload);
  else if (meta.cloud) {
    const result = await ScheduleApi.getVersion(meta.id);
    payload = cloneData(result.version.payload);
    meta.payload = payload;
    meta.versionNumber = result.version.versionNumber;
    meta.periodKey = result.version.periodKey;
  } else {
    const response = await fetch(`./data/${meta.file}`);
    if (!response.ok) throw new Error(`${meta.label}数据读取失败`);
    payload = await response.json();
  }
  schedule = cloneData(payload.schedule);
  preferences = cloneData(payload.preferences || {});
  currentVersion = meta;
  currentPeriodKey = payload.periodKey || meta.periodKey || "";
  tableMoveSource = null;
  tableStatus = "拖动姓名调整岗位或夜班日期";
  heatmapSwapSource = null;
  heatmapSwapStatus = "点击热力格选择换班，再点击蓝框候选格完成互换";
  document.querySelector("#period-label").textContent = formatPeriod(payload.periodKey || currentPeriodKey);
  document.querySelector("#version-status").textContent = `${meta.label} · ${meta.status}`;
  document.querySelector("#day-count").textContent = Object.keys(schedule).length;
  document.querySelector("#version-select").value = meta.id;
  renderTable();
  renderHeatmap();
  loading.classList.add("is-hidden");
}

async function init() {
  try {
    const response = await fetch("./data/versions.json");
    if (!response.ok) throw new Error("排班数据读取失败");
    const manifest = await response.json();
    const savedVersions = readLocalValue(LOCAL_VERSIONS_KEY, []);
    const draftPayload = readLocalValue(LOCAL_DRAFT_KEY, null);
    const cloudVersions = await fetchCloudVersions();
    versions = [
      ...(draftPayload ? [makeDraftMeta(draftPayload)] : []),
      ...cloudVersions,
      ...savedVersions,
      ...(manifest.versions || []),
    ];
    renderVersionOptions();
    document.querySelector("#people-count").textContent = people.length;
    await loadVersion(draftPayload
      ? "local-draft"
      : cloudVersions[0]?.id || savedVersions[0]?.id || manifest.defaultVersion || versions[0]?.id);
  } catch (error) {
    document.querySelector("#loading-screen").textContent = `${error.message}，请通过本地预览地址打开。`;
  }
}

document.querySelector("#person-search").addEventListener("input", (event) => {
  query = event.target.value.trim();
  renderTable();
  renderHeatmap();
});
const scheduleTable = document.querySelector("#schedule-table");
scheduleTable.addEventListener("dragstart", (event) => {
  const chip = event.target.closest(".person-chip");
  if (!chip) return;
  tableMoveSource = { person: chip.dataset.person, dateKey: chip.dataset.date, columnId: chip.dataset.column };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", JSON.stringify(tableMoveSource));
  requestAnimationFrame(() => updateDropHighlights());
});
scheduleTable.addEventListener("dragover", (event) => {
  const cell = event.target.closest("td[data-date]");
  if (!cell || !canMoveAssignment(tableMoveSource, cell.dataset.date, cell.dataset.column)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  updateDropHighlights(cell);
});
scheduleTable.addEventListener("dragleave", (event) => {
  if (!event.target.closest("td[data-date]")) return;
  updateDropHighlights();
});
scheduleTable.addEventListener("drop", (event) => {
  const cell = event.target.closest("td[data-date]");
  if (!cell) return;
  event.preventDefault();
  moveAssignment(tableMoveSource, cell.dataset.date, cell.dataset.column);
});
scheduleTable.addEventListener("dragend", () => {
  if (tableMoveSource) {
    tableMoveSource = null;
    updateDropHighlights();
  }
});
scheduleTable.addEventListener("click", (event) => {
  const chip = event.target.closest(".person-chip");
  if (chip) {
    event.stopPropagation();
    const nextSource = { person: chip.dataset.person, dateKey: chip.dataset.date, columnId: chip.dataset.column };
    tableMoveSource = tableMoveSource
      && tableMoveSource.person === nextSource.person
      && tableMoveSource.dateKey === nextSource.dateKey
      && tableMoveSource.columnId === nextSource.columnId
      ? null
      : nextSource;
    tableStatus = tableMoveSource ? `已选择${tableMoveSource.person}，蓝框为可移动位置` : "拖动姓名调整岗位或夜班日期";
    renderTable();
    return;
  }
  const cell = event.target.closest("td[data-date]");
  if (cell && canMoveAssignment(tableMoveSource, cell.dataset.date, cell.dataset.column)) {
    moveAssignment(tableMoveSource, cell.dataset.date, cell.dataset.column);
  }
});
document.querySelector("#export-button").addEventListener("click", exportExcel);
document.querySelector("#draft-button").addEventListener("click", saveDraft);
document.querySelector("#save-version-button").addEventListener("click", saveAsNewVersion);
document.querySelector("#version-select").addEventListener("change", async (event) => {
  try {
    await loadVersion(event.target.value);
  } catch (error) {
    document.querySelector("#loading-screen").textContent = error.message;
  }
});
document.querySelector("#shift-label-toggle").addEventListener("click", (event) => {
  showShiftLabels = !showShiftLabels;
  event.currentTarget.setAttribute("aria-pressed", String(showShiftLabels));
  renderHeatmap();
});
let heatmapResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(heatmapResizeTimer);
  heatmapResizeTimer = setTimeout(() => {
    if (!document.querySelector("#heatmap-view").classList.contains("is-hidden")) renderHeatmap();
  }, 120);
});
init();
