const randomstring = require("randomstring");
const db = require("lib/db");

/*
    PUT api/publishers/campaigns/:id/test
    RETURN
        { key: string }
    DESCRIPTION
        Generates a new test key
*/
module.exports = function(req, res) {
    
    db(cn => {

        const key = randomstring.generate(10);
        const sql = "UPDATE pubs SET test = ? WHERE id = ? AND owner = ?";

        cn.query(sql, [key, req.params.id, req.session.uid], (err, result) => {
            cn.release();

            if (err || !result.affectedRows)
                res.json({ key: "" });
            else
                res.json({ key });
        });
    });

}