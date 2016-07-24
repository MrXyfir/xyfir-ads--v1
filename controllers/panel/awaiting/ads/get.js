const db = require("lib/db");

/*
    GET api/panel/awaiting/ads
    RETURN
        { ads: [ { id: number, funds: number, ad_title: string, ad_type: number } ] }
    DESCRIPTION
        Return all ads awaiting approval
*/
module.exports = function(req, res) {
    
    db(cn => cn.query("SELECT id, ad_title, ad_type, funds FROM ads WHERE approved = 0", (err, rows) => {
        cn.release();
        res.json({ ads: rows });
    }));

}