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
