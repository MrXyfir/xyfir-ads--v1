const db = require("lib/db");

/*
    GET api/panel/awaiting/publishers
    RETURN
        {publishers: [{
            user_id: number, name: string
        }]}
    DESCRIPTION
        Returns all publishers awaiting application review
*/
module.exports = function(req, res) {
    
    db(cn => {
        cn.query("SELECT user_id, name FROM awaiting_publishers", (err, rows) => {
            cn.release();
            res.json({ publishers: rows });
        });
    });

}