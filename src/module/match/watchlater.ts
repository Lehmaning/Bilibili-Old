/**
 * 本模块负责重写稍后再看页面
 */
(function () {
    if (!API.uid) return toast.warning("未登录，无法启用稍后再看！");
    API.path.name = "watchlater";
    // 备份还原旧版播放器设置数据
    API.restorePlayerSetting();
    API.rewriteHTML(API.getModule("watchlater.html"));
    API.addCss(API.getModule("bofqi.css"));
    // 修复评论跳转
    (<any>window).commentAgent = { seek: (t: any) => (<any>window).player && (<any>window).player.seek(t) };
    // 添加点赞功能
    config.enlike && API.importModule("enLike.js");
    API.addCss(API.getModule("mini-bofqi.css"));
})();