/*
    Returns a random integer number
    Min is inclusive, max is exclusive
*/
export = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
};