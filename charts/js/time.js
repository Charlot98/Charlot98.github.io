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

    var slotOrder = ['8:30-10:00', '10:00-12:00', '12:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:30'];
    var WAIT_BIN_ORDER = ['0:00-0:30', '0:30-1:00', '1:00-1:30', '1:30-2:00', '2:00-2:30', '2:30-3:00', '3:00-3:30', '3:30-4:00', '>4:00'];

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
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -10,
          y: 40,
          floating: true,
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
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
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -10,
          y: 40,
          floating: true,
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
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
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -10,
          y: 40,
          floating: true,
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
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
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -10,
          y: 40,
          floating: true,
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
        credits: { enabled: false },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
        },
        series: binSeries.concat(regressionSeries)
      });
    }

    function renderExtremeWaitCompare() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp7 = startMonth; startMonth = endMonth; endMonth = tmp7;
      }

      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
      var lowBin = '0:00-0:30';
      var highBin = '>4:00';

      var lowByMonth = {};
      var highByMonth = {};
      for (var i12 = 1; i12 < waitRows.length; i12++) {
        var row = waitRows[i12];
        if (!row || !row.length) continue;
        var dateStr = row[idxDate2] || '';
        var bin = (row[idxWaitBin] || '').trim();
        var cnt = parseFloat(row[idxCnt2] || '0');
        if (!dateStr || isNaN(cnt)) continue;
        var mk = dateStr.substring(0, 7);
        if (!inRange(mk, startMonth, endMonth)) continue;
        if (bin === lowBin) lowByMonth[mk] = (lowByMonth[mk] || 0) + cnt;
        if (bin === highBin) highByMonth[mk] = (highByMonth[mk] || 0) + cnt;
      }

      Highcharts.chart('container-time-wait-extreme-compare', {
        chart: { type: 'bar' },
        title: { text: null },
        xAxis: {
          categories: monthsInRange,
          title: { text: null },
          crosshair: {
            width: 1,
            color: '#666666',
            dashStyle: 'Solid',
            zIndex: 3
          }
        },
        yAxis: {
          title: { text: null },
          labels: {
            formatter: function () { return Math.abs(this.value); }
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'right',
          verticalAlign: 'bottom'
        },
        credits: { enabled: false },
        tooltip: {
          shared: false,
          pointFormatter: function () {
            return '月份：<b>' + this.category + '</b><br/>' +
              '<span style="color:' + this.color + '">' + this.series.name +
              '</span>: <b>' + Math.abs(this.y) + '</b>';
          }
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            dataLabels: {
              enabled: false
            }
          }
        },
        series: [
          {
            name: '>4:00',
            data: monthsInRange.map(function (m) { return -(highByMonth[m] || 0); }),
            color: '#f45b5b'
          },
          {
            name: '0:00-0:30',
            data: monthsInRange.map(function (m) { return (lowByMonth[m] || 0); }),
            color: '#7cb5ec'
          }
        ]
      });
    }

    function renderExtremeWaitAvgCompare() {
      var startMonth = startSel.value;
      var endMonth = endSel.value;
      if (startMonth > endMonth) {
        var tmp8 = startMonth; startMonth = endMonth; endMonth = tmp8;
      }

      var monthsInRange = monthsAll.filter(function (m) { return inRange(m, startMonth, endMonth); });
      var lowBin = '0:00-0:30';
      var highBin = '>4:00';

      var lowByMonth = {};
      var highByMonth = {};
      var activeDaysByMonth = {}; // 该月真实做病例天数（等待时长.csv中出现的日期）
      for (var i13 = 1; i13 < waitRows.length; i13++) {
        var row = waitRows[i13];
        if (!row || !row.length) continue;
        var dateStr = row[idxDate2] || '';
        var bin = (row[idxWaitBin] || '').trim();
        var cnt = parseFloat(row[idxCnt2] || '0');
        if (!dateStr || isNaN(cnt)) continue;
        var mk = dateStr.substring(0, 7);
        if (!inRange(mk, startMonth, endMonth)) continue;

        if (!activeDaysByMonth[mk]) activeDaysByMonth[mk] = {};
        activeDaysByMonth[mk][dateStr] = true;

        if (bin === lowBin) lowByMonth[mk] = (lowByMonth[mk] || 0) + cnt;
        if (bin === highBin) highByMonth[mk] = (highByMonth[mk] || 0) + cnt;
      }

      function avgFor(monthKey, total) {
        var dayCount = Object.keys(activeDaysByMonth[monthKey] || {}).length;
        if (!dayCount) return 0;
        return total / dayCount;
      }

      Highcharts.chart('container-time-wait-extreme-avg-compare', {
        chart: { type: 'bar' },
        title: { text: null },
        xAxis: {
          categories: monthsInRange,
          title: { text: null },
          crosshair: {
            width: 1,
            color: '#666666',
            dashStyle: 'Solid',
            zIndex: 3
          }
        },
        yAxis: {
          title: { text: null },
          labels: {
            formatter: function () { return Math.abs(this.value); }
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'right',
          verticalAlign: 'bottom'
        },
        credits: { enabled: false },
        tooltip: {
          shared: false,
          pointFormatter: function () {
            return '月份：<b>' + this.category + '</b><br/>' +
              '<span style="color:' + this.color + '">' + this.series.name +
              '</span>: <b>' + Math.abs(this.y).toFixed(2) + '</b>';
          }
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            dataLabels: {
              enabled: false
            }
          }
        },
        series: [
          {
            name: '>4:00',
            data: monthsInRange.map(function (m) { return -avgFor(m, highByMonth[m] || 0); }),
            color: '#f45b5b'
          },
          {
            name: '0:00-0:30',
            data: monthsInRange.map(function (m) { return avgFor(m, lowByMonth[m] || 0); }),
            color: '#7cb5ec'
          }
        ]
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
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -10,
          y: 40,
          floating: true,
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
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

    function renderAll() {
      renderScatterSubmit();
      renderScatterWait();
      renderBubbleMonthlySubmit();
      renderExtremeWaitCompare();
      renderExtremeWaitAvgCompare();
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

