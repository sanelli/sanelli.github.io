(function () {
  function promoteDataSort(table) {
    Array.prototype.forEach.call(table.querySelectorAll("td"), function (td) {
      if (td.hasAttribute("data-sort")) return;
      var tagged = td.querySelector("[data-sort]");
      if (tagged) {
        td.setAttribute("data-sort", tagged.getAttribute("data-sort") || "");
      }
    });
  }

  function markNumberColumns(table) {
    var headerRow = table.tHead
      ? table.tHead.rows[table.tHead.rows.length - 1]
      : table.rows[0];
    if (!headerRow) return;

    Array.prototype.forEach.call(headerRow.cells, function (th) {
      var label = (th.textContent || "").trim().toLowerCase();
      if (label === "year" || label === "rating") {
        th.setAttribute("data-sort-method", "number");
      }
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("table.media-table"), function (table) {
      if (table.rows.length < 2) return;
      table.classList.add("sortable");
      promoteDataSort(table);
      markNumberColumns(table);
      new Tablesort(table);
    });

    var searchInput = document.querySelector(".media-search");
    var ratingSelect = document.querySelector(".media-rating-filter");
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (ratingSelect) ratingSelect.addEventListener("change", applyFilters);
  });
})();
