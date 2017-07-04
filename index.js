'use strict';

const Handler = require('./lib/handler');

function createHandler(options) {
    if (typeof options !== 'object') {
        throw new TypeError('must provide an options object');
    }

    if (typeof options.path !== 'string') {
        throw new TypeError('must provide a \'path\' option');
    }

    if (typeof options.secret !== 'string') {
        throw new TypeError('must provide a \'secret\' option');
    }

    return new Handler(options);
}

module.exports = createHandler;
