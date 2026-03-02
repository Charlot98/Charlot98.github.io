loadCSV('05不同等级医生工作量.csv', function (csv) {
  var lines = csv.trim().split('\n');
  if (lines.length <= 1) {
    alert('05不同等级医生工作量.csv 内容为空或只有表头');
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
      overallDaily[dateKey] = { x: xVal, sumCases: 0, sumDocs: 0 };
    }
    overallDaily[dateKey].sumCases += count * lvlCnt;
    overallDaily[dateKey].sumDocs += lvlCnt;
  }

  var overallSeries = [];
  Object.keys(overallDaily).sort().forEach(function (k) {
    var o = overallDaily[k];
    var avg = o.sumDocs ? (o.sumCases / o.sumDocs) : 0;
    overallSeries.push({
      x: o.x, y: avg, level: '全部', fee: NaN, ratio: NaN,
      levelCount: o.sumDocs, workFlag: ''
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

  var startSel = document.getElementById('start-month');
  var endSel = document.getElementById('end-month');
  months.forEach(function (m) {
    var opt1 = document.createElement('option');
    opt1.value = m; opt1.textContent = m; startSel.appendChild(opt1);
    var opt2 = document.createElement('option');
    opt2.value = m; opt2.textContent = m; endSel.appendChild(opt2);
  });
  if (months.length) {
    startSel.value = months[0];
    endSel.value = months[months.length - 1];
  }

  var order = ['预备', '初级', '中级', '高级'];
  function buildSeriesFromMap(map) {
    var result = [];
    order.forEach(function (lvl) {
      if (!map[lvl]) return;
      var dataArr = map[lvl].slice();
      dataArr.sort(function (a, b) { return a.x - b.x; });
      result.push({ name: lvl, data: dataArr });
    });
    Object.keys(map).forEach(function (lvl) {
      if (order.indexOf(lvl) !== -1) return;
      var dataArr = map[lvl].slice();
      dataArr.sort(function (a, b) { return a.x - b.x; });
      result.push({ name: lvl, data: dataArr });
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

    var feeMap = {};
    Object.keys(filteredMap).forEach(function (lvl) {
      feeMap[lvl] = filteredMap[lvl].map(function (p) {
        return { x: p.x, y: p.fee, level: p.level, ratio: p.ratio,
          levelCount: p.levelCount, workFlag: p.workFlag };
      });
    });
    var feeSeries = buildSeriesFromMap(feeMap);

    Highcharts.chart('container-levels', {
      chart: { type: 'line', zoomType: 'x' },
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
          return '日期：<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' +
            '医生等级：' + this.level + '<br/>每日人均病例量：<b>' + this.y + '</b><br/>' +
            '每日总费用（人均）：' + this.fee.toFixed(2) + '<br/>' +
            '每日费用病例比：' + this.ratio.toFixed(2) + '<br/>' +
            '该等级医生数量：' + this.levelCount + '<br/>工作日/周末：' + (this.workFlag || '');
        }
      },
      plotOptions: {
        line: { marker: { enabled: true, radius: 3, symbol: 'circle' } },
        series: { turboThreshold: 0 }
      },
      series: series
    });

    Highcharts.chart('container-level-fee', {
      chart: { type: 'line', zoomType: 'x' },
      title: { text: '不同等级医生每日人均总费用（仅上午+下午）' },
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
      yAxis: { title: { text: '每日人均总费用' }, min: 0 },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'top' },
      credits: { enabled: false },
      tooltip: {
        useHTML: true, headerFormat: '',
        pointFormatter: function () {
          return '日期：<b>' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</b><br/>' +
            '医生等级：' + this.level + '<br/>每日人均总费用：<b>' + this.y.toFixed(2) + '</b><br/>' +
            '每日费用病例比：' + this.ratio.toFixed(2) + '<br/>' +
            '该等级医生数量：' + this.levelCount + '<br/>工作日/周末：' + (this.workFlag || '');
        }
      },
      plotOptions: {
        line: { marker: { enabled: true, radius: 3, symbol: 'circle' } },
        series: { turboThreshold: 0 }
      },
      series: feeSeries
    });
  }

  renderCharts();
  startSel.addEventListener('change', renderCharts);
  endSel.addEventListener('change', renderCharts);
});
