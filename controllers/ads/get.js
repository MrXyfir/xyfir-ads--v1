const categoryMatch = require("lib/category/match");
const mergeObject = require("lib/merge/object");
const ip2geo = require("lib/ip2geo");
const rand = require("lib/rand");
const db = require("lib/db");

/*
    GET api/ads
    REQUIRED
        pubid: number, type: number OR types: string
    OPTIONAL
        xadid: string, count: number, speed: number,
        ip: string, age: number, gender: number,
        categories: string, keywords: string,
        test: string
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
module.exports = function(req, res) {

    res.append("Access-Control-Allow-Origin", true);

    // pubid is required
    if (!req.query.pubid) {
        res.json({ ads: ['-'] });
        return;
    }
    // Setup variables
    else {
        let q = req.query, ads = [], testMode, sql, cn, pub, user;
        req.query = null;

        q.speed = !q.speed ? 0 : q.speed;
        q.count = !q.count ? 1 : q.count;
        q.count = q.count > 5 ? 5 : q.count;

        db(connection => {
            cn = connection;

            if (q.test) {
                // If publisher provided valid test key, enable testMode
                sql = "SELECT id FROM pubs WHERE id = ? AND test = ?";
                cn.query(sql, [q.pubid, q.test], (err, rows) => {
                    testMode = rows.length == 1;
                    initialData();
                });
            }
            else {
                testMode = false;
                initialData();
            }
        });
    }

    /* Get/Prepare Info Needed Later */
    const initialData = () => {
        // Grab pub campaign's information
        sql = "SELECT categories, keywords, site, type FROM pubs WHERE id = ?";
        cn.query(sql, [q.pubid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ ads: ['--'] });
                return;
            }

            pub = rows[0];

            if (q.categories) pub.categories += ',' + q.categories;
            if (q.keywords) pub.keywords += ',' + q.keywords;

            // Grab user's country and region codes
            // user == { country: "", region: "" }
            user = ip2geo(q.ip || req.ip);

            // Grab user's information from their xad-id
            if (q.xadid && (!q.age || !q.gender)) {
                sql = "SELECT info FROM xad_ids WHERE xad_id = ?";
                cn.query(sql, [q.xadid], (err, rows) => {
                    if (!err && !!rows.length) {
                        // add age/gender/etc to user object
                        user = mergeObject(user, JSON.parse(rows[0].info));
                    }
                    buildQuery();
                });
            }
            else {
                buildQuery();
            }
        });
    };

    /* Build Initial SQL Query */
    const buildQuery = () => {
        // Select approved ads where advertiser wants more views or clicks,
        // has enough funds to pay cost, daily funds hasn't reached limit,
        // targetted sites are empty or pub's site is listed,
        // and is not in publisher's blacklisted ads
        sql = `
            SELECT
                id, pay_type, cost, available, ad_type, ad_title, ad_description, ad_media,
                pay_modifier, ut_age, ut_countries, ut_regions, ut_genders, ct_categories, ct_keywords
            FROM ads WHERE approved = 1
                AND requested > provided AND funds > cost
                AND IF(ct_sites = '*', 1, INSTR(ct_sites, '" + pub.site + "') > 0)
                AND id NOT IN (
                    SELECT ad_id FROM ads_blacklisted WHERE pub_id = ${+req.query.pubid}
                ) AND IF(daily_funds = 0, 1, daily_funds > daily_funds_used) AND ad_type
        `;

        // Validate types if multiple provided
        if (!q.type) {
            if (!q.types || !q.types.match(/^[0-9,]{3,7}$/)) {
                cn.release();
                res.json({ ads: ['---'] });
                return;
            }

            q.types = q.types.replace(',', ", ");
        }

        // Make sure ad is of type that publisher is requesting
        sql += q.type ? ("= " + q.type) : ("IN (" + q.types + ")");

        // Ads with higher bids will be checked first
        sql += " ORDER BY cost DESC";

        filterAds();
    };

    /* Filter Out Irrelevant Ads */
    const filterAds = () => {
        // Variables needed for each row
        let time = Math.round(new Date().getTime() / 1000), score;
        let age, gender, countries, regions;
        let available, avail, isAvailable;
        let pubKeywords, adKeywords;
        let tAd, lowestScore;

        // Determine if ad at row has chance of being returned
        const handleRow = (ad) => {
            cn.pause();

            // If publisher is requesting a speedy response, we have enough ads,
            // and rand() returns a 1: skip this row
            if (q.speed > 0 && ads.length >= q.count && rand(0, 2) == 1) {
                cn.resume();
                return;
            }

            /* Check if ad is available */
            isAvailable = false;
            available = ad.available.split(',');

            // Loop through time ranges: time-time,time-time,...
            for (let i = 0; i < available.length; i++) {
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
                // Ad accepts a list of age ranges, user is in range: +2
                else if (ad.ut_age.indexOf(',') > -1 && ad.ut_age.split(',').indexOf(String(age)) > -1)
                    score += 2;
                // Ad requests a single age range, user matches: +2
                else if (age == +ad.ut_age)
                    score += 2;
            }

            // Score gender target
            if (q.gender || user.gender) {
                gender = q.gender || user.gender;
                
                if (+ad.ut_genders == 0)
                    score++;
                else if (ad.ut_genders.indexOf(',') > -1 && ad.ut_genders.split(',').indexOf(String(gender)) > -1)
                    score += 2;
                else if (gender == +ad.ut_genders)
                    score += 2;
            }

            // Score country / regions match
            if (ad.ut_countries == '*') {
                score += 2;
            }
            else {
                countries = ad.ut_countries.split(',');
                
                // Check if user is in a targeted country
                for (let i = 0; i < countries.length; i++) {
                    if (countries[i] == user.country) {
                        // Get array of regions within user's country
                        regions = ad.ut_regions.split('|')[i].split(',');
                        
                        if (regions[0] == '*') {
                            score += 2;
                        }
                        else {
                            // Check if user is in a targeted region within targeted country
                            for (let j = 0; i < regions.length; i++) {
                                if (regions[j] == user.region) {
                                    score += 2;
                                    break;
                                }
                            }
                        }

                        score += 2;
                        break;
                    }
                }
            }

            // Skip category / keyword scoring if speed > 0
            if (q.speed == 0) {
                // Score how well ad's category target matches publisher's categories
                // +1 for each category level matched
                score += categoryMatch(pub.categories.split(','), ad.ct_categories);

                adKeywords = ad.ct_keywords.split(',');
                pubKeywords = pub.keywords.split(',');

                // Score how well ad's / pub's keywords match
                // +1 for partial match, +2 for exact match
                for (let i = 0; i < adKeywords.length; i++) {
                    // Check for exact keyword match
                    if (pubKeywords.indexOf(adKeywords[i]) > -1)
                        score += 2;
                    // Check for partial match
                    else if (pub.keywords.indexOf(adKeywords[i]) > -1)
                        score++;
                }
            }

            // Finds the lowest score in ads[]
            const setLowestScore = () => {
                lowestScore = 0;
                for (let i = 0; i < ads.length; i++) {
                    if (ads[i].score < lowestScore)
                        lowestScore = ads[i].score;
                }
            };

            // Build an IAd object and push it to ads[]
            const addAd = () => {
                tAd = {
                    type: ad.ad_type, link: "", title: ad.ad_title, score: score,
                    description: ad.ad_description, id: ad.id,
                    cost: ad.cost, payType: ad.pay_type
                };

                if (ad.ad_media != "") tAd.media = ad.ad_media;

                // Build link user will go to when clicking ad
                tAd.link = "https://ads.xyfir.com/api/click?pub=" + q.pubid
                    + "&ad=" + ad.id + "&score=" + score + "&served=" + time
                    + ((q.gender || user.gender) ? ("&g=" + gender) : "")
                    + ((q.age || user.age) ? ("&a=" + age) : "")
                    + (testMode ? ("&test=" + q.test) : "")
                    + (q.xadid ? ("&xad=" + q.xadid) : "");

                ads.push(tAd);
            };

            /* Determine whether ad should have chance of return based on score */
            // Publisher wants more ads than we've found: add no matter what
            // If we have enough ads but speed > 0: add anyways to save time
            if (ads.length < q.count || !!q.speed) {
                addAd();
            }
            // We've already found enough ads to meet publisher's count
            // Check if we have enough ads with score higher or equal than ad
            else {
                if (lowestScore == undefined)
                    setLowestScore();

                // Current ad's score is greater than lowest
                if (score > lowestScore) {
                    // Remove an ad where score is <= lowest
                    for (let i = 0; i < ads.length; i++) {
                        if (ads[i].score <= lowestScore) {
                            ads.splice(i, 1);
                            setLowestScore();
                            break;
                        }
                    }
                    addAd();
                }
            }

            cn.resume();
        };

        let query = cn.query(sql);
        query // Loop through each row
            .on("error", err => {
                cn.release();
                res.json({ ads: ['----'] });
                return;
            })
            .on("result", handleRow)
            .on("end", () => {
                returnAds();
            });
    };

    /* Find Ads to Return from Filtered */
    const returnAds = () => {
        // More ads found than requested: choose from highest scoring
        if (ads.length > q.count) {
            // Order array by descending score
            ads.sort((a, b) => {
                if (a.score < b.score) return 1;
                else if (a.score > b.score) return -1;
                else return 0;
            });

            // Delete lowest scoring, extra elements from end of array
            ads.splice(q.count, ads.length - q.count);
        }

        // Create a copy of ads[] we can modify
        let adsTemp = ads.map(ad => {
            return JSON.parse(JSON.stringify(ad));
        });

        // Remove ad properties publisher doesn't need
        for (let i = 0; i < adsTemp.length; i++) {
            delete adsTemp[i].payType;
            delete adsTemp[i].score;
            delete adsTemp[i].cost;
            delete adsTemp[i].id;
        }

        res.json({ ads: adsTemp });
        adsTemp = [];

        // Begin updating values for ads in ads[]
        // Start with ad at ads[0]
        updateValues(0);
    };

    /* Update Ad/Pub Campaigns/Reports */
    // Recursively loops until all returned ads are updated
    const updateValues = (i) => {
        // If index in ads[] does not exist: quit
        // Don't update values in test mode
        if (testMode || ads[i] == undefined) {
            cn.release();
            return;
        }

        // Determine if we should charge campaign for view 
        // CPC ads have chance of being charged click amount for view
        const chargeView = ads[i].pay_type == 1
            ? rand(1, ads[i].pay_modifier) == 1
            : rand(1, 101) < ads[i].pay_modifier;

        // Update Ad Campaign
        // CPC
        if (ads[i].pay_type == 1 && chargeView) {
            // Decrement funds by cost of click
            // Increment daily_funds_used if daily_funds > 0
            sql = `
                UPDATE ads SET
                    funds = funds - cost,
                    daily_funds_used = CASE WHEN daily_funds > 0
                        THEN daily_funds_used + cost ELSE 0 END
                WHERE id = ?
            `;
        }
        // CPV
        else if (ads[i].pay_type == 2 && chargeView) {
            // Decrement funds by cost of CPV
            // Increment requested
            // Increment daily_funds_used if daily_funds > 0
            sql = `
                UPDATE ads SET
                    funds = funds - cost,
                    requested = FROM ads requested + 1 ELSE requested END,
                    daily_funds_used = CASE WHEN daily_funds > 0
                        THEN daily_funds_used + cost ELSE 0 END
                WHERE id = ?
            `;
        }
        else {
            sql = "SELECT 1";
        }
        
        cn.query(sql, [ads[i].id], (err, result) => {
            // Update ad report: views / cost
            sql = `
                UPDATE ad_reports SET views = views + 1,
                cost = cost ${chargeView ? `+ ${ads[i].cost}` : ""}
                WHERE id = ? AND day = CURDATE()
            `;

            cn.query(sql, [ads[i].id], (err, result) => {
                // Update pub report: views / earnings
                sql = `
                    UPDATE pub_reports SET views = views + 1,
                        earnings = earnings ${chargeView ? `+ ${ads[i].cost}` : ""}
                    WHERE id = ? AND day = CURDATE()
                `;

                cn.query(sql, [q.pubid], (err, result) => {
                    // Update values for next add in array
                    updateValues(i + 1);
                }); // pub rep
            }); // ad rep
        }); // ad camp
    };

};
