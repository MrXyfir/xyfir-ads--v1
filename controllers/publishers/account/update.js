const db = require("lib/db");

/*
    PUT api/publishers/account
    REQUIRED
        paymentMethod: number, paymentInfo: json-string
    RETURN
        { error: true, message: string }
    DESCRIPTION
        Allow publisher's to update their payment method and info
*/
module.exports = function(req, res) {
    
    let info = JSON.parse(req.body.paymentInfo);

    // Update payment_info, payment_method
    const update = () => db(cn => {
        let sql = "UPDATE publishers SET payment_info = ?, payment_method = ? WHERE user_id = ?";
        let vars = [JSON.stringify(info), req.body.paymentMethod, req.session.uid];

        cn.query(sql, vars, (err, result) => {
            cn.release();

            if (err)
                res.json({ error: true, message: "An unknown error occured" });
            else
                res.json({ error: false, message: "Payment info updated successfully" });
        });
    });

    // Payment via check
    if (req.body.paymentMethod == 1) {
        // Validate info pertaining to check
        if (!info.name.match(/^([\w-]{2,20}\s?){2,3}$/))
            res.json({ error: true, message: "Invalid name" });
        else if (!info.address.match(/^[\w\d -.#,]{5,50}$/))
            res.json({ error: true, message: "Invalid address" });
        else if (!info.address2.match(/^[\w\d -.#,]{0,50}$/))
            res.json({ error: true, message: "Invalid address" });
        else if (!String(info.zip).match(/^[0-9]{5}$/))
            res.json({ error: true, message: "Invalid zip code (US ONLY)" });
        else if (info.country != "US")
            res.json({ error: true, message: "Checks are only available for US publishers" });
        else update();
    }
    // Payment via bank wire
    else if (req.body.paymentMethod == 2) {
        // ** Add validation for bank wire info
    }
    // Invalid payment method
    else {
        res.json({ error: true, message: "Invalid payment method" });
    }
    
}