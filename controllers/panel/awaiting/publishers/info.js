const db = require("lib/db");

/*
    GET api/panel/awaiting/publishers/:id
    RETURN
        {
            user_id: number, name: string, email: string, application: string
        }
    DESCRIPTION
        Returns publisher application / info
*/
module.exports = function(req, res) {
    
    db(cn => {
        cn.query("SELECT * FROM awaiting_publishers WHERE user_id = ?", [req.params.id], (err, rows) => {
            cn.release();
            res.json(rows[0]);
        });
    });
    
}