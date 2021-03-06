﻿function mergeObject(original, merge) {
    
    for (var prop in merge) {
        if (merge.hasOwnProperty(prop)) {

            // Original doesn't have property, add it
            if (original[prop] === undefined) {
                original[prop] = merge[prop];
            }
            // Original has property, add to it
            else {
                // Call self recursively for objects
                if (typeof merge[prop] == "object")
                    original[prop] = mergeObject(original[prop], merge[prop]);
                else
                    original[prop] += merge[prop];
            }
        }
        else {
            continue;
        }
    }

    return original;

};

module.exports = mergeObject;