(function () {
  const body = document.body;
  const toggle = document.querySelector("[data-mobile-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const opened = menu.classList.toggle("is-open");
      body.classList.toggle("is-menu-open", opened);
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (active < 0) {
      active = 0;
    }

    function show(next) {
      if (!slides.length) {
        return;
      }

      active = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        const current = index === active;
        slide.classList.toggle("is-active", current);
        slide.setAttribute("aria-hidden", current ? "false" : "true");
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
  });

  const grid = document.querySelector("[data-search-grid]");

  if (grid) {
    const cards = Array.from(grid.querySelectorAll("[data-search-card]"));
    const input = document.querySelector("[data-search-input]");
    const type = document.querySelector("[data-filter-type]");
    const year = document.querySelector("[data-filter-year]");
    const region = document.querySelector("[data-filter-region]");
    const empty = document.querySelector("[data-result-empty]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function matches(card, query, wantedType, wantedYear, wantedRegion) {
      const text = normalize(card.textContent);
      const cardType = normalize(card.dataset.type);
      const cardYear = normalize(card.dataset.year);
      const cardRegion = normalize(card.dataset.region);
      const cardGenre = normalize(card.dataset.genre);
      const title = normalize(card.dataset.title);
      const haystack = [text, cardType, cardYear, cardRegion, cardGenre, title].join(" ");

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (wantedType && cardType !== wantedType) {
        return false;
      }

      if (wantedYear && cardYear !== wantedYear) {
        return false;
      }

      if (wantedRegion && cardRegion !== wantedRegion) {
        return false;
      }

      return true;
    }

    function update() {
      const query = normalize(input && input.value);
      const wantedType = normalize(type && type.value);
      const wantedYear = normalize(year && year.value);
      const wantedRegion = normalize(region && region.value);
      let shown = 0;

      cards.forEach(function (card) {
        const visible = matches(card, query, wantedType, wantedYear, wantedRegion);
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, type, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
  }
}());
