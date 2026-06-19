(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = qs('[data-nav-toggle]');
    var nav = qs('[data-site-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var previous = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    var input = qs('[data-filter-input]');
    var scope = qs('[data-filter-scope]');
    var status = qs('[data-filter-status]');
    var chips = qsa('[data-filter-value]');

    if (!scope) {
      return;
    }

    var cards = qsa('[data-movie-card]', scope);
    var params = new URLSearchParams(window.location.search);
    var activeValue = normalize(params.get('q'));

    if (input && activeValue) {
      input.value = activeValue;
    }

    function apply(value) {
      var query = normalize(value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      chips.forEach(function (chip) {
        chip.classList.toggle('is-active', normalize(chip.getAttribute('data-filter-value')) === query);
      });

      if (status) {
        status.textContent = query ? '筛选结果：' + visible : '';
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        apply(input.value);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-value') || '';
        if (input) {
          input.value = value;
        }
        apply(value);
      });
    });

    apply(activeValue);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
