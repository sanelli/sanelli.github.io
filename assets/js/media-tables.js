(function () {
  var monthPage = 0;
  var months = [];
  var monthPageSize = 0;
  var monthPagination = null;

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

  function notifyVisibilityChange() {
    document.dispatchEvent(new Event("media-visibility-change"));
  }

  function formatMonthLabel(ym) {
    var parts = ym.split("-");
    if (parts.length < 2) return ym;
    var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    if (isNaN(date.getTime())) return ym;
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  function collectMonths() {
    var seen = {};
    Array.prototype.forEach.call(document.querySelectorAll("tr.media-row[data-month]"), function (row) {
      var month = row.getAttribute("data-month") || "";
      if (month) seen[month] = true;
    });
    months = Object.keys(seen).sort().reverse();
  }

  function pageCount() {
    if (!monthPageSize || !months.length) return 0;
    return Math.ceil(months.length / monthPageSize);
  }

  function monthsForPage() {
    if (!monthPageSize) return months;
    var start = monthPage * monthPageSize;
    return months.slice(start, start + monthPageSize);
  }

  function ensureMonthPagination() {
    if (!monthPageSize || monthPagination) return;
    var layout = document.querySelector(".section-rail-layout[data-month-page-size]");
    if (!layout) return;

    var nav = document.createElement("nav");
    nav.className = "pagination media-month-pagination";
    nav.setAttribute("aria-label", "Months");
    nav.hidden = true;
    nav.innerHTML =
      '<button type="button" class="pagination-link" data-month-dir="newer">Newer</button>' +
      '<span class="pagination-pages"><span class="pagination-status" data-month-status></span></span>' +
      '<button type="button" class="pagination-link" data-month-dir="older">Older</button>';

    var main = layout.querySelector(".section-rail-main");
    if (main) {
      main.appendChild(nav);
    } else {
      layout.appendChild(nav);
    }

    nav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-month-dir]");
      if (!button || button.disabled || button.classList.contains("pagination-link--disabled")) return;
      var dir = button.getAttribute("data-month-dir");
      var total = pageCount();
      if (dir === "older" && monthPage < total - 1) monthPage += 1;
      if (dir === "newer" && monthPage > 0) monthPage -= 1;
      applyFilters();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    monthPagination = nav;
  }

  function updateMonthPagination(filtering) {
    ensureMonthPagination();
    if (!monthPagination) return;

    var total = pageCount();
    var show = monthPageSize > 0 && !filtering && total > 1;
    monthPagination.hidden = !show;
    if (!show) return;

    var pageMonths = monthsForPage();
    var status = monthPagination.querySelector("[data-month-status]");
    if (status) {
      if (pageMonths.length === 0) {
        status.textContent = "";
      } else if (pageMonths.length === 1) {
        status.textContent = formatMonthLabel(pageMonths[0]);
      } else {
        status.textContent =
          formatMonthLabel(pageMonths[0]) + " – " + formatMonthLabel(pageMonths[pageMonths.length - 1]);
      }
    }

    var newer = monthPagination.querySelector('[data-month-dir="newer"]');
    var older = monthPagination.querySelector('[data-month-dir="older"]');
    if (newer) {
      newer.disabled = monthPage <= 0;
      newer.classList.toggle("pagination-link--disabled", monthPage <= 0);
    }
    if (older) {
      older.disabled = monthPage >= total - 1;
      older.classList.toggle("pagination-link--disabled", monthPage >= total - 1);
    }
  }

  function selectedRatings() {
    var root = document.querySelector("[data-media-rating-filter]");
    if (!root) return [];
    return Array.prototype.map
      .call(root.querySelectorAll('input[type="checkbox"]:checked'), function (input) {
        return parseInt(input.value, 10);
      })
      .filter(function (value) {
        return !isNaN(value);
      });
  }

  function starsLabel(count) {
    var out = "";
    for (var i = 0; i < count; i++) out += "⭐️";
    return out;
  }

  function updateRatingSummary() {
    var root = document.querySelector("[data-media-rating-filter]");
    if (!root) return;
    var summary = root.querySelector(".media-rating-combo-summary");
    if (!summary) return;
    var selected = selectedRatings().slice().sort(function (a, b) {
      return b - a;
    });
    if (!selected.length) {
      summary.textContent = "All";
      return;
    }
    summary.textContent = selected.map(starsLabel).join(", ");
  }

  function setRatingMenuOpen(open) {
    var root = document.querySelector("[data-media-rating-filter]");
    if (!root) return;
    var toggle = root.querySelector(".media-rating-combo-toggle");
    var menu = root.querySelector(".media-rating-combo-menu");
    if (!toggle || !menu) return;
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
  }

  function initRatingCombo() {
    var root = document.querySelector("[data-media-rating-filter]");
    if (!root) return;

    var toggle = root.querySelector(".media-rating-combo-toggle");
    if (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        setRatingMenuOpen(!root.classList.contains("is-open"));
      });
    }

    root.addEventListener("change", function (event) {
      if (!event.target || event.target.type !== "checkbox") return;
      updateRatingSummary();
      applyFilters();
    });

    document.addEventListener("click", function (event) {
      if (!root.classList.contains("is-open")) return;
      if (root.contains(event.target)) return;
      setRatingMenuOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setRatingMenuOpen(false);
    });

    updateRatingSummary();
  }

  function applyFilters() {
    var searchInput = document.querySelector(".media-search");
    var status = document.querySelector(".media-filter-status");
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var ratings = selectedRatings();
    var filtering = Boolean(query || ratings.length);
    var visible = 0;
    var total = 0;
    var allowedMonths = null;

    if (monthPageSize > 0) {
      if (filtering) monthPage = 0;
      allowedMonths = filtering ? null : monthsForPage();
    }

    Array.prototype.forEach.call(document.querySelectorAll(".media-section"), function (section) {
      var anyVisible = false;
      Array.prototype.forEach.call(section.querySelectorAll("tr.media-row"), function (row) {
        total += 1;
        var haystack = (row.getAttribute("data-search") || "").toLowerCase();
        var rating = parseInt(row.getAttribute("data-rating") || "", 10);
        var month = row.getAttribute("data-month") || "";
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRating = !ratings.length || (!isNaN(rating) && ratings.indexOf(rating) !== -1);
        var matchesMonth = !allowedMonths || (month && allowedMonths.indexOf(month) !== -1);
        var show = matchesQuery && matchesRating && matchesMonth;
        row.hidden = !show;
        if (show) {
          anyVisible = true;
          visible += 1;
        }
      });
      section.hidden = !anyVisible;
    });

    if (status) {
      status.hidden = !filtering;
      status.textContent = filtering ? visible + " of " + total + " rows match." : "";
    }

    updateMonthPagination(filtering);
    refreshMonthBreaks();
    notifyVisibilityChange();
    if (typeof window.applyTravelsMapFilter === "function") {
      window.applyTravelsMapFilter();
    }
  }

  window.getMediaRatingFilter = selectedRatings;

  document.addEventListener("DOMContentLoaded", function () {
    var layout = document.querySelector(".section-rail-layout[data-month-page-size]");
    if (layout) {
      monthPageSize = parseInt(layout.getAttribute("data-month-page-size") || "", 10) || 0;
      if (monthPageSize > 0) collectMonths();
    }

    var searchInput = document.querySelector(".media-search");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    initRatingCombo();
    observeCovers();

    if (monthPageSize > 0) applyFilters();
  });

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
