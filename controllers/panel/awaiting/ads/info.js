const db = require("lib/db");

/*
    GET api/panel/awaiting/ads/:id
    RETURN
        { entire ads table row }
    DESCRIPTION
        Return all info for ad
*/
module.exports = function(req, res) {
    
    let sql = `
        SELECT * FROM ads WHERE id = ? AND approved = 0 AND ended = 0
    `;
    db(cn => cn.query(sql, [req.params.id], (err, rows) => {
        cn.release();
        res.json(rows[0]);
    }));

}