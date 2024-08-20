const crypto = require('crypto');

function generateAlias() {
    return crypto.randomBytes(4).toString('hex');
}

module.exports = generateAlias;
