const categories = require("./list");

module.exports = function(category, isAd = false) {

    // Ad cannot have multiple categories (only subcats)
    if (isAd && !category.match(/^[\w &>]{3,100}$/))
        return false;

    // Pub campaigns can have multiple categories
    if (!isAd && !category.match(/^[\w &>,]{3,300}$/))
        return false;

    category = category.split(',');
    let match;

    // Ensure provided categories exist
    for (let i = 0; i < category.length; i++) {
        match = false;

        for (var j = 0; j < categories.length; j++) {
            if (category[i] == categories[j]) {
                match = true;
                break;
            }
        }

        if (!match) return false;
    }

    return true;

};