import mergeObject = require("../../../lib/merge/object");
import mergeList = require("../../../lib/merge/list");
import db = require("../../../lib/db");

export = {

    /*
        GET api/publishers/campaigns/:id
        RETURN
            {
                name: string, categories: string, keywords: string, site: string,
                type: number, ?clicks: number, ?views: number,
                ?earnings: number, ?pending: number
            }
        DESCRIPTION
            Returns all information relating specifically to pub campaign
            Returns a basic report for this current month
    */
    getSingle: (req, res) => {
        var sql: string, response: any;

        // Grab the campaign's basic information
        sql = "SELECT name, categories, keywords, site, type FROM pubs WHERE id = ? AND owner = ?";
        db(cn => cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

            if (err || rows.length == 0) {
                cn.release();
                res.json({});
                return;
            }

            response = rows[0];

            // Grab info for basic report of current month
            sql = "SELECT SUM(clicks) as clicks, SUM(views) as views, SUM(earnings) as earnings, "
                + "SUM(earnings_temp) as pending FROM pub_reports WHERE id = ? AND MONTH(day) = MONTH(CURDATE())";
            cn.query(sql, [req.params.id], (err, rows) => {
                cn.release();

                if (err || rows.length == 0)
                    res.json(response);
                else
                    res.json(mergeObject(response, rows[0]));
            });
        }));
    },

    /*
        DELETE api/publishers/campaigns/:id
        RETURN
            { error: boolean, message: string }
        DESCRIPTION
            Deletes campaign, reports, and pending clicks
            All pending/confirmed earnings are lost
    */
    remove: (req, res) => {
        var sql: string;

        sql = "DELETE FROM pubs WHERE id = ? AND owner = ?";
        db(cn => cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
            if (err || !result.affectedRows) {
                cn.release();
                res.json({ error: true, message: "An unkown error occured" });
                return;
            }

            sql = "DELETE FROM clicks WHERE pub_id = ?";
            cn.query(sql, [req.params.id], (err, result) => {

                sql = "DELETE FROM pub_reports WHERE id = ?";
                cn.query(sql, [req.params.id], (err, result) => {
                    cn.release();

                    res.json({ error: false, message: "Campaign successfully deleted" });
                });
            });
        }));
    },

    /*
        PUT api/publishers/campaigns/:id
        REQUIRED
            name: string, categories: string, keywords: string,
            site: string, type: number
        RETURN
            { error: boolean, message: string }
        DESCRIPTION
            Allows user to update various campaign values
    */
    update: (req, res) => {
        var response: any = { error: false, message: "Campaign updated successfully" };

        if (!req.body.name.match(/^[\w\d -]{3,25}$/))
            response = { error: true, message: "Invalid campaign name format or length" };
        else if (!req.body.keywords.match(/^[\w\d ,-]{0,1599}$/))
            response = { error: true, message: "Invalid keywords format or length" };
        else if (!req.body.site.match(/^https?:\/\/[\w\d-.\/]{1,66}$/))
            response = { error: true, message: "Invalid website format or length" };
        else if (req.body.type < 0 || req.body.type > 2)
            response = { error: true, message: "Invalid campaign type" };
        else if (!require("../../../lib/category/validator")(req.body.categories))
            response = { error: true, message: "Invalid categories provided" };

        if (response.error) {
            res.json(response);
            return;
        }

        var sql: string = "UPDATE pubs "
            + "SET name = ?, keywords = ?, site = ?, type = ?, categories = ? "
            + "WHERE id = ? AND owner = ?";
        var update: any[] = [
            req.body.name, req.body.keywords, req.body.site, req.body.type, req.body.categories,
            req.params.id, req.session.uid
        ];

        db(cn => cn.query(sql, update, (err, result) => {
            cn.release();

            if (err)
                res.json({ error: true, message: "An unknown error occured" });
            else
                res.json(response);
        }));
    },

    /*
        GET api/publishers/campaigns/:id/reports
        REQUIRED
            dates: "2015-07-20|2015-07-20:2015-07-30"
        RETURN
            {
                clicks: number, views: number, earnings: number,
                pending: number, ads: string
            }
        DESCRIPTION
            Generates a report for a campaign over a specific time frame
    */
    reports: (req, res) => {
        db(cn => {
            var sql: string;

            // Generate a report for a single day
            if (req.query.dates.match(/^\d{4}-\d{2}-\d{2}$/)) {

                sql = "SELECT clicks, views, earnings, earnings_temp as pending, ads "
                + "FROM pub_reports WHERE id = ? AND day = ?";
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
                    clicks: 0, views: 0, earnings: 0, pending: "", ads: ""
                };

                sql = "SELECT clicks, views, earnings, earnings_temp as pending, ads "
                + "FROM pub_reports WHERE id = ? AND day BETWEEN ? AND ? ";
                var query = cn.query(sql, [req.params.id, dates[0], dates[1]]);

                query // Loop through each row
                    .on("error", err => {
                        cn.end();
                        cn.release();
                        res.json({});
                        return;
                    })
                    .on("result", row => {
                        cn.pause();
                    
                        // Add values of new row to total
                        report.earnings += row.earnings;
                        report.pending += row.pending;
                        report.clicks += row.clicks;
                        report.views += row.views;

                        // Merge top ad campaign lists
                        report.ads = mergeList(report.ads.split(','), row.ads.split(','));

                        cn.resume();
                    })
                    .on("end", () => {
                        cn.release();
                        res.json(report);
                    });
            }

            else {
                res.json({});
            }
        });
    }

};