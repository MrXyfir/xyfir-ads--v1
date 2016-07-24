const db = require("lib/db");

/*
    Delete ad/pub reports older than 3 months
*/
module.exports = () => db(cn => {

    let sql = "DELETE FROM ad_reports WHERE day < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    
    cn.query(sql, (err, result) => {
        if (err) {
            cn.release();
            return;
        }

        sql = "DELETE FROM pub_reports WHERE day < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
        cn.query(sql, (err, result) => cn.release());
    });

});