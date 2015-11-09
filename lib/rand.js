module.exports = function (min, max, int) {
    if (int === void 0) { int = true; }
    if (int)
        return Math.floor(Math.random() * (max - min) + min);
    else
        return Math.random() * (max - min) + min;
};
//# sourceMappingURL=rand.js.map