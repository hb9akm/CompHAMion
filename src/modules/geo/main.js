hb9akm.geo = {
    _onload: function() {
    },
    _init: true,
    currentLonLat: [37.41, 8.82],
    getCurrentLonLat(callback, noCache) {
        if (!navigator.geolocation) {
            return hb9akm.geo.currentLonLat;
        }
        if (!noCache && !hb9akm.geo._init) {
            return callback(hb9akm.geo.currentLonLat);
        }
        navigator.geolocation.getCurrentPosition(function(coords) {
            hb9akm.geo.currentLonLat = [
                coords.coords.longitude,
                coords.coords.latitude
            ];
            callback(hb9akm.geo.currentLonLat);
            hb9akm.geo._init = false;
        });
    },
    lonLat2Locator: function(lonlat) {
        var lon = lonlat[0] + 180;
        var lat = lonlat[1] + 90;
        const fieldIndexLon = lon / 20;
        const fieldIndexLat = lat / 10;
        lon = lon % 20;
        lat = lat % 10;
        const squareIndexLon = lon / 2;
        const squareIndexLat = lat / 1;
        const subSquareIndexLon = lon % 2 / 0.083333;
        const subSquareIndexLat = lat % 1 / 0.0416665;
        return String.fromCharCode(65 + fieldIndexLon) +
            String.fromCharCode(65 + fieldIndexLat) +
            (squareIndexLon.toFixed() - 1) +
            (squareIndexLat.toFixed() - 1) +
            String.fromCharCode(65 + subSquareIndexLon) +
            String.fromCharCode(65 + subSquareIndexLat);
    },
    locator2lonLat: function(locator) {
        const fieldIndexLon = locator.charCodeAt(0) - 65;
        const fieldIndexLat = locator.charCodeAt(1) - 65;
        const squareIndexLon = locator[2];
        const squareIndexLat = locator[3];
        const subSquareIndexLon = locator.charCodeAt(4) - 65;
        const subSquareIndexLat = locator.charCodeAt(5) - 65;
        var lon = (subSquareIndexLon / 12) + (1/24);
        lon += squareIndexLon * 2;
        console.log(lon);
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
    }
}
