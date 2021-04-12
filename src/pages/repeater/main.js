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
hb9akm.pages.repeater = {
    load: function(initial) {
        if (initial) {
            hb9akm.geo.registerCurrentLocationChangeListener(function(currentLocation) {
                document.querySelector("section.repeater.search input").value = hb9akm.geo.lonLat2Locator(currentLocation);
                document.querySelector("section.repeater.list ul").innerHTML = "";
                hb9akm.pages.repeater.refreshTable();
            });
            document.querySelector("section.repeater.search input").addEventListener("keyup", function(ev) {
                if (ev.key != "Enter") {
                    return;
                }
                hb9akm.geo.changeToFuzzyFind(ev.target.value);
            });
            hb9akm.ajax.get(
                "https://api.hb9akm.ch/v1/repeater",
                function(xhr) {
                    hb9akm.pages.repeater.repeater = JSON.parse(xhr.responseText);

                    document.querySelectorAll("section.repeater.filter input").forEach(function(el, index) {
                        el.addEventListener("change", function() {
                            document.querySelector("section.repeater.list ul").innerHTML = "";
                            hb9akm.pages.repeater.refreshTable();
                        });
                    });
                    hb9akm.geo.getCurrentLonLat(function(currentLonLat) {
                        hb9akm.pages.repeater.refreshTable();
                    });
                },
                function(xhr) {
                    hb9akm.messages.error(xhr.status);
                }
            );
            return;
        }
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
        var repeater = hb9akm.pages.repeater.repeater;

        const currentLonLat = hb9akm.geo.currentLonLat;

        document.querySelector("section.repeater.search input").value = hb9akm.geo.lonLat2Locator(currentLonLat);
        // add computed props
        repeater.forEach(function(el, index) {
            if (el.longitude == "NULL") {
                repeater[index].distance = 9999;
                return;
            }
            repeater[index].distance = hb9akm.pages.repeater.calculateDistance(
                currentLonLat,
                [
                    el.longitude,
                    el.latitude
                ]
            );
        });

        // filter
        var selectedModes = [];
        document.querySelectorAll('section.repeater.filter input.mode').forEach(function(el) {
            if (!el.checked) {
                return;
            }
            selectedModes.push(el.id.substr(5).toUpperCase());
        });
        var selectedTypes = [];
        document.querySelectorAll('section.repeater.filter input.typ').forEach(function(el) {
            if (!el.checked) {
                return;
            }
            selectedTypes.push(el.id.substr(5).toLowerCase());
        });
        repeater = repeater.filter(function(el) {
            var found = false;
            if (el.status != "qrv") {
                return false;
            }
            el.modes.every(function(mode) {
                if (selectedModes.indexOf(mode.type) != -1) {
                    found = true;
                    return false;
                }
                return true;
            });
            return found && selectedTypes.indexOf(el.type) != -1 && document.querySelector(
                'section.repeater.filter input[id="band_' + formatBand(getBand(el.qrgTx)) + '"]:checked'
            );
        });

        // sort by distance
        repeater = repeater.sort(function(a, b) {
            return a.distance - b.distance;
        });

        const list = document.querySelector("section.repeater.list ul");
        repeater.forEach(function(el, index) {
            const repeater = document.createElement("li");
            addSpan(
                repeater,
                "title",
                el.qthName + "<br>" +
                    formatBand(getBand(el.qrgTx))
            );
            addSpan(
                repeater,
                "locator",
                hb9akm.geo.lonLat2Locator([
                    el.longitude,
                    el.latitude
                ]) + "<br>" +
                    el.country + "<br>" +
                    "&#8960; " + el.distance + "km"
            );
            //addSpan(repeater, "locator2", el.country);
            //addSpan(repeater, "distance", "&#8960; " + el.distance + "km");
            addSpan(
                repeater,
                "freq",
                "TX&#402;: " + el.qrgTx + " MHz<br>" +
                    "RX&#402;: " + el.qrgRx + " MHz<br>" +
                    "&Delta;&#402;: " + (el.qrgRx - el.qrgTx).toFixed(2) + " MHz"
            );
            addSpan(repeater, "remarks", el.remarks);
            list.append(repeater);
        });
    }
}
