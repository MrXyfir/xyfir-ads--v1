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
        DESCRIPTION
            Add or remove funds to or from campaign from or to account
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
                sql = "SELECT funds, daily_funds, daily_funds_used FROM ads WHERE id = ? AND owner = ?";
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
        PUT api/advertisers/campaigns/:id/budget
        REQUIRED
            dailyBudget: number
        RETURN
            { error: bool, message: string }
        DESCRIPTION
            Validates and updates a campaign's daily budget
    */
    budget: function (req, res) {
        // Check if daily budget >= minimum amount
        if (req.body.dailyBudget < 0.50) {
            res.json({ error: true, message: "Daily allocated funds must be greater than or equal to $0.50" });
            return;
        }
        db(function (cn) {
            var sql;
            sql = "SELECT funds FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
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
                cn.query(sql, [req.body.dailyBudget, req.params.id], function (err, result) {
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
        PUT api/advertisers/campaigns/:id/bid
        OPTIONAL
            autobid: bool, bid: number
        RETURN
            { error: bool, message: string }
        DESCRIPTION
            Validate and update campaign's bid
            *Generates bid price if autobid == true
    */
    bid: function (req, res) {
        db(function (cn) {
            var sql;
            // Validate and update campaign's bid (cost)
            if (req.body.bid) {
                // Grab needed information for campaign
                sql = "SELECT ad_type, pay_type, category, requested, funds, autobid "
                    + "FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
                    if (err || rows.length == 0) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured" });
                        return;
                    }
                    var campaign = rows[0];
                    rows = null;
                    // Grab ad type in category's pricing information
                    require("../../../lib/ad/price")(campaign.ad_type, campaign.pay_type, campaign.ct_categories, function (info) {
                        // Ensure user's new bid is >= base price
                        if (req.body.bid >= info.base) {
                            cn.release();
                            res.json({ error: true, message: "Bid must be greater than base price: $" + info.base });
                            return;
                        }
                        // Ensure user can pay for requested with funds in campaign at bid
                        if (campaign.requested * req.body.bid > campaign.funds) {
                            cn.release();
                            res.json({ error: true, message: "Minimum funds in campaign required: $" + req.body.bid + " * " + campaign.requested });
                            return;
                        }
                        // Update bid (cost) for campaign and set autobid = false, if true
                        sql = "UPDATE ads SET cost = ?" + (campaign.autobid ? ", autobid = 0" : "") + " WHERE id = ?";
                        cn.query(sql, [req.body.bid, req.params.id], function (err, result) {
                            cn.release();
                            if (err)
                                res.json({ error: true, message: "An unknown error occured" });
                            else
                                res.json({ error: false, message: "Bid updated successfully" });
                        }); // update bid cost
                    }); // grab ad/cat info
                }); // grab campaign info
            }
            else if (req.body.autobid) {
                // Check if campaign already has autobid set true
                sql = "SELECT autobid FROM ads WHERE id = ? AND owner = ?";
                cn.query(sql, [req.params.id, req.session.uid], function (err, rows) {
                    if (err || rows.length == 0) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured" });
                        return;
                    }
                    // Generate and set campaign's autobid cost
                    require("../../../lib/ad/price")(req.params.id, cn, function (err) {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unknown error occured" });
                            return;
                        }
                        // Set autobid = true for campaign
                        sql = "UPDATE ads SET autobid = ? WHERE id = ?";
                        cn.query(sql, [true, req.params.id], function (err, result) {
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
    reports: function (req, res) {
        db(function (cn) {
            var sql;
            // Generate a report for a single day
            if (req.query.dates.match(/^\d{4}-\d{2}-\d{2}$/)) {
                sql = "SELECT * FROM ad_reports WHERE id = ? AND day = ?";
                cn.query(sql, [req.params.id, req.query.dates], function (err, rows) {
                    cn.release();
                    res.json(rows[0]);
                });
            }
            else if (req.query.dates.match(/^(\d{4}-\d{2}-\d{2}:?){2}$/)) {
                // Setup variables
                var dates = req.query.dates.split(':');
                var report = {
                    clicks: 0, views: 0, cost: 0, publishers: "",
                    dem_age: "", dem_gender: "", dem_geo: ""
                };
                sql = "SELECT * FROM ad_reports WHERE id = ? AND day BETWEEN ? AND ?";
                var query = cn.query(sql, [dates[0], dates[1]]);
                var mergeList = require("../../../lib/merge/list");
                var mergeObject = require("../../../lib/merge/object");
                query
                    .on("error", function (err) {
                    cn.end();
                    cn.release();
                    res.json({});
                    return;
                })
                    .on("result", function (row) {
                    cn.pause();
                    // Add values of new row to total
                    report.clicks += row.clicks;
                    report.views += row.views;
                    report.cost += row.cost;
                    // Merge lists / objects
                    report.dem_gender = mergeList(report.dem_gender, row.dem_gender);
                    report.dem_geo = mergeObject(report.dem_geo, row.dem_geo);
                    report.dem_age = mergeList(report.dem_age, row.dem_age);
                    cn.resume();
                })
                    .on("end", function () {
                    cn.release();
                    res.json(report);
                });
            }
        });
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