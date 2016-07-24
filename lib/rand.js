/*
    Returns a random integer number
    Min is inclusive, max is exclusive
*/
module.exports = function(min, max) {
    
    return Math.floor(Math.random() * (max - min) + min);
    
};