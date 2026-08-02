(function () {
  var cfg = window.WORKLOAD_PAGE || {};
  var csvPath = cfg.csvPath || 'csv/ct_doctor_workload.csv';
  var label = cfg.label || 'CT';
  var useTenure = !!cfg.useTenure;
  var dataFormat = cfg.dataFormat || 'workload';
  var projectName = cfg.projectName || '';
  var stackReportAudit = !!cfg.stackReportAudit;

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

  loadCSV('csv/doctor_list.csv', function (listCsv) {
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

      var header = rows[0].map(function (h) {
        return String(h || '').replace(/^\uFEFF/, '').trim();
      });
      var isProjectData = dataFormat === 'mriProject';
      var idxMonth = header.indexOf(isProjectData ? '年月' : '按月统计');
      var idxDoctor = header.indexOf('医生');
      var idxCases = header.indexOf(isProjectData ? '总数量' : '病例数');
      var idxProject = header.indexOf('MRI项目');
      var idxReport = header.indexOf(isProjectData ? '报告数量' : '撰写报告份数');
      var idxAudit = header.indexOf(isProjectData ? '审核数量' : '审核报告份数');
      if (
        idxMonth < 0 ||
        idxDoctor < 0 ||
        idxCases < 0 ||
        (isProjectData && (idxProject < 0 || idxReport < 0 || idxAudit < 0))
      ) {
        alert(isProjectData
          ? '缺少必要列：年月 / MRI项目 / 医生 / 报告数量 / 审核数量 / 总数量'
          : '缺少必要列：按月统计 / 医生 / 病例数');
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
        if (isProjectData && String(cols[idxProject] || '').trim() !== projectName) continue;
        var doctor = (cols[idxDoctor] || '').trim();
        var monthStr = (cols[idxMonth] || '').trim();
        var reportCount = idxReport >= 0 ? parseFloat(cols[idxReport] || '0') : 0;
        var auditCount = idxAudit >= 0 ? parseFloat(cols[idxAudit] || '0') : 0;
        var cases = isProjectData
          ? reportCount + auditCount
          : parseFloat(cols[idxCases] || '0');
        if (!doctor || isSummaryDoctor(doctor)) continue;
        if (!monthStr || isNaN(cases) || isNaN(reportCount) || isNaN(auditCount)) continue;
        var monthTs = toUTC(isProjectData ? monthStr.slice(0, 7) + '-01' : monthStr);
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
          monthStr: isProjectData ? monthKey : monthStr.slice(0, 10),
          tenure: tenure,
          writeCount: reportCount,
          auditCount: auditCount,
          totalCount: cases
        });
        rawRows.push({ cols: cols, monthKey: monthKey, doctor: doctor, tenure: tenure });
      }

      var MAIN_LEVELS = { '预备': true, '初级': true, '中级': true, '高级': true };

      function isMainLevelDoctor(name) {
        return !!MAIN_LEVELS[getDoctorLevel(name)];
      }

      function shouldListDoctor(name) {
        var lvl = getDoctorLevel(name);
        if (lvl === '预备' || lvl === '初级') return true;
        return !!doctorSet[name];
      }

      // 主列表：预备/初级/中级/高级；「其它」等级（如康博）单独分区
      var listedDoctors = sortByHireDate(doctorOrder.filter(function (name) {
        return isMainLevelDoctor(name) && shouldListDoctor(name);
      }));
      var otherDoctors = sortByHireDate(doctorOrder.filter(function (name) {
        return !isMainLevelDoctor(name) && shouldListDoctor(name);
      }));
      var extraOthers = Object.keys(doctorSet).filter(function (d) {
        return doctorOrder.indexOf(d) === -1;
      }).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
      otherDoctors = otherDoctors.concat(extraOthers);
      var doctorNames = listedDoctors.concat(otherDoctors);

      var months = Object.keys(monthSet).sort();
      var doctorContainer = document.getElementById('doctor-checkboxes');
      var startMonthSel = document.getElementById('start-month');
      var endMonthSel = document.getElementById('end-month');
      var tenureRangeSelect = useTenure ? initTenureRangeSelect({
        root: document,
        onApply: renderCharts
      }) : null;

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
        initMonthQuickRange({
          months: months,
          startSel: startMonthSel,
          endSel: endMonthSel,
          onApply: renderCharts
        });
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
        var otherTitle = document.createElement('div');
        otherTitle.className = 'doctor-checkbox-other-title';
        otherTitle.textContent = '其它';
        otherRow.appendChild(otherTitle);
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
        return docs;
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
        return tenureRangeSelect
          ? tenureRangeSelect.getRange()
          : { minDays: 0, maxDays: Infinity, label: '全部' };
      }

      function filterPoints(selectedDoctors) {
        var monthRange = getMonthRange();
        var tenureRange = getTenureRange();
        return allPoints.filter(function (p) {
          if (!hasHireDate(p.name)) return false;
          if (useTenure && (isNaN(p.tenure) || p.tenure < 0)) return false;
          if (selectedDoctors.indexOf(p.name) === -1) return false;
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
        if (doctorSelectionToggle) doctorSelectionToggle.update();
      }

      function renderCharts() {
        var selectedDoctors = getSelectedDoctors();
        var monthRange = getMonthRange();
        var tenureRange = getTenureRange();
        var points = filterPoints(selectedDoctors);
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
            name: stackReportAudit ? '总数量' : '病例数',
            type: 'scatter',
            color: '#7cb5ec',
            data: points
          }];
        }

        Highcharts.chart('container-scatter', {
          chart: { type: 'scatter', zoomType: useTenure ? 'xy' : 'x' },
          title: {
            text: label + (useTenure
              ? ' 医生病例数散点图（入职时长）'
              : stackReportAudit
                ? ' 医生月度报告及审核数散点图'
                : ' 医生月度病例数散点图')
          },
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
            title: { text: stackReportAudit ? '总数量' : '病例数' },
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
                var details = head +
                  '医生：' + this.name + '<br/>' +
                  '等级：' + (this.level || '其它') + '<br/>';
                if (stackReportAudit) {
                  return details +
                    '报告数量：' + (this.writeCount || 0) + '<br/>' +
                    '审核数量：' + (this.auditCount || 0) + '<br/>' +
                    '总数量：<b>' + this.y + '</b>';
                }
                return details +
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
        selectedDoctors.forEach(function (d) {
          doctorTotals[d] = { total: 0, report: 0, audit: 0 };
        });
        points.forEach(function (p) {
          if (!doctorTotals[p.name]) doctorTotals[p.name] = { total: 0, report: 0, audit: 0 };
          doctorTotals[p.name].total += p.y;
          doctorTotals[p.name].report += p.writeCount || 0;
          doctorTotals[p.name].audit += p.auditCount || 0;
        });
        var barCategories = selectedDoctors.slice().filter(function (d) {
          return doctorTotals[d] && doctorTotals[d].total > 0;
        }).sort(function (a, b) {
          return doctorTotals[b].total - doctorTotals[a].total;
        });
        var barData = barCategories.map(function (d) { return doctorTotals[d].total; });
        var reportData = barCategories.map(function (d) { return doctorTotals[d].report; });
        var auditData = barCategories.map(function (d) { return doctorTotals[d].audit; });

        Highcharts.chart('container-bar', {
          chart: { type: 'column' },
          title: {
            text: stackReportAudit
              ? label + ' 医生报告及审核数（' + monthRange.startMonth + ' ~ ' + monthRange.endMonth + '）'
              : useTenure
              ? label + ' 医生病例数汇总（' +
                (tenureRange.label === '全部' ? '全部入职时长' : '入职 ' + tenureRange.label + '内') + '）'
              : label + ' 医生病例数汇总（' + monthRange.startMonth + ' ~ ' + monthRange.endMonth + '）'
          },
          xAxis: { type: 'category', categories: barCategories },
          yAxis: {
            title: { text: stackReportAudit ? '数量' : '病例数' },
            min: 0,
            allowDecimals: false,
            stackLabels: stackReportAudit ? {
              enabled: true,
              formatter: function () { return this.total; },
              style: {
                color: '#374151',
                fontSize: '10px',
                fontWeight: '600',
                textOutline: 'none'
              }
            } : { enabled: false }
          },
          credits: { enabled: false },
          tooltip: stackReportAudit ? {
            shared: true,
            formatter: function () {
              var total = 0;
              var lines = ['<b>' + this.x + '</b>'];
              (this.points || []).forEach(function (point) {
                total += point.y;
                lines.push(
                  '<span style="color:' + point.color + '">●</span> ' +
                  point.series.name + '：<b>' + point.y + '</b>'
                );
              });
              lines.push('总数量：<b>' + total + '</b>');
              return lines.join('<br/>');
            }
          } : { pointFormat: '<b>{point.y}</b> 例' },
          plotOptions: {
            column: stackReportAudit ? {
              stacking: 'normal',
              borderWidth: 0,
              dataLabels: { enabled: false }
            } : { dataLabels: { enabled: true } }
          },
          series: stackReportAudit ? [
            { name: label + '审核总数', data: auditData, color: '#f59e0b' },
            { name: label + '报告总数', data: reportData, color: '#4a90d9' }
          ] : [{ name: '病例总数', data: barData, showInLegend: false, color: '#7cb5ec' }]
        });
      }

      document.querySelectorAll('.doctor-filter').forEach(function (cb) {
        cb.addEventListener('change', renderCharts);
      });
      document.querySelectorAll('.level-filter').forEach(function (cb) {
        cb.addEventListener('change', syncDoctorCheckboxesByLevel);
      });
      var doctorSelectionToggle = initDoctorSelectionToggle({
        button: document.getElementById('doctor-select-all'),
        root: document,
        getCheckboxes: function () {
          return Array.prototype.filter.call(
            doctorContainer.querySelectorAll('.doctor-filter'),
            function (cb) { return isMainLevelDoctor(cb.value); }
          );
        },
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
      if (startMonthSel) startMonthSel.addEventListener('change', renderCharts);
      if (endMonthSel) endMonthSel.addEventListener('change', renderCharts);

      var exportBtn = document.getElementById('export-excel-btn');
      if (exportBtn) {
        exportBtn.onclick = function () {
          var selectedDoctors = getSelectedDoctors();
          var monthRange = getMonthRange();
          var tenureRange = getTenureRange();
          var filtered = rawRows.filter(function (r) {
            if (selectedDoctors.indexOf(r.doctor) === -1) return false;
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
            ? label + '_医生工作量_' +
              (tenureRange.label === '全部' ? '全部入职时长' : '入职' + tenureRange.label + '内')
            : label + '_医生工作量_' + monthRange.startMonth + '_' + monthRange.endMonth;
          downloadExcel(header, outRows, exportName + '.xlsx');
        };
      }

      syncDoctorCheckboxesByLevel();
    });
  });
})();
