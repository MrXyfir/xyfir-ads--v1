/*
	GET api/login
	REQUIRED
        xid: string, auth: string
	RETURN
		{error: bool, message: string}
    DESCRIPTION
        Successfull logins to Xyfir Account redirect here
	    Set session if xid/auth is valid
        Redirects to home page
*/

import request = require("request");
import db = require("../../lib/db");

var config = require("../../config");

export = (req, res) => {

    if (req.session.uid) {
        res.redirect(config.addresses.xads);
        return;
    }

    var url: string = config.addresses.xacc
        + "api/service/11/" + req.query.xid + "/" + req.query.auth;


    request(url, (err, response, body) => {
        body = JSON.parse(body);

        if (body.error) {
            res.redirect(config.addresses.xads);
            return;
        }

        db(cn => {
            var sql: string = "SELECT * FROM users WHERE xyfir_id = ?";
            cn.query(sql, [req.query.xid], (err, rows) => {
				
                // Check if first login (registration) or normal login
                if (rows.length == 0) {
                    var insert = {
                        xyfir_id: req.query.xid,
                        email: body.email
                    };
					
                    // Create a new row for user
                    sql = "INSERT INTO users SET ?";
                    cn.query(sql, insert, (err, result) => {
                        cn.release();

                        req.session.uid = result.insertId;
                        res.redirect(config.addresses.xads);
                    });
                }
                else {
                    // Update user data
                    sql = "UPDATE users SET email = ? WHERE user_id = ?";
                    cn.query(sql, [body.email, rows[0].user_id], (err, result) => {
                        cn.release();

                        // Set session variables
                        req.session.uid = rows[0].user_id;
                        req.session.publisher = !!rows[0].publisher;
                        req.session.advertiser = !!rows[0].advertiser;

                        res.redirect(config.addresses.xads);
                    });
                }
            });
        });
    });

};