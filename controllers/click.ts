/// <reference path="../typings/controllers/click.d.ts" />

import mergeObject = require("../lib/merge/object");
import mergeList = require("../lib/merge/list");
import ip2geo = require("../lib/ip2geo");
import db = require("../lib/db");

/*
    GET /click
    REQUIRED
        pub: number, ad: number, served: unix-ts-string
    OPTIONAL
        score: number, xad[id]: string, a[ge]: number,
        g[ender]: number
    DESCRIPTION
        Gathers information about click and updates campaigns/reports
        Saves information about click in clicks table
        Redirects user to ad's provided link
*/
export = (req, res) => {

    var adReport: IAdReport, pubReport: IPubReport, geo: IGeo, cn: any, sql: string,
        link: string, cpc: boolean = false, cost: number = 0;

    /* Grab Initial Data */
    var getData = (): void => {
        ip2geo(req.ip, (info: IGeo) => {
            geo = info; info = null;
            
            db(connection => {
                cn = connection;

                // Grab data we need to update for ad report
                sql = "SELECT dem_age, dem_gender, dem_geo, publishers FROM ad_reports "
                    + "WHERE id = ? AND day = CURDATE()";
                cn.query(sql, [req.ad], (err, rows) => {
                    if (err || rows.length == 0) {
                        res.redirect("https://xyfir.com/");
                        return;
                    }

                    adReport = rows[0];

                    // Grab data we need to update for pub report
                    sql = "SELECT ads FROM pub_reports WHERE id = ? AND day = CURDATE()";
                    cn.query(sql, [req.pub], (err, rows) => {
                        if (err || rows.length == 0) {
                            res.redirect("https://xyfir.com/");
                            return;
                        }

                        pubReport = rows[0];

                        // Grab needed info from ad
                        sql = "SELECT ad_link, pay_type, cost FROM ads WHERE id = ?";
                        cn.query(sql, [req.ad], (err, rows) => {
                            if (err || rows.length == 0) {
                                res.redirect("https://xyfir.com/");
                                return;
                            }

                            link = rows[0].ad_link;
                            if (rows[0].pay_type) {
                                cpc = true, cost = rows[0].cost;
                            }

                            // Update ad if ad is cost-per-click
                            sql = "UPDATE ads SET "
                            + "funds = CASE WHEN pay_type = 1 THEN funds - cost ELSE funds END, "
                            + "requested = CASE WHEN pay_type = 1 THEN requested + 1 ELSE requested END, "
                            + "daily_funds_used = CASE WHEN daily_funds > 0 THEN daily_funds_used + cost ELSE 0 END "
                            + "WHERE id = ?";
                            cn.query(sql, [req.ad], (err, result) => updateReports());
                        }); // ad link
                    }); // pub report
                }); // ad report
            }); // db(...)
        }); // ip2geo
    };

    /* Update Values for Pub/Ad Reports */
    var updateReports = (): void => {
        // Increment optional ad_reports values
        if (req.query.a)
            adReport.dem_age = mergeList(adReport.dem_age.split(','), [req.query.a + ":1"]);
        if (req.query.g)
            adReport.dem_gender = mergeList(adReport.dem_gender.split(','), [req.query.g + ":1"]);

        // Increment required ad_reports values
        adReport.publishers = mergeList(adReport.publishers.split(','), [req.query.pub + ":1"]);
        adReport.dem_geo = mergeObject(
            adReport.dem_geo,
            JSON.parse("{\"" + geo.country + "\":{\"" + geo.region + "\":1}}")
        );

        // Increment required pub_reports value
        pubReport.ads = mergeList(pubReport.ads.split(','), [req.query.ad + ":1"]);

        // Update ad_report values
        sql = "UPDATE ad_reports SET dem_age = ?, dem_gender = ?, dem_geo = ?, publishers = ?, "
            + "click = clicks + 1, cost = CASE WHEN ? THEN cost + ? ELSE cost END "
            + "WHERE id = ? AND day = CURDATE()";
        var values = [
            adReport.dem_age, adReport.dem_gender, adReport.dem_geo,
            adReport.publishers, cpc, cost, req.query.ad
        ];
        cn.query(sql, values, (err, result) => {
            if (err) {
                finish();
                return;
            }

            // Update pub_report values
            sql = "UPDATE pub_reports SET ads = ?, clicks = clicks + 1, earnings_temp = "
                + "CASE WHEN ? THEN earnings_temp + ? ELSE earnings_temp END "
                + "WHERE id = ? AND day = CURDATE()";
            cn.query(sql, [pubReport.ads, cpc, cost, req.query.pub], (err, result) => finish());
        });
    };

    /* Clicks Table / Redirect User */
    var finish = (): void => {
        // Generate browser signature
        var signature: string = req.useragent.browser + ';' + req.useragent.version + ';' + req.useragent.os;

        // Shorten length of signature
        signature.replace(' ', '').replace('.', '').replace("Windows", "Win")
            .replace("Internet Explorer", "IE").replace("Firefox", "FF")
            .replace("Ubuntu", "Ubu").replace("Safara", "SF")
            .replace("Chrome", "CH").replace("Opera", "OP");

        signature = signature.length > 32 ? signature.substr(0, 32) : signature;

        // Add row to clicks table
        var insert = {
            ad_id: req.query.ad, pub_id: req.query.pub, served: new Date(req.query.served),
            ip: req.ip, clicked: new Date(), signature: signature, xad_id: ""
        };
        insert.xad_id = req.query.xad ? req.query.xad : "";

        sql = "INSERT INTO clicks SET ?";
        cn.query(sql, insert, (err, result) => cn.release());

        // Redirect user to ad's link
        res.redirect(link);
    };

};