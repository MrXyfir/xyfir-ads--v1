const db = require("lib/db");

/*
    POST api/advertisers/account/funds
    REQUIRED
        amount: number, stripeToken: string
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Charges user's card via stripeToken and adds funds to account
*/
module.exports = function(req, res) {
    
    if (req.body.amount < 10) {
        res.json({ error: true, message: "You cannot add less than $10.00 in funds." });
        return;
    }

    let stripeKey = require("config").keys.stripe;
    
    // Attempt to charge user's card
    require("stripe")(stripeKey).charges.create({
        amount: req.body.amount * 100,
        currency: "usd",
        source: req.body.stripeToken,
        description: "Xyfir Ads - Add Funds: $" + req.body.amount
    }, (err, charge) => {
        if (err) {
            console.log(err);
            res.json({ error: true, message: "There was an error processing your card." });
            return;
        }

        db(cn => {
            let sql;

            // Add funds to user's account
            sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
            cn.query(sql, [req.body.amount, req.session.uid], (e, r) => {
                if (e || !r.affectedRows) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured. Please contact support." });
                    return;
                }

                // Add transaction to payments table
                let data = {
                    id: charge.id,
                    user_id: req.session.uid,
                    received: true,
                    amount: req.body.amount,
                    tstamp: new Date()
                };

                sql = "INSERT INTO payments SET ?";
                cn.query(sql, data, (e, r) => {
                    cn.release();
                    res.json({ error: false, message: "$" + req.body.amount + " added to available funds." });
                });
            });
        });
    });

}