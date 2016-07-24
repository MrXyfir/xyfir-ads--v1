const db = require("lib/db");

/*
    PUT api/advertisers/campaigns/:id/budget
    REQUIRED
        dailyBudget: number
    RETURN
        { error: bool, message: string }
    DESCRIPTION
        Validates and updates a campaign's daily budget
*/
module.exports = function(req, res) {
    
    // Check if daily budget >= minimum amount
    // dailyBudget can be 0, to remove limit
    if (req.body.dailyBudget > 0 && req.body.dailyBudget < 0.50) {
        res.json({ error: true, message: "Daily allocated funds cannot be less than $0.50" });
        return;
    }

    db(cn => {
        let sql;
        
        sql = "SELECT funds FROM ads WHERE id = ? AND owner = ?";
        cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {
            if (err || rows.length == 0) {
                cn.release();
                res.json({ error: true, message: "An unkown error occured" });
                return;
            }

            // Check if campaign's current funds are >= daily budget
            if (rows[0].funds < req.body.dailyBudget) {
                cn.release();
                res.json({ error: true, message: "Campaign does not have enough funds to cover daily budget" });
                return;
            }

            // Update daily funds, subtract any funds used today from funds, reset funds used today
            sql = "UPDATE ads SET daily_funds = ?, funds = funds - daily_funds_used, "
                + "daily_funds_used = 0 WHERE id = ?";
            cn.query(sql, [req.body.dailyBudget, req.params.id], (err, result) => {
                cn.release();

                if (err || !result.affectedRows)
                    res.json({ error: true, message: "An unkown error occured-" });
                else
                    res.json({ error: false, message: "Daily allocated funds updated successfully" });
            }); // update daily_funds
        }); // grab campaign funds
    }); // db()

}