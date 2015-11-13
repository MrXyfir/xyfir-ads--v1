/// <reference path="../../typings/controllers/api/ads.d.ts" />

import categoryMatch = require("../../lib/category/match");
import db = require("../../lib/db");

/*
    GET api/ads
    REQUIRED
        pubid: number
    OPTIONAL
        xadid: string, type: number, types: string, count: number,
        speed: number, ip: string, age: number, gender: number,
        categories: string, keywords: string
    RETURN
        {ads: [
            {
                type: number, link: string, title: string,
                description: string, media?: string
            }, ...
        ]}
    DESCRIPTION
        Attempts to find and return relevant ads
*/
export = (req, res) => {
    
    // pubid is required
    if (!req.query.pubid) {
        res.json({ ads: [] });
        return;
    }
    // Setup variables
    else {
        var q: IRequestQuery = req.query, ads: IAd[] = [],
            sql: string, cn: any, pub: IPub, user: IUser;
        req.query = null;

        q.speed = !q.speed ? 0 : q.speed;

        db(connection => {
            cn = connection;
            initialData();
        });
    }

    /* Get/Prepare Info Needed Later */
    var initialData = (): void => {
        // Grab pub campaign's information
        sql = "SELECT categories, keywords, site, type FROM pubs WHERE id = ?";
        cn.query(sql, [req.query.pubid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ ads: [] });
                return;
            }

            pub = rows[0];

            if (q.categories) pub.categories += ',' + q.categories;

            // ** Grab user's country and region codes
            // user = { country: string, region: string }

            // Grab user's information from their xad-id
            if (req.query.xadid && (!req.query.age || !req.query.gender)) {
                sql = "SELECT info FROM xad_ids WHERE xad_id = ?";
                cn.query(sql, [req.query.xadid], (err, rows) => {
                    if (!err && !!rows.length)
                        user = JSON.parse(rows[0].info);
                    buildQuery();
                });
            }
            else {
                buildQuery();
            }
        });
    };

    /* Build Initial SQL Query */
    var buildQuery = (): void => {
        // Select approved ads where advertiser wants more views or clicks,
        // has enough funds to pay cost, daily funds hasn't reached limit,
        // and targetted sites are empty or pub's site is listed
        sql = "SELECT pay_type, cost, available, ad_type, ad_title, ad_description, ad_link, ad_media, "
            + "ut_age, ut_countries, ut_regions, ut_genders, ct_categories, ct_keywords FROM ads"
            + "WHERE approved = 1 AND requested > provided AND funds > cost "
            + "AND IF(ct_sites = '', 1, INSTR(ct_site, '" + pub.site + "') > 0) "
            + "AND IF(daily_funds = 0, 1, daily_funds > daily_funds_used) AND ad_type ";

        // Validate types if multiple provided
        if (!q.type) {
            if (!q.types && !q.types.match(/^[0-9,]{3,7}$/)) {
                cn.release();
                res.json({ ads: [] });
                return;
            }

            q.types = q.types.replace(',', ", ");
        }

        // Make sure ad is of type that publisher is requesting
        sql += q.type ? ("= " + q.type) : ("IN (" + q.types + ")");

        filterAds();
    };

    /* Filter Out Irrelevant Ads */
    var filterAds = (): void => {
        // Variables needed for each row
        var available: string[], avail: string[], isAvailable: boolean;
        var time: number = Math.round(new Date().getTime() / 1000), score: number;
        var age: number, gender: number;

        var query = cn.query(sql);
        query // Loop through each row
        .on("error", err => {
            cn.end();
            cn.release();
            res.json({ ads: [] });
            return;
        })
        .on("result", handleRow)
        .on("end", () => {
            returnAds();
        });

        var handleRow = (ad: IAdsRow) => {
            cn.pause();

            /* Check if ad is available */
            isAvailable = false;
            available = ad.available.split(',');

            // Loop through time ranges: time-time,time-time,...
            for (var i: number; i < available.length; i++) {
                avail = available[i].split('-');

                // Available time hasn't begun
                if (+avail[0] > time) {
                    continue;
                }
                // Available time has begun and hasn't ended yet
                else if (avail[1] == '' || +avail[1] > time) {
                    isAvailable = true;
                    break;
                }
            }

            if (!isAvailable) {
                cn.resume();
                return;
            }

            /* Begin scoring target matches */
            score = 0;

            // Score age range target
            if (q.age || user.age) {
                age = q.age || user.age;

                // Ad accepts any age range: +1
                if (+ad.ut_age == 0)
                    score++;
                // Ad requests a single age range, user matches: +2
                else if (age == +ad.ut_age)
                    score += 2;
                // Ad accepts a list of age ranges, user is in range: +2
                else if (ad.ut_age.indexOf(',') > -1 && ad.ut_age.split(',').indexOf(String(age)) > -1)
                    score += 2;
            }

            // Score gender target
            if (q.gender || user.gender) {
                gender = q.gender || user.gender;

                if (+ad.ut_gender == 0)
                    score++;
                else if (gender == +ad.ut_gender)
                    score += 2;
                else if (ad.ut_gender.indexOf(',') > -1 && ad.ut_gender.split(',').indexOf(String(gender)) > -1)
                    score += 2;
            }

            // Score how well ad's category target matches publisher's categories
            score += categoryMatch(pub.categories.split(','), ad.ct_categories);

            // ** // countries / regions, keywords

            // ** If number of ads with higher scores < ?count, add ad to ads

            cn.resume();
        };
    };

    /* Find Ads to Return from Filtered */
    var returnAds = (): void => {
        // ** If ads.length >= q.count: return ads
        // ** Else: Randomly choose from highest scoring
    };

    /* Update Ad/Pub Campaigns/Reports */
    var updateValues = (): void => {

    };

};