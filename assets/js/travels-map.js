(function () {
  var mapEl = document.getElementById("travels-map");
  if (!mapEl || typeof L === "undefined") return;

  var visitsNode = document.getElementById("travels-map-visits");
  var coordsNode = document.getElementById("travels-map-coords");
  if (!visitsNode || !coordsNode) return;

  var visits;
  var coords;
  try {
    visits = JSON.parse(visitsNode.textContent);
    coords = JSON.parse(coordsNode.textContent);
  } catch (err) {
    return;
  }

  var months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function parseDay(iso) {
    return parseInt(iso.slice(8, 10), 10);
  }

  function formatVisitRange(start, end) {
    if (!start) return "";
    var startMonth = months[parseInt(start.slice(5, 7), 10) - 1];
    var startYear = start.slice(0, 4);
    var startDay = parseDay(start);
    if (!end || end === start) {
      return startMonth + " " + startDay + ", " + startYear;
    }
    var endMonth = months[parseInt(end.slice(5, 7), 10) - 1];
    var endYear = end.slice(0, 4);
    var endDay = parseDay(end);
    if (startYear === endYear && startMonth === endMonth) {
      return startMonth + " " + startDay + "\u2013" + endDay + ", " + startYear;
    }
    if (startYear === endYear) {
      return startMonth + " " + startDay + " \u2013 " + endMonth + " " + endDay + ", " + startYear;
    }
    return startMonth + " " + startDay + ", " + startYear + " \u2013 " + endMonth + " " + endDay + ", " + endYear;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function groupedVisits() {
    var groups = Object.create(null);
    visits.forEach(function (visit) {
      if (!visit.place) return;
      if (!groups[visit.place]) groups[visit.place] = [];
      groups[visit.place].push(visit);
    });
    Object.keys(groups).forEach(function (place) {
      groups[place].sort(function (a, b) {
        return (b.start || "").localeCompare(a.start || "");
      });
    });
    return groups;
  }

  function isDarkTheme() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") return false;
    if (theme === "dark") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function tileUrl() {
    return isDarkTheme()
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }

  var groups = groupedVisits();
  var map = L.map(mapEl, {
    scrollWheelZoom: false,
    worldCopyJump: true
  });

  var tileLayer = L.tileLayer(tileUrl(), {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: "travels-map-pin",
    html: "<span></span>",
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });

  var homeIcon = L.divIcon({
    className: "travels-map-home",
    html: '<svg class="icon icon-home" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-home"></use></svg>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  var dublin = L.latLng(53.3498, -6.2603);
  var bounds = L.latLngBounds([]);
  bounds.extend(dublin);
  Object.keys(groups).forEach(function (place) {
    var point = coords[place];
    if (!point || point.lat == null || point.lng == null) return;
    var latLng = L.latLng(point.lat, point.lng);
    bounds.extend(latLng);

    var periods = groups[place]
      .map(function (visit) {
        return "<li>" + escapeHtml(formatVisitRange(visit.start, visit.end)) + "</li>";
      })
      .join("");

    var popup =
      '<div class="travels-map-popup">' +
      '<p class="travels-map-popup-title">' + escapeHtml(place) + "</p>" +
      '<ul class="travels-map-popup-periods">' + periods + "</ul>" +
      "</div>";

    L.marker(latLng, { icon: pinIcon })
      .addTo(map)
      .bindPopup(popup, { className: "travels-map-popup-wrap", maxWidth: 260 });
  });

  L.marker(dublin, { icon: homeIcon, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup(
      '<div class="travels-map-popup">' +
      '<p class="travels-map-popup-title">Dublin</p>' +
      '<p class="travels-map-popup-home">Home</p>' +
      "</div>",
      { className: "travels-map-popup-wrap", maxWidth: 260 }
    );

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.12));
  } else {
    map.setView([30, 0], 2);
  }

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
        tileLayer.setUrl(tileUrl());
      }, 0);
    });
  }

  window.setTimeout(function () {
    map.invalidateSize();
  }, 0);
})();
