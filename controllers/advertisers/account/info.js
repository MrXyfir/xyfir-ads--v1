const db = require("lib/db");

/*
    GET api/advertisers/account
    RETURN
        {
            funds: number, payments: [ { id: string, amount: number, tstamp: datetime } ]
        }
    DESCRIPTION
        Return information relating specifically to advertiser's account
*/
module.exports = function(req, res) {
    
    db(cn => {
        let sql;

        // Grab funds in user's account
        sql = "SELECT funds FROM advertisers WHERE user_id = ?";
        cn.query(sql, [req.session.uid], (err, rows) => {
            if (err || rows.length == 0) {
                cn.release();
                res.json({ funds: 0, payments: [] });
                return;
            }

            let funds = rows[0].funds;

            // Grab any payments user has made to add funds to account
            sql = "SELECT id, amount, tstamp FROM payments WHERE received = ? AND user_id = ? "
                + "ORDER BY tstamp DESC";
            cn.query(sql, [true, req.session.uid], (err, rows) => {
                cn.release();

                res.json({ funds, payments: rows });
            });
        });
    });

}