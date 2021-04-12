function getBand(f) {
    var band = Math.floor(300 / f);
    if (band == 0) {
        band = Math.floor(3000 / f * 10);
        if (band > 60 && band < 71) {
            band = 70;
        }
        return band / 100;
    } else {
        return band;
    }
}
function formatBand(band) {
    if (band > 1) {
        return band + "m";
    } else {
        return band * 100 + "cm";
    }
}
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
                                    hb9akm.pages.maps.repeater = JSON.parse(xhr.responseText);
                                    hb9akm.filter.add({
                                        name: "voice-repeater",
                                        label: "Voice Repeater",
                                        sections: [
                                            {
                                                name: "bands",
                                                label: "Bands",
                                                type: "checkbox",
                                                values: {
                                                    "23cm": "23cm",
                                                    "70cm": "70cm",
                                                    "2m": "2m",
                                                    "5m": "5m",
                                                    "10m": "10m",
                                                }
                                            },
                                            {
                                                name: "modes",
                                                label: "Modes",
                                                type: "checkbox",
                                                values: {
                                                    "FM": "FM",
                                                    "NFM": "NFM",
                                                    "EL": "EchoLink",
                                                    "C4FM": "C4FM",
                                                    "D-STAR": "D-STAR",
                                                    "DMR": "DMR",
                                                    "NXDN": "NXDN",
                                                    "DPMR": "DPMR",
                                                    "APCO-25": "APCO-25",
                                                }
                                            }
                                        ]
                                    });
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
        hb9akm.filter.registerCallback("voice-repeater", hb9akm.pages.maps._updateFilters);
    },
    _updateFilters: function() {
        var selectedModes = hb9akm.filter.getFilterSectionStatus("voice-repeater", "modes");
        var selectedTypes = hb9akm.filter.getFilterSectionStatus("voice-repeater", "bands");
        hb9akm.pages.maps.repeater.forEach(function(el, idx) {
            if (el.status != "qrv") {
                return;
            }
            var found = false;
            el.modes.every(function(mode) {
                if (selectedModes[mode.type]) {
                    found = true;
                    return false;
                }
                return true;
            });
            if (found && !selectedTypes[formatBand(getBand(el.qrgTx))]) {
                found = false;
            }
            if (found) {
                hb9akm.pages.maps.repeaterFeature[idx].setStyle();
            } else {
                hb9akm.pages.maps.repeaterFeature[idx].setStyle(new ol.style.Style({}));
            }
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


        var repeaterPositions = []
        hb9akm.pages.maps.repeaterFeature = {};
        hb9akm.pages.maps.repeater.forEach(function(el, idx) {
            if (el.status != "qrv") {
                return;
            }
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([
                    el.longitude,
                    el.latitude
                ])),
                name: el.qthName,
                id: idx
            });
            hb9akm.pages.maps.repeaterFeature[idx] = feature;
            repeaterPositions.push(feature);
        });
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: repeaterPositions
            })
        });
        hb9akm.pages.maps.map.addLayer(layer);
        hb9akm.pages.maps._updateFilters();

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
                }
            );
            if (features.length) {
                document.querySelectorAll(".maps.popup .repeater:not(.template)").forEach(function(el) {
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
                    const repeater = hb9akm.pages.maps.repeater[el.values_.id];
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
