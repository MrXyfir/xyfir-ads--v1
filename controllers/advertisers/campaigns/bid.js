const db = require("lib/db");

/*
    PUT api/advertisers/campaigns/:id/bid
    OPTIONAL
        autobid: bool, bid: number
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Validate and update campaign's bid
        *Generates bid price if autobid == true
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        // Validate and update campaign's bid (cost)
        if (req.body.bid) {
            // Grab needed information for campaign
            sql = "SELECT ad_type, pay_type, ct_categories, requested, provided, funds, autobid "
                + "FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

                if (err || rows.length == 0) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured" });
                    return;
                }

                let campaign = rows[0]; rows = null;

                // Grab ad type in category's pricing information
                require("lib/ad/price")
                (campaign.ad_type, campaign.pay_type, campaign.ct_categories, info => {
                    // Ensure user's new bid is >= base price
                    if (req.body.bid < info.base) {
                        cn.release();
                        res.json({ error: true, message: "Bid must be greater than base price: $" + info.base });
                        return;
                    }
                    
                    // Ensure user can pay for requested with funds in campaign at bid
                    if ((campaign.requested - campaign.provided) * req.body.bid > campaign.funds) {
                        cn.release();
                        res.json({
                            error: true,
                            message: "Minimum funds in campaign required: $" + (req.body.bid * (campaign.requested - campaign.provided))
                        });
                        return;
                    }

                    // Update bid (cost) for campaign and set autobid = false, if true
                    sql = "UPDATE ads SET cost = ?" + (!!campaign.autobid ? ", autobid = 0" : "") + " WHERE id = ?";
                    cn.query(sql, [req.body.bid, req.params.id], (err, result) => {
                        cn.release();

                        if (err || !result.affectedRows)
                            res.json({ error: true, message: "An unknown error occured-" });
                        else
                            res.json({ error: false, message: "Bid updated successfully" });
                    }); // update bid cost
                }); // grab ad/cat info
            }); // grab campaign info
        }
        // Generate and set campaign's autobid and cost
        else if (req.body.autobid) {
            sql = "SELECT autobid FROM ads WHERE id = ? AND owner = ?";
            cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

                if (err || rows.length == 0) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured" });
                    return;
                }

                // Check if campaign already has autobid set true
                if (!!rows[0].autobid) {
                    cn.release();
                    res.json({ error: true, message: "Autobid is already enabled" });
                    return;
                }

                // Generate and set campaign's autobid cost
                require("lib/ad/autobid")(req.params.id, cn, err => {
                    if (err) {
                        cn.release();
                        res.json({ error: true, message: "An unknown error occured-" });
                        return;
                    }

                    // Set autobid = true for campaign
                    sql = "UPDATE ads SET autobid = ? WHERE id = ?";
                    cn.query(sql, [true, req.params.id], (err, result) => {
                        cn.release();
                        res.json({ error: false, message: "Autobid successfully enabled" });
                    });
                }); // generate bid
            }); // check autobid
        }
        else {
            cn.release();
            res.json({ error: true, message: "" });
        }
    });

}