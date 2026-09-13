function getAirlineThemeColors(colors, limit = 4) {
    const isNearWhite = (hex) => {
        const value = hex.replace('#', '');
        if (!/^[0-9a-fA-F]{6}$/.test(value)) return false;

        const channels = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16));
        return Math.min(...channels) >= 224;
    };

    const chromaticColors = colors.filter(color => !isNearWhite(color));
    return (chromaticColors.length > 0 ? chromaticColors : colors).slice(0, limit);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = getAirlineThemeColors;
}