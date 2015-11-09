/*
    Returns a random integer or floating variable
    Min is inclusive, max is exclusive
*/
export = (min: number, max: number, int: boolean = true): number => {
    if (int)
        return Math.floor(Math.random() * (max - min) + min);
    else
        return Math.random() * (max - min) + min;
};