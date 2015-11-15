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
        q.count = !q.count ? 1 : q.count;

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
            if (q.keywords) pub.keywords += ',' + q.keywords;

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
        sql = "SELECT id, pay_type, cost, available, ad_type, ad_title, ad_description, ad_media, "
            + "ut_age, ut_countries, ut_regions, ut_genders, ct_categories, ct_keywords FROM ads "
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
        var time: number = Math.round(new Date().getTime() / 1000), score: number;
        var age: number, gender: number, countries: string[], regions: string[];
        var available: string[], avail: string[], isAvailable: boolean;
        var pubKeywords: string[], adKeywords: string[];
        var tAd: IAd, lowestScore: number;

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

            // Score country / regions match
            if (ad.ut_countries == '*') {
                score += 2;
            }
            else {
                countries = ad.ut_countries.split(',');

                // Check if user is in a targeted country
                for (var i: number = 0; i < countries.length; i++) {
                    if (countries[i] == user.country) {
                        // Get array of regions within user's country
                        regions = ad.ut_regions.split('|')[i].split(',');

                        // Check if user is in a targeted region within targeted country
                        for (var j: number = 0; i < regions.length; i++) {
                            if (regions[j] == user.region) {
                                score += 2;
                                break;
                            }
                        }

                        score += 2;
                        break;
                    }
                }
            }

            // Score how well ad's / pub's keywords match
            adKeywords = ad.ct_keywords.split(',');
            pubKeywords = pub.keywords.split(',');
            for (var i: number = 0; i < adKeywords.length; i++) {
                // Check for exact keyword match
                if (pubKeywords.indexOf(adKeywords[i]) > -1)
                    score += 2;
                // Check for partial match
                else if (pub.keywords.indexOf(ad.ct_keywords) > -1)
                    score++;
            }

            /* Determine whether ad should have chance of return based on score */
            // Publisher wants more ads than we've found: add no matter what
            if (ads.length < q.count) {
                addAd();
            }
            // We've already found enough ads to meet publisher's count
            // Check if we have enough ads with score higher or equal than ad
            else {
                // Find lowest score
                for (var i: number = 0; i < ads.length; i++) {
                    if (ads[i].score < lowestScore) lowestScore = ads[i].score;
                }

                // Current ad's score is greater than lowest
                if (score > lowestScore) {
                    // Remove an ad where score is <= lowest
                    for (var i: number = 0; i < ads.length; i++) {
                        if (ads[i].score <= lowestScore) {
                            ads.splice(i, 1);
                            break;
                        }
                    }

                    addAd();
                }
            }

            // Build an IAd object and push it to ads[]
            var addAd = (): void => {
                tAd = {
                    type: ad.ad_type, link: "", title: ad.ad_title,
                    description: ad.ad_description, score: score
                };

                if (!!ad.ad_media) tAd.media = ad.ad_media;

                // Build link user will go to when clicking ad
                tAd.link = "https://ads.xyfir.com/click/?pub=" + q.pubid + "&ad=" + ad.id
                    + "&score=" + score + "&served=" + time + (q.xadid ? ("&xad=" + q.xadid) : "");

                ads.push(tAd);
            };

            cn.resume();
        };
    };

    /* Find Ads to Return from Filtered */
    var returnAds = (): void => {
        // More ads found than requested: choose from highest scoring
        if (ads.length > q.count) {
            // Order array by descending score
            ads.sort((a: IAd, b: IAd): number => {
                if (a.score < b.score) return 1;
                else if (a.score > b.score) return -1;
                else return 0;
            });

            // Delete lowest scoring, extra elements from end of array
            ads.splice(q.count, ads.length - q.count);
        }

        res.json({ ads: ads });
        updateValues();
    };

    /* Update Ad/Pub Campaigns/Reports */
    var updateValues = (): void => {

    };

};
