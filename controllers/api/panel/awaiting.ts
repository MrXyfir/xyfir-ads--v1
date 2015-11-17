import email = require("../../../lib/email");
import db = require("../../../lib/db");

export = {

    getAll: (req, res) => {

        // Return all publishers awaiting application review
        if (req.query.publishers) {
            db(connection => {
                connection.query("SELECT * FROM awaiting_publishers", (err, rows) => {
                    connection.release();
                    res.json({ publishers: rows });
                });
            });
        }

        // Return all ads awaiting approval
        if (req.query.ads) {
            db(connection => {
                connection.query("SELECT * FROM ads WHERE approved = 0", (err, rows) => {
                    connection.release();
                    res.json({ ads: rows });
                });
            });
        }

    },

    deny: (req, res) => {

        if (req.body.publisher) {
            // Send denial email to publisher
            email(req.body.email, "Publisher Application - Denied",
                "Your application was denied for the following reason: " + req.body.reason
            );

            db(connection => {
                // Delete application from awaiting_publishers
                connection.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.body.publisher], (e, r) => {
                    connection.release();
                });
            });
        }
        else {
            // Send denial email to advertiser
            email(req.body.email, "Advertising Campaign - Denied",
                "Your campaign was denied for the following reason: " + req.body.reason
            );

            // Refund cost of advertisement - 10% (minimum $10)
            db(connection => {
                var sql: string = "SELECT funds, owner, ad_media FROM ads WHERE id = ?";

                connection.query(sql, [req.body.advertiser], (err, rows) => {
                    var refund: number = 0, media: string[] = rows[0].ad_media.split(',');

                    // Determine refund amount
                    if (rows[0].funds > 10) {
                        refund = (rows[0].funds * 0.10) < 10 ? 10 : rows[0].funds * 0.10
                        refund = rows[0].funds - refund;
                    }

                    try {
                        connection.beginTransaction(err => {
                            // Add refund to user's funds
                            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                            connection.query(sql, [refund, rows[0].owner], (e, r) => {
                                if (e) connection.rollback(() => { throw e; });

                                // Move relevant data from ads -> ads_ended
                                sql = "INSERT INTO ads_ended SELECT "
                                + "id, name, pay_type, cost, autobid, available, approved, ad_type, ad_title, "
                                + "ad_description, ad_link, ad_media, ut_age, ut_countries, ut_regions, "
                                + "ut_genders, ct_categories, ct_keywords, ct_sites, info, owner "
                                + "FROM ads WHERE id = ?";
                                connection.query(sql, [req.body.advertiser], (e, r) => {
                                    if (e) connection.rollback(() => { throw e; });

                                    // Delete row from ads
                                    sql = "DELETE FROM ads WHERE id = ?";
                                    connection.query(sql, [req.body.advertiser], (e, r) => {
                                        if (e)
                                            connection.rollback(() => { connection.release(); throw e; });
                                        else {
                                            connection.commit(err => {
                                                if (e) connection.rollback(() => { throw e; });
                                                else connection.release();
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

                        // Check if we need to delete content from Cloudinary
                        if (!!media[0]) {
                            var ids: string[] = [], temp: string;

                            for (var i: number = 0; i < media.length; i++) {
                                // Grab id + .ext
                                temp = media[i].substr(media[i].lastIndexOf('/') + 1);
                                // Cut off .ext and leave id
                                temp = temp.substr(0, temp.length - 4);
                                ids.push(temp);
                            }

                            require("../../../lib/file/delete")(ids);
                        }
                    }
                });
            });
        }

    },

    approve: (req, res) => {

        if (req.body.publisher) {
            // Email user notice of approval
            email(req.body.email, "Publisher Application - Approved",
                "Congratulations, your application was approved! You can now login to your publisher's dashboard: "
                + "<a href='https://ads.xyfir.com/publishers/'>Publisher Dashboard</a>"
            );
            
            db(connection => {
                // Create row in publishers for user
                connection.query("INSERT INTO publishers SET ?", { user_id: req.body.publisher }, (e, r) => {
                    // Set publisher boolean to true in users
                    connection.query("UPDATE users SET publisher = 1 WHERE user_id = ?", [req.body.publisher], (e, r) => {
                        // Delete application from awaiting_publishers
                        connection.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.body.publisher], (e, r) => {
                            connection.release();
                        });
                    });
                });
            });
        }
        else {
            var campaign: string = "https://ads.xyfir.com/advertisers/campaign/" + req.body.advertisement;

            // Email user notice of approval
            email(req.body.email, "Advertising Campaign - Approved",
                "Congratulations, your advertising campaign was approved! View your campaign here: "
                + "<a href='" + campaign + "'>Your Approved Campaign</a>"
            );

            db(cn => {
                cn.query("SELECT autobid FROM ads WHERE id = ?", [req.body.advertisement], (err, rows) => {
                    // Generate bid if campaign has autobid enabled
                    if (!!rows[0].autobid) {
                        require("../../../lib/ad/autobid")(req.body.advertisement, cn, err => {
                            if (err) {
                                cn.release();
                                res.json({ error: true });
                                return;
                            }

                            finish();
                        });
                    }
                    else {
                        finish();
                    }

                    // Set approved bool to true in ads
                    var finish = () => cn.query("UPDATE ads SET approved = 1 WHERE id = ?", [req.body.advertisement], (e, r) => {
                        cn.release();
                        res.json({ error: false });
                    });
                });
            });
        }

    }

};