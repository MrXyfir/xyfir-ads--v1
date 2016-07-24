const db = require("lib/db");

/*
    GET api/pub/categories
    RETURN
        { categories: string[] }
    DESCRIPTION
        Return possible categories
*/
module.exports = function(req, res) {
        
    res.json({ categories: require("lib/category/list") });
    
}