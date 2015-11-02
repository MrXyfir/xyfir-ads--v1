var email = require("../../../lib/email");
var db = require("../../../lib/db");
module.exports = {
    getAll: function (req, res) {
        // Return all publishers awaiting application review
        if (req.query.publishers) {
            db(function (connection) {
                connection.query("SELECT * FROM awaiting_publishers", function (err, rows) {
                    connection.release();
                    res.json({ publishers: rows });
                });
            });
        }
        // Return all ads awaiting approval
        if (req.query.ads) {
            db(function (connection) {
                connection.query("SELECT * FROM ads WHERE approved = 0", function (err, rows) {
                    connection.release();
                    res.json({ ads: rows });
                });
            });
        }
    },
    deny: function (req, res) {
        if (req.body.publisher) {
            // Send denial email to publisher
            email(req.body.email, "Publisher Application - Denied", "Your application was denied for the following reason: " + req.body.reason);
            db(function (connection) {
                // Delete application from awaiting_publishers
                connection.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.body.publisher], function (e, r) {
                    connection.release();
                });
            });
        }
        else {
            // Send denial email to advertiser
            email(req.body.email, "Advertising Campaign - Denied", "Your campaign was denied for the following reason: " + req.body.reason);
        }
    },
    approve: function (req, res) {
        if (req.body.publisher) {
            // Email user notice of approval
            email(req.body.email, "Publisher Application - Approved", "Congratulations, your application was approved! You can now login to your publisher's dashboard: "
                + "<a href='https://ads.xyfir.com/publishers/'>Publisher Dashboard</a>");
            db(function (connection) {
                // Set publisher boolean to true in users
                connection.query("UPDATE users SET publisher = 1 WHERE user_id = ?", [req.body.publisher], function (e, r) {
                    // Delete application from awaiting_publishers
                    connection.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.body.publisher], function (e, r) {
                        connection.release();
                    });
                });
            });
        }
        else {
            var campaign = "https://ads.xyfir.com/advertisers/campaign/" + req.body.advertisement;
            // Email user notice of approval
            email(req.body.email, "Advertising Campaign - Approved", "Congratulations, your advertising campaign was approved! View your campaign here: "
                + "<a href='" + campaign + "'>Your Approved Campaign</a>");
            // Set approved bool to true in ads
            db(function (connection) {
                connection.query("UPDATE ads SET approved = 1 WHERE id = ?", [req.body.advertisement], function (err, result) {
                    connection.release();
                });
            });
        }
    }
};
//# sourceMappingURL=awaiting.js.map