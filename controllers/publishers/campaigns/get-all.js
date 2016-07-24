const crypto = require("crypto");
const db = require("lib/db");

/*
    GET api/publishers/campaigns
    RETURN
        {campaigns: [
            { id: number, name: string, site: string, type: number }
        ]}
    DESCRIPTION
        Returns basic information for all of publisher's campaigns
*/
module.exports = function(req, res) {
    
    let sql = "SELECT id, name, site, type FROM pubs WHERE owner = ?";

    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();

        if (err || rows.length == 0)
            res.json({ campaigns: [] });
        else
            res.json({ campaigns: rows });
    }));
    
}