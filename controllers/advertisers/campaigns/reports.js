const mergeObject = require("lib/merge/object");
const mergeList = require("lib/merge/list");
const db = require("lib/db");

/*
    GET api/advertisers/campaigns/:id/reports
    REQUIRED
        dates: string
            YYYY-MM-DD
            YYYY-MM-DD:YYYY-MM-DD
    RETURN
        {
            clicks: number, views: number, cost: number, publishers: string,
            dem_age: string, dem_gender: string, dem_geo: string,
        }
    DESCRIPTION
        Generates a report for a campaign over a specific time frame
*/
module.exports = function(req, res) {

    let dates = req.query.dates.split(':');
    let sql = "SELECT * FROM ad_reports WHERE id = ? AND day BETWEEN ? AND ?";

    // Single date to date-range (both same day)
    if (dates.length == 1) dates[1] = dates[0];
    
    db(cn => {
        let report = {
            clicks: 0, views: 0, cost: 0, publishers: "",
            dem_age: "", dem_gender: "", dem_geo: {}
        };
        
        let query = cn.query(sql, [req.params.id, dates[0], dates[1]]);

        query
        .on("error", err => {
            cn.end();
            cn.release();
            res.json({});
            return;
        })
        .on("result", row => {
            cn.pause();
            
            // Add values of new row to total
            report.clicks += row.clicks;
            report.views += row.views;
            report.cost += row.cost;

            // Merge lists / objects
            report.publishers = mergeList(report.publishers.split(','), row.publishers.split(','));
            report.dem_gender = mergeList(report.dem_gender.split(','), row.dem_gender.split(','));
            report.dem_age = mergeList(report.dem_age.split(','), row.dem_age.split(','));
            report.dem_geo = mergeObject(report.dem_geo, JSON.parse(row.dem_geo));

            cn.resume();
        })
        .on("end", () => {
            cn.release();
            res.json(report);
        });
    });

}