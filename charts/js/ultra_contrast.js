function parseCSVLine(line) {
  var result = [];
  var cur = '';
  var inQ = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) {
      result.push(cur.replace(/^"|"$/g, '').trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.replace(/^"|"$/g, '').trim());
  return result;
}

function parseReportDate(str) {
  if (!str || typeof str !== 'string') return null;
  str = str.trim();
  var m = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (m) {
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    if (!isNaN(y) && !isNaN(mo) && mo >= 1 && mo <= 12) {
      return y + '-' + ('0' + mo).slice(-2);
    }
  }
  return null;
}

loadCSV('超声造影（26.2.10）.csv', function (csv) {
  var lines = csv.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    alert('CSV 内容为空或只有表头');
    return;
  }
  var header = parseCSVLine(lines[0]);
  var idxReportTime = header.indexOf('报告时间');
  var idxLiangExing = header.indexOf('良恶性');
  if (idxReportTime === -1 || idxLiangExing === -1) {
    alert('缺少 报告时间 或 良恶性 列');
    return;
  }

  var monthCases = {};
  var monthLiangExing = {};

  for (var i = 1; i < lines.length; i++) {
    var cols = parseCSVLine(lines[i]);
    if (cols.length <= Math.max(idxReportTime, idxLiangExing)) continue;
    var monthKey = parseReportDate(cols[idxReportTime]);
    if (!monthKey) continue;
    var lx = (cols[idxLiangExing] || '').trim();
    if (lx !== '良性' && lx !== '恶性') lx = '其他';

    monthCases[monthKey] = (monthCases[monthKey] || 0) + 1;
    if (!monthLiangExing[monthKey]) monthLiangExing[monthKey] = { 良性: 0, 恶性: 0, 其他: 0 };
    monthLiangExing[monthKey][lx] += 1;
  }

  var months = Object.keys(monthCases).sort();
  if (!months.length) {
    alert('无有效数据');
    return;
  }
  var minStartMonth = '2022-01';
  if (months.length && months[0] > minStartMonth) {
    var filled = [];
    var y = 2022, m = 1;
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
    var o1 = document.createElement('option');
    o1.value = m; o1.textContent = m; startSel.appendChild(o1);
    var o2 = document.createElement('option');
    o2.value = m; o2.textContent = m; endSel.appendChild(o2);
  });
  startSel.value = months.indexOf(minStartMonth) >= 0 ? minStartMonth : months[0];
  endSel.value = months[months.length - 1];

  function render() {
    var start = startSel.value;
    var end = endSel.value;
    if (start > end) { var t = start; start = end; end = t; }

    var lineData = [];
    var stackBenign = [];
    var stackMalign = [];
    var stackOther = [];
    var cats = [];

    for (var i = 0; i < months.length; i++) {
      var m = months[i];
      if (m < start || m > end) continue;
      var p = m.split('-');
      var xVal = Date.UTC(parseInt(p[0], 10), parseInt(p[1], 10) - 1, 1);
      lineData.push([xVal, monthCases[m] || 0]);
      cats.push(m);
      var le = monthLiangExing[m] || { 良性: 0, 恶性: 0, 其他: 0 };
      stackBenign.push(le.良性);
      stackMalign.push(le.恶性);
      stackOther.push(le.其他);
    }

    Highcharts.chart('container-combined', {
      chart: { type: 'column' },
      credits: { enabled: false },
      title: { text: null },
      xAxis: { categories: cats },
      yAxis: { title: { text: '病例数' }, min: 0, stackLabels: { enabled: true } },
      plotOptions: { column: { stacking: 'normal' } },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
      },
      series: [
        { name: '良性', data: stackBenign, color: '#90ed7d', type: 'column', stack: 'liang' },
        { name: '恶性', data: stackMalign, color: '#f45b5b', type: 'column', stack: 'liang' },
        { name: '其他', data: stackOther, color: '#7cb5ec', type: 'column', stack: 'liang' },
        { name: '病例数', data: lineData.map(function (p) { return p[1]; }), type: 'line', color: '#2b908f', marker: { enabled: true }, zIndex: 3 }
      ]
    });

    var yearCases = {};
    var yearLiangExing = {};
    for (var k = 0; k < months.length; k++) {
      var mo = months[k];
      if (mo < start || mo > end) continue;
      var yr = mo.substring(0, 4);
      yearCases[yr] = (yearCases[yr] || 0) + (monthCases[mo] || 0);
      if (!yearLiangExing[yr]) yearLiangExing[yr] = { 良性: 0, 恶性: 0, 其他: 0 };
      var le = monthLiangExing[mo] || { 良性: 0, 恶性: 0, 其他: 0 };
      yearLiangExing[yr].良性 += le.良性;
      yearLiangExing[yr].恶性 += le.恶性;
      yearLiangExing[yr].其他 += le.其他;
    }
    var years = Object.keys(yearCases).sort();
    var yearCats = years;
    var yearStackBenign = years.map(function (y) { return (yearLiangExing[y] || {}).良性 || 0; });
    var yearStackMalign = years.map(function (y) { return (yearLiangExing[y] || {}).恶性 || 0; });
    var yearStackOther = years.map(function (y) { return (yearLiangExing[y] || {}).其他 || 0; });
    var yearLineData = years.map(function (y) { return yearCases[y] || 0; });

    Highcharts.chart('container-yearly', {
      chart: { type: 'column' },
      credits: { enabled: false },
      title: { text: null },
      xAxis: { categories: yearCats },
      yAxis: { title: { text: '病例数' }, min: 0, stackLabels: { enabled: true } },
      plotOptions: { column: { stacking: 'normal' } },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
      },
      series: [
        { name: '良性', data: yearStackBenign, color: '#90ed7d', type: 'column', stack: 'liang2' },
        { name: '恶性', data: yearStackMalign, color: '#f45b5b', type: 'column', stack: 'liang2' },
        { name: '其他', data: yearStackOther, color: '#7cb5ec', type: 'column', stack: 'liang2' },
        { name: '病例数', data: yearLineData, type: 'line', color: '#2b908f', marker: { enabled: true }, zIndex: 3 }
      ]
    });
  }

  render();
  startSel.addEventListener('change', render);
  endSel.addEventListener('change', render);
});
