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
                            res.json({ error: true, message: "An unkown error occured-" });
                            return;
                        }

                        // Subtract amount from user's funds
                        sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                        cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                            if (err || !result.affectedRows) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured--" });
                                return;
                            }

                            // Add amount to campaign's funds
                            sql = "UPDATE ads SET funds = funds + ? WHERE id = ?";
                            cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                                if (err || !result.affectedRows) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured---" });
                                    return;
                                }

                                cn.commit(err => {
                                    if (err) {
                                        cn.rollback(() => cn.release());
                                        res.json({ error: true, message: "An unkown error occured----" });
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
                    if (rows[0].funds - req.body.amount < rows[0].daily_funds) {
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
                            res.json({ error: true, message: "An unkown error occured-" });
                            return;
                        }

                        // Subtract amount from campaign's funds
                        sql = "UPDATE ads SET funds = funds - ? WHERE id = ?";
                        cn.query(sql, [req.body.amount, req.params.id], (err, result) => {
                            if (err || !result.affectedRows) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unkown error occured--" });
                                return;
                            }

                            // Add amount to user's funds
                            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                            cn.query(sql, [req.body.amount, req.session.uid], (err, result) => {
                                if (err || !result.affectedRows) {
                                    cn.rollback(() => cn.release());
                                    res.json({ error: true, message: "An unkown error occured---" });
                                    return;
                                }

                                cn.commit(err => {
                                    if (err) {
                                        cn.rollback(() => cn.release());
                                        res.json({ error: true, message: "An unkown error occured----" });
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
        // dailyBudget can be 0, to remove limit
        if (req.body.dailyBudget > 0 && req.body.dailyBudget < 0.50) {
            res.json({ error: true, message: "Daily allocated funds cannot be less than $0.50" });
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

                    if (err || !result.affectedRows)
                        res.json({ error: true, message: "An unkown error occured-" });
                    else
                        res.json({ error: false, message: "Daily allocated funds updated successfully" });
                }); // update daily_funds
            }); // grab campaign funds
        }); // db()
    },

    /*
        PUT api/advertisers/campaigns/:id/bid
        OPTIONAL
            autobid: bool, bid: number
        RETURN
            { error: bool, message: string }
        DESCRIPTION
            Validate and update campaign's bid
            *Generates bid price if autobid == true
    */
    bid: (req, res) => {
        db(cn => {
            var sql: string;

            // Validate and update campaign's bid (cost)
            if (req.body.bid) {
                // Grab needed information for campaign
                sql = "SELECT ad_type, pay_type, ct_categories, requested, provided, funds, autobid "
                    + "FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

                    if (err || rows.length == 0) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured" });
                        return;
                    }

                    var campaign = rows[0]; rows = null;

                    // Grab ad type in category's pricing information
                    require("../../../lib/ad/price")
                    (campaign.ad_type, campaign.pay_type, campaign.ct_categories, info => {
                        // Ensure user's new bid is >= base price
                        if (req.body.bid < info.base) {
                            cn.release();
                            res.json({ error: true, message: "Bid must be greater than base price: $" + info.base });
                            return;
                        }
                        
                        // Ensure user can pay for requested with funds in campaign at bid
                        if ((campaign.requested - campaign.provided) * req.body.bid > campaign.funds) {
                            cn.release();
                            res.json({
                                error: true,
                                message: "Minimum funds in campaign required: $" + (req.body.bid * (campaign.requested - campaign.provided))
                            });
                            return;
                        }

                        // Update bid (cost) for campaign and set autobid = false, if true
                        sql = "UPDATE ads SET cost = ?" + (!!campaign.autobid ? ", autobid = 0" : "") + " WHERE id = ?";
                        cn.query(sql, [req.body.bid, req.params.id], (err, result) => {
                            cn.release();

                            if (err || !result.affectedRows)
                                res.json({ error: true, message: "An unknown error occured-" });
                            else
                                res.json({ error: false, message: "Bid updated successfully" });
                        }); // update bid cost
                    }); // grab ad/cat info
                }); // grab campaign info
            }
            // Generate and set campaign's autobid and cost
            else if (req.body.autobid) {
                sql = "SELECT autobid FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

                    if (err || rows.length == 0) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured" });
                        return;
                    }

                    // Check if campaign already has autobid set true
                    if (!!rows[0].autobid) {
                        cn.release();
                        res.json({ error: true, message: "Autobid is already enabled" });
                        return;
                    }

                    // Generate and set campaign's autobid cost
                    require("../../../lib/ad/autobid")(req.params.id, cn, err => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unknown error occured-" });
                            return;
                        }

                        // Set autobid = true for campaign
                        sql = "UPDATE ads SET autobid = ? WHERE id = ?";
                        cn.query(sql, [true, req.params.id], (err, result) => {
                            cn.release();
                            res.json({ error: false, message: "Autobid successfully enabled" });
                        });
                    }); // generate bid
                }); // check autobid
            }
            else {
                cn.release();
                res.json({ error: true, message: "" });
            }
        });
    },

    /*
        GET api/advertisers/campaigns/:id/reports
        REQUIRED
            dates: "2015-07-20|2015-07-20:2015-07-30"
        RETURN
            {
                clicks: number, views: number, cost: number, publishers: string,
                dem_age: string, dem_gender: string, dem_geo: string,
            }
        DESCRIPTION
            Generates a report for a campaign over a specific time frame
    */
    reports: (req, res) => {
        db(cn => {
            var sql: string;

            // Generate a report for a single day
            if (req.query.dates.match(/^\d{4}-\d{2}-\d{2}$/)) {

                sql = "SELECT * FROM ad_reports WHERE id = ? AND day = ?";
                cn.query(sql, [req.params.id, req.query.dates], (err, rows) => {
                    cn.release();
                    res.json(rows[0]);
                });
            }

            // Generate a report over multiple days
            else if (req.query.dates.match(/^(\d{4}-\d{2}-\d{2}:?){2}$/)) {
                // Setup variables
                var dates: string[] = req.query.dates.split(':');
                var report = {
                    clicks: 0, views: 0, cost: 0, publishers: "",
                    dem_age: "", dem_gender: "", dem_geo: {}
                };

                sql = "SELECT * FROM ad_reports WHERE id = ? AND day BETWEEN ? AND ?";
                var query = cn.query(sql, [req.params.id, dates[0], dates[1]]);
                var mergeList = require("../../../lib/merge/list");
                var mergeObject = require("../../../lib/merge/object");

                query
                .on("error", err => {
                    cn.end();
                    cn.release();
                    res.json({});
                    return;
                })
                .on("result", row => {
                    cn.pause();
                    
                    // Add values of new row to total
                    report.clicks += row.clicks;
                    report.views += row.views;
                    report.cost += row.cost;

                    // Merge lists / objects
                    report.publishers = mergeList(report.publishers.split(','), row.publishers.split(','));
                    report.dem_gender = mergeList(report.dem_gender.split(','), row.dem_gender.split(','));
                    report.dem_age = mergeList(report.dem_age.split(','), row.dem_age.split(','));
                    report.dem_geo = mergeObject(report.dem_geo, JSON.parse(row.dem_geo));

                    cn.resume();
                })
                .on("end", () => {
                    cn.release();
                    res.json(report);
                });
            }
        });
    },

    /*
        PUT api/advertisers/campaigns/:id
        REQUIRED
            name: string, requested: number, available: string, ut_age: string,
            ct_keywords: string, ct_sites: string, ut_genders: string,
            ut_countries: string, ut_regions: string
        RETURN
            { error: boolean, message: string }
        DESCRIPTION
            Allows a user to update certain values of their ad campaign
            *Value of requested is added to requested column in table
    */
    update: (req, res) => {

        var response: any = { error: false, message: "Campaign updated successfully" };

        /* Validate provided information */
        if (!req.body.name.match(/^[\w\d -]{3,25}$/))
            response = { error: true, message: "Invalid campaign name" };
        else if (!req.body.available.match(/^(\d{10}-(\d{10})?,?){1,10}$/))
            response = { error: true, message: "Invalid availability ranges" };
        else if (!req.body.ut_genders.match(/^[0123,]{1,5}$/))
            response = { error: true, message: "Invalid targeted user genders" };
        else if (!req.body.ut_age.match(/^[0123456,]{1,11}$/))
            response = { error: true, message: "Invalid targeted user age ranges" };
        else if (!req.body.ct_keywords.match(/^[\w\d ,-]{0,1500}$/))
            response = { error: true, message: "Invalid keyword(s) length or character" };
        else if (!req.body.ut_countries.match(/^([A-Z]{2},?){1,50}|\*$/))
            response = { error: true, message: "Invalid target countries list (limit 50 countries)" };
        else if (!req.body.ut_regions.match(/^([A-Z*,]{1,3}\|?){1,250}$/))
            response = { error: true, message: "Invalid target regions (limit 1,000 characters)" };
        else if (!req.body.ct_sites.match(/^([\w\d.,-]){5,225}|\*$/))
            response = { error: true, message: "Invalid target sites format / length (limit 225 characters)" };

        // Check for errors during validation
        if (response.error) {
            res.json(response);
            return;
        }

        /* Setup query and values for database */
        var update: string[] = [
            req.body.name, req.body.requested, req.body.available, req.body.ut_age, req.body.ct_keywords,
            req.body.ct_sites, req.body.ut_countries, req.body.ut_regions, req.body.ut_genders,
            req.params.id, req.session.uid
        ];
        var sql: string = ""
            + "UPDATE ads SET name = ?, requested = requested + ?, available = ?, ut_age = ?, ct_keywords = ?, "
            + "ct_sites = ?, ut_countries = ?, ut_regions = ?, ut_genders = ? "
            + "WHERE id = ? AND owner = ?";

        /* Update data in table */
        db(cn => cn.query(sql, update, (err, result) => {
            cn.release();

            if (err || !result.affectedRows)
                response = { error: true, message: "An unkown error occured" };

            res.json(response);
        }));

    }

};