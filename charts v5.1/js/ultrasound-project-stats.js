(function () {
  var PROJECTS = [
    'TFAST',
    '心超',
    '眼超',
    '肌肉骨骼超声',
    '左心高阶',
    '右心高阶',
    '超声造影',
    '尿液、腹膜腔积液采样',
    '尿液、腹膜腔积液排空'
  ];
  var EXCLUDED_DOCTORS = {
    '1号屋': true,
    '超声医师': true,
    '管理员': true,
    '放射医师': true
  };
  var VALID_LEVELS = {
    '预备': true,
    '初级': true,
    '中级': true,
    '高级': true
  };

  function normalizeLevel(level) {
    var lvl = String(level || '').trim();
    return VALID_LEVELS[lvl] ? lvl : '其它';
  }

  function numberValue(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function doctorNumberValue(value) {
    var raw = String(value || '').trim();
    return raw ? numberValue(raw) : 999999;
  }

  function renderError(message) {
    var root = document.getElementById('project-charts');
    root.innerHTML = '';
    var error = document.createElement('div');
    error.className = 'project-stats-error';
    error.textContent = message;
    root.appendChild(error);
  }

  function createChartCard(project, rows, index, rangeLabel) {
    var root = document.getElementById('project-charts');
    var card = document.createElement('section');
    card.className = 'project-chart-card';
    var scroll = document.createElement('div');
    scroll.className = 'project-chart-scroll';
    var chart = document.createElement('div');
    chart.id = 'project-chart-' + index;
    chart.className = 'project-chart';
    scroll.appendChild(chart);
    card.appendChild(scroll);
    root.appendChild(card);

    if (!rows.length) {
      chart.className = 'project-chart-empty';
      chart.textContent = project + '：当前筛选条件下暂无数据';
      return;
    }

    chart.style.width = '100%';
    chart.style.minWidth = '0';

    var doctors = rows.map(function (row) { return row.doctor; });
    var reportData = rows.map(function (row) { return row.report; });
    var auditData = rows.map(function (row) { return row.audit; });

    Highcharts.chart(chart.id, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        spacingTop: 28,
        animation: false
      },
      credits: { enabled: false },
      title: {
        text: project + '（' + rangeLabel + '）',
        align: 'center',
        margin: 24,
        style: { fontSize: '18px', fontWeight: '600' }
      },
      xAxis: {
        categories: doctors,
        lineColor: '#d1d5db',
        tickColor: '#d1d5db',
        labels: {
          autoRotation: [-45, -60],
          style: { fontSize: '11px', color: '#4b5563' }
        }
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: '数量' },
        gridLineColor: '#eef0f3',
        stackLabels: {
          enabled: true,
          formatter: function () {
            return this.total;
          },
          style: {
            color: '#374151',
            fontSize: '10px',
            fontWeight: '600',
            textOutline: 'none'
          }
        }
      },
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
          lines.push('总数量：<b>' + total + '</b>');
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
        {
          name: '审核医生数量',
          data: auditData,
          color: '#f59e0b'
        },
        {
          name: '报告医生数量',
          data: reportData,
          color: '#4a90d9'
        }
      ]
    });
  }

  loadCSV('csv/doctor_list.csv', function (listCsv) {
    var listRows = parseCSV(listCsv);
    var doctorOrder = [];
    var doctorLevelMap = {};
    var doctorNumberMap = {};
    if (listRows.length > 1) {
      var listHeader = listRows[0].map(function (h) { return String(h || '').trim(); });
      var idxListNo = listHeader.indexOf('医生编号');
      var idxListDoctor = listHeader.indexOf('医生');
      var idxListLevel = listHeader.indexOf('等级');
      for (var li = 1; li < listRows.length; li++) {
        var listCols = listRows[li];
        var no = listCols[idxListNo] || '';
        var doc = String(listCols[idxListDoctor] || '').trim();
        var lvl = idxListLevel >= 0 ? String(listCols[idxListLevel] || '').trim() : '';
        if (no === '00' || !doc || lvl === '不显示' || EXCLUDED_DOCTORS[doc]) continue;
        doctorOrder.push(doc);
        doctorNumberMap[doc] = doctorNumberValue(no);
        doctorLevelMap[doc] = normalizeLevel(lvl);
      }
    }

    function getDoctorLevel(name) {
      return normalizeLevel(doctorLevelMap[name]);
    }

    loadCSV('csv/ultrasound_project_by_doctor.csv', function (csv) {
      var table = parseCSV(csv);
      if (table.length < 2) {
        renderError('超声项目统计数据为空，请先运行数据生成脚本。');
        return;
      }

      var header = table[0].map(function (value) {
        return String(value || '').replace(/^\uFEFF/, '').trim();
      });
      var monthIndex = header.indexOf('年月');
      var projectIndex = header.indexOf('超声项目');
      var doctorNumberIndex = header.indexOf('医生编号');
      var doctorIndex = header.indexOf('医生');
      var levelIndex = header.indexOf('医生等级');
      var reportIndex = header.indexOf('报告数量');
      var auditIndex = header.indexOf('审核数量');
      if (
        monthIndex < 0 ||
        projectIndex < 0 ||
        doctorIndex < 0 ||
        reportIndex < 0 ||
        auditIndex < 0
      ) {
        renderError('超声项目统计 CSV 表头不完整，请重新生成数据。');
        return;
      }

      var rawRows = [];
      var doctorSet = {};
      var monthSet = {};

      for (var i = 1; i < table.length; i++) {
        var row = table[i];
        var project = String(row[projectIndex] || '').trim();
        var doctor = String(row[doctorIndex] || '').trim();
        var month = String(row[monthIndex] || '').trim();
        if (!doctor || !month || PROJECTS.indexOf(project) === -1) continue;
        if (EXCLUDED_DOCTORS[doctor]) continue;

        var level = levelIndex >= 0
          ? String(row[levelIndex] || '').trim()
          : '';
        // 以医生列表等级为准（如康博 → 其它）
        level = normalizeLevel(doctorLevelMap[doctor] || level);
        doctorSet[doctor] = true;
        doctorLevelMap[doctor] = level;
        monthSet[month] = true;
        rawRows.push({
          month: month,
          project: project,
          doctor: doctor,
          doctorNumber: doctorNumberValue(row[doctorNumberIndex]),
          level: level,
          report: numberValue(row[reportIndex]),
          audit: numberValue(row[auditIndex])
        });
      }

      var months = Object.keys(monthSet).sort();
      // 超声：仅展示预备/初级/中级/高级；不展示「其它」等级医生（如康博）
      var listedDoctors = doctorOrder.filter(function (d) {
        return VALID_LEVELS[getDoctorLevel(d)];
      });
      var doctorNames = listedDoctors;

      var doctorContainer = document.getElementById('doctor-checkboxes');
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

      var startSel = document.getElementById('start-month');
      var endSel = document.getElementById('end-month');
      months.forEach(function (m) {
        var opt1 = document.createElement('option');
        opt1.value = m;
        opt1.textContent = m;
        startSel.appendChild(opt1);
        var opt2 = document.createElement('option');
        opt2.value = m;
        opt2.textContent = m;
        endSel.appendChild(opt2);
      });
      if (months.length) {
        startSel.value = months[0];
        endSel.value = months[months.length - 1];
      }

      function setQuickRangeActive(monthsBack) {
        document.querySelectorAll('.range-quick-btn').forEach(function (btn) {
          var value = parseInt(btn.getAttribute('data-months'), 10);
          if (monthsBack != null && value === monthsBack) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      function applyQuickRange(monthsBack) {
        if (!months.length) return;
        var endMonth = months[months.length - 1];
        var endParts = endMonth.split('-');
        var endYear = parseInt(endParts[0], 10);
        var endMon = parseInt(endParts[1], 10);
        var startIndex = endYear * 12 + (endMon - 1) - (monthsBack - 1);
        var startYear = Math.floor(startIndex / 12);
        var startMon = (startIndex % 12) + 1;
        var wantedStart = startYear + '-' + (startMon < 10 ? '0' : '') + startMon;

        var startValue = months[0];
        for (var i = 0; i < months.length; i++) {
          if (months[i] >= wantedStart) {
            startValue = months[i];
            break;
          }
        }
        startSel.value = startValue;
        endSel.value = endMonth;
        setQuickRangeActive(monthsBack);
        renderCharts();
      }

      document.querySelectorAll('.range-quick-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyQuickRange(parseInt(btn.getAttribute('data-months'), 10));
        });
      });
      initMonthRangeReset({
        startSel: startSel,
        endSel: endSel,
        onReset: renderCharts
      });

      function getSelectedLevels() {
        var levels = [];
        document.querySelectorAll('.level-filter').forEach(function (cb) {
          if (cb.checked) levels.push(cb.value);
        });
        return levels;
      }

      function getSelectedDoctors() {
        // 按默认顺序返回已勾选医生
        var selected = {};
        document.querySelectorAll('.doctor-filter').forEach(function (cb) {
          if (cb.checked) selected[cb.value] = true;
        });
        return doctorNames.filter(function (name) {
          return selected[name];
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

      function getMonthRange() {
        var startMonth = startSel.value;
        var endMonth = endSel.value;
        if (startMonth && endMonth && startMonth > endMonth) {
          var tmp = startMonth;
          startMonth = endMonth;
          endMonth = tmp;
        }
        return { startMonth: startMonth, endMonth: endMonth };
      }

      function aggregateRows(selectedDoctors, startMonth, endMonth) {
        var bucket = {};
        selectedDoctors.forEach(function (doctor) {
          PROJECTS.forEach(function (project) {
            var key = project + '\t' + doctor;
            bucket[key] = {
              project: project,
              doctor: doctor,
              doctorNumber: doctorNumberMap[doctor] || 999999,
              level: getDoctorLevel(doctor),
              report: 0,
              audit: 0
            };
          });
        });

        rawRows.forEach(function (row) {
          if (row.month < startMonth || row.month > endMonth) return;
          if (selectedDoctors.indexOf(row.doctor) === -1) return;
          var key = row.project + '\t' + row.doctor;
          if (!bucket[key]) return;
          bucket[key].report += row.report;
          bucket[key].audit += row.audit;
          bucket[key].level = getDoctorLevel(row.doctor);
          if (row.doctorNumber) bucket[key].doctorNumber = row.doctorNumber;
        });

        var byProject = {};
        PROJECTS.forEach(function (project) {
          byProject[project] = selectedDoctors.map(function (doctor) {
            return bucket[project + '\t' + doctor];
          });
        });
        return byProject;
      }

      function renderCharts() {
        var range = getMonthRange();
        var selectedDoctors = getSelectedDoctors();
        var root = document.getElementById('project-charts');
        root.innerHTML = '';

        if (!range.startMonth || !range.endMonth) {
          renderError('暂无可用月份数据。');
          return;
        }
        if (!selectedDoctors.length) {
          renderError('请至少选择一名医生。');
          return;
        }

        var rangeLabel = range.startMonth === range.endMonth
          ? range.startMonth
          : range.startMonth + ' 至 ' + range.endMonth;
        var byProject = aggregateRows(selectedDoctors, range.startMonth, range.endMonth);
        PROJECTS.forEach(function (project, index) {
          createChartCard(project, byProject[project], index, rangeLabel);
        });
      }

      var doctorSelectionToggle = initDoctorSelectionToggle({
        button: document.getElementById('doctor-select-all'),
        root: document,
        getCheckboxes: function () { return doctorContainer.querySelectorAll('.doctor-filter'); },
        selectAll: function () {
          document.querySelectorAll('.level-filter').forEach(function (cb) {
            // 「其它」继续保持既有规则：全选不主动勾选。
            if (cb.value !== '其它') cb.checked = true;
          });
          syncDoctorCheckboxesByLevel();
        },
        clear: function () {
          document.querySelectorAll('.level-filter').forEach(function (cb) { cb.checked = false; });
          syncDoctorCheckboxesByLevel();
        }
      });
      document.querySelectorAll('.level-filter').forEach(function (cb) {
        cb.addEventListener('change', syncDoctorCheckboxesByLevel);
      });
      document.querySelectorAll('.doctor-filter').forEach(function (cb) {
        cb.addEventListener('change', renderCharts);
      });
      startSel.addEventListener('change', function () {
        setQuickRangeActive(null);
        renderCharts();
      });
      endSel.addEventListener('change', function () {
        setQuickRangeActive(null);
        renderCharts();
      });

      document.getElementById('export-excel-btn').onclick = function () {
        var range = getMonthRange();
        var selectedDoctors = getSelectedDoctors();
        if (!selectedDoctors.length) {
          alert('请至少选择一名医生');
          return;
        }
        var byProject = aggregateRows(selectedDoctors, range.startMonth, range.endMonth);
        var exportHeader = ['年月范围', '超声项目', '医生编号', '医生', '医生等级', '报告数量', '审核数量', '总数量'];
        var exportRows = [];
        var rangeLabel = range.startMonth === range.endMonth
          ? range.startMonth
          : range.startMonth + ' 至 ' + range.endMonth;

        PROJECTS.forEach(function (project) {
          byProject[project].forEach(function (item) {
            exportRows.push([
              rangeLabel,
              project,
              item.doctorNumber === 999999 ? '' : item.doctorNumber,
              item.doctor,
              item.level,
              item.report,
              item.audit,
              item.report + item.audit
            ]);
          });
        });

        if (!exportRows.length) {
          alert('当前筛选条件下没有数据可导出');
          return;
        }
        downloadExcel(
          exportHeader,
          exportRows,
          '超声项目病例数_' + range.startMonth + '_' + range.endMonth + '.xlsx'
        );
      };

      syncDoctorCheckboxesByLevel();
    });
  });
})();
