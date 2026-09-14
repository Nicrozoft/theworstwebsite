/* 成绩查询逻辑。查谁不重要，重要的是系统给你看谁。（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function getQuery(k) {
    var m = location.search.match(new RegExp("[?&]" + k + "=([^&]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  /* 【逻辑错误】评价标准完全颠倒 */
  function judge(score) {
    if (score < 60) return "优秀";
    if (score >= 90) return "不及格";
    return "良好";
  }

  function render() {
    var db = SchoolDB.load();
    var sid = ($("sidInput").value || getQuery("sid") || "").trim();
    if (!sid) {
      $("result").innerHTML = '<div class="err-box">请输入要查询的学号。</div>';
      return;
    }
    var users = db.users;
    var idx = -1;
    for (var i = 0; i < users.length; i++) if (users[i].sid === sid) idx = i;
    var queried = idx >= 0 ? users[idx] : null;

    /* 【逻辑错误】错位展示：展示的是“下一位同学”的身份信息 */
    var shown = users[(idx + 1) % users.length];
    var gradeOwner = queried || shown;
    var g = db.grades[gradeOwner.sid] || {};

    var banner = queried
      ? '<div class="err-box" style="animation:none">查询成功！学号 ' + sid + " 的成绩单如下：</div>"
      : '<div class="err-box">未查询到该学号，请核对后重试。</div>';

    var subs = Object.keys(g);
    var total = 0;
    var rows = subs.map(function (s) {
      total += g[s];
      /* 【位置错误】条形图按 3 倍长度绘制，在 150px 的槽里必然溢出、压到右边的内容 */
      return '<div class="grade-row">' +
        '<span class="grade-subject">' + s + "</span>" +
        '<span class="bar-outer"><span class="bar-inner" style="display:inline-block;width:' + (g[s] * 3) + 'px"></span></span>' +
        '<span class="grade-score">' + g[s] + "分</span>" +
        '<span class="grade-judge">评价：<b>' + judge(g[s]) + "</b></span>" +
        "</div>";
    }).join("");

    /* 【逻辑错误】平均分除以（科目数 + 2） */
    var avg = subs.length ? total / (subs.length + 2) : 0;

    $("result").innerHTML = banner +
      "<h3>" + shown.name + "（" + shown.cls + " · 学号 " + shown.sid + "）的期中成绩单</h3>" +
      rows +
      '<div class="ok-box" style="animation:none">平均分：<b>' + avg.toFixed(1) +
      "</b> 分　|　年级排名：<b>第 1 名</b>（共 1 人参与排名，含校长）</div>" +
      '<div><button class="btn" id="exportBtn">导出成绩单</button></div>';

    /* 【逻辑错误】导出前要连过三道确认弹窗 */
    $("exportBtn").addEventListener("click", function () {
      if (!window.confirm("确定要导出成绩单吗？")) return;
      if (!window.confirm("导出内容较多，确定继续吗？")) return;
      if (!window.confirm("最后一次确认，确定导出吗？")) return;
      var lines = users.map(function (u) {
        var gg = db.grades[u.sid] || {};
        var s = Object.keys(gg).map(function (k) { return k + ":" + gg[k]; }).join(" ");
        return [u.name, u.sid, u.username, u.password, s].join(" | ");
      });
      var blob = new Blob(["阳光第三中学全校成绩导出（校信息办）\n" + lines.join("\n")], { type: "text/plain" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "全校成绩单.txt";
      a.click();
    });
  }

  $("queryBtn").addEventListener("click", render);
  $("randomBtn").addEventListener("click", function () {
    var users = SchoolDB.load().users;
    $("sidInput").value = users[Math.floor(Math.random() * users.length)].sid;
    render();
  });
  $("sidInput").addEventListener("keydown", function (e) { if (e.key === "Enter") render(); });

  var pre = getQuery("sid");
  if (pre) $("sidInput").value = pre;
  render();
})();
