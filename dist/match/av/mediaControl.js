/**
 * 本模块负责为旧版播放器添加媒体控制键
 * 请以`title`、`artist`、`chapterName`、`coverUrl`、`getPlaylistIndex`的名义传入数据
 * 告知：本模块由js强行any为ts版本，可能需要进一步优化
 */
(async function () {
    if (document.visibilityState !== "visible") {
        await new Promise(r => window.addEventListener('load', r));
    }
    if ("mediaSession" in navigator) {
        function trial(fn) {
            let limit = 7;
            function task() { if (!fn() && --limit > 0)
                setTimeout(task, 1000); }
            task();
        }
        trial(() => {
            if (window.player != undefined && window.player.getPlaylist && window.player.getPlaylist() != null) {
                let playList = window.player.getPlaylist();
                // @ts-ignore：该变量由主模块传入
                let partIndex = getPlaylistIndex();
                // @ts-ignore：这是一项试验性特性
                navigator.mediaSession.metadata = new MediaMetadata({
                    // @ts-ignore：该变量由主模块传入
                    title: title,
                    // @ts-ignore：该变量由主模块传入
                    artist: artist,
                    // @ts-ignore：该变量由主模块传入
                    album: chapterName(partIndex, playList),
                    // @ts-ignore：该变量由主模块传入
                    artwork: coverUrl(partIndex, playList)
                });
                navigator.mediaSession.setActionHandler('play', () => window.player.play());
                navigator.mediaSession.setActionHandler('pause', () => window.player.pause());
                navigator.mediaSession.setActionHandler('seekbackward', () => window.player.seek(window.player.getCurrentTime() - 10));
                navigator.mediaSession.setActionHandler('seekforward', () => window.player.seek(window.player.getCurrentTime() + 10));
                navigator.mediaSession.setActionHandler('previoustrack', () => window.player.prev());
                navigator.mediaSession.setActionHandler('nexttrack', () => window.player.next());
                API.switchVideo(() => {
                    // 要等到新的分p载入完成，getPlaylistIndex()的值才会更新
                    trial(() => {
                        // @ts-ignore：该变量由主模块传入
                        let pid = getPlaylistIndex();
                        if (pid != partIndex) {
                            partIndex = pid;
                            // @ts-ignore：该变量由主模块传入
                            navigator.mediaSession.metadata.album = chapterName(partIndex, playList);
                            // @ts-ignore：该变量由主模块传入
                            navigator.mediaSession.metadata.artwork = coverUrl(partIndex, playList);
                            return true;
                        }
                    });
                });
                return true;
            }
        });
    }
})();
