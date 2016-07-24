const geoip = require("geoip-lite");

// Automatically updates db in memory when files update
geoip.startWatchingDataUpdate();

module.exports = function(ip) {
    
    const geo = geoip.lookup(ip);

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