import express from 'express';
import bodyParser from 'body-parser';
import WebHooksListener from './webhooks-listener';
import * as pullRequestHandler from './pull-request-handler';
import fs from 'fs';

var CREDENTIALS = JSON.parse(fs.readFileSync('./credentials.json', 'utf-8'));

var GITHUB_USER = CREDENTIALS.GITHUB_USER;
var GITHUB_REPO = CREDENTIALS.GITHUB_REPO;
var OAUTH_TOKEN = CREDENTIALS.OAUTH_TOKEN;

var webhooksListener = new WebHooksListener();
pullRequestHandler.init(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN, webhooksListener);

var app = express();

app.use(bodyParser.json());

app.post('/payload', function (req, res) {
    webhooksListener.addMessage(req.headers['x-github-event'], req.body);
    res.end();
});

var server = app.listen(1800, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Webhook service listening at http://%s:%s', host, port);
});