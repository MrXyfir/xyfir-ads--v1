const mergeObject = require("lib/merge/object");
const db = require("lib/db");

/*
    GET api/publishers/campaigns/:id
    RETURN
        {
            name: string, categories: string, keywords: string, site: string,
            type: number, test: string, ?clicks: number, ?views: number,
            ?earnings: number, ?pending: number
        }
    DESCRIPTION
        Returns all information relating specifically to pub campaign
        Returns a basic report for this current month
*/
module.exports = function(req, res) {
    
    let sql, response;

    // Grab the campaign's basic information
    sql = "SELECT name, categories, keywords, site, type, test FROM pubs WHERE id = ? AND owner = ?";
    db(cn => cn.query(sql, [req.params.id, req.session.uid], (err, rows) => {

        if (err || rows.length == 0) {
            cn.release();
            res.json({});
            return;
        }

        response = rows[0];

        // Grab info for basic report of current month
        sql = "SELECT SUM(clicks) as clicks, SUM(views) as views, SUM(earnings) as earnings, "
            + "SUM(earnings_temp) as pending FROM pub_reports WHERE id = ? AND MONTH(day) = MONTH(CURDATE())";
        cn.query(sql, [req.params.id], (err, rows) => {
            cn.release();

            if (err || rows.length == 0)
                res.json(response);
            else
                res.json(mergeObject(response, rows[0]));
        });
    }));
    
}