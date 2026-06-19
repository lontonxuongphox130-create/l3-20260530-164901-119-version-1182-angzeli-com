(function () {
    function canUseNative(video) {
        return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    window.initMoviePlayer = function (videoId, source, poster) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }

        var shell = video.closest(".player-shell");
        var trigger = document.querySelector('[data-play-trigger="' + videoId + '"]');
        var prepared = false;
        var hls = null;

        if (poster) {
            video.setAttribute("poster", poster);
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (canUseNative(video)) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(source);
                });
                return;
            }

            video.src = source;
        }

        function playNow() {
            if (shell) {
                shell.classList.add("is-playing");
            }
            prepare();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        prepare();

        if (trigger) {
            trigger.addEventListener("click", playNow);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playNow();
            }
        });
    };
})();
