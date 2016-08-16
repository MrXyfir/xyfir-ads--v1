const db = require("lib/db");

/*
    DELETE api/advertisers/campaigns/:id
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Mark ad as ended
        Delete any clicks from clicks table
*/
module.exports = function(req, res) {
    
    db(cn => {
        // Mark as ended
        let sql = "UPDATE ads SET ended = 1 WHERE id = ? AND owner = ?";
        cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
            if (err || !result.affectedRows) {
                cn.release();
                res.json({
                    error: true, message: "An unknown error occured."
                });
            }
            else {
                // Delete all rows relating to ad in clicks table
                sql = "DELETE FROM clicks WHERE ad_id = ?";
                cn.query(sql, [req.params.id], (err, result) => {
                    res.json({ error: false, message: "Campaign ended successfully." });
                });
            }
        });
    });

}