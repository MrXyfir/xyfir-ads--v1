import db = require("../../../lib/db");

export = {

    info: (req, res) => {

    },

    update: (req, res) => {

    },

    addFunds: (req, res) => {

    },

    register: (req, res) => {
        if (!req.session.uid)
            res.json({ error: true, message: "You must login to Xyfir Ads with your Xyfir Account." });
        else if (req.session.advertiser)
            res.json({ error: true, message: "You are already a advertiser." });
        else {
            // Set advertiser boolean to true
            db(connection => {
                connection.query("UPDATE users SET advertiser = 1 WHERE user_id = ?", [req.session.uid], (err, result) => {
                    connection.release();

                    if (err)
                        res.json({ error: true, message: "An unkown error occured. Please try again." });
                    else
                        res.json({ error: false, message: "" });
                });
            });
        }
    }

}