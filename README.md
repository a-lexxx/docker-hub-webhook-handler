# docker-hub-webhook-handler

Webhook handler for docker-hub hooks

Based on [github-webhook-handler](https://github.com/rvagg/github-webhook-handler)

## Usage

```js
const createHandler = require('docker-hub-webhook-handler');
const handler = createHandler({ path: 'webhook', secret: 'some-secret-path' });

http.createServer(function(req, res) {
    handler(req, res, function(err) { // eslint-disable-line no-unused-vars
        res.statusCode = 404;
        res.end('Not found');
    });
}).listen(8080);

handler.on('error', function(err) {
    console.error('Error:', err.message || err);
});

handler.on('build', function(event) {
    console.log('Received a build event ', event);
});
```
