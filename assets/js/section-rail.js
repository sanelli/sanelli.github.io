(function () {
  function init() {
    var nav = document.querySelector("[data-section-rail]");
    if (!nav) return;

    var mobileQuery = window.matchMedia("(max-width: 759px)");
    var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (link) {
        return document.getElementById((link.getAttribute("href") || "").slice(1));
      })
      .filter(Boolean);

    if (!sections.length) return;

    function syncMobilePosition() {
      if (!mobileQuery.matches) {
        nav.style.removeProperty("top");
        nav.style.removeProperty("max-height");
        return;
      }

      var header = document.querySelector(".post-header");
      var gap = 10;
      var floor = 12;
      var top = floor;

      if (header) {
        var bottom = header.getBoundingClientRect().bottom;
        top = Math.max(floor, bottom + gap);
      }

      nav.style.top = top + "px";
      nav.style.maxHeight = "min(70vh, calc(100vh - " + (top + 12) + "px))";
    }

    function setCurrent(id) {
      links.forEach(function (link) {
        var on = id && link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-current", on);
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }

    function sync() {
      syncMobilePosition();

      links.forEach(function (link) {
        var target = document.getElementById((link.getAttribute("href") || "").slice(1));
        if (target) link.hidden = Boolean(target.hidden);
      });

      var visible = sections.filter(function (section) {
        return !section.hidden;
      });
      if (!visible.length) {
        setCurrent("");
        return;
      }

      var marker = Math.min(180, window.innerHeight * 0.28);
      var current = visible[0].id;
      visible.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      });
      setCurrent(current);
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = (link.getAttribute("href") || "").slice(1);
        var target = document.getElementById(id);
        if (!target || target.hidden) return;
        event.preventDefault();
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", "#" + id);
        setCurrent(id);
      });
    });

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", sync);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(sync);
    }
    var searchInput = document.querySelector(".media-search");
    var ratingSelect = document.querySelector(".media-rating-filter");
    if (searchInput) searchInput.addEventListener("input", sync);
    if (ratingSelect) ratingSelect.addEventListener("change", sync);
    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
