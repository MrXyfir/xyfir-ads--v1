import db = require("../lib/db");

/*
    Creates new reports for ad and pub campaigns for current day
    Error Codes:
        0 - none, 1 - db error, 2 - current date already has reports
*/
export = (fn: any): void => db(cn => {
    
    var sql: string;

    // Check if current date already has reports
    sql = "SELECT COUNT(*) as count FROM ad_reports WHERE day = CURDATE()";
    cn.query(sql, (err, rows) => {
        if (err || rows[0].count > 0) {
            cn.release();
            fn(!!err ? 1 : 2);
        }
        else {
            createReports();
        }
    });

    var createReports = (): void => {
        // Create new ad reports for active campaigns
        sql = "INSERT INTO ad_reports (id, day) SELECT id, CURDATE() FROM ads";
        cn.query(sql, (err, result) => {
            if (err) {
                cn.release();
                fn(1);
                return;
            }

            // Create new pub reports for each pub campaign
            sql = "INSERT INTO pub_reports (id, day) SELECT id, CURDATE() FROM pubs";
            cn.query(sql, (err, result) => {
                cn.release();

                fn(!!err ? 1 : 0);
            });
        });
    };
});