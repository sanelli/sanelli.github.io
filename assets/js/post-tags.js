(function () {
  var select = document.querySelector("[data-posts-tag-filter]");
  if (!select) return;
  select.addEventListener("change", function () {
    window.location.assign(select.value);
  });
})();
