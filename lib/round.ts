export = (value: number, decimals: number): number => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
});