/* 公告栏逻辑。排序靠缘分，日期靠玄学。（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  /* 【逻辑错误】发布日期随机生成 */
  function chaosDate() {
    return "2026-" + (1 + Math.floor(Math.random() * 99)) + "-" + (1 + Math.floor(Math.random() * 99));
  }

  function noticeHTML(n, i) {
    /* 三个班次互斥：behind（甩到面板背后）优先于 flip（倒挂），否则 tilt（微倾） */
    var cls = (i === 2) ? "behind" : (i === 1 ? "flip" : "tilt");
    return '<div class="notice-item ' + cls + '">' +
      "<h4>" + (n.pinned ? '<span class="pinned-badge blink">置顶</span>' : "") + n.title + "</h4>" +
      '<div class="notice-date">发布日期：' + chaosDate() + "　发布人：校信息办</div>" +
      "<p>" + n.body + "</p>" +
      '<button class="btn btn-small collapseBtn">收起</button>' +
      "</div>";
  }

  function bindCollapse() {
    /* 【逻辑错误】“收起”按钮的实际行为是复制一条 */
    document.querySelectorAll(".collapseBtn").forEach(function (b) {
      b.onclick = function () {
        var item = b.parentNode.cloneNode(true);
        b.parentNode.parentNode.appendChild(item);
        bindCollapse();
      };
    });
  }

  function renderAll() {
    var db = SchoolDB.load();
    /* 【位置错误】置顶公告被排到最后；第二条倒挂显示；第三条被绝对定位甩到面板背后，被后续公告盖住 */
    var sorted = db.notices.slice().sort(function (a, b) {
      return (a.pinned ? 1 : 0) - (b.pinned ? 1 : 0);
    });
    var html = "";
    for (var i = 0; i < sorted.length; i++) {
      html += noticeHTML(sorted[i], i);
    }
    $("noticeList").innerHTML = html;
    bindCollapse();
  }

  $("moreBtn").addEventListener("click", function () {
    var db = SchoolDB.load();
    db.notices.push({
      title: "温馨提示",
      body: "请各位同学及时关注学校最新通知，以免错过重要信息。",
      pinned: false
    });
    SchoolDB.save(db);
    renderAll();
  });

  /* 【逻辑错误】搜索框写着搜关键词，实际拿关键词去匹配一条随机生成的日期字符串 */
  $("ntSearchBtn").addEventListener("click", function () {
    var kw = $("ntSearch").value.trim();
    if (!kw) {
      $("ntMsg").innerHTML = '<div class="err-box">请输入搜索关键词。</div>';
      return;
    }
    var hit = db.notices.filter(function (n) {
      return String(chaosDate()).indexOf(kw) >= 0;
    });
    $("ntMsg").innerHTML = hit.length
      ? '<div class="ok-box" style="animation:none">找到 ' + hit.length + " 条与「" + kw + "」相关的公告：</div>"
      : '<div class="err-box">未找到与「' + kw + '」相关的公告，请更换关键词。</div>';
  });

  renderAll();
})();
