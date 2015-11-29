/// <reference path="../../../typings/stripe/stripe.d.ts" />

import db = require("../../../lib/db");

export = {

    /*
        POST api/advertisers/account/funds
        REQUIRED
            amount: number, stripeToken: string
        RETURN
            { error: bool, message: string }
        DESCRIPTION
            Charges user's card via stripeToken and adds funds to account
    */
    addFunds: (req, res) => {
        if (req.body.amount < 10) {
            res.json({ error: true, message: "You cannot add less than $10.00 in funds." });
            return;
        }

        var stripeKey: string = require("../../../config").secrets.stripe;
        
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
                var sql: string;

                // Add funds to user's account
                sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                cn.query(sql, [req.body.amount, req.session.uid], (e, r) => {
                    if (e || !r.affectedRows) {
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
                    cn.query(sql, data, (e, r) => {
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
    register: (req, res) => {
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
                        res.json({ error: true, message: "An unkown error occured. Please try again." });
                        return;
                    }

                    cn.query("UPDATE users SET advertiser = 1 WHERE user_id = ?", [req.session.uid], (e, r) => {
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
            {
                funds: number, payments: [ { id: string, amount: number, tstamp: datetime } ]
            }
        DESCRIPTION
            Return information relating specifically to advertiser's account
    */
    info: (req, res) => {
        db(cn => {
            var sql: string;

            // Grab funds in user's account
            sql = "SELECT funds FROM advertisers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                if (err || rows.length == 0) {
                    cn.release();
                    res.json({ funds: 0, payments: [] });
                    return;
                }

                var funds: number = rows[0].funds;

                // Grab any payments user has made to add funds to account
                sql = "SELECT id, amount, tstamp FROM payments WHERE received = ? AND user_id = ? "
                    + "ORDER BY tstamp DESC";
                cn.query(sql, [true, req.session.uid], (err, rows) => {
                    cn.release();

                    res.json({ funds: funds, payments: rows });
                });
            });
        });
    },

    /*
        PUT api/advertisers/account
        RETURN
            null
    */
    update: (req, res) => {
        // Placeholder
    }

}