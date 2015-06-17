'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard').default;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _webhooksListener = require('./webhooks-listener');

var _webhooksListener2 = _interopRequireDefault(_webhooksListener);

var _pullRequestHandler = require('./pull-request-handler');

var pullRequestHandler = _interopRequireWildcard(_pullRequestHandler);

var GITHUB_USER = 'AlexanderMoskovkin';
var GITHUB_REPO = 'testcafe-phoenix';
var OAUTH_TOKEN = '7a8f2014658c3560c6765830e13153c3a307c3dc';

var webhooksListener = new _webhooksListener2.default();
pullRequestHandler.init(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN, webhooksListener);

var app = (0, _express2.default)();

app.use(_bodyParser2.default.json());

app.post('/payload', function (req, res) {
    webhooksListener.addMessage(req.headers['x-github-event'], req.body);
    res.end();
});

var server = app.listen(1800, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Webhook service listening at http://%s:%s', host, port);
});
//# sourceMappingURL=app.js.map