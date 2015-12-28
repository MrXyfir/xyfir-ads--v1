/// <reference path="../typings/geoip-lite/geoip-lite.d.ts" />
/// <reference path="../typings/controllers/click.d.ts" />

import geoip = require("geoip-lite");

// Automatically updates db in memory when files update
geoip.startWatchingDataUpdate();

export = (ip: string): IGeo => {
    var geo = geoip.lookup(ip);

    if (geo != null) {
        return {
            country: geo.country,
            region: geo.region
        };
    }
    else {
        return {
            country: "US",
            region: "CA"
        };
    }
};