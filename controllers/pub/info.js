const db = require("lib/db");

/*
    GET api/pub/info
    REQUIRED
        id: number
    DESCRIPTION
        Return public info regarding pub campaign
    RETURN
        { site: string }
*/
module.exports = function(req, res) {
        
    let sql = "SELECT site FROM pubs WHERE id = ?";

    db(cn => cn.query(sql, [req.query.id], (err, rows) => {
        cn.release();

        if (err || !rows.length)
            res.json({ site: "Unknown" });
        else
            res.json({ site: rows[0].site });
    }));

}