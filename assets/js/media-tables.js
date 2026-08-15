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

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("table"), function (table) {
      if (table.rows.length < 2) return;
      table.classList.add("sortable");
      promoteDataSort(table);
      markNumberColumns(table);
      new Tablesort(table);
    });
  });
})();
