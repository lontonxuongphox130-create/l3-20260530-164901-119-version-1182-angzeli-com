(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    const reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        reset();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const filterInput = document.querySelector('.page-filter-input');
  const yearFilter = document.querySelector('.page-year-filter');
  const cardList = document.querySelector('[data-card-list]');

  if ((filterInput || yearFilter) && cardList) {
    const cards = Array.from(cardList.querySelectorAll('[data-search-card]'));
    const runFilter = function () {
      const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      const year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const matchedKeyword = !keyword || text.includes(keyword);
        const matchedYear = !year || cardYear === year;
        card.hidden = !(matchedKeyword && matchedYear);
      });
    };

    if (filterInput) {
      filterInput.addEventListener('input', runFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', runFilter);
    }
  }

  const searchResults = document.querySelector('[data-search-results]');
  const globalSearchForm = document.querySelector('[data-global-search-form]');

  if (searchResults && Array.isArray(window.SEARCH_INDEX)) {
    const input = globalSearchForm ? globalSearchForm.querySelector('input[name="q"]') : null;
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (input) {
      input.value = query;
    }

    const render = function (term) {
      const normalized = term.trim().toLowerCase();
      const source = window.SEARCH_INDEX;
      const results = normalized
        ? source.filter(function (item) {
            return item.search.toLowerCase().includes(normalized);
          }).slice(0, 120)
        : source.slice(0, 60);

      if (!results.length) {
        searchResults.innerHTML = '<div class="empty-result">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      searchResults.innerHTML = results.map(function (item) {
        return '<article class="search-result-card">' +
          '<a href="./' + item.file + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
          '<div>' +
            '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>' +
            '<p>' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
        '</article>';
      }).join('');
    };

    render(query);

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));
  let hlsLoader = null;

  const loadHls = function () {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('load failed'));
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  };

  const attachNative = function (video, source) {
    return new Promise(function (resolve, reject) {
      if (!video.canPlayType('application/vnd.apple.mpegurl')) {
        reject(new Error('unsupported'));
        return;
      }
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        resolve();
      }, { once: true });
      video.addEventListener('error', function () {
        reject(new Error('video error'));
      }, { once: true });
    });
  };

  const attachHls = function (video, source) {
    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        return attachNative(video, source);
      }
      return new Promise(function (resolve, reject) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          reject(new Error('video error'));
        });
      });
    }).catch(function () {
      return attachNative(video, source);
    });
  };

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-layer');
    const state = player.querySelector('.player-state');
    const source = player.getAttribute('data-src');
    let ready = false;
    let loading = false;

    if (!video || !button || !source) {
      return;
    }

    const setState = function (message) {
      if (state) {
        state.textContent = message || '';
      }
    };

    const prepare = function () {
      if (ready) {
        return Promise.resolve();
      }
      if (loading) {
        return Promise.resolve();
      }
      loading = true;
      setState('正在加载影片');
      return attachHls(video, source).then(function () {
        ready = true;
        loading = false;
        setState('');
      }).catch(function () {
        loading = false;
        setState('暂时无法播放此视频');
        throw new Error('playback unavailable');
      });
    };

    const play = function () {
      prepare().then(function () {
        button.classList.add('hidden');
        return video.play();
      }).catch(function () {
        button.classList.remove('hidden');
      });
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
        button.classList.remove('hidden');
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      button.classList.remove('hidden');
    });
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
