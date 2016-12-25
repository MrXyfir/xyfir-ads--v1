const mergeObject = require("lib/merge/object");
const mergeList = require("lib/merge/list");
const crypto = require("lib/crypto");
const ip2geo = require("lib/ip2geo");
const db = require("lib/db");

const config = require("config");

/*
    GET api/click
    REQUIRED
        c: encrypted-json-string {
            pub: number, ad: number, served: unix-timestamp,
            score: number, age: number, gender: number,
            xad[id]?: string, test[Key]?: string
        }
    DESCRIPTION
        Gathers information about click and updates campaigns/reports
        Saves information about click in clicks table
        Redirects user to ad's provided link
*/
module.exports = function(req, res) {

    // Decrypt / parse req.query.c
    try {
        const q = JSON.parse(
            crypto.decrypt(req.query.c, config.keys.encrypt)
        );
    }
    catch (e) {
        res.redirect("https://xyfir.com/");
        return;
    }

    let sql = "", vars = [];

    let adReport, pubReport, geo, cn, link, testMode;
    let cost = 0;
    let cpc = false;

    db(connection => {
        cn = connection;

        // Set testMode boolean
        if (q.test) {
            sql = `
                SELECT id FROM pubs WHERE id = ? AND test = ?
            `, vars = [
                q.pub, q.test
            ];

            cn.query(sql, vars, (err, rows) => {
                testMode = !!rows.length;
                getData();
            });
        }
        else {
            testMode = false;
            getData();
        }
    });

    /* Grab Initial Data / Update Ad */
    const getData = () => {
        geo = ip2geo(req.ip);

        // Grab data we need to update for ad report
        sql = `
            SELECT
                dem_age, dem_gender, dem_geo, publishers
            FROM ad_reports
            WHERE
                id = ? AND day = CURDATE()
        `, vars = [
            q.ad
        ];

        cn.query(sql, vars, (err, rows) => {
            if (err || rows.length == 0) {
                res.redirect("https://xyfir.com/");
                return;
            }

            adReport = rows[0];

            // Grab data we need to update for pub report
            sql = `
                SELECT ads FROM pub_reports WHERE id = ? AND day = CURDATE()
            `, vars = [
                q.pub
            ];

            cn.query(sql, vars, (err, rows) => {
                if (err || rows.length == 0) {
                    res.redirect("https://xyfir.com/");
                    return;
                }

                pubReport = rows[0];

                // Grab needed info from ad
                sql = `
                    SELECT ad_link, pay_type, cost FROM ads WHERE id = ?
                `, vars = [
                    q.ad
                ];

                cn.query(sql, vars, (err, rows) => {
                    if (err || rows.length == 0) {
                        res.redirect("https://xyfir.com/");
                        return;
                    }

                    link = rows[0].ad_link;
                    if (rows[0].pay_type == 1) {
                        cpc = true, cost = rows[0].cost;
                    }

                    if (testMode) {
                        // Don't update ad and skip updateReports()
                        finish();
                    }
                    else {
                        // Update ad if ad is cost-per-click
                        sql = `
                            UPDATE ads SET
                                funds = CASE WHEN pay_type = 1
                                    THEN funds - cost ELSE funds
                                END,
                                requested = CASE WHEN pay_type = 1
                                    THEN requested + 1 ELSE requested
                                END,
                                daily_funds_used = CASE WHEN daily_funds > 0
                                    THEN daily_funds_used + cost ELSE 0
                                END
                            WHERE id = ?
                        `, vars = [
                            q.ad
                        ];

                        cn.query(sql, vars, (err, result) => updateReports());
                    }
                }); // ad link
            }); // pub report
        }); // ad report
    };

    /* Update Values for Pub/Ad Reports */
    const updateReports = () => {
        // Increment optional ad_reports values
       adReport.dem_age = q.a
            ? mergeList(adReport.dem_age.split(','), [q.a + ":1"])
            : adReport.dem_age;
        
        adReport.dem_gender = q.g
            ? mergeList(adReport.dem_gender.split(','), [q.g + ":1"])
            : adReport.dem_gender;

        // Increment required ad_reports values
        adReport.publishers = mergeList(
            adReport.publishers.split(','), [q.pub + ":1"]
        );

        // This is the ad's first click of the day, start new dem_geo object
        if (adReport.dem_geo == "") {
            adReport.dem_geo = `{"${geo.country}":{"${geo.region}":1}}`;
        }
        // Merge object {COUNTRY:{REGION:1}} with previous dem_geo object
        else {
            adReport.dem_geo = JSON.stringify(mergeObject(
                JSON.parse(adReport.dem_geo),
                JSON.parse(`{"${geo.country}":{"${geo.region}":1}}`)
            ));
        }

        // Increment required pub_reports value
        pubReport.ads = mergeList(
            pubReport.ads.split(','), [q.ad + ":1"]
        );

        // Update ad_report values
        sql = `
            UPDATE ad_reports SET
                dem_age = ?, dem_gender = ?, dem_geo = ?, publishers = ?,
                cost = CASE WHEN ? THEN cost + ? ELSE cost END,
                clicks = clicks + 1
            WHERE
                id = ? AND day = CURDATE()
        `, vars = [
            adReport.dem_age, adReport.dem_gender, adReport.dem_geo,
            adReport.publishers, cpc, cost,
            q.ad
        ];

        cn.query(sql, vars, (err, result) => {
            if (err || !result.affectedRows) {
                finish();
                return;
            }

            // Update pub_report values
            sql = `
                UPDATE pub_reports SET
                    ads = ?, clicks = clicks + 1, earnings_temp = CASE WHEN ?
                        THEN earnings_temp + ? ELSE earnings_temp
                    END
                WHERE
                    id = ? AND day = CURDATE()
            `, vars = [
                pubReport.ads, cpc,
                cost,
                q.pub
            ];

            cn.query(sql, vars, (err, result) => finish());
        });
    };

    /* Clicks Table / Redirect User */
    const finish = () => {
        // Only clicks on CPC ads need to be validated
        // Don't add click to table if in test mode
        if (cpc && !testMode) {
            // Generate browser signature
            let signature = req.useragent.browser
                + ';' + req.useragent.version
                + ';' + req.useragent.os;

            signature = signature // Shorten length of signature
                .replace(/\s/g, "").replace("Windows", "Win")
                .replace("Internet Explorer", "IE").replace("Firefox", "FF")
                .replace("Ubuntu", "Ubu").replace("Safara", "SF")
                .replace("Chrome", "CH").replace("Opera", "OP");

            signature = signature.length > 32
                ? signature.substr(0, 32) : signature;

            // Add row to clicks table
            const insert = {
                ad_id: q.ad, pub_id: q.pub, served: q.served,
                ip: req.ip, clicked: (Date.now() / 1000), signature,
                xad_id: "", cost
            };
            insert.xad_id = q.xad ? q.xad : "";

            sql = "INSERT INTO clicks SET ?";
            cn.query(sql, insert, (err, result) => cn.release());
        }

        // Redirect user to ad's link
        res.redirect(link);
    };

};