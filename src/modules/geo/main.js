Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };
hb9akm.geo = {
    _onload: function() {
    },
    _init: true,
    currentLonLat: [37.41, 8.82],
    _currentLocationChangeListeners: [],
    registerCurrentLocationChangeListener: function(listener) {
        hb9akm.geo._currentLocationChangeListeners.push(listener);
    },
    _triggerCurrentLocationChange: function() {
        hb9akm.geo._currentLocationChangeListeners.forEach(function(el, index) {
            el(hb9akm.geo.currentLonLat);
        });
    },
    getCurrentLonLat(callback, noCache) {
        console.log("get current location");
        if (!navigator.geolocation) {
            console.log("no navigator");
            hb9akm.geo._triggerCurrentLocationChange();
            return hb9akm.geo.currentLonLat;
        }
        if (!noCache && !hb9akm.geo._init) {
            console.log("from cache");
            hb9akm.geo._triggerCurrentLocationChange();
            return callback(hb9akm.geo.currentLonLat);
        }
        console.log("getting position");
        navigator.geolocation.getCurrentPosition(
            function(coords) {
                console.log("position get");
                hb9akm.geo.currentLonLat = [
                    coords.coords.longitude,
                    coords.coords.latitude
                ];
                hb9akm.geo._triggerCurrentLocationChange();
                callback(hb9akm.geo.currentLonLat);
                hb9akm.geo._init = false;
            },
            function(error) {
                console.log("error, falling back to iplocation");
                hb9akm.ajax.get(
                    "https://ipinfo.io/geo",
                    function(xhr) {
                        const loc = JSON.parse(xhr.responseText).loc.split(',');
                        hb9akm.geo.currentLonLat = [
                            +(loc[1]),
                            +(loc[0])
                        ];
                        console.log("success");
                        hb9akm.geo._triggerCurrentLocationChange();
                        hb9akm.geo._init = false;
                        return callback(hb9akm.geo.currentLonLat);
                    },
                    function(xhr) {
                        console.log("error, use fallback");
                        hb9akm.geo._triggerCurrentLocationChange();
                        hb9akm.geo._init = false;
                        return callback(hb9akm.geo.currentLonLat);
                    }
                );
            }
        );
    },
    lonLat2Locator: function(lonlat) {
        var lon = lonlat[0] + 180;
        var lat = lonlat[1] + 90;
        const fieldIndexLon = lon / 20 + 65;
        const fieldIndexLat = lat / 10 + 65;
        lon = Math.fmod(lon, 20);
        lat = Math.fmod(lat, 10);
        const squareIndexLon = lon / 2;
        const squareIndexLat = lat / 1;
        const subSquareIndexLon = Math.fmod(lon, 2) / 0.083333;
        const subSquareIndexLat = Math.fmod(lat, 1) / 0.0416665;
        return String.fromCharCode(fieldIndexLon) +
            String.fromCharCode(fieldIndexLat) +
            (squareIndexLon.toFixed() - 1) +
            (squareIndexLat.toFixed() - 1) +
            String.fromCharCode(65 + subSquareIndexLon).toLowerCase() +
            String.fromCharCode(65 + subSquareIndexLat).toLowerCase();
    },
    locator2lonLat: function(locator) {
        locator = locator.toUpperCase();
        const fieldIndexLon = (locator.charCodeAt(0) - 65).toFixed();
        const fieldIndexLat = (locator.charCodeAt(1) - 65).toFixed();
        const squareIndexLon = locator[2];
        const squareIndexLat = locator[3];
        const subSquareIndexLon = locator.charCodeAt(4) - 65;
        const subSquareIndexLat = locator.charCodeAt(5) - 65;
        var lon = (subSquareIndexLon / 12) + (1/24);
        lon += squareIndexLon * 2;
        lon += fieldIndexLon * 20;
        lon -= 180;
        var lat = (subSquareIndexLat / 24) + (1/48);
        lat += squareIndexLat * 1;
        lat += fieldIndexLat * 10;
        lat -= 90;
        return [
            lon,
            lat
        ]
    },
    isMaidenhead: function(location) {
        const regex = /^[a-z]{2}[0-9]{2}(?:[a-z]{2}(?:[0-9]{2}(?:[a-z]{2})?)?)?$/i;
        return regex.test(location);
    },
    isCoordinates: function(location) {
        const regex = /^[0-9]+\.[0-9]+[,;\/][0-9]+\.[0-9]+/;
        return regex.test(location);
    },
    changeToFuzzyFind: function(location) {
        if (hb9akm.geo.isCoordinates(location)) {
            const loc = location.split(',');
            hb9akm.geo.currentLonLat = [
                +(loc[0]),
                +(loc[1])
            ];
            hb9akm.geo._triggerCurrentLocationChange();
            return;
        }
        if (hb9akm.geo.isMaidenhead(location)) {
            hb9akm.geo.currentLonLat = hb9akm.geo.locator2lonLat(location);
            hb9akm.geo._triggerCurrentLocationChange();
            return;
        }
        hb9akm.ajax.get(
            "https://nominatim.openstreetmap.org/search?format=json&q=" + location,
            function(xhr) {
                const res = JSON.parse(xhr.responseText);
                if (res.length == 0) {
                    hb9akm.messages.error("Could not find location");
                    return;
                }
                hb9akm.geo.currentLonLat = [
                    +(res[0].lon),
                    +(res[0].lat)
                ];
                hb9akm.geo._triggerCurrentLocationChange();
            },
            function(xhr) {
                hb9akm.messages.error("Could not find location");
            }
        );
    },
    changeToLonLat: function(lonLat) {
        hb9akm.geo.currentLonLat = [
            +(lonLat[0]),
            +(lonLat[1])
        ];
        hb9akm.geo._triggerCurrentLocationChange();
    }
}

