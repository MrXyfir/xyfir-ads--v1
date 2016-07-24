const email = require("lib/email");
const db = require("lib/db");

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
module.exports = function(req, res) {
    
    // Refund cost of advertisement - 10% (minimum $10)
    let sql = "SELECT funds, owner, ad_media FROM ads WHERE id = ?";
    db(cn => cn.query(sql, [req.params.id], (err, rows) => {
        let refund = 0, media = rows[0].ad_media.split(','), owner = rows[0].owner;

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

                            let uEmail = "";

                            let finish = () => {
                                // Send denial email to advertiser
                                email(uEmail, "Advertising Campaign - Denied",
                                    "Your campaign was denied for the following reason: " + req.body.reason
                                );
                                res.json({ error: false });

                                // Check if we need to delete content from Cloudinary
                                if (!!media[0]) {
                                    let ids = [], temp;

                                    for (let i = 0; i < media.length; i++) {
                                        // Grab id + .ext
                                        temp = media[i].substr(media[i].lastIndexOf('/') + 1);
                                        // Cut off .ext and leave id
                                        temp = temp.substr(0, temp.length - 4);
                                        ids.push(temp);
                                    }

                                    require("lib/file/delete")(ids);
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