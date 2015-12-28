import db = require("../lib/db");

/*
    Delete ad/pub reports older than 3 months
*/
export = (): void => db(cn => {

    var sql: string = "DELETE FROM ad_reports WHERE day < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    cn.query(sql, (err, result) => {
        if (err) {
            cn.release();
            return;
        }

        sql = "DELETE FROM pub_reports WHERE day < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
        cn.query(sql, (err, result) => cn.release());
    });

});