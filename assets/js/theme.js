(function () {
  var order = ["dark", "light", "system"];
  var labels = { dark: "Dark", light: "Light", system: "System" };
  var root = document.documentElement;
  var button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  function current() {
    var theme = root.getAttribute("data-theme");
    return order.indexOf(theme) >= 0 ? theme : "dark";
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (err) {
        /* private mode */
      }
    }
    button.setAttribute("data-theme-current", theme);
    button.setAttribute("aria-label", "Color theme: " + labels[theme] + ". Click to switch.");
    var label = button.querySelector(".theme-switch-label");
    if (label) label.textContent = labels[theme];
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var bg = getComputedStyle(root).getPropertyValue("--bg").trim();
      if (bg) meta.setAttribute("content", bg);
    }
  }

  apply(current(), false);
  button.addEventListener("click", function () {
    apply(order[(order.indexOf(current()) + 1) % order.length], true);
  });
})();
