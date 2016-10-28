const db = require("lib/db");

/*
    GET api/ad/search
    REQUIRED
        search: string
    DESCRIPTION
        Return matching ad campaigns
    RETURN
        {ads: [{
            id: number, title: string, description: string
        }]}
*/
module.exports = function(req, res) {
        
    let sql = `
        SELECT id, ad_title as title, ad_description as description
        FROM ads WHERE approved = 1 AND ended = 0 AND (
            ad_title LIKE ? OR ad_description LIKE ?
        )
    `, vars = [
        '%' + req.query.search + '%', '%' + req.query.search + '%'
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();
        res.json({ ads: err || !rows.length ? [] : rows });
    }));

};