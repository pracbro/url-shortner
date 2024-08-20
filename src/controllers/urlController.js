const { urlStore, aliasAnalytics } = require('../datastore');
const { DEFAULT_TTL } = require('../config');
const generateAlias = require('../utils/generateAlias');

exports.shortenURL = (req, res) => {
    const { url, customAlias, ttl } = req.body;
    let alias = customAlias || generateAlias();

    while (urlStore[alias]) {
        alias = generateAlias();
    }

    const expiryTime = ttl ? Date.now() + ttl * 1000 : Date.now() + DEFAULT_TTL * 1000;

    urlStore[alias] = {
        url,
        expiry: expiryTime
    };

    aliasAnalytics[alias] = {
        visits: 0,
        lastAccessTimes: []
    };

    res.json({ shortUrl: `http://localhost:${PORT}/${alias}` });
};

exports.redirectURL = (req, res) => {
    const alias = req.params.alias;
    const entry = urlStore[alias];

    if (!entry) {
        return res.status(404).send('Alias not found');
    }

    if (Date.now() > entry.expiry) {
        delete urlStore[alias];
        delete aliasAnalytics[alias];
        return res.status(410).send('Alias has expired');
    }

    aliasAnalytics[alias].visits += 1;
    aliasAnalytics[alias].lastAccessTimes.push(new Date().toISOString());

    res.redirect(entry.url);
};

exports.getAnalytics = (req, res) => {
    const alias = req.params.alias;
    const entry = urlStore[alias];

    if (!entry) {
        return res.status(404).send('Alias not found');
    }

    res.json({
        visits: aliasAnalytics[alias].visits,
        lastAccessTimes: aliasAnalytics[alias].lastAccessTimes.slice(-10)
    });
};

exports.updateAliasOrTTL = (req, res) => {
    const alias = req.params.alias;
    const { newAlias, newTTL } = req.body;

    const entry = urlStore[alias];
    if (!entry) {
        return res.status(404).send('Alias not found');
    }

    if (newAlias) {
        if (urlStore[newAlias]) {
            return res.status(409).send('New alias already in use');
        }

        urlStore[newAlias] = { ...entry };
        aliasAnalytics[newAlias] = { ...aliasAnalytics[alias] };

        delete urlStore[alias];
        delete aliasAnalytics[alias];
    }

    if (newTTL) {
        urlStore[newAlias || alias].expiry = Date.now() + newTTL * 1000;
    }

    res.send('Alias updated successfully');
};

exports.deleteAlias = (req, res) => {
    const alias = req.params.alias;

    if (!urlStore[alias]) {
        return res.status(404).send('Alias not found');
    }

    delete urlStore[alias];
    delete aliasAnalytics[alias];

    res.send('Alias deleted successfully');
};
