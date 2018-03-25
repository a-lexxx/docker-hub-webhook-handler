'use strict';

const EventEmitter = require('events').EventEmitter;
const bl = require('bl');

const spawner = require('./spawner')();

function Handler(options) {
    const responseCode = options.responseCode || 200;
    const responseHeaders = options.responseHeaders;
    const responseText = options.responseText || 'OK';
    const trapPath = `/${options.path}/${options.secret}`;

    const requestHandler = (req, res, callback) => {

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

            requestHandler.emit('error', err, req);
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

            const emitData = {
                repoName: obj.repository.name,
                fullRepoName: obj.repository.repo_name,
                imageTag: obj.push_data.tag,
                payload: obj,
                protocol: req.protocol,
                host: req.headers['host'],
                url: req.url
            };

            requestHandler.emit('build', emitData);
        }));
    };

    Object.setPrototypeOf(requestHandler, EventEmitter.prototype);


    requestHandler._on = requestHandler.on;
    requestHandler.on = function(event, params) {
        let handler;
        let filter;
        let start;
        if (typeof params === 'function') {
            handler = params;
        } else {
            ({ handler, filter, start } = params);
        }

        if (!event || (!start && !handler)) {
            console.log('Warn: you should define event and "start" or "handler" value. Skiped ', event, params);

            return;
        };

        requestHandler._on(event, (...args) => {
            const repo = args[0].fullRepoName;

            if (filter && !((filter.test && filter.test(repo)) || filter === repo)) return;

            Promise.resolve(handler && handler(...args))
                .then(canStart => {
                    if ((canStart === false) || !start) return;

                    spawner(start);
                })
        })
    }

    return requestHandler;
}

module.exports = Handler;
