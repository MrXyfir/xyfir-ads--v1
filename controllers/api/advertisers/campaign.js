var db = require("../../../lib/db");
module.exports = {
    /*
        GET api/advertisers/campaigns/:id
        RETURN
            {
                name: string, funds: number, dailyFunds: number, dailyFundsUsed: number,
                payType: number, cost: number, autobid: bool, requested: number,
                provided: number, available: string, approved: bool,
                ad: {
                    type: number, title: string, description: string, link: string, media: string,
                },
                userTargets: {
                    age: string, countries: string, regions: string, genders: string,
                },
                contentTargets: {
                    categories: string, keywords: string, sites: string
                }
            }
        DESCRIPTION
            Returns all non-report information for campaign
            *Can return campaigns that have ended
    */
    getSingle: function (req, res) {
        // Attempt to grab data for campaign
        db(function (cn) {
            var sql = "SELECT * FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
                if (err) {
                    cn.release();
                    res.json({});
                    return;
                }
                // Check if ad is in ads_ended
                if (rows.length == 0) {
                    sql = "SELECT * FROM ads_ended WHERE id = ? AND owner = ?";
                    cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
                        cn.release();
                        if (err || rows.length == 0)
                            res.json({});
                        else
                            output(rows[0], true);
                    });
                }
                else {
                    cn.release();
                    output(rows[0], false);
                }
            });
        });
        // Build and output return object
        var output = function (i, ended) {
            var campaign = {
                name: i.name, payType: i.pay_type, cost: i.cost, autobid: i.autobid,
                available: i.available, approved: i.approved, ended: ended,
                requested: null, provided: null, funds: null,
                dailyFunds: null, dailyFundsUsed: null,
                ad: {
                    type: i.ad_type, title: i.ad_title, description: i.ad_description,
                    link: i.ad_link, media: i.ad_media
                },
                userTargets: {
                    age: i.ut_age, countries: i.ut_countries, regions: i.ut_regions,
                    genders: i.ut_genders
                },
                contentTargets: {
                    categories: i.ct_categories, keywords: i.ct_keywords, sites: i.ct_sites
                }
            };
            // Add info only available to active campaigns
            if (!ended) {
                campaign.requested = i.requested;
                campaign.provided = i.provided;
                campaign.funds = i.funds;
                campaign.dailyFunds = i.daily_funds;
                campaign.dailyFundsUsed = i.daily_funds_used;
            }
            i = null;
            res.json(campaign);
        };
    },
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
    remove: function (req, res) {
        db(function (cn) {
            var sql;
            cn.beginTransaction(function (err) {
                if (err) {
                    cn.release();
                    res.json({ error: true, message: "An unkown error occured." });
                    return;
                }
                // Move campaign to ads_ended
                sql = "INSERT INTO ads_ended SELECT "
                    + "id, name, pay_type, cost, autobid, available, approved, ad_type, ad_title, "
                    + "ad_description, ad_link, ad_media, ut_age, ut_countries, ut_regions, "
                    + "ut_genders, ct_categories, ct_keywords, ct_sites, info, owner "
                    + "FROM ads WHERE id = ?";
                cn.query(sql, [req.params.id, req.session.uid], function (err, result) {
                    if (err) {
                        cn.rollback(function () { return cn.release(); });
                        res.json({ error: true, message: "An unkown error occured." });
                        return;
                    }
                    // Delete ad from ads table
                    sql = "DELETE FROM ads WHERE id = ? AND owner = ?";
                    cn.query(sql, [req.params.id, req.session.uid], function (err, result) {
                        if (err) {
                            cn.rollback(function () { return cn.release(); });
                            res.json({ error: true, message: "An unkown error occured." });
                            return;
                        }
                        // Delete all rows relating to ad in clicks table
                        sql = "DELETE FROM clicks WHERE ad_id = ? AND owner = ?";
                        cn.query(sql, [req.params.id, req.session.uid], function (err, result) {
                            if (err) {
                                cn.rollback(function () { return cn.release(); });
                                res.json({ error: true, message: "An unkown error occured." });
                                return;
                            }
                            cn.commit(function (err) {
                                if (err) {
                                    cn.rollback(function () { return cn.release(); });
                                    res.json({ error: true, message: "An unkown error occured." });
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
    },
    /*
        PUT api/advertisers/campaigns/:id/funds
        REQUIRED
            action: string, amount: number
        RETURN
            { error: bool, message: string }
    */
    funds: function (req, res) {
        db(function (cn) {
            var sql;
            // Add funds to the campaign from user's account
            if (req.body.action == "add") {
                sql = "SELECT funds FROM advertisers WHERE user_id = ?";
                cn.query(sql, [req.session.uid], function (err, rows) {
                    if (err || rows.length == 0) {
                        res.json({ error: true, message: "An unkown error occured" });
                        return;
                    }
                    // Check if user's funds are >= amount
                    if (rows[0].funds < req.body.amount) {
                        cn.release();
                        res.json({ error: true, message: "Not enough funds in account" });
                        return;
                    }
                    cn.beginTransaction(function (err) {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unkown error occured" });
                            return;
                        }
                        // Subtract amount from user's funds
                        sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                        cn.query(sql, [req.body.amount, req.session.uid], function (err, result) {
                            if (err) {
                                cn.rollback(function () { return cn.release(); });
                                res.json({ error: true, message: "An unkown error occured" });
                                return;
                            }
                            // Add amount to campaign's funds
                            sql = "UPDATE ads SET funds = funds + ? WHERE id = ?";
                            cn.query(sql, [req.body.amount, req.params.id], function (err, result) {
                                if (err) {
                                    cn.rollback(function () { return cn.release(); });
                                    res.json({ error: true, message: "An unkown error occured" });
                                    return;
                                }
                                cn.commit(function (err) {
                                    if (err) {
                                        cn.rollback(function () { return cn.release(); });
                                        res.json({ error: true, message: "An unkown error occured" });
                                        return;
                                    }
                                    cn.release();
                                    res.json({ error: false, message: "Funds successfully transferred to campaign" });
                                }); // commit transaction
                            }); // add funds to campaign
                        }); // remove funds from account
                    }); // begin transaction
                }); // get user's funds
            }
            else {
                sql = "SELECT funds FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
                    if (err || rows.length == 0) {
                        res.json({ error: true, message: "An unkown error occured" });
                        return;
                    }
                    // Check if campaign's funds are >= amount
                    if (rows[0].funds < req.body.amount) {
                        cn.release();
                        res.json({ error: true, message: "Not enough funds in campaign" });
                        return;
                    }
                    cn.beginTransaction(function (err) {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unkown error occured" });
                            return;
                        }
                        // Subtract amount from campaign's funds
                        sql = "UPDATE ads SET funds = funds - ? WHERE id = ?";
                        cn.query(sql, [req.body.amount, req.params.id], function (err, result) {
                            if (err) {
                                cn.rollback(function () { return cn.release(); });
                                res.json({ error: true, message: "An unkown error occured" });
                                return;
                            }
                            // Add amount to user's funds
                            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                            cn.query(sql, [req.body.amount, req.session.uid], function (err, result) {
                                if (err) {
                                    cn.rollback(function () { return cn.release(); });
                                    res.json({ error: true, message: "An unkown error occured" });
                                    return;
                                }
                                cn.commit(function (err) {
                                    if (err) {
                                        cn.rollback(function () { return cn.release(); });
                                        res.json({ error: true, message: "An unkown error occured" });
                                        return;
                                    }
                                    cn.release();
                                    res.json({ error: false, message: "Funds successfully transferred from campaign" });
                                }); // commit transaction
                            }); // add funds to user's account
                        }); // remove funds from campaign
                    }); // begin transaction
                }); // get campaign's funds
            }
        });
    },
    /*
        PUT api/advertisers/campaigns/:id/bidding
        OPTIONAL
            autobid: bool, bid: number
        RETURN
            { error: bool, message: string }
    */
    bidding: function (req, res) {
    },
    /*
        PUT api/advertisers/campaigns/:id/budget
        REQUIRED
            dailyBudget: number
        RETURN
            { error: bool, message: string }
    */
    budget: function (req, res) {
    },
    /*
        GET api/advertisers/campaigns/:id/reports
        OPTIONAL
            reportStart: number, reportEnd: number
        RETURN
            {reports: [
                {
                    
                }
            ]}
    */
    reports: function (req, res) {
        // Create a report object for specific time range
        if (req.query.reportStart && req.query.reportEnd) {
        }
        else {
        }
    },
    /*
        PUT api/advertisers/campaigns/:id
        REQUIRED
        OPTIONAL
        RETURN
            { error: bool, message: string }
    */
    update: function (req, res) {
    }
};
//# sourceMappingURL=campaign.js.map