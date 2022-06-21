import { debug } from "../../runtime/debug";
import { getCookies } from "../../runtime/cookies";
import { toast } from "../../runtime/toast/toast";
import { jsonCheck } from "../../runtime/unit";
import { uid } from "../../runtime/variable/uid";
import { xhr } from "../../runtime/xhr";

/**
 * 代理退出登录功能
 * @param referer 退出后跳转的页面URL
 */
export async function loginExit(referer?: string) {
    if (!uid) return toast.warning("本就未登录，无法退出登录！");
    const msg: any = toast.custom(0, "warning", "正在退出登录...");
    try {
        let data = jsonCheck(await xhr({
            url: "https://passport.bilibili.com/login/exit/v2",
            data: `biliCSRF=${getCookies().bili_jct}&gourl=${encodeURIComponent(location.href)}`,
            method: "POST",
            credentials: true
        }))
        if (data.status) {
            msg && (msg.data = ["成功退出登录~"]);
            msg && (msg.type = "success");
            if (referer) return location.replace(referer);
            setTimeout(() => location.reload(), 1000);
        } else {
            msg && (msg.data = ["操作失败~"]);
            msg && (msg.type = "error");
            msg && (msg.delay = 4);
            debug.error("退出登录", data);
        }
    } catch (e) {
        msg && (msg.data = ["操作失败~"]);
        msg && (msg.type = "error");
        msg && (msg.delay = 4);
        debug.error("退出登录", e);
    }
}
