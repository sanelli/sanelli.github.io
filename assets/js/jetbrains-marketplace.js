(function () {
  var nodes = document.querySelectorAll("[data-marketplace-widget]");
  if (!nodes.length || typeof MarketplaceWidget === "undefined") return;

  Array.prototype.forEach.call(nodes, function (node) {
    var mode = node.getAttribute("data-marketplace-widget") || "card";
    var pluginId = Number(node.getAttribute("data-marketplace-plugin"));
    if (!pluginId || !node.id) return;
    MarketplaceWidget.setupMarketplaceWidget(mode, pluginId, "#" + node.id);
  });
})();
