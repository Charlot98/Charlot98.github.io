(function () {
  var MODALITIES = ['总病例', '超声', 'X线', 'CT', 'MRI', 'XA'];
  var WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var LEVEL_COLORS = ['#ebedf0', '#b8e4f5', '#69c5e8', '#009cdb', '#006b9e'];
  var SEARCH_PAGE = 'pages/experiment/personal.html';
  var RESULT_PAGE = 'pages/experiment/personal-result.html';
  var searchInput = document.getElementById('doctor-search');
  var searchHint = document.getElementById('search-hint');
  var doctorNameEl = document.getElementById('doctor-name');
  var heatmapEl = document.getElementById('heatmap');
  var yearSelectorEl = document.getElementById('year-selector');
  var lifetimeStatsEl = document.getElementById('lifetime-stats');
  var yearLabel = document.getElementById('year-label');
  var isSearchPage = !!searchInput;
  var isResultPage = !!heatmapEl;
  var heatmapRenderToken = 0;

  var doctorIndex = {};
  var dailyByDoctor = {};
  var currentDoctor = '';
  var currentModality = '总病例';
  var currentYear = new Date().getFullYear();
  var availableYears = [];
  var heatmapChart = null;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toDayKey(date) {
    return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 3600 * 1000);
  }

  function startOfWeekMonday(date) {
    return addDays(date, -((date.getUTCDay() + 6) % 7));
  }

  function weekdaysLabel(day) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
  }

  function levelForCount(count, thresholds) {
    if (!count) return 0;
    if (count <= thresholds[0]) return 1;
    if (count <= thresholds[1]) return 2;
    if (count <= thresholds[2]) return 3;
    return 4;
  }

  function buildThresholds(values) {
    var sorted = values.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    if (!sorted.length) return [1, 2, 3];
    function pick(ratio) {
      var idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * ratio) - 1));
      return sorted[idx];
    }
    var t1 = Math.max(1, pick(0.25));
    var t2 = Math.max(t1 + 1, pick(0.5));
    var t3 = Math.max(t2 + 1, pick(0.75));
    return [t1, t2, t3];
  }

  function modalityCounts(bucket) {
    var counts = {
      '超声': bucket['超声'] || 0,
      'X线': bucket['X线'] || 0,
      'CT': bucket['CT'] || 0,
      'MRI': bucket['MRI'] || 0,
      'XA': bucket['XA'] || 0
    };
    counts['总病例'] = counts['超声'] + counts['X线'] + counts['CT'] + counts['MRI'] + counts['XA'];
    return counts;
  }

  function queryDoctorName() {
    try {
      return new URLSearchParams(window.location.search).get('doctor') || '';
    } catch (error) {
      return '';
    }
  }

  function openResultPage(doctor) {
    window.location.assign(RESULT_PAGE + '?doctor=' + encodeURIComponent(doctor));
  }

  function trySearch() {
    var name = (searchInput.value || '').trim();
    if (!name) {
      searchHint.textContent = '请输入医生姓名';
      return;
    }
    if (doctorIndex[name]) {
      openResultPage(name);
      return;
    }
    searchHint.textContent = '未找到该医生';
  }

  if (isSearchPage) {
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        trySearch();
      }
    });

    searchInput.addEventListener('input', function () {
      searchHint.textContent = '';
    });
  }

  function sumDoctorCases(doctor, modality) {
    var source = dailyByDoctor[doctor] || {};
    var total = 0;
    Object.keys(source).forEach(function (day) {
      var bucket = source[day];
      if (modality === '总病例') {
        MODALITIES.slice(1).forEach(function (key) {
          total += bucket[key] || 0;
        });
      } else {
        total += bucket[modality] || 0;
      }
    });
    return total;
  }

  function getDoctorDaily(doctor, modality) {
    var source = dailyByDoctor[doctor] || {};
    var out = {};
    Object.keys(source).forEach(function (day) {
      var bucket = source[day];
      var value = 0;
      if (modality === '总病例') {
        MODALITIES.slice(1).forEach(function (key) {
          value += bucket[key] || 0;
        });
      } else {
        value = bucket[modality] || 0;
      }
      if (value > 0) out[day] = value;
    });
    return out;
  }

  function buildTooltipHtml(day, inRange, doctor) {
    if (!inRange) return false;
    var bucket = (dailyByDoctor[doctor] || {})[day] || {};
    var counts = modalityCounts(bucket);
    var date = day.slice(0, 10);
    var parts = date.split('-');
    var weekday = '';
    if (parts.length === 3) {
      var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
      weekday = ' (' + weekdaysLabel(d.getUTCDay()) + ')';
    }
    var html = '<div class="hc-personal-tip-title">' + date + weekday + '  总病例数 ' + counts['总病例'] + '</div>';
    if (!counts['总病例']) {
      html += '<div class="hc-personal-tip-row">当日无病例</div>';
      return html;
    }
    MODALITIES.slice(1).forEach(function (modality) {
      if (!counts[modality]) return;
      html +=
        '<div class="hc-personal-tip-row"><span>' + modality + '：</span><strong>' +
        counts[modality] + '例</strong></div>';
    });
    return html;
  }

  function setActiveModality(modality) {
    currentModality = modality;
    document.querySelectorAll('.personal-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-modality') === modality);
    });
    lifetimeStatsEl.querySelectorAll('.personal-stat-block').forEach(function (block) {
      block.classList.toggle('active', block.getAttribute('data-modality') === modality);
    });
    if (currentDoctor) renderHeatmap(currentDoctor, currentModality);
  }

  function renderLifetimeStats(doctor) {
    lifetimeStatsEl.innerHTML = '';
    MODALITIES.forEach(function (modality) {
      var block = document.createElement('button');
      block.type = 'button';
      block.className = 'personal-stat-block';
      block.setAttribute('data-modality', modality);
      block.classList.toggle('active', modality === currentModality);

      var label = document.createElement('div');
      label.className = 'personal-stat-label';
      label.textContent = modality;

      var value = document.createElement('div');
      value.className = 'personal-stat-value';
      value.textContent = String(sumDoctorCases(doctor, modality));
      var unit = document.createElement('span');
      unit.className = 'personal-stat-unit';
      unit.textContent = '例';
      value.appendChild(unit);

      block.appendChild(label);
      block.appendChild(value);
      block.addEventListener('click', function () {
        setActiveModality(modality);
      });
      lifetimeStatsEl.appendChild(block);
    });
  }

  function renderYearSelector() {
    yearSelectorEl.innerHTML = '';
    availableYears.forEach(function (year) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'personal-year-btn';
      button.textContent = year;
      button.classList.toggle('active', year === currentYear);
      button.addEventListener('click', function () {
        currentYear = year;
        yearSelectorEl.querySelectorAll('.personal-year-btn').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        if (currentDoctor) renderHeatmap(currentDoctor, currentModality);
      });
      yearSelectorEl.appendChild(button);
    });
  }

  function playHeatmapExpand(chart, renderToken) {
    if (!heatmapEl || !chart) return;
    heatmapEl.classList.remove('is-expanding');
    // 强制重启动画
    void heatmapEl.offsetWidth;
    heatmapEl.classList.add('is-expanding');

    var series = chart.series && chart.series[0];
    if (series && series.points) {
      series.points.forEach(function (point) {
        if (!point.graphic) return;
        var delay = (point.x || 0) * 12 + (point.y || 0) * 6;
        point.graphic.attr({ opacity: 0 });
        point.graphic.animate(
          { opacity: 1 },
          { duration: 220, defer: delay }
        );
      });
    }

    window.setTimeout(function () {
      if (renderToken !== heatmapRenderToken) return;
      heatmapEl.classList.remove('is-expanding');
    }, 1000);
  }

  function renderHeatmap(doctor, modality) {
    if (typeof Highcharts === 'undefined') {
      heatmapEl.innerHTML = '<div class="personal-empty">Highcharts 未加载</div>';
      return;
    }

    var renderToken = ++heatmapRenderToken;
    var daily = getDoctorDaily(doctor, modality);
    var start = new Date(Date.UTC(currentYear, 0, 1));
    var end = new Date(Date.UTC(currentYear, 11, 31));
    var gridStart = startOfWeekMonday(start);
    var gridEnd = addDays(startOfWeekMonday(end), 6);
    var weekCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / (7 * 24 * 3600 * 1000)) + 1;

    var values = [];
    var cursor = new Date(start.getTime());
    while (cursor <= end) {
      var key = toDayKey(cursor);
      if (daily[key]) values.push(daily[key]);
      cursor = addDays(cursor, 1);
    }
    var thresholds = buildThresholds(values);

    var monthLabels = {};
    var month = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (month <= end) {
      var week = Math.floor((startOfWeekMonday(month).getTime() - gridStart.getTime()) / (7 * 24 * 3600 * 1000));
      monthLabels[Math.max(0, week)] = MONTH_NAMES[month.getUTCMonth()];
      month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
    }
    var monthTickPositions = Object.keys(monthLabels).map(Number).sort(function (a, b) { return a - b; });

    var data = [];
    var total = 0;
    cursor = new Date(gridStart.getTime());
    while (cursor <= gridEnd) {
      var dayKey = toDayKey(cursor);
      var inRange = cursor >= start && cursor <= end;
      var count = inRange ? (daily[dayKey] || 0) : 0;
      if (inRange) total += count;
      var weekIndex = Math.round((startOfWeekMonday(cursor).getTime() - gridStart.getTime()) / (7 * 24 * 3600 * 1000));
      var weekdayIndex = (cursor.getUTCDay() + 6) % 7;
      var level = inRange ? levelForCount(count, thresholds) : 0;
      data.push({
        x: weekIndex,
        y: weekdayIndex,
        value: level,
        day: dayKey,
        count: count,
        inRange: inRange,
        color: inRange ? LEVEL_COLORS[level] : 'rgba(235, 237, 240, 0.35)'
      });
      cursor = addDays(cursor, 1);
    }

    if (renderToken !== heatmapRenderToken) return;

    yearLabel.textContent = currentYear + '年 · ' + total + '例';

    var marginTop = 40;
    var marginBottom = 16;
    var marginLeft = 48;
    var marginRight = 12;
    var spacingTop = 8;
    var spacingLeft = 4;
    var plotPadX = marginLeft + marginRight + spacingLeft;
    var plotPadY = marginTop + marginBottom + spacingTop;
    var availableWidth = (heatmapEl.parentElement && heatmapEl.parentElement.clientWidth) || heatmapEl.clientWidth || 900;
    var cellSize = Math.floor((availableWidth - plotPadX) / weekCount);
    if (cellSize < 10) cellSize = 10;
    if (cellSize > 14) cellSize = 14;
    var chartWidth = weekCount * cellSize + plotPadX;
    var chartHeight = 7 * cellSize + plotPadY;

    heatmapEl.style.width = chartWidth + 'px';
    heatmapEl.style.minWidth = chartWidth + 'px';
    heatmapEl.style.height = chartHeight + 'px';

    if (heatmapChart) {
      heatmapChart.destroy();
      heatmapChart = null;
    }

    heatmapChart = Highcharts.chart(heatmapEl, {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        width: chartWidth,
        height: chartHeight,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        spacingTop: spacingTop,
        spacingLeft: spacingLeft,
        animation: false
      },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        opposite: true,
        min: 0,
        max: weekCount - 1,
        tickPositions: monthTickPositions,
        tickLength: 0,
        lineWidth: 0,
        gridLineWidth: 0,
        labels: {
          align: 'left',
          allowOverlap: true,
          autoRotation: false,
          overflow: 'allow',
          crop: false,
          reserveSpace: true,
          x: 2,
          y: 4,
          style: {
            color: '#6b7280',
            fontSize: '13px',
            fontWeight: 'normal',
            textOverflow: 'none'
          },
          formatter: function () {
            return monthLabels[this.value] || '';
          }
        }
      },
      yAxis: {
        categories: WEEKDAYS,
        reversed: true,
        title: null,
        tickLength: 0,
        lineWidth: 0,
        gridLineWidth: 0,
        labels: {
          align: 'right',
          x: -6,
          reserveSpace: true,
          style: {
            color: '#6b7280',
            fontSize: '13px',
            fontWeight: 'normal',
            textOverflow: 'none',
            whiteSpace: 'nowrap'
          },
          formatter: function () {
            return this.value === 'Mon' || this.value === 'Wed' || this.value === 'Fri'
              ? this.value
              : '';
          }
        }
      },
      colorAxis: {
        showInLegend: false,
        dataClasses: [
          { from: 0, to: 0, color: LEVEL_COLORS[0] },
          { from: 1, to: 1, color: LEVEL_COLORS[1] },
          { from: 2, to: 2, color: LEVEL_COLORS[2] },
          { from: 3, to: 3, color: LEVEL_COLORS[3] },
          { from: 4, to: 4, color: LEVEL_COLORS[4] }
        ]
      },
      tooltip: {
        useHTML: true,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: '#334155',
        borderRadius: 8,
        shadow: false,
        style: { color: '#f8fafc', fontSize: '12px' },
        formatter: function () {
          return buildTooltipHtml(this.point.day, this.point.inRange, doctor);
        }
      },
      series: [{
        name: modality,
        borderWidth: 0,
        borderRadius: 2,
        colsize: 0.85,
        rowsize: 0.85,
        data: data,
        nullColor: 'transparent',
        dataLabels: { enabled: false },
        showInLegend: false,
        turboThreshold: 0,
        states: {
          hover: {
            brightness: 0
          }
        }
      }]
    }, function (chart) {
      if (renderToken !== heatmapRenderToken) return;
      playHeatmapExpand(chart, renderToken);
    });
  }

  function showResult(doctor) {
    if (!isResultPage) {
      openResultPage(doctor);
      return;
    }
    currentDoctor = doctor;
    document.title = doctor + ' · 个人查询（实验）';
    doctorNameEl.textContent = doctor;
    renderLifetimeStats(doctor);
    setActiveModality(currentModality);
  }

  if (isResultPage) {
    document.querySelectorAll('.personal-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActiveModality(btn.getAttribute('data-modality'));
      });
    });
  }

  loadCSV('csv/doctor_list.csv', function (listText) {
    var listRows = parseCSV(listText);
    if (!listRows.length) return;
    var listHeader = listRows[0].map(function (name) {
      return String(name || '').replace(/^\uFEFF/, '').trim();
    });
    var idxDoctor = listHeader.indexOf('医生');
    var idxNumber = listHeader.indexOf('医生编号');
    var idxLevel = listHeader.indexOf('等级');
    for (var i = 1; i < listRows.length; i++) {
      var row = listRows[i];
      var doctor = (row[idxDoctor] || '').trim();
      var level = (row[idxLevel] || '').trim();
      if (!doctor || level === '不显示') continue;
      doctorIndex[doctor] = {
        number: (row[idxNumber] || '').trim(),
        level: level || '未登记'
      };
    }

    if (isSearchPage) {
      searchInput.focus();
    }

    if (!isResultPage) return;

    var selectedDoctor = queryDoctorName().trim();
    if (!selectedDoctor || !doctorIndex[selectedDoctor]) {
      window.location.replace(SEARCH_PAGE);
      return;
    }

    loadPersonalCSV(selectedDoctor, function (dailyText) {
      var rows = parseCSV(dailyText);
      if (!rows.length) return;
      var header = rows[0].map(function (name) {
        return String(name || '').replace(/^\uFEFF/, '').trim();
      });
      var iDate = header.indexOf('日期');
      var iDoctor = header.indexOf('医生');
      var iNumber = header.indexOf('医生编号');
      var iLevel = header.indexOf('医生等级');
      var iModality = header.indexOf('模态');
      var iCount = header.indexOf('病例数');
      var yearSet = {};

      for (var r = 1; r < rows.length; r++) {
        var cols = rows[r];
        var day = (cols[iDate] || '').trim().slice(0, 10);
        var doctor = (cols[iDoctor] || '').trim();
        var modality = (cols[iModality] || '').trim();
        var count = parseInt(cols[iCount], 10) || 0;
        if (!day || !doctor || !modality || !count) continue;
        yearSet[parseInt(day.slice(0, 4), 10)] = true;
        if (!doctorIndex[doctor]) {
          doctorIndex[doctor] = {
            number: (cols[iNumber] || '').trim(),
            level: (cols[iLevel] || '').trim() || '未登记'
          };
        }
        if (!dailyByDoctor[doctor]) dailyByDoctor[doctor] = {};
        if (!dailyByDoctor[doctor][day]) {
          dailyByDoctor[doctor][day] = { 'X线': 0, '超声': 0, 'CT': 0, 'MRI': 0, 'XA': 0 };
        }
        if (dailyByDoctor[doctor][day][modality] == null) {
          dailyByDoctor[doctor][day][modality] = 0;
        }
        dailyByDoctor[doctor][day][modality] += count;
      }

      var latestYear = new Date().getFullYear();
      availableYears = Object.keys(yearSet).map(Number).filter(function (year) {
        return year >= latestYear - 2 && year <= latestYear;
      }).sort(function (a, b) { return b - a; });
      if (availableYears.indexOf(currentYear) === -1 && availableYears.length) {
        currentYear = availableYears[0];
      }
      renderYearSelector();

      showResult(selectedDoctor);
    });
  });
})();
