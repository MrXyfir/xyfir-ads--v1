import autobid = require("../lib/ad/autobid");
import db = require("../lib/db");

/*
    Generate a new bid for all ad campaigns with autobid
*/
export = (fn: any): void => db(cn => {

    // Get id of all ads with autobid enabled
    cn.query("SELECT id FROM ads WHERE autobid = 1 AND approved = 1")
    .on("result", handleRow)
    .on("error", onError)
    .on("end", () => {
        cn.release();
        fn(false);
    });

    var handleRow = (row): void => {
        cn.pause();

        autobid(row.id, cn, err => {
            if (err) onError(true);
            else cn.resume();
        });
    };

    var onError = (err: any): void => {
        cn.end();
        cn.release();
        fn(true);
    };

});