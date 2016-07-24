const db = require("lib/db");

/*
    DELETE api/advertisers/campaigns/:id
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Move ad from ads table to ads_ended
        Delete any clicks from clicks table
        *Any funds in campaign are lost
        *Reports stay available
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        cn.beginTransaction((err) => {
            if (err) {
                cn.release();
                res.json({ error: true, message: "An unkown error occured." });
                return;
            }

            // Move campaign to ads_ended
            sql = "INSERT INTO ads_ended SELECT "
                + "id, name, pay_type, cost, autobid, available, approved, ad_type, ad_title, "
                + "ad_description, ad_link, ad_media, ut_age, ut_countries, ut_regions, "
                + "ut_genders, ct_categories, ct_keywords, ct_sites, owner "
                + "FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
                if (err) {
                    cn.rollback(() => cn.release());
                    res.json({ error: true, message: "An unkown error occured.-" });
                    return;
                }

                // Delete ad from ads table
                sql = "DELETE FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
                    if (err) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true, message: "An unkown error occured.--" });
                        return;
                    }

                    // Delete all rows relating to ad in clicks table
                    sql = "DELETE FROM clicks WHERE ad_id = ?";
                    cn.query(sql, [req.params.id], (err, result) => {
                        if (err) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true, message: "An unkown error occured.---" });
                            return;
                        }

                        cn.commit(err => {
                            if (err) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured.----" });
                                return;
                            }

                            cn.release();
                            res.json({ error: false, message: "Campaign ended successfully." });
                        }); // commit transaction
                    }); // delete from clicks
                }); // delete from ads
            }); // moved to ads_ended
        }); // start transaction
    }); // db()

}