const mergeList = require("lib/merge/list");
const db = require("lib/db");

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
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

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
            // Setup letiables
            let dates = req.query.dates.split(':');
            let report = {
                clicks: 0, views: 0, earnings: 0, pending: "", ads: ""
            };

            sql = "SELECT clicks, views, earnings, earnings_temp as pending, ads "
            + "FROM pub_reports WHERE id = ? AND day BETWEEN ? AND ? ";
            let query = cn.query(sql, [req.params.id, dates[0], dates[1]]);

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