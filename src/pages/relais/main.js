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
function addSpan(par, cls, text) {
    const span = document.createElement("span");
    span.classList.add(cls);
    span.innerHTML = text;
    //span.append(document.createTextNode(text));
    par.append(span);
}
hb9akm.pages.relais = {
    load: function(initial) {
        if (initial) {
            hb9akm.geo.registerCurrentLocationChangeListener(function(currentLocation) {
                document.querySelector("section.relais.search input").value = hb9akm.geo.lonLat2Locator(currentLocation);
                document.querySelector("section.relais.list ul").innerHTML = "";
                hb9akm.pages.relais.refreshTable();
            });
            document.querySelector("section.relais.search input").addEventListener("keyup", function(ev) {
                if (ev.key != "Enter") {
                    return;
                }
                hb9akm.geo.changeToFuzzyFind(ev.target.value);
            });
            hb9akm.ajax.get(
                "https://api.hb9akm.ch/v1/repeater",
                function(xhr) {
                    hb9akm.pages.relais.relais = JSON.parse(xhr.responseText);

                    document.querySelectorAll("section.relais.filter input").forEach(function(el, index) {
                        el.addEventListener("change", function() {
                            document.querySelector("section.relais.list ul").innerHTML = "";
                            hb9akm.pages.relais.refreshTable();
                        });
                    });
                    hb9akm.geo.getCurrentLonLat(function(currentLonLat) {
                        hb9akm.pages.relais.refreshTable();
                    });
                },
                function(xhr) {
                    hb9akm.messages.error(xhr.status);
                }
            );
            return;
        }
        hb9akm.pages.relais.refreshTable();
    },
    calculateDistance(pointA, pointB) {
        var lat1 = pointA[1];
        const lon1 = pointA[0];
        var lat2 = pointB[1];
        const lon2 = pointB[0];
        const R = 6371; // km
        const dLat = (lat2-lat1) * Math.PI / 180;
        const dLon = (lon2-lon1) * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        return d.toFixed(1);
    },
    refreshTable: function() {
        var relais = hb9akm.pages.relais.relais;

        const currentLonLat = hb9akm.geo.currentLonLat;

        document.querySelector("section.relais.search input").value = hb9akm.geo.lonLat2Locator(currentLonLat);
        // add computed props
        relais.forEach(function(el, index) {
            if (el.longitude == "NULL") {
                relais[index].distance = 9999;
                return;
            }
            relais[index].distance = hb9akm.pages.relais.calculateDistance(
                currentLonLat,
                [
                    el.longitude,
                    el.latitude
                ]
            );
        });

        // filter
        relais = relais.filter(function(el) {
            return document.querySelector(
                'section.relais.filter input[id="band_' + formatBand(getBand(el.qrgTx)) + '"]:checked'
            );
        });

        // sort by distance
        relais = relais.sort(function(a, b) {
            return a.distance - b.distance;
        });

        const list = document.querySelector("section.relais.list ul");
        relais.forEach(function(el, index) {
            if (el.status != "qrv") {
                return;
            }
            const repeater = document.createElement("li");
            addSpan(repeater, "title", el.qthName);
            addSpan(repeater, "band", formatBand(getBand(el.qrgTx)));
            addSpan(repeater, "locator", el.qthLocator);
            addSpan(repeater, "locator2", hb9akm.geo.lonLat2Locator([
                el.longitude,
                el.latitude
            ]));
            addSpan(repeater, "distance", "&#8960; " + el.distance + "km");
            addSpan(
                repeater,
                "freq",
                "TX&#402;: " + el.qrgTx + " MHz<br>" +
                "&Delta;RX&#402;: " + (el.qrgTx - el.qrgRx).toFixed(2) + " MHz"
            );
            addSpan(repeater, "remarks", el.remarks);
            list.append(repeater);
        });
    }
}
