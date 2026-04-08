// 全局语言配置，统一为中文，避免中英混杂
Highcharts.setOptions({
  lang: {
    contextButtonTitle: '图表导出菜单',
    decimalPoint: '.',
    thousandsSep: ',',
    downloadPNG: '下载 PNG 图片',
    downloadJPEG: '下载 JPEG 图片',
    downloadPDF: '下载 PDF 文件',
    downloadSVG: '下载 SVG 矢量图',
    printChart: '打印图表',
    viewFullscreen: '全屏查看',
    exitFullscreen: '退出全屏',
    resetZoom: '重置缩放',
    resetZoomTitle: '重置缩放比例为 1:1',
    loading: '加载中...',
    noData: '暂无数据',
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  }
});

loadCSV('等待时长.csv', function (submitCsv) {
  var submitRows = parseCSV(submitCsv);
  if (submitRows.length <= 1) {
    alert('等待时长.csv 内容为空或只有表头');
    return;
  }

  var header = submitRows[0].map(function (h) { return (h || '').trim(); });
  var idxDate = header.indexOf('日期');
  var idxNature = header.indexOf('日期性质');
  var idxSlot = header.indexOf('等待时长区间');
  var idxCnt = header.indexOf('该时长对应病例数');

  if (idxDate === -1 || idxNature === -1 || idxSlot === -1 || idxCnt === -1) {
    alert('等待时长.csv 表头缺少 必要列：日期 / 日期性质 / 等待时长区间 / 该时长对应病例数');
    return;
  }

  var startSel = document.getElementById('start-month');
  var endSel = document.getElementById('end-month');
  var exportBtn = document.getElementById('export-excel-btn');

  var monthsSet = {};
  for (var i = 1; i < submitRows.length; i++) {
    var cols = submitRows[i];
    if (!cols || !cols.length) continue;
    var dateStr = cols[idxDate];
    if (!dateStr) continue;
    var mk = dateStr.substring(0, 7);
    monthsSet[mk] = true;
  }
  var monthsAll = Object.keys(monthsSet).sort();
  var minStartMonth = '2026-01';
  if (monthsAll.length && monthsAll[0] > minStartMonth) {
    var filled = [];
    var y = parseInt(minStartMonth.split('-')[0], 10);
    var m0 = parseInt(minStartMonth.split('-')[1], 10);
    var target = monthsAll[0];
    while (true) {
      var key = y + '-' + ('0' + m0).slice(-2);
      if (key >= target) break;
      filled.push(key);
      m0++; if (m0 > 12) { m0 = 1; y++; }
    }
    monthsAll = filled.concat(monthsAll);
  }

  if (monthsAll.length) {
    monthsAll.forEach(function (m) {
      var opt1 = document.createElement('option');
      opt1.value = m; opt1.textContent = m; startSel.appendChild(opt1);
      var opt2 = document.createElement('option');
      opt2.value = m; opt2.textContent = m; endSel.appendChild(opt2);
    });
    startSel.value = monthsAll.indexOf(minStartMonth) >= 0 ? minStartMonth : monthsAll[0];
    endSel.value = monthsAll[monthsAll.length - 1];
  }

  function inRange(monthKey, startMonth, endMonth) {
    return monthKey && monthKey >= startMonth && monthKey <= endMonth;
  }

  function getMonthRange() {
    var startMonth = startSel.value;
    var endMonth = endSel.value;
    if (startMonth > endMonth) {
      var tmp = startMonth;
      startMonth = endMonth;
      endMonth = tmp;
    }
    return { startMonth: startMonth, endMonth: endMonth };
  }

  var weekdayOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var WEEK_COLORS = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#f45b5b', '#95a5a6', '#2b908f'];
  var slotOrder = ['0.5h', '1h', '1.5h', '2h', '2.5h', '3h', '3.5h', '4h', '4h+'];
  // 等待时长明细配色
  var SLOT_COLORS = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#f45b5b', '#95a5a6', '#2b908f', '#f15c80', '#8085e9'];

  function setWeeklyVisible(weekday) {
    var map = {
      '周一': 'wrap-time-submit-weekly-mon',
      '周二': 'wrap-time-submit-weekly-tue',
      '周三': 'wrap-time-submit-weekly-wed',
      '周四': 'wrap-time-submit-weekly-thu',
      '周五': 'wrap-time-submit-weekly-fri',
      '周六': 'wrap-time-submit-weekly-sat',
      '周日': 'wrap-time-submit-weekly-sun'
    };
    Object.keys(map).forEach(function (wd) {
      var wrap = document.getElementById(map[wd]);
      if (!wrap) return;
      if (!weekday) {
        // 不指定星期几时，默认展示所有明细表
        wrap.style.display = 'block';
      } else {
        // 指定星期几时，仅展示对应的一个
        wrap.style.display = (wd === weekday) ? 'block' : 'none';
      }
    });
  }

  function renderWeekdayMonthly() {
    var range = getMonthRange();
    var startMonth = range.startMonth;
    var endMonth = range.endMonth;

    var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
    if (!monthsInRange.length) {
      Highcharts.chart('container-time-submit-weekday-monthly', {
        chart: { type: 'column' },
        title: { text: null },
        series: []
      });
      return;
    }

    var agg = {}; // weekday -> monthKey -> sum
    for (var i1 = 1; i1 < submitRows.length; i1++) {
      var cols = submitRows[i1];
      if (!cols || !cols.length) continue;
      var dateStr = cols[idxDate];
      var nat = (cols[idxNature] || '').trim();
      var cnt = parseFloat(cols[idxCnt] || '0');
      if (!dateStr || !nat || isNaN(cnt)) continue;
      var mk = dateStr.substring(0, 7);
      if (!inRange(mk, startMonth, endMonth)) continue;
      if (!agg[nat]) agg[nat] = {};
      agg[nat][mk] = (agg[nat][mk] || 0) + cnt;
    }

    var series = [];
    weekdayOrder.forEach(function (wd, idx) {
      var monthSum = agg[wd] || {};
      var dataArr = [];
      monthsInRange.forEach(function (mkey) {
        var v = monthSum[mkey] || 0;
        if (!v) return;
        var parts = mkey.split('-');
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var xVal = Date.UTC(year, month, 1);
        dataArr.push([xVal, v]);
      });
      if (!dataArr.length) return;
      series.push({
        name: wd,
        type: 'column',
        data: dataArr,
        color: WEEK_COLORS[idx % WEEK_COLORS.length]
      });
    });

    Highcharts.chart('container-time-submit-weekday-monthly', {
      chart: {
        type: 'column',
        zoomType: 'x',
        events: {
          // 点击表1空白区域时，恢复显示全部周一~周日明细图
          click: function () {
            setWeeklyVisible(null);
          }
        }
      },
      title: { text: null },
      xAxis: {
        type: 'datetime',
        title: { text: null },
        labels: { formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); } }
      },
      yAxis: { title: { text: '病例数' }, min: 0, allowDecimals: false },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'top' },
      credits: { enabled: false },
      tooltip: {
        shared: false,
        pointFormat: '<span style=\"color:{point.color}\">{series.name}</span>: <b>{point.y}</b><br/>'
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            inside: false,
            formatter: function () { return this.y ? this.y : ''; }
          },
          point: {
            events: {
              click: function () {
                var wd = this.series.name;
                setWeeklyVisible(wd);
              }
            }
          }
        }
      },
      series: series
    });
  }

  function renderWaitMonthlyForWeekday(weekday, containerId) {
    var range = getMonthRange();
    var startMonth = range.startMonth;
    var endMonth = range.endMonth;

    var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
    if (!monthsInRange.length) {
      Highcharts.chart(containerId, {
        chart: { type: 'column' },
        title: { text: null },
        series: []
      });
      return;
    }

    var agg = {}; // slot -> monthKey -> sum
    for (var i2 = 1; i2 < submitRows.length; i2++) {
      var cols = submitRows[i2];
      if (!cols || !cols.length) continue;
      var dateStr = cols[idxDate];
      var nat = (cols[idxNature] || '').trim();
      var slot = (cols[idxSlot] || '').trim();
      var cnt = parseFloat(cols[idxCnt] || '0');
      if (!dateStr || !slot || nat !== weekday || isNaN(cnt)) continue;
      var mk = dateStr.substring(0, 7);
      if (!inRange(mk, startMonth, endMonth)) continue;
      if (!agg[slot]) agg[slot] = {};
      agg[slot][mk] = (agg[slot][mk] || 0) + cnt;
    }

    var series = [];
    slotOrder.forEach(function (slot, idx) {
      var monthSum = agg[slot] || {};
      var dataArr = [];
      monthsInRange.forEach(function (mkey) {
        var v = monthSum[mkey] || 0;
        if (!v) return;
        var parts = mkey.split('-');
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var xVal = Date.UTC(year, month, 1);
        dataArr.push([xVal, v]);
      });
      if (!dataArr.length) return;
      series.push({
        name: slot,
        type: 'column',
        data: dataArr,
        color: SLOT_COLORS[idx % SLOT_COLORS.length]
      });
    });

    Highcharts.chart(containerId, {
      chart: { type: 'column', zoomType: 'x' },
      title: { text: null },
      xAxis: {
        type: 'datetime',
        title: { text: null },
        labels: { formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); } }
      },
      yAxis: { title: { text: '病例数' }, min: 0, allowDecimals: false },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'top' },
      credits: { enabled: false },
      tooltip: {
        shared: false,
        pointFormat: '<span style=\"color:{point.color}\">{series.name}</span>: <b>{point.y}</b><br/>'
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            inside: false,
            formatter: function () { return this.y ? this.y : ''; }
          }
        }
      },
      series: series
    });
  }

  function renderAll() {
    renderWeekdayMonthly();
    // 默认不展示下方详细图，等待点击激活
    renderWaitMonthlyForWeekday('周一', 'container-time-submit-weekly-mon');
    renderWaitMonthlyForWeekday('周二', 'container-time-submit-weekly-tue');
    renderWaitMonthlyForWeekday('周三', 'container-time-submit-weekly-wed');
    renderWaitMonthlyForWeekday('周四', 'container-time-submit-weekly-thu');
    renderWaitMonthlyForWeekday('周五', 'container-time-submit-weekly-fri');
    renderWaitMonthlyForWeekday('周六', 'container-time-submit-weekly-sat');
    renderWaitMonthlyForWeekday('周日', 'container-time-submit-weekly-sun');
    setWeeklyVisible(null);
  }

  function exportExcelByMonthRange() {
    if (typeof XLSX === 'undefined') {
      alert('导出需要 SheetJS，请刷新页面后重试');
      return;
    }

    var range = getMonthRange();
    var startMonth = range.startMonth;
    var endMonth = range.endMonth;

    var sheet1Map = {}; // month|slot -> count
    var sheet2Map = {}; // month|nature|slot -> count

    for (var i = 1; i < submitRows.length; i++) {
      var cols = submitRows[i];
      if (!cols || !cols.length) continue;

      var dateStr = cols[idxDate];
      var nature = (cols[idxNature] || '').trim();
      var slot = (cols[idxSlot] || '').trim();
      var cnt = parseFloat(cols[idxCnt] || '0');
      if (!dateStr || !nature || !slot || isNaN(cnt)) continue;

      var monthKey = dateStr.substring(0, 7);
      if (!inRange(monthKey, startMonth, endMonth)) continue;

      var k1 = monthKey + '|' + slot;
      sheet1Map[k1] = (sheet1Map[k1] || 0) + cnt;

      var k2 = monthKey + '|' + nature + '|' + slot;
      sheet2Map[k2] = (sheet2Map[k2] || 0) + cnt;
    }

    var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
    var s1Rows = [];
    monthsInRange.forEach(function (m) {
      slotOrder.forEach(function (slot) {
        var key = m + '|' + slot;
        if (!sheet1Map[key]) return;
        s1Rows.push([m, slot, sheet1Map[key]]);
      });
    });

    var s2Rows = [];
    monthsInRange.forEach(function (m) {
      weekdayOrder.forEach(function (nature) {
        slotOrder.forEach(function (slot) {
          var key = m + '|' + nature + '|' + slot;
          if (!sheet2Map[key]) return;
          s2Rows.push([m, nature, slot, sheet2Map[key]]);
        });
      });
    });

    var wb = XLSX.utils.book_new();
    var ws1 = XLSX.utils.aoa_to_sheet([['月份', '等待时长区间', '该时长对应病例数量']].concat(s1Rows));
    var ws2 = XLSX.utils.aoa_to_sheet([['月份', '日期性质', '等待时长区间', '该时长对应病例数量']].concat(s2Rows));
    XLSX.utils.book_append_sheet(wb, ws1, '全时间段');
    XLSX.utils.book_append_sheet(wb, ws2, '按星期划分');
    XLSX.writeFile(wb, '等待时长数量_' + startMonth + '_到_' + endMonth + '.xlsx');
  }

  renderAll();
  if (startSel && endSel) {
    startSel.addEventListener('change', renderAll);
    endSel.addEventListener('change', renderAll);
  }
  if (exportBtn) {
    exportBtn.addEventListener('click', exportExcelByMonthRange);
  }
});

