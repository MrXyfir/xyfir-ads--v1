const db = require("lib/db");

/*
    PUT api/publishers/campaigns/:id
    REQUIRED
        name: string, categories: string, keywords: string,
        site: string, type: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Allows user to update letious campaign values
*/
module.exports = function(req, res) {
    
    let response = { error: false, message: "Campaign updated successfully" };

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

    if (response.error) {
        res.json(response);
        return;
    }

    let sql = "UPDATE pubs "
        + "SET name = ?, keywords = ?, site = ?, type = ?, categories = ? "
        + "WHERE id = ? AND owner = ?";
    let update = [
        req.body.name, req.body.keywords, req.body.site, req.body.type, req.body.categories,
        req.params.id, req.session.uid
    ];

    db(cn => cn.query(sql, update, (err, result) => {
        cn.release();

        if (err)
            res.json({ error: true, message: "An unknown error occured" });
        else
            res.json(response);
    }));

}