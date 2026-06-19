(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initNavigation() {
    var header = one(".site-header");
    var toggle = one(".nav-toggle");

    if (!header || !toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      var opened = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var slider = one(".hero-slider");

    if (!slider) {
      return;
    }

    var slides = all(".hero-slide", slider);
    var dots = all(".hero-dot", slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }

        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    all(".filter-panel").forEach(function (panel) {
      var target = panel.getAttribute("data-target") || "#movie-list";
      var list = one(target);
      var items = list ? all(".filter-item", list) : [];
      var keyword = one(".filter-keyword", panel);
      var year = one(".filter-year", panel);
      var region = one(".filter-region", panel);
      var type = one(".filter-type", panel);
      var genre = one(".filter-genre", panel);
      var noResults = list ? one(".no-results", list.parentNode) : null;

      function apply() {
        var keyValue = normalize(keyword && keyword.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var genreValue = normalize(genre && genre.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize(item.getAttribute("data-search"));
          var itemYear = normalize(item.getAttribute("data-year"));
          var itemRegion = normalize(item.getAttribute("data-region"));
          var itemType = normalize(item.getAttribute("data-type"));
          var itemGenre = normalize(item.getAttribute("data-genre"));

          var matched = true;

          if (keyValue && haystack.indexOf(keyValue) === -1) {
            matched = false;
          }

          if (yearValue && itemYear !== yearValue) {
            matched = false;
          }

          if (regionValue && itemRegion.indexOf(regionValue) === -1) {
            matched = false;
          }

          if (typeValue && itemType !== typeValue) {
            matched = false;
          }

          if (genreValue && itemGenre.indexOf(genreValue) === -1 && haystack.indexOf(genreValue) === -1) {
            matched = false;
          }

          item.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle("show", visible === 0);
        }
      }

      [keyword, year, region, type, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayer() {
    all(".player-card[data-player]").forEach(function (card) {
      var video = one(".movie-video", card);
      var overlay = one(".play-overlay", card);

      if (!video || !overlay) {
        return;
      }

      var stream = video.getAttribute("data-stream") || card.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function attachStream() {
        if (!stream || attached) {
          playVideo();
          return;
        }

        attached = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = stream;
          video.load();
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
        }

        card.classList.add("is-playing");
        attachStream();
      }

      overlay.addEventListener("click", start);

      video.addEventListener("click", function () {
        if (!attached) {
          start();
        }
      });

      video.addEventListener("play", function () {
        card.classList.add("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initBackTop() {
    all(".back-top").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
    initBackTop();
  });
})();
