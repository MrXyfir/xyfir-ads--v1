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
            // Refund cost of advertisement - 10% (minimum $10)
            db(function (connection) {
                connection.query("SELECT funds, owner FROM ads WHERE id = ?", [req.body.advertiser], function (err, rows) {
                    var refund = 0;
                    var sql = "";
                    // Determine refund amount
                    if (rows[0].funds > 10) {
                        refund = (rows[0].funds * 0.10) < 10 ? 10 : rows[0].funds * 0.10;
                        refund = rows[0].funds - refund;
                    }
                    try {
                        connection.beginTransaction(function (err) {
                            // Add refund to user's funds
                            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                            connection.query(sql, [refund, rows[0].owner], function (e, r) {
                                if (e)
                                    connection.rollback(function () { throw e; });
                                // Move relevant data from ads -> ads_ended
                                sql = "INSERT INTO ads_ended SELECT "
                                    + "id, name, pay_type, cost, autobid, available, approved, ad_type, ut_age, "
                                    + "ut_countries, ut_regions, ut_genders, ct_categories, ct_keywords, ct_sites, info, owner "
                                    + "FROM ads WHERE id = ?";
                                connection.query(sql, [req.body.advertiser], function (e, r) {
                                    if (e)
                                        connection.rollback(function () { throw e; });
                                    // Delete row from ads
                                    sql = "DELETE FROM ads WHERE id = ?";
                                    connection.query(sql, [req.body.advertiser], function (e, r) {
                                        if (e)
                                            connection.rollback(function () { connection.release(); throw e; });
                                        else {
                                            connection.commit(function (err) {
                                                if (e)
                                                    connection.rollback(function () { throw e; });
                                                else
                                                    connection.release();
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                    catch (err) {
                        connection.release();
                        res.json({ error: true, message: err.toString() });
                    }
                });
            });
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