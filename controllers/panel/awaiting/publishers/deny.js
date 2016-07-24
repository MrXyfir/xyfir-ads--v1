const email = require("lib/email");
const db = require("lib/db");

/*
    DELETE api/panel/awaiting/publishers/:id
    REQUIRED
        email: string, reason: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes publisher from awaiting_publishers
        Notifies publisher about denial via email
*/
module.exports = function(req, res) {
    
    // Delete application from awaiting_publishers
    db(cn => cn.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.params.id], (e, r) => {
        cn.release();

        if (e || !r.affectedRows) {
            res.json({ error: true });
        }
        else {
            // Send denial email to publisher
            email(req.body.email, "Publisher Application - Denied",
                "Your application was denied for the following reason: " + req.body.reason
            );
            res.json({ error: false });
        }
    }));
    
}