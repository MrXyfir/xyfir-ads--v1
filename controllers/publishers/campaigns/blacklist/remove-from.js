const db = require("lib/db");

/*
    DELETE api/publishers/campaigns/:id/blacklist/:ad
    RETURN
        { error: bool }
    DESCRIPTION
        Remove :ad from :id pub ad blacklist
*/
module.exports = function(req, res) {
    
    let sql = `DELETE FROM ads_blacklisted WHERE pub_id = ? AND ad_id = ?`;
    let vars = [req.params.id, req.params.ad];

    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));
    
}