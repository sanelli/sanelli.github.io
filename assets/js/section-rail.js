(function () {
  function init() {
    var nav = document.querySelector("[data-section-rail]");
    if (!nav) return;

    var mobileQuery = window.matchMedia("(max-width: 1023px)");
    var collapsible = nav.hasAttribute("data-section-rail-collapsible");
    var storageKey = "section-rail-open:" + location.pathname;
    var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (link) {
        return document.getElementById((link.getAttribute("href") || "").slice(1));
      })
      .filter(Boolean);

    if (!sections.length) return;

    var toggle = null;

    if (collapsible) {
      var linksWrap = document.createElement("div");
      linksWrap.className = "section-rail-links";
      linksWrap.id = "section-rail-links-" + Math.random().toString(36).slice(2, 9);
      links.forEach(function (link) {
        linksWrap.appendChild(link);
      });

      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "section-rail-toggle";
      toggle.setAttribute("aria-controls", linksWrap.id);
      toggle.innerHTML =
        '<span class="section-rail-toggle-label"></span>' +
        '<svg class="icon icon-sort-down section-rail-toggle-icon section-rail-toggle-icon--expand" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#icon-sort-down"></use></svg>' +
        '<svg class="icon icon-sort-up section-rail-toggle-icon section-rail-toggle-icon--collapse" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#icon-sort-up"></use></svg>';

      nav.textContent = "";
      nav.appendChild(toggle);
      nav.appendChild(linksWrap);
      links = Array.prototype.slice.call(linksWrap.querySelectorAll("a[href^='#']"));
    }

    function readStoredExpanded() {
      try {
        return sessionStorage.getItem(storageKey) === "1";
      } catch (error) {
        return false;
      }
    }

    function storeExpanded(expanded) {
      try {
        sessionStorage.setItem(storageKey, expanded ? "1" : "0");
      } catch (error) {
        /* ignore */
      }
    }

    function isExpanded() {
      return !collapsible || nav.classList.contains("section-rail--expanded");
    }

    function setExpanded(expanded) {
      if (!collapsible) return;

      nav.classList.toggle("section-rail--expanded", expanded);
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.setAttribute("aria-label", expanded ? "Collapse section menu" : "Expand section menu");
      if (mobileQuery.matches) storeExpanded(expanded);
      syncMobilePosition();
    }

    function syncToggleLabel() {
      if (!collapsible || !toggle) return;

      var current = links.find(function (link) {
        return link.classList.contains("is-current") || link.hasAttribute("aria-current");
      });
      var label = toggle.querySelector(".section-rail-toggle-label");
      if (!label) return;

      if (current && !current.hidden) {
        var sectionLabel = current.querySelector(".section-rail-label");
        label.textContent = sectionLabel ? sectionLabel.textContent.trim() : current.textContent.trim();
      } else {
        var fallback = nav.getAttribute("aria-label") || "Sections";
        label.textContent = fallback.replace(/\s+sections$/i, "").trim() || "Sections";
      }
    }

    function syncMobilePosition() {
      if (!mobileQuery.matches) {
        nav.style.removeProperty("top");
        nav.style.removeProperty("max-height");
        return;
      }

      var gap = 10;
      var floor = 12;
      var top = floor;

      var siteHeader = document.querySelector(".site-header");
      if (siteHeader) {
        top = Math.max(top, siteHeader.getBoundingClientRect().bottom + gap);
      }

      var pageHeader = document.querySelector(".post-header");
      if (pageHeader) {
        top = Math.max(top, pageHeader.getBoundingClientRect().bottom + gap);
      }

      var searchToolbar = document.querySelector(".media-toolbar");
      if (searchToolbar) {
        var searchTop = searchToolbar.getBoundingClientRect().top;
        if (searchTop > floor) {
          top = Math.max(top, searchTop);
        }
      }

      nav.style.top = top + "px";
      if (isExpanded()) {
        nav.style.maxHeight = "min(70vh, calc(100vh - " + (top + 12) + "px))";
      } else {
        nav.style.removeProperty("max-height");
      }
    }

    function setCurrent(id) {
      links.forEach(function (link) {
        var on = id && link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-current", on);
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      syncToggleLabel();
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

    if (toggle) {
      toggle.addEventListener("click", function () {
        if (!mobileQuery.matches) return;
        setExpanded(!nav.classList.contains("section-rail--expanded"));
      });
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

    function onViewportChange() {
      if (collapsible) {
        if (mobileQuery.matches) {
          setExpanded(readStoredExpanded());
        } else {
          nav.classList.remove("section-rail--expanded");
          toggle.setAttribute("aria-expanded", "false");
          nav.style.removeProperty("max-height");
          syncMobilePosition();
        }
      } else {
        syncMobilePosition();
      }
      sync();
    }

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", onViewportChange);
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", onViewportChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(onViewportChange);
    }
    var searchInput = document.querySelector(".media-search");
    var ratingSelect = document.querySelector(".media-rating-filter");
    if (searchInput) searchInput.addEventListener("input", sync);
    if (ratingSelect) ratingSelect.addEventListener("change", sync);

    onViewportChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
