/*
	Request:
		POST api/login
		REQUIRED xid&auth
		OPTIONAL NONE
	
	Response:
		{error: boolean, message: string}
*/

import request = require('request');

export = (req, res) => {

    if (req.session.uid) {
        res.json({ error: true, message: "You are already logged in" });
        return;
    }

    var url: string = require('../../config').addresses.xacc + 'api/service/'
        + '10/' + req.body.xid + '/' + req.body.auth;

    request(url, (err, response, body) => {
        body = JSON.parse(body);

        if (body.error) {
            res.json({ error: true, message: "There was an error during login. Please try again." });
            return;
        }

        require('../../lib/db')(function (connection) {
            connection.query('SELECT * FROM users WHERE xyfir_id = ?', [req.body.xid], function (err, rows) {
				
                // Check if first login (registration) or normal login
                if (rows.length == 0) {
                    var insert = {
                        xyfir_id: req.body.xid,
                        email: body.email
                    };
					
                    // Create a new row for user
                    connection.query('INSERT INTO users SET ?', insert, function (err, result) {
                        connection.release();

                        req.session.uid = result.insertId;
                        res.json({ error: false, message: "Logged in successfully." });
                    });
                }
                else {
                    // Update user data
                    connection.query('UPDATE users SET email = ? WHERE user_id = ?', [body.email, rows[0].user_id], function (err, result) {
                        connection.release();

                        // Set session variables
                        req.session.uid = rows[0].user_id;
                        req.session.publisher = !!rows[0].publisher;
                        req.session.advertiser = !!rows[0].advertiser;

                        res.json({ error: false, message: "Logged in successfully." });
                    });
                }
            });
        });
    });

};