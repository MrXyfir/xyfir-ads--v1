import db = require("../../lib/db");

export = {

    /*
        GET api/pub/sites
        RETURN
            {sites: [site, site]}
    */
    sites: (req, res) => {
        db(cn => {
            cn.query("SELECT site FROM pubs", (err, rows) => {
                cn.release();

                var sites: string[];
                for (var row in rows) {
                    sites.push(row.site);
                }

                res.json({ sites: sites });
            });;
        });
    }

};