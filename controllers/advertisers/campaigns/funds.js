const db = require("lib/db");

/*
    PUT api/advertisers/campaigns/:id/funds
    REQUIRED
        action: string, amount: number
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Add or remove funds to or from campaign from or to account
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        // Add funds to the campaign from user's account
        if (req.body.action == "add") {
            sql = "SELECT funds FROM advertisers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                if (err || rows.length == 0) {
                    res.json({ error: true, message: "An unkown error occured" });
                    return;
                }

                // Check if user's funds are >= amount
                if (rows[0].funds < req.body.amount) {
                    cn.release();
                    res.json({ error: true, message: "Not enough funds in account" });
                    return;
                }

                cn.beginTransaction(err => {
                    if (err) {
                        cn.release();
                        res.json({ error: true, message: "An unkown error occured-" });
                        return;
                    }

                    // Subtract amount from user's funds
                    sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                    cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                        if (err || !result.affectedRows) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true, message: "An unkown error occured--" });
                            return;
                        }

                        // Add amount to campaign's funds
                        sql = "UPDATE ads SET funds = funds + ? WHERE id = ?";
                        cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                            if (err || !result.affectedRows) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured---" });
                                return;
                            }

                            cn.commit(err => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured----" });
                                    return;
                                }

                                cn.release();
                                res.json({ error: false, message: "Funds successfully transferred to campaign" });
                            }); // commit transaction
                        }); // add funds to campaign
                    }); // remove funds from account
                }); // begin transaction
            }); // get user's funds
        }
        // Remove funds from the campaign to user's account
        else {
            sql = "SELECT funds, daily_funds, daily_funds_used FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
                if (err || rows.length == 0) {
                    res.json({ error: true, message: "An unkown error occured" });
                    return;
                }

                // Check if campaign's funds are >= amount
                if (rows[0].funds < req.body.amount) {
                    cn.release();
                    res.json({ error: true, message: "Not enough funds in campaign" });
                    return;
                }

                // Check if new amount could still cover daily_funds
                if (rows[0].funds - req.body.amount < rows[0].daily_funds) {
                    cn.release();
                    res.json({ error: true, message: "Modified campaign balance would not be able to cover daily budget" });
                    return;
                }

                // Check if new amount could pay for funds used in daily budget
                if (rows[0].funds - req.body.amount < rows[0].daily_funds_used) {
                    cn.release();
                    res.json({ error: true, message: "Modified campaign balance would not be able to cover funds owed" });
                    return;
                }

                cn.beginTransaction(err => {
                    if (err) {
                        cn.release();
                        res.json({ error: true, message: "An unkown error occured-" });
                        return;
                    }

                    // Subtract amount from campaign's funds
                    sql = "UPDATE ads SET funds = funds - ? WHERE id = ?";
                    cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                        if (err || !result.affectedRows) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true, message: "An unkown error occured--" });
                            return;
                        }

                        // Add amount to user's funds
                        sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                        cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                            if (err || !result.affectedRows) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured---" });
                                return;
                            }

                            cn.commit(err => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured----" });
                                    return;
                                }

                                cn.release();
                                res.json({ error: false, message: "Funds successfully transferred from campaign" });
                            }); // commit transaction
                        }); // add funds to user's account
                    }); // remove funds from campaign
                }); // begin transaction
            }); // get campaign's funds
        }
    });

}