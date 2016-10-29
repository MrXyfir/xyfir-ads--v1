/*
    Takes two lists: key:val,key:val and key:val,key:val
    Adds up val for matching keys and creates new key:val for non-matching
*/
module.exports = function(original, merge) {

    // Empty merge list
    if (!merge[0]) return "";

    let oKV, mKV, has, val;

    // Loop through merge
    for (let i = 0; i < merge.length; i++) {
        has = false;
        mKV = merge[i].split(':');

        // Loop through original
        for (let j = 0; j < original.length; j++) {
            oKV = original[j].split(':');

            // Check if original has merge's key
            if (mKV[0] == oKV[0]) {
                // Add merge's value to original's
                val = +oKV[1] + +mKV[1];
                original[j] = oKV[0] + ":" + val;

                has = true;
                break;
            }
        }

        // Add key from merge to original
        if (!has) {
            if (original[0])
                original.push(merge[i]);
            else
                original[0] = merge[i];
        }
    }

    return original.join(',');

};