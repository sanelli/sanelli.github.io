(function () {
  function init() {
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
