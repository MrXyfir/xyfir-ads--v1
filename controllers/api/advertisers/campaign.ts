import db = require("../../../lib/db");

export = {

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
    getSingle: (req, res) => {
        // Attempt to grab data for campaign
        db(cn => {
            var sql: string = "SELECT * FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
                if (err) {
                    cn.release();
                    res.json({});
                    return;
                }

                // Check if ad is in ads_ended
                if (rows.length == 0) {
                    sql = "SELECT * FROM ads_ended WHERE id = ? AND owner = ?";
                    cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
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
        var output = (i, ended: boolean) => {
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
                campaign.requested = i.requested; campaign.provided = i.provided;
                campaign.funds = i.funds; campaign.dailyFunds = i.daily_funds;
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
    remove: (req, res) => {
        db(cn => {
            var sql: string;

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
                    + "ut_genders, ct_categories, ct_keywords, ct_sites, info, owner "
                    + "FROM ads WHERE id = ?";
                cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
                    if (err) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true, message: "An unkown error occured." });
                        return;
                    }

                    // Delete ad from ads table
                    sql = "DELETE FROM ads WHERE id = ? AND owner = ?";
                    cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
                        if (err) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true, message: "An unkown error occured." });
                            return;
                        }

                        // Delete all rows relating to ad in clicks table
                        sql = "DELETE FROM clicks WHERE ad_id = ? AND owner = ?";
                        cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
                            if (err) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured." });
                                return;
                            }

                            cn.commit(err => {
                                if (err) {
                                    cn.rollback(() => cn.release());
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
        DESCRIPTION
            Add or remove funds to or from campaign from or to account
    */
    funds: (req, res) => {
        db(cn => {
            var sql: string;

            // Add funds to the campaign from user's account
            if (req.body.action == "add") {
                sql = "SELECT funds FROM advertisers WHERE user_id = ?";
                cn.query(sql, [req.session.uid], (err, rows) => {
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

                    cn.beginTransaction(err => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unkown error occured" });
                            return;
                        }

                        // Subtract amount from user's funds
                        sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                        cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                            if (err) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured" });
                                return;
                            }

                            // Add amount to campaign's funds
                            sql = "UPDATE ads SET funds = funds + ? WHERE id = ?";
                            cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured" });
                                    return;
                                }

                                cn.commit(err => {
                                    if (err) {
                                        cn.rollback(() => cn.release());
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
            // Remove funds from the campaign to user's account
            else {
                sql = "SELECT funds, daily_funds, daily_funds_used FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
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

                    // Check if new amount could still cover daily_funds
                    if (rows[0].funds - req.body.amount < rows[0].funds) {
                        cn.release();
                        res.json({ error: true, message: "Modified campaign balance would not be able to cover daily budget" });
                        return;
                    }

                    // Check if new amount could pay for funds used in daily budget
                    if (rows[0].funds - req.body.amount < rows[0].daily_funds_used) {
                        cn.release();
                        res.json({ error: true, message: "Modified campaign balance would not be able to cover funds owed" });
                        return;
                    }

                    cn.beginTransaction(err => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unkown error occured" });
                            return;
                        }

                        // Subtract amount from campaign's funds
                        sql = "UPDATE ads SET funds = funds - ? WHERE id = ?";
                        cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                            if (err) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured" });
                                return;
                            }

                            // Add amount to user's funds
                            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                            cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured" });
                                    return;
                                }

                                cn.commit(err => {
                                    if (err) {
                                        cn.rollback(() => cn.release());
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
        PUT api/advertisers/campaigns/:id/budget
        REQUIRED
            dailyBudget: number
        RETURN
            { error: bool, message: string }
        DESCRIPTION
            Validates and updates a campaign's daily budget
    */
    budget: (req, res) => {
        // Check if daily budget >= minimum amount
        if (req.body.dailyBudget < 0.50) {
            res.json({ error: true, message: "Daily allocated funds must be greater than or equal to $0.50" });
            return;
        }

        db(cn => {
            var sql: string;
            
            sql = "SELECT funds FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
                if (err || rows.length == 0) {
                    cn.release();
                    res.json({ error: true, message: "An unkown error occured" });
                    return;
                }

                // Check if campaign's current funds are >= daily budget
                if (rows[0].funds < req.body.dailyBudget) {
                    cn.release();
                    res.json({ error: true, message: "Campaign does not have enough funds to cover daily budget" });
                    return;
                }

                // Update daily funds, subtract any funds used today from funds, reset funds used today
                sql = "UPDATE ads SET daily_funds = ?, funds = funds - daily_funds_used, "
                    + "daily_funds_used = 0 WHERE id = ?";
                cn.query(sql, [req.body.dailyBudget, req.params.id], (err, result) => {
                    cn.release();

                    if (err)
                        res.json({ error: true, message: "An unkown error occured" });
                    else
                        res.json({ error: false, message: "Daily allocated funds updated successfully" });
                }); // update daily_funds
            }); // grab campaign funds
        }); // db()
    },

    /*
        PUT api/advertisers/campaigns/:id/bidding
        OPTIONAL
            autobid: bool, bid: number
        RETURN
            { error: bool, message: string }
    */
    bidding: (req, res) => {

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
    reports: (req, res) => {
        // Create a report object for specific time range
        if (req.query.reportStart && req.query.reportEnd) {

        }
        // Return multiple reports over default times
        // Daily, weekly, monthly
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
    update: (req, res) => {

    }

};