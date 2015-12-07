import email = require("../../../lib/email");
import db = require("../../../lib/db");

export = {

    /*
        GET api/panel/awaiting/publishers
        RETURN
            {publishers: [{
                user_id: number, name: string
            }]}
        DESCRIPTION
            Returns all publishers awaiting application review
    */
    awaiting: (req, res) => {
        db(cn => {
            cn.query("SELECT user_id, name FROM awaiting_publishers", (err, rows) => {
                cn.release();
                res.json({ publishers: rows });
            });
        });
    },

    /*
        GET api/panel/awaiting/publishers/:id
        RETURN
            {
                user_id: number, name: string, email: string, application: string
            }
        DESCRIPTION
            Returns publisher application / info
    */
    info: (req, res) => {
        db(cn => {
            cn.query("SELECT * FROM awaiting_publishers WHERE id = ?", [req.params.id], (err, rows) => {
                cn.release();
                res.json(rows[0]);
            });
        });
    },

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
    approve: (req, res) => {
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
                                    + "<a href='https://ads.xyfir.com/publishers/'>Publisher Dashboard</a>"
                                );
                            }
                        }); // commit transaction
                    }); // delete from awaiting_publishers
                }); // set publisher boolean
            }); // create publisher
        }));
    },

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
    deny: (req, res) => {
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

};
