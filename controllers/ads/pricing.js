
const getPrice = require("lib/ad/price");
const db = require("lib/db");

/*
    GET api/ad/pricing
    REQUIRED
        adType: number, payType: number, category: string
    RETURN
        { base: number, competitors: number, average: number, highest: number }
    DESCRIPTION
        Returns info object from lib/ad/price module
*/
module.exports = function(req, res) {
    
    getPrice(
        req.query.adType, req.query.payType, req.query.category,
        info => res.json(info)
    );

}