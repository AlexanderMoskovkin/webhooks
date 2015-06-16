import GitHub from './github';

var GITHUB_USER = 'AlexanderMoskovkin';
var GITHUB_REPO = 'testcafe-phoenix';
var OAUTH_TOKEN = '29ca9b01bc72125d3ea1e6ee61be7374dc56da26';

var BASE_SHA = 'e38d99ceae97da4bdc69484249001769f449c312';   //pull_request.base.sha
var PULL_REQUEST_ID = '37668232';   //pull_request.id
var PULL_REQUEST_NUMBER     = 32;
var PULL_REQUEST_HEAD_LABEL = 'AlexanderMoskovkin-test1:master';

var github         = new GitHub(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN);
var tempBranchSha  = null;
var tempBranchName = 'temp-pr-' + PULL_REQUEST_ID;
var testBranchName = 'rp-' + PULL_REQUEST_ID;
var pullRequestNum = null;

github.createBranch(BASE_SHA, tempBranchName)
    .then(function (res) {
        tempBranchSha = res.branchSha;

        return github.createPullRequest(PULL_REQUEST_ID, tempBranchName, PULL_REQUEST_HEAD_LABEL);
    })
    .then(function (prNumber) {
        pullRequestNum = prNumber;
        return github.mergePullRequest(BASE_SHA, prNumber, 'Merge pr to run tests');
    })
    .then(function (pullRequestCommitSha) {
        return github.createBranch(pullRequestCommitSha, testBranchName);
    })
    .then(function () {
        return github.deleteBranch(tempBranchName);
    })
    .then(function () {
        return github.createPullRequestComment(PULL_REQUEST_NUMBER, 'test comment');
    })
    .then(function (res) {
        console.log(res);
    })
    .catch(function (err) {
        throw new Error(err);
    });