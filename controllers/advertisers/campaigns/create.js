const isCategoryValid = require("lib/category/validator");
const getAdPrice = require("lib/ad/price");
const sendEmail = require("lib/email");
const db = require("lib/db");

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
module.exports = function(req, res) {

    let error = "";

    // Validate data
    if (!req.body.c_name.match(/^[\w\d -]{3,25}$/))
        error = "Invalid campaign name";
    else if (['1', '2', '3', '4'].indexOf(req.body.a_type) == -1)
        error = "Invalid ad type selection";
    else if (['1', '2'].indexOf(req.body.a_paytype) == -1)
        error = "Invalid pay-per-action selected";
    else if (req.body.a_type == 4 && req.body.a_paytype == 1)
        error = "Video ads cannot be pay-per-click";
    else if (!req.body.a_link.match(/^https?:\/\//))
        error = "Link must begin with https:// or http://";
    else if (!req.body.c_availability.match(/^(\d{10}-(\d{10})?,?){1,10}$/))
        error = "Invalid availability ranges";
    else if (!req.body.ut_genders.match(/^[0123,]{1,5}$/))
        error = "Invalid targeted user genders";
    else if (!req.body.ut_age.match(/^[0123456,]{1,11}$/))
        error = "Invalid targeted user age ranges";
    else if (!req.body.ct_keywords.match(/^[\w\d ,-]{0,1500}$/))
        error = "Invalid keyword(s) length or character";
    else if (!req.body.ut_countries.match(/^([A-Z]{2},?){1,50}|\*$/))
        error = "Invalid target countries list (limit 50 countries)";
    else if (!req.body.ut_regions.match(/^([A-Z*,]{1,3}\|?){1,250}$/))
        error = "Invalid target regions (limit 1,000 characters)";
    else if (!isCategoryValid(req.body.ct_category, true))
        error = "Invalid category selected";
    else if (!req.body.ct_sites.match(/^([\w\d.,-]){5,225}|\*$/))
        error = "Invalid target sites format / length (limit 225 characters)";
    else if (req.body.f_allocated < 10.00)
        error = "You must allocate at least $10.00 for campaign";
    else if (!req.body.a_title.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{3,25}$/))
        error = "Invalid ad title characters or length";
    else if (!req.body.a_description.match(/^[\w\d .:;'"!@#$%&()\-+=,/]{5,150}$/))
        error = "Invalid ad description characters or length";

    // Short text ads verification
    if (req.body.a_type == 2) {
        if (req.body.a_title.length > 15)
            error = "Short text ad titles cannot be longer than 15 characters";
        else if (req.body.a_description.length > 40)
            error = "Short text ad descriptions cannot be longer than 40 characters";
    }

    // Validate daily allocated funds
    if (req.body.f_daily > 0) {
        if (req.body.f_daily > req.body.f_allocated)
            error = "Daily allocated funds limit cannot be greater than total allocated";
        if (req.body.f_daily < 0.50)
            error = "Daily allocated funds limit cannot be less than $0.50";
    }

    /* Create Campaign */
    let next = () => db(cn => {
        let sql = "SELECT funds FROM advertisers WHERE user_id = ?";
        cn.query(sql, [req.session.uid], (err, rows) => {
            // Check if user has enough funds
            if (err || rows.length == 0)
                error = "An unknown error occured";
            else if (rows[0].funds < req.body.f_allocated)
                error = "You do not have enough funds in your account";

            // Cancel if an error occured in any of the above validation
            if (error) {
                cn.release();
                res.json({ error: true, message: error });
                return;
            }

            // Setup object to insert into table
            let data = {
                name: req.body.c_name,
                cost: req.body.f_autobid == 1 ? 0 : req.body.f_bid,
                funds: req.body.f_allocated,
                owner: req.session.uid,
                ut_age: req.body.ut_age,
                autobid: req.body.f_autobid,
                ad_type: req.body.a_type,
                ad_link: req.body.a_link,
                ad_title: req.body.a_title,
                ad_media: req.body.a_media,
                approved: 0,
                ct_sites: req.body.ct_sites,
                pay_type: req.body.a_paytype,
                requested: req.body.a_requested,
                available: req.body.c_availability,
                ut_genders: req.body.ut_genders,
                ut_regions: req.body.ut_regions,
                ct_keywords: req.body.ct_keywords,
                daily_funds: !!req.body.f_daily ? req.body.f_daily : 0,
                pay_modifier: req.body.a_type == 1 ? 500 : 70,
                ut_countries: req.body.ut_countries,
                ct_categories: req.body.ct_category,
                ad_description: req.body.a_description
            };

            // Finalize campaign creation process
            cn.beginTransaction(err => {
                if (err) {
                    cn.release();
                    res.json({
                        error: true, message: "An unknown error occured-"
                    }); return;
                }

                // Remove allocated funds from advertiser's account
                sql = "UPDATE advertisers SET funds = funds - ? WHERE user_id = ?";
                cn.query(sql, [data.funds, data.owner], (e, r) => {
                    if (e || !r.affectedRows) {
                        cn.rollback(() => cn.release());
                        res.json({
                            error: true, message: "An unknown error occured--"
                        }); return;
                    }

                    // Create row in database for ad
                    sql = "INSERT INTO ads SET ?";
                    cn.query(sql, data, (e, r) => {
                        data = null;

                        if (e) {
                            cn.rollback(() => cn.release());
                            res.json({
                                error: true, message: "An unknown error occured---"
                            });
                            return;
                        }

                        let ad = r.insertId;

                        // Create blank ad_report for current date and tomorrow's date
                        sql = `
                            INSERT INTO ad_reports (id, day) VALUES (
                                ?, CURDATE()), (?, DATE_ADD(CURDATE(), INTERVAL 1 DAY)
                            )
                        `;
                        cn.query(sql, [ad], (e, r) => {
                            cn.commit(err => {
                                if (err) {
                                    cn.rollback(() => cn.release());
                                    res.json({
                                        error: true,
                                        message: "An unknown error occured----"
                                    }); return;
                                }

                                sql = "SELECT email FROM users WHERE user_id = ?";
                                cn.query(sql, [req.session.uid], (err, rows) => {
                                    cn.release();

                                    // Email user about campaign creation
                                    sendEmail(rows[0].email, "Ad Campaign Created",
                                        "You have successfully created a new ad campaign."
                                        + "<br /><br />"
                                        + "<a href='https://ads.xyfir.com/#/advertisers/campaign/" + ad + "'>View Details</a>"
                                        + "<br /><br />"
                                        + "You will receive an email when your campaign is approved or denied."
                                    );

                                    res.json({
                                        error: false, message: "Campaign created"
                                    });
                                }); // grab user's email
                            }); // commit transaction
                        }); // create blank ad_report
                    }); // insert ad into ads
                }); // remove funds
            }); // begin transac
        }); // grab funds
    }); // next()

    // Bid validation
    if (req.body.f_autobid == 1) {
        next();
    }
    else {
        getAdPrice(
            req.body.a_type, req.body.f_type, req.body.ct_category,
            info => {
                // Ensure user's bid price >= category's base price
                if (req.body.f_bid < info.base)
                    error = "Bid price is lower than category's base price";

                // Ensure their allocated funds can pay for requested clicks and 
                if (req.body.f_bid * req.body.a_requested > req.body.f_allocated)
                    error = "Not enough allocated funds to pay for requested actions on ad";

                next();
            }
        );
    }

}