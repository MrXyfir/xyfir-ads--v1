const db = require("lib/db");

/*
    POST api/advertisers/account/register
    RETURN
        { error: bool, message: string }
*/
module.exports = function(req, res) {
    
    if (!req.session.uid)
        res.json({ error: true, message: "You must login to Xyfir Ads with your Xyfir Account." });
    else if (req.session.advertiser)
        res.json({ error: true, message: "You are already a advertiser." });
    else {
        // Set advertiser boolean to true
        db(cn => {
            cn.query("INSERT INTO advertisers SET ?", { user_id: req.session.uid }, (e, r) => {
                if (e) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured. Please try again." });
                    return;
                }

                cn.query("UPDATE users SET advertiser = 1 WHERE user_id = ?", [req.session.uid], (e, r) => {
                    cn.release();

                    if (e)
                        res.json({ error: true, message: "An unknown error occured. Please try again." });
                    else
                        res.json({ error: false, message: "" });
                });
            });
        });
    }
    
}