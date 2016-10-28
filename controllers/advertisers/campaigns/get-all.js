const db = require("lib/db");

/*
    GET api/advertisers/campaigns
    RETURN
        {campaigns: [{
            id: number, name: string, funds: number, dailyFunds: number,
            dailyFundsUsed: number, requested: number, provided: number,
            payType: number, approved: number, ended: boolean
        }]}
    DESCRIPTION
        Returns basic info for active and pending-approval campaigns
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        sql = `
            SELECT
                id, name, funds, daily_funds as dailyFunds, pay_type as payType,
                requested, provided, approved, ended,
                daily_funds_used as dailyFundsUsed
            FROM ads WHERE owner = ?
        `;
        cn.query(sql, [req.session.uid], (err, rows) => {
            cn.release();

            res.json({ campaigns: rows });
        });
    });

}