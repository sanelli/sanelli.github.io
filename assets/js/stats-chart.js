(function () {
  var root = document.querySelector("[data-stats-chart]");
  var table = document.querySelector("[data-stats-table]");
  if (!root || !table) return;

  var canvas = root.querySelector(".stats-chart-canvas");
  var legend = root.querySelector(".stats-chart-legend");
  if (!canvas || !legend) return;

  var SERIES_COLORS = {
    Books: "#f4b942",
    Music: "#f472b6",
    Games: "#fb923c",
    Movies: "#a78bfa",
    Trips: "#38bdf8",
    Posts: "#e07a5f"
  };

  var FALLBACK_COLORS = ["#6ea8e0", "#34d399", "#ef4444", "#e879f9", "#4ade80", "#fc3c44"];
  var SERIES_STORAGE_KEY = "stats-yearly-series";
  var visible = Object.create(null);
  var cachedData = null;

  function shortLabel(header) {
    var text = (header || "").trim();
    var map = {
      "Books read": "Books",
      "Music listened": "Music",
      "Games played": "Games",
      "Movies watched": "Movies",
      "Trips taken": "Trips",
      Posts: "Posts"
    };
    return map[text] || text;
  }

  function colorFor(label, index) {
    return SERIES_COLORS[label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  }

  function readCss(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function parseTable() {
    var headCells = Array.prototype.slice.call(table.querySelectorAll("thead th"));
    var seriesLabels = headCells.slice(1).map(function (th) {
      return shortLabel(th.textContent);
    });

    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr")).map(function (tr) {
      var cells = Array.prototype.slice.call(tr.querySelectorAll("td"));
      var year = (cells[0] && cells[0].textContent.trim()) || "";
      var values = cells.slice(1).map(function (td) {
        var raw = td.textContent.trim();
        if (!raw) return 0;
        var n = parseInt(raw, 10);
        return isNaN(n) ? 0 : n;
      });
      return { year: year, values: values };
    }).filter(function (row) {
      return row.year;
    });

    // Table is newest-first; chart reads left-to-right chronologically.
    rows.reverse();

    return { seriesLabels: seriesLabels, rows: rows };
  }

  function ensureVisibleDefaults(seriesLabels) {
    seriesLabels.forEach(function (label) {
      if (typeof visible[label] !== "boolean") visible[label] = true;
    });
  }

  function activeSeries(seriesLabels) {
    return seriesLabels.filter(function (label) {
      return visible[label];
    });
  }

  function storeVisibleSeries() {
    try {
      sessionStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(visible));
    } catch (err) {
      /* ignore */
    }
  }

  function restoreVisibleSeries(seriesLabels) {
    try {
      var stored = JSON.parse(sessionStorage.getItem(SERIES_STORAGE_KEY));
      if (!stored || typeof stored !== "object") return;
      seriesLabels.forEach(function (label) {
        if (typeof stored[label] === "boolean") visible[label] = stored[label];
      });
    } catch (err) {
      /* ignore */
    }
    if (!activeSeries(seriesLabels).length) {
      seriesLabels.forEach(function (label) {
        visible[label] = true;
      });
    }
  }

  function maxValue(data, activeIndexes) {
    var max = 0;
    data.rows.forEach(function (row) {
      activeIndexes.forEach(function (seriesIndex) {
        var n = row.values[seriesIndex] || 0;
        if (n > max) max = n;
      });
    });
    return max;
  }

  function niceMax(value) {
    if (value <= 0) return 1;
    var exp = Math.pow(10, Math.floor(Math.log10(value)));
    var scaled = value / exp;
    var nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
    return nice * exp;
  }

  function buildLegend(seriesLabels) {
    legend.innerHTML = seriesLabels
      .map(function (label, index) {
        var on = visible[label];
        var color = colorFor(label, index);
        return (
          '<li>' +
          '<button type="button" class="stats-chart-legend-toggle' +
          (on ? "" : " is-off") +
          '" data-series="' +
          label +
          '" aria-pressed="' +
          (on ? "true" : "false") +
          '" title="' +
          (on ? "Hide " : "Show ") +
          label +
          '">' +
          '<span class="stats-chart-legend-swatch" style="background:' +
          color +
          '"></span>' +
          label +
          "</button>" +
          "</li>"
        );
      })
      .join("");
  }

  function buildChart(data) {
    ensureVisibleDefaults(data.seriesLabels);
    buildLegend(data.seriesLabels);

    var activeIndexes = [];
    data.seriesLabels.forEach(function (label, index) {
      if (visible[label]) activeIndexes.push(index);
    });

    if (!activeIndexes.length) {
      canvas.innerHTML = '<p class="stats-chart-empty">Select at least one category.</p>';
      return;
    }

    var width = 640;
    var height = 280;
    var pad = { top: 16, right: 16, bottom: 36, left: 36 };
    var plotW = width - pad.left - pad.right;
    var plotH = height - pad.top - pad.bottom;
    var years = data.rows.map(function (row) {
      return row.year;
    });
    var yMax = niceMax(maxValue(data, activeIndexes));
    var xCount = Math.max(years.length - 1, 1);

    function xAt(i) {
      return pad.left + (years.length === 1 ? plotW / 2 : (i / xCount) * plotW);
    }

    function yAt(v) {
      return pad.top + plotH - (v / yMax) * plotH;
    }

    var gridColor = readCss("--border", "#444");
    var axisColor = readCss("--text-muted", "#9a9a9a");
    var labelColor = readCss("--text-muted", "#9a9a9a");

    var parts = [];
    parts.push(
      '<svg class="stats-chart-svg" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" width="100%" height="100%" role="presentation" focusable="false">'
    );

    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var value = (yMax / ticks) * t;
      var y = yAt(value);
      parts.push(
        '<line class="stats-chart-grid" x1="' +
          pad.left +
          '" y1="' +
          y +
          '" x2="' +
          (width - pad.right) +
          '" y2="' +
          y +
          '" stroke="' +
          gridColor +
          '" stroke-width="1" />'
      );
      parts.push(
        '<text class="stats-chart-tick" x="' +
          (pad.left - 8) +
          '" y="' +
          (y + 3) +
          '" text-anchor="end" fill="' +
          labelColor +
          '" font-size="11">' +
          Math.round(value) +
          "</text>"
      );
    }

    years.forEach(function (year, i) {
      var x = xAt(i);
      parts.push(
        '<text class="stats-chart-tick" x="' +
          x +
          '" y="' +
          (height - 12) +
          '" text-anchor="middle" fill="' +
          labelColor +
          '" font-size="11">' +
          year +
          "</text>"
      );
    });

    parts.push(
      '<line x1="' +
        pad.left +
        '" y1="' +
        (pad.top + plotH) +
        '" x2="' +
        (width - pad.right) +
        '" y2="' +
        (pad.top + plotH) +
        '" stroke="' +
        axisColor +
        '" stroke-width="1.25" />'
    );
    parts.push(
      '<line x1="' +
        pad.left +
        '" y1="' +
        pad.top +
        '" x2="' +
        pad.left +
        '" y2="' +
        (pad.top + plotH) +
        '" stroke="' +
        axisColor +
        '" stroke-width="1.25" />'
    );

    activeIndexes.forEach(function (seriesIndex) {
      var label = data.seriesLabels[seriesIndex];
      var color = colorFor(label, seriesIndex);
      var points = data.rows
        .map(function (row, i) {
          return xAt(i) + "," + yAt(row.values[seriesIndex] || 0);
        })
        .join(" ");

      parts.push(
        '<polyline class="stats-chart-line" fill="none" stroke="' +
          color +
          '" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" points="' +
          points +
          '" />'
      );

      data.rows.forEach(function (row, i) {
        var v = row.values[seriesIndex] || 0;
        parts.push(
          '<circle class="stats-chart-point" cx="' +
            xAt(i) +
            '" cy="' +
            yAt(v) +
            '" r="3.25" fill="' +
            color +
            '"><title>' +
            label +
            " " +
            row.year +
            ": " +
            v +
            "</title></circle>"
        );
      });
    });

    parts.push("</svg>");
    canvas.innerHTML = parts.join("");
  }

  function loadData() {
    if (!cachedData) cachedData = parseTable();
    return cachedData;
  }

  function render() {
    var data = loadData();
    buildChart(data);
  }

  cachedData = parseTable();
  ensureVisibleDefaults(cachedData.seriesLabels);
  restoreVisibleSeries(cachedData.seriesLabels);

  legend.setAttribute("aria-label", "Toggle categories");
  legend.addEventListener("click", function (event) {
    var button = event.target.closest("[data-series]");
    if (!button || !legend.contains(button)) return;
    var label = button.getAttribute("data-series");
    if (!label || typeof visible[label] !== "boolean") return;

    if (visible[label] && activeSeries(cachedData.seriesLabels).length === 1) return;

    visible[label] = !visible[label];
    storeVisibleSeries();
    render();
  });

  render();

  var themeObserver = new MutationObserver(render);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
