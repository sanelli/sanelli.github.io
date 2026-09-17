(function () {
  var root = document.querySelector("[data-stats-release-chart]");
  var dataNode = document.getElementById("stats-release-data");
  if (!root || !dataNode) return;

  var canvas = root.querySelector(".stats-chart-canvas");
  var legend = root.querySelector(".stats-chart-legend");
  var groupSelect = root.querySelector("[data-stats-release-group]");
  if (!canvas || !legend || !groupSelect) return;

  var SERIES = ["Books", "Music", "Games", "Movies"];
  var SERIES_COLORS = {
    Books: "#f4b942",
    Music: "#f472b6",
    Games: "#fb923c",
    Movies: "#a78bfa"
  };
  var GROUP_STORAGE_KEY = "stats-release-group";
  var SERIES_STORAGE_KEY = "stats-release-series";
  var ALLOWED_GROUPS = { 1: true, 5: true, 10: true, 25: true, 50: true };
  var visible = { Books: true, Music: true, Games: true, Movies: true };

  function readCss(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function markerFor(entry) {
    var marker = entry.title || "";
    if (entry.unique === "title" && entry.subtitles && entry.subtitles.indexOf("DLC") !== -1) {
      marker = marker + "::DLC::" + entry.subtitles.join("::");
    }
    return marker;
  }

  function bucketStart(year, size) {
    return Math.floor(year / size) * size;
  }

  function bucketLabel(start, size) {
    if (size === 1) return String(start);
    return start + "–" + (start + size - 1);
  }

  function activeSeries() {
    return SERIES.filter(function (label) {
      return visible[label];
    });
  }

  function readGroupSize() {
    var raw = parseInt(groupSelect.value, 10);
    return ALLOWED_GROUPS[raw] ? raw : 5;
  }

  function storeGroupSize(size) {
    try {
      sessionStorage.setItem(GROUP_STORAGE_KEY, String(size));
    } catch (err) {
      /* ignore */
    }
  }

  function restoreGroupSize() {
    try {
      var stored = parseInt(sessionStorage.getItem(GROUP_STORAGE_KEY), 10);
      if (ALLOWED_GROUPS[stored]) {
        groupSelect.value = String(stored);
      }
    } catch (err) {
      /* ignore */
    }
  }

  function storeVisibleSeries() {
    try {
      sessionStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(visible));
    } catch (err) {
      /* ignore */
    }
  }

  function restoreVisibleSeries() {
    try {
      var stored = JSON.parse(sessionStorage.getItem(SERIES_STORAGE_KEY));
      if (!stored || typeof stored !== "object") return;
      SERIES.forEach(function (label) {
        if (typeof stored[label] === "boolean") visible[label] = stored[label];
      });
      if (!activeSeries().length) {
        SERIES.forEach(function (label) {
          visible[label] = true;
        });
      }
    } catch (err) {
      /* ignore */
    }
  }

  function emptyBucket(start, size) {
    return {
      start: start,
      label: bucketLabel(start, size),
      Books: 0,
      Music: 0,
      Games: 0,
      Movies: 0,
      total: 0
    };
  }

  function fillEmptyBuckets(byBucket, size) {
    var starts = Object.keys(byBucket).map(function (key) {
      return parseInt(key, 10);
    });
    if (!starts.length) return [];

    starts.sort(function (a, b) {
      return a - b;
    });

    var filled = [];
    for (var start = starts[0]; start <= starts[starts.length - 1]; start += size) {
      filled.push(byBucket[start] || emptyBucket(start, size));
    }
    return filled;
  }

  function aggregate(entries, size, series) {
    var byBucket = Object.create(null);
    var seen = Object.create(null);
    var seriesSet = Object.create(null);
    series.forEach(function (label) {
      seriesSet[label] = true;
    });

    entries.forEach(function (entry) {
      var year = parseInt(entry.year, 10);
      if (!year || isNaN(year)) return;
      if (!seriesSet[entry.kind]) return;

      var key = entry.kind + "|" + year + "|" + markerFor(entry);
      if (entry.unique === "title") {
        if (seen[key]) return;
        seen[key] = true;
      }

      var start = bucketStart(year, size);
      if (!byBucket[start]) {
        byBucket[start] = emptyBucket(start, size);
      }
      byBucket[start][entry.kind] += 1;
      byBucket[start].total += 1;
    });

    return fillEmptyBuckets(byBucket, size);
  }

  function niceMax(value) {
    if (value <= 0) return 1;
    var exp = Math.pow(10, Math.floor(Math.log10(value)));
    var scaled = value / exp;
    var nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
    return nice * exp;
  }

  function buildLegend(series) {
    legend.innerHTML = SERIES.map(function (label) {
      var on = visible[label];
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
        SERIES_COLORS[label] +
        '"></span>' +
        label +
        "</button>" +
        "</li>"
      );
    }).join("");
  }

  function buildChart(rows, series) {
    buildLegend(series);

    if (!series.length) {
      canvas.innerHTML = '<p class="stats-chart-empty">Select at least one category.</p>';
      return;
    }

    if (!rows.length) {
      canvas.innerHTML = '<p class="stats-chart-empty">No release-year data yet.</p>';
      return;
    }

    var barSlot = rows.length <= 12 ? 36 : rows.length <= 24 ? 24 : 18;
    var pad = { top: 16, right: 18, bottom: 62, left: 36 };
    var height = 300;
    var plotH = height - pad.top - pad.bottom;
    var plotW = Math.max(rows.length * barSlot, 320);
    var width = pad.left + plotW + pad.right;
    var yMax = niceMax(
      rows.reduce(function (max, row) {
        return row.total > max ? row.total : max;
      }, 0)
    );

    function xCenter(i) {
      return pad.left + (i + 0.5) * (plotW / rows.length);
    }

    function barWidth() {
      return Math.max(4, (plotW / rows.length) * 0.68);
    }

    function yAt(v) {
      return pad.top + plotH - (v / yMax) * plotH;
    }

    var gridColor = readCss("--border", "#444");
    var axisColor = readCss("--text-muted", "#9a9a9a");
    var labelColor = readCss("--text-muted", "#9a9a9a");
    var bw = barWidth();

    var labelEvery = 1;
    if (rows.length > 48) labelEvery = 4;
    else if (rows.length > 32) labelEvery = 2;

    var parts = [];
    parts.push(
      '<svg class="stats-chart-svg" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" width="' +
        width +
        '" height="100%" role="presentation" focusable="false">'
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

    rows.forEach(function (row, i) {
      var x = xCenter(i) - bw / 2;
      var stacked = 0;

      series.forEach(function (label) {
        var count = row[label] || 0;
        if (!count) return;
        var y0 = yAt(stacked);
        stacked += count;
        var y1 = yAt(stacked);
        var h = Math.max(0, y0 - y1);
        parts.push(
          '<rect class="stats-chart-bar" x="' +
            x +
            '" y="' +
            y1 +
            '" width="' +
            bw +
            '" height="' +
            h +
            '" fill="' +
            SERIES_COLORS[label] +
            '"><title>' +
            row.label +
            " — " +
            label +
            ": " +
            count +
            " (total " +
            row.total +
            ")</title></rect>"
        );
      });

      if (i % labelEvery === 0 || i === rows.length - 1) {
        var labelX = xCenter(i);
        var labelY = pad.top + plotH + 10;
        parts.push(
          '<text class="stats-chart-tick stats-chart-tick--x" x="' +
            labelX +
            '" y="' +
            labelY +
            '" text-anchor="end" fill="' +
            labelColor +
            '" font-size="10" transform="rotate(-40 ' +
            labelX +
            " " +
            labelY +
            ')">' +
            row.label +
            "</text>"
        );
      }
    });

    parts.push("</svg>");
    canvas.innerHTML = parts.join("");
    canvas.style.minWidth = width + "px";
  }

  var cachedEntries = null;

  function loadEntries() {
    if (cachedEntries) return cachedEntries;
    try {
      cachedEntries = JSON.parse(dataNode.textContent);
    } catch (err) {
      cachedEntries = [];
    }
    return cachedEntries;
  }

  function render() {
    var series = activeSeries();
    buildChart(aggregate(loadEntries(), readGroupSize(), series), series);
  }

  restoreGroupSize();
  restoreVisibleSeries();

  groupSelect.addEventListener("change", function () {
    storeGroupSize(readGroupSize());
    render();
  });

  legend.addEventListener("click", function (event) {
    var button = event.target.closest("[data-series]");
    if (!button || !legend.contains(button)) return;
    var label = button.getAttribute("data-series");
    if (!SERIES_COLORS[label]) return;

    var turningOff = visible[label];
    if (turningOff && activeSeries().length === 1) return;

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
