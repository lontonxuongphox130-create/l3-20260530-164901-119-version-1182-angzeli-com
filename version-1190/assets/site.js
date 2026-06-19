(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-arrow.prev");
    var next = root.querySelector(".hero-arrow.next");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-text]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-card-text") || "").toLowerCase();
        card.hidden = query.length > 0 && text.indexOf(query) === -1;
      });
    });
  }

  function initSearch() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-input");
    if (!results || typeof SEARCH_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    function card(item) {
      return [
        '<a class="movie-card standard" href="', item.url, '" data-card-text="', item.search, '">',
        '<span class="poster-frame"><img src="', item.cover, '" alt="', item.title, '" loading="lazy"><span class="region-pill">', item.region, '</span></span>',
        '<span class="card-body"><strong>', item.title, '</strong><span class="card-line">', item.oneLine, '</span>',
        '<span class="card-meta"><em>', item.year, '</em><em>', item.type, '</em></span></span></a>'
      ].join("");
    }
    var list = [];
    if (query) {
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      list = SEARCH_INDEX.filter(function (item) {
        var text = (item.search || "").toLowerCase();
        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      }).slice(0, 80);
    } else {
      list = SEARCH_INDEX.slice(0, 24);
    }
    results.innerHTML = list.map(card).join("");
    if (!list.length) {
      results.innerHTML = '<div class="filter-panel"><strong>没有找到匹配影片</strong></div>';
    }
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var source = shell.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }
      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        attach();
        shell.classList.add("is-playing");
        if (cover) {
          cover.hidden = true;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (cover) {
          cover.hidden = true;
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearch();
    initPlayers();
  });
})();
