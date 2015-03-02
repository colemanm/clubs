var featureList, clubSearch = []

data = "https://web.fulcrumapp.com/shares/82982e4c55707a34.geojson";

L.mapbox.accessToken = 'pk.eyJ1IjoiY29sZW1hbm0iLCJhIjoieW8wN2lTNCJ9.j1zlDeYFSVAl8XWjaHY-5w';
var map = L.mapbox.map('map', 'colemanm.lbd40ge4').setView([48, 13], 4);;

// var clubs = L.geoJson(null, {
//   style: function (feature) {
//     return {
//       color: "red",
//       fill: false,
//       opacity: 1,
//       clickable: false
//     };
//   },
//   onEachFeature: function (feature, layer) {
//     clubSearch.push({
//       name: layer.feature.properties.name,
//       source: "Clubs",
//       id: L.stamp(layer)
//     });
//   }
// });
// $.getJSON(data, function (data) {
//   clubs.addData(data);
// });

var featureLayer = L.mapbox.featureLayer(data)
    .addTo(map);

syncSidebar();

var list = document.getElementById("feature-list");


/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through layer and add only features which are in the map bounds */
  featureLayer.eachLayer(function (layer) {
    if (map.hasLayer(featureLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src=""></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });

  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  // featureList.sort("feature-name", {
  //   order: "asc"
  // });
}

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to boroughs bounds */
  // map.fitBounds(clubs.getBounds());
  // featureList = new List("features", {valueNames: ["feature-name"]});
  // featureList.sort("feature-name", {order:"asc"});

  var clubsBH = new Bloodhound({
    name: "Clubs",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: clubSearch,
    limit: 10
  });

  clubsBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Clubs",
    displayKey: "name",
    source: clubsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Clubs</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Clubs") {
      map.fitBounds(datum.bounds);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
