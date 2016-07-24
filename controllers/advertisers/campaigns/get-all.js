const db = require("lib/db");

/*
    GET api/advertisers/campaigns
    RETURN
        {campaigns: [
            {
                id, name, funds, dailyFunds, dailyFundsUsed,
                requested, provided, payType, approved
            }
        ]}
    DESCRIPTION
        Returns basic info for active and pending-approval campaigns
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        sql = "SELECT id, name, funds, daily_funds as dailyFunds, daily_funds_used as dailyFundsUsed, "
            + "pay_type as payType, requested, provided, approved "
            + "FROM ads WHERE owner = ?";
        cn.query(sql, [req.session.uid], (err, rows) => {
            cn.release();

            res.json({ campaigns: rows });
        });
    });

}