var db = require("../../lib/db");
module.exports = {
    /*
        GET api/pub/sites
        RETURN
            {sites: [site, site]}
    */
    sites: function (req, res) {
        db(function (cn) {
            cn.query("SELECT site FROM pubs", function (err, rows) {
                cn.release();
                var sites;
                for (var row in rows) {
                    sites.push(row.site);
                }
                res.json({ sites: sites });
            });
            ;
        });
    }
};
//# sourceMappingURL=pub.js.map