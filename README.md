# docker-hub-webhook-handler

Webhook handler for docker-hub hooks

Based on [github-webhook-handler](https://github.com/rvagg/github-webhook-handler)

## Usage

```js
const http = require('http');
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

// get all events
handler.on('build', function(event) {
    console.log('Received a build event ', event);
});

// get event only for repo matched RegExp and run script
handler.on('build', {
    filter: /repo1/,
    start: '/home/some_cool_script.sh arg1 arg2'
});

// Additional control
// get event only for repo matched RegExp (repo2) and run script only if tag is not equal '123'
// If handler returns exactly "false", then script will not start
handler.on('build', {
    filter: /repo2/,
    handler: event => event.imageTag !== '123'
    start: '/home/some_cool_script.sh arg1 arg2'
});

```

### Build event object

```js
{
    repoName: "<repo_name>",
    fullRepoName: "<username>/<repo_name>",
    imageTag: "<tag>",
    payload: <pure_dockerhub_event_obj>,
    protocol: req.protocol,
    host: req.headers['host'],
    url: req.url
}
```

## Docker hub event object example

```json
{
    "push_data": {
        "pushed_at": 1521979200,
        "images": [],
        "tag": "<tag>",
        "pusher": "<username>"
    },
    "callback_url": "https://registry.hub.docker.com/u/<username>/<repo>/hook/<id>/",
    "repository": {
        "status": "Active",
        "description": "<description>",
        "is_trusted": true,
        "full_description": "<full docker hub dproject description>",
        "repo_url": "https://registry.hub.docker.com/u/<username>/<repo>",
        "owner": "<username>",
        "is_official": false,
        "is_private": false,
        "name": "<repo_name>",
        "namespace": "<namespace>",
        "star_count": 1528,
        "comment_count": 15,
        "date_created": 1521972330,
        "dockerfile": "<content of Dockerfile>",
        "repo_name": "<username>/<repo_name>"
    }
}
```

