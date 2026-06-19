(function () {
    function init(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');

        if (!video) {
            return;
        }

        var src = video.getAttribute('data-play');
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded || !src) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            load();

            if (overlay) {
                overlay.hidden = true;
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });

        video.addEventListener('pause', function () {
            if (!video.ended && overlay) {
                overlay.hidden = false;
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.player-shell'), init);
})();
