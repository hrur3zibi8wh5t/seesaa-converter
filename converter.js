$(function () {
  $("#copy").on("click", function () {
    const resultTxt = $("#result").val();
    navigator.clipboard.writeText(resultTxt);

    this.innerText = "copied !!";
    setTimeout(() => (this.innerText = "copy"), 1000);
  });

  $("#convert").on("click", function () {
    const convertedTxt = convert($("#source").val());
    $("#result").val(convertedTxt);
  });
});

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convert(input) {
  const result = input
    // 中央寄せ
    .replace(/#center\(\)/g, "&align(center)")
    // 右寄せ
    .replace(/#right\(\)/g, "&align(right)")
    // 文字サイズ
    .replace(/&sizex\(1\)/g, "&size(9)")
    .replace(/&sizex\(2\)/g, "&size(12)")
    .replace(/&sizex\(3\)/g, "&size(15)")
    .replace(/&sizex\(4\)/g, "&size(18)")
    .replace(/&sizex\(5\)/g, "&size(21)")
    .replace(/&sizex\(6\)/g, "&size(24)")
    .replace(/&sizex\(7\)/g, "&size(27)")
    .replace(/&big\(\)/g, "&size(18)")
    // 部分編集
    .replace(/#areaedit\(\)/g, "")
    .replace(/#areaedit\(end\)/g, "")
    // 箇条書きリスト
    .replace(/^・/gm, "-")
    // 注釈
    .replace(
      /&footnote\((.*?\){.*?})\)|&footnote\((.*?)\)/g,
      function (match, group1, group2) {
        if (group1) return `((${group1}))`;
        else if (group2) return `((${group2}))`;
        return "";
      }
    )
    // 強調・太字
    .replace(
      /&bold\(\)\{(.*?\){.*?})\}|&bold\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `''${group1}''`;
        else if (group2) return `''${group2}''`;
        return "";
      }
    )
    .replace(
      /&b\(\)\{(.*?\){.*?})\}|&b\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `''${group1}''`;
        else if (group2) return `''${group2}''`;
        return "";
      }
    )
    .replace(
      /&font\(b\)\{(.*?\){.*?})\}|&font\(b\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `''${group1}''`;
        else if (group2) return `''${group2}''`;
        return "";
      }
    )
    // 斜体
    .replace(
      /&italic\(\)\{(.*?\){.*?})\}|&italic\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `'''${group1}'''`;
        else if (group2) return `'''${group2}'''`;
        return "";
      }
    )
    .replace(
      /&font\(i\)\{(.*?\){.*?})\}|&font\(i\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `'''${group1}'''`;
        else if (group2) return `'''${group2}'''`;
        return "";
      }
    )
    // 打ち消し線
    .replace(
      /&strike\(\)\{(.*?\){.*?})\}|&strike\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%${group1}%%`;
        else if (group2) return `%%${group2}%%`;
        return "";
      }
    )
    .replace(
      /&del\(\)\{(.*?\){.*?})\}|&del\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%${group1}%%`;
        else if (group2) return `%%${group2}%%`;
        return "";
      }
    )
    .replace(
      /&s\(\)\{(.*?\){.*?})\}|&s\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%${group1}%%`;
        else if (group2) return `%%${group2}%%`;
        return "";
      }
    )
    .replace(
      /&font\(l\)\{(.*?\){.*?})\}|&font\(l\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%${group1}%%`;
        else if (group2) return `%%${group2}%%`;
        return "";
      }
    )
    .replace(
      /&color\(l\)\{(.*?\){.*?})\}|&color\(l\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%${group1}%%`;
        else if (group2) return `%%${group2}%%`;
        return "";
      }
    )

    // 下線
    .replace(
      /&u\(\)\{(.*?\){.*?})\}|&u\(\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%%${group1}%%%`;
        else if (group2) return `%%%${group2}%%%`;
        return "";
      }
    )
    .replace(
      /&font\(u\)\{(.*?\){.*?})\}|&font\(u\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%%${group1}%%%`;
        else if (group2) return `%%%${group2}%%%`;
        return "";
      }
    )
    .replace(
      /&color\(u\)\{(.*?\){.*?})\}|&color\(u\)\{(.*?)\}/g,
      function (match, group1, group2) {
        if (group1) return `%%%${group1}%%%`;
        else if (group2) return `%%%${group2}%%%`;
        return "";
      }
    )

    // 折り畳み
    .replace(/#openclose\(show=(.*?)\)/g, "[+]$1")
    .replace(/#region\((.*?)\)/g, "[+]$1")
    .replace(/#region/g, "[+]")
    .replace(/#endregion/g, "[END]")

    // 色
    .replace(/&font/g, "&color")
    // 改行
    .replace(/&br\(\)/g, "~~");

  return result;
}
