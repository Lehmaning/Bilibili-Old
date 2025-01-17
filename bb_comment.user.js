// ==UserScript==
// @name         Bilibili 翻页评论区
// @namespace    MotooriKashin
// @version      2.0.6
// @description  恢复评论区翻页功能。
// @author       MotooriKashin
// @homepage     https://github.com/MotooriKashin/Bilibili-Old
// @supportURL   https://github.com/MotooriKashin/Bilibili-Old/issues
// @icon         https://www.bilibili.com/favicon.ico
// @match        *://*.bilibili.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==

"use strict";
(() => {
  // src/runtime/lib/typeof.ts
  var isArray = Array.isArray;
  var isNumber = (val) => !isNaN(parseFloat(val)) && isFinite(val);

  // src/runtime/do_while.ts
  function doWhile(check, callback, delay = 100, stop = 180) {
    let timer = setInterval(() => {
      const d = check();
      if (d) {
        clearInterval(timer);
        callback(d);
      }
    }, delay);
    stop && setTimeout(() => clearInterval(timer), stop * 1e3);
  }

  // src/runtime/element/add_element.ts
  async function addCss(txt, id, parrent) {
    if (!parrent && !document.head) {
      await new Promise((r) => doWhile(() => document.body, r));
    }
    parrent = parrent || document.head;
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    id && !parrent.querySelector(`#${id}`) && style.setAttribute("id", id);
    style.appendChild(document.createTextNode(txt));
    parrent.appendChild(style);
  }
  function loadScript(src, onload) {
    return new Promise((r, j) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.addEventListener("load", () => {
        script.remove();
        onload && onload();
        r(true);
      });
      script.addEventListener("error", () => {
        script.remove();
        j();
      });
      (document.body || document.head || document.documentElement || document).appendChild(script);
    });
  }

  // src/runtime/format/integer.ts
  function integerFormat(num, byte = 2) {
    return num < 10 ** byte ? (Array(byte).join("0") + num).slice(-1 * byte) : num;
  }

  // src/runtime/format/time.ts
  function timeFormat(time = new Date().getTime(), type) {
    const date = new Date(time);
    const arr = date.toLocaleString().split(" ");
    const day = arr[0].split("/");
    day[1] = integerFormat(day[1], 2);
    day[2] = integerFormat(day[2], 2);
    return type ? day.join("-") + " " + arr[1] : arr[1];
  }

  // src/runtime/debug.ts
  var group = {
    i: 0,
    call: []
  };
  function debug(...data) {
    group.call.push(console.log.bind(console, `%c[${timeFormat()}]`, "color: blue;", ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  }
  debug.assert = function(condition, ...data) {
    group.call.push(console.assert.bind(console, `[${timeFormat()}]`, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.clear = function() {
    group.i = 0;
    group.call = [];
    setTimeout(console.clear.bind(console));
    return debug;
  };
  debug.debug = function(...data) {
    group.call.push(console.debug.bind(console, `[${timeFormat()}]`, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.error = function(...data) {
    group.call.push(console.error.bind(console, `[${timeFormat()}]`, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.group = function(...data) {
    group.i++;
    group.call.push(console.group.bind(console, `[${timeFormat()}]`, ...arguments));
    return debug;
  };
  debug.groupCollapsed = function(...data) {
    group.i++;
    group.call.push(console.groupCollapsed.bind(console, `[${timeFormat()}]`, ...arguments));
    return debug;
  };
  debug.groupEnd = function() {
    if (group.i) {
      group.i--;
      group.call.push(console.groupEnd.bind(console));
      !group.i && (group.call.push(() => group.call = []), group.call.forEach((d) => setTimeout(d)));
    }
    return debug;
  };
  debug.info = function(...data) {
    group.call.push(console.info.bind(console, `%c[${timeFormat()}]`, "color: blue;", ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.log = function(...data) {
    group.call.push(console.log.bind(console, `%c[${timeFormat()}]`, "color: blue;", ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.table = function(tabularData, properties) {
    group.call.push(console.table.bind(console, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.time = function(label) {
    console.time(label);
    return debug;
  };
  debug.timeEnd = function(label) {
    console.timeEnd(label);
    return debug;
  };
  debug.timeLog = function(label, ...data) {
    console.timeLog(label, `[${timeFormat()}]`, ...data);
    return debug;
  };
  debug.trace = function(...data) {
    group.call.push(console.trace.bind(console, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };
  debug.warn = function(...data) {
    group.call.push(console.warn.bind(console, `[${timeFormat()}]`, ...arguments));
    !group.i && setTimeout(group.call.shift());
    return debug;
  };

  // src/runtime/format/url.ts
  var URLES = class {
    hash;
    base;
    params = {};
    get param() {
      return Object.entries(this.params).reduce((s, d) => {
        return s += `${s ? "&" : ""}${d[0]}=${d[1]}`;
      }, "");
    }
    constructor(url) {
      const arr1 = url.split("#");
      let str = arr1.shift();
      this.hash = arr1.join("#");
      (this.hash || url.includes("#")) && (this.hash = `#${this.hash}`);
      const arr2 = str.split("?");
      this.base = arr2.shift();
      str = arr2.join("?");
      if (str) {
        str.split("&").forEach((d) => {
          const arr3 = d.split("=");
          const key = arr3.shift();
          let value = arr3.join("=") || "";
          try {
            if (!isNumber(value)) {
              value = JSON.parse(value);
            }
          } catch {
            value === "undefined" && (value = void 0);
            value === "NaN" && (value = NaN);
          }
          this.params[key] = value;
        });
      }
    }
    sort() {
      this.params = Object.keys(this.params).sort().reduce((s, d) => {
        s[d] = this.params[d];
        return s;
      }, {});
    }
    toJSON() {
      return `${this.base ? this.param ? this.base + "?" : this.base : ""}${this.param}${this.hash || ""}`;
    }
  };
  function urlObj(url) {
    const res = new URLES(url);
    return res.params;
  }

  // src/runtime/hook/node.ts
  var appendChildHead = HTMLHeadElement.prototype.appendChild;
  var appendChildBody = HTMLBodyElement.prototype.appendChild;
  var insertBeforeHead = HTMLHeadElement.prototype.insertBefore;
  var insertBeforeBody = HTMLBodyElement.prototype.insertBefore;
  var jsonp = [];
  HTMLHeadElement.prototype.appendChild = function(newChild) {
    newChild.nodeName == "SCRIPT" && newChild.src && jsonp.forEach((d) => {
      d[0].every((d2) => newChild.src.includes(d2)) && d[1].call(newChild);
    });
    return appendChildHead.call(this, newChild);
  };
  HTMLBodyElement.prototype.appendChild = function(newChild) {
    newChild.nodeName == "SCRIPT" && newChild.src && jsonp.forEach((d) => {
      d[0].every((d2) => newChild.src.includes(d2)) && d[1].call(newChild);
    });
    return appendChildBody.call(this, newChild);
  };
  HTMLHeadElement.prototype.insertBefore = function(newChild, refChild) {
    newChild.nodeName == "SCRIPT" && newChild.src && jsonp.forEach((d) => {
      d[0].every((d2) => newChild.src.includes(d2)) && d[1].call(newChild);
    });
    return insertBeforeHead.call(this, newChild, refChild);
  };
  HTMLBodyElement.prototype.insertBefore = function(newChild, refChild) {
    newChild.nodeName == "SCRIPT" && newChild.src && jsonp.forEach((d) => {
      d[0].every((d2) => newChild.src.includes(d2)) && d[1].call(newChild);
    });
    return insertBeforeBody.call(this, newChild, refChild);
  };
  function jsonphook(url, redirect, modifyResponse, once = true) {
    let id;
    const one = Array.isArray(url) ? url : [url];
    const two = function() {
      once && id && delete jsonp[id - 1];
      if (redirect)
        try {
          this.src = redirect(this.src) || this.src;
        } catch (e) {
          debug.error("redirect of jsonphook", one, e);
        }
      if (modifyResponse) {
        const obj = urlObj(this.src);
        if (obj) {
          const callback = obj.callback;
          const call = window[callback];
          const url2 = this.src;
          if (call) {
            window[callback] = function(v) {
              try {
                v = modifyResponse(v, url2, call) || v;
              } catch (e) {
                debug.error("modifyResponse of jsonphook", one, e);
              }
              return v !== true && call(v);
            };
          }
        }
      }
    };
    return id = jsonp.push([one, two]);
  }

  // src/content/comment.ts
  var Feedback;
  var loading = false;
  var load = false;
  function loadComment() {
    let events = {};
    Reflect.defineProperty(window, "bbComment", {
      configurable: true,
      set: (v) => {
        if (!v.prototype._createNickNameDom) {
          return loadScript("//s1.hdslb.com/bfs/seed/jinkela/commentpc/comment.min.js").then(() => {
            Array.from(document.styleSheets).forEach((d) => {
              d.href && d.href.includes("comment") && (d.disabled = true);
            });
          });
        }
        Feedback = v;
        bbCommentModify();
        Reflect.defineProperty(window, "bbComment", { configurable: true, value: Feedback });
      },
      get: () => {
        return Feedback ? Feedback : class {
          constructor() {
            if (!loading) {
              loadScript("//s1.hdslb.com/bfs/seed/jinkela/commentpc/comment.min.js").then(() => {
                Array.from(document.styleSheets).forEach((d) => {
                  d.href && d.href.includes("comment") && (d.disabled = true);
                });
              });
              loading = true;
            }
            setTimeout(() => {
              let bbcomment = new window.bbComment(...arguments);
              bbcomment.events && (bbcomment.events = Object.assign(bbcomment.events, events));
            });
          }
          on(eventName, cb) {
            if (!events[eventName]) {
              events[eventName] = [];
            }
            events[eventName].push(cb);
          }
        };
      }
    });
    Reflect.defineProperty(window, "initComment", {
      configurable: true,
      set: (v) => true,
      get: () => {
        if (load) {
          let initComment2 = function(tar, init) {
            new Feedback(tar, init.oid, init.pageType, init.userStatus);
          };
          var initComment = initComment2;
          Reflect.defineProperty(window, "initComment", { configurable: true, value: initComment2 });
          return initComment2;
        }
        return function() {
          if (!loading) {
            loadScript(`//s1.hdslb.com/bfs/seed/jinkela/commentpc/comment.min.js`).then(() => {
              load = true;
            });
          }
          loading = true;
          setTimeout(() => window.initComment(...arguments), 100);
        };
      }
    });
    jsonphook(["api.bilibili.com/x/v2/reply?", "sort=2"], void 0, (res) => {
      var _a;
      if (0 === res.code && ((_a = res.data) == null ? void 0 : _a.page)) {
        const page = res.data.page;
        page && jsonphook(["api.bilibili.com/x/v2/reply?", "sort=0"], void 0, (res2) => {
          var _a2;
          if (0 === res2.code && ((_a2 = res2.data) == null ? void 0 : _a2.page)) {
            page.count && (res2.data.page.count = page.count);
            page.acount && (res2.data.page.acount = page.acount);
          }
          return res2;
        }, false);
      }
      return res;
    });
  }
  function bbCommentModify() {
    Feedback.prototype.initAbtest = function() {
      this.abtest = {};
      this.abtest.optimize = false;
      if (this.jumpId || this.noPage) {
        this.abtest.optimize = false;
      }
      if (this.appMode === "comic") {
        this.abtest.optimize = false;
      }
      this._registerEvent();
      this.init();
    };
    Feedback.prototype._renderBottomPagination = function(pageInfo) {
      if (this.noPage) {
        var isLastPage = pageInfo.count <= this.pageSize;
        var html = "";
        if (isLastPage) {
          html = "没有更多了～";
        } else {
          html = '<a class="more-link" href="javascript:">查看更多评论</a>';
        }
        this.$root.find(".bottom-page").addClass("center").html(html);
        return;
      }
      const count = Math.ceil(pageInfo.count / pageInfo.size);
      if (count > 1) {
        this.$root.find(".header-interaction").addClass("paging-box").paging({
          pageCount: count,
          current: pageInfo.num,
          backFn: (p) => {
            this.$root.trigger("replyPageChange", {
              p,
              isBottom: true
            });
            this.trigger("replyPageChange", {
              p,
              isBottom: true
            });
            this.currentPage = p;
          }
        });
        this.$root.find(".bottom-page").paging({
          pageCount: count,
          current: pageInfo.num,
          jump: true,
          smallSize: this.smallPager,
          backFn: (p) => {
            this.$root.trigger("replyPageChange", {
              p,
              isBottom: true
            });
            this.trigger("replyPageChange", {
              p,
              isBottom: true
            });
            this.currentPage = p;
          }
        });
      } else {
        this.$root.find(".header-page").html("");
        this.$root.find(".bottom-page").html("");
      }
    };
    Feedback.prototype._createListCon = function(item, i, pos) {
      var _a, _b;
      const blCon = this._parentBlacklistDom(item, i, pos);
      const con = [
        '<div class="con ' + (pos == i ? "no-border" : "") + '">',
        '<div class="user">' + this._createNickNameDom(item),
        this._createLevelLink(item),
        this._identity(item.mid, item.assist, item.member.fans_detail),
        this._createNameplate(item.member.nameplate) + this._createUserSailing(item) + "</div>",
        this._createMsgContent(item),
        this._createPerfectReply(item),
        '<div class="info">',
        item.floor ? '<span class="floor">#' + item.floor + "</span>" : "",
        this._createPlatformDom(item.content.plat),
        '<span class="time-location">',
        '<span class="reply-time">'.concat(this._formateTime(item.ctime), "</span>"),
        ((_a = item == null ? void 0 : item.reply_control) == null ? void 0 : _a.location) ? `<span class="reply-location">${((_b = item == null ? void 0 : item.reply_control) == null ? void 0 : _b.location) || ""}</span>` : "",
        "</span>",
        item.lottery_id ? "" : '<span class="like ' + (item.action == 1 ? "liked" : "") + '"><i></i><span>' + (item.like ? item.like : "") + "</span></span>",
        item.lottery_id ? "" : '<span class="hate ' + (item.action == 2 ? "hated" : "") + '"><i></i></span>',
        item.lottery_id ? "" : this._createReplyBtn(item.rcount),
        item.lottery_id && item.mid !== this.userStatus.mid ? "" : '<div class="operation more-operation"><div class="spot"></div><div class="opera-list"><ul>' + (this._canSetTop(item) ? '<li class="set-top">' + (item.isUpTop ? "取消置顶" : "设为置顶") + "</li>" : "") + (this._canBlackList(item.mid) ? '<li class="blacklist">加入黑名单</li>' : "") + (this._canReport(item.mid) ? '<li class="report">举报</li>' : "") + (this._canDel(item.mid) && !item.isTop ? '<li class="del" data-mid="' + item.mid + '">删除</li>' : "") + "</ul></div></div>",
        this._createLotteryContent(item.content),
        this._createVoteContent(item.content),
        this._createTags(item),
        "</div>",
        '<div class="reply-box">',
        this._createSubReplyList(item.replies, item.rcount, false, item.rpid, item.folder && item.folder.has_folded, item.reply_control),
        "</div>",
        '<div class="paging-box">',
        "</div>",
        "</div>"
      ].join("");
      return item.state === this.blacklistCode ? blCon : con;
    };
    Feedback.prototype._createSubReplyItem = function(item, i) {
      var _a, _b;
      if (item.invisible) {
        return "";
      }
      return [
        '<div class="reply-item reply-wrap" data-id="' + item.rpid + '" data-index="' + i + '">',
        this._createSubReplyUserFace(item),
        '<div class="reply-con">',
        '<div class="user">',
        this._createNickNameDom(item),
        this._createLevelLink(item),
        this._identity(item.mid, item.assist, item.member.fans_detail),
        this._createSubMsgContent(item),
        "</div>",
        "</div>",
        '<div class="info">',
        item.floor ? '<span class="floor">#' + item.floor + "</span>" : "",
        this._createPlatformDom(item.content.plat),
        '<span class="time-location">',
        '<span class="reply-time">'.concat(this._formateTime(item.ctime), "</span>"),
        ((_a = item == null ? void 0 : item.reply_control) == null ? void 0 : _a.location) ? `<span class="reply-location">${((_b = item == null ? void 0 : item.reply_control) == null ? void 0 : _b.location) || ""}</span>` : "",
        "</span>",
        '<span class="like ' + (item.action == 1 ? "liked" : "") + '"><i></i><span>' + (item.like ? item.like : "") + "</span></span>",
        '<span class="hate ' + (item.action == 2 ? "hated" : "") + '"><i></i></span>',
        '<span class="reply btn-hover">回复</span>',
        item.dialog != item.rpid ? '<span class="dialog btn-hover" dialog-id="' + item.dialog + '" data-id="' + item.rpid + '">查看对话</span>' : "",
        '<div class="operation btn-hover btn-hide-re"><div class="spot"></div><div class="opera-list"><ul>' + (this._canBlackList(item.mid) ? '<li class="blacklist">加入黑名单</li>' : "") + (this._canReport(item.mid) ? '<li class="report">举报</li>' : "") + (this._canDel(item.mid) ? '<li class="del" data-mid="' + item.mid + '">删除</li>' : "") + "</ul></div></div>",
        "</div>",
        "</div>"
      ].join("");
    };
    addCss(`.bb-comment .comment-list .list-item .info .btn-hover, .comment-bilibili-fold .comment-list .list-item .info .btn-hover {
        line-height: 24px;
    }`, "comment-btn-24pxH");
    addCss(`.operation.btn-hide-re .opera-list {visibility: visible}`, "keep-operalist-visible");
    const _registerEvent = Feedback.prototype._registerEvent;
    Feedback.prototype._registerEvent = function(e) {
      _registerEvent.call(this, e);
      let n = this.$root;
      let $ = window.$;
      if (e)
        n = $(e);
      let l = this;
      n.on("click.dialog", ".dialog", function() {
        let clickTarget = this;
        clickTarget.innerHTML = "正在载入……";
        let rootid = clickTarget.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        let dialogid = clickTarget.getAttribute("dialog-id");
        let selfRpid = clickTarget.getAttribute("data-id");
        addCss(`
            .comment-dialog .dialog{display:none!important}
            .comment-dialog > .comment-list{transform:translateY(-13px)}
            .comment-dialog{min-height:200px;max-height:70vh;overflow-y:auto}
            .comment-dialog-container{width:600px;z-index:100000;position:fixed;background:#fff;left:50%;top:50%;transform:translate(-50%,-50%);box-shadow:0 0 20px 3px #0000005c;border-radius:10px;padding:0 18px;opacity:1;transition:opacity 0.1s}
            .comment-dialog-container.hidden{opacity:0}`, "comment-dialog");
        let container = document.createElement("div");
        container.className = "comment-dialog-container hidden";
        container.innerHTML = `
            <div class="comment-dialog bb-comment">
            <div class="comment-list">
            <div class="list-item" data-id="${rootid}">
            <div class="con" style="border:none;margin:0;padding:0;">
            <div class="reply-box">
            </div></div></div></div></div>`;
        document.body.appendChild(container);
        let replyBox = container.getElementsByClassName("reply-box")[0];
        setTimeout(() => {
          let closeWindow = (e2) => {
            if (!container.contains(e2.target) && e2.target != container) {
              container.className = "comment-dialog-container hidden";
              setTimeout(() => container.remove(), 100);
              clickTarget.innerHTML = "查看对话";
              window.removeEventListener("click", closeWindow, false);
            }
          };
          window.addEventListener("click", closeWindow);
        }, 0);
        function fetchDialog(minFloor) {
          return $.ajax({
            url: "//api.bilibili.com/x/v2/reply/dialog/cursor",
            type: "GET",
            data: {
              type: l.pageType,
              oid: l.oid,
              root: rootid,
              dialog: dialogid,
              size: 20,
              min_floor: minFloor
            },
            xhrFields: { withCredentials: true }
          });
        }
        function fixEmojiPosition(node) {
          node = $(node);
          node.find(".reply-item").each(function(_, n2) {
            var t = $(n2).find(".reply-face"), r = $(n2).find(".user"), n2 = $(n2).find(".name");
            t && r && n2 && (10 < n2.offset().top - r.offset().top ? t.css("top", "32px") : t.css("top", "0"));
          });
        }
        fetchDialog(0).done((resp) => {
          if (resp.code == 0 && resp.data.replies && resp.data.replies.length > 0) {
            let nextPage2 = function(minFloor) {
              if (minFloor < resp.data.dialog.max_floor) {
                fetchDialog(minFloor + 1).done((resp2) => {
                  if (resp2.code == 0 && resp2.data.replies && resp2.data.replies.length > 0) {
                    replyBox.insertAdjacentHTML("beforeend", l._createSubReplyList(resp2.data.replies, resp2.data.replies.length, true, rootid, null, false));
                    nextPage2(resp2.data.cursor.max_floor);
                  }
                });
              } else {
                fixEmojiPosition(replyBox);
                replyBox.querySelector(`div[data-id="${selfRpid}"]`).style.cssText = `
                            background: linear-gradient(45deg, rgba(115,108,231,0.13) 0%, rgba(0,161,214,0.13) 67%, rgba(0,212,255,0.13) 100%);
                            border-radius: 15px;
                            margin-right: 15px;`;
              }
            };
            var nextPage = nextPage2;
            replyBox.innerHTML = l._createSubReplyList(resp.data.replies, resp.data.replies.length, true, rootid, null, false);
            l._registerEvent(container);
            container.className = "comment-dialog-container";
            fixEmojiPosition(replyBox);
            nextPage2(resp.data.cursor.max_floor);
          }
        });
      });
      n.off("click.operation", ".spot");
      n.on("click.operation", ".spot", function(e2) {
        let operalist = this.parentNode.getElementsByClassName("opera-list")[0];
        if (l.lastClickOperation != this || operalist && operalist.style.display == "none") {
          $(".opera-list").hide(), $(this).siblings(".opera-list").show(), e2.stopPropagation(), $(this).hasClass("more-operation") && (e2 = +$(this).parents(".reply-wrap:eq(0)").attr("data-id"));
          l.lastClickOperation = this;
        } else
          operalist && (operalist.style.display = "none");
      });
    };
  }

  // src/tampermonkey/bb_comment.ts
  loadComment();
})();
// @license MIT
