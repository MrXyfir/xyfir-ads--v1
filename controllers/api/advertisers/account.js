/// <reference path="../../../typings/stripe/stripe.d.ts" />
var db = require("../../../lib/db");
module.exports = {
    /*
        POST api/advertisers/account/funds
        RETURN
            { error: bool, message: string }
    */
    addFunds: function (req, res) {
        if (req.body.amount < 10) {
            res.json({ error: true, message: "You cannot add less than $10.00 in funds." });
            return;
        }
        var stripeKey = require("../../../config").stripe;
        // Attempt to charge user's card
        require("stripe")(stripeKey).charges.create({
            amount: req.body.amount * 100,
            currency: "usd",
            source: req.body.stripeToken,
            description: "Xyfir Ads - Add Funds: $" + req.body.amount
        }, function (err, charge) {
            if (err) {
                res.json({ error: true, message: "There was an error processing your card." });
                return;
            }
            db(function (cn) {
                var sql;
                // Add funds to user's account
                sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                cn.query(sql, [req.body.amount, req.session.uid], function (e, r) {
                    if (e) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured. Please contact support." });
                        return;
                    }
                    // Add transaction to payments table
                    var data = {
                        id: charge.id,
                        user_id: req.session.uid,
                        received: true,
                        amount: req.body.amount,
                        tstamp: new Date()
                    };
                    sql = "INSERT INTO payments SET ?";
                    cn.query(sql, data, function (e, r) {
                        cn.release();
                        res.json({ error: false, message: "$" + req.body.amount + " added to available funds." });
                    });
                });
            });
        });
    },
    /*
        POST api/advertisers/account/register
        RETURN
            { error: bool, message: string }
    */
    register: function (req, res) {
        if (!req.session.uid)
            res.json({ error: true, message: "You must login to Xyfir Ads with your Xyfir Account." });
        else if (req.session.advertiser)
            res.json({ error: true, message: "You are already a advertiser." });
        else {
            // Set advertiser boolean to true
            db(function (cn) {
                cn.query("INSERT INTO advertisers SET ?", { user_id: req.session.uid }, function (e, r) {
                    if (e) {
                        cn.release();
                        res.json({ error: true, message: "An unkown error occured. Please try again." });
                        return;
                    }
                    cn.query("UPDATE users SET advertiser = 1 WHERE user_id = ?", [req.session.uid], function (e, r) {
                        cn.release();
                        if (e)
                            res.json({ error: true, message: "An unkown error occured. Please try again." });
                        else
                            res.json({ error: false, message: "" });
                    });
                });
            });
        }
    },
    /*
        GET api/advertisers/account
        RETURN
            { funds: number }
    */
    info: function (req, res) {
        db(function (cn) {
            cn.query("SELECT funds FROM advertiser WHERE user_id = ?", [req.session.uid], function (err, rows) {
                cn.release();
                res.json({ funds: rows[0].funds });
            });
        });
    },
    /*
        PUT api/advertisers/account
        RETURN
            null
    */
    update: function (req, res) {
        // Placeholder
    }
};
//# sourceMappingURL=account.js.map