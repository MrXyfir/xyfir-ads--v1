const db = require("lib/db");

/*
    POST api/publishers/account/register
    REQUIRED
        name: string, email: string, application: string
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Allows a user to submit a publisher application
*/module.exports = function(req, res) {

    let error = "";
    
    if (!req.session.uid)
        error = "You must login to Xyfir Ads with your Xyfir account.";
    else if (req.session.publisher)
        error = "You are already a publisher.";
    else if (req.body.name.length > 25)
        error = "Name cannot be more than 25 characters long.";
    else if (req.body.email.length > 50)
        error = "Email cannot be more than 50 characters long.";
    else if (req.body.application.length > 1500)
        error = "Application cannot be more than 1500 characters long.";

    if (error) {
        res.json({ error: true, message: error });
    }
    else {
        db(cn => {
            let sql;

            sql = "SELECT * FROM awaiting_publishers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                if (rows.length > 0) {
                    cn.release();
                    res.json({
                        error: true,
                        message: "You already have an application awaiting review."
                    });
                }
                else {
                    // Add application to awaiting_publishers
                    let data = {
                        user_id: req.session.uid, name: req.body.name,
                        email: req.body.email, application: req.body.application
                    };

                    sql = "INSERT INTO awaiting_publishers SET ?";
                    cn.query(sql, data, (err, result) => {
                        cn.release();

                        if (err || !result.affectedRows) {
                            res.json({
                                error: true, message: "An unknown error occured."
                            });
                        }
                        else {
                            res.json({
                                error: true,
                                message: "Your application is now awaiting review."
                            });
                        }
                    });
                }
            });
        });
    }

}