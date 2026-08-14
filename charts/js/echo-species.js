(function () {
  'use strict';

  var SUPABASE_URL = 'https://qzftsswubbelwejzyqgg.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-lUH5JIzUGF3avpgk2L4Zw_FIfiZPLy';
  var DAY_MS = 24 * 60 * 60 * 1000;
  var FORECAST_END = Date.UTC(2026, 11, 31);
  var COLORS = {
    dog: '#2f6fed',
    cat: '#f3a53b',
    green: '#35a77b',
    purple: '#9f72d4',
    pink: '#e883a6',
    blue: '#4f91e8'
  };
  var YEAR_COLORS = ['#2f6fed', '#f3a53b', '#35a77b'];

  function number(value, decimals) {
    return Highcharts.numberFormat(value, decimals || 0);
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function commonChart(type) {
    return {
      chart: {
        type: type,
        backgroundColor: 'transparent',
        spacing: [22, 12, 12, 6]
      },
      title: { text: null },
      credits: { enabled: false },
      accessibility: { enabled: false }
    };
  }

  function legend() {
    return {
      align: 'left',
      verticalAlign: 'top',
      symbolRadius: 0,
      itemDistance: 24,
      itemStyle: { color: '#374151', fontSize: '13px', fontWeight: 'normal' }
    };
  }

  function categoryAxis(categories) {
    return {
      categories: categories,
      lineColor: '#d9dee5',
      tickColor: '#d9dee5',
      labels: { style: { color: '#5f6977', fontSize: '12px' } },
      title: { text: null }
    };
  }

  function countAxis(title) {
    return {
      min: 0,
      allowDecimals: false,
      title: {
        text: title,
        style: { color: '#6b7280', fontSize: '12px', fontWeight: 'normal' }
      },
      gridLineColor: '#edf0f3',
      labels: { style: { color: '#7b8491', fontSize: '12px' } }
    };
  }

  function percentAxis(max) {
    return {
      min: 0,
      max: max || 100,
      tickInterval: 10,
      title: {
        text: '占比',
        style: { color: '#6b7280', fontSize: '12px', fontWeight: 'normal' }
      },
      gridLineColor: '#edf0f3',
      labels: {
        format: '{value}%',
        style: { color: '#7b8491', fontSize: '12px' }
      }
    };
  }

  function darkTooltip(formatter, shared) {
    return {
      shared: Boolean(shared),
      useHTML: true,
      backgroundColor: '#182230',
      borderWidth: 0,
      borderRadius: 0,
      shadow: false,
      style: { color: '#ffffff' },
      formatter: formatter
    };
  }

  function fitQuadratic(points, start) {
    var observations = points.map(function (point) {
      return { x: Math.round((point[0] - start) / DAY_MS), y: point[1] };
    });
    var n = observations.length;
    var sumX = 0;
    var sumXX = 0;
    var sumXXX = 0;
    var sumXXXX = 0;
    var sumY = 0;
    var sumXY = 0;
    var sumXXY = 0;

    observations.forEach(function (item) {
      var x2 = item.x * item.x;
      sumX += item.x;
      sumXX += x2;
      sumXXX += x2 * item.x;
      sumXXXX += x2 * x2;
      sumY += item.y;
      sumXY += item.x * item.y;
      sumXXY += x2 * item.y;
    });

    var matrix = [
      [n, sumX, sumXX, sumY],
      [sumX, sumXX, sumXXX, sumXY],
      [sumXX, sumXXX, sumXXXX, sumXXY]
    ];

    for (var column = 0; column < 3; column += 1) {
      var pivot = column;
      for (var row = column + 1; row < 3; row += 1) {
        if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row;
      }
      var temporary = matrix[column];
      matrix[column] = matrix[pivot];
      matrix[pivot] = temporary;
      var divisor = matrix[column][column];
      for (var cell = column; cell < 4; cell += 1) matrix[column][cell] /= divisor;
      for (var target = 0; target < 3; target += 1) {
        if (target === column) continue;
        var factor = matrix[target][column];
        for (cell = column; cell < 4; cell += 1) {
          matrix[target][cell] -= factor * matrix[column][cell];
        }
      }
    }

    return { intercept: matrix[0][3], linear: matrix[1][3], quadratic: matrix[2][3] };
  }

  function regressionPoints(model, start) {
    var endIndex = Math.round((FORECAST_END - start) / DAY_MS);
    var points = [];
    for (var index = 0; index <= endIndex; index += 7) {
      var value = model.intercept + model.linear * index + model.quadratic * index * index;
      points.push([start + index * DAY_MS, Math.max(0, value)]);
    }
    var endValue = model.intercept + model.linear * endIndex + model.quadratic * endIndex * endIndex;
    points.push([FORECAST_END, Math.max(0, endValue)]);
    return points;
  }

  function renderSummary(data) {
    data.summary.forEach(function (item) {
      var suffix = item.period.indexOf('2026') === 0 ? '2026' : item.period;
      setText('summary-' + suffix, number(item.total));
    });
    setText('forecast-dog', number(data.forecast2026.dog) + ' 例');
    setText('forecast-cat', number(data.forecast2026.cat) + ' 例');
    setText('forecast-total', number(data.forecast2026.total) + ' 例');
  }

  function renderDaily(data) {
    var start = Date.parse(data.dataStart + 'T00:00:00Z');
    var dogRegression = fitQuadratic(data.daily.dog, start);
    var catRegression = fitQuadratic(data.daily.cat, start);
    var options = commonChart('line');
    options.chart.zoomType = 'x';
    options.chart.spacing = [22, 12, 18, 6];
    options.xAxis = {
      type: 'datetime',
      min: start,
      max: FORECAST_END,
      tickPixelInterval: 105,
      lineColor: '#d9dee5',
      labels: { style: { color: '#5f6977', fontSize: '11px' } },
      plotBands: [{
        from: Date.UTC(2026, 7, 1),
        to: Date.UTC(2027, 0, 1),
        color: 'rgba(53, 167, 123, 0.08)',
        label: { text: '预测区间', align: 'center', y: 16, style: { color: '#4f7c6b', fontSize: '11px' } }
      }],
      plotLines: [{ value: Date.UTC(2026, 7, 1), width: 1, color: '#7b8491', dashStyle: 'ShortDash' }]
    };
    options.yAxis = countAxis('每日病例数（例）');
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      if (this.series.options.species) {
        return '<span style="color:#cbd5e1">日期：' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</span><br>' +
          '<span>品种：<b>' + this.series.options.species + '</b></span><br>' +
          '<span>病例数：<b>' + number(this.y) + ' 例</b></span>';
      }
      return '<span style="color:#cbd5e1">日期：' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '</span><br>' +
        '<span>' + this.series.name + '：<b>' + number(this.y, 1) + ' 例</b></span>';
    }, false);
    options.plotOptions = {
      series: {
        marker: { enabled: false },
        animation: { duration: 650 },
        states: { inactive: { opacity: 0.25 } }
      }
    };
    options.series = [
      {
        id: 'dog-series', name: '犬', species: '犬', type: 'scatter', color: 'rgba(47, 111, 237, 0.38)',
        marker: { enabled: true, radius: 2.6, symbol: 'circle' }, data: data.daily.dog
      },
      {
        id: 'cat-series', name: '猫', species: '猫', type: 'scatter', color: 'rgba(243, 165, 59, 0.42)',
        marker: { enabled: true, radius: 2.6, symbol: 'circle' }, data: data.daily.cat
      },
      {
        name: '犬 二次回归', type: 'line', linkedTo: 'dog-series', showInLegend: false, color: COLORS.dog,
        lineWidth: 2.2, enableMouseTracking: true, data: regressionPoints(dogRegression, start)
      },
      {
        name: '猫 二次回归', type: 'line', linkedTo: 'cat-series', showInLegend: false, color: COLORS.cat,
        lineWidth: 2.2, enableMouseTracking: true, data: regressionPoints(catRegression, start)
      }
    ];
    Highcharts.chart('daily-trend-chart', options);
  }

  function renderHcmShare(dataset) {
    var options = commonChart('column');
    options.xAxis = categoryAxis(dataset.categories);
    options.yAxis = percentAxis(35);
    options.legend = { enabled: false };
    options.tooltip = darkTooltip(function () {
      return '<span style="color:#cbd5e1">' + this.x + '</span><br>' +
        'HCM 占比：<b>' + number(this.y, 1) + '%</b><br>' +
        '<span style="color:#cbd5e1">HCM ' + this.point.hcm + ' 例 / 猫心超 ' + this.point.total + ' 例</span>';
    }, false);
    options.plotOptions = {
      column: { borderWidth: 0, pointWidth: 58 },
      series: { dataLabels: { enabled: true, format: '{point.y:.1f}%', style: { textOutline: 'none' } } }
    };
    options.series = [{ name: dataset.series[0].name, color: COLORS.cat, data: dataset.series[0].data }];
    Highcharts.chart('hcm-share-chart', options);
  }

  function renderSpecies(dataset) {
    var options = commonChart('bar');
    options.xAxis = categoryAxis(dataset.categories);
    options.yAxis = percentAxis(100);
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      return '<span style="color:#cbd5e1">' + this.x + '</span><br>' +
        this.series.name + '：<b>' + number(this.y, 1) + '%</b><br>' +
        '<span style="color:#cbd5e1">病例数：' + this.point.count + ' 例</span>';
    }, false);
    options.plotOptions = {
      bar: { stacking: 'normal', borderWidth: 0 },
      series: {
        dataLabels: {
          enabled: true,
          inside: true,
          format: '{point.y:.1f}%',
          style: { color: '#ffffff', fontWeight: '700', textOutline: 'none' }
        }
      }
    };
    options.series = dataset.series.map(function (series) {
      return {
        name: series.name,
        color: series.name === '犬' ? COLORS.dog : COLORS.cat,
        data: series.data
      };
    });
    Highcharts.chart('echo-species-chart', options);
  }

  function groupedSeries(dataset) {
    return dataset.series.map(function (series, index) {
      return { name: series.name, color: YEAR_COLORS[index], data: series.data };
    });
  }

  function renderAge(dataset) {
    var options = commonChart('column');
    options.xAxis = categoryAxis(dataset.categories);
    options.xAxis.title = { text: '年龄（岁）', style: { color: '#6b7280', fontSize: '12px', fontWeight: 'normal' } };
    options.yAxis = countAxis('病例数（例）');
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      var rows = this.points.map(function (point) {
        return '<span style="color:' + point.color + '">●</span> ' + point.series.name + '：<b>' + point.y + ' 例</b>';
      }).join('<br>');
      return '<span style="color:#cbd5e1">年龄区间：' + (Number(this.x) - 1) + '—' + this.x + ' 岁</span><br>' + rows;
    }, true);
    options.plotOptions = { column: { borderWidth: 0, groupPadding: 0.1, pointPadding: 0.03 } };
    options.series = groupedSeries(dataset);
    Highcharts.chart('hcm-age-chart', options);
  }

  function renderBreed(dataset) {
    var options = commonChart('column');
    options.xAxis = categoryAxis(dataset.categories);
    options.yAxis = countAxis('病例数（例）');
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      var rows = this.points.map(function (point) {
        return '<span style="color:' + point.color + '">●</span> ' + point.series.name + '：<b>' + point.y + ' 例</b>';
      }).join('<br>');
      return '<span style="color:#cbd5e1">' + this.x + '</span><br>' + rows;
    }, true);
    options.plotOptions = { column: { borderWidth: 0, groupPadding: 0.12, pointPadding: 0.04 } };
    options.series = groupedSeries(dataset);
    Highcharts.chart('hcm-breed-chart', options);
  }

  function renderBreedShare(dataset) {
    var options = commonChart('column');
    options.xAxis = categoryAxis(dataset.categories);
    options.yAxis = percentAxis(70);
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      var rows = this.points.map(function (point) {
        return '<span style="color:' + point.color + '">●</span> ' + point.series.name + '：<b>' + number(point.y, 1) + '%</b>' +
          '<br><span style="color:#cbd5e1">HCM ' + point.point.hcm + ' 例 / 猫心超 ' + point.point.total + ' 例</span>';
      }).join('<br>');
      return '<span style="color:#cbd5e1">' + this.x + '</span><br>' + rows;
    }, true);
    options.plotOptions = { column: { borderWidth: 0, groupPadding: 0.12, pointPadding: 0.04 } };
    options.series = groupedSeries(dataset);
    Highcharts.chart('hcm-breed-share-chart', options);
  }

  function renderSex(dataset) {
    var colors = [COLORS.pink, COLORS.purple, COLORS.blue, COLORS.green];
    var options = commonChart('column');
    options.xAxis = categoryAxis(dataset.categories);
    options.yAxis = percentAxis(100);
    options.yAxis.tickInterval = 20;
    options.legend = legend();
    options.tooltip = darkTooltip(function () {
      return '<span style="color:#cbd5e1">' + this.x + '</span><br>' +
        '<span style="color:' + this.color + '">●</span> ' + this.series.name + '：<b>' + number(this.percentage, 1) + '%</b><br>' +
        '<span style="color:#cbd5e1">病例数：' + this.y + ' 例</span>';
    }, false);
    options.plotOptions = {
      column: { stacking: 'percent', borderWidth: 0, pointWidth: 72 },
      series: {
        dataLabels: {
          enabled: true,
          inside: true,
          formatter: function () { return number(this.percentage, 1) + '%'; },
          style: { color: '#ffffff', fontSize: '11px', fontWeight: '700', textOutline: 'none' }
        }
      }
    };
    options.series = dataset.series.map(function (series, index) {
      return { name: series.name, color: colors[index], data: series.data };
    });
    Highcharts.chart('hcm-sex-chart', options);
  }

  function render(data) {
    renderSummary(data);
    renderDaily(data);
    renderHcmShare(data.hcmShare);
    renderSpecies(data.speciesShare);
    renderAge(data.hcmAge);
    renderBreed(data.hcmBreed);
    renderBreedShare(data.hcmBreedShare);
    renderSex(data.hcmSex);
  }

  function showError(message) {
    var status = document.getElementById('echo-status');
    status.textContent = message;
    status.classList.add('error');
    status.hidden = false;
  }

  function loadSnapshot() {
    var endpoint = SUPABASE_URL + '/rest/v1/echo_dashboard_snapshots' +
      '?select=payload&snapshot_key=eq.current&limit=1';
    return fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
        Accept: 'application/json'
      },
      cache: 'no-store'
    }).then(function (response) {
      if (!response.ok) throw new Error('Supabase ' + response.status);
      return response.json();
    }).then(function (rows) {
      if (!Array.isArray(rows) || !rows[0] || !rows[0].payload) {
        throw new Error('未找到当前统计快照');
      }
      return rows[0].payload;
    });
  }

  loadSnapshot().then(function (data) {
    render(data);
    document.getElementById('echo-status').hidden = true;
  }).catch(function (error) {
    console.error('心超统计数据加载失败', error);
    showError('统计数据加载失败，请稍后刷新页面。');
  });
})();
