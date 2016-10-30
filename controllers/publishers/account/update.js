const db = require("lib/db");

/*
    PUT api/publishers/account
    REQUIRED
        paymentMethod: number, paymentInfo: json-string
    RETURN
        { error: true, message: string }
    DESCRIPTION
        Allow publishers to update their payment method and info
*/
module.exports = function(req, res) {
    
    let info = JSON.parse(req.body.paymentInfo);

    // Update payment_info, payment_method
    const update = () => db(cn => {
        let sql = `
            UPDATE publishers SET
                payment_info = ?, payment_method = ?
            WHERE user_id = ?
        `, vars = [
            JSON.stringify(info), req.body.paymentMethod,
            req.session.uid
        ];

        cn.query(sql, vars, (err, result) => {
            cn.release();

            if (err || !result.affectedRows) {
                res.json({
                    error: true, message: "An unknown error occured"
                });
            }
            else {
                res.json({
                    error: false, message: "Payment info updated"
                });
            }
        });
    });

    // Payment via check
    if (req.body.paymentMethod == 1) {
        // Validate info pertaining to check
        if (!info.name)
            res.json({ error: true, message: "Invalid name" });
        else if (!info.address.match(/^.{5,50}$/))
            res.json({ error: true, message: "Invalid address" });
        else if (!info.address2.match(/^.{0,50}$/))
            res.json({ error: true, message: "Invalid address" });
        else if (!String(info.zip).match(/^[0-9]{5}$/))
            res.json({ error: true, message: "Invalid zip code" });
        else if (!info.city.match(/^.{0,50}$/))
            res.json({ error: true, message: "Invalid city" });
        else if (!info.state.match(/^[\w\s]{0,12}$/))
            res.json({ error: true, message: "Invalid state" });
        else update();
    }
    // Payment via bank wire
    else if (req.body.paymentMethod == 2) {
        // ** Add validation for bank wire info
        res.json({ error: true, message: "Payment method unsupported" });
    }
    // Invalid payment method
    else {
        res.json({ error: true, message: "Invalid payment method" });
    }
    
}