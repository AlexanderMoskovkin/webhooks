import Github from './github.js';

import fs from 'fs';

var CREDENTIALS = JSON.parse(fs.readFileSync('./credentials.json', 'utf-8'));

var GITHUB_USER = CREDENTIALS.GITHUB_USER;
var GITHUB_REPO = CREDENTIALS.GITHUB_REPO;
var OAUTH_TOKEN = CREDENTIALS.OAUTH_TOKEN;

var github = new Github(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN);

//The area for your experiments