/* 课表页逻辑（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  var SUBJ = ["语文", "数学", "英语", "物理", "化学", "体育", "历史"];

  /* 【逻辑错误】开学日期填到了未来，周次算出来是负数 */
  var OPEN_DATE = new Date(2026, 9, 12); /* 2026-10-12 */
  var week = Math.floor((Date.now() - OPEN_DATE.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
  $("weekBox").innerHTML = "当前是本学期第 <b>" + week + "</b> 周，课表如下：";

  /* 【逻辑错误】高亮“今天”直接用 getDay()（0=周日）当下标，
     于是周一高亮的是“周二”，周日高亮的是“周一”，永远差一列 */
  var todayCol = new Date().getDay();

  function timeStr(h, m) {
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  /* 【逻辑错误】每节课“上课 50 分钟”，但下一节 45 分钟就开始，时间全部重叠；
     晚自习最后一节更是上到 25:40 */
  var amTimes = [], pmTimes = [];
  for (var i = 0; i < 4; i++) {
    var amH = 8 + Math.floor((i * 45) / 60), amM = (i * 45) % 60;
    amTimes.push(timeStr(amH, amM) + "-" + timeStr(amH + Math.floor((amM + 50) / 60), (amM + 50) % 60));
    var pmH = 14 + Math.floor((i * 45) / 60), pmM = (i * 45) % 60;
    pmTimes.push(timeStr(pmH, pmM) + "-" + timeStr(pmH + Math.floor((pmM + 50) / 60), (pmM + 50) % 60));
  }
  var evening = ["18:30-20:30", "20:30-22:30", "22:30-25:40"];

  function buildTable(title, rows) {
    var html = '<h3>' + title + '</h3><table class="plain tt-table tt-cursor"><tr><th>节次</th>';
    for (var d = 0; d < 7; d++) {
      html += '<th class="' + (d === todayCol ? "tt-today" : "") + '">' + DAYS[d] + "</th>";
    }
    html += "</tr>";
    rows.forEach(function (r, ri) {
      html += "<tr><td>" + r.label + "<br>" + r.time + "</td>";
      for (var d = 0; d < 7; d++) {
        var subj = SUBJ[(d + ri) % SUBJ.length];
        html += '<td data-subj="' + subj + '" class="' + (d === todayCol ? "tt-today" : "") + '">' + subj + "</td>";
      }
      html += "</tr>";
    });
    return html + "</table>";
  }

  var amRows = amTimes.map(function (t, i) { return { label: "第" + (i + 1) + "节", time: t }; });
  var pmRows = pmTimes.map(function (t, i) { return { label: "第" + (i + 5) + "节", time: t }; })
    .concat(evening.map(function (t, i) { return { label: "晚自习" + "一二三"[i], time: t }; }));

  $("amBox").innerHTML = buildTable("上午课程", amRows);
  /* 【位置错误】下午课表整体上移，直接叠在上午课表上 */
  $("pmBox").innerHTML = '<div class="pm-block">' + buildTable("下午与晚自习课程", pmRows) + "</div>";

  /* 【逻辑错误】点任何课，地点都是操场 */
  function showLoc(subj) {
    $("locMsg").innerHTML =
      '<div class="ok-box" style="animation:none">您查询的课程（' + subj +
      '）上课地点：<b>操场</b>。本周操场承办校运动会，请各位同学自行寻找上课位置。</div>';
  }
  document.getElementById("amBox").addEventListener("click", function (e) {
    var td = e.target.closest("td[data-subj]");
    if (td) showLoc(td.getAttribute("data-subj"));
  });
  document.getElementById("pmBox").addEventListener("click", function (e) {
    var td = e.target.closest("td[data-subj]");
    if (td) showLoc(td.getAttribute("data-subj"));
  });

  /* 【逻辑错误】切换班级完全不生效；【逻辑错误】“刷新课表”跳回默认地址，丢掉已选参数 */
  $("clsSel").addEventListener("change", function () {
    $("clsMsg").textContent = "其他班级课表数据建设中，暂展示初三(1)班课表。";
  });
  var pre = location.search.match(/[?&]cls=([^&]*)/);
  if (pre) {
    try {
      $("clsSel").value = decodeURIComponent(pre[1]);
    } catch (e) { /* 忽略 */ }
  }
})();
