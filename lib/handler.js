'use strict';

const EventEmitter = require('events').EventEmitter;
const bl = require('bl');

function Handler(options) {
    const responseCode = options.responseCode || 200;
    const responseHeaders = options.responseHeaders;
    const responseText = options.responseText || 'OK';
    const trapPath = `${options.path}/${options.secret}`;

    const handler = (req, res, callback) => {

        const tryParseData = dataString => {
            try {
                return JSON.parse(dataString);
            } catch (e) {
                return hasError(e);
            }
        };

        const hasError = msg => {
            res.writeHead(404);
            res.end('Not found');

            var err = new Error(msg);

            handler.emit('error', err, req);
            callback.call(null, err);
        };

        if (req.url.split('?').shift() !== trapPath || req.method !== 'POST')
            return callback.call(null, {
                expected: { url: trapPath, method: 'POST' },
                actual: { url: req.url, method: req.method }
            });

        req.pipe(bl((err, data) => {
            if (err) return hasError(err.message);

            const obj = tryParseData(data.toString());
            if (!obj) return;

            res.writeHead(responseCode, responseHeaders);
            res.end(responseText);

            var emitData = {
                repoName: obj.repository.repo_name,
                imageTag: obj.push_data.tag,
                payload: obj,
                protocol: req.protocol,
                host: req.headers['host'],
                url: req.url
            };

            handler.emit('build', emitData);
        }));
    };

    Object.setPrototypeOf(handler, EventEmitter.prototype);

    return handler;
}

module.exports = Handler;
