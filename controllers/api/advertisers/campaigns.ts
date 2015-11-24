import db = require("../../../lib/db");

export = {

    /*
        POST api/advertisers/campaigns
        REQUIRED
            ut_genders: string, ut_countries: string, ut_regions: string, ut_age: string,
            a_requested: number, a_paytype: number, a_media: string, a_type: number,
            c_availability: string, c_name: string, f_allocated: number,
            ct_category: string, ct_keywords: string, ct_sites: string,
            a_description: string, a_title: string, a_link: string
        OPTIONAL
            f_autobid: boolean, f_bid: number, f_daily: number
        RETURN
            { error: boolean, message: string }
    */
    create: (req, res) => {
        var response = { error: false, message: "" };

        // Validate data
        if (!req.body.c_name.match(/^\w{3,25}$/))
            response = { error: true, message: "Invalid campaign name" };
        else if (['1', '2', '3', '4'].indexOf(req.body.a_type) == -1)
            response = { error: true, message: "Invalid ad type selection" };
        else if (['1', '2'].indexOf(req.body.a_paytype) == -1)
            response = { error: true, message: "Invalid pay-per-action selected" };
        else if (req.body.a_type == 4 && req.body.a_paytype == 1)
            response = { error: true, message: "Video ads cannot be pay-per-click" };
        else if (!req.body.a_link.match(/^https?:\/\//))
            response = { error: true, message: "Link must begin with https:// or http://" };
        else if (!req.body.c_availability.match(/^(\d{10}-(\d{10})?,?){1,10}$/))
            response = { error: true, message: "Invalid availability ranges" };
        else if (!req.body.ut_genders.match(/^[0123,]{1,5}$/))
            response = { error: true, message: "Invalid targeted user genders" };
        else if (!req.body.ut_age.match(/^[0123456,]{1,11}$/))
            response = { error: true, message: "Invalid targeted user age ranges" };
        else if (!req.body.ct_keywords.match(/^[\w ,]{0,1500}$/))
            response = { error: true, message: "Invalid keyword(s) length or character" };
        else if (!req.body.ut_countries.match(/^([A-Z]{2},?){1,50}|\*$/))
            response = { error: true, message: "Invalid target countries list (limit 50 countries)" };
        else if (!req.body.ut_regions.match(/^([A-Z*,]{1,3}\|?){1,250}$/))
            response = { error: true, message: "Invalid target regions (limit 1,000 characters)" };
        else if (!require("../../../lib/category/validator")(req.body.ct_category, true))
            response = { error: true, message: "Invalid category selected" };
        else if (!req.body.ct_sites.match(/^([\w\d.,-]){5,225}|\*$/))
            response = { error: true, message: "Invalid target sites format / length (limit 225 characters)" };
        else if (req.body.f_allocated < 10.00)
            response = { error: true, message: "You must allocate at least $10.00 for campaign" };
        else if (!req.body.a_title.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{3,25}$/))
            response = { error: true, message: "Invalid ad title characters or length" };
        else if (!req.body.a_description.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{5,150}$/))
            response = { error: true, message: "Invalid ad description characters or length" };

        // Short text ads verification
        if (req.body.a_type == 2) {
            if (req.body.a_title.length > 15)
                response = { error: true, message: "Short text ad titles cannot be longer than 15 characters" };
            else if (req.body.a_description.length > 40)
                response = { error: true, message: "Short text ad descriptions cannot be longer than 40 characters" };
        }
        // Image / video ads verification
        else if (req.body.a_type == 3 || req.body.a_type == 4) {
            var temp: string[] = req.body.a_media.split(',');
            // ** Validate file is in our Cloudinary 'cloud'
            for (var i: number = 0; i < temp.length; i++) {
                if (temp[i].indexOf("https://res.cloudinary.com/") != 2) {
                    response = { error: true, message: "Invalid image / video sources" };
                    break;
                }
            }

            if (temp.length > 5 || req.body.a_media.length > 450)
                response = { error: true, message: "Invalid image / video source length" };
        }

        // Validate daily allocated funds
        if (req.body.f_daily) {
            if (req.body.f_daily > req.body.f_allocated)
                response = { error: true, message: "Daily allocated funds limit cannot be greater than total allocated" };
            if (req.body.f_daily < 0.50)
                response = { error: true, message: "Daily allocated funds limit cannot be less than $0.50" };
        }

        /* Create Campaign */
        var next = () => db(cn => {
            var sql: string = "SELECT funds FROM advertisers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                // Check if user has enough funds
                if (err || rows.length == 0)
                    response = { error: true, message: "An unknown error occured" };
                else if (rows[0].funds < req.body.f_allocated)
                    response = { error: true, message: "You do not have enough funds in your account" };

                // Cancel if an error occured in any of the above validation
                if (response.error) {
                    cn.release();
                    res.json(response);
                    return;
                }

                // Setup object to insert into table
                var data = {
                    name: req.body.c_name,
                    cost: req.body.f_autobid ? 0 : req.body.f_bid,
                    funds: req.body.f_allocated,
                    owner: req.session.uid,
                    ut_age: req.body.ut_age,
                    autobid: req.body.f_autobid ? true : false,
                    ad_type: req.body.a_type,
                    ad_link: req.body.a_link,
                    ad_title: req.body.a_title,
                    ad_media: req.body.a_media,
                    approved: false,
                    ct_sites: req.body.ct_sites,
                    pay_type: req.body.a_paytype,
                    requested: req.body.a_requested,
                    available: req.body.c_availability,
                    ut_genders: req.body.ut_genders,
                    ut_regions: req.body.ut_regions,
                    ct_keywords: req.body.ct_keywords,
                    daily_funds: req.body.f_daily ? req.body.f_daily : 0,
                    ut_countries: req.body.ut_countries,
                    ct_categories: req.body.ct_categories,
                    ad_description: req.body.a_description
                };
                req.body = null, response = null;

                // Finalize campaign creation process
                cn.beginTransaction(err => {
                    if (err) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured-" });
                        return;
                    }

                    // Remove allocated funds from advertiser's account
                    sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                    cn.query(sql, [data.funds, data.owner], (e, r) => {
                        if (e || !r.affectedRows) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true, message: "An unknown error occured--" });
                            return;
                        }

                        // Create row in database for ad
                        sql = "INSERT INTO ads SET ?";
                        cn.query(sql, data, (e, r) => {
                            data = null;

                            if (e) {
                                cn.rollback(() => cn.release());
                                res.json({ error: true, message: "An unknown error occured---" });
                                return;
                            }

                            var ad: number = r.insertId;

                            // Create blank ad_report for current date
                            sql = "INSERT INTO ad_reports (id, day) VALUES ('" + ad + "', CURDATE())";
                            cn.query(sql, (e, r) => {
                                cn.commit(err => {
                                    if (err) {
                                        cn.rollback(() => cn.release());
                                        res.json({ error: true, message: "An unknown error occured----" });
                                        return;
                                    }

                                    sql = "SELECT email FROM users WHERE user_id = ?";
                                    cn.query(sql, [req.session.uid], (err, rows) => {
                                        cn.release();

                                        // Email user about campaign creation
                                        require("../../../lib/email")(rows[0].email, "Ad Campaign Created",
                                            "You have successfully created a new ad campaign."
                                            + "<br /><br />"
                                            + "<a href='https://ads.xyfir.com/advertisers/campaign/" + ad + "'>View Details</a>"
                                            + "<br /><br />"
                                            + "You will receive an email when your campaign is approved or denied."
                                        );

                                        res.json({ error: false, message: "Campaign created successfully" });
                                    }); // grab user's email
                                }); // commit transaction
                            }); // create blank ad_report
                        }); // insert ad into ads
                    }); // remove funds
                }); // begin transac
            }); // grab funds
        }); // next()

        // Bid validation
        if (req.body.f_autobid) {
            next();
        }
        else {
            require("../../../lib/ad/price")(req.body.a_type, req.body.f_type, req.body.ct_category, info => {
                // Ensure user's bid price >= category's base price
                if (req.body.f_bid < info.base)
                    response = { error: true, message: "Bid price is lower than category's base price" };

                // Ensure their allocated funds can pay for requested clicks and 
                if (req.body.f_bid * req.body.a_requested > req.body.f_allocated)
                    response = { error: true, message: "Not enough allocated funds to pay for requested actions on ad" };

                next();
            });
        }

    }, // create()


    /*
        GET api/advertisers/campaigns
        RETURN
            {campaigns: [
                {
                    id, name, funds, dailyFunds, dailyFundsUsed,
                    requested, provided, payType, approved
                }
            ]}
        DESCRIPTION
            Returns basic info for active and pending-approval campaigns
    */
    getAll: (req, res) => {
        db(cn => {
            var sql: string;

            sql = "SELECT id, name, funds, daily_funds as dailyFunds, daily_funds_used as dailyFundsUsed, "
                + "pay_type as payType, requested, provided, approved "
                + "FROM ads WHERE owner = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                cn.release();

                res.json({ campaigns: rows });
            });
        });
    } // getAll()

};