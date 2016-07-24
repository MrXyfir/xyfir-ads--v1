const db = require("lib/db");

/*
    GET api/panel/awaiting/ads/:id
    RETURN
        { entire ads table row }
    DESCRIPTION
        Return all info for ad
*/
module.exports = function(req, res) {
    
    db(cn => cn.query("SELECT * FROM ads WHERE id = ? AND approved = 0", [req.params.id], (err, rows) => {
        cn.release();
        res.json(rows[0]);
    }));

}