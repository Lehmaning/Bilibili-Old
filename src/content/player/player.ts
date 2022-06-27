import { doWhile } from "../../runtime/doWhile";
import { createElements } from "../../runtime/element/createElement";
import { appendScripts } from "../../runtime/element/createScripts";
import { htmlVnode } from "../../runtime/element/htmlVnode";
import { objUrl } from "../../runtime/format/url";
import { loadVideoScript } from "../../runtime/player/EmbedPlayer";
import { getUrlValue } from "../../runtime/unit";
import { urlParam } from "../../runtime/urlParam";
import script from "./script.html";
import html from "./player.html";


// 备份标题
const title = document.title;
// 清理样式表
Array.from(document.styleSheets).forEach(d => d.disabled = true);
// 刷新样式表
document.documentElement.replaceWith(createElements(htmlVnode(html)));
// 还原标题
title && !title.includes("404") && (document.title = title);
// 加载播放器脚本
loadVideoScript(undefined, true);
document.domain = "bilibili.com";
// 加载原生脚本
appendScripts(script).then(() => {
    const playerParam = { // 基础视频信息
        aid: getUrlValue("aid") || getUrlValue("avid"),
        cid: getUrlValue("cid"),
        p: getUrlValue("P"),
        // autoplay: getUrlValue("autoplay"), 深恶痛绝
        as_wide: getUrlValue("as_wide"),
        bnj: getUrlValue("bnj"),
        player_type: getUrlValue("player_type"),
        season_type: getUrlValue("season_type")
    }
    if (playerParam.bnj) {
        try {
            (<any>window).parent.EmbedPlayer = (<any>window).EmbedPlayer;
            (<any>window).parent.bnj = true;
        } catch (e) { }
    } else {
        // 读取信息
        urlParam(location.href).then(d => {
            if (!d.cid) throw d;
            playerParam.aid = d.aid;
            playerParam.cid = d.cid;
            if (d.pgc || d.ssid || d.epid) {
                !playerParam.season_type && (playerParam.season_type = "1");
                Reflect.set(playerParam, "seasonId", d.ssid)
                Reflect.set(playerParam, "episodeId", d.epid)
                Reflect.set(playerParam, "urlparam", `module%3Dbangumi%26season_type%3D${playerParam.season_type}`)
            }
            // 初始化播放器
            (<any>window).EmbedPlayer("player", "//static.hdslb.com/play.swf", objUrl("", <Record<string, string | number>>playerParam));
        });
    }
    // 暴露嵌入播放器
    doWhile(() => (<any>window).player, () => {
        try {
            (<any>window).parent.player = (<any>window).player;
        } catch (e) { }
    });
});