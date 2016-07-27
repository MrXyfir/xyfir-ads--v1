const email = require("lib/email");
const db = require("lib/db");

/*
    POST api/panel/awaiting/publishers/:id
    REQUIRED
        email: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Create row in publishers for user
        Sets publisher boolean equal to true
        Remove publisher from awaiting_publishers
        Notifies publisher of their approval by email
*/
module.exports = function(req, res) {
    
    db(cn => cn.beginTransaction(err => {
        if (err) {
            cn.release();
            res.json({ error: true });
            return;
        }

        // Create row in publishers for user
        cn.query("INSERT INTO publishers SET ?", { user_id: req.params.id }, (e, r) => {
            if (e || !r.affectedRows) {
                cn.rollback(() => cn.release());
                res.json({ error: true });
                return;
            }

            // Set publisher boolean to true in users
            cn.query("UPDATE users SET publisher = 1 WHERE user_id = ?", [req.params.id], (e, r) => {
                if (e || !r.affectedRows) {
                    cn.rollback(() => cn.release());
                    res.json({ error: true });
                    return;
                }

                // Delete application from awaiting_publishers
                cn.query("DELETE FROM awaiting_publishers WHERE user_id = ?", [req.params.id], (e, r) => {
                    if (e || !r.affectedRows) {
                        cn.rollback(() => cn.release());
                        res.json({ error: true });
                        return;
                    }

                    cn.commit(err => {
                        if (err) {
                            cn.rollback(() => cn.release());
                            res.json({ error: true });
                        }
                        else {
                            cn.release();
                            res.json({ error: false });

                            // Email user notice of approval
                            email(req.body.email, "Publisher Application - Approved",
                                "Congratulations, your application was approved! You can now login to your publisher's dashboard: "
                                + "<a href='https://ads.xyfir.com/#/publishers/'>Publisher Dashboard</a>"
                            );
                        }
                    }); // commit transaction
                }); // delete from awaiting_publishers
            }); // set publisher boolean
        }); // create publisher
    }));

}