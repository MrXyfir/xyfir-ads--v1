const email = require("lib/email");
const db = require("lib/db");

/*
    POST api/panel/awaiting/ads/:id
    RETURN
        { error: boolean }
    DESCRIPTION
        Approves an ad pending approval
        Generates bid for ad if autobid
*/
module.exports = function(req, res) {
    
    let sql = "SELECT autobid, owner FROM ads WHERE id = ?";
    db(cn => cn.query(sql, [req.params.id], (err, rows) => {
        
        let finish = () => {
            // Set approved bool to true in ads
            sql = "UPDATE ads SET approved = 1 WHERE id = ?";
            cn.query(sql, [req.params.id], (e, r) => {
                cn.release();

                let campaign = "https://ads.xyfir.com/advertisers/campaign/" + req.params.id;

                // Email user notice of approval
                email(uEmail, "Advertising Campaign - Approved",
                    "Congratulations, your advertising campaign was approved! View your campaign here: "
                    + "<a href='" + campaign + "'>Your Approved Campaign</a>"
                );
                res.json({ error: false });
            });
        };

        // Generate bid if campaign has autobid enabled
        const autobid = () => {
            if (autobidValue) {
                require("lib/ad/autobid")(req.params.id, cn, err => {
                    if (err) {
                        cn.release();
                        res.json({ error: true });
                    }
                    else {
                        finish();
                    }
                });
            }
            else {
                finish();
            }
        }

        let autobidValue = !!rows[0].autobid, uEmail = "";

        // Grab advertiser's email from users
        sql = "SELECT email FROM users WHERE user_id = ?";
        cn.query(sql, [rows[0].owner], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ error: true });
            }
            else {
                uEmail = rows[0].email;
                autobid();
            }
        });

    }));

}