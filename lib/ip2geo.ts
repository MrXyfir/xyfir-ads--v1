/// <reference path="../typings/geoip-lite/geoip-lite.d.ts" />
/// <reference path="../typings/controllers/click.d.ts" />

import geoip = require("geoip-lite");

export = (ip: string): IGeo => {
    var geo = geoip.lookup(ip);

    return {
        country: geo.country,
        region: geo.region
    };
};