const crypto = require("crypto");
const db = require("lib/db");

/*
    POST api/publishers/campaigns
    REQUIRED
        name: string, categories: string, keywords: string,
        site: string, type: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Creates a new publisher campaign
*/
module.exports = function(req, res) {
    
    let response = { error: false, message: "Campaign created successfully" };

    // Validate provided data
    if (!req.body.name.match(/^[\w\d -]{3,25}$/))
        response = { error: true, message: "Invalid campaign name format or length" };
    else if (!req.body.keywords.match(/^[\w\d ,-]{0,1599}$/))
        response = { error: true, message: "Invalid keywords format or length" };
    else if (!req.body.site.match(/^https?:\/\/[\w\d-.\/]{1,66}$/))
        response = { error: true, message: "Invalid website format or length" };
    else if (req.body.type < 0 || req.body.type > 2)
        response = { error: true, message: "Invalid campaign type" };
    else if (!require("lib/category/validator")(req.body.categories))
        response = { error: true, message: "Invalid categories provided" };

    // Check for error during validation
    if (response.error) {
        res.json(response);
        return;
    }

    let sql = "INSERT INTO pubs SET ?";

    req.body.owner = req.session.uid;
    
    // Grab last 10 characters of 40 character hash
    req.body.test = crypto.createHash('sha1').update(
        Math.floor(Math.random() * (999999999 - 99999999 + 1) + 99999999
        ).toString()).digest('hex').substr(30);
    
    // Insert campaign into database
    db(cn => cn.query(sql, req.body, (err, result) => {

        if (err || !result.insertId) {
            cn.release();
            res.json({ error: true, message: "An unknown error occured" });
            return;
        }

        // Create blank reports for current and next day in pub_reports
        sql = "INSERT INTO pub_reports (id, day) VALUES (?, CURDATE()), (?, DATE_ADD(CURDATE(), INTERVAL 1 DAY))";
        cn.query(sql, [result.insertId], (err, result) => {
            cn.release();

            res.json(response);
        });
    }));

}