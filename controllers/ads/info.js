const db = require("lib/db");

/*
    GET api/ad/info
    REQUIRED
        id: number
    DESCRIPTION
        Return public info regarding ad campaign
    RETURN
        { title: string }
*/
module.exports = function(req, res) {
        
        const sql = "SELECT ad_titile FROM ads WHERE id = ?";

        db(cn => cn.query(sql, [req.query.id], (err, rows) => {
            cn.release();

            if (err || !rows.length)
                res.json({ title: "Unknown" });
            else
                res.json({ title: rows[0].site });
        }));

};