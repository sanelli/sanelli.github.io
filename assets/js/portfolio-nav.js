(function () {
  var nav = document.querySelector("[data-portfolio-nav]");
  if (!nav) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
  var sections = links
    .map(function (link) {
      return document.getElementById((link.getAttribute("href") || "").slice(1));
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setCurrent(id) {
    links.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function sync() {
    var marker = Math.min(180, window.innerHeight * 0.28);
    var current = sections[0].id;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= marker) current = section.id;
    });
    setCurrent(current);
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = (link.getAttribute("href") || "").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      setCurrent(id);
    });
  });

  window.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();
})();
