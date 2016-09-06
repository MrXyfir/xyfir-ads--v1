/*
	POST api/login
	REQUIRED
        xid: string, auth: string
	RETURN
		{ error: bool }
    DESCRIPTION
        Attempt to login / register user
*/

const request = require("request");
const db = require("lib/db");

const config = require("config");

module.exports = function(req, res) {

    // User already logged in
    if (!!req.session.uid) {
        res.json({ error: false });
        return;
    }

    let url = config.addresses.xacc
        + "api/service/11/" + config.keys.xacc
        + "/" + req.body.xid
        + "/" + req.body.auth;


    request(url, (err, response, body) => {
        // Error with actual request
        if (err) {
            res.json({ error: true });
            return;
        }

        body = JSON.parse(body);

        // Error from Xyfir Accounts
        // Most likely invalid auth/xid combo
        if (body.error) {
            res.json({ error: true });
            return;
        }

        db(cn => {
            let sql = "SELECT * FROM users WHERE xyfir_id = ?";
            cn.query(sql, [req.body.xid], (err, rows) => {
				
                if (err) {
                    cn.release();
                    res.json({ error: true });
                }
                // First login (registration)
                else if (rows.length == 0) {
                    let insert = {
                        xyfir_id: req.body.xid,
                        email: body.email
                    };
					
                    // Create a new row for user
                    sql = "INSERT INTO users SET ?";
                    cn.query(sql, insert, (err, result) => {
                        cn.release();

                        req.session.uid = result.insertId;
                        res.json({ error: false });
                    });
                }
                // Normal login
                else {
                    // Update user data
                    sql = "UPDATE users SET email = ? WHERE user_id = ?";
                    cn.query(sql, [body.email, rows[0].user_id], (err, result) => {
                        cn.release();

                        // Set session variables
                        req.session.uid = rows[0].user_id;
                        req.session.publisher = !!rows[0].publisher;
                        req.session.advertiser = !!rows[0].advertiser;

                        res.json({ error: false });
                    });
                }
            });
        });
    });

};