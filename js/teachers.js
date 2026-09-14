/* 师资队伍页逻辑（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var TEACHERS = [
    { id: "3",  name: "刘老师", subject: "语文", title: "高级教师", room: "办公楼 302", mail: "liu@qq.con",
      intro: "从教三十年，桃李满天下，最爱批改作文到深夜。" },
    { id: "1",  name: "陈老师", subject: "数学", title: "特级教师", room: "办公楼 101", mail: "chen@qq.con",
      intro: "解题步骤永远比标准答案多一步，学生称之为“陈氏无限步”。" },
    { id: "10", name: "王老师", subject: "英语", title: "一级教师", room: "办公楼 105", mail: "wang@qq.con",
      intro: "口语流利，坚信早读是一天中最美好的时光。" },
    { id: "2",  name: "张老师", subject: "物理", title: "高级教师", room: "实验楼 201", mail: "zhang@qq.con",
      intro: "课堂演示实验成功率约五成，其余五成请参考课本结论。" },
    { id: "11", name: "李老师", subject: "体育", title: "二级教师", room: "操场", mail: "li@qq.con",
      intro: "坚信跑圈能解决一切问题。" }
  ];

  /* 【逻辑错误】工号是字符串，直接默认 sort()：按字典序排成 1,10,11,2,3 */
  var sortedIds = TEACHERS.map(function (t) { return t.id; }).sort();
  var sorted = sortedIds.map(function (id) {
    return TEACHERS.filter(function (t) { return t.id === id; })[0];
  });

  function render() {
    $("teacherList").innerHTML = sorted.map(function (t, i) {
      return '<div class="teacher-card">' +
        '<img class="avatar" src="images/teacher' + t.id + '.jpg" alt="教师照片">' + /* 【资源错误】图片从未上传 */
        '<div class="t-info">' +
          '<div class="t-name">' + t.name + ' <span class="title-badge">' + t.title + '</span></div>' +
          '<div class="t-meta">工号 ' + t.id + ' · ' + t.subject + ' · 办公地点：' + t.room + '</div>' +
          '<div>电子邮箱：<a href="mailto:' + t.mail + '">' + t.mail + '</a></div>' + /* 【逻辑错误】邮箱域名少一个 m */
          '<button class="btn btn-small t-more" data-i="' + i + '">查看简介</button>' +
        '</div>' +
        '<div class="t-intro" id="intro-' + i + '" hidden></div>' +
      '</div>';
    }).join("");
    bindMore();
  }

  /* 【逻辑错误】“查看简介”展示的是下一位老师的简介 */
  function bindMore() {
    document.querySelectorAll(".t-more").forEach(function (btn) {
      btn.onclick = function () {
        var i = Number(btn.getAttribute("data-i"));
        var box = document.getElementById("intro-" + i);
        var other = sorted[(i + 1) % sorted.length];
        box.innerHTML = "简介：" + other.intro;
        box.hidden = false;
      };
    });
  }

  /* 【逻辑错误】搜索框写着“请输入教师姓名”，实际比对的却是工号 */
  $("tSearchBtn").addEventListener("click", function () {
    var kw = $("tSearch").value.trim();
    if (!kw) {
      $("tSearchMsg").innerHTML = '<div class="err-box">请输入教师姓名。</div>';
      return;
    }
    var hit = TEACHERS.filter(function (t) { return t.id === kw; })[0];
    $("tSearchMsg").innerHTML = hit
      ? '<div class="ok-box" style="animation:none">已找到教师：' + hit.name + "（" + hit.subject + "），请在上表查看详情。</div>"
      : '<div class="err-box">未找到该教师，请确认姓名是否正确。</div>';
  });

  render();
})();
