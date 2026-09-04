(function () {
  var triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("hidden", "");
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close image">&times;</button>' +
    '<img class="lightbox-image" alt="">';
  document.body.appendChild(overlay);

  var image = overlay.querySelector(".lightbox-image");
  var closeBtn = overlay.querySelector(".lightbox-close");
  var lastFocus = null;

  function open(src, alt) {
    lastFocus = document.activeElement;
    image.src = src;
    image.alt = alt || "";
    overlay.removeAttribute("hidden");
    document.documentElement.classList.add("lightbox-open");
    closeBtn.focus();
  }

  function close() {
    overlay.setAttribute("hidden", "");
    document.documentElement.classList.remove("lightbox-open");
    image.removeAttribute("src");
    image.alt = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  Array.prototype.forEach.call(triggers, function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      var src = trigger.getAttribute("href") || (trigger.querySelector("img") || {}).src;
      if (!src) return;
      var img = trigger.querySelector("img");
      open(src, img ? img.getAttribute("alt") : "");
    });
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.hasAttribute("hidden")) close();
  });
})();
