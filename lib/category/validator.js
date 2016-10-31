const categories = require("./list");

module.exports = function(category, isAd = false) {

    category = category.split(',');

    // Ad cannot have multiple categories (only subcats)
    if (isAd && category.length != 1)
        return false;

    // Pub campaigns can have multiple categories
    if (!isAd && category.length > 3)
        return false;

    // Ensure provided categories exist
    for (let i = 0; i < category.length; i++) {
        if (categories.indexOf(category[i]) == -1)
            return false;
    }

    return true;

};