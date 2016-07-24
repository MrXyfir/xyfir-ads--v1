const db = require("lib/db");

/*
    GET api/pub/sites
    RETURN
        { sites: string[] }
    DESCRIPTION
        Return all sites linked to pub campaigns
*/
module.exports = function(req, res) {
        
    db(cn => cn.query("SELECT site FROM pubs", (err, rows) => {
        cn.release();

        let sites = [];
        for (let i = 0; i < rows.length; i++) {
            sites.push(rows[i].site);
        }

        res.json({ sites });
    }));

}