loadCSV('交单时段.csv', function (submitCsv) {
  var submitRows = parseCSV(submitCsv);
  if (submitRows.length <= 1) {
    alert('交单时段.csv 内容为空或只有表头');
    return;
  }

  var submitHeader = submitRows[0].map(function (h) { return (h || '').trim(); });
  var idxDate1 = submitHeader.indexOf('日期');
  var idxNature1 = submitHeader.indexOf('日期性质');
  var idxSlot = submitHeader.indexOf('交单时段');
  var idxCnt1 = submitHeader.indexOf('该交单时段对应病例数');

  if (idxDate1 === -1 || idxSlot === -1 || idxCnt1 === -1) {
    alert('CSV 表头中缺少 必要列：日期 / 交单时段 / 交单时段对应病例数');
    return;
  }

  // 等待时长
  loadCSV('等待时长.csv', function (waitCsv) {
    var waitRows = parseCSV(waitCsv);
    if (waitRows.length <= 1) {
      alert('等待时长.csv 内容为空或只有表头');
      return;
    }

    var waitHeader = waitRows[0].map(function (h) { return (h || '').trim(); });
    var idxDate2 = waitHeader.indexOf('日期');
    var idxNature2 = waitHeader.indexOf('日期性质');
    var idxWaitBin = waitHeader.indexOf('等待时长');
    if (idxWaitBin === -1) idxWaitBin = waitHeader.indexOf('等待时长区间');
    var idxCnt2 = waitHeader.indexOf('该时长对应病例数');

    if (idxDate2 === -1 || idxWaitBin === -1 || idxCnt2 === -1) {
      alert('CSV 表头中缺少 必要列：日期 / 等待时长(或等待时长区间) / 时长对应病例数');
      return;
    }

    var slotOrder = ['8:30-10:30', '10:30-12:00', '12:00-14:00', '14:00-16:30', '16:30-20:30'];
    var WAIT_BIN_ORDER = ['0.5h', '1h', '1.5h', '2h', '2.5h', '3h', '3.5h', '4h', '4h+'];

    function safeSeriesId(text) {
      return String(text || '').replace(/[^\w]/g, '_');
    }

    // ========= 表格1：交单时段（日度）散点 + 回归 =========
    var submitSeriesMap = {}; // slot -> [{x,y,slot}]
    var submitPointsBySlot = {}; // slot -> [{x,y}]
    var submitMonthsSet = {};

    for (var i = 1; i < submitRows.length; i++) {
      var cols = submitRows[i];
      if (!cols || !cols.length) continue;
      var dateStr = cols[idxDate1];
      var slot = cols[idxSlot] || '';
      var count = parseFloat(cols[idxCnt1] || '0');
      if (!dateStr || !slot) continue;
      var parts = dateStr.split('-');
      if (parts.length < 3) continue;
      var year = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10) - 1;
      var day = parseInt(parts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) continue;
      var xVal = Date.UTC(year, month, day);
      var monthKey = dateStr.substring(0, 7);
      if (!submitSeriesMap[slot]) submitSeriesMap[slot] = [];
      submitSeriesMap[slot].push({ x: xVal, y: count, slot: slot, _monthKey: monthKey });

      if (!submitPointsBySlot[slot]) submitPointsBySlot[slot] = [];
      submitPointsBySlot[slot].push({ x: xVal, y: count, _monthKey: monthKey });

      submitMonthsSet[monthKey] = true;
    }

    var months1 = Object.keys(submitMonthsSet).sort();

    // ========= 表格2：等待时长（日度）散点 + 回归 =========
    var waitSeriesMap = {}; // bin -> [{x,y,bin}]
    var waitPointsByBin = {};
    var waitMonthsSet = {};

    for (var j = 1; j < waitRows.length; j++) {
      var wcols = waitRows[j];
      if (!wcols || !wcols.length) continue;
      var wDateStr = wcols[idxDate2];
      var bin = wcols[idxWaitBin] || '';
      var wCount = parseFloat(wcols[idxCnt2] || '0');
      if (!wDateStr || !bin) continue;
      var wParts = wDateStr.split('-');
      if (wParts.length < 3) continue;
      var wy = parseInt(wParts[0], 10);
      var wm = parseInt(wParts[1], 10) - 1;
      var wd = parseInt(wParts[2], 10);
      if (isNaN(wy) || isNaN(wm) || isNaN(wd)) continue;
      var wxVal = Date.UTC(wy, wm, wd);
      var monthKey2 = wDateStr.substring(0, 7);
      if (!waitSeriesMap[bin]) waitSeriesMap[bin] = [];
      waitSeriesMap[bin].push({ x: wxVal, y: wCount, bin: bin, _monthKey: monthKey2 });

      if (!waitPointsByBin[bin]) waitPointsByBin[bin] = [];
      waitPointsByBin[bin].push({ x: wxVal, y: wCount, _monthKey: monthKey2 });

      waitMonthsSet[monthKey2] = true;
    }

    // ========= 多项式回归：复用 cases_scatter 里的实现 =========
    var startSel = document.getElementById('start-month');
    var endSel = document.getElementById('end-month');
    var exportBtn = document.getElementById('export-excel-btn');

    var monthsSetAll = {};
    Object.keys(submitMonthsSet).forEach(function (m) { monthsSetAll[m] = true; });
    Object.keys(waitMonthsSet).forEach(function (m) { monthsSetAll[m] = true; });

    var monthsAll = Object.keys(monthsSetAll).sort();
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

    /** monthKey: 'YYYY-MM'，delta 为月偏移（负数为往前） */
    function addCalendarMonths(monthKey, delta) {
      var p = monthKey.split('-');
      var y = parseInt(p[0], 10);
      var m = parseInt(p[1], 10);
      if (isNaN(y) || isNaN(m)) return monthKey;
      var idx = y * 12 + (m - 1) + delta;
      var ny = Math.floor(idx / 12);
      var nm = (idx % 12) + 1;
      return ny + '-' + ('0' + nm).slice(-2);
    }

    function slotMonthTotal(slot, monthKey) {
      var s = 0;
      var pts = submitPointsBySlot[slot] || [];
      for (var si = 0; si < pts.length; si++) {
        if (pts[si]._monthKey === monthKey) s += pts[si].y;
      }
      return s;
    }

    function binMonthTotal(bin, monthKey) {
      var s = 0;
      var pts = waitPointsByBin[bin] || [];
      for (var bi = 0; bi < pts.length; bi++) {
        if (pts[bi]._monthKey === monthKey) s += pts[bi].y;
      }
      return s;
    }

    /** 分母为 0 或无效时返回 null（柱形省略） */
    function pctGrowth(curr, base) {
      if (typeof base !== 'number' || typeof curr !== 'number') return null;
      if (base > 0) return ((curr - base) / base) * 100;
      if (base === 0 && curr === 0) return 0;
      return null;
    }

    function emptyGrowthChart(containerId, message) {
      Highcharts.chart(containerId, {
        chart: { type: 'column' },
        title: { text: message || '暂无数据', style: { fontSize: '14px' } },
        series: [],
        credits: { enabled: false }
      });
    }

    function renderGrowthColumnChart(opts) {
      var containerId = opts.containerId;
      var categories = opts.categories;
      var colors = opts.colors;
      var yTitle = opts.yTitle;
      var tooltipBaseLabel = opts.tooltipBaseLabel;
      var baseMonth = opts.baseMonth;
      var currMonth = opts.currMonth;
      var getBase = opts.getBase;
      var getCurr = opts.getCurr;

      var hasAny = false;
      var seriesData = categories.map(function (cat, idx) {
        var b = getBase(cat);
        var c = getCurr(cat);
        var pct = pctGrowth(c, b);
        if (pct !== null && !isNaN(pct)) hasAny = true;
        return {
          y: pct,
          color: colors[idx % colors.length],
          custom: { baseVal: b, currVal: c }
        };
      });

      if (!hasAny) {
        emptyGrowthChart(containerId, '对比月份数据不足，无法计算增长率');
        return;
      }

      Highcharts.chart(containerId, {
        chart: { type: 'column' },
        title: { text: null },
        xAxis: {
          categories: categories,
          title: { text: null },
          crosshair: true
        },
        yAxis: {
          title: { text: yTitle },
          plotLines: [{ value: 0, width: 1, color: '#999999', zIndex: 3 }]
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
          shared: false,
          pointFormatter: function () {
            var cu = this.custom || {};
            var b = cu.baseVal;
            var c = cu.currVal;
            var pct = this.y;
            var pctStr = pct === null || typeof pct === 'undefined' || isNaN(pct)
              ? '—'
              : pct.toFixed(2) + '%';
            return (
              '<b>' + this.category + '</b><br/>' +
              tooltipBaseLabel + '（' + baseMonth + '）：<b>' + b + '</b><br/>' +
              '当前月（' + currMonth + '）：<b>' + c + '</b><br/>' +
              '增长率：<b>' + pctStr + '</b>'
            );
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              formatter: function () {
                var v = this.y;
                if (v === null || typeof v === 'undefined' || isNaN(v)) return '';
                return v.toFixed(1) + '%';
              }
            }
          }
        },
        series: [{ name: yTitle, data: seriesData }]
      });
    }

    function renderYoyGrowthCharts() {
      var endMonth = endSel.value;
      var baseMonth = addCalendarMonths(endMonth, -12);

      renderGrowthColumnChart({
        containerId: 'container-time-submit-yoy',
        categories: slotOrder,
        yTitle: '同比增长率 (%)',
        tooltipBaseLabel: '去年同期',
        baseMonth: baseMonth,
        currMonth: endMonth,
        colors: slotColors,
        getBase: function (slot) { return slotMonthTotal(slot, baseMonth); },
        getCurr: function (slot) { return slotMonthTotal(slot, endMonth); }
      });

      renderGrowthColumnChart({
        containerId: 'container-time-wait-yoy',
        categories: WAIT_BIN_ORDER,
        yTitle: '同比增长率 (%)',
        tooltipBaseLabel: '去年同期',
        baseMonth: baseMonth,
        currMonth: endMonth,
        colors: waitColors,
        getBase: function (bin) { return binMonthTotal(bin, baseMonth); },
        getCurr: function (bin) { return binMonthTotal(bin, endMonth); }
      });
    }

    function renderMomGrowthCharts() {
      var endMonth = endSel.value;
      var baseMonth = addCalendarMonths(endMonth, -1);

      renderGrowthColumnChart({
        containerId: 'container-time-submit-mom',
        categories: slotOrder,
        yTitle: '环比增长率 (%)',
        tooltipBaseLabel: '上月',
        baseMonth: baseMonth,
        currMonth: endMonth,
        colors: slotColors,
        getBase: function (slot) { return slotMonthTotal(slot, baseMonth); },
        getCurr: function (slot) { return slotMonthTotal(slot, endMonth); }
      });

      renderGrowthColumnChart({
        containerId: 'container-time-wait-mom',
        categories: WAIT_BIN_ORDER,
        yTitle: '环比增长率 (%)',
        tooltipBaseLabel: '上月',
        baseMonth: baseMonth,
        currMonth: endMonth,
        colors: waitColors,
        getBase: function (bin) { return binMonthTotal(bin, baseMonth); },
        getCurr: function (bin) { return binMonthTotal(bin, endMonth); }
      });
    }

    function renderMomWaitHeatmap() {
      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      if (!monthsInRange.length) {
        emptyGrowthChart('container-time-wait-mom-heatmap', '当前月份区间内没有数据');
        return;
      }

      var sumByBinMonth = {};
      WAIT_BIN_ORDER.forEach(function (bin) { sumByBinMonth[bin] = {}; });

      for (var iW = 1; iW < waitRows.length; iW++) {
        var row = waitRows[iW];
        if (!row || !row.length) continue;
        var dateStr = row[idxDate2] || '';
        var bin = (row[idxWaitBin] || '').trim();
        var cnt = parseFloat(row[idxCnt2] || '0');
        if (!dateStr || !bin || isNaN(cnt)) continue;
        if (!sumByBinMonth[bin]) sumByBinMonth[bin] = {};
        var mkey = dateStr.substring(0, 7);
        sumByBinMonth[bin][mkey] = (sumByBinMonth[bin][mkey] || 0) + cnt;
      }

      var data = [];
      var pctGrid = {};
      var maxAbs = 0;
      var validCount = 0;
      WAIT_BIN_ORDER.forEach(function (bin) { pctGrid[bin] = {}; });
      monthsInRange.forEach(function (mkey, monthIdx) {
        var prevMonth = addCalendarMonths(mkey, -1);
        WAIT_BIN_ORDER.forEach(function (bin, binIdx) {
          var curr = (sumByBinMonth[bin] && sumByBinMonth[bin][mkey]) || 0;
          var prev = (sumByBinMonth[bin] && sumByBinMonth[bin][prevMonth]) || 0;
          var pct = pctGrowth(curr, prev);
          var valid = !(pct === null || isNaN(pct));
          if (valid) {
            validCount += 1;
            maxAbs = Math.max(maxAbs, Math.abs(pct));
            pctGrid[bin][mkey] = pct;
          } else {
            pctGrid[bin][mkey] = null;
          }
          data.push({
            x: binIdx,
            y: monthIdx,
            value: valid ? pct : 0,
            custom: {
              month: mkey,
              prevMonth: prevMonth,
              currVal: curr,
              prevVal: prev,
              bin: bin,
              valid: valid,
              pctText: valid ? pct.toFixed(2) + '%' : '—'
            }
          });
        });
      });

      if (!validCount) {
        emptyGrowthChart('container-time-wait-mom-heatmap', '对比月份数据不足，无法计算环比增长率');
        return;
      }

      var bound = Math.max(5, Math.ceil(maxAbs));
      // 单元格高度固定：月份越多，图整体越高
      var cellHeightPx = 36;
      var chartTopBottomPadding = 170;
      var dynamicChartHeight = Math.max(420, chartTopBottomPadding + monthsInRange.length * cellHeightPx);

      function hexToRgb(hex) {
        var h = String(hex || '').replace('#', '');
        return {
          r: parseInt(h.substring(0, 2), 16),
          g: parseInt(h.substring(2, 4), 16),
          b: parseInt(h.substring(4, 6), 16)
        };
      }

      function rgbToHex(rgb) {
        function p(v) {
          var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
          return s.length === 1 ? '0' + s : s;
        }
        return '#' + p(rgb.r) + p(rgb.g) + p(rgb.b);
      }

      function mixColor(c1, c2, t) {
        return {
          r: c1.r + (c2.r - c1.r) * t,
          g: c1.g + (c2.g - c1.g) * t,
          b: c1.b + (c2.b - c1.b) * t
        };
      }

      // 颜色锚点：最低值(蓝) -> 0(白) -> 最高值(粉)
      var blue = hexToRgb('#2f7ed8');
      var white = hexToRgb('#ffffff');
      var pink = hexToRgb('#e74c3c');

      function pctToColor(v) {
        if (v <= 0) {
          return rgbToHex(mixColor(white, blue, Math.min(1, Math.abs(v) / bound)));
        }
        return rgbToHex(mixColor(white, pink, Math.min(1, Math.abs(v) / bound)));
      }

      data.forEach(function (p) {
        p.color = p.custom.valid ? pctToColor(p.value) : '#f5f5f5';
      });

      Highcharts.chart('container-time-wait-mom-heatmap', {
        chart: { type: 'scatter', zoomType: 'xy', height: dynamicChartHeight },
        title: { text: null },
        xAxis: {
          categories: WAIT_BIN_ORDER,
          title: { text: '等待时长区间' },
          tickLength: 0,
          tickInterval: 1,
          labels: {
            step: 1,
            autoRotation: false,
            reserveSpace: true
          }
        },
        yAxis: {
          type: 'category',
          categories: monthsInRange,
          title: { text: '月份' },
          gridLineWidth: 0,
          tickLength: 0,
          tickInterval: 1,
          min: 0,
          max: monthsInRange.length - 1,
          startOnTick: false,
          endOnTick: false,
          labels: {
            enabled: true,
            step: 1,
            reserveSpace: true,
            style: { color: '#333333', fontSize: '12px' }
          }
        },
        legend: {
          enabled: false
        },
        credits: { enabled: false },
        tooltip: {
          useHTML: true,
          formatter: function () {
            var c = this.point.custom || {};
            return '月份：<b>' + c.month + '</b><br/>' +
              '等待时长：' + c.bin + '<br/>' +
              '上月（' + c.prevMonth + '）：<b>' + c.prevVal + '</b><br/>' +
              '当月：<b>' + c.currVal + '</b><br/>' +
              '环比增长率：<b>' + c.pctText + '</b>';
          }
        },
        series: [{
          name: '环比增长率',
          data: data,
          marker: {
            symbol: 'square',
            radius: Math.max(12, Math.floor(cellHeightPx * 0.44)),
            lineColor: '#ffffff',
            lineWidth: 0
          },
          dataLabels: {
            enabled: true,
            align: 'center',
            verticalAlign: 'middle',
            x: 0,
            y: 0,
            crop: false,
            overflow: 'none',
            formatter: function () {
              var c = this.point.custom || {};
              return c.valid ? this.point.value.toFixed(1) + '%' : '';
            },
            style: { textOutline: 'none', fontSize: '10px' }
          }
        }]
      });
    }

    function renderYoyWaitHeatmap() {
      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      if (!monthsInRange.length) {
        emptyGrowthChart('container-time-wait-yoy-heatmap', '当前月份区间内没有数据');
        return;
      }

      var sumByBinMonth = {};
      WAIT_BIN_ORDER.forEach(function (bin) { sumByBinMonth[bin] = {}; });

      for (var iW = 1; iW < waitRows.length; iW++) {
        var row = waitRows[iW];
        if (!row || !row.length) continue;
        var dateStr = row[idxDate2] || '';
        var bin = (row[idxWaitBin] || '').trim();
        var cnt = parseFloat(row[idxCnt2] || '0');
        if (!dateStr || !bin || isNaN(cnt)) continue;
        if (!sumByBinMonth[bin]) sumByBinMonth[bin] = {};
        var mkey = dateStr.substring(0, 7);
        sumByBinMonth[bin][mkey] = (sumByBinMonth[bin][mkey] || 0) + cnt;
      }

      var data = [];
      var pctGrid = {};
      var maxAbs = 0;
      var validCount = 0;
      WAIT_BIN_ORDER.forEach(function (bin) { pctGrid[bin] = {}; });
      monthsInRange.forEach(function (mkey, monthIdx) {
        var prevMonth = addCalendarMonths(mkey, -12);
        WAIT_BIN_ORDER.forEach(function (bin, binIdx) {
          var curr = (sumByBinMonth[bin] && sumByBinMonth[bin][mkey]) || 0;
          var prev = (sumByBinMonth[bin] && sumByBinMonth[bin][prevMonth]) || 0;
          var pct = pctGrowth(curr, prev);
          var valid = !(pct === null || isNaN(pct));
          if (valid) {
            validCount += 1;
            maxAbs = Math.max(maxAbs, Math.abs(pct));
            pctGrid[bin][mkey] = pct;
          } else {
            pctGrid[bin][mkey] = null;
          }
          data.push({
            x: binIdx,
            y: monthIdx,
            value: valid ? pct : 0,
            custom: {
              month: mkey,
              prevMonth: prevMonth,
              currVal: curr,
              prevVal: prev,
              bin: bin,
              valid: valid,
              pctText: valid ? pct.toFixed(2) + '%' : '—'
            }
          });
        });
      });

      if (!validCount) {
        emptyGrowthChart('container-time-wait-yoy-heatmap', '对比月份数据不足，无法计算同比增长率');
        return;
      }

      var bound = Math.max(5, Math.ceil(maxAbs));
      // 单元格高度固定：月份越多，图整体越高
      var cellHeightPx = 36;
      var chartTopBottomPadding = 170;
      var dynamicChartHeight = Math.max(420, chartTopBottomPadding + monthsInRange.length * cellHeightPx);

      function hexToRgb(hex) {
        var h = String(hex || '').replace('#', '');
        return {
          r: parseInt(h.substring(0, 2), 16),
          g: parseInt(h.substring(2, 4), 16),
          b: parseInt(h.substring(4, 6), 16)
        };
      }

      function rgbToHex(rgb) {
        function p(v) {
          var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
          return s.length === 1 ? '0' + s : s;
        }
        return '#' + p(rgb.r) + p(rgb.g) + p(rgb.b);
      }

      function mixColor(c1, c2, t) {
        return {
          r: c1.r + (c2.r - c1.r) * t,
          g: c1.g + (c2.g - c1.g) * t,
          b: c1.b + (c2.b - c1.b) * t
        };
      }

      // 颜色锚点：最低值(蓝) -> 0(白) -> 最高值(粉)
      var blue = hexToRgb('#2f7ed8');
      var white = hexToRgb('#ffffff');
      var pink = hexToRgb('#e74c3c');

      function pctToColor(v) {
        if (v <= 0) {
          return rgbToHex(mixColor(white, blue, Math.min(1, Math.abs(v) / bound)));
        }
        return rgbToHex(mixColor(white, pink, Math.min(1, Math.abs(v) / bound)));
      }

      data.forEach(function (p) {
        p.color = p.custom.valid ? pctToColor(p.value) : '#f5f5f5';
      });

      Highcharts.chart('container-time-wait-yoy-heatmap', {
        chart: { type: 'scatter', zoomType: 'xy', height: dynamicChartHeight },
        title: { text: null },
        xAxis: {
          categories: WAIT_BIN_ORDER,
          title: { text: '等待时长区间' },
          tickLength: 0,
          tickInterval: 1,
          labels: {
            step: 1,
            autoRotation: false,
            reserveSpace: true
          }
        },
        yAxis: {
          type: 'category',
          categories: monthsInRange,
          title: { text: '月份' },
          gridLineWidth: 0,
          tickLength: 0,
          tickInterval: 1,
          min: 0,
          max: monthsInRange.length - 1,
          startOnTick: false,
          endOnTick: false,
          labels: {
            enabled: true,
            step: 1,
            reserveSpace: true,
            style: { color: '#333333', fontSize: '12px' }
          }
        },
        legend: {
          enabled: false
        },
        credits: { enabled: false },
        tooltip: {
          useHTML: true,
          formatter: function () {
            var c = this.point.custom || {};
            return '月份：<b>' + c.month + '</b><br/>' +
              '等待时长：' + c.bin + '<br/>' +
              '去年同月（' + c.prevMonth + '）：<b>' + c.prevVal + '</b><br/>' +
              '当月：<b>' + c.currVal + '</b><br/>' +
              '同比增长率：<b>' + c.pctText + '</b>';
          }
        },
        series: [{
          name: '同比增长率',
          data: data,
          marker: {
            symbol: 'square',
            radius: Math.max(12, Math.floor(cellHeightPx * 0.44)),
            lineColor: '#ffffff',
            lineWidth: 0
          },
          dataLabels: {
            enabled: true,
            align: 'center',
            verticalAlign: 'middle',
            x: 0,
            y: 0,
            crop: false,
            overflow: 'none',
            formatter: function () {
              var c = this.point.custom || {};
              return c.valid ? this.point.value.toFixed(1) + '%' : '';
            },
            style: { textOutline: 'none', fontSize: '10px' }
          }
        }]
      });
    }

    function polynomialRegression(data, xKey, yKey, degree) {
      xKey = xKey || 'x'; yKey = yKey || 'y';
      degree = degree || 2;
      var n = data.length;
      if (n <= degree) return null;
      var xs = data.map(function (p) { return p[xKey]; });
      var xMin = Math.min.apply(null, xs);
      var xMax = Math.max.apply(null, xs);
      var xRange = xMax - xMin;
      if (xRange < 1e-10) return null;
      var pow = function (t, k) { var r = 1; while (k--) r *= t; return r; };
      var order = degree + 1;
      var A = []; for (var i2 = 0; i2 < order; i2++) { A[i2] = []; for (var j2 = 0; j2 < order; j2++) A[i2][j2] = 0; }
      var B = []; for (var i3 = 0; i3 < order; i3++) B[i3] = 0;
      for (var i4 = 0; i4 < n; i4++) {
        var t = (data[i4][xKey] - xMin) / xRange;
        var y = data[i4][yKey];
        for (var r2 = 0; r2 < order; r2++) {
          for (var c2 = 0; c2 < order; c2++) A[r2][c2] += pow(t, r2 + c2);
          B[r2] += y * pow(t, r2);
        }
      }
      var coeffs = solve3(A, B);
      if (!coeffs) return null;
      return { coeffs: coeffs, xMin: xMin, xMax: xMax, xRange: xRange };
    }

    function solve3(A, B) {
      var n = 3;
      var m = [];
      for (var i5 = 0; i5 < n; i5++) {
        m[i5] = [];
        for (var j5 = 0; j5 < n; j5++) m[i5][j5] = A[i5][j5];
        m[i5][n] = B[i5];
      }
      for (var k5 = 0; k5 < n; k5++) {
        var max = 0, idx = -1;
        for (var i6 = k5; i6 < n; i6++) {
          var v = Math.abs(m[i6][k5]);
          if (v > max) { max = v; idx = i6; }
        }
        if (idx < 0 || max < 1e-12) return null;
        if (idx !== k5) { var tmp = m[k5]; m[k5] = m[idx]; m[idx] = tmp; }
        for (var i7 = k5 + 1; i7 < n; i7++) {
          var f = m[i7][k5] / m[k5][k5];
          for (var j7 = k5; j7 <= n; j7++) m[i7][j7] -= f * m[k5][j7];
        }
      }
      var x = [];
      for (var i8 = n - 1; i8 >= 0; i8--) {
        var s = m[i8][n];
        for (var j8 = i8 + 1; j8 < n; j8++) s -= m[i8][j8] * x[j8];
        x[i8] = s / m[i8][i8];
      }
      return x;
    }

    function regressionCurveData(data, result, xKey, yKey, numPoints) {
      xKey = xKey || 'x'; yKey = yKey || 'y';
      numPoints = numPoints || 120;
      if (!result || !result.coeffs || data.length < 2) return [];
      var xMin = result.xMin, xRange = result.xRange, c = result.coeffs;
      var out = [];
      for (var i9 = 0; i9 < numPoints; i9++) {
        var x = xMin + (i9 / (numPoints - 1)) * xRange;
        var t = (x - xMin) / xRange;
        var y = c[0] + c[1] * t + c[2] * t * t;
        out.push([x, y]);
      }
      return out;
    }

    function buildRegressionSeriesFromPoints(points, baseSeriesId, baseName, color) {
      if (!points || points.length < 3) return null;
      // x/y 的点必须按 x 排序更稳定（回归本身不强制，但更符合直觉）
      var pts = points.slice().sort(function (a, b) { return a.x - b.x; });
      var result = polynomialRegression(pts, 'x', 'y', 2);
      if (!result) return null;
      var lineData = regressionCurveData(pts, result, 'x', 'y');
      return {
        name: baseName + ' 回归曲线',
        type: 'spline',
        data: lineData,
        marker: { enabled: false },
        line: { width: 2 },
        color: color,
        showInLegend: false,
        linkedTo: baseSeriesId,
        enableMouseTracking: true
      };
    }

    var slotColors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#f45b5b', '#95a5a6'];
    var waitColors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#f45b5b', '#95a5a6', '#2b908f', '#f15c80', '#8085e9'];
    var REPORT_SLOT_ORDER = ['8:30-10:30', '10:30-12:00', '12:00-13:30', '13:30-15:00', '15:00-17:30', '17:30-24:00'];
    var REPORT_COLORS = ['#3498db', '#9b59b6', '#16a085', '#f39c12', '#e74c3c', '#2ecc71'];
    var reportRowsCache = null;
    var reportIdx = null;
    var heartReportRowsCache = null;
    var heartReportIdx = null;

    function renderScatterSubmit() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp0 = startMonth; startMonth = endMonth; endMonth = tmp0;
      }

      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
      if (!monthsInRange.length) {
        Highcharts.chart('container-time-submit', {
          chart: { type: 'column' },
          title: { text: null },
          series: []
        });
        return;
      }

      // 统计每个时段在每个月的总病例数与有检查天数（出现记录的日期天数）
      var sumMap = {};   // slot -> monthKey -> sum
      var daysMap = {};  // slot -> monthKey -> Set of days

      slotOrder.forEach(function (slot) {
        sumMap[slot] = sumMap[slot] || {};
        daysMap[slot] = daysMap[slot] || {};
      });

      for (var iSub = 1; iSub < submitRows.length; iSub++) {
        var colsSub = submitRows[iSub];
        if (!colsSub || !colsSub.length) continue;
        var dateStrSub = colsSub[idxDate1];
        var slotSub = colsSub[idxSlot] || '';
        var cntSub = parseFloat(colsSub[idxCnt1] || '0');
        if (!dateStrSub || !slotSub || isNaN(cntSub)) continue;
        var mKey = dateStrSub.substring(0, 7);
        if (!inRange(mKey, startMonth, endMonth)) continue;

        if (!sumMap[slotSub]) sumMap[slotSub] = {};
        if (!daysMap[slotSub]) daysMap[slotSub] = {};
        sumMap[slotSub][mKey] = (sumMap[slotSub][mKey] || 0) + cntSub;

        var dayPart = dateStrSub; // 完整日期字符串作为一天的标识
        if (!daysMap[slotSub][mKey]) daysMap[slotSub][mKey] = {};
        daysMap[slotSub][mKey][dayPart] = true;
      }

      var series = [];
      slotOrder.forEach(function (slot, idx) {
        var slotSum = sumMap[slot] || {};
        var slotDays = daysMap[slot] || {};
        var dataArr = [];

        monthsInRange.forEach(function (mkey) {
          var total = slotSum[mkey] || 0;
          var daySet = slotDays[mkey] || {};
          var dayCount = Object.keys(daySet).length;
          if (!dayCount) return; // 没有检查天数则不画
          var avg = total / dayCount;

          var parts = mkey.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10) - 1;
          var xVal = Date.UTC(year, month, 1);
          dataArr.push([xVal, avg]);
        });

        if (!dataArr.length) return;
        series.push({
          name: slot,
          type: 'column',
          data: dataArr,
          color: slotColors[idx % slotColors.length]
        });
      });

      Highcharts.chart('container-time-submit', {
        chart: { type: 'column', zoomType: 'x' },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          title: { text: null },
          labels: {
            formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); }
          }
        },
        yAxis: { title: { text: '平均病例数' }, min: 0, allowDecimals: false },
        credits: { enabled: false },
        tooltip: {
          shared: false,
          pointFormatter: function () {
            return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
              '交单时段：' + (this.series.name || '') + '<br/>' +
              '平均病例数：<b>' + this.y.toFixed(2) + '</b>';
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              formatter: function () { return this.y ? this.y.toFixed(1) : ''; }
            }
          }
        },
        series: series
      });
    }

    function renderScatterWait() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp1 = startMonth; startMonth = endMonth; endMonth = tmp1;
      }
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
      if (!monthsInRange.length) {
        Highcharts.chart('container-time-wait', {
          chart: { type: 'column' },
          title: { text: null },
          series: []
        });
        return;
      }

      var sumMap = {};
      var daysMap = {};
      WAIT_BIN_ORDER.forEach(function (bin) {
        sumMap[bin] = sumMap[bin] || {};
        daysMap[bin] = daysMap[bin] || {};
      });

      for (var iWait = 1; iWait < waitRows.length; iWait++) {
        var colsWait = waitRows[iWait];
        if (!colsWait || !colsWait.length) continue;
        var dateStrWait = colsWait[idxDate2];
        var binWait = colsWait[idxWaitBin] || '';
        var cntWait = parseFloat(colsWait[idxCnt2] || '0');
        if (!dateStrWait || !binWait || isNaN(cntWait)) continue;
        var mKeyWait = dateStrWait.substring(0, 7);
        if (!inRange(mKeyWait, startMonth, endMonth)) continue;

        if (!sumMap[binWait]) sumMap[binWait] = {};
        if (!daysMap[binWait]) daysMap[binWait] = {};
        sumMap[binWait][mKeyWait] = (sumMap[binWait][mKeyWait] || 0) + cntWait;

        if (!daysMap[binWait][mKeyWait]) daysMap[binWait][mKeyWait] = {};
        daysMap[binWait][mKeyWait][dateStrWait] = true;
      }

      var series = [];
      WAIT_BIN_ORDER.forEach(function (bin, idx) {
        var binSum = sumMap[bin] || {};
        var binDays = daysMap[bin] || {};
        var dataArr = [];
        monthsInRange.forEach(function (mkey) {
          var total = binSum[mkey] || 0;
          var dayCount = Object.keys(binDays[mkey] || {}).length;
          if (!dayCount) return;
          var avg = total / dayCount;

          var parts = mkey.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10) - 1;
          var xVal = Date.UTC(year, month, 1);
          dataArr.push([xVal, avg]);
        });
        if (!dataArr.length) return;
        series.push({
          name: bin,
          type: 'column',
          data: dataArr,
          color: waitColors[idx % waitColors.length]
        });
      });

      Highcharts.chart('container-time-wait', {
        chart: { type: 'column', zoomType: 'x' },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          title: { text: null },
          labels: {
            formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); }
          }
        },
        yAxis: { title: { text: '平均病例数' }, min: 0, allowDecimals: false },
        credits: { enabled: false },
        tooltip: {
          shared: false,
          pointFormatter: function () {
            return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
              '等待时长区间：' + (this.series.name || '') + '<br/>平均病例数：<b>' + this.y.toFixed(2) + '</b>';
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              formatter: function () { return this.y ? this.y.toFixed(1) : ''; }
            }
          }
        },
        series: series
      });
    }

    function buildMonthlyAgg(pointsByKey, keyOrder) {
      // key -> monthKey -> sum
      var monthSet = {};
      var agg = {};
      Object.keys(pointsByKey).forEach(function (k) {
        var arr = pointsByKey[k];
        arr.forEach(function (p) {
          var d = new Date(p.x);
          var monthKey = d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2);
          monthSet[monthKey] = true;
          if (!agg[k]) agg[k] = {};
          agg[k][monthKey] = (agg[k][monthKey] || 0) + p.y;
        });
      });
      var months = Object.keys(monthSet).sort();
      // 使用 order 只决定 series 顺序；月份统一由数据决定
      var seriesKeys = keyOrder || Object.keys(agg).sort();
      return { agg: agg, months: months, seriesKeys: seriesKeys };
    }

    function renderMonthlySubmit() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp2 = startMonth; startMonth = endMonth; endMonth = tmp2;
      }
      var submitPointsFilteredBySlot = {};
      slotOrder.forEach(function (slot) {
        var ptsAll = submitPointsBySlot[slot] || [];
        submitPointsFilteredBySlot[slot] = ptsAll.filter(function (p) { return inRange(p._monthKey, startMonth, endMonth); });
      });
      var monthly = buildMonthlyAgg(submitPointsFilteredBySlot, slotOrder);
      var months = monthly.months;
      var agg = monthly.agg;

      var slotSeries = [];
      var regressionSeries = [];
      slotOrder.forEach(function (slot, idx) {
        var color = slotColors[idx % slotColors.length];
        var id = 'slotm_' + safeSeriesId(slot);
        var dataArr = [];
        var pts = [];
        months.forEach(function (mkey) {
          var parts = mkey.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10) - 1;
          var xVal = Date.UTC(year, month, 1);
          var v = (agg[slot] && agg[slot][mkey]) ? agg[slot][mkey] : 0;
          dataArr.push([xVal, v]);
          if (v !== 0) pts.push({ x: xVal, y: v });
        });
        slotSeries.push({
          name: slot,
          id: id,
          type: 'column',
          stack: 'submit',
          data: dataArr,
          color: color
        });
        var regS = buildRegressionSeriesFromPoints(pts, id, slot, color);
        if (regS) regressionSeries.push(regS);
      });

      Highcharts.chart('container-time-submit-monthly', {
        chart: { type: 'column', zoomType: 'x' },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function () {
              return Highcharts.dateFormat('%Y-%m', this.value);
            }
          },
          tickInterval: 30 * 24 * 3600 * 1000
        },
        yAxis: { title: { text: '交单时段对应病例数' }, min: 0 },
        credits: { enabled: false },
        plotOptions: { column: { stacking: 'normal' } },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
        },
        series: slotSeries.concat(regressionSeries)
      });
    }

    function renderMonthlyWait() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp3 = startMonth; startMonth = endMonth; endMonth = tmp3;
      }
      var waitPointsFilteredByBin = {};
      WAIT_BIN_ORDER.forEach(function (bin) {
        var ptsAll = waitPointsByBin[bin] || [];
        waitPointsFilteredByBin[bin] = ptsAll.filter(function (p) { return inRange(p._monthKey, startMonth, endMonth); });
      });
      var monthly = buildMonthlyAgg(waitPointsFilteredByBin, WAIT_BIN_ORDER);
      var months = monthly.months;
      var agg = monthly.agg;

      var binSeries = [];
      var regressionSeries = [];
      WAIT_BIN_ORDER.forEach(function (bin, idx) {
        var color = waitColors[idx % waitColors.length];
        var id = 'waitm_' + safeSeriesId(bin);
        var dataArr = [];
        var pts = [];
        months.forEach(function (mkey) {
          var parts = mkey.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10) - 1;
          var xVal = Date.UTC(year, month, 1);
          var v = (agg[bin] && agg[bin][mkey]) ? agg[bin][mkey] : 0;
          dataArr.push([xVal, v]);
          if (v !== 0) pts.push({ x: xVal, y: v });
        });
        binSeries.push({
          name: bin,
          id: id,
          type: 'column',
          data: dataArr,
          color: color
        });
        var regS = buildRegressionSeriesFromPoints(pts, id, bin, color);
        if (regS) regressionSeries.push(regS);
      });

      Highcharts.chart('container-time-wait-monthly', {
        chart: { type: 'column', zoomType: 'x' },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function () {
              return Highcharts.dateFormat('%Y-%m', this.value);
            }
          },
          tickInterval: 30 * 24 * 3600 * 1000
        },
        yAxis: { title: { text: '等待时长对应病例数' }, min: 0 },
        credits: { enabled: false },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
        },
        series: binSeries.concat(regressionSeries)
      });
    }

    function renderBubbleMonthlySubmit() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp4 = startMonth; startMonth = endMonth; endMonth = tmp4;
      }

      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      var bubbleSeries = [];

      // 月度聚合：slot -> monthKey -> sum
      slotOrder.forEach(function (slot, idx) {
        var ptsAll = submitPointsBySlot[slot] || [];
        var monthSum = {};
        ptsAll.forEach(function (p) {
          if (!inRange(p._monthKey, startMonth, endMonth)) return;
          monthSum[p._monthKey] = (monthSum[p._monthKey] || 0) + p.y;
        });

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

        var color = slotColors[idx % slotColors.length];
        bubbleSeries.push({
          name: slot,
          id: 'bub_' + safeSeriesId(slot),
          type: 'column',
          data: dataArr,
          color: color
        });
      });

      Highcharts.chart('container-time-submit-monthly-bubble', {
        chart: { type: 'column', zoomType: 'x' },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          title: { text: null },
          labels: {
            formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); }
          }
        },
        yAxis: { title: { text: '病例数' }, min: 0, allowDecimals: false },
        credits: { enabled: false },
        tooltip: {
          useHTML: true, headerFormat: '',
          pointFormatter: function () {
            return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
              '交单时段：' + (this.series.name || '') + '<br/>' +
              '病例数：<b>' + this.y + '</b>';
          }
        },
        series: bubbleSeries
      });
    }

    function ensureReportRows(callback) {
      if (reportRowsCache && reportIdx) {
        callback(true);
        return;
      }
      loadCSV('报告时段.csv', function (reportCsv) {
        var rows = parseCSV(reportCsv);
        if (rows.length <= 1) {
          callback(false);
          return;
        }
        var h = rows[0].map(function (x) { return (x || '').trim(); });
        var idxDateR = h.indexOf('日期');
        var idxSlotR = h.indexOf('报告时段');
        var idxCntR = h.indexOf('该报告时段对应病例数');
        if (idxDateR === -1 || idxSlotR === -1 || idxCntR === -1) {
          callback(false);
          return;
        }
        reportRowsCache = rows;
        reportIdx = { idxDateR: idxDateR, idxSlotR: idxSlotR, idxCntR: idxCntR };
        callback(true);
      });
    }

    function renderReportSlotMonthly() {
      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      if (!monthsInRange.length) {
        Highcharts.chart('container-report-slot-monthly', {
          chart: { type: 'column' },
          title: { text: null },
          series: []
        });
        return;
      }

      ensureReportRows(function (ok) {
        if (!ok) {
          Highcharts.chart('container-report-slot-monthly', {
            chart: { type: 'column' },
            title: { text: '报告时段.csv 暂无可用数据', style: { fontSize: '13px' } },
            series: []
          });
          return;
        }

        var agg = {};
        REPORT_SLOT_ORDER.forEach(function (slot) { agg[slot] = {}; });

        for (var iR = 1; iR < reportRowsCache.length; iR++) {
          var cols = reportRowsCache[iR];
          if (!cols || !cols.length) continue;
          var dateStr = cols[reportIdx.idxDateR];
          var slot = (cols[reportIdx.idxSlotR] || '').trim();
          var cnt = parseFloat(cols[reportIdx.idxCntR] || '0');
          if (!dateStr || !slot || isNaN(cnt)) continue;
          var mk = dateStr.substring(0, 7);
          if (!inRange(mk, startMonth, endMonth)) continue;
          if (!agg[slot]) agg[slot] = {};
          agg[slot][mk] = (agg[slot][mk] || 0) + cnt;
        }

        var series = [];
        REPORT_SLOT_ORDER.forEach(function (slot, idx) {
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
            color: REPORT_COLORS[idx % REPORT_COLORS.length]
          });
        });

        Highcharts.chart('container-report-slot-monthly', {
          chart: { type: 'column', zoomType: 'x' },
          title: { text: null },
          xAxis: {
            type: 'datetime',
            title: { text: null },
            labels: { formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); } }
          },
          yAxis: { title: { text: '病例数' }, min: 0, allowDecimals: false },
          credits: { enabled: false },
          tooltip: {
            shared: false,
            pointFormatter: function () {
              return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
                '报告时段：' + (this.series.name || '') + '<br/>' +
                '病例数：<b>' + this.y + '</b>';
            }
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
      });
    }

    function renderReportSlotMonthlyAvg() {
      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      if (!monthsInRange.length) {
        Highcharts.chart('container-report-slot-monthly-avg', {
          chart: { type: 'column' },
          title: { text: null },
          series: []
        });
        return;
      }

      ensureReportRows(function (ok) {
        if (!ok) {
          Highcharts.chart('container-report-slot-monthly-avg', {
            chart: { type: 'column' },
            title: { text: '报告时段.csv 暂无可用数据', style: { fontSize: '13px' } },
            series: []
          });
          return;
        }

        var sumMap = {};
        var daysMap = {};
        REPORT_SLOT_ORDER.forEach(function (slot) {
          sumMap[slot] = {};
          daysMap[slot] = {};
        });

        for (var iR = 1; iR < reportRowsCache.length; iR++) {
          var cols = reportRowsCache[iR];
          if (!cols || !cols.length) continue;
          var dateStr = cols[reportIdx.idxDateR];
          var slot = (cols[reportIdx.idxSlotR] || '').trim();
          var cnt = parseFloat(cols[reportIdx.idxCntR] || '0');
          if (!dateStr || !slot || isNaN(cnt)) continue;
          var mk = dateStr.substring(0, 7);
          if (!inRange(mk, startMonth, endMonth)) continue;

          if (!sumMap[slot]) sumMap[slot] = {};
          if (!daysMap[slot]) daysMap[slot] = {};
          sumMap[slot][mk] = (sumMap[slot][mk] || 0) + cnt;
          if (!daysMap[slot][mk]) daysMap[slot][mk] = {};
          daysMap[slot][mk][dateStr] = true;
        }

        var series = [];
        REPORT_SLOT_ORDER.forEach(function (slot, idx) {
          var slotSum = sumMap[slot] || {};
          var slotDays = daysMap[slot] || {};
          var dataArr = [];
          monthsInRange.forEach(function (mkey) {
            var total = slotSum[mkey] || 0;
            var dayCount = Object.keys(slotDays[mkey] || {}).length;
            if (!dayCount) return;
            var avg = total / dayCount;
            var parts = mkey.split('-');
            var year = parseInt(parts[0], 10);
            var month = parseInt(parts[1], 10) - 1;
            var xVal = Date.UTC(year, month, 1);
            dataArr.push([xVal, avg]);
          });
          if (!dataArr.length) return;
          series.push({
            name: slot,
            type: 'column',
            data: dataArr,
            color: REPORT_COLORS[idx % REPORT_COLORS.length]
          });
        });

        Highcharts.chart('container-report-slot-monthly-avg', {
          chart: { type: 'column', zoomType: 'x' },
          title: { text: null },
          xAxis: {
            type: 'datetime',
            title: { text: null },
            labels: { formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); } }
          },
          yAxis: { title: { text: '平均病例数' }, min: 0, allowDecimals: false },
          credits: { enabled: false },
          tooltip: {
            shared: false,
            pointFormatter: function () {
              return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
                '报告时段：' + (this.series.name || '') + '<br/>' +
                '平均病例数：<b>' + this.y.toFixed(2) + '</b>';
            }
          },
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true,
                inside: false,
                formatter: function () { return this.y ? this.y.toFixed(1) : ''; }
              }
            }
          },
          series: series
        });
      });
    }

    function ensureHeartReportRows(callback) {
      if (heartReportRowsCache && heartReportIdx) {
        callback(true);
        return;
      }
      loadCSV('心超报告时段.csv', function (reportCsv) {
        var rows = parseCSV(reportCsv);
        if (rows.length <= 1) {
          callback(false);
          return;
        }
        var h = rows[0].map(function (x) { return (x || '').trim(); });
        var idxDateR = h.indexOf('日期');
        var idxSlotR = h.indexOf('报告时段');
        var idxCntR = h.indexOf('该心超报告时段对应病例数');
        if (idxDateR === -1 || idxSlotR === -1 || idxCntR === -1) {
          callback(false);
          return;
        }
        heartReportRowsCache = rows;
        heartReportIdx = { idxDateR: idxDateR, idxSlotR: idxSlotR, idxCntR: idxCntR };
        callback(true);
      });
    }

    function renderHeartReportSlotMonthly() {
      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;
      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });

      if (!monthsInRange.length) {
        Highcharts.chart('container-heart-report-slot-monthly', {
          chart: { type: 'column' },
          title: { text: null },
          series: []
        });
        return;
      }

      ensureHeartReportRows(function (ok) {
        if (!ok) {
          Highcharts.chart('container-heart-report-slot-monthly', {
            chart: { type: 'column' },
            title: { text: '心超报告时段.csv 暂无可用数据', style: { fontSize: '13px' } },
            series: []
          });
          return;
        }

        var agg = {};
        REPORT_SLOT_ORDER.forEach(function (slot) { agg[slot] = {}; });

        for (var iR = 1; iR < heartReportRowsCache.length; iR++) {
          var cols = heartReportRowsCache[iR];
          if (!cols || !cols.length) continue;
          var dateStr = cols[heartReportIdx.idxDateR];
          var slot = (cols[heartReportIdx.idxSlotR] || '').trim();
          var cnt = parseFloat(cols[heartReportIdx.idxCntR] || '0');
          if (!dateStr || !slot || isNaN(cnt)) continue;
          var mk = dateStr.substring(0, 7);
          if (!inRange(mk, startMonth, endMonth)) continue;
          if (!agg[slot]) agg[slot] = {};
          agg[slot][mk] = (agg[slot][mk] || 0) + cnt;
        }

        var series = [];
        REPORT_SLOT_ORDER.forEach(function (slot, idx) {
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
            color: REPORT_COLORS[idx % REPORT_COLORS.length]
          });
        });

        Highcharts.chart('container-heart-report-slot-monthly', {
          chart: { type: 'column', zoomType: 'x' },
          title: { text: null },
          xAxis: {
            type: 'datetime',
            title: { text: null },
            labels: { formatter: function () { return Highcharts.dateFormat('%Y-%m', this.value); } }
          },
          yAxis: { title: { text: '病例数' }, min: 0, allowDecimals: false },
          credits: { enabled: false },
          tooltip: {
            shared: false,
            pointFormatter: function () {
              return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
                '报告时段：' + (this.series.name || '') + '<br/>' +
                '心超病例数：<b>' + this.y + '</b>';
            }
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
      });
    }

    function renderAll() {
      renderScatterSubmit();
      renderScatterWait();
      renderBubbleMonthlySubmit();
      renderReportSlotMonthly();
      renderReportSlotMonthlyAvg();
      renderHeartReportSlotMonthly();
    }

    function exportExcelByMonthRange() {
      if (typeof XLSX === 'undefined') {
        alert('导出需要 SheetJS，请刷新页面后重试');
        return;
      }

      var range = getMonthRange();
      var startMonth = range.startMonth;
      var endMonth = range.endMonth;

      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
      if (!monthsInRange.length) {
        alert('当前月份区间内没有数据');
        return;
      }

      // Sheet1：交单数量（总量 + 平均值）
      var sumSlotMap = {};   // slot -> monthKey -> sum
      var daysSlotMap = {};  // slot -> monthKey -> { dateStr: true }
      slotOrder.forEach(function (slot) {
        sumSlotMap[slot] = {};
        daysSlotMap[slot] = {};
      });

      for (var iExp1 = 1; iExp1 < submitRows.length; iExp1++) {
        var colsSub = submitRows[iExp1];
        if (!colsSub || !colsSub.length) continue;
        var dateStrSub = colsSub[idxDate1];
        var slotSub = (colsSub[idxSlot] || '').trim();
        var cntSub = parseFloat(colsSub[idxCnt1] || '0');
        if (!dateStrSub || !slotSub || isNaN(cntSub)) continue;
        var mKeySub = dateStrSub.substring(0, 7);
        if (!inRange(mKeySub, startMonth, endMonth)) continue;

        if (!sumSlotMap[slotSub]) sumSlotMap[slotSub] = {};
        if (!daysSlotMap[slotSub]) daysSlotMap[slotSub] = {};
        sumSlotMap[slotSub][mKeySub] = (sumSlotMap[slotSub][mKeySub] || 0) + cntSub;

        if (!daysSlotMap[slotSub][mKeySub]) daysSlotMap[slotSub][mKeySub] = {};
        daysSlotMap[slotSub][mKeySub][dateStrSub] = true;
      }

      var sheet1Rows = [];
      monthsInRange.forEach(function (mkey) {
        slotOrder.forEach(function (slot) {
          var total = (sumSlotMap[slot] && sumSlotMap[slot][mkey]) || 0;
          if (!total) return;
          var daySet = (daysSlotMap[slot] && daysSlotMap[slot][mkey]) || {};
          var dayCount = Object.keys(daySet).length;
          var avg = dayCount ? (total / dayCount) : 0;
          sheet1Rows.push([mkey, slot, total, avg]);
        });
      });

      // Sheet2：等待时长（总量 + 平均值）
      var sumWaitMap = {};   // bin -> monthKey -> sum
      var daysWaitMap = {};  // bin -> monthKey -> { dateStr: true }
      WAIT_BIN_ORDER.forEach(function (bin) {
        sumWaitMap[bin] = {};
        daysWaitMap[bin] = {};
      });

      for (var iExp2 = 1; iExp2 < waitRows.length; iExp2++) {
        var colsWait = waitRows[iExp2];
        if (!colsWait || !colsWait.length) continue;
        var dateStrWait = colsWait[idxDate2];
        var binWait = (colsWait[idxWaitBin] || '').trim();
        var cntWait = parseFloat(colsWait[idxCnt2] || '0');
        if (!dateStrWait || !binWait || isNaN(cntWait)) continue;
        var mKeyWait = dateStrWait.substring(0, 7);
        if (!inRange(mKeyWait, startMonth, endMonth)) continue;

        if (!sumWaitMap[binWait]) sumWaitMap[binWait] = {};
        if (!daysWaitMap[binWait]) daysWaitMap[binWait] = {};
        sumWaitMap[binWait][mKeyWait] = (sumWaitMap[binWait][mKeyWait] || 0) + cntWait;

        if (!daysWaitMap[binWait][mKeyWait]) daysWaitMap[binWait][mKeyWait] = {};
        daysWaitMap[binWait][mKeyWait][dateStrWait] = true;
      }

      var sheet2Rows = [];
      monthsInRange.forEach(function (mkey) {
        WAIT_BIN_ORDER.forEach(function (bin) {
          var total = (sumWaitMap[bin] && sumWaitMap[bin][mkey]) || 0;
          if (!total) return;
          var daySet = (daysWaitMap[bin] && daysWaitMap[bin][mkey]) || {};
          var dayCount = Object.keys(daySet).length;
          var avg = dayCount ? (total / dayCount) : 0;
          sheet2Rows.push([mkey, bin, total, avg]);
        });
      });

      var wb = XLSX.utils.book_new();
      var ws1 = XLSX.utils.aoa_to_sheet(
        [['月份', '交单时段', '该时段对应的交单数量', '该月份该时段的平均病例数']].concat(sheet1Rows)
      );
      var ws2 = XLSX.utils.aoa_to_sheet(
        [['月份', '等待时长', '该等待时长对应的病例数', '该月份该等待时长的平均病例数']].concat(sheet2Rows)
      );
      XLSX.utils.book_append_sheet(wb, ws1, '交单数量');
      XLSX.utils.book_append_sheet(wb, ws2, '等待时长');
      XLSX.writeFile(wb, '交单与等待_' + startMonth + '_到_' + endMonth + '.xlsx');
    }

    // 首次渲染 + 监听区间变化
    renderAll();
    if (startSel && endSel) {
      startSel.addEventListener('change', renderAll);
      endSel.addEventListener('change', renderAll);
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', exportExcelByMonthRange);
    }
  });
});

