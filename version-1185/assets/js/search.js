(function () {
    var input = document.querySelector('[data-search-input]');
    var region = document.querySelector('[data-region-filter]');
    var year = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
    var empty = document.querySelector('.empty-state');

    if (!input || !cards.length) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial) {
        input.value = initial;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filter() {
        var q = normalize(input.value);
        var selectedRegion = region ? region.value : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-keywords')
            ].join(' '));
            var regionOk = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
            var yearOk = !selectedYear || card.getAttribute('data-year') === selectedYear;
            var queryOk = !q || haystack.indexOf(q) !== -1;
            var show = regionOk && yearOk && queryOk;

            card.style.display = show ? '' : 'none';

            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    input.addEventListener('input', filter);

    if (region) {
        region.addEventListener('change', filter);
    }

    if (year) {
        year.addEventListener('change', filter);
    }

    filter();
})();
