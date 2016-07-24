const secret = require("config").secrets.xadid;
const db = require("lib/db");

/*
    GET api/xad-id/:xacc/:xad
    REQUIRED
        secret: string
    RETURN
        { info: json-string }
    DESCRIPTION
        Returns stringified info JSON object where xacc and xad
*/
module.exports = function(req, res) {
    
    let sql;

    res.append("Access-Control-Allow-Origin", true);

    if (secret != req.query.secret) {
        res.json({ error: true });
        return;
    }

    sql = "SELECT info FROM xad_ids WHERE xad_id = ? AND xacc_uid = ?";
    db(cn => cn.query(sql, [req.params.xad, req.params.xacc], (err, rows) => {
        cn.release();

        if (err || !rows.length) res.json({ info: "" });
        else res.json({ info: rows[0].info });
    }));

}