(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function() {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var active = 0;
            var showSlide = function(index) {
                active = index;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            };
            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    showSlide(index);
                });
            });
            window.setInterval(function() {
                showSlide((active + 1) % slides.length);
            }, 6200);
        }

        var filter = document.querySelector("[data-filter-input]");
        if (filter) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            filter.addEventListener("input", function() {
                var value = filter.value.trim().toLowerCase();
                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    card.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
                });
            });
        }

        var searchForm = document.querySelector("[data-search-form]");
        var searchInput = document.querySelector("[data-search-input]");
        var searchResults = document.querySelector("[data-search-results]");
        if (searchForm && searchInput && searchResults && window.SITE_MOVIES) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;
            var render = function(query) {
                var value = query.trim().toLowerCase();
                var list = window.SITE_MOVIES.filter(function(movie) {
                    var text = [movie.title, movie.year, movie.region, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
                    return !value || text.indexOf(value) !== -1;
                }).slice(0, 80);
                searchResults.innerHTML = list.map(function(movie) {
                    return '<article class="search-result">' +
                        '<a class="search-thumb" href="' + movie.url + '" style="--poster-image: url(\'' + movie.cover + '\');" aria-label="' + movie.title + '"></a>' +
                        '<div>' +
                        '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
                        '<p>' + movie.oneLine + '</p>' +
                        '<div class="compact-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>' +
                        '</div>' +
                        '</article>';
                }).join("");
            };
            searchForm.addEventListener("submit", function(event) {
                event.preventDefault();
                render(searchInput.value);
                var query = searchInput.value.trim();
                var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                history.replaceState(null, "", nextUrl);
            });
            searchInput.addEventListener("input", function() {
                render(searchInput.value);
            });
            render(initial);
        }
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector("[data-play-overlay]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !source) {
        return;
    }

    var prepared = false;
    var hlsInstance = null;

    function attachSource() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        attachSource();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }
    if (button) {
        button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
