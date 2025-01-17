import { ProxyHandler } from "../lib/proxy_handler";
import { createElements } from "../element/create_element";
import { htmlVnode, Vdom } from "../element/html_vnode";
import { ClickRemove } from "../element/popupbox/popupbox";
import html from "./download_ui.html";
import { DownloadDate } from "./playinfo_filter";
import { mutex } from "../variable/mutex";

/** 内置颜色 */
export type DownloadUpColer = "yellow" | "pink" | "purple" | "red" | "orange" | "blue" | "green" | "lv9" | "lv8" | "lv7" | "lv6" | "lv5" | "lv4" | "lv3" | "lv2" | "lv1";
/** 配置数据 */
interface Value {
    /** 下载数据 */
    data: DownloadDate;
}
class BiliOldDownload extends HTMLElement {
    /** 下载数据 */
    _data: Value["data"];
    /** 配置数据备份，从这里修改也是一样的 */
    obj: Value;
    /** 跟节点 */
    _table: HTMLDivElement;
    /** 点击移除 */
    observer = new ClickRemove(this);
    constructor(obj: Value) {
        super();
        const { data } = obj;
        const root = this.attachShadow({ mode: "closed" });
        root.appendChild(createElements(htmlVnode(html)));
        this._table = <HTMLDivElement>root.children[0];
        this.obj = obj;
        Reflect.defineProperty(obj, "data", {
            configurable: true,
            get: () => new Proxy(this._data, new ProxyHandler(() => this.$data())),
            set: (v) => {
                if (v === this._data) return;
                this._data = v;
                this.$data();
            }
        });
        this._data = obj.data = data;
    }
    $data() {
        const vdoms = Object.entries(this._data).reduce((s, d) => {
            const vdom: Vdom = {
                tagName: "div",
                props: { class: "cell" },
                children: [
                    {
                        tagName: "div",
                        props: { class: `type ${d[0]}` },
                        children: [
                            {
                                tagName: "text",
                                text: d[0]
                            }
                        ]
                    }
                ]
            };
            d[1].forEach(d => {
                const a: Record<string, any> = { class: "item", target: "_blank" };
                d.href && (a.href = d.href);
                d.fileName && (a.download = d.fileName);
                vdom.children?.push({
                    tagName: "a",
                    props: a,
                    children: [
                        {
                            tagName: "div",
                            props: { class: `up${d.color ? ` ${d.color}` : ""}` },
                            children: [
                                {
                                    tagName: "text",
                                    text: d.up
                                }
                            ]
                        },
                        {
                            tagName: "div",
                            props: { class: `down` },
                            children: [
                                {
                                    tagName: "text",
                                    text: d.down
                                }
                            ]
                        }
                    ],
                    event: {
                        click: () => {
                            d.onclick && d.onclick();
                        }
                    }
                });
            });
            s.push(vdom);
            return s;
        }, <Vdom[]>[]);
        vdoms.length || (vdoms.push({
            tagName: "div",
            children: [
                {
                    tagName: "text",
                    text: "正在获取下载数据~"
                }
            ]
        }));
        this._table.replaceChildren(createElements(vdoms));
    }
    /** 显示下载面板 */
    show() {
        if (!document.body.contains(this)) {
            document.body.appendChild(this);
            this.observer.observe();
        }
    }
}
customElements.get(`biliold-download${mutex}`) || customElements.define(`biliold-download${mutex}`, BiliOldDownload);
/** 下载面板控件 */
export const downloadUI = new BiliOldDownload({ data: {} });