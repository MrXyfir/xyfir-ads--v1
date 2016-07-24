const db = require("lib/db");

/*
    GET api/publishers/account
    RETURN
        {
            payment: { method: number, info: json-string },
            earnings: { confirmed: number, pending: number },
            payments: [ { id: string, amount: number, tstamp: date-string } ]
        }
    DESCRIPTION
        Return information specifically related to publisher's account
*/
module.exports = function(req, res) {
    
    let sql, response = {
        payment: { method: 0, info: "" },
        earnings: { confirmed: 0, pending: 0 },
        payments: []
    };

    // Find all of user's pub campaigns
    sql = "SELECT id FROM pubs WHERE owner = ?";
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        // Unkown database error
        if (err) {
            cn.release();
            res.json(response);
            return;
        }
        // User has no pub campaigns yet
        else if (rows.length == 0) {
            next();
        }
        // Get earnings for each campaign
        else {
            // Build an array of campaign ids
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].id);
            }

            sql = "SELECT SUM(earnings) as earnings, SUM(earnings_temp) as earnings_pending "
                + "FROM pub_reports where id IN (?) AND MONTH(day) = MONTH(CURDATE())";
            cn.query(sql, [ids], (err, rows) => {
                if (err) {
                    cn.release();
                    res.json(response);
                    return;
                }

                response.earnings = {
                    confirmed: rows[0].earnings,
                    pending: rows[0].earnings_pending
                };

                next();
            });
        }

        // Grab payment info and payments
        const next = () => {
            // Get user's payment method and info
            sql = "SELECT payment_method, payment_info FROM publishers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                if (err || rows.length == 0) {
                    cn.release();
                    res.json(response);
                    return;
                }

                response.payment = {
                    method: rows[0].payment_method,
                    info: rows[0].payment_info
                };

                // Get recent payments to user
                sql = "SELECT id, amount, tstamp FROM payments WHERE received = ? AND user_id = ?";
                cn.query(sql, [false, req.session.uid], (err, rows) => {
                    cn.release();

                    if (!err && !!rows.length) response.payments = rows;

                    res.json(response);
                });
            });
        };
    }));

}