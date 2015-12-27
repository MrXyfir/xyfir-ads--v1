import db = require("../lib/db");

/*
    Creates new reports for ad and pub campaigns for next day
    Error Codes:
        0 - none, 1 - db error
*/
export = (fn: any): void => db(cn => {
    
    var sql: string = "";

        // Insert into ad_reports with id and day
    sql = "INSERT INTO ad_reports (id, day) "
        // Where ad in ads is approved AND ...
        + "SELECT id, DATE_ADD(CURDATE(), INTERVAL 1 DAY) FROM ads WHERE approved = 1 AND NOT EXISTS "
        // Where report DOES NOT exists with id/day
        + "(SELECT * FROM ad_reports WHERE ad_reports.id = ads.id AND ad_reports.day = DATE_ADD(CURDATE(), INTERVAL 1 DAY))";

    cn.query(sql, (err, result) => {
        if (err) {
            cn.release();
            fn(1);
            return;
        }

            // Insert into pub_reports with id and day
        sql = "INSERT INTO pub_reports (id, day) "
            // Where pub from pubs DOES NOT have a report for day
            + "SELECT id, DATE_ADD(CURDATE(), INTERVAL 1 DAY) FROM pubs WHERE NOT EXISTS"
            + "(SELECT * FROM pub_reports WHERE pub_reports.id = pubs.id AND pub_reports.day = DATE_ADD(CURDATE(), INTERVAL 1 DAY))";
        cn.query(sql, (err, result) => {
            cn.release();

            fn(!!err ? 1 : 0);
        });
    });

});