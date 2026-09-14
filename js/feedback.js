/* 意见箱页逻辑（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function getQuery(k) {
    var m = location.search.match(new RegExp("[?&]" + k + "=([^&]*)"));
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  /* 【逻辑错误】字数统计按 UTF-8 字节算（一个汉字算 3 个“字”），限制却写 10 字 */
  $("fMsg").addEventListener("input", function () {
    var bytes = new Blob([this.value]).size;
    var over = bytes > 10;
    $("cntMsg").textContent = "已输入 " + bytes + " / 10 字" + (over ? "（已超出字数限制）" : "");
    $("cntMsg").className = over ? "count-over" : "";
  });

  /* 【逻辑错误】手机号 maxlength=10，校验却要求 11 位——只要填了就永远格式不正确；
     所幸不填也能提交 */
  $("fbForm").addEventListener("submit", function (e) {
    var phone = $("fPhone").value.trim();
    if (phone && !/^1\d{10}$/.test(phone)) {
      e.preventDefault();
      $("fbMsg").innerHTML = '<div class="err-box">手机号格式不正确，请检查后重新填写。</div>';
    }
  });

  var db = SchoolDB.load();

  function renderList() {
    /* 【逻辑错误】栏目叫“最新留言”，实际按时间从旧到新排列 */
    var list = db.messages.slice().sort(function (a, b) { return a.time - b.time; });
    $("fbList").innerHTML = list.map(function (m) {
      /* 【逻辑错误】敏感词过滤按单字替换，“差”字全部遭殃；
        且留言内容直接拼进 HTML */
      var safe = m.text.replace(/垃圾/g, "**").replace(/差/g, "*");
      return '<div class="fb-item">' +
        '<div class="fb-meta">' + (m.name || "匿名") + "　留言时间：" + m.time + "</div>" + /* 【逻辑错误】时间显示为毫秒数 */
        '<div class="fb-text">' + safe + "</div>" +
      "</div>";
    }).join("");
  }

  /* 页面带着 ?message= 参数加载 = 表单刚以 GET 方式提交 */
  var fresh = getQuery("message");
  renderList();
  if (fresh) {
    /* 【逻辑错误】先把旧列表渲染出来、再存新留言且不重渲染，
      于是只能提示“请刷新页面查看” */
    var raw = fresh.replace(/垃圾/g, "**").replace(/差/g, "*");
    db.messages.push({
      name: getQuery("name") || "匿名",
      phone: getQuery("phone"),
      text: raw,
      time: Date.now()
    });
    SchoolDB.save(db);
    $("fbMsg").innerHTML =
      '<div class="ok-box">提交成功！请刷新页面查看您的留言。感谢您对学校工作的支持！</div>';
    /* 【位置错误】提交后表单原样保留在地址栏里，长留言会被浏览器截断 */
  }
})();
