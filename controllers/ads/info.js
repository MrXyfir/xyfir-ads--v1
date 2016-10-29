const db = require("lib/db");

/*
    GET api/ad/info
    REQUIRED
        ids: number
    DESCRIPTION
        Return public info regarding ad campaigns
    RETURN
        { "id": { title: string } }
*/
module.exports = function(req, res) {
        
        let sql = `
            SELECT id, ad_title as title FROM ads WHERE id IN (?)
        `;

        db(cn => cn.query(sql, [req.query.ids.split(',')], (err, rows) => {
            cn.release();

            if (err || !rows.length) {
                res.json({});
            }
            else {
                let response = {};

                rows.forEach(row => {
                    response[row.id] = row;
                })

                res.json(response);
            }
        }));

};