const db = require("lib/db");

/*
    GET api/pub/info
    REQUIRED
        ids: string
    DESCRIPTION
        Return public info regarding pub campaigns
    RETURN
        { "id": { site: string } }
*/
module.exports = function(req, res) {
        
    let sql = "SELECT id, site FROM pubs WHERE id IN (?)";

    db(cn => cn.query(sql, [req.query.ids.split(',')], (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({});
        }
        else {
            let response = {};

            rows.forEach(row => {
                response[row] = row;
            })

            res.json(response);
        }
    }));

}