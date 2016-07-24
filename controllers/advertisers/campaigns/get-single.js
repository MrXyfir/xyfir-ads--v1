const db = require("lib/db");

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
module.exports = function(req, res) {
    
    // Attempt to grab data for campaign
    db(cn => {
        let sql = "SELECT * FROM ads WHERE id = ? AND owner = ?";
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
    let output = (i, ended) => {
        let campaign = {
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

}