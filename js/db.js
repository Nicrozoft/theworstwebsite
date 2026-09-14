/* ==========================================================
 * 阳光第三中学 · 学生公开信息系统
 * 模拟数据库（localStorage）。所有“数据”都存在你自己的浏览器里。
 * 本文件同时负责给每个页面挂一个关不掉的在线客服窗口。
 * ========================================================== */
(function () {
  var DB_KEY = "yg3z_worst_db_v2";

  function seed() {
    return {
      users: [
        { sid: "20230101", name: "张三", username: "zhangsan", password: "123456", gender: "男", cls: "初三(1)班", enroll: "2023" },
        { sid: "20230102", name: "李四", username: "lisi",     password: "123456", gender: "男", cls: "初三(2)班", enroll: "2023" },
        { sid: "20230103", name: "王芳", username: "wangfang", password: "wang123", gender: "女", cls: "初三(1)班", enroll: "2023" },
        { sid: "20230104", name: "赵六", username: "zhaoliu",  password: "abc123", gender: "女", cls: "初三(3)班", enroll: "2023" },
        { sid: "20230105", name: "钱七", username: "qianqi",   password: "111111", gender: "男", cls: "初三(2)班", enroll: "2023" }
      ],
      grades: {
        "20230101": { "语文": 88, "数学": 34, "英语": 76, "物理": 59, "化学": 92, "体育": 100 },
        "20230102": { "语文": 45, "数学": 99, "英语": 61, "物理": 70, "化学": 58, "体育": 85 },
        "20230103": { "语文": 91, "数学": 88, "英语": 95, "物理": 82, "化学": 79, "体育": 66 },
        "20230104": { "语文": 72, "数学": 66, "英语": 58, "物理": 91, "化学": 47, "体育": 90 },
        "20230105": { "语文": 30, "数学": 25, "英语": 41, "物理": 12, "化学": 8,  "体育": 59 }
      },
      notices: [
        { title: "关于期中考试时间安排的通知", pinned: true,
          body: "期中考试定于下周一至周三举行，请各位同学携带 2B 铅笔、黑色签字笔、橡皮以及一颗平常心。手机请勿带入考场，智能手表也不行，电话手表……也别带了。" },
        { title: "食堂本周菜单（第三食堂）", pinned: false,
          body: "周一：土豆丝炒肉；周二：土豆炖牛腩；周三：孜然土豆；周四：土豆饼；周五：神秘肉肉。如对菜单有意见，请于上周五之前反馈。" },
        { title: "运动会报名通道开启", pinned: false,
          body: "本届运动会新增『集体仰卧起坐』与『八百米接力（每人一百米，共十二棒）』等项目。报名请找体育老师，报名截止日期为报名人数满员时。" },
        { title: "关于系统升级维护的公告", pinned: false,
          body: "本系统将于本周日凌晨 3 点进行升级维护，预计耗时 48 小时。维护期间系统仍然开放，只是会变得更不稳定，请知悉。" }
      ],
      messages: [
        { name: "同学甲", phone: "13800000000", text: "食堂土豆系列很好吃，希望继续保持。", time: 1757400000000 },
        { name: "家长乙", phone: "", text: "食堂菜品质量有点差，希望改进。", time: 1757403600000 },
        { name: "同学丙", phone: "13911112222", text: "建议课间时长延长到 20 分钟。", time: 1757407200000 }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) { var s = seed(); save(s); return s; }
      return JSON.parse(raw);
    } catch (e) {
      return seed();
    }
  }
  function save(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) { /* 存不进去也是一种特性 */ }
  }

  function findByUsername(db, name) {
    for (var i = 0; i < db.users.length; i++) if (db.users[i].username === name) return db.users[i];
    return null;
  }
  function findBySid(db, sid) {
    for (var i = 0; i < db.users.length; i++) if (db.users[i].sid === sid) return db.users[i];
    return null;
  }
  /* 谁在用这个密码？（隐私泄露大师） */
  function passwordOwners(db, pw) {
    return db.users.filter(function (u) { return u.password === pw; });
  }
  /* 谁占用了这个性别？（“用户名查重”逻辑被原样误用到了性别上） */
  function findByGender(db, g) {
    for (var i = 0; i < db.users.length; i++) if (db.users[i].gender === g) return db.users[i];
    return null;
  }

  window.SchoolDB = {
    load: load,
    save: save,
    findByUsername: findByUsername,
    findBySid: findBySid,
    findByGender: findByGender,
    passwordOwners: passwordOwners,
    reset: function () { localStorage.removeItem(DB_KEY); }
  };

  /* ---------- 每页一个关不掉的客服窗 ---------- */
  function mountKefu() {
    if (!document.body) return;
    var box = document.createElement("div");
    box.className = "kefu";
    box.innerHTML =
      '<div class="kefu-head">在线客服小助手(工号007)<span class="kefu-x" title="关闭">×</span></div>' +
      '<div class="kefu-body">您好，工号 007 为您服务！<br>当前人工坐席繁忙，请优先阅读自助服务指南。<br>服务时间：工作日 9:00-9:30</div>';
    document.body.appendChild(box);
    var moves = 0;
    box.querySelector(".kefu-x").addEventListener("click", function () {
      moves++;
      if (moves <= 4) {
        box.style.right = (10 + moves * 28) + "px";
        box.style.bottom = (120 + moves * 16) + "px";
        box.querySelector(".kefu-body").innerHTML =
          "已为您自动调整窗口位置(" + moves + "/4)，以免遮挡正在填写的内容。";
      } else {
        box.style.transform = "rotate(" + (((moves * 7) % 40) - 20) + "deg)";
        box.querySelector(".kefu-body").innerHTML = "当前坐席全忙，窗口暂不支持关闭，敬请谅解。";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountKefu);
  } else {
    mountKefu();
  }
})();
