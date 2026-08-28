(function () {
  var mapEl = document.getElementById("stats-countries-map");
  if (!mapEl || typeof L === "undefined") return;

  var dataNode = document.getElementById("stats-countries-map-data");
  if (!dataNode) return;

  var visited;
  try {
    visited = JSON.parse(dataNode.textContent);
  } catch (err) {
    return;
  }

  var worldUrl = mapEl.getAttribute("data-world-url");
  var extraUrl = mapEl.getAttribute("data-extra-url");
  if (!worldUrl) return;

  function colorForIndex(index) {
    return "hsl(" + ((index * 137.508) % 360).toFixed(1) + ", 62%, 52%)";
  }

  function applyLegendColors() {
    Array.prototype.forEach.call(document.querySelectorAll(".stats-countries-legend-swatch"), function (swatch) {
      var index = parseInt(swatch.getAttribute("data-color-index"), 10);
      if (isNaN(index)) return;
      swatch.style.backgroundColor = colorForIndex(index);
    });
  }

  var visitedByGeo = Object.create(null);
  visited.forEach(function (entry) {
    visitedByGeo[entry.geoName] = entry;
  });

  function isDarkTheme() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") return false;
    if (theme === "dark") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncTileTheme() {
    mapEl.classList.toggle("map-tiles-dark", isDarkTheme());
  }

  function styleFeature(feature) {
    var name = feature.properties && feature.properties.name;
    var entry = name ? visitedByGeo[name] : null;
    if (entry) {
      var color = colorForIndex(entry.colorIndex);
      return {
        fillColor: color,
        fillOpacity: 0.72,
        color: color,
        weight: 1,
        opacity: 0.95
      };
    }
    return {
      fillColor: isDarkTheme() ? "#2a2a2a" : "#ddd8d0",
      fillOpacity: 0.55,
      color: isDarkTheme() ? "#444" : "#c8c2b8",
      weight: 0.6,
      opacity: 0.7
    };
  }

  var geoLayers = [];

  function refreshCountryStyles() {
    geoLayers.forEach(function (group) {
      group.eachLayer(function (featureLayer) {
        if (featureLayer.feature) {
          featureLayer.setStyle(styleFeature(featureLayer.feature));
        }
      });
    });
  }

  function bindFeature(feature, layer) {
    var name = feature.properties && feature.properties.name;
    var entry = name ? visitedByGeo[name] : null;
    if (!entry) return;
    layer.bindTooltip(entry.label, {
      sticky: true,
      direction: "top",
      className: "stats-countries-tooltip"
    });
  }

  function setInitialView() {
    var bounds = L.latLngBounds(
      L.latLng(12, -128),
      L.latLng(70, 38)
    );
    map.fitBounds(bounds, { animate: false, padding: [12, 12] });
  }

  var map = L.map(mapEl, {
    scrollWheelZoom: false,
    worldCopyJump: false,
    minZoom: 2,
    attributionControl: true,
    zoomControl: true
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  syncTileTheme();

  function addGeoJson(geojson) {
    var layer = L.geoJSON(geojson, {
      style: styleFeature,
      onEachFeature: bindFeature
    }).addTo(map);
    geoLayers.push(layer);
  }

  applyLegendColors();

  Promise.all([
    fetch(worldUrl).then(function (res) { return res.json(); }),
    extraUrl ? fetch(extraUrl).then(function (res) { return res.json(); }) : Promise.resolve(null)
  ]).then(function (results) {
    if (results[0]) addGeoJson(results[0]);
    if (results[1]) addGeoJson(results[1]);
    setInitialView();
    window.setTimeout(function () {
      map.invalidateSize();
      setInitialView();
    }, 0);
  }).catch(function () {
    setInitialView();
  });

  mapEl.addEventListener("mouseenter", function () {
    map.scrollWheelZoom.enable();
  });
  mapEl.addEventListener("mouseleave", function () {
    map.scrollWheelZoom.disable();
  });

  var themeButton = document.querySelector("[data-theme-toggle]");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      window.setTimeout(function () {
        syncTileTheme();
        refreshCountryStyles();
      }, 0);
    });
  }
})();
