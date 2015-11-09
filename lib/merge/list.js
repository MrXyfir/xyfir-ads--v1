module.exports = function (original, merge) {
    var oKV, mKV, has, val;
    // Loop through merge
    for (var i = 0; i < merge.length; i++) {
        has = false;
        mKV = merge[i].split(':');
        // Loop through original
        for (var j = 0; j < original.length; j++) {
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
            original.push(merge[i]);
        }
    }
    return original.join(',');
};
//# sourceMappingURL=list.js.map