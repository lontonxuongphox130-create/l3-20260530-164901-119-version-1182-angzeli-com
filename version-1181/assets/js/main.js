document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayers();
});

function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
    });
}

function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            show(dotIndex);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initSearch() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
        return;
    }

    var input = page.querySelector('[data-search-input]');
    var region = page.querySelector('[data-region-filter]');
    var year = page.querySelector('[data-year-filter]');
    var kind = page.querySelector('[data-kind-filter]');
    var empty = page.querySelector('[data-empty]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function run() {
        var keyword = normalize(input && input.value);
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var kindValue = kind ? kind.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-kind'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }

            if (regionValue && card.getAttribute('data-region') !== regionValue) {
                matched = false;
            }

            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                matched = false;
            }

            if (kindValue && card.getAttribute('data-kind') !== kindValue) {
                matched = false;
            }

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    [input, region, year, kind].forEach(function (control) {
        if (control) {
            control.addEventListener('input', run);
            control.addEventListener('change', run);
        }
    });

    run();
}

function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var url = video ? video.getAttribute('data-video') : '';
        var hlsInstance = null;

        function attach() {
            if (!video || !url) {
                return;
            }

            if (video.getAttribute('data-ready') === 'yes') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.setAttribute('data-ready', 'yes');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                video.setAttribute('data-ready', 'yes');
                return;
            }

            video.src = url;
            video.setAttribute('data-ready', 'yes');
        }

        function play() {
            attach();

            if (cover) {
                cover.classList.add('hidden');
            }

            if (video) {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('hidden');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
}
