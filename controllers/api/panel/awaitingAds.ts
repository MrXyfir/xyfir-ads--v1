import email = require("../../../lib/email");
import db = require("../../../lib/db");

export = {

    /*
        GET api/panel/awaiting/ads
        RETURN
            { ads: [ {  } ] }
        DESCRIPTION
            Return all ads awaiting approval
    */
    awaiting: (req, res) => {
        db(cn => cn.query("SELECT * FROM ads WHERE approved = 0", (err, rows) => {
            cn.release();
            res.json({ ads: rows });
        }));
    },

    /*
        POST api/panel/awaiting/ads/:id
        REQUIRED
            email: string
        RETURN
            { error: boolean }
        DESCRIPTION
            Approves an ad pending approval
            Generates bid for ad if autobid
    */
    approve: (req, res) => {
        var sql: string = "SELECT autobid FROM ads WHERE id = ?";
        db(cn => cn.query(sql, [req.params.id], (err, rows) => {
            
            var finish = () => {
                // Set approved bool to true in ads
                sql = "UPDATE ads SET approved = 1 WHERE id = ?";
                cn.query(sql, [req.params.id], (e, r) => {
                    cn.release();

                    var campaign: string = "https://ads.xyfir.com/advertisers/campaign/" + req.params.id;

                    // Email user notice of approval
                    email(req.body.email, "Advertising Campaign - Approved",
                        "Congratulations, your advertising campaign was approved! View your campaign here: "
                        + "<a href='" + campaign + "'>Your Approved Campaign</a>"
                    );
                    res.json({ error: false });
                });
            };

            // Generate bid if campaign has autobid enabled
            if (!!rows[0].autobid) {
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

        }));
    },

    /*
        DELETE api/panel/awaiting/ads/:id
        REQUIRED
            email: string, reason: string
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
            var refund: number = 0, media: string[] = rows[0].ad_media.split(',');

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
                cn.query(sql, [refund, rows[0].owner], (e, r) => {
                    if (e || !r.affectedRows) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true });
                        return;
                    }

                    // Move relevant data from ads -> ads_ended
                    sql = "INSERT INTO ads_ended SELECT "
                        + "id, name, pay_type, cost, autobid, available, approved, ad_type, ad_title, "
                        + "ad_description, ad_link, ad_media, ut_age, ut_countries, ut_regions, "
                        + "ut_genders, ct_categories, ct_keywords, ct_sites, info, owner "
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

                                // Send denial email to advertiser
                                email(req.body.email, "Advertising Campaign - Denied",
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
                                }
                            }); // commit transaction
                        }); // delete from ads
                    }); // move to ads_ended
                }); // refund funds
            }); // grab ad data
        }));
    }

};