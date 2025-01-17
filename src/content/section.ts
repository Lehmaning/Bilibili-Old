import { doWhile } from "../runtime/do_while";
import { addCss, addElement, loadScript } from "../runtime/element/add_element";
import { banner, primaryMenu } from "./banner";
import css from "./avatar_animation.css";
import { xhrhookAsync } from "../runtime/hook/xhr";

/** 加载底栏脚本 */
async function header(menu = false) {
    if (menu) {
        primaryMenu(); // 顶栏分区修正
        banner(); // 顶栏banner修复
    }
    // 备份 onLoginInfoLoaded 回调 一些功能依赖这个回调，但`header.js`会直接覆盖已注册的回调
    if ((<any>window).loginInfoCallbacks && (<any>window).onLoginInfoLoaded) {
        let fun = (<any>window).onLoginInfoLoaded;
        Reflect.defineProperty(window, "onLoginInfoLoaded", {
            configurable: true,
            get: () => fun,
            set: t => {
                fun = t;
                (<any>window).loginInfoCallbacks.forEach((d: [any, boolean]) => { fun(...d) })
            }
        })
    }
    if (!(<any>window).jQuery) await loadScript("//static.hdslb.com/js/jquery.min.js");
    loadScript("//s1.hdslb.com/bfs/seed/jinkela/header/header.js");
}
/** 底栏脚本 **注意可能要主动出发window.load事件** */
async function footer() {
    if (!(<any>window).jQuery) await loadScript("//static.hdslb.com/js/jquery.min.js");
    loadScript("//static.hdslb.com/common/js/footer.js");
}
/** 样式表清理 */
function styleClear() {
    const d = document.styleSheets;
    for (let i = 0; i < d.length; i++) {
        (d[i].href?.includes("laputa-footer")
            || d[i].href?.includes("laputa-header"))
            && (d[i].disabled = true);
    }
}
/** 替换顶栏回调 */
function replaceHeader(t: Element) {
    /** 是否完整类型 */
    let menu = false;
    if (
        document.querySelector(".mini-type")
        || /festival/.test(location.href)
    ) {
        menu = false
    }
    if (
        location.href.includes("blackboard/topic_list")
        || location.href.includes("blackboard/x/act_list")
        || document.querySelector(".large-header")
        || document.querySelector(".bili-banner")
        || (t.getAttribute("type") == "all")
    ) {
        menu = true;
    }
    if (t.parentElement?.id === "app") {
        t.setAttribute("hidden", "hidden");
        if (document.querySelector("#bili-header-m") || (document.querySelector(".z-top-container") && !document.querySelector(".z-top-container")?.id)) return;
        // 顶栏包含在vue中，直接修改将导致vue绑定出错影响页面其他节点，只能隐藏之
        addElement("div", { class: `z-top-container${menu ? " has-menu" : ""}` }, undefined, undefined, true);
    } else {
        if (document.querySelector("#bili-header-m") || (document.querySelector(".z-top-container") && !document.querySelector(".z-top-container")?.id)) return;
        t.setAttribute("class", `z-top-container${menu ? " has-menu" : ""}`);
        t.removeAttribute("id");
    }
    styleClear();
    header(menu);
}
/** 替换顶栏底栏 */
export function section() {
    addCss(".nav-item.live {width: auto;}.lt-row {display: none !important;} .bili-header-m #banner_link{background-size: cover;background-position: center !important;}");
    // 顶栏
    doWhile(() => document.querySelector("#internationalHeader"), replaceHeader);
    doWhile(() => document.querySelector("#biliMainHeader"), replaceHeader);
    doWhile(() => document.querySelector(".bili-header-default"), replaceHeader);
    // 上古顶栏
    doWhile(() => document.querySelector(".z_top_container"), t => {
        t.setAttribute("class", "z-top-container has-menu");
        document.querySelector(".header")?.remove();
        header(true);
    })
    // 底栏
    doWhile(() => document.querySelector(".international-footer") || document.querySelector("#biliMainFooter"), t => {
        t.replaceChildren();
        t.setAttribute("class", "footer bili-footer report-wrap-module");
        t.setAttribute("id", "home_footer");
        footer();
        styleClear();
    })
    // 鼠标放在顶栏上的动效
    doWhile(() => document.querySelector("#bili-header-m"), () => {
        addCss(css, "avatarAnimation");
    });
    // v3版顶栏
    doWhile(() => (document.body && document.body.classList.contains("header-v3")) || document.querySelector("#bili-header-container"), () => {
        document.body.classList.remove("header-v3");
        header(true);
    });

    // 顶栏动态直播回复数目接口失效，强制标记为0
    xhrhookAsync('api.live.bilibili.com/ajax/feed/count', undefined, async (arg, type) => {
        const response = '{ "code": 0, "data": { "count": 0 } }';
        return type === "json"
            ? {
                response: JSON.parse(response)
            } : {
                response: response,
                responseText: response
            }
    }, false);
}