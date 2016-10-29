const db = require("lib/db");

/*
    Creates new reports for ad and pub campaigns for next day
*/
module.exports = (fn) => db(cn => {
    
    let sql = "";

    // Insert into ad_reports with id and day
    sql = `
        INSERT INTO ad_reports (id, day)
        SELECT id, DATE_ADD(CURDATE(), INTERVAL 1 DAY) FROM ads
        WHERE approved = 1 AND ended = 0 AND NOT EXISTS (
            SELECT * FROM ad_reports WHERE ad_reports.id = ads.id
            AND ad_reports.day = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        )
    `;
    cn.query(sql, (err, result) => {
        if (err) {
            cn.release();
            fn(true);
            return;
        }
        
        // Insert into pub_reports with id and day
        sql = `
            INSERT INTO pub_reports (id, day)
            SELECT id, DATE_ADD(CURDATE(), INTERVAL 1 DAY) FROM pubs
            WHERE NOT EXISTS (
                SELECT * FROM pub_reports WHERE pub_reports.id = pubs.id
                AND pub_reports.day = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            )
        `;
        cn.query(sql, (err, result) => {
            cn.release();
            
            fn(!!err);
        });
    });

});