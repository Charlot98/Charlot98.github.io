loadCSV('00 医生列表.csv', function (listCsv) {
  var listLines = listCsv.trim().split('\n');
  var doctorOrder = [];
  var doctorLevelMap = {};
  var idxListDoctor = -1, idxListNo = -1, idxListLevel = -1;

  if (listLines.length > 1) {
    var listHeader = listLines[0].split(',').map(function (h) { return h.trim(); });
    idxListNo = listHeader.indexOf('医生编号');
    idxListDoctor = listHeader.indexOf('医生');
    idxListLevel = listHeader.indexOf('等级');
    for (var li = 1; li < listLines.length; li++) {
      var listCols = listLines[li].split(',');
      var no = listCols[idxListNo] || '';
      var doc = (listCols[idxListDoctor] || '').trim();
      var lvl = idxListLevel >= 0 ? (listCols[idxListLevel] || '').trim() : '';
      if (no === '00' || !doc || lvl === '不显示') continue;
      doctorOrder.push(doc);
      if (lvl) doctorLevelMap[doc] = lvl;
    }
  }

  loadCSV('03 医生检查量.csv', function (csv) {
  var lines = csv.trim().split('\n');
  if (lines.length <= 1) {
    alert('03 医生检查量.csv 内容为空或只有表头');
    return;
  }

  var header = lines[0].split(',').map(function (h) { return h.trim(); });
  var idxDoctor = header.indexOf('医生');
  var idxDate = header.indexOf('日期');
  var idxTenure = header.indexOf('入职时长');
  var idxMorn = header.indexOf('上午');
  var idxAfter = header.indexOf('下午');
  var idxEven = header.indexOf('晚上');
  var idxLevel = header.indexOf('医生等级');

  if (idxDoctor === -1 || idxDate === -1 || idxMorn === -1 || idxAfter === -1 || idxEven === -1) {
    alert('CSV 表头中缺少 必要列：医生 / 日期 / 上午 / 下午 / 晚上');
    return;
  }

  var allMorningData = [];
  var allAfternoonData = [];
  var allEveningData = [];
  var allTotalData = [];
  var doctorSet = {};
  var tenureMin = Infinity, tenureMax = -Infinity;

  for (var i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    var cols = lines[i].split(',');
    var doctor = cols[idxDoctor];
    var dateStr = cols[idxDate];
    var tenureRaw = idxTenure >= 0 ? cols[idxTenure] : '';
    var tenure = parseInt(tenureRaw, 10);
    var morn = parseFloat(cols[idxMorn] || '0');
    var after = parseFloat(cols[idxAfter] || '0');
    var even = parseFloat(cols[idxEven] || '0');
    var level = idxLevel >= 0 ? cols[idxLevel] : '';

    if (!doctor || !dateStr) continue;
    if (isNaN(tenure) || tenure < 0) continue;
    if (doctor === '超声医师') continue;

    var parts = dateStr.split('-');
    if (parts.length < 3) continue;
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) continue;
    var checkDateTs = Date.UTC(year, month, day);

    if (tenure < tenureMin) tenureMin = tenure;
    if (tenure > tenureMax) tenureMax = tenure;

    var total = 0;
    if (!isNaN(morn)) total += morn;
    if (!isNaN(after)) total += after;
    if (!isNaN(even)) total += even;

    if (doctor) doctorSet[doctor] = true;

    if (!isNaN(morn) && morn > 0) {
      allMorningData.push({
        x: tenure, y: morn, name: doctor, level: level,
        period: '上午', _checkDate: checkDateTs, _tenure: tenure
      });
    }
    if (!isNaN(after) && after > 0) {
      allAfternoonData.push({
        x: tenure, y: after, name: doctor, level: level,
        period: '下午', _checkDate: checkDateTs, _tenure: tenure
      });
    }
    if (!isNaN(even) && even > 0) {
      allEveningData.push({
        x: tenure, y: even, name: doctor, level: level,
        period: '晚上', _checkDate: checkDateTs, _tenure: tenure
      });
    }
    if (total > 0) {
      allTotalData.push({
        x: tenure, y: total, name: doctor, level: level,
        _checkDate: checkDateTs, _tenure: tenure
      });
    }
  }
  var doctorNames = doctorOrder.filter(function (d) { return doctorSet[d]; });
  var extra = Object.keys(doctorSet).filter(function (d) { return doctorOrder.indexOf(d) === -1; });
  doctorNames = doctorNames.concat(extra.sort());

  var doctorContainer = document.getElementById('doctor-checkboxes');
  var minDaysInput = document.getElementById('min-days');
  var maxDaysInput = document.getElementById('max-days');
  minDaysInput.min = 0;
  minDaysInput.value = (tenureMin === Infinity) ? 0 : Math.max(0, Math.floor(tenureMin));
  maxDaysInput.min = 0;
  maxDaysInput.value = (tenureMax === -Infinity) ? 5000 : Math.ceil(tenureMax);

  doctorNames.forEach(function (name) {
    var label = document.createElement('label');
    label.style.display = 'inline-block';
    label.style.marginRight = '8px';
    label.style.whiteSpace = 'nowrap';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'doctor-filter';
    cb.value = name;
    cb.checked = true;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + name));
    doctorContainer.appendChild(label);
  });

  function syncDoctorCheckboxesByLevel() {
    var selectedLevels = getSelectedLevels();
    doctorContainer.querySelectorAll('.doctor-filter').forEach(function (cb) {
      var lvl = doctorLevelMap[cb.value];
      cb.checked = selectedLevels.length > 0 && (!lvl || selectedLevels.indexOf(lvl) !== -1);
    });
    renderCharts();
  }

  document.querySelectorAll('.doctor-filter').forEach(function (cb) {
    cb.addEventListener('change', renderCharts);
  });

  document.getElementById('doctor-select-all').onclick = function () {
    document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = true; });
    syncDoctorCheckboxesByLevel();
  };
  document.getElementById('doctor-select-clear').onclick = function () {
    document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = false; });
    syncDoctorCheckboxesByLevel();
  };

  function getSelectedLevels() {
    var levels = [];
    document.querySelectorAll('.level-filter').forEach(function (cb) {
      if (cb.checked) levels.push(cb.value);
    });
    return levels;
  }

  function getSelectedDoctors() {
    var docs = [];
    doctorContainer.querySelectorAll('.doctor-filter').forEach(function (cb) {
      if (cb.checked) docs.push(cb.value);
    });
    return docs.length ? docs : doctorNames;
  }

  function filterData(data, selectedLevels, selectedDoctors) {
    return data.filter(function (point) {
      if (point.name && selectedDoctors.indexOf(point.name) === -1) return false;
      if (!point.level) return true;
      if (selectedLevels.length === 0) return true;
      return selectedLevels.indexOf(point.level) !== -1;
    });
  }

  function filterDataByTenure(data, minDays, maxDays) {
    minDays = parseInt(minDays, 10);
    maxDays = parseInt(maxDays, 10);
    if (isNaN(minDays)) minDays = 0;
    if (isNaN(maxDays)) maxDays = Infinity;
    return data.filter(function (p) {
      var t = p._tenure != null ? p._tenure : p.x;
      return t >= minDays && t <= maxDays;
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
    var A = [], B = [], i, j, r, c;
    for (i = 0; i < order; i++) { A[i] = []; for (j = 0; j < order; j++) A[i][j] = 0; B[i] = 0; }
    for (i = 0; i < n; i++) {
      var t = (data[i][xKey] - xMin) / xRange;
      var y = data[i][yKey];
      for (r = 0; r < order; r++) {
        for (c = 0; c < order; c++) A[r][c] += pow(t, r + c);
        B[r] += y * pow(t, r);
      }
    }
    var coeffs = solve3(A, B);
    if (!coeffs) return null;
    return { coeffs: coeffs, xMin: xMin, xMax: xMax, xRange: xRange };
  }

  function solve3(A, B) {
    var n = 3, m = [], i, j, k;
    for (i = 0; i < n; i++) {
      m[i] = [];
      for (j = 0; j < n; j++) m[i][j] = A[i][j];
      m[i][n] = B[i];
    }
    for (k = 0; k < n; k++) {
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

  function regressionCurveData(data, result, xKey, yKey, numPoints) {
    numPoints = numPoints || 120;
    if (!result || !result.coeffs || data.length < 2) return [];
    var xMin = result.xMin, xRange = result.xRange, c = result.coeffs;
    var out = [];
    for (var i = 0; i < numPoints; i++) {
      var x = xMin + (i / (numPoints - 1)) * xRange;
      var t = (x - xMin) / xRange;
      out.push([x, c[0] + c[1] * t + c[2] * t * t]);
    }
    return out;
  }

  function renderCharts() {
    var selectedLevels = getSelectedLevels();
    var selectedDoctors = getSelectedDoctors();
    var minDays = minDaysInput.value;
    var maxDays = maxDaysInput.value;

    var totalData = filterDataByTenure(
      filterData(allTotalData, selectedLevels, selectedDoctors), minDays, maxDays);

    var totalSeries = [];
    if (selectedDoctors.length < 18) {
      var doctorColors = ['#7cb5ec', '#f7a35c', '#90ed7d', '#f45b5b', '#2b908f', '#8085e9', '#7798bf', '#aaeeee', '#ff0066', '#eeaaee', '#55bf3b', '#df5353', '#434348', '#91e8e1', '#e4d354', '#7f7f7f', '#f15c80', '#2e7d32'];
      selectedDoctors.forEach(function (doc, i) {
        var pts = totalData.filter(function (p) { return p.name === doc; });
        var color = doctorColors[i % doctorColors.length];
        totalSeries.push({
          name: doc,
          id: 'vet-' + doc,
          type: 'scatter',
          data: pts,
          color: color
        });
        if (pts.length >= 3) {
          var result = polynomialRegression(pts, 'x', 'y', 2);
          if (result) {
            var lineData = regressionCurveData(pts, result, 'x', 'y');
            totalSeries.push({
              name: doc + ' 回归曲线',
              type: 'spline',
              data: lineData,
              marker: { enabled: false },
              line: { width: 2 },
              color: color,
              showInLegend: false,
              linkedTo: 'vet-' + doc,
              enableMouseTracking: true
            });
          }
        }
      });
    } else {
      totalSeries = [{ name: '总量', type: 'scatter', color: '#7cb5ec', data: totalData }];
    }

    Highcharts.chart('container-total', {
      chart: { type: 'scatter', zoomType: 'xy' },
      title: { text: '医生每日检查量点状图（总量视图）' },
      xAxis: {
        type: 'linear',
        title: { text: '入职时长（天）' },
        allowDecimals: false
      },
      yAxis: { title: { text: '检查量总次数' }, min: 0, allowDecimals: false },
      credits: { enabled: false },
      legend: { layout: 'horizontal', align: 'center', verticalAlign: 'top' },
      tooltip: {
        useHTML: true, headerFormat: '',
        pointFormatter: function () {
          var docName = this.name || (this.series.name ? this.series.name.replace(/\s*回归曲线$/, '') : '');
          var checkStr = this._checkDate != null ? Highcharts.dateFormat('%Y-%m-%d', this._checkDate) : '';
          return '医生：<b>' + docName + '</b><br/>等级：' + (this.level || '无') + '<br/>' +
            '入职时长：<b>' + (this.x != null ? this.x : this._tenure) + '</b> 天<br/>' +
            '检查日期：' + checkStr + '<br/>总检查量：<b>' + this.y + '</b>';
        }
      },
      plotOptions: {
        scatter: { marker: { radius: 4, symbol: 'circle' } },
        series: { turboThreshold: 0 }
      },
      series: totalSeries
    });

    var maxDaysNum = parseInt(maxDays, 10);
    if (isNaN(maxDaysNum)) maxDaysNum = Infinity;
    var filteredForSum = filterData(allTotalData, selectedLevels, selectedDoctors);
    var doctorTotals = {};
    selectedDoctors.forEach(function (doc) { doctorTotals[doc] = 0; });
    filteredForSum.forEach(function (p) {
      var t = p._tenure != null ? p._tenure : p.x;
      if (t <= maxDaysNum && doctorTotals[p.name] !== undefined) {
        doctorTotals[p.name] += p.y;
      }
    });
    var barCategories = selectedDoctors;
    var barData = selectedDoctors.map(function (d) { return doctorTotals[d] || 0; });

    Highcharts.chart('container-cumulative', {
      chart: { type: 'column' },
      title: { text: '入职天数 ≤ ' + maxDays + ' 天内的病例总数（按医生）' },
      xAxis: {
        type: 'category',
        categories: barCategories
      },
      yAxis: {
        title: { text: '总病例数' },
        min: 0,
        allowDecimals: false
      },
      credits: { enabled: false },
      tooltip: {
        pointFormat: '<b>{point.y}</b> 例'
      },
      plotOptions: {
        column: {
          dataLabels: { enabled: true }
        }
      },
      series: [{ name: '病例总数', data: barData, showInLegend: false }]
    });
  }

  renderCharts();

  document.querySelectorAll('.level-filter').forEach(function (cb) {
    cb.addEventListener('change', syncDoctorCheckboxesByLevel);
  });
  minDaysInput.addEventListener('input', renderCharts);
  minDaysInput.addEventListener('change', renderCharts);
  maxDaysInput.addEventListener('input', renderCharts);
  maxDaysInput.addEventListener('change', renderCharts);
  });
});