(function () {
  function init(wrapper) {
    var video = wrapper.querySelector('video');
    var trigger = wrapper.querySelector('[data-player-trigger]');
    var url = wrapper.getAttribute('data-hls');
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function play() {
      if (wrapper.getAttribute('data-ready') !== '1') {
        wrapper.setAttribute('data-ready', '1');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = url;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        }
      } else {
        video.play().catch(function () {});
      }

      wrapper.classList.add('is-playing');
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(init);
  });
})();
