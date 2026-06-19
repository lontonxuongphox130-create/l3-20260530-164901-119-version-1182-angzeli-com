(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeType = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function yearMatches(value, target) {
    if (target === 'all') {
      return true;
    }

    if (target === 'classic') {
      var numeric = parseInt(value, 10);
      return Number.isFinite(numeric) && numeric < 2020;
    }

    return value === target;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var year = yearSelect ? yearSelect.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var type = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = activeType === 'all' || type.indexOf(activeType) !== -1;
      var matchYear = yearMatches(cardYear, year);
      var match = matchQuery && matchType && matchYear;

      card.hidden = !match;

      if (match) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  typeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeType = button.getAttribute('data-type-filter') || 'all';
      typeButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video[data-stream]');
    var button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function revealButton() {
      button.classList.remove('is-hidden');
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(revealButton);
      }
    }

    function attach() {
      if (attached) {
        playVideo();
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            video.src = stream;
          }
        });
        return;
      }

      video.src = stream;
      playVideo();
    }

    function start() {
      button.classList.add('is-hidden');
      attach();
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  });
})();
