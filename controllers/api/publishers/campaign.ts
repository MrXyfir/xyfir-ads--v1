import mergeObject = require("../../../lib/merge/object");
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
        var sql: string, response = { error: true, message: "An unkown error occured" };

        sql = "DELETE FROM pubs WHERE id = ? AND owner = ?";
        db(cn => cn.query(sql, [req.params.id, req.session.uid], (err, result) => {
            if (err) {
                cn.release();
                res.json(response);
                return;
            }

            sql = "DELETE FROM clicks WHERE pub_id = ?";
            cn.query(sql, [req.params.id], (err, result) => {
                if (err) {
                    cn.release();
                    res.json(response);
                    return;
                }

                sql = "DELETE FROM pub_reports WHERE id = ?";
                cn.query(sql, [req.params.id], (err, result) => {
                    cn.release();

                    if (err)
                        res.json(response);
                    else
                        res.json({ error: false, message: "Campaign successfully deleted" });
                });
            });
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

    }

};