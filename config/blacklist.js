const blacklist = new Set();

module.exports = {
    addTokenToBlacklist: (token) => {
        blacklist.add(token);
    },
    isTokenBlacklisted: (token) => {
        return blacklist.has(token);
    }
};
