var pageid = 0;

$(function () {
  $("#copy").on("click", function () {
    const resultTxt = $("#result").val();
    navigator.clipboard.writeText(resultTxt);

    this.innerText = "copied !!";
    setTimeout(() => (this.innerText = "copy"), 1000);
  });

  $("#convert").on("click", function () {
    pageid = 0;

    let contents = $($("#source").val())[0];
    if ($($("#source").val()).find("#wikibody").length > 0) {
      contents = $($("#source").val()).find("#wikibody")[0];
      let h2a = $($("#source").val()).find(
        "#wikibody h2:first-child a:last-child"
      );
      if (h2a.length && h2a[0].href) {
        [, pageid] = h2a[0].href.match(/(\d+)\.html$/) || [, 0];
      }
    }
    {
      let query = contents.querySelectorAll("img");
      query.forEach((img) => {
        let src = img.getAttribute("data-original");
        let width = img.getAttribute("width");
        if (src) {
          if (width) {
            img.replaceWith(
              $(
                "<img src='" + replaceFileName(src) + "' width='" + width + "'>"
              )[0]
            );
          } else {
            img.replaceWith($("<img src='" + replaceFileName(src) + "'>")[0]);
          }
        }
      });
      query = contents.querySelectorAll("picture");
      for (let i = 0; i < query.length; i++) {
        let picture = query[i];
        let child = picture.firstChild;
        let src = child.getAttribute("data-srcset");
        let width = child.getAttribute("width");
        if (!src) {
          src = child.getAttribute("srcset");
        }
        if (picture.querySelector("img")) {
          child = picture.querySelector("img");
          if (child.getAttribute("width")) {
            width = child.getAttribute("width");
          }
          if (child.getAttribute("src")) {
            src = child.getAttribute("src");
          }
        }

        if (src) {
          if (width) {
            picture.replaceWith(
              $(
                "<img src='" + replaceFileName(src) + "' width='" + width + "'>"
              )[0]
            );
          } else {
            picture.replaceWith(
              $("<img src='" + replaceFileName(src) + "'>")[0]
            );
          }
        }
      }
      delete query;
    }

    $("#source").val(contents.outerHTML);
    convert($("#source").val());
  });
});

function convert(input) {
  let contents = $(input)[0];

  let firstHR = false;

  child_wikitexts = [];

  contents.childNodes.forEach(function (element, i) {
    if (!firstHR && element.tagName == "H2") {
      firstHR = true;
    } else if (element.nodeType == Node.ELEMENT_NODE) {
      if (
        element.getAttribute("class") &&
        element.getAttribute("class").indexOf("atwiki-lastmodify") >= 0
      ) {
      } else {
        if (contents.childNodes.length > i + 1) {
          element.nextElementSibling = contents.childNodes[i + 1];
        }
        child_wikitexts.push(parse(element));
      }
    } else if (
      element.nodeType == Node.TEXT_NODE &&
      (element.data || "") &&
      (element.data || "").trim() !== ""
    ) {
      child_wikitexts.push((element.data || "").trim());
    }
  });

  child_wikitexts = child_wikitexts
    .join("")
    .split(/\n/)
    .map((wikitext) => {
      if (["*", "#", ":", ";"].indexOf(wikitext.charAt(0)) == -1) {
        return wikitext.replace(/<br\s?\/>([^\n])/g, "<br/>\n$1");
      }
      return wikitext;
    });

  $("#result").val(child_wikitexts.join("\n"));
}

function parse(element) {
  if (!element) return "";

  let child_wikitexts = [];

  if (element && element.childNodes) {
    element.childNodes.forEach((child, i) => {
      if (child.nodeType == Node.ELEMENT_NODE) {
        if (element.childNodes.length > i + 1) {
          child.nextElementSibling = element.childNodes[i + 1];
        }
        child_wikitexts.push(parse(child));
      } else if (
        child.nodeType == Node.TEXT_NODE &&
        (child.data || "") &&
        (child.data || "").trim() !== ""
      ) {
        child_wikitexts.push((child.data || "").trim());
      }
    });
  }

  let wikitext = child_wikitexts.join("");

  switch (element.tagName) {
    case "A":
      {
        let href = element.href;
        if (href) {
          try {
            href = decodeURI(element.href).replaceAll(" ", "_");
          } catch {}
        }
        if (
          href.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
          ) &&
          element.parentElement.tagName == "DIV" &&
          element.parentElement.getAttribute("data-player")
        ) {
          let videoid = href.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
          )[1];

          wikitext = "<youtube>" + videoid + "</youtube>";
        } else if (
          href.match(/www.nicovideo\.jp\/watch\/(sm[0-9]+)/) &&
          element.parentElement.tagName == "DIV" &&
          element.parentElement.getAttribute("data-player")
        ) {
          let videoid = href.match(/www.nicovideo\.jp\/watch\/(sm[0-9]+)/)[1];

          wikitext = "<nicovideo>" + videoid + "</nicovideo>";
        } else if (element.getAttribute("title")) {
          // 最終編集時間付きのリンク
          let title = element.getAttribute("title").trim();
          let m = title.match(/([^\(]+)\(\d+\w\)/);
          if (m && m.length > 1) {
            title = m[1].trim().replace(/ /g, "_");
          }

          if (href.indexOf("#") > -1) {
            let anchor = href.substr(href.indexOf("#"));
            title = title.replace(/_/g, " ").trim() + anchor;
          }

          if (title !== wikitext) {
            wikitext = "[[" + title + "|" + wikitext + "]]";
          } else {
            wikitext = "[[" + wikitext + "]]";
          }
        } else if (
          wikitext &&
          wikitext.length > 0 &&
          wikitext.indexOf("部分編集") == -1
        ) {
          if (href.indexOf(element.baseURI) > -1 && href.indexOf("#") > -1) {
            //ページTOPへ
            let anchor = href.substr(href.indexOf("#"));
            if (anchor === "#atwiki-jp") {
              anchor = "#top";
            }

            wikitext = "[[" + anchor + "|" + wikitext + "]]";
          } else if (
            href.indexOf("w.atwiki.jp") > -1 &&
            href.indexOf("?page=") > -1
          ) {
            //別ページへのリンク
            let title = href.substr(href.indexOf("?page=") + "?page=".length);

            if (title !== wikitext) {
              wikitext = "[[" + title + "|" + wikitext + "]]";
            } else {
              wikitext = "[[" + title + "]]";
            }
          } else if (href.indexOf("atwiki.jp") > -1) {
            //別ページへのリンク(タイトルなし)
            if (href.match(/pages\/(\d+)\.html(.+)$/)) {
              let [m, id, anchor] = href.match(/pages\/(\d+)\.html(.+)$/);

              if (pageid2name[id]) {
                let title = pageid2name[id] + anchor;

                if (title !== wikitext) {
                  wikitext = "[[" + title + "|" + wikitext + "]]";
                } else {
                  wikitext = "[[" + title + "]]";
                }
              } else {
                if (wikitext.trim() !== href.trim()) {
                  wikitext = "[[" + wikitext + "]]";
                } else {
                  wikitext = href;
                }
              }
            } else if (href.match(/pages\/(\d+)\.html$/)) {
              //別ページへのリンク(タイトルなし)その他のパターン
              let [m, id] = href.match(/pages\/(\d+)\.html$/);

              if (pageid2name[id]) {
                let title = pageid2name[id];

                if (title !== wikitext) {
                  wikitext = "[[" + title + "|" + wikitext + "]]";
                } else {
                  wikitext = "[[" + title + "]]";
                }
              } else if (wikitext.trim() !== href.trim()) {
                wikitext = "[[" + wikitext + "]]";
              } else {
                wikitext = href;
              }
            } else if (wikitext.trim() !== href.trim()) {
              wikitext = "[[" + wikitext + "]]";
            } else {
              wikitext = href;
            }
          } else if (href && wikitext && wikitext.length > 0) {
            //外部リンク
            if (wikitext.trim() !== href.trim()) {
              wikitext = "[" + element.href + " " + wikitext + "]";
            } else {
              wikitext = element.href;
            }
          }
        } else if (element.id && element.id != "") {
          //アンカー
          wikitext = "<span id='" + element.id + "'></span>";
        }
      }
      break;
    case "H2":
      {
        wikitext = "\n*" + wikitext;
      }
      break;
    case "H3":
      {
        wikitext = "\n**" + wikitext;
      }
      break;
    case "H4":
      {
        wikitext = "\n***" + wikitext;
      }
      break;
    case "H5":
      {
        wikitext = "\n****" + wikitext;
      }
      break;
    case "HR":
      {
        wikitext = "\n----\n";
      }
      break;
    case "BR":
      {
        if (element.getAttribute("data-remove")) {
          wikitext = "";
        } else wikitext = "~~";
      }
      break;
    case "P":
      {
        wikitext = wikitext + "\n";
      }
      break;
    case "SPAN":
      {
        let _class = element.getAttribute("class");
        if (_class && _class.indexOf("link_atwiki_footnote") > -1) {
          let atag = $(element).find("a");
          if (atag.attr("title") != "") {
            wikitext = "<ref>" + atag.attr("title") + "</ref>";
          }
        } else if (_class && $(element).hasClass("plugin_openclose2")) {
          let button = $(element).children(".plugin_openclose2_b");
          let detail = $(element).children().last("span");
          if (button.length && detail.length) {
            wikitext =
              "<span class='w3-tooltip'>" +
              button.text().trim() +
              "<span class='w3-text2'>" +
              parse($(detail[0].outerHTML)[0]) +
              "</span></span>";
          }
        } else {
          let styles = parseStyle(element.getAttribute("style"));
          if (styles.color) {
            wikitext =
              "<span style='" +
              element.getAttribute("style") +
              "'>" +
              wikitext +
              "</span>";
          } else if (
            styles["text-decoration"] &&
            styles["text-decoration"].indexOf("overline") >= 0
          ) {
            wikitext =
              "<span style='" +
              element.getAttribute("style") +
              "'>" +
              wikitext +
              "</span>";
          } else if (
            styles["border"] ||
            styles["border-top"] ||
            styles["border-bottom"] ||
            styles["border-left"] ||
            styles["border-right"]
          ) {
            wikitext =
              "<span style='" +
              element.getAttribute("style") +
              "'>" +
              wikitext +
              "</span>";
          } else {
            if (
              styles["font-style"] === "italic" &&
              wikitext &&
              wikitext.length > 0
            ) {
              wikitext = "'''" + wikitext + "'''";
            }
            if (
              styles["font-weight"] === "bold" &&
              wikitext &&
              wikitext.length > 0
            ) {
              wikitext = "''" + wikitext + "''";
            }
            if (
              styles["text-decoration"] &&
              styles["text-decoration"].indexOf("underline") >= 0
            ) {
              wikitext = "%%%" + wikitext + "%%%";
            }
            if (
              styles["text-decoration"] &&
              styles["text-decoration"].indexOf("line-through")
            ) {
              wikitext = "%%" + wikitext + "%%";
            }
          }
        }
      }
      break;
    case "B":
    case "STRONG":
      if (wikitext && wikitext.length > 0) {
        wikitext = "'''" + wikitext + "'''";
      }
      break;
    case "I":
      {
        if (wikitext && wikitext.length > 0) {
          wikitext = "''" + wikitext + "''";
        }
      }
      break;
    case "U":
      {
        wikitext = "<u>" + wikitext + "</u>";
      }
      break;
    case "S":
      {
        wikitext = "<s>" + wikitext + "</s>";
      }
      break;
    case "SMALL":
      {
        wikitext = "<small>" + wikitext + "</small>";
      }
      break;
    case "BIG":
      {
        wikitext = "<big>" + wikitext + "</big>";
      }
      break;
    case "UL":
    case "OL":
    case "DL":
      {
        let pre = getPrefix(element.parentElement);
        if (pre !== "")
          child_wikitexts = child_wikitexts.map((child) => pre + child);
        wikitext = "\n" + child_wikitexts.join("\n");
        if (pre === "") wikitext = wikitext + "\n";
      }
      break;
    case "LI":
      {
        if (element.parentNode.tagName === "OL") {
          wikitext = "#" + wikitext;
        } else {
          wikitext = "*" + wikitext;
        }
      }
      break;
    case "DT":
      {
        wikitext = ";" + wikitext;
      }
      break;
    case "DD":
      {
        wikitext = ":" + wikitext;
      }
      break;

    case "TABLE":
      {
        if (
          element.getAttribute("class") &&
          element.getAttribute("class").indexOf("atwiki_plugin_region") >= 0
        ) {
          let td = element.querySelector("tr").children;
          if (td.length >= 3) {
            wikitext =
              "\n{{Hidden begin|title=" +
              td[1].innerText +
              "}}\n" +
              parse(replaceTag(td[2], "div")) +
              "\n" +
              "{{Hidden end}}\n";
          }
        } else {
          wikitext = "\n{| class='wikitable'\n" + wikitext + "|}\n";
        }
      }
      break;
    case "TR":
      {
        wikitext = "|-\n" + wikitext + "\n";
      }
      break;
    case "TH":
      {
        let attr = "";
        if (element.getAttribute("style")) {
          attr +=
            " style='" + element.getAttribute("style").toLowerCase() + "'";
        }
        if (element.getAttribute("rowspan")) {
          attr += " rowspan='" + element.getAttribute("rowspan") + "'";
        }
        if (element.getAttribute("colspan")) {
          attr += " colspan='" + element.getAttribute("colspan") + "'";
        }
        if (attr !== "") {
          wikitext = "!" + attr + "| " + wikitext + "\n";
        } else {
          wikitext = "! " + wikitext + "\n";
        }
      }
      break;
    case "TD":
      {
        let attr = "";
        if (element.getAttribute("style")) {
          attr +=
            " style='" + element.getAttribute("style").toLowerCase() + "'";
        }
        if (element.getAttribute("rowspan")) {
          attr += " rowspan='" + element.getAttribute("rowspan") + "'";
        }
        if (element.getAttribute("colspan")) {
          attr += " colspan='" + element.getAttribute("colspan") + "'";
        }
        if (attr !== "") {
          wikitext = "|" + attr + "| " + wikitext + "\n";
        } else {
          wikitext = "| " + wikitext + "\n";
        }
      }
      break;
    case "IMG":
      {
        let src = "";
        let width = "";
        if (element.getAttribute("src")) {
          src = filename_convert(element.getAttribute("src"));
        }
        if (element.getAttribute("width")) {
          width = element.getAttribute("width");
        }

        let align = "";
        if (
          element.parentElement &&
          element.parentElement.tagName == "DIV" &&
          element.parentElement.getAttribute("style")
        ) {
          let style = element.parentElement
            .getAttribute("style")
            .replace(/ /g, "");
          if (style.indexOf("text-align:left") > -1) {
            align = "|left";
          } else if (style.indexOf("text-align:right") > -1) {
            align = "|right";
          } else {
            align = "|none";
          }
        }

        if (width) {
          wikitext =
            "[[File:" + decodeName(src.src) + "|" + width + "px" + align + "]]";
        } else {
          wikitext = "[[File:" + decodeName(src.src) + align + "]]";
        }

        if (align == "|none") {
          wikitext = "\n" + wikitext;
        }
      }
      break;
    case "PRE":
      {
        wikitext = "<pre>" + wikitext + "</pre>";
      }
      break;
    case "DIV":
      {
        let _class = element.getAttribute("class") || "";
        if (_class.indexOf("plugin_contents") >= 0) {
          wikitext = "#contents";
        } else if (_class.indexOf("center_plugin") >= 0) {
          wikitext = "&align(center){" + wikitext + "}";
        } else if (_class.indexOf("plugin_asciiart") >= 0) {
          wikitext = "<div class='asciiart'>" + wikitext + "</div>";
        } else if (_class.indexOf("plugin_video") >= 0) {
          let iframe = element.firstChild;
          if (iframe && iframe.tagName === "IFRAME") {
            let href = iframe.getAttribute("src");
            if (
              href.match(
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
              )
            ) {
              let videoid = href.match(
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
              )[1];

              wikitext = "<youtube>" + videoid + "</youtube><br>\n";
            } else if (href.match(/www.nicovideo\.jp\/watch\/(sm[0-9]+)/)) {
              let videoid = href.match(
                /www.nicovideo\.jp\/watch\/(sm[0-9]+)/
              )[1];

              wikitext = "<nicovideo>" + videoid + "</nicovideo><br>\n";
            }
          }
        } else if (_class && $(element).hasClass("plugin_openclose")) {
          let button = $(element).children(".plugin_openclose_b");
          let detail = $(element).children().last("div");
          if (button.length && detail.length) {
            wikitext =
              "\n{{Hidden begin|title=" +
              button.text().trim() +
              "}}\n" +
              parse($(detail.get(0).outerHTML)[0]) +
              "\n" +
              "{{Hidden end}}\n";
          }
        } else if (wikitext.trim() == "目次") {
          wikitext = "";
        } else {
          if (wikitext.length > 0) {
            wikitext = "\n" + wikitext + "\n";
          }
        }
      }
      break;
    case "BLOCKQUOTE":
      {
        wikitext = "\n<blockquote>" + wikitext + "</blockquote>\n";
      }
      break;
    case "SCRIPT":
      {
        wikitext = "";
      }
      break;
    case "NOSCRIPT":
      {
        if (wikitext.match(/(youtu\.be|youtube|nicovideo)/)) {
          wikitext = parse($("<div data-player='1'>" + wikitext + "</div>")[0]);
        } else {
          wikitext = parse($(wikitext)[0]);
        }
      }
      break;
    case "IFRAME":
      {
        if (wikitext.match(/(youtu\.be|youtube|nicovideo)/)) {
          wikitext = parse($("<div data-player='1'>" + wikitext + "</div>")[0]);
        } else {
          wikitext = parse($(wikitext)[0]);
        }
      }
      break;
    case "SELECT":
      {
        if (
          element.getAttribute("class") &&
          element.getAttribute("class").indexOf("plugin_pulldown_jump_select") >
            -1
        ) {
          let links = [];
          for (let i = 1; i < element.children.length; i++) {
            let opt = element.children[i];
            links.push(
              parse(
                $("<a href='" + opt.value + "'>" + opt.innerText + "</a>")[0]
              )
            );
          }
          if (links.length) {
            wikitext = "{{DropDownLink|\n" + links.join("\n") + "\n}}\n";
          }
        }
      }
      break;
    case "OPTION": {
      if (
        element.parentElement &&
        element.parentElement.tagName == "SELECT" &&
        element.parentElement.getAttribute("class") &&
        element.parentElement
          .getAttribute("class")
          .indexOf("plugin_pulldown_jump_form") > -1
      ) {
        wikitext = "";
      }
    }
  }

  if (wikitext.indexOf("[部分編集]") > -1) {
    wikitext = wikitext.replace("[部分編集]", "");
  }

  return wikitext;
}

function parseStyle(style) {
  let styles = {};
  if (style) {
    let style_lines = style.split(";");
    style_lines.forEach((line) => {
      line = line.trim();
      let [key, value] = line.split(":");
      value = value || "";
      styles[key.trim().toLowerCase()] = value.trim().toLowerCase();
    });
  }
  return styles;
}

function getPrefix(element) {
  let pre = "";
  if (["LI", "DT", "DD"].indexOf(element.tagName) > -1) {
    switch (element.tagName) {
      case "LI":
        {
          if (element.parentElement.tagName === "OL") {
            pre = "#";
          } else {
            pre = "*";
          }
        }
        break;
      case "DD":
      case "DT": {
        pre = ":";
      }
    }
    if (element.parentElement && element.parentElement.parentElement) {
      pre = getPrefix(element.parentElement.parentElement) + pre;
    }
  }
  return pre;
}

function filename_convert(filename) {
  filename = replaceFileName(filename);

  filename = filename.replaceAll("%20", "_");

  let m = filename.match(/^(\d+)\/(\d+)\/((t|m)\/)?(.+)$/);
  if (m && m.length > 5) {
    return {
      src: "ATW" + m[1] + "-" + m[5],
      pageid: m[1],
      filename: m[5],
    };
  } else {
    m = filename.match(/ATW(\d+)\-(.+)$/);
    if (m && m.length > 1) {
      return {
        src: filename,
        pageid: m[1],
        filename: m[2],
      };
    } else {
      return {
        src: "ATW" + pageid + "-" + filename,
        pageid: pageid,
        filename: filename,
      };
    }
  }
}

function replaceTag(objnode, tagName) {
  return $("<" + tagName + "/>").append(objnode.innerHTML)[0];
}

function replaceFileName(path) {
  if (path.match(/^ATW\d+/)) return path;
  let url = "https://img.atwikiimg.com/www26.atwiki.jp/minecraft/attach/";
  let url2 = "https://img.atwikiimg.com/www26.atwiki.jp/minecraft/pub/";
  if (path.indexOf(url) == 0) {
    path = path.replace(url, "");
    let m = path.match(/^(\d+)\/(\d+)\/((t|m)\/)?(.+)$/);
    path = "ATW" + m[1] + "-" + m[5];
  } else if (path.indexOf(url2) == 0) {
    path = path.replace(url2, "");
    let m = path.match(/^([\w\d]+\/)?(.+)$/);
    path = "ATW-pub-" + m[2];
  } else {
    // 外部メディア対策
    if (!path.match(/gyazo\.com/) && newname && pageid) {
      if (newname.match(/^\d+px\-/)) {
        newname = newname.replace(/^\d+px\-/, "");
      }
      path = "ATW" + pageid + "-" + newname;
    } else {
      [, newname] = path.match(/([^\/]+)\/[^\/]+$/);
      if (newname) {
        path = "ATW" + pageid + "-" + newname + ".png";
      }
    }
  }
  return path;
}

function decodeName(name) {
  let newname = decodeURI(name);
  if (newname.indexOf("%") > -1) {
    return newname.replace(/\%/g, "％"); //MediaWikiでは半角％は禁止
  }
  return newname;
}

/// ページID->ページ名変換用データ
var pageid2name = {};
