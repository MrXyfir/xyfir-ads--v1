import email = require("../../../lib/email");
import db = require("../../../lib/db");

export = {

    /*
        GET api/panel/awaiting/ads
        RETURN
            { ads: [ { id: number, funds: number, ad_title: string, ad_type: number } ] }
        DESCRIPTION
            Return all ads awaiting approval
    */
    awaiting: (req, res) => {
        db(cn => cn.query("SELECT id, ad_title, ad_type, funds FROM ads WHERE approved = 0", (err, rows) => {
            cn.release();
            res.json({ ads: rows });
        }));
    },

    /*
        GET api/panel/awaiting/ads/:id
        RETURN
            { entire ads table row }
        DESCRIPTION
            Return all info for ad
    */
    info: (req, res) => {
        db(cn => cn.query("SELECT * FROM ads WHERE id = ? AND approved = 0", [req.params.id], (err, rows) => {
            cn.release();
            res.json(rows[0]);
        }));
    },

    /*
        POST api/panel/awaiting/ads/:id
        RETURN
            { error: boolean }
        DESCRIPTION
            Approves an ad pending approval
            Generates bid for ad if autobid
    */
    approve: (req, res) => {
        var sql: string = "SELECT autobid, owner FROM ads WHERE id = ?";
        db(cn => cn.query(sql, [req.params.id], (err, rows) => {
            
            var finish = () => {
                // Set approved bool to true in ads
                sql = "UPDATE ads SET approved = 1 WHERE id = ?";
                cn.query(sql, [req.params.id], (e, r) => {
                    cn.release();

                    var campaign: string = "https://ads.xyfir.com/advertisers/campaign/" + req.params.id;

                    // Email user notice of approval
                    email(uEmail, "Advertising Campaign - Approved",
                        "Congratulations, your advertising campaign was approved! View your campaign here: "
                        + "<a href='" + campaign + "'>Your Approved Campaign</a>"
                    );
                    res.json({ error: false });
                });
            };

            // Generate bid if campaign has autobid enabled
            var autobid = () => {
                if (autobidValue) {
                    require("../../../lib/ad/autobid")(req.params.id, cn, err => {
                        if (err) {
                            cn.release();
                            res.json({ error: true });
                        }
                        else {
                            finish();
                        }
                    });
                }
                else {
                    finish();
                }
            }

            var autobidValue = !!rows[0].autobid, uEmail = "";

            // Grab advertiser's email from users
            sql = "SELECT email FROM users WHERE user_id = ?";
            cn.query(sql, [rows[0].owner], (err, rows) => {
                if (err || !rows.length) {
                    cn.release();
                    res.json({ error: true });
                }
                else {
                    uEmail = rows[0].email;
                    autobid();
                }
            });

        }));
    },

    /*
        DELETE api/panel/awaiting/ads/:id
        REQUIRED
            reason: string
        RETURN
            { error: boolean }
        DESCRIPTION
            Refunds advertiser 10% of funds
            Moves advertisement to ads_ended
            Deletes advertisement from ads table
            Notifies advertiser of denial via email
            Deletes media from Cloudinary if available
    */
    deny: (req, res) => {
        // Refund cost of advertisement - 10% (minimum $10)
        var sql: string = "SELECT funds, owner, ad_media FROM ads WHERE id = ?";
        db(cn => cn.query(sql, [req.params.id], (err, rows) => {
            var refund: number = 0, media: string[] = rows[0].ad_media.split(','), owner = rows[0].owner;

            // Determine refund amount
            if (rows[0].funds > 10) {
                refund = (rows[0].funds * 0.10) < 10 ? 10 : rows[0].funds * 0.10
                refund = rows[0].funds - refund;
            }

            cn.beginTransaction(err => {
                if (err) {
                    cn.release();
                    res.json({ error: true });
                    return;
                }

                // Add refund to user's funds
                sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                cn.query(sql, [refund, owner], (e, r) => {
                    if (e || !r.affectedRows) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true });
                        return;
                    }

                    // Move relevant data from ads -> ads_ended
                    sql = "INSERT INTO ads_ended SELECT "
                        + "id, name, pay_type, cost, autobid, available, approved, ad_type, ad_title, "
                        + "ad_description, ad_link, ad_media, ut_age, ut_countries, ut_regions, "
                        + "ut_genders, ct_categories, ct_keywords, ct_sites, owner "
                        + "FROM ads WHERE id = ?";
                    cn.query(sql, [req.params.id], (e, r) => {
                        if (e || !r.affectedRows) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true });
                            return;
                        }

                        // Delete row from ads
                        sql = "DELETE FROM ads WHERE id = ?";
                        cn.query(sql, [req.params.id], (e, r) => {
                            if (e || !r.affectedRows) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true });
                                return;
                            }

                            cn.commit(err => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true });
                                    return;
                                }

                                var uEmail: string = "";

                                var finish = () => {
                                    // Send denial email to advertiser
                                    email(uEmail, "Advertising Campaign - Denied",
                                        "Your campaign was denied for the following reason: " + req.body.reason
                                    );
                                    res.json({ error: false });

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
                                    };
                                };

                                sql = "SELECT email FROM users WHERE user_id = ?";
                                cn.query(sql, [owner], (err, rows) => {
                                    if (err || !rows.length) {
                                        cn.release();
                                        res.json({ error: true });
                                    }
                                    else {
                                        uEmail = rows[0].email;
                                        finish();
                                    }
                                }); // get user's email
                            }); // commit transaction
                        }); // delete from ads
                    }); // move to ads_ended
                }); // refund funds
            }); // grab ad data
        }));
    }

};