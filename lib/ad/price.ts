import round = require("../round");
import db = require("../db");

/*
    fn returns info object which contains:
        base price for ad type-pay type in category
        competitors in category with ad/pay type
        average bid and highest bid
*/
export = (adType: number, payType: number, category: string, fn) => {

    var basePrice: number;

    // Determine basePrice for adType using payType
    switch (adType + '-' + payType) {
        case '1-1': basePrice = 0.10; break;  // text cpc  | $100
        case '1-2': basePrice = 0.005; break; // text cpv  | $5
        case '2-1': basePrice = 0.08; break;  // short cpc | $80
        case '2-2': basePrice = 0.004; break; // short cpv | $4
        case '3-1': basePrice = 0.20; break;  // image cpc | $200
        case '3-2': basePrice = 0.01; break;  // image cpv | $10
        case '4-2': basePrice = 0.05; break;  // video cpv | $50
    }

    var categoryLevels: number = category.split('>').length;

    // Add to basePrice for each subcategory
    if (categoryLevels > 1)
        basePrice += basePrice * 0.05;
    if (categoryLevels > 2)
        basePrice += basePrice * 0.05;

    // Round base price to 6th decimal place
    basePrice = round(basePrice, 6);

    var info = {
        base: basePrice,
        competitors: 0,
        average: basePrice,
        highest: basePrice
    };

    db(cn => {
        var sql: string = ""
            + "SELECT AVG(cost) as average, COUNT(cost) as competitors, MAX(cost) as highest "
            + "FROM ads WHERE ct_categories = ? AND ad_type = ? AND pay_type = ?";
        cn.query(sql, [category, adType, payType], (err, rows) => {
            cn.release();

            if (rows.length == 0) {
                fn(info);
                return;
            }
            
            info.competitors = rows[0].competitors;
            info.average = rows[0].average;
            info.highest = rows[0].highest;

            fn(info);
        });
    });

};