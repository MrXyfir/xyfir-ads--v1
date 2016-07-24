const db = require("lib/db");

/*
    POST api/publishers/account/register
    REQUIRED
        name: string, email: string, application: string
    RETURN
        { message: string }
    DESCRIPTION
        Allows a user to submit a publisher application
*/module.exports = function(req, res) {
    
    if (!req.session.uid)
        res.json({ message: "You must login to Xyfir Ads with your Xyfir Account." });
    else if (req.session.publisher)
        res.json({ message: "You are already a publisher." });
    else if (req.body.name.length > 25)
        res.json({ message: "Name cannot be more than 25 characters long." });
    else if (req.body.email.length > 50)
        res.json({ message: "Email cannot be more than 50 characters long." });
    else if (req.body.application.length > 1500)
        res.json({ message: "Application cannot be more than 1500 characters long." });
    else {
        db(cn => {
            let sql;

            sql = "SELECT * FROM awaiting_publishers WHERE user_id = ?";
            cn.query(sql, [req.session.uid], (err, rows) => {
                if (rows.length > 0) {
                    res.json({ message: "You already have an application awaiting review." });
                    cn.release();
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

                        if (err)
                            res.json({ message: "An unknown error occured. Please try again." });
                        else
                            res.json({ message: "Your application has been submit successfully." });
                    });
                }
            });
        });
    }

}