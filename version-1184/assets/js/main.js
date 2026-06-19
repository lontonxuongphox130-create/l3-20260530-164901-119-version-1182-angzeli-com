(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        if (menuToggle) {
            menuToggle.addEventListener("click", function () {
                document.body.classList.toggle("is-menu-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === current);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            show(0);
            restart();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-card-scope]")).forEach(function (scope) {
            var input = scope.querySelector(".local-search-input");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
            var empty = scope.querySelector("[data-no-results]");
            var activeFilter = "all";
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function cardText(card) {
                return [
                    card.getAttribute("data-search") || "",
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var textMatch = !query || cardText(card).indexOf(query) !== -1;
                    var type = card.getAttribute("data-type") || "";
                    var genre = card.getAttribute("data-genre") || "";
                    var filterMatch = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || genre.indexOf(activeFilter) !== -1;
                    var shouldShow = textMatch && filterMatch;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    });
})();
