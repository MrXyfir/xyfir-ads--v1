const db = require("lib/db");

/*
    GET api/publishers/campaigns/:id/blacklist
    RETURN
        {ads: [{
            id: number, title: string, description: string
        }]}
    DESCRIPTION
        Returns id, title, description for pub's blacklisted ads
*/
module.exports = function(req, res) {
    
    let sql = `
        SELECT id, ad_title as title, ad_description as description
        FROM ads WHERE id IN (
            SELECT ad_id FROM ads_blacklisted WHERE pub_id = ?
        )
    `;

    db(cn => cn.query(sql, [req.params.id], (err, rows) => {
        cn.release();
        res.json({ ads: err || !rows.length ? [] : rows });
    }));
    
}