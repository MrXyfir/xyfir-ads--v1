var db = require("../db");
module.exports = function (adType, payType, category, fn) {
    var basePrice;
    // Determine basePrice for adType using payType
    switch (adType + '-' + payType) {
        case '1-1':
            basePrice = 0.05;
            break; // text cpc
        case '1-2':
            basePrice = 0.005;
            break; // text cpv
        case '2-1':
            basePrice = 0.03;
            break; // short cpc
        case '2-2':
            basePrice = 0.003;
            break; // short cpv
        case '3-1':
            basePrice = 0.15;
            break; // image cpc
        case '3-2':
            basePrice = 0.01;
            break; // image cpv
        case '4-2':
            basePrice = 0.03;
            break; // video cpv
    }
    var categoryLevels = category.split('>').length;
    // Add to basePrice for each subcategory
    if (categoryLevels > 1)
        basePrice += basePrice * 0.05;
    if (categoryLevels > 2)
        basePrice += basePrice * 0.05;
    var info = {
        base: basePrice,
        competitors: 0,
        average: basePrice,
        highest: basePrice
    };
    db(function (cn) {
        var sql = ""
            + "SELECT AVG(cost) as average, COUNT(cost) as competitors, MAX(cost) as highest "
            + "FROM ads WHERE ct_categories = ? AND ad_type = ? AND pay_type = ?";
        cn.query(sql, [category, adType, payType], function (err, rows) {
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
//# sourceMappingURL=price.js.map