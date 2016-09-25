const mergeList = require("lib/merge/list");
const db = require("lib/db");

/*
    GET api/publishers/campaigns/:id/reports
    REQUIRED
        dates: string
            YYYY-MM-DD
            YYYY-MM-DD:YYYY-MM-DD
    RETURN
        {
            clicks: number, views: number, earnings: number,
            pending: number, ads: string
        }
    DESCRIPTION
        Generates a report for a campaign over a specific time frame
*/
module.exports = function(req, res) {
    
    let dates = req.query.dates.split(':');
    let sql = `
        SELECT clicks, views, earnings, earnings_temp as pending, ads
        FROM pub_reports WHERE id = ? AND day BETWEEN ? AND ?
    `;

    // Single date to date-range (both same day)
    if (dates.length == 1) dates[1] = dates[0];

    db(cn => {
        let report = {
            clicks: 0, views: 0, earnings: 0, pending: "", ads: ""
        };
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
    });

}