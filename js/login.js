/* 登录页逻辑。警告：以下每一处异常几乎都是故意的（仅限代码注释，界面文案保持正经）。 */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var CAPTCHA_POOL = "0OIl1S5B8Z2"; /* 精心挑选的易混淆字符 */
  function genCaptcha() {
    var s = "";
    for (var i = 0; i < 4; i++) s += CAPTCHA_POOL[Math.floor(Math.random() * CAPTCHA_POOL.length)];
    return s;
  }
  var shownCaptcha = genCaptcha();
  function renderCaptcha() { $("capShow").textContent = shownCaptcha; }
  $("capRefresh").addEventListener("click", function () { shownCaptcha = genCaptcha(); renderCaptcha(); });
  renderCaptcha();

  var tries = 0; /* 【逻辑错误】这个计数器永远不会增长 */

  $("loginBtn").addEventListener("click", function () {
    var username = $("username").value.trim();
    var password = $("password").value;
    var db = SchoolDB.load();
    var user = SchoolDB.findByUsername(db, username) || SchoolDB.findBySid(db, username);

    /* 【逻辑错误】校验用的“正确答案”是校验时新随机出来的，和页面显示的那张无关 */
    var expected = genCaptcha();
    var teacherFreePass = $("isTeacher").checked && $("captcha").value === "";
    if (!teacherFreePass && $("captcha").value !== expected) {
      $("loginMsg").innerHTML =
        '<div class="err-box">验证码错误，请重新输入。还可以尝试 ' + (999 - tries) + " 次。</div>";
      return;
    }

    /* 【逻辑错误】密码与“用户名”比较，所以正确的密码永远登不进去 */
    if (!user || password !== user.username) {
      $("loginMsg").innerHTML =
        '<div class="err-box">用户名或密码错误，还可以尝试 ' + (999 - tries) + " 次。</div>";
      return;
    }

    sessionStorage.setItem("yg3z_session",
      JSON.stringify({ sid: user.sid, token: "admin_true_" + Math.random().toString(16).slice(2) }));
    /* 【隐私问题】勾选“记住密码” = 密码明文写进 localStorage */
    if ($("remember").checked) {
      localStorage.setItem("yg3z_remember", JSON.stringify({ sid: user.sid, password: password }));
    }
    $("loginMsg").innerHTML = '<div class="ok-box">登录成功！正在为您跳转……</div>';
    setTimeout(function () { location.href = "grades.html?sid=" + user.sid + "&from=login"; }, 900);
  });

  /* 【隐私问题 + 位置错误】“记住密码”回填时，把密码填进了用户名输入框 */
  (function fillRemembered() {
    try {
      var r = JSON.parse(localStorage.getItem("yg3z_remember") || "null");
      if (r && r.password) { $("username").value = r.password; $("remember").checked = true; }
    } catch (e) { /* 忽略 */ }
  })();

  /* 【隐私泄露】忘记密码 = 直接公开密码（界面文案正经，行为离谱） */
  $("forgotLink").addEventListener("click", function (e) {
    e.preventDefault();
    var q = window.prompt("请输入你的学号（直接点“确定”则公示全校密码）：", "");
    if (q === null) return;
    var db = SchoolDB.load();
    if (q.trim() === "") {
      var rows = db.users.map(function (u) {
        return "<tr><td>" + u.name + "</td><td>" + u.sid + "</td><td>" + u.username + "</td><td><b>" + u.password + "</b></td></tr>";
      }).join("");
      $("forgotBox").innerHTML =
        '<div class="err-box">全校账号密码公示表（仅供本人查询，请勿外传）：</div>' +
        '<table class="plain misalign"><tr><th>姓名</th><th>学号</th><th>用户名</th><th>密码</th></tr>' + rows + "</table>";
    } else {
      var u = SchoolDB.findBySid(db, q.trim());
      $("forgotBox").innerHTML = u
        ? '<div class="ok-box blink">密码找回成功：您（' + u.name + "，学号 " + u.sid + "）的密码是：" + u.password + "</div>"
        : '<div class="err-box">未查询到该学号，请核对后重试。</div>';
    }
  });
})();
