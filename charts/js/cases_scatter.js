loadCSV('不同等级医生工作量.csv', function (csv) {
  var lines = csv.trim().split('\n');
  if (lines.length <= 1) {
    alert('不同等级医生工作量.csv 内容为空或只有表头');
    return;
  }

  var header = lines[0].split(',').map(function (h) { return h.trim(); });
  var idxDate = header.indexOf('日期');
  var idxLevel = header.indexOf('医生等级');
  var idxCount = header.indexOf('每日病例量');
  var idxFee = header.indexOf('每日总费用');
  var idxRatio = header.indexOf('每日费用病例比');
  var idxCntLv = header.indexOf('该等级医生数量');
  var idxWorkday = header.indexOf('工作日/周末');

  if (idxDate === -1 || idxLevel === -1 || idxCount === -1) {
    alert('CSV 表头中缺少 必要列：日期 / 医生等级 / 每日病例量');
    return;
  }

  var seriesMap = {};
  var overallDaily = {};
  var rawRows = [];

  for (var i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    var cols = lines[i].split(',');
    var dateStr = cols[idxDate];
    var level = cols[idxLevel] || '';
    var count = parseFloat(cols[idxCount] || '0');
    var fee = idxFee >= 0 ? parseFloat(cols[idxFee] || '0') : 0;
    var ratio = idxRatio >= 0 ? parseFloat(cols[idxRatio] || '0') : 0;
    var lvlCnt = idxCntLv >= 0 ? parseInt(cols[idxCntLv] || '0', 10) : 0;
    var wdFlag = idxWorkday >= 0 ? (cols[idxWorkday] || '') : '';

    if (!dateStr || !level) continue;
    var monthKey = dateStr.substring(0, 7);
    rawRows.push({ cols: cols, _monthKey: monthKey });
    var parts = dateStr.split('-');
    if (parts.length < 3) continue;
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) continue;
    var xVal = Date.UTC(year, month, day);

    if (!seriesMap[level]) seriesMap[level] = [];
    seriesMap[level].push({
      x: xVal, y: count, level: level, fee: fee, ratio: ratio,
      levelCount: lvlCnt, workFlag: wdFlag
    });

    var dateKey = dateStr;
    if (!overallDaily[dateKey]) {
      overallDaily[dateKey] = { x: xVal, sumCases: 0, sumDocs: 0, sumFees: 0 };
    }
    overallDaily[dateKey].sumCases += count * lvlCnt;
    overallDaily[dateKey].sumDocs += lvlCnt;
    overallDaily[dateKey].sumFees += fee * lvlCnt;
  }

  var overallSeries = [];
  Object.keys(overallDaily).sort().forEach(function (k) {
    var o = overallDaily[k];
    var avg = o.sumDocs ? (o.sumCases / o.sumDocs) : 0;
    var avgFee = o.sumDocs ? (o.sumFees / o.sumDocs) : 0;
    overallSeries.push({
      x: o.x, y: avg, level: '全部', fee: avgFee,
      ratio: avgFee / (avg || 1), levelCount: o.sumDocs, workFlag: ''
    });
  });
  if (overallSeries.length) seriesMap['全部'] = overallSeries;

  var monthSet = {};
  Object.keys(seriesMap).forEach(function (lvl) {
    seriesMap[lvl].forEach(function (p) {
      var d = new Date(p.x);
      p._monthKey = d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2);
      monthSet[p._monthKey] = true;
    });
  });
  var months = Object.keys(monthSet).sort();

  var minStartMonth = '2023-10';
  if (months.length && months[0] > minStartMonth) {
    var filled = [];
    var y = 2023, m = 10;
    var target = months[0];
    while (true) {
      var key = y + '-' + ('0' + m).slice(-2);
      if (key >= target) break;
      filled.push(key);
      m++; if (m > 12) { m = 1; y++; }
    }
    months = filled.concat(months);
  }

  var startSel = document.getElementById('start-month');
  var endSel = document.getElementById('end-month');
  months.forEach(function (m) {
    var opt1 = document.createElement('option');
    opt1.value = m; opt1.textContent = m; startSel.appendChild(opt1);
    var opt2 = document.createElement('option');
    opt2.value = m; opt2.textContent = m; endSel.appendChild(opt2);
  });
  if (months.length) {
    startSel.value = months.indexOf(minStartMonth) >= 0 ? minStartMonth : months[0];
    endSel.value = months[months.length - 1];
  }

  var order = ['预备', '初级', '中级', '高级'];
  var levelColors = { '预备': '#7cb5ec', '初级': '#434348', '中级': '#90ed7d', '高级': '#f7a35c', '全部': '#95a5a6' };

  function buildSeriesFromMap(map) {
    var result = [];
    order.forEach(function (lvl) {
      if (!map[lvl]) return;
      var dataArr = map[lvl].slice();
      dataArr.sort(function (a, b) { return a.x - b.x; });
      result.push({ name: lvl, id: 'level-' + lvl, data: dataArr });
    });
    Object.keys(map).forEach(function (lvl) {
      if (order.indexOf(lvl) !== -1) return;
      var dataArr = map[lvl].slice();
      dataArr.sort(function (a, b) { return a.x - b.x; });
      result.push({ name: lvl, id: lvl === '全部' ? 'level-全部' : undefined, data: dataArr });
    });
    return result;
  }

  function filterMapByRange(map, startMonth, endMonth) {
    var out = {};
    Object.keys(map).forEach(function (lvl) {
      var pts = map[lvl].filter(function (p) {
        return p._monthKey >= startMonth && p._monthKey <= endMonth;
      });
      if (pts.length) out[lvl] = pts;
    });
    return out;
  }

  /** 多项式回归曲线：data = [{x, y}...]，degree=2 时 y ≈ a + b*t + c*t²，t 为归一化 x */
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
    var A = []; for (var i = 0; i < order; i++) { A[i] = []; for (var j = 0; j < order; j++) A[i][j] = 0; }
    var B = []; for (i = 0; i < order; i++) B[i] = 0;
    for (i = 0; i < n; i++) {
      var t = (data[i][xKey] - xMin) / xRange;
      var y = data[i][yKey];
      for (var r = 0; r < order; r++) {
        for (var c = 0; c < order; c++) A[r][c] += pow(t, r + c);
        B[r] += y * pow(t, r);
      }
    }
    var coeffs = solve3(A, B);
    if (!coeffs) return null;
    return { coeffs: coeffs, xMin: xMin, xMax: xMax, xRange: xRange };
  }

  function solve3(A, B) {
    var n = 3;
    var m = [];
    for (var i = 0; i < n; i++) {
      m[i] = [];
      for (var j = 0; j < n; j++) m[i][j] = A[i][j];
      m[i][n] = B[i];
    }
    for (var k = 0; k < n; k++) {
      var max = 0, idx = -1;
      for (i = k; i < n; i++) { var v = Math.abs(m[i][k]); if (v > max) { max = v; idx = i; } }
      if (idx < 0 || max < 1e-12) return null;
      if (idx !== k) { var tmp = m[k]; m[k] = m[idx]; m[idx] = tmp; }
      for (i = k + 1; i < n; i++) {
        var f = m[i][k] / m[k][k];
        for (j = k; j <= n; j++) m[i][j] -= f * m[k][j];
      }
    }
    var x = [];
    for (i = n - 1; i >= 0; i--) {
      var s = m[i][n];
      for (j = i + 1; j < n; j++) s -= m[i][j] * x[j];
      x[i] = s / m[i][i];
    }
    return x;
  }

  /** 根据多项式回归系数生成曲线数据点 */
  function regressionCurveData(data, result, xKey, yKey, numPoints) {
    xKey = xKey || 'x'; yKey = yKey || 'y';
    numPoints = numPoints || 120;
    if (!result || !result.coeffs || data.length < 2) return [];
    var xMin = result.xMin, xRange = result.xRange, c = result.coeffs;
    var out = [];
    for (var i = 0; i < numPoints; i++) {
      var x = xMin + (i / (numPoints - 1)) * xRange;
      var t = (x - xMin) / xRange;
      var y = c[0] + c[1] * t + c[2] * t * t;
      out.push([x, y]);
    }
    return out;
  }

  /** 为 levels 等级生成回归曲线序列（病例量 y） */
  function buildRegressionSeries(filteredMap, levels) {
    levels = levels || order.concat(['全部']);
    var arr = [];
    levels.forEach(function (lvl) {
      var pts = filteredMap[lvl];
      if (!pts || pts.length < 3) return;
      var result = polynomialRegression(pts, 'x', 'y', 2);
      if (!result) return;
      var lineData = regressionCurveData(pts, result, 'x', 'y');
      arr.push({
        name: lvl + ' 回归曲线',
        type: 'spline',
        data: lineData,
        marker: { enabled: false },
        line: { width: 2 },
        color: levelColors[lvl] || '#666',
        showInLegend: false,
        linkedTo: 'level-' + lvl,
        enableMouseTracking: true
      });
    });
    return arr;
  }

  /** 为 levels 等级生成回归曲线序列（费用 fee） */
  function renderCharts() {
    if (!months.length) return;
    var startMonth = startSel.value;
    var endMonth = endSel.value;
    if (startMonth > endMonth) {
      var tmp = startMonth; startMonth = endMonth; endMonth = tmp;
    }
    var sameMonthRange = (startMonth === endMonth);
    var filteredMap = filterMapByRange(seriesMap, startMonth, endMonth);
    var series = buildSeriesFromMap(filteredMap);

    var seriesForCounts = series;

    var regressionCounts = buildRegressionSeries(filteredMap);
    var allSeriesCounts = seriesForCounts.concat(regressionCounts);

    Highcharts.chart('container-levels', {
      chart: { type: 'scatter', zoomType: 'x' },
      title: { text: null },
      xAxis: {
        type: 'datetime',
        title: { text: null },
        tickInterval: sameMonthRange ? 24 * 3600 * 1000 * 10 : 30 * 24 * 3600 * 1000,
        labels: {
          formatter: function () {
            return sameMonthRange
              ? Highcharts.dateFormat('%Y-%m-%d', this.value)
              : Highcharts.dateFormat('%Y-%m', this.value);
          }
        }
      },
      yAxis: { title: { text: '平均病例数' }, min: 0, allowDecimals: false },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'top' },
      credits: { enabled: false },
      tooltip: {
        useHTML: true, headerFormat: '',
        pointFormatter: function () {
          if (this.level == null) {
            return '日期：<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>预测病例量：<b>' + this.y.toFixed(2) + '</b>';
          }
          return '日期：<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' +
            '医生等级：' + this.level + '<br/>每日人均病例量：<b>' + this.y + '</b><br/>' +
            '每日总费用（人均）：' + this.fee.toFixed(2) + '<br/>' +
            '每日费用病例比：' + this.ratio.toFixed(2) + '<br/>' +
            '该等级医生数量：' + this.levelCount + '<br/>工作日/周末：' + (this.workFlag || '');
        }
      },
      plotOptions: {
        scatter: { marker: { enabled: true, radius: 3, symbol: 'circle' } },
        series: { turboThreshold: 0 }
      },
      series: allSeriesCounts
    });

  }

  renderCharts();
  startSel.addEventListener('change', renderCharts);
  endSel.addEventListener('change', renderCharts);

  document.getElementById('export-excel-btn').onclick = function () {
    var startMonth = startSel.value;
    var endMonth = endSel.value;
    if (startMonth > endMonth) { var t = startMonth; startMonth = endMonth; endMonth = t; }
    var filtered = rawRows.filter(function (r) {
      return r._monthKey >= startMonth && r._monthKey <= endMonth;
    });
    var rows = filtered.map(function (r) { return r.cols; });
    if (!rows.length) {
      alert('当前日期范围内没有数据可导出');
      return;
    }
    downloadExcel(header, rows, '不同等级医生工作量_' + startMonth + '_' + endMonth + '.xlsx');
  };
});
