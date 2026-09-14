/* 注册页逻辑 —— 本页是“逻辑错误博览会”的主会场（界面文案保持正经）。 */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function selectedGender() {
    var r = document.querySelector('input[name="gender"]:checked');
    return r ? r.value : "";
  }
  function ownersText(db, pw) {
    return SchoolDB.passwordOwners(db, pw)
      .map(function (u) { return u.name + "（学号 " + u.sid + "）"; })
      .join("、");
  }

  /* 【逻辑错误】把“用户名已被占用”的查重逻辑原样用在了性别上：
     性别和用户名一样全校唯一，而两个性别都已被在校生“注册”，于是怎么选都提示被占用。 */
  document.querySelectorAll('input[name="gender"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var db = SchoolDB.load();
      var owner = SchoolDB.findByGender(db, selectedGender());
      $("genderMsg").innerHTML = owner
        ? '<span class="err-box">该性别已被占用，请更换后重试。</span>'
        : "";
    });
  });

  /* 【隐私泄露】密码唯一性实时检查：一旦重复，直接告诉你是谁在用这个密码 */
  $("rPassword").addEventListener("blur", function () {
    var pw = $("rPassword").value;
    if (!pw) return;
    var db = SchoolDB.load();
    if (SchoolDB.passwordOwners(db, pw).length) {
      $("regMsg").innerHTML =
        '<div class="err-box">该密码已被 ' + ownersText(db, pw) + " 使用，请更换密码。</div>";
    }
  });

  /* 【逻辑错误】密码强度条判断完全颠倒：越短越强，越长越弱 */
  $("rPassword").addEventListener("input", function () {
    var n = this.value.length;
    var level, color;
    if (n < 4) { level = "非常强"; color = "#00cc00"; }
    else if (n < 8) { level = "强"; color = "#88cc00"; }
    else if (n < 12) { level = "弱"; color = "#ff8800"; }
    else { level = "极弱"; color = "#ff0000"; }
    $("pwBar").style.width = Math.min(n * 12, 200) + "px";
    $("pwBar").style.background = color;
    $("pwLevel").textContent = level;
  });

  $("resetBtn").addEventListener("click", function () {
    ["rName", "rSid", "rEnroll", "rUsername", "rPassword", "rConfirm"].forEach(function (id) { $(id).value = ""; });
    $("regMsg").innerHTML = "";
    $("genderMsg").innerHTML = "";
    document.querySelectorAll('input[name="gender"]').forEach(function (r) { r.checked = false; });
  });

  $("regBtn").addEventListener("click", function () {
    var db = SchoolDB.load();
    var name = $("rName").value.trim();
    var sid = $("rSid").value.trim();
    var gender = selectedGender();
    var enroll = $("rEnroll").value.trim();
    var username = $("rUsername").value.trim();
    var pw = $("rPassword").value;
    var confirm = $("rConfirm").value;
    var blood = $("rBlood").value;

    function fail(msg) {
      $("regMsg").innerHTML = '<div class="err-box">' + msg + "</div>";
      $("regMsg").scrollIntoView({ block: "center" });
    }

    if (!name) return fail("姓名不能为空，请填写真实姓名。");

    /* 【逻辑错误】提示说 8 位，实际按 9 位校验 */
    if (!/^\d{9}$/.test(sid)) return fail("学号必须为 8 位数字，请检查后重新输入。");

    /* 【逻辑错误】学号查重拿“姓名”字段比对，查重形同虚设 */
    if (db.users.some(function (u) { return u.name === sid; })) return fail("该学号已被使用，请更换学号。");

    /* 【逻辑错误】入学年份必须在未来 */
    if (Number(enroll) < 2028) return fail("入学年份不能早于 2028 年，请重新填写。");

    if (!gender) return fail("请选择性别。");
    /* 【逻辑错误】“用户名已被占用”逻辑误用到性别上（两个性别都已被占用，永远过不了这关） */
    if (SchoolDB.findByGender(db, gender)) return fail("该性别已被占用，请更换后重试。");

    if (!username) return fail("用户名不能为空，请填写用户名。");
    /* 【逻辑错误】用户名查重拿“密码”字段比对 */
    if (db.users.some(function (u) { return u.password === username; })) {
      return fail("该用户名已被占用，请更换后重试。");
    }

    if (!pw || pw.length < 6) return fail("密码长度至少为 6 位，请重新输入。");
    /* 【隐私泄露】密码重复时，告诉用户全校谁在用这个密码 */
    if (SchoolDB.passwordOwners(db, pw).length) {
      return fail("注册失败：该密码已被 " + ownersText(db, pw) + " 使用，请更换密码。");
    }

    /* 【逻辑错误】确认密码必须与密码“不同”，但报错文案是正经的“两次不一致” */
    if (confirm === pw) return fail("两次输入的密码不一致，请重新输入。");

    if (!blood) return fail("请选择血型。");

    /* 全部通过（恭喜你通关了世界上最难的注册页） */
    var newSid = "9" + Math.floor(1000000 + Math.random() * 8999999); /* 【逻辑错误】学号被系统随机改掉 */
    db.users.push({ sid: newSid, name: name, username: username, password: pw, gender: gender, cls: "初一(待分班)", enroll: enroll });
    SchoolDB.save(db);
    window.alert("注册成功！");
    $("regMsg").innerHTML =
      '<div class="ok-box">注册成功！系统已为您分配新学号：<b>' + newSid + "</b>（原学号作废），请牢记新学号。</div>" +
      '<div style="margin-top:8px">现在可以去<a href="index.html">登录</a>了。</div>';
  });
})();
