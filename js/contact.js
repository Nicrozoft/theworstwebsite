/* 联系我们页逻辑（界面文案保持正经） */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  $("cTel").textContent = "0731-88886666";

  /* 【逻辑错误】热线号码被当成数字存储：超出安全整数范围后
     一个变成科学计数法，一个丢失末尾精度（Excel 导入经典事故） */
  $("cZsb").textContent = String(4008001234567890123456789);
  $("cZip").textContent = String(12345678901234567890);

  /* 【逻辑错误】“复制学校地址”复制的是客服电话，并且无论如何都提示成功 */
  $("copyAddr").addEventListener("click", function () {
    var text = "0731-88889999 转 0";
    try {
      navigator.clipboard.writeText(text);
    } catch (e) { /* 忽略 */ }
    $("copyMsg").textContent = "学校地址已复制到剪贴板！";
  });
})();
