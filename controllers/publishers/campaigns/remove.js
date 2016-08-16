const db = require("lib/db");

/*
    DELETE api/publishers/campaigns/:id
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Deletes campaign, reports, and pending clicks
        All pending/confirmed earnings are lost
*/
module.exports = function(req, res) {
    
    let sql;

    sql = "DELETE FROM pubs WHERE id = ? AND owner = ?";
    db(cn => cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
        cn.release();

        if (err || !result.affectedRows)
            res.json({ error: true, message: "An unknown error occured" });
        else
            res.json({ error: false, message: "Campaign successfully deleted" });
    }));

}