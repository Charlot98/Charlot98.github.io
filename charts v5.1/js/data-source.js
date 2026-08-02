(function (global) {
  var CACHE_PREFIX = 'vetvault:v5.2:csv:';
  var CACHE_TTL_MS = 15 * 60 * 1000;
  var CACHE_MAX_ENTRY_CHARS = 1500000;
  var CACHE_MAX_TOTAL_CHARS = 3000000;
  var PAGE_SIZE = 1000;
  var PARALLEL_PAGES = 4;
  var inFlight = {};
  var activeLoads = 0;
  var stats = { cacheHits: 0, networkLoads: 0, pageRequests: 0 };
  var sources = {
    'csv/doctor_list.csv': { table: 'doctors', order: 'doctor_code', columns: {
      doctor_code: '医生编号', doctor_name: '医生', hire_date: '入职时间', doctor_level: '等级'
    }},
    'csv/doctor_workload.csv': { table: 'doctor_daily_workload', order: 'stat_date', columns: {
      doctor_code: '医生编号', doctor_name: '医生', stat_date: '日期', tenure_days: '入职时长',
      morning_count: '上午', afternoon_count: '下午', evening_count: '晚上', total_count: '全天',
      total_fee: '当日总费用', fee_per_case: '费用病例比', doctor_level: '医生等级',
      report_count: '报告数量', review_count: '审核数量', day_type: '日期性质'
    }},
    'csv/doctor_workload_by_level.csv': { table: 'doctor_level_daily_stats', order: 'stat_date', columns: {
      stat_date: '日期', doctor_level: '医生等级', avg_case_count: '每日人均病例量', avg_fee: '每日人均费用',
      fee_per_case: '每日费用病例比', doctor_count: '该等级医生数量', day_type: '日期性质'
    }},
    'csv/ct_doctor_workload.csv': { table: 'modality_monthly_workload', filter: ['modality', 'ct'], order: 'stat_month', columns: {
      stat_month: '按月统计', doctor_name: '医生', report_count: '撰写报告份数', report_part_count: '撰写报告部位数',
      review_count: '审核报告份数', review_part_count: '审核报告部位数', case_count: '病例数'
    }},
    'csv/mri_doctor_workload.csv': { table: 'modality_monthly_workload', filter: ['modality', 'mri'], order: 'stat_month', columns: {
      stat_month: '按月统计', doctor_name: '医生', report_count: '撰写报告份数', report_part_count: '撰写报告部位数',
      review_count: '审核报告份数', review_part_count: '审核报告部位数', case_count: '病例数'
    }},
    'csv/personal_daily_by_doctor.csv': { table: 'personal_daily_stats', order: 'stat_date', columns: {
      stat_date: '日期', doctor_name: '医生', doctor_code: '医生编号', doctor_level: '医生等级', modality: '模态', case_count: '病例数'
    }},
    'csv/outpatient_registrations_2026.csv': { table: 'outpatient_daily_stats', order: 'stat_date', columns: {
      room_code: '房间号', clinic_name: '诊室', stat_date: '日期', month_number: '月', day_number: '日',
      weekday: '星期', specialty: '专科', doctor_name: '医生', slot_count: '放号数',
      appointment_count: '预约数', visit_count: '总接诊数', online_open_count: '线上空号数', offline_addon_count: '线下加号数'
    }}
  };

  var projectSources = {
    'csv/ultrasound_project_by_doctor.csv': ['ultrasound', '超声项目'],
    'csv/ct_project_by_doctor.csv': ['ct', '统计项目'],
    'csv/mri_project_by_doctor.csv': ['mri', 'MRI项目'],
    'csv/xray_project_by_doctor.csv': ['xray', 'X线项目']
  };
  var timeSources = {
    'csv/submission_period.csv': ['submission_period', '交单时段', '该交单时段对应病例数'],
    'csv/waiting_duration.csv': ['waiting_duration', '等待时长区间', '该时长对应病例数'],
    'csv/report_period.csv': ['report_period', '报告时段', '该报告时段对应病例数'],
    'csv/echo_report_period.csv': ['echo_report_period', '报告时段', '该心超报告时段对应病例数']
  };

  function cleanPath(path) { return String(path).split('?')[0].replace(/^\.\//, ''); }
  function cacheKey(key) { return CACHE_PREFIX + key; }
  function readCache(key) {
    try {
      var raw = sessionStorage.getItem(cacheKey(key));
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (!entry || typeof entry.csv !== 'string' || Date.now() - entry.savedAt > CACHE_TTL_MS) {
        sessionStorage.removeItem(cacheKey(key));
        return null;
      }
      stats.cacheHits += 1;
      return entry.csv;
    } catch (_error) {
      return null;
    }
  }
  function clearCache() {
    try {
      for (var i = sessionStorage.length - 1; i >= 0; i--) {
        var key = sessionStorage.key(i);
        if (key && key.indexOf(CACHE_PREFIX) === 0) sessionStorage.removeItem(key);
      }
    } catch (_error) {}
  }
  function writeCache(key, csv) {
    if (!csv || csv.length > CACHE_MAX_ENTRY_CHARS) return;
    try {
      var entries = [];
      var total = 0;
      for (var i = 0; i < sessionStorage.length; i++) {
        var storedKey = sessionStorage.key(i);
        if (!storedKey || storedKey.indexOf(CACHE_PREFIX) !== 0 || storedKey === cacheKey(key)) continue;
        var storedValue = sessionStorage.getItem(storedKey) || '';
        total += storedValue.length;
        var savedAt = 0;
        try { savedAt = JSON.parse(storedValue).savedAt || 0; } catch (_error) {}
        entries.push({ key: storedKey, size: storedValue.length, savedAt: savedAt });
      }
      entries.sort(function (a, b) { return a.savedAt - b.savedAt; });
      while (entries.length && total + csv.length > CACHE_MAX_TOTAL_CHARS) {
        var oldest = entries.shift();
        sessionStorage.removeItem(oldest.key);
        total -= oldest.size;
      }
      sessionStorage.setItem(cacheKey(key), JSON.stringify({ savedAt: Date.now(), csv: csv }));
    } catch (_error) {
      // Storage quota or privacy mode: the network result remains usable.
    }
  }
  function ensureLoadingOverlay() {
    var overlay = document.querySelector('.page-loading-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'page-loading-overlay';
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', '数据加载中');
    var spinner = document.createElement('div');
    spinner.className = 'page-loading-spinner';
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    return overlay;
  }
  function beginLoading() {
    activeLoads += 1;
    ensureLoadingOverlay().classList.add('show');
  }
  function endLoading() {
    activeLoads = Math.max(0, activeLoads - 1);
    if (!activeLoads) {
      var overlay = document.querySelector('.page-loading-overlay');
      if (overlay) overlay.classList.remove('show');
    }
  }
  function csvCell(value) {
    if (value == null) return '';
    var text = String(value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }
  function toCSV(rows, columns) {
    var keys = Object.keys(columns);
    var lines = [keys.map(function (key) { return csvCell(columns[key]); }).join(',')];
    rows.forEach(function (row) {
      lines.push(keys.map(function (key) { return csvCell(row[key]); }).join(','));
    });
    return lines.join('\n');
  }
  async function fetchAll(spec) {
    var client = await DashAuth.getClient();
    var columnList = Object.keys(spec.columns).join(',');
    function makeQuery(pageIndex, includeCount) {
      var start = pageIndex * PAGE_SIZE;
      var query = client.from(spec.table)
        .select(columnList, includeCount ? { count: 'exact' } : undefined)
        .range(start, start + PAGE_SIZE - 1);
      if (spec.filter) query = query.eq(spec.filter[0], spec.filter[1]);
      if (spec.order) query = query.order(spec.order, { ascending: true });
      if (spec.table !== 'doctors') query = query.order('id', { ascending: true });
      stats.pageRequests += 1;
      return query;
    }

    var first = await makeQuery(0, true);
    if (first.error) throw first.error;
    var pages = [first.data || []];
    if (pages[0].length < PAGE_SIZE) return pages[0];

    var totalPages = first.count == null ? null : Math.ceil(first.count / PAGE_SIZE);
    if (totalPages == null) {
      var fallbackPage = 1;
      while (true) {
        var fallbackResult = await makeQuery(fallbackPage, false);
        if (fallbackResult.error) throw fallbackResult.error;
        pages.push(fallbackResult.data || []);
        if (!fallbackResult.data || fallbackResult.data.length < PAGE_SIZE) break;
        fallbackPage += 1;
      }
      return [].concat.apply([], pages);
    }

    for (var batchStart = 1; batchStart < totalPages; batchStart += PARALLEL_PAGES) {
      var pageIndexes = [];
      for (var pageIndex = batchStart; pageIndex < Math.min(totalPages, batchStart + PARALLEL_PAGES); pageIndex++) {
        pageIndexes.push(pageIndex);
      }
      var results = await Promise.all(pageIndexes.map(async function (index) {
        var result = await makeQuery(index, false);
        if (result.error) throw result.error;
        return { index: index, data: result.data || [] };
      }));
      results.forEach(function (result) { pages[result.index] = result.data; });
    }
    return [].concat.apply([], pages);
  }
  function projectSpec(modality, label) {
    return { table: 'project_doctor_monthly', filter: ['modality', modality], order: 'stat_month', columns: {
      stat_month: '年月', project_name: label, doctor_code: '医生编号', doctor_name: '医生', doctor_level: '医生等级',
      report_count: '报告数量', review_count: '审核数量', total_count: '总数量'
    }};
  }
  function timeSpec(metricType, bucketLabel, countLabel) {
    return { table: 'time_bucket_stats', filter: ['metric_type', metricType], order: 'stat_date', columns: {
      stat_date: '日期', day_type: '日期性质', bucket_label: bucketLabel, case_count: countLabel
    }};
  }
  async function loadFresh(key) {
    var spec = sources[key];
    if (!spec && projectSources[key]) spec = projectSpec(projectSources[key][0], projectSources[key][1]);
    if (!spec && timeSources[key]) spec = timeSpec(timeSources[key][0], timeSources[key][1], timeSources[key][2]);
    if (key === 'csv/ultrasound_contrast_20260210.csv') {
      var monthlySpec = { table: 'ultrasound_contrast_monthly', order: 'stat_month', columns: {
        stat_month: '报告时间', classification: '良恶性', case_count: '病例数'
      }};
      var monthly = await fetchAll(monthlySpec);
      var expanded = [];
      monthly.forEach(function (row) {
        for (var i = 0; i < Number(row.case_count || 0); i++) {
          expanded.push({ stat_month: row.stat_month, classification: row.classification });
        }
      });
      return toCSV(expanded, { stat_month: '报告时间', classification: '良恶性' });
    }
    var yearMatch = key.match(/^csv\/doctor_workload_(\d{4})\.csv$/);
    if (yearMatch) spec = sources['csv/doctor_workload.csv'];
    if (!spec) throw new Error('未配置Supabase数据源：' + key);
    var rows = await fetchAll(spec);
    if (yearMatch) rows = rows.filter(function (row) { return String(row.stat_date).slice(0, 4) === yearMatch[1]; });
    return toCSV(rows, spec.columns);
  }

  function loadCached(key, loader) {
    var cached = readCache(key);
    if (cached != null) return Promise.resolve(cached);
    if (inFlight[key]) return inFlight[key];
    stats.networkLoads += 1;
    beginLoading();
    inFlight[key] = loader()
      .then(function (csv) {
        writeCache(key, csv);
        return csv;
      })
      .finally(function () {
        delete inFlight[key];
        endLoading();
      });
    return inFlight[key];
  }

  function load(path) {
    var key = cleanPath(path);
    return loadCached(key, function () { return loadFresh(key); });
  }

  function loadPersonalCSV(doctorName) {
    var doctor = String(doctorName || '').trim();
    if (!doctor) return Promise.reject(new Error('缺少医生姓名'));
    var key = 'personal_daily_by_doctor:' + doctor;
    var spec = {
      table: 'personal_daily_stats',
      filter: ['doctor_name', doctor],
      order: 'stat_date',
      columns: {
        stat_date: '日期', doctor_name: '医生', doctor_code: '医生编号', doctor_level: '医生等级',
        modality: '模态', case_count: '病例数'
      }
    };
    return loadCached(key, async function () {
      return toCSV(await fetchAll(spec), spec.columns);
    });
  }

  global.DashData = {
    loadCSV: load,
    loadPersonalCSV: loadPersonalCSV,
    clearCache: clearCache,
    stats: stats
  };
})(window);
