/*
    Returns 1 point for each category level that matches (0[none] - 3[all])
*/
export = (categories: string[], ad: string): number => {

    var score: number = 0;

    // Perfect match
    if (categories.indexOf(ad) > -1) {
        score = ad.split('>').length;
    }
    // Check for category matches on higher levels
    else {
        var level: string[] = ad.split('>'), category: string[];
        var scores: number[] = [];

        // Loop through each publisher category
        for (var i: number = 0; i < categories.length; i++) {
            category = categories[i].split('>');
            scores.push(0);

            // Check if main category matches
            if (category[0] == level[0]) {
                scores[i]++;

                // Check if second category matches
                // We already know third category does not match
                // Quit and return since 2 is the highest score for this check
                if (category[1] == level[1]) {
                    scores[i]++;
                    break;
                }
            }
        }

        // Return highest score
        for (var i: number = 0; i < scores.length; i++) {
            if (scores[i] > score) score = scores[i];
        }
    }

    return score;

};