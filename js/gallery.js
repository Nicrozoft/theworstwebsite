/* 校园风采页逻辑（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var SLIDES = [
    { name: "教学楼", bg: "linear-gradient(135deg,#ff0000,#ffff00)" },
    { name: "食堂",   bg: "linear-gradient(135deg,#00cc00,#00ffff)" },
    { name: "操场",   bg: "linear-gradient(135deg,#0000ff,#ff00ff)" },
    { name: "图书馆", bg: "linear-gradient(135deg,#ff8800,#8800ff)" },
    { name: "实验楼", bg: "linear-gradient(135deg,#006600,#000088)" }
  ];
  /* 【逻辑错误】说明文字数组的顺序和图片对不上，整体错了一位 */
  var CAPTIONS = ["食堂", "操场", "图书馆", "实验楼", "教学楼"];

  var idx = 0;
  var timer = null;

  $("viewport").innerHTML = SLIDES.map(function (s, i) {
    return '<div class="slide" data-i="' + i + '" style="background:' + s.bg + '"><span>' + s.name + '</span></div>';
  }).join("");

  /* 【逻辑错误】圆点指示器只有 4 个，图片却有 5 张 */
  var dotsHtml = "";
  for (var d = 0; d < 4; d++) dotsHtml += '<span data-d="' + d + '"></span>';
  $("dots").innerHTML = dotsHtml;

  function show(i) {
    idx = i;
    var slides = document.querySelectorAll("#viewport .slide");
    slides.forEach(function (el, k) {
      el.style.display = k === idx ? "flex" : "none";
    });
    /* 【逻辑错误】上一张可以把计数点成负数，下一张可以超出总数，都没有回绕 */
    $("counter").textContent = "第 " + (idx + 1) + " / 共 " + SLIDES.length + " 张";
    $("galCaption").textContent = "图片说明：" + (CAPTIONS[idx] || "（暂无）");
    document.querySelectorAll("#dots span").forEach(function (dot, k) {
      dot.className = k === idx ? "on" : "";
    });
  }

  function next() { show(idx + 1); }

  /* 【逻辑错误】每次点“下一张”都新开一个定时器且从不清除，越点翻页越快 */
  function startAuto(ms) {
    timer = setInterval(next, ms || 3000);
  }
  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  $("nextBtn").addEventListener("click", function () { next(); startAuto(); });
  $("prevBtn").addEventListener("click", function () { show(idx - 1); });

  /* 【逻辑错误】“自动播放”开关逻辑写反：取消勾选反而开始 0.5 秒一张的极速播放 */
  $("autoChk").addEventListener("change", function () {
    if (this.checked) { stopAuto(); }
    else { startAuto(500); }
  });

  /* 【逻辑错误】点第 N 个圆点，显示的是第 N+1 张图 */
  document.getElementById("dots").addEventListener("click", function (e) {
    var dot = e.target.closest("span[data-d]");
    if (dot) show((Number(dot.getAttribute("data-d")) + 1) % SLIDES.length);
  });

  /* 灯箱：遮罩 z-index 低于页脚与客服窗 */
  document.getElementById("viewport").addEventListener("click", function (e) {
    var slide = e.target.closest(".slide");
    if (!slide) return;
    var s = SLIDES[Number(slide.getAttribute("data-i"))];
    $("lbBox").style.background = s.bg;
    $("lbBox").textContent = s.name;
    $("lightbox").className = "lightbox lightbox-on";
  });
  $("lbClose").addEventListener("click", function () {
    $("lightbox").className = "lightbox";
  });

  show(0);
  if ($("autoChk").checked) startAuto();
})();
