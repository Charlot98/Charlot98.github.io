(function () {
  var font = '"宋体", "SimSun", STSong, serif';
  if (typeof Highcharts !== 'undefined') {
    Highcharts.setOptions({
      chart: { style: { fontFamily: font } },
      title: { style: { fontFamily: font } },
      subtitle: { style: { fontFamily: font } },
      xAxis: {
        title: { style: { fontFamily: font } },
        labels: { style: { fontFamily: font } }
      },
      yAxis: {
        title: { style: { fontFamily: font } },
        labels: { style: { fontFamily: font } }
      },
      legend: { itemStyle: { fontFamily: font } },
      tooltip: { style: { fontFamily: font } },
      plotOptions: {
        series: { dataLabels: { style: { fontFamily: font } } }
      }
    });
  }
})();

function loadCSV(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 0) {
      callback(xhr.responseText);
    } else {
      alert('加载 CSV 失败: ' + xhr.status);
    }
  };
  xhr.send();
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
