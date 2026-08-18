(function () {
  function refreshMonthBreaks() {
    Array.prototype.forEach.call(document.querySelectorAll("table.media-table--month-gaps"), function (table) {
      var prev = "";
      Array.prototype.forEach.call(table.querySelectorAll("tr.media-row"), function (row) {
        row.classList.remove("media-row--month-break", "media-row--month-first");
        if (row.hidden) return;
        var month = row.getAttribute("data-month") || "";
        if (month && (!prev || month !== prev)) {
          row.classList.add("media-row--month-break");
          if (!prev) row.classList.add("media-row--month-first");
        }
        if (month) prev = month;
      });
    });
  }

  function applyFilters() {
    var searchInput = document.querySelector(".media-search");
    var ratingSelect = document.querySelector(".media-rating-filter");
    var status = document.querySelector(".media-filter-status");
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var minRating = ratingSelect && ratingSelect.value ? parseInt(ratingSelect.value, 10) : 0;
    var visible = 0;
    var total = 0;

    Array.prototype.forEach.call(document.querySelectorAll(".media-section"), function (section) {
      var anyVisible = false;
      Array.prototype.forEach.call(section.querySelectorAll("tr.media-row"), function (row) {
        total += 1;
        var haystack = (row.getAttribute("data-search") || "").toLowerCase();
        var rating = parseInt(row.getAttribute("data-rating") || "", 10);
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRating = !minRating || (!isNaN(rating) && rating >= minRating);
        var show = matchesQuery && matchesRating;
        row.hidden = !show;
        if (show) {
          anyVisible = true;
          visible += 1;
        }
      });
      section.hidden = !anyVisible;
    });

    if (status) {
      var active = Boolean(query || minRating);
      status.hidden = !active;
      status.textContent = active ? visible + " of " + total + " rows match." : "";
    }

    refreshMonthBreaks();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.querySelector(".media-search");
    var ratingSelect = document.querySelector(".media-rating-filter");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (ratingSelect) ratingSelect.addEventListener("change", applyFilters);
    observeCovers();
    setupBackToTop();
  });

  function setupBackToTop() {
    var button = document.querySelector("[data-back-to-top]");
    if (!button) return;

    function sync() {
      button.hidden = window.scrollY < 320;
    }

    window.addEventListener("scroll", sync, { passive: true });
    sync();
    button.addEventListener("click", function () {
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function wikiImageEndpoint(pageUrl) {
    try {
      var parsed = new URL(pageUrl, window.location.href);
      if (!/\.wikipedia\.org$/i.test(parsed.hostname)) return null;
      var match = parsed.pathname.match(/\/wiki\/(.+)$/);
      if (!match) return null;
      var lang = parsed.hostname.split(".")[0];
      var params = new URLSearchParams({
        action: "query",
        titles: decodeURIComponent(match[1]),
        prop: "pageimages",
        format: "json",
        pithumbsize: "320",
        pilicense: "any",
        redirects: "1",
        origin: "*"
      });
      return "https://" + lang + ".wikipedia.org/w/api.php?" + params.toString();
    } catch (err) {
      return null;
    }
  }

  function thumbnailFromQuery(data) {
    var pages = data && data.query && data.query.pages;
    if (!pages) return null;
    var keys = Object.keys(pages);
    for (var i = 0; i < keys.length; i++) {
      var thumb = pages[keys[i]] && pages[keys[i]].thumbnail;
      if (thumb && thumb.source) return thumb.source;
    }
    return null;
  }

  function loadCover(img) {
    if (!img || img.getAttribute("data-cover-state")) return;
    img.setAttribute("data-cover-state", "loading");
    var endpoint = wikiImageEndpoint(img.getAttribute("data-cover-from") || "");
    if (!endpoint) {
      img.setAttribute("data-cover-state", "empty");
      return;
    }
    fetch(endpoint)
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        var src = thumbnailFromQuery(data);
        if (!src) {
          img.setAttribute("data-cover-state", "empty");
          return;
        }
        img.onload = function () {
          img.setAttribute("data-cover-state", "ready");
        };
        img.onerror = function () {
          img.setAttribute("data-cover-state", "empty");
        };
        img.src = src;
      })
      .catch(function () {
        img.setAttribute("data-cover-state", "empty");
      });
  }

  function observeCovers() {
    var covers = document.querySelectorAll(".media-card-cover");
    if (!covers.length) return;
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(covers, function (cover) {
        loadCover(cover.querySelector("img"));
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          loadCover(entry.target.querySelector("img"));
        });
      },
      { rootMargin: "240px 0px" }
    );
    Array.prototype.forEach.call(covers, function (cover) {
      observer.observe(cover);
    });
  }
})();
