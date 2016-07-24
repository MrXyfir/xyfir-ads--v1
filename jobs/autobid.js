const autobid = require("lib/ad/autobid");
const db = require("lib/db");

/*
    Generate a new bid for all ad campaigns with autobid
*/
module.exports = (fn) => db(cn => {

    // Needed to pass to autobid since cn will be paused
    db(cn2 => {

        const onError = (err) => {
            cn.release();
            cn2.release();
            fn(true);
        };

        // Get id of all ads with autobid enabled
        cn.query("SELECT id FROM ads WHERE autobid = 1 AND approved = 1")
            .on("result", row => {
                cn.pause();

                autobid(row.id, cn2, err => {
                    if (err)
                        onError(true);
                    else
                        cn.resume();
                });
            })
            .on("error", onError)
            .on("end", () => {
                cn.release();
                cn2.release();
                fn(false);
            });
    });

});