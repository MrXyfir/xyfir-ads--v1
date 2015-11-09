var rand = require("../rand");
module.exports = function (id, cn, fn) {
    var sql;
    // Grab info needed for price modules
    sql = "SELECT ad_type, pay_type, ct_categories FROM ads WHERE id = ?";
    cn.query(sql, [id], function (err, rows) {
        if (err || rows.length == 0) {
            fn(true);
            return;
        }
        // Pass info to price module and receive bid info
        require("price")(rows[0].ad_type, rows[0].pay_type, rows[0].ct_categories, function (info) {
            var bid;
            // Bid will be average +- up to 5%
            if (rand(1, 5) > 1) {
                if (rand(0, 2) == 0)
                    bid = info.average + (info.average * (rand(1, 6) / 100));
                else
                    bid = info.average - (info.average * (rand(1, 6) / 100));
            }
            else {
                bid = info.average;
            }
            // Set bid cost for campaign
            sql = "UPDATE ads SET cost = ? WHERE id = ?";
            cn.query(sql, [bid, id], function (err, result) { return fn(err); });
        });
    });
};
//# sourceMappingURL=autobid.js.map