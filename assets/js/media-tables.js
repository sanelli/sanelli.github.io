(function () {
  var pageIndex = 0;
  var pageUnits = [];
  var pageSize = 0;
  var pageMode = ""; // "month" | "year"
  var pagePagination = null;
  var hasBacklogPage = false;

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

  function formatUnitLabel(unit) {
    if (pageMode === "year") {
      var section = document.getElementById("year-" + unit);
      var heading = section && section.querySelector("h2");
      if (heading) return heading.textContent.trim();
      return unit;
    }
    return formatMonthLabel(unit);
  }

  function rowUnit(row) {
    var month = row.getAttribute("data-month") || "";
    if (!month) return "";
    if (pageMode === "year") return month.slice(0, 4);
    return month;
  }

  function collectPageUnits() {
    if (pageMode === "year") {
      var numeric = [];
      var other = [];
      Array.prototype.forEach.call(document.querySelectorAll(".media-section[id^='year-']"), function (section) {
        var label = section.id.replace(/^year-/, "");
        if (!label || label === "backlog") return;
        if (/^\d{4}$/.test(label)) numeric.push(label);
        else other.push(label);
      });
      pageUnits = numeric.sort().reverse().concat(other.sort());
      return;
    }

    var seen = {};
    Array.prototype.forEach.call(document.querySelectorAll("tr.media-row[data-month]"), function (row) {
      var unit = rowUnit(row);
      if (unit) seen[unit] = true;
    });
    pageUnits = Object.keys(seen).sort().reverse();
  }

  function sectionUnit(section) {
    var id = section.id || "";
    if (id.indexOf("year-") === 0) return id.slice(5);
    return "";
  }

  function yearPageCount() {
    if (!pageSize || !pageUnits.length) return 0;
    return Math.ceil(pageUnits.length / pageSize);
  }

  function pageCount() {
    var years = yearPageCount();
    if (!years && !hasBacklogPage) return 0;
    return years + (hasBacklogPage ? 1 : 0);
  }

  function isBacklogPage() {
    return hasBacklogPage && pageIndex === pageCount() - 1;
  }

  function unitsForPage() {
    if (!pageSize || isBacklogPage()) return [];
    var start = pageIndex * pageSize;
    return pageUnits.slice(start, start + pageSize);
  }

  function paginationLayout() {
    if (pageMode === "month") {
      return document.querySelector(".section-rail-layout[data-month-page-size]");
    }
    if (pageMode === "year") {
      return document.querySelector(".section-rail-layout[data-year-page-size]");
    }
    return null;
  }

  function ensurePagePagination() {
    if ((!pageSize && !hasBacklogPage) || pagePagination) return;
    var layout = paginationLayout();
    if (!layout) return;

    var nav = document.createElement("nav");
    nav.className = "pagination media-page-pagination";
    nav.setAttribute("aria-label", pageMode === "year" ? "Years" : "Months");
    nav.hidden = true;
    nav.innerHTML =
      '<span class="pagination-nav-group">' +
      '<button type="button" class="pagination-link" data-page-dir="first">First</button>' +
      '<button type="button" class="pagination-link" data-page-dir="newer">Newer</button>' +
      "</span>" +
      '<span class="pagination-pages"><span class="pagination-status" data-page-status></span></span>' +
      '<span class="pagination-nav-group">' +
      '<button type="button" class="pagination-link" data-page-dir="older">Older</button>' +
      '<button type="button" class="pagination-link" data-page-dir="last">Last</button>' +
      "</span>";

    var main = layout.querySelector(".section-rail-main");
    if (main) {
      main.appendChild(nav);
    } else {
      layout.appendChild(nav);
    }

    nav.addEventListener("click", function (event) {
      var button = event.target.closest("[data-page-dir]");
      if (!button || button.disabled || button.classList.contains("pagination-link--disabled")) return;
      var dir = button.getAttribute("data-page-dir");
      var total = pageCount();
      if (dir === "first") pageIndex = 0;
      else if (dir === "last") pageIndex = Math.max(0, total - 1);
      else if (dir === "older" && pageIndex < total - 1) pageIndex += 1;
      else if (dir === "newer" && pageIndex > 0) pageIndex -= 1;
      else return;
      applyFilters();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagePagination = nav;
  }

  function updatePagePagination(filtering) {
    ensurePagePagination();
    if (!pagePagination) return;

    var total = pageCount();
    var show = (pageSize > 0 || hasBacklogPage) && !filtering && total > 1;
    pagePagination.hidden = !show;
    if (!show) return;

    var status = pagePagination.querySelector("[data-page-status]");
    if (status) {
      if (isBacklogPage()) {
        status.textContent = "Backlog";
      } else {
        var currentUnits = unitsForPage();
        if (currentUnits.length === 0) {
          status.textContent = "";
        } else if (currentUnits.length === 1) {
          status.textContent = formatUnitLabel(currentUnits[0]);
        } else {
          status.textContent =
            formatUnitLabel(currentUnits[0]) + " – " + formatUnitLabel(currentUnits[currentUnits.length - 1]);
        }
      }
    }

    var atFirst = pageIndex <= 0;
    var atLast = pageIndex >= total - 1;
    [
      ['[data-page-dir="first"]', atFirst],
      ['[data-page-dir="newer"]', atFirst],
      ['[data-page-dir="older"]', atLast],
      ['[data-page-dir="last"]', atLast]
    ].forEach(function (entry) {
      var button = pagePagination.querySelector(entry[0]);
      if (!button) return;
      button.disabled = entry[1];
      button.classList.toggle("pagination-link--disabled", entry[1]);
    });
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
    var pageView = null;

    if (filtering) pageIndex = 0;

    if ((pageSize > 0 || hasBacklogPage) && !filtering) {
      if (isBacklogPage()) {
        pageView = { type: "backlog" };
      } else if (pageSize > 0) {
        pageView = { type: "years", units: unitsForPage() };
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll(".media-section"), function (section) {
      var anyVisible = false;
      var isCurrentSection = section.classList.contains("media-section--current");
      var isBacklogSection = section.id === "section-backlog";
      Array.prototype.forEach.call(section.querySelectorAll("tr.media-row"), function (row) {
        total += 1;
        var haystack = (row.getAttribute("data-search") || "").toLowerCase();
        var rating = parseInt(row.getAttribute("data-rating") || "", 10);
        var unit = rowUnit(row);
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRating = !ratings.length || (!isNaN(rating) && ratings.indexOf(rating) !== -1);
        var matchesPage = true;
        if (pageView) {
          if (pageView.type === "backlog") {
            matchesPage = isBacklogSection;
          } else if (isBacklogSection) {
            matchesPage = false;
          } else if (isCurrentSection) {
            matchesPage = pageIndex === 0;
          } else if (pageMode === "year") {
            var year = sectionUnit(section);
            matchesPage = Boolean(year && pageView.units.indexOf(year) !== -1);
          } else {
            matchesPage = Boolean(unit && pageView.units.indexOf(unit) !== -1);
          }
        }
        var show = matchesQuery && matchesRating && matchesPage;
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

    updatePagePagination(filtering);
    refreshMonthBreaks();
    notifyVisibilityChange();
    if (typeof window.applyTravelsMapFilter === "function") {
      window.applyTravelsMapFilter();
    }
  }

  window.getMediaRatingFilter = selectedRatings;

  document.addEventListener("DOMContentLoaded", function () {
    var monthLayout = document.querySelector(".section-rail-layout[data-month-page-size]");
    var yearLayout = document.querySelector(".section-rail-layout[data-year-page-size]");
    if (monthLayout) {
      pageMode = "month";
      pageSize = parseInt(monthLayout.getAttribute("data-month-page-size") || "", 10) || 0;
    } else if (yearLayout) {
      pageMode = "year";
      pageSize = parseInt(yearLayout.getAttribute("data-year-page-size") || "", 10) || 0;
    }
    hasBacklogPage = Boolean(document.getElementById("section-backlog"));
    if (pageSize > 0) collectPageUnits();

    var searchInput = document.querySelector(".media-search");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    initRatingCombo();
    observeCovers();

    if (pageSize > 0 || hasBacklogPage) applyFilters();
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
