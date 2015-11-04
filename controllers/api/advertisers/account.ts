/// <reference path="../../../typings/stripe/stripe.d.ts" />

import db = require("../../../lib/db");

export = {

    info: (req, res) => {

    },

    update: (req, res) => {

    },

    addFunds: (req, res) => {
        if (req.body.amount < 10) {
            res.json({ error: true, message: "You cannot add less than $10.00 in funds." });
            return;
        }

        var stripeKey: string = require("../../../config").stripe;
        
        // Attempt to charge user's card
        require("stripe")(stripeKey).charges.create({
            amount: req.body.amount * 100,
            currency: "usd",
            source: req.body.stripeToken,
            description: "Xyfir Ads - Add Funds: $" + req.body.amount
        }, (err, charge) => {
            if (err) {
                res.json({ error: true, message: "There was an error processing your card." });
                return;
            }

            db(cn => {
                var sql: string;

                // Add funds to user's account
                sql = "UPDATE advertisers SET funds = funds + ? WHERE user_id = ?";
                cn.query(sql, [req.body.amount, req.session.uid], (e, r) => {
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
                    cn.query(sql, data, (e, r) => {
                        cn.release();
                        res.json({ error: false, message: "$" + req.body.amount + " added to available funds." });
                    });
                });
            });
        });
    },

    register: (req, res) => {
        if (!req.session.uid)
            res.json({ error: true, message: "You must login to Xyfir Ads with your Xyfir Account." });
        else if (req.session.advertiser)
            res.json({ error: true, message: "You are already a advertiser." });
        else {
            // Set advertiser boolean to true
            db(connection => {
                connection.query("UPDATE users SET advertiser = 1 WHERE user_id = ?", [req.session.uid], (err, result) => {
                    connection.release();

                    if (err)
                        res.json({ error: true, message: "An unkown error occured. Please try again." });
                    else
                        res.json({ error: false, message: "" });
                });
            });
        }
    }

}