import db = require("../../../lib/db");

export = {

    /*
        POST api/publishers/account/register
        REQUIRED
            name: string, email: string, application: string
        RETURN
            { message: string }
        DESCRIPTION
            Allows a user to submit a publisher application
    */
    register: (req, res) => {
        if (!req.session.uid)
            res.json({ message: "You must login to Xyfir Ads with your Xyfir Account." });
        else if (req.session.publisher)
            res.json({ message: "You are already a publisher." });
        else if (req.body.name.length > 25)
            res.json({ message: "Name cannot be more than 25 characters long." });
        else if (req.body.email.length > 50)
            res.json({ message: "Email cannot be more than 50 characters long." });
        else if (req.body.application.length > 1500)
            res.json({ message: "Application cannot be more than 1500 characters long." });
        else {
            db(cn => {
                var sql: string;

                sql = "SELECT * FROM awaiting_publishers WHERE user_id = ?";
                cn.query(sql, [req.session.uid], (err, rows) => {
                    if (rows.length > 0) {
                        res.json({ message: "You already have an application awaiting review." });
                        cn.release();
                    }
                    else {
                        // Add application to awaiting_publishers
                        var data = {
                            user_id: req.session.uid, name: req.body.name,
                            email: req.body.email, application: req.body.application
                        };

                        sql = "INSERT INTO awaiting_publishers SET ?";
                        cn.query(sql, data, (err, result) => {
                            cn.release();

                            if (err)
                                res.json({ message: "An unknown error occured. Please try again." });
                            else
                                res.json({ message: "Your application has been submit successfully." });
                        });
                    }
                });
            });
        }
    },

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
    info: (req, res) => {
        var sql: string;
        var response = {
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
                var ids: number[] = [];
                for (var i: number = 0; i < rows.length; i++) {
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
            var next = () => {
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
    },

    /*
        PUT api/publishers/account
        REQUIRED
            paymentMethod: number, paymentInfo: json-string
        RETURN
            { error: true, message: string }
        DESCRIPTION
            Allow publisher's to update their payment method and info
    */
    update: (req, res) => {
        var info = JSON.parse(req.body.paymentInfo);

        // Update payment_info, payment_method
        var update = () => db(cn => {
            var sql: string = "UPDATE publishers SET payment_info = ?, payment_method = ? WHERE user_id = ?";
            cn.query(sql, [JSON.stringify(info), req.body.paymentMethod, req.session.uid], (err, result) => {
                cn.release();

                if (err)
                    res.json({ error: true, message: "An unkown error occured" });
                else
                    res.json({ error: false, message: "Payment info updated successfully" });
            });
        });

        // Payment via check
        if (req.body.paymentMethod == 1) {
            // Validate info pertaining to check
            if (!info.name.match(/^([\w-]{3,20}\s?){2,3}$/))
                res.json({ error: true, message: "Invalid name" });
            else if (!info.address.match(/^[\w\d -.#,]{5,50}$/))
                res.json({ error: true, message: "Invalid address" });
            else if (!info.address2.match(/^[\w\d -.#,]{0,50}$/))
                res.json({ error: true, message: "Invalid address" });
            else if (!info.zip.match(/^[0-9]{5}$/))
                res.json({ error: true, message: "Invalid zip code (US ONLY)" });
            else if (info.country != "US")
                res.json({ error: true, message: "Checks are only available for US publishers" });
            else update();
        }
        // Payment via bank wire
        else if (req.body.paymentMethod == 2) {
            // ** Add validation for bank wire info
        }
        // Invalid payment method
        else {
            res.json({ error: true, message: "Invalid payment method" });
        }
    }

}