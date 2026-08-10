(function () {
  var font = '"Noto Serif SC", "Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", STSong, SimSun, serif';
  if (typeof Highcharts !== 'undefined') {
    Highcharts.setOptions({
      chart: {
        backgroundColor: 'transparent',
        plotBackgroundColor: 'transparent',
        borderWidth: 0,
        plotBorderWidth: 0,
        shadow: false,
        style: { fontFamily: font }
      },
      title: { align: 'center', style: { fontFamily: font, fontWeight: '400' } },
      subtitle: { style: { fontFamily: font, fontWeight: '400' } },
      xAxis: {
        title: { style: { fontFamily: font, fontWeight: '400' } },
        labels: { style: { fontFamily: font } }
      },
      yAxis: {
        title: { style: { fontFamily: font, fontWeight: '400' } },
        labels: { style: { fontFamily: font } }
      },
      legend: { itemStyle: { fontFamily: font, fontWeight: '400' } },
      tooltip: { style: { fontFamily: font } },
      plotOptions: {
        series: { dataLabels: { style: { fontFamily: font } } }
      }
    });
  }
})();

/**
 * 将日期或入职时长控件行移到内容区顶部，并交由共享样式保持置顶。
 */
function groupRangeToolbarFields(toolbar) {
  var children = Array.prototype.slice.call(toolbar.children);
  children.forEach(function (label, index) {
    var select = children[index + 1];
    if (
      !select ||
      label.parentElement !== toolbar ||
      select.parentElement !== toolbar ||
      !/^(SPAN|LABEL)$/.test(label.tagName) ||
      select.tagName !== 'SELECT' ||
      label.classList.contains('range-quick')
    ) return;

    var field = document.createElement('span');
    field.className = 'range-field';
    toolbar.insertBefore(field, label);
    field.appendChild(label);
    field.appendChild(select);
  });
}

function initStickyRangeToolbar() {
  var candidates = Array.prototype.slice.call(
    document.querySelectorAll('.page-controls, .month-range-controls, .chart-inner-controls')
  );
  var toolbar = candidates.find(function (candidate) {
    if (candidate.classList.contains('month-range-controls')) return true;
    return Boolean(candidate.querySelector('#start-month, #tenure-range'));
  });
  if (!toolbar) return null;
  groupRangeToolbarFields(toolbar);
  if (toolbar.classList.contains('page-range-toolbar')) return toolbar;

  var content = toolbar.closest('.main-content, .project-stats-main');
  if (!content) return null;

  var formerParent = toolbar.parentElement;
  toolbar.classList.add('page-range-toolbar');
  content.insertBefore(toolbar, content.firstElementChild);

  if (
    formerParent &&
    formerParent.classList.contains('page-header') &&
    !formerParent.children.length &&
    !formerParent.textContent.trim()
  ) {
    formerParent.remove();
  }
  return toolbar;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyRangeToolbar);
} else {
  initStickyRangeToolbar();
}

/**
 * 将医生“全选/取消全选”合并为一个状态同步的切换按钮。
 * getCheckboxes 应只返回当前实际可选的医生复选框。
 */
function initDoctorSelectionToggle(options) {
  var button = options.button;
  var root = options.root || document;
  var watchSelector = options.watchSelector || '.doctor-filter, .level-filter';
  if (!button || typeof options.getCheckboxes !== 'function') return null;

  function getCheckboxes() {
    return Array.prototype.slice.call(options.getCheckboxes() || []).filter(function (checkbox) {
      return !checkbox.disabled;
    });
  }

  function isAllSelected() {
    var checkboxes = getCheckboxes();
    return checkboxes.length > 0 && checkboxes.every(function (checkbox) {
      return checkbox.checked;
    });
  }

  function update() {
    var allSelected = isAllSelected();
    button.textContent = allSelected ? '取消全选' : '全选';
    button.classList.toggle('active', allSelected);
    button.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    return allSelected;
  }

  button.addEventListener('click', function () {
    if (isAllSelected()) {
      if (typeof options.clear === 'function') options.clear();
    } else if (typeof options.selectAll === 'function') {
      options.selectAll();
    }
    update();
  });

  root.addEventListener('change', function (event) {
    if (event.target && event.target.matches && event.target.matches(watchSelector)) {
      window.setTimeout(update, 0);
    }
  });

  update();
  return { update: update, isAllSelected: isAllSelected };
}

function loadCSV(path, callback) {
  var ready = window.DashBootstrap || Promise.resolve();
  ready.then(function () {
    if (!window.DashData || typeof window.DashData.loadCSV !== 'function') {
      throw new Error('Supabase数据源尚未初始化');
    }
    return window.DashData.loadCSV(path);
  })
      .then(callback)
      .catch(function (error) {
        console.error(error);
        alert('加载Supabase数据失败：' + (error && error.message ? error.message : error));
      });
}

function loadPersonalCSV(doctorName, callback) {
  var ready = window.DashBootstrap || Promise.resolve();
  ready.then(function () {
    if (!window.DashData || typeof window.DashData.loadPersonalCSV !== 'function') {
      throw new Error('Supabase个人数据源尚未初始化');
    }
    return window.DashData.loadPersonalCSV(doctorName);
  })
      .then(callback)
      .catch(function (error) {
        console.error(error);
        alert('加载Supabase个人数据失败：' + (error && error.message ? error.message : error));
      });
}

// 解析 CSV 为二维数组，支持引号、逗号与换行
function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
  return rows;
}

/**
 * 保留月份范围的程序化恢复能力，不在顶栏创建额外按钮。
 */
function initMonthRangeReset(options) {
  var startSel = options.startSel;
  var endSel = options.endSel;
  var onReset = options.onReset;
  var root = options.root || document;
  if (!startSel || !endSel) return null;

  var defaultStart = options.defaultStart != null ? options.defaultStart : startSel.value;
  var defaultEnd = options.defaultEnd != null ? options.defaultEnd : endSel.value;
  var resetButton = root.querySelector('.range-reset-btn');

  function reset() {
    startSel.value = defaultStart;
    endSel.value = defaultEnd;
    root.querySelectorAll('.range-quick-btn').forEach(function (button) {
      button.classList.remove('active');
    });
    if (typeof onReset === 'function') onReset();
  }

  if (resetButton) resetButton.remove();
  return { reset: reset, button: null };
}

/**
 * 为月份范围下拉框绑定「近 N 月」快捷按钮。
 * 结束月份以数据中的最新月份为准，月份数量按首尾月份均包含计算。
 */
function initMonthQuickRange(options) {
  var months = options.months || [];
  var startSel = options.startSel;
  var endSel = options.endSel;
  var onApply = options.onApply;
  var root = options.root || document;
  var buttons = root.querySelectorAll('.range-quick-btn');

  function setActive(monthsBack) {
    buttons.forEach(function (button) {
      var value = parseInt(button.getAttribute('data-months'), 10);
      button.classList.toggle('active', monthsBack != null && value === monthsBack);
    });
  }

  function apply(monthsBack) {
    if (!months.length || !startSel || !endSel || !monthsBack) return;
    var endMonth = months[months.length - 1];
    var parts = endMonth.split('-');
    var endIndex = parseInt(parts[0], 10) * 12 + parseInt(parts[1], 10) - 1;
    var startIndex = endIndex - (monthsBack - 1);
    var startYear = Math.floor(startIndex / 12);
    var startMonth = (startIndex % 12) + 1;
    var wantedStart = startYear + '-' + (startMonth < 10 ? '0' : '') + startMonth;
    var startValue = months[0];

    for (var i = 0; i < months.length; i++) {
      if (months[i] >= wantedStart) {
        startValue = months[i];
        break;
      }
    }
    startSel.value = startValue;
    endSel.value = endMonth;
    setActive(monthsBack);
    if (typeof onApply === 'function') onApply();
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      apply(parseInt(button.getAttribute('data-months'), 10));
    });
  });
  if (startSel) startSel.addEventListener('change', function () { setActive(null); });
  if (endSel) endSel.addEventListener('change', function () { setActive(null); });

  var resetControl = initMonthRangeReset({
    startSel: startSel,
    endSel: endSel,
    onReset: onApply,
    root: root
  });

  return {
    apply: apply,
    reset: resetControl ? resetControl.reset : function () {},
    clearActive: function () { setActive(null); }
  };
}

/**
 * 绑定入职时长下拉框，并提供统一的当前筛选范围。
 */
function initTenureRangeSelect(options) {
  options = options || {};
  var root = options.root || document;
  var onApply = options.onApply;
  var select = root.querySelector('#tenure-range');

  function getRange() {
    if (!select) return { minDays: 0, maxDays: Infinity, label: '全部' };
    var maxDays = select.value === 'all' || select.value === ''
      ? Infinity
      : parseInt(select.value, 10);
    if (isNaN(maxDays)) maxDays = Infinity;
    var selectedOption = select.options[select.selectedIndex];
    return {
      minDays: 0,
      maxDays: maxDays,
      label: selectedOption ? selectedOption.textContent.trim() : '全部'
    };
  }

  if (select) {
    select.addEventListener('change', function () {
      if (typeof onApply === 'function') onApply(getRange());
    });
  }

  return {
    getRange: getRange
  };
}

/** 导出为 Excel：header 为表头数组，rows 为二维数组（每行一列数组），filename 不含扩展名会补 .xlsx */
function downloadExcel(header, rows, filename) {
  if (typeof XLSX === 'undefined') {
    alert('导出需要 SheetJS，请刷新页面后重试');
    return;
  }
  if (!filename) filename = 'export';
  if (filename.indexOf('.xlsx') === -1) filename += '.xlsx';
  var aoa = [header].concat(rows);
  var ws = XLSX.utils.aoa_to_sheet(aoa);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '数据');
  XLSX.writeFile(wb, filename);
}
