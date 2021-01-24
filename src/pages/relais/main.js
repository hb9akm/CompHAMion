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
            hb9akm.ajax.get(
                "/api/v1/repeater/",
                function(xhr) {
                    hb9akm.pages.relais.relais = JSON.parse(xhr.responseText);
                    console.log(hb9akm.pages.relais.relais[0]);

                    document.querySelectorAll("section.relais.filter input").forEach(function(el, index) {
                        el.addEventListener("change", function() {
                            document.querySelector("section.relais.list ul").innerHTML = "";
                            hb9akm.pages.relais.refreshTable();
                        });
                    });
                    hb9akm.pages.relais.refreshTable();
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

        hb9akm.geo.getCurrentLonLat(function(currentLonLat) {
            // add computed props
            relais.forEach(function(el, index) {
                if (el.lon == "NULL") {
                    relais[index].distance = 9999;
                    return;
                }
                relais[index].distance = hb9akm.pages.relais.calculateDistance(
                    currentLonLat,
                    [
                        el.lon,
                        el.lat
                    ]
                );
            });

            // filter
            relais = relais.filter(function(el) {
                return document.querySelector(
                    'section.relais.filter input[id="band_' + formatBand(getBand(el["QRG TX"])) + '"]:checked'
                );
            });

            // sort by distance
            // todo: calculate distance
            relais = relais.sort(function(a, b) {
                return a.distance - b.distance;
                return getBand(a["QRG TX"]) - getBand(b["QRG TX"]);
            });

            const list = document.querySelector("section.relais.list ul");
            relais.forEach(function(el, index) {
                if (el.Status != 1) {
                    return;
                }
                const repeater = document.createElement("li");
                addSpan(repeater, "title", el.QTH);
                addSpan(repeater, "band", formatBand(getBand(el["QRG TX"])));
                addSpan(repeater, "locator", el.Locator);
                addSpan(repeater, "locator2", hb9akm.geo.lonLat2Locator([
                    el.lon,
                    el.lat
                ]));
                addSpan(repeater, "distance", "&#8960; " + el.distance + "km");
                addSpan(
                    repeater,
                    "freq",
                    "TX&#402;: " + el["QRG TX"] + " MHz<br>" +
                    "&Delta;RX&#402;: " + (el["QRG TX"] - el["QRG RX"]).toFixed(2) + " MHz"
                );
                addSpan(repeater, "remarks", el.Remarks);
                list.append(repeater);
            });
        });
    }
}