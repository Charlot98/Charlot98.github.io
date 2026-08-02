loadCSV('csv/doctor_list.csv', function (listCsv) {
  var listRows = parseCSV(listCsv);
  var doctorOrder = [];
  var doctorLevelMap = {};
  var idxListDoctor = -1, idxListNo = -1, idxListLevel = -1;

  if (listRows.length > 1) {
    var listHeader = listRows[0].map(function (h) { return (h || '').trim(); });
    idxListNo = listHeader.indexOf('医生编号');
    idxListDoctor = listHeader.indexOf('医生');
    idxListLevel = listHeader.indexOf('等级');
    for (var li = 1; li < listRows.length; li++) {
      var listCols = listRows[li];
      var no = listCols[idxListNo] || '';
      var doc = (listCols[idxListDoctor] || '').trim();
      var lvl = idxListLevel >= 0 ? (listCols[idxListLevel] || '').trim() : '';
      if (no === '00' || !doc || lvl === '不显示') continue;
      doctorOrder.push(doc);
      if (lvl) doctorLevelMap[doc] = lvl;
    }
  }

  loadCSV('csv/doctor_workload.csv', function (csv) {
  var rows = parseCSV(csv);
  if (rows.length <= 1) {
    alert('csv/doctor_workload.csv 内容为空或只有表头');
    return;
  }

  var header = rows[0].map(function (h) { return (h || '').trim(); });
  var idxDoctor = header.indexOf('医生');
  var idxDate = header.indexOf('日期');
  var idxTenure = header.indexOf('入职时长');
  var idxMorn = header.indexOf('上午');
  var idxAfter = header.indexOf('下午');
  var idxEven = header.indexOf('晚上');
  var idxLevel = header.indexOf('医生等级');
  var idxReport = header.indexOf('报告数量');
  var idxAudit = header.indexOf('审核数量');

  if (idxDoctor === -1 || idxDate === -1 || idxMorn === -1 || idxAfter === -1 || idxEven === -1) {
    alert('CSV 表头中缺少 必要列：医生 / 日期 / 上午 / 下午 / 晚上');
    return;
  }
  if (idxReport === -1 || idxAudit === -1) {
    alert('CSV 表头中缺少必要列：报告数量 / 审核数量');
    return;
  }

  var allMorningData = [];
  var allAfternoonData = [];
  var allEveningData = [];
  var allTotalData = [];
  var rawRows = [];
  var doctorSet = {};

  for (var i = 1; i < rows.length; i++) {
    var cols = rows[i];
    if (!cols || !cols.length) continue;
    var doctor = cols[idxDoctor];
    var dateStr = cols[idxDate];
    var tenureRaw = idxTenure >= 0 ? cols[idxTenure] : '';
    var tenure = parseInt(tenureRaw, 10);
    var morn = parseFloat(cols[idxMorn] || '0');
    var after = parseFloat(cols[idxAfter] || '0');
    var even = parseFloat(cols[idxEven] || '0');
    var reportCount = parseFloat(cols[idxReport] || '0');
    var auditCount = parseFloat(cols[idxAudit] || '0');
    if (isNaN(reportCount)) reportCount = 0;
    if (isNaN(auditCount)) auditCount = 0;
    var level = doctorLevelMap[doctor] || (idxLevel >= 0 ? String(cols[idxLevel] || '').trim() : '');

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
    if (total > 0 || reportCount > 0 || auditCount > 0) {
      allTotalData.push({
        x: tenure, y: total, report: reportCount, audit: auditCount,
        name: doctor, level: level,
        _checkDate: checkDateTs, _tenure: tenure
      });
    }
    rawRows.push({ cols: cols, _tenure: tenure });
  }
  var MAIN_LEVELS = { '预备': true, '初级': true, '中级': true, '高级': true };
  function getDoctorLevel(name) {
    return doctorLevelMap[name] || '其它';
  }
  function isMainLevelDoctor(name) {
    return !!MAIN_LEVELS[getDoctorLevel(name)];
  }

  // 超声：不展示「其它」等级医生（如康博）；未勾选即不计入图表
  var listedDoctors = doctorOrder.filter(function (d) {
    return doctorSet[d] && isMainLevelDoctor(d);
  });
  var doctorNames = listedDoctors;

  var doctorContainer = document.getElementById('doctor-checkboxes');
  var tenureRangeSelect = initTenureRangeSelect({
    root: document,
    onApply: renderCharts
  });

  function createDoctorCheckbox(name) {
    var label = document.createElement('label');
    label.className = 'doctor-checkbox-label';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'doctor-filter';
    cb.value = name;
    cb.checked = true;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + name));
    return label;
  }

  var mainList = document.createElement('div');
  mainList.className = 'doctor-checkbox-list-main';
  listedDoctors.forEach(function (name) {
    mainList.appendChild(createDoctorCheckbox(name));
  });
  if (mainList.childNodes.length) doctorContainer.appendChild(mainList);

  function syncDoctorCheckboxesByLevel() {
    var selectedLevels = getSelectedLevels();
    doctorContainer.querySelectorAll('.doctor-filter').forEach(function (cb) {
      var lvl = getDoctorLevel(cb.value);
      cb.checked = selectedLevels.length > 0 && selectedLevels.indexOf(lvl) !== -1;
    });
    renderCharts();
    if (doctorSelectionToggle) doctorSelectionToggle.update();
  }

  document.querySelectorAll('.doctor-filter').forEach(function (cb) {
    cb.addEventListener('change', renderCharts);
  });

  var doctorSelectionToggle = initDoctorSelectionToggle({
    button: document.getElementById('doctor-select-all'),
    root: document,
    getCheckboxes: function () { return doctorContainer.querySelectorAll('.doctor-filter'); },
    selectAll: function () {
      document.querySelectorAll('.level-filter').forEach(function (cb) {
        if (cb.value !== '其它') cb.checked = true;
      });
      syncDoctorCheckboxesByLevel();
    },
    clear: function () {
      document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = false; });
      syncDoctorCheckboxesByLevel();
    }
  });

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
    return docs;
  }

  function filterData(data, selectedDoctors) {
    return data.filter(function (point) {
      if (point.name && selectedDoctors.indexOf(point.name) === -1) return false;
      return true;
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
    var selectedDoctors = getSelectedDoctors();
    var tenureRange = tenureRangeSelect.getRange();

    var totalData = filterDataByTenure(
      filterData(allTotalData, selectedDoctors), tenureRange.minDays, tenureRange.maxDays);

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
      title: { text: '医生每日检查量' },
      xAxis: {
        type: 'linear',
        title: { text: '入职时长（天）' },
        allowDecimals: false
      },
      yAxis: { title: { text: '检查量（次数）' }, min: 0, allowDecimals: false },
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

    var filteredForSum = filterData(allTotalData, selectedDoctors);
    var doctorReport = {};
    var doctorAudit = {};
    selectedDoctors.forEach(function (doc) {
      doctorReport[doc] = 0;
      doctorAudit[doc] = 0;
    });
    filteredForSum.forEach(function (p) {
      var t = p._tenure != null ? p._tenure : p.x;
      if (t >= tenureRange.minDays && t <= tenureRange.maxDays && doctorReport[p.name] !== undefined) {
        doctorReport[p.name] += p.report || 0;
        doctorAudit[p.name] += p.audit || 0;
      }
    });
    var barCategories = selectedDoctors;
    var reportData = selectedDoctors.map(function (d) { return doctorReport[d] || 0; });
    var auditData = selectedDoctors.map(function (d) { return doctorAudit[d] || 0; });

    Highcharts.chart('container-cumulative', {
      chart: { type: 'column' },
      title: {
        text: tenureRange.label === '全部'
          ? '全部入职时长的报告 / 审核数量'
          : '入职 ' + tenureRange.label + '内的报告 / 审核数量'
      },
      xAxis: {
        type: 'category',
        categories: barCategories
      },
      yAxis: {
        title: { text: '检查量（次数）' },
        min: 0,
        allowDecimals: false,
        stackLabels: {
          enabled: true,
          formatter: function () { return this.total; },
          style: {
            color: '#374151',
            fontSize: '10px',
            fontWeight: '600',
            textOutline: 'none'
          }
        }
      },
      credits: { enabled: false },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 0
      },
      tooltip: {
        shared: true,
        formatter: function () {
          var points = this.points || [];
          var total = 0;
          var lines = ['<b>' + this.x + '</b>'];
          points.forEach(function (point) {
            total += point.y;
            lines.push(
              '<span style="color:' + point.color + '">●</span> ' +
              point.series.name + '：<b>' + point.y + '</b>'
            );
          });
          lines.push('合计：<b>' + total + '</b>');
          return lines.join('<br/>');
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderWidth: 0,
          maxPointWidth: 28,
          groupPadding: 0.08,
          pointPadding: 0.02,
          dataLabels: { enabled: false }
        },
        series: {
          animation: false,
          states: { inactive: { opacity: 1 } }
        }
      },
      series: [
        { name: '审核数量', data: auditData, color: '#f59e0b' },
        { name: '报告数量', data: reportData, color: '#4a90d9' }
      ]
    });
  }

  syncDoctorCheckboxesByLevel();

  document.querySelectorAll('.level-filter').forEach(function (cb) {
    cb.addEventListener('change', syncDoctorCheckboxesByLevel);
  });

  document.getElementById('export-excel-btn').onclick = function () {
    var tenureRange = tenureRangeSelect.getRange();
    var selectedDoctors = getSelectedDoctors();
    var filtered = rawRows.filter(function (r) {
      var t = r._tenure;
      if (t == null || t < tenureRange.minDays || t > tenureRange.maxDays) return false;
      var doc = r.cols[idxDoctor];
      if (!doc || selectedDoctors.indexOf(doc) === -1) return false;
      return true;
    });
    var rows = filtered.map(function (r) { return r.cols; });
    if (!rows.length) {
      alert('当前筛选条件下没有数据可导出');
      return;
    }
    var rangeLabel = tenureRange.label === '全部' ? '全部入职时长' : '入职' + tenureRange.label + '内';
    downloadExcel(header, rows, '医生检查量_' + rangeLabel + '.xlsx');
  };
  });
});