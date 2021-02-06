hb9akm.pages.maps =  {
    load: function(initial) {
        if (!initial) {
            return;
        }
        hb9akm.pages.maps.addHeadElement(
            true,
            "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/css/ol.css",
            function() {
                hb9akm.pages.maps.addHeadElement(
                    false,
                    "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.5.0/build/ol.js",
                    function() {
                        hb9akm.geo.getCurrentLonLat(function(coords) {
                            hb9akm.ajax.get(
                                "https://api.hb9akm.ch/v1/repeater",
                                function(xhr) {
                                    hb9akm.pages.maps.relais = JSON.parse(xhr.responseText);
                                    hb9akm.pages.maps.loc = coords;
                                    hb9akm.pages.maps.init();
                                },
                                function(xhr) {
                                    hb9akm.messages.error(xhr.status);
                                }
                            );
                        });
                    }
                )
            }
        );
        hb9akm.geo.registerCurrentLocationChangeListener(function(currentLocation) {
            document.querySelector("section.maps.search input").value = hb9akm.geo.lonLat2Locator(currentLocation);
            if (!hb9akm.pages.maps.mapview) {
                return;
            }
            hb9akm.pages.maps.mapview.setCenter(ol.proj.fromLonLat(currentLocation));
            hb9akm.pages.maps.mapview.setZoom(9);
        });
        document.querySelector("section.maps.search input").addEventListener("keyup", function(ev) {
            if (ev.key != "Enter") {
                return;
            }
            hb9akm.geo.changeToFuzzyFind(ev.target.value);
        });
    },
    init: function() {
        hb9akm.pages.maps.mapview = new ol.View({
            center: ol.proj.fromLonLat(hb9akm.pages.maps.loc),
            zoom: 9
        });
        hb9akm.pages.maps.map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: hb9akm.pages.maps.mapview
        });


        var relaisPositions = []
        hb9akm.pages.maps.relais.forEach(function(el) {
            relaisPositions.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([
                    el.longitude,
                    el.latitude
                ])),
                name: el.qthName
            }));
        });
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: relaisPositions
            })
        });
        hb9akm.pages.maps.map.addLayer(layer);
    },
    addMarker: function(pos, label) {
    },
    addHeadElement: function(isStyle, url, callback) {
        var element;
        if (isStyle) {
            element = document.createElement("link");
            element.rel = "stylesheet";
            element.type = "text/css";
            element.href = url;
        } else {
            element = document.createElement("script");
            element.src = url;
        }
        element.onreadystatechange = callback;
        element.onload = callback;
        document.head.appendChild(element);
    }
}
