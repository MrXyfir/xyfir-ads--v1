const db = require("lib/db");

/*
    PUT api/advertisers/campaigns/:id
    REQUIRED
        name: string, requested: number, available: string, ut_age: string,
        ct_keywords: string, ct_sites: string, ut_genders: string,
        ut_countries: string, ut_regions: string
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Allows a user to update certain values of their ad campaign
        *Value of requested is added to requested column in table
*/
module.exports = function(req, res) {

    let response = {
        error: false, message: "Campaign updated successfully"
    };

    /* Validate provided information */
    if (!req.body.name.match(/^[\w\d -]{3,25}$/))
        response = { error: true, message: "Invalid campaign name" };
    else if (!req.body.available.match(/^(\d{10}-(\d{10})?,?){1,10}$/))
        response = { error: true, message: "Invalid availability ranges" };
    else if (!req.body.ut_genders.match(/^[0123,]{1,5}$/))
        response = { error: true, message: "Invalid targeted user genders" };
    else if (!req.body.ut_age.match(/^[0123456,]{1,11}$/))
        response = { error: true, message: "Invalid targeted user age ranges" };
    else if (!req.body.ct_keywords.match(/^[\w\d ,-]{0,1500}$/))
        response = { error: true, message: "Invalid keyword(s) length or character" };
    else if (!req.body.ut_countries.match(/^([A-Z]{2},?){1,50}|\*$/))
        response = { error: true, message: "Invalid target countries list (limit 50 countries)" };
    else if (!req.body.ut_regions.match(/^([A-Z*,]{1,3}\|?){1,250}$/))
        response = { error: true, message: "Invalid target regions (limit 1,000 characters)" };
    else if (!req.body.ct_sites.match(/^([\w\d.,-]){5,225}|\*$/))
        response = { error: true, message: "Invalid target sites format / length (limit 225 characters)" };

    // Check for errors during validation
    if (response.error) {
        res.json(response);
        return;
    }

    /* Setup query and values for database */
    let update = [
        req.body.name, req.body.requested, req.body.available, req.body.ut_age, req.body.ct_keywords,
        req.body.ct_sites, req.body.ut_countries, req.body.ut_regions, req.body.ut_genders,
        req.params.id, req.session.uid
    ];
    let sql = ""
        + "UPDATE ads SET name = ?, requested = requested + ?, available = ?, ut_age = ?, ct_keywords = ?, "
        + "ct_sites = ?, ut_countries = ?, ut_regions = ?, ut_genders = ? "
        + "WHERE id = ? AND owner = ?";

    /* Update data in table */
    db(cn => cn.query(sql, update, (err, result) => {
        cn.release();

        if (err || !result.affectedRows)
            response = { error: true, message: "An unknown error occured" };

        res.json(response);
    }));

}