var categories = require("./list");
module.exports = function (category, isAd) {
    if (isAd === void 0) { isAd = false; }
    // Ad cannot have multiple categories (only subcats)
    if (isAd && !category.match(/^[\w &>]{3,75}$/))
        return false;
    // Pub campaigns can have multiple categories
    if (!isAd && !category.match(/^[\w &>,]{3,227}$/))
        return false;
    category = category.split(',');
    var match;
    // Ensure provided categories exist
    for (var i = 0; i < category.length; i++) {
        match = false;
        for (var j = 0; j < categories.length; j++) {
            if (category[i] == categories[j]) {
                match = true;
                break;
            }
        }
        if (!match)
            return false;
    }
    return true;
};
//# sourceMappingURL=validator.js.map