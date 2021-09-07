/**
 * 本模块负责禁用WebRTC以禁止直播间p2p共享
 * 代码参看了WebRTC Control的源码，非常感谢！
 * @see WebRTC-Control {@link https://mybrowseraddon.com/webrtc-control.html}
 */
// @ts-nocheck
(function () {
    if (typeof navigator.getUserMedia !== "undefined")
        navigator.getUserMedia = undefined;
    if (typeof window.MediaStreamTrack !== "undefined")
        window.MediaStreamTrack = undefined;
    if (typeof window.RTCPeerConnection !== "undefined")
        window.RTCPeerConnection = undefined;
    if (typeof window.RTCSessionDescription !== "undefined")
        window.RTCSessionDescription = undefined;
    if (typeof navigator.mozGetUserMedia !== "undefined")
        navigator.mozGetUserMedia = undefined;
    if (typeof window.mozMediaStreamTrack !== "undefined")
        window.mozMediaStreamTrack = undefined;
    if (typeof window.mozRTCPeerConnection !== "undefined")
        window.mozRTCPeerConnection = undefined;
    if (typeof window.mozRTCSessionDescription !== "undefined")
        window.mozRTCSessionDescription = undefined;
    if (typeof navigator.webkitGetUserMedia !== "undefined")
        navigator.webkitGetUserMedia = undefined;
    if (typeof window.webkitMediaStreamTrack !== "undefined")
        window.webkitMediaStreamTrack = undefined;
    if (typeof window.webkitRTCPeerConnection !== "undefined")
        window.webkitRTCPeerConnection = undefined;
    if (typeof window.webkitRTCSessionDescription !== "undefined")
        window.webkitRTCSessionDescription = undefined;
    API.toast.warning("禁用直播间P2P上传！");
})();
