﻿const email = require("lib/email");
const db = require("lib/db");

/*
    DELETE api/panel/awaiting/ads/:id
    REQUIRED
        reason: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Refunds advertiser 10% of funds
        Mark ad as ended
        Deletes advertisement from ads table
        Notifies advertiser of denial via email
*/
module.exports = function(req, res) {
    
    // Refund cost of advertisement - 10% (minimum $10)
    let sql = "SELECT funds, owner, ad_media FROM ads WHERE id = ?";
    db(cn => cn.query(sql, [req.params.id], (err, rows) => {
        let refund = 0, media = rows[0].ad_media.split(','), owner = rows[0].owner;

        // Determine refund amount
        if (rows[0].funds > 10) {
            refund = (rows[0].funds * 0.10) < 10 ? 10 : rows[0].funds * 0.10
            refund = rows[0].funds - refund;
        }

        cn.beginTransaction(err => {
            if (err) {
                cn.release();
                res.json({ error: true });
                return;
            }

            // Add refund to user's funds
            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
            cn.query(sql, [refund, owner], (e, r) => {
                if (e || !r.affectedRows) {
                    cn.rollback(() => cn.release());
                    res.json({ error: true });
                    return;
                }

                // Mark ad as ended and denied
                sql = "UPDATE ads SET ended = 1, approved = 2, funds = 0 WHERE id = ?"; 
                cn.query(sql, [req.params.id], (e, r) => {
                    if (e || !r.affectedRows) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true });
                        return;
                    }

                    cn.commit(err => {
                        if (err) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true });
                            return;
                        }

                        let uEmail = "";

                        let finish = () => {
                            // Send denial email to advertiser
                            email(uEmail, "Advertising Campaign - Denied",
                                "Your campaign was denied for the following reason: " + req.body.reason
                            );
                            res.json({ error: false });
                        };

                        sql = "SELECT email FROM users WHERE user_id = ?";
                        cn.query(sql, [owner], (err, rows) => {
                            if (err || !rows.length) {
                                cn.release();
                                res.json({ error: true });
                            }
                            else {
                                uEmail = rows[0].email;
                                finish();
                            }
                        }); // get user's email
                    }); // commit transaction
                }); // mark as ended
            }); // refund funds
        }); // grab ad data
    }));

}