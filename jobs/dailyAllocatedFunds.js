const db = require("lib/db");

/*
    Subtract daily_funds_used from funds for ads where daily_funds > 0
    Reset daily_funds_used to 0
*/
module.exports = (fn) => db(cn => {

    let sql = "UPDATE ads "
        + "SET funds = funds - daily_funds_used, daily_funds_used = 0 "
        + "WHERE daily_funds > 0 AND approved = 1";
    
    cn.query(sql, (err, result) => {
        cn.release();
        fn(!!err);
    });

});