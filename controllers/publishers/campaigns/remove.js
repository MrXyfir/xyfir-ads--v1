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
        if (err || !result.affectedRows) {
            cn.release();
            res.json({ error: true, message: "An unkown error occured" });
            return;
        }

        sql = "DELETE FROM clicks WHERE pub_id = ?";
        cn.query(sql, [req.params.id], (err, result) => {

            sql = "DELETE FROM pub_reports WHERE id = ?";
            cn.query(sql, [req.params.id], (err, result) => {
                cn.release();

                res.json({ error: false, message: "Campaign successfully deleted" });
            });
        });
    }));

}