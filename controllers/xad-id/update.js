const secret = require("config").keys.xadid;
const db = require("lib/db");

/*
    PUT api/xad-id/:xacc/:xad
    REQUIRED
        secret: string, info: json-string
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Updates info object-string where xacc and xad
        *All validation is done by Xyfir Accounts
*/
module.exports = function(req, res) {
    
    let sql;

    res.append("Access-Control-Allow-Origin", true);

    if (secret != req.body.secret) {
        res.json({ error: true, message: "Invalid secret key" });
    }
    else if (req.body.info == undefined) {
        res.json({ error: true, message: "Info property is required" });
    }
    else {
        sql = "UPDATE xad_ids SET info = ? WHERE xad_id = ? AND xacc_uid = ?";
        db(cn => cn.query(sql, [req.body.info, req.params.xad, req.params.xacc], (err, result) => {
            cn.release();

            if (err || !result.affectedRows)
                res.json({ error: true, message: "An unknown error occured-" });
            else
                res.json({ error: false, message: "Ad profile updated successfully" });
        }));
    }

}