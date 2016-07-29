const db = require("lib/db");

/*
    POST api/publishers/campaigns/:id/blacklist/:ad
    RETURN
        { error: bool }
    DESCRIPTION
        Add :ad to :id pub ad blacklist
*/
module.exports = function(req, res) {
    
    // Verify user owns pub campaign
    // Verify ad exists / is approved
    let sql = `
        SELECT (
            SELECT COUNT(*) FROM pubs WHERE id = ? AND owner = ?
        ) as owns_pub, (
            SELECT COUNT(*) FROM ads WHERE id = ? AND approved = 1
        ) as valid_ad
    `, vars = [
        req.params.id, req.session.uid,
        req.params.ad
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows[0].owns_pub || !rows[0].valid_ad) {
            cn.release();
            res.json({ error: true });
        }
        else {
            sql = `
                INSERT INTO ads_blacklisted (pub_id, ad_id) VALUES (
                    '${+req.params.id}', '${+req.params.ad}'
                )
            `;
            cn.query(sql, (err, result) => {
                cn.release();
                res.json({ error: !!err || !result.affectedRows });
            });
        }
    }));
    
}