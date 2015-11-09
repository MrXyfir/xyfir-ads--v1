import rand = require("../rand");

/*
    Generates and sets a bid for an ad campaign with autobid
    Bid is average price +- up to 5%
*/
export = (id: number, cn: any, fn: any) => {

    var sql: string;

    // Grab info needed for price modules
    sql = "SELECT ad_type, pay_type, ct_categories FROM ads WHERE id = ?";
    cn.query(sql, [id], (err, rows) => {
        if (err || rows.length == 0) {
            fn(true);
            return;
        }

        // Pass info to price module and receive bid info
        require("price")(rows[0].ad_type, rows[0].pay_type, rows[0].ct_categories, info => {
            var bid: number;

            // Bid will be average +- up to 5%
            if (rand(1, 5) > 1) {
                if (rand(0, 2) == 0)
                    bid = info.average + (info.average * (rand(1, 6) / 100));
                else
                    bid = info.average - (info.average * (rand(1, 6) / 100));
            }
            // Bid will be exact average
            else {
                bid = info.average;
            }
            

            // Set bid cost for campaign
            sql = "UPDATE ads SET cost = ? WHERE id = ?";
            cn.query(sql, [bid, id], (err, result) => fn(err));
        });
    });

};