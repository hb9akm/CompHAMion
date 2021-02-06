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
        hb9akm.pages.maps.relais.forEach(function(el, idx) {
            if (el.status != "qrv") {
                return;
            }
            relaisPositions.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([
                    el.longitude,
                    el.latitude
                ])),
                name: el.qthName,
                id: idx
            }));
        });
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: relaisPositions
            })
        });
        hb9akm.pages.maps.map.addLayer(layer);

        const popup_el = document.querySelector("div.maps.popup");
        var popup = new ol.Overlay({
            element: popup_el,
            positioning: "bottom-center",
            stopEvent: false
        });
        hb9akm.pages.maps.map.addOverlay(popup);
        hb9akm.pages.maps.map.on("singleclick", function(ev) {
            var features = [];
            hb9akm.pages.maps.map.forEachFeatureAtPixel(
                ev.pixel,
                function(feature, layer) {
                    features.push(feature);
                    //return feature;
                }
            );
            if (features.length) {
                document.querySelectorAll(".repeater:not(.template)").forEach(function(el) {
                    el.parentNode.removeChild(el);
                });
                var geometry = features[0].getGeometry();
                var coord = geometry.getCoordinates();
                popup.setPosition(coord);
                popup_el.classList.add("visible");
                const repeaterTemplate = document.querySelector("div.maps.popup .repeater.template");
                features.forEach(function(el, index) {
                    const myTemplate = repeaterTemplate.cloneNode(true);
                    myTemplate.classList.remove("template");
                    const repeater = hb9akm.pages.maps.relais[el.values_.id];
                    myTemplate.querySelector(".name").innerHTML = repeater.qthName;
                    myTemplate.querySelector(".modes").innerHTML = repeater.modes.map(function(el) { return el.type; }).join(", ");
                    myTemplate.querySelector(".freq").innerHTML = repeater.qrgTx;
                    popup_el.appendChild(myTemplate);
                });
            } else if (popup_el.classList.contains("visible")) {
                popup_el.classList.remove("visible");
            } else {
                hb9akm.geo.changeToLonLat(ol.proj.toLonLat(ev.coordinate));
            }
        });
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
