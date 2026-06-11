(function () {
  var cfg = window.WORKLOAD_PAGE || {};
  var csvPath = cfg.csvPath || 'ct_doctor_workload.csv';
  var label = cfg.label || 'CT';
  var useTenure = !!cfg.useTenure;

  function toUTC(dateStr) {
    if (!dateStr) return NaN;
    var core = String(dateStr).trim().slice(0, 10);
    var p = core.split('-');
    if (p.length !== 3) return NaN;
    var y = parseInt(p[0], 10);
    var m = parseInt(p[1], 10) - 1;
    var d = parseInt(p[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return NaN;
    return Date.UTC(y, m, d);
  }

  function isSummaryDoctor(name) {
    return name === '小计' || name === '合计';
  }

  function polynomialRegression(data) {
    var n = data.length;
    if (n < 3) return null;
    var xs = data.map(function (p) { return p.x; });
    var xMin = Math.min.apply(null, xs);
    var xMax = Math.max.apply(null, xs);
    var xRange = xMax - xMin;
    if (xRange < 1e-10) return null;
    var A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    var B = [0, 0, 0];
    var i, r, c;
    for (i = 0; i < n; i++) {
      var t = (data[i].x - xMin) / xRange;
      var y = data[i].y;
      var ts = [1, t, t * t];
      for (r = 0; r < 3; r++) {
        for (c = 0; c < 3; c++) A[r][c] += ts[r] * ts[c];
        B[r] += y * ts[r];
      }
    }
    var coeffs = solve3(A, B);
    if (!coeffs) return null;
    return { coeffs: coeffs, xMin: xMin, xRange: xRange };
  }

  function solve3(A, B) {
    var n = 3, m = [], i, j, k;
    for (i = 0; i < n; i++) {
      m[i] = [A[i][0], A[i][1], A[i][2], B[i]];
    }
    for (k = 0; k < n; k++) {
      var pivot = k, maxAbs = Math.abs(m[k][k]);
      for (i = k + 1; i < n; i++) {
        var v = Math.abs(m[i][k]);
        if (v > maxAbs) { maxAbs = v; pivot = i; }
      }
      if (maxAbs < 1e-12) return null;
      if (pivot !== k) { var tmp = m[k]; m[k] = m[pivot]; m[pivot] = tmp; }
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

  function regressionCurveData(fit, numPoints) {
    var out = [], c = fit.coeffs, xMin = fit.xMin, xRange = fit.xRange;
    numPoints = numPoints || 120;
    for (var i = 0; i < numPoints; i++) {
      var x = xMin + (i / (numPoints - 1)) * xRange;
      var t = (x - xMin) / xRange;
      out.push([x, c[0] + c[1] * t + c[2] * t * t]);
    }
    return out;
  }

  function createDoctorCheckbox(name) {
    var labelEl = document.createElement('label');
    labelEl.className = 'doctor-checkbox-label';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'doctor-filter';
    cb.value = name;
    cb.checked = true;
    var text = document.createElement('span');
    text.textContent = name;
    labelEl.appendChild(cb);
    labelEl.appendChild(text);
    return labelEl;
  }

  loadCSV('doctor_list.csv', function (listCsv) {
    var doctorOrder = [];
    var doctorLevelMap = {};
    var doctorHireDate = {};
    var listRows = parseCSV(listCsv);
    if (listRows.length > 1) {
      var listHeader = listRows[0].map(function (h) { return (h || '').trim(); });
      var idxListNo = listHeader.indexOf('医生编号');
      var idxListDoctor = listHeader.indexOf('医生');
      var idxListLevel = listHeader.indexOf('等级');
      var idxListHire = listHeader.indexOf('入职时间');
      for (var li = 1; li < listRows.length; li++) {
        var listCols = listRows[li];
        var no = listCols[idxListNo] || '';
        var doc = (listCols[idxListDoctor] || '').trim();
        var lvl = idxListLevel >= 0 ? (listCols[idxListLevel] || '').trim() : '';
        var hireStr = idxListHire >= 0 ? (listCols[idxListHire] || '').trim() : '';
        if (no === '00' || !doc || lvl === '不显示') continue;
        doctorOrder.push(doc);
        if (lvl) doctorLevelMap[doc] = lvl;
        var hireTs = toUTC(hireStr);
        if (!isNaN(hireTs)) doctorHireDate[doc] = hireTs;
      }
    }

    function sortByHireDate(names) {
      return names.slice().sort(function (a, b) {
        var ta = doctorHireDate[a];
        var tb = doctorHireDate[b];
        if (ta != null && tb != null) return ta - tb;
        if (ta != null) return -1;
        if (tb != null) return 1;
        return a.localeCompare(b, 'zh-CN');
      });
    }

    function calcTenureDays(doctor, monthTs) {
      var hireTs = doctorHireDate[doctor];
      if (hireTs == null || isNaN(monthTs)) return NaN;
      return Math.floor((monthTs - hireTs) / 86400000);
    }

    loadCSV(csvPath, function (csv) {
      var rows = parseCSV(csv);
      if (!rows.length || rows.length === 1) {
        alert(csvPath + ' 内容为空或只有表头');
        return;
      }

      var header = rows[0].map(function (h) { return (h || '').trim(); });
      var idxMonth = header.indexOf('按月统计');
      var idxDoctor = header.indexOf('医生');
      var idxCases = header.indexOf('病例数');
      if (idxMonth < 0 || idxDoctor < 0 || idxCases < 0) {
        alert('缺少必要列：按月统计 / 医生 / 病例数');
        return;
      }

      var allPoints = [];
      var rawRows = [];
      var doctorSet = {};
      var monthSet = {};

      function getDoctorLevel(name) {
        return doctorLevelMap[name] || '其它';
      }

      function hasHireDate(name) {
        var ts = doctorHireDate[name];
        return ts != null && !isNaN(ts);
      }

      for (var i = 1; i < rows.length; i++) {
        var cols = rows[i];
        if (!cols || !cols.length) continue;
        var doctor = (cols[idxDoctor] || '').trim();
        var monthStr = (cols[idxMonth] || '').trim();
        var cases = parseFloat(cols[idxCases] || '0');
        if (!doctor || isSummaryDoctor(doctor)) continue;
        if (!monthStr || isNaN(cases)) continue;
        var monthTs = toUTC(monthStr);
        if (isNaN(monthTs)) continue;
        var monthKey = monthStr.slice(0, 7);
        var tenure = calcTenureDays(doctor, monthTs);
        if (useTenure && (isNaN(tenure) || tenure < 0)) continue;
        monthSet[monthKey] = true;
        doctorSet[doctor] = true;
        allPoints.push({
          x: useTenure ? tenure : monthTs,
          y: cases,
          name: doctor,
          level: getDoctorLevel(doctor),
          monthKey: monthKey,
          monthStr: monthStr.slice(0, 10),
          tenure: tenure,
          writeCount: cols[header.indexOf('撰写报告份数')] || '',
          auditCount: cols[header.indexOf('审核报告份数')] || ''
        });
        rawRows.push({ cols: cols, monthKey: monthKey, doctor: doctor, tenure: tenure });
      }

      function shouldListDoctor(name) {
        var lvl = getDoctorLevel(name);
        if (lvl === '预备' || lvl === '初级') return true;
        return !!doctorSet[name];
      }

      var listedDoctors = sortByHireDate(doctorOrder.filter(shouldListDoctor));
      var otherDoctors = Object.keys(doctorSet).filter(function (d) {
        return doctorOrder.indexOf(d) === -1;
      }).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
      var doctorNames = listedDoctors.concat(otherDoctors);

      var months = Object.keys(monthSet).sort();
      var doctorContainer = document.getElementById('doctor-checkboxes');
      var startMonthSel = document.getElementById('start-month');
      var endMonthSel = document.getElementById('end-month');
      var minDaysInput = document.getElementById('min-days');
      var maxDaysInput = document.getElementById('max-days');
      var tenureMin = Infinity;
      var tenureMax = -Infinity;

      allPoints.forEach(function (p) {
        if (p.tenure == null || isNaN(p.tenure)) return;
        if (p.tenure < tenureMin) tenureMin = p.tenure;
        if (p.tenure > tenureMax) tenureMax = p.tenure;
      });

      if (!useTenure && startMonthSel && endMonthSel) {
        months.forEach(function (m) {
          var o1 = document.createElement('option');
          o1.value = m; o1.textContent = m; startMonthSel.appendChild(o1);
          var o2 = document.createElement('option');
          o2.value = m; o2.textContent = m; endMonthSel.appendChild(o2);
        });
        if (months.length) {
          startMonthSel.value = months[0];
          endMonthSel.value = months[months.length - 1];
        }
      }

      if (useTenure && minDaysInput && maxDaysInput) {
        minDaysInput.min = 0;
        minDaysInput.value = tenureMin === Infinity ? 0 : Math.max(0, Math.floor(tenureMin));
        maxDaysInput.min = 0;
        maxDaysInput.value = tenureMax === -Infinity ? 5000 : Math.ceil(tenureMax);
      }

      var mainList = document.createElement('div');
      mainList.className = 'doctor-checkbox-list-main';
      listedDoctors.forEach(function (name) {
        mainList.appendChild(createDoctorCheckbox(name));
      });
      if (mainList.childNodes.length) doctorContainer.appendChild(mainList);
      if (otherDoctors.length) {
        var otherRow = document.createElement('div');
        otherRow.className = 'doctor-checkbox-list-other';
        otherDoctors.forEach(function (name) {
          otherRow.appendChild(createDoctorCheckbox(name));
        });
        doctorContainer.appendChild(otherRow);
      }

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

      function getMonthRange() {
        if (!startMonthSel || !endMonthSel) {
          return { startMonth: '', endMonth: '' };
        }
        var startMonth = startMonthSel.value;
        var endMonth = endMonthSel.value;
        if (startMonth > endMonth) {
          var t = startMonth; startMonth = endMonth; endMonth = t;
        }
        return { startMonth: startMonth, endMonth: endMonth };
      }

      function getTenureRange() {
        var minDays = minDaysInput ? parseInt(minDaysInput.value, 10) : 0;
        var maxDays = maxDaysInput ? parseInt(maxDaysInput.value, 10) : Infinity;
        if (isNaN(minDays)) minDays = 0;
        if (isNaN(maxDays)) maxDays = Infinity;
        if (minDays > maxDays) {
          var temp = minDays;
          minDays = maxDays;
          maxDays = temp;
        }
        return { minDays: minDays, maxDays: maxDays };
      }

      function filterPoints(selectedDoctors, selectedLevels) {
        var monthRange = getMonthRange();
        var tenureRange = getTenureRange();
        return allPoints.filter(function (p) {
          if (!hasHireDate(p.name)) return false;
          if (useTenure && (isNaN(p.tenure) || p.tenure < 0)) return false;
          if (selectedDoctors.indexOf(p.name) === -1) return false;
          if (selectedLevels.length > 0 && selectedLevels.indexOf(p.level) === -1) return false;
          if (useTenure) {
            return p.tenure >= tenureRange.minDays && p.tenure <= tenureRange.maxDays;
          }
          return p.monthKey >= monthRange.startMonth && p.monthKey <= monthRange.endMonth;
        });
      }

      function syncDoctorCheckboxesByLevel() {
        var selectedLevels = getSelectedLevels();
        doctorContainer.querySelectorAll('.doctor-filter').forEach(function (cb) {
          var lvl = getDoctorLevel(cb.value);
          cb.checked = selectedLevels.length > 0 && selectedLevels.indexOf(lvl) !== -1;
        });
        renderCharts();
      }

      function renderCharts() {
        var selectedDoctors = getSelectedDoctors();
        var selectedLevels = getSelectedLevels();
        var monthRange = getMonthRange();
        var tenureRange = getTenureRange();
        var points = filterPoints(selectedDoctors, selectedLevels);
        var showLegend = selectedDoctors.length < 18;
        var doctorColors = ['#7cb5ec', '#f7a35c', '#90ed7d', '#f45b5b', '#2b908f', '#8085e9', '#7798bf', '#aaeeee', '#ff0066', '#eeaaee', '#55bf3b', '#df5353', '#434348', '#91e8e1', '#e4d354', '#7f7f7f', '#f15c80', '#2e7d32'];

        var scatterSeries = [];

        if (showLegend) {
          selectedDoctors.forEach(function (doc, i) {
            var pts = points.filter(function (p) { return p.name === doc; }).sort(function (a, b) { return a.x - b.x; });
            if (!pts.length) return;
            var color = doctorColors[i % doctorColors.length];
            scatterSeries.push({
              name: doc,
              id: 'doc-' + doc,
              type: 'scatter',
              color: color,
              data: pts
            });
            if (pts.length >= 3) {
              var fit = polynomialRegression(pts);
              if (fit) {
                scatterSeries.push({
                  name: doc + ' 回归曲线',
                  type: 'spline',
                  color: color,
                  data: regressionCurveData(fit),
                  marker: { enabled: false },
                  line: { width: 2 },
                  showInLegend: false,
                  linkedTo: 'doc-' + doc,
                  enableMouseTracking: true
                });
              }
            }
          });
        } else {
          scatterSeries = [{
            name: '病例数',
            type: 'scatter',
            color: '#7cb5ec',
            data: points
          }];
        }

        Highcharts.chart('container-scatter', {
          chart: { type: 'scatter', zoomType: useTenure ? 'xy' : 'x' },
          title: { text: label + (useTenure ? ' 医生病例数散点图（入职时长）' : ' 医生月度病例数散点图') },
          xAxis: useTenure ? {
            title: { text: '入职时长（天）' },
            min: 0,
            allowDecimals: false
          } : {
            type: 'datetime',
            title: { text: null },
            labels: {
              formatter: function () {
                return Highcharts.dateFormat('%Y-%m', this.value);
              }
            }
          },
          yAxis: {
            title: { text: '病例数' },
            min: 0,
            allowDecimals: false
          },
          credits: { enabled: false },
          legend: {
            enabled: showLegend,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top'
          },
          tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormatter: function () {
              if (this.name) {
                var head = useTenure
                  ? '入职时长：<b>' + (this.tenure != null ? this.tenure : this.x) + '</b> 天<br/>' +
                    '月份：<b>' + (this.monthStr || '') + '</b><br/>'
                  : '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>';
                return head +
                  '医生：' + this.name + '<br/>' +
                  '等级：' + (this.level || '其它') + '<br/>' +
                  '病例数：<b>' + this.y + '</b><br/>' +
                  '撰写报告份数：' + (this.writeCount || 0) + '<br/>' +
                  '审核报告份数：' + (this.auditCount || 0);
              }
              if (useTenure) {
                return '入职时长：<b>' + Highcharts.numberFormat(this.x, 0) + '</b> 天<br/>' +
                  '拟合病例数：<b>' + Highcharts.numberFormat(this.y, 2) + '</b>';
              }
              return '月份：<b>' + Highcharts.dateFormat('%Y-%m', this.x) + '</b><br/>' +
                '拟合病例数：<b>' + Highcharts.numberFormat(this.y, 2) + '</b>';
            }
          },
          plotOptions: {
            scatter: { marker: { radius: 4, symbol: 'circle' } },
            series: { turboThreshold: 0 }
          },
          series: scatterSeries
        });

        var doctorTotals = {};
        selectedDoctors.forEach(function (d) { doctorTotals[d] = 0; });
        points.forEach(function (p) {
          doctorTotals[p.name] = (doctorTotals[p.name] || 0) + p.y;
        });
        var barCategories = selectedDoctors.slice().filter(function (d) {
          return (doctorTotals[d] || 0) > 0;
        }).sort(function (a, b) {
          return (doctorTotals[b] || 0) - (doctorTotals[a] || 0);
        });
        var barData = barCategories.map(function (d) { return doctorTotals[d]; });

        Highcharts.chart('container-bar', {
          chart: { type: 'column' },
          title: {
            text: useTenure
              ? label + ' 医生病例数汇总（入职 ' + tenureRange.minDays + ' ~ ' + tenureRange.maxDays + ' 天）'
              : label + ' 医生病例数汇总（' + monthRange.startMonth + ' ~ ' + monthRange.endMonth + '）'
          },
          xAxis: { type: 'category', categories: barCategories },
          yAxis: {
            title: { text: '病例数' },
            min: 0,
            allowDecimals: false
          },
          credits: { enabled: false },
          tooltip: { pointFormat: '<b>{point.y}</b> 例' },
          plotOptions: {
            column: { dataLabels: { enabled: true } }
          },
          series: [{ name: '病例总数', data: barData, showInLegend: false, color: '#7cb5ec' }]
        });
      }

      document.querySelectorAll('.doctor-filter').forEach(function (cb) {
        cb.addEventListener('change', renderCharts);
      });
      document.querySelectorAll('.level-filter').forEach(function (cb) {
        cb.addEventListener('change', syncDoctorCheckboxesByLevel);
      });
      document.getElementById('doctor-select-all').onclick = function () {
        document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = true; });
        syncDoctorCheckboxesByLevel();
      };
      document.getElementById('doctor-select-clear').onclick = function () {
        document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = false; });
        syncDoctorCheckboxesByLevel();
      };
      if (startMonthSel) startMonthSel.addEventListener('change', renderCharts);
      if (endMonthSel) endMonthSel.addEventListener('change', renderCharts);
      if (minDaysInput) {
        minDaysInput.addEventListener('input', renderCharts);
        minDaysInput.addEventListener('change', renderCharts);
      }
      if (maxDaysInput) {
        maxDaysInput.addEventListener('input', renderCharts);
        maxDaysInput.addEventListener('change', renderCharts);
      }

      var exportBtn = document.getElementById('export-excel-btn');
      if (exportBtn) {
        exportBtn.onclick = function () {
          var selectedDoctors = getSelectedDoctors();
          var selectedLevels = getSelectedLevels();
          var monthRange = getMonthRange();
          var tenureRange = getTenureRange();
          var filtered = rawRows.filter(function (r) {
            if (selectedDoctors.indexOf(r.doctor) === -1) return false;
            if (selectedLevels.length > 0 && selectedLevels.indexOf(getDoctorLevel(r.doctor)) === -1) return false;
            if (!hasHireDate(r.doctor)) return false;
            if (useTenure) {
              if (r.tenure == null || isNaN(r.tenure)) return false;
              return r.tenure >= tenureRange.minDays && r.tenure <= tenureRange.maxDays;
            }
            return r.monthKey >= monthRange.startMonth && r.monthKey <= monthRange.endMonth;
          });
          var outRows = filtered.map(function (r) { return r.cols; });
          if (!outRows.length) {
            alert('当前筛选条件下没有数据可导出');
            return;
          }
          var exportName = useTenure
            ? label + '_医生工作量_入职' + tenureRange.minDays + '-' + tenureRange.maxDays + '天'
            : label + '_医生工作量_' + monthRange.startMonth + '_' + monthRange.endMonth;
          downloadExcel(header, outRows, exportName + '.xlsx');
        };
      }

      syncDoctorCheckboxesByLevel();
    });
  });
})();
