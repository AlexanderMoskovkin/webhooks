'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator').default;

var _Promise = require('babel-runtime/core-js/promise').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;
exports.onPullRequest = onPullRequest;
exports.onTestsFinished = onTestsFinished;

var _github = require('./github');

var _github2 = _interopRequireDefault(_github);

var GITHUB_USER = 'AlexanderMoskovkin';
var GITHUB_REPO = 'testcafe-phoenix';
var OAUTH_TOKEN = 'eb86634398d9049fd40fffd4ad9437ce2a198be8';
//'29ca9b01bc72125d3ea1e6ee61be7374dc56da26'

var github = new _github2.default(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN);

//returns sha of the tested commit

function onPullRequest(baseCommitSha, prHeadLabel, prId, prNumber) {
    var ctx;
    return _regeneratorRuntime.async(function onPullRequest$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                ctx = {
                    baseCommitSha: baseCommitSha,
                    prHeadLabel: prHeadLabel,
                    prId: prId,
                    prNumber: prNumber,

                    testBranchName: 'rp-' + prId,
                    testedCommitSha: null,
                    _tempBranchName: 'temp-pr-' + prId
                };
                return context$1$0.abrupt('return', github.createBranch(ctx.baseCommitSha, ctx._tempBranchName).then(function () {
                    return github.createPullRequest(ctx.prId, ctx._tempBranchName, ctx.prHeadLabel);
                }).then(function (tempPrNumber) {
                    return github.mergePullRequest(ctx.baseCommitSha, tempPrNumber, 'Merge pr to run tests');
                }).then(function (prCommitSha) {
                    return github.createBranch(prCommitSha, ctx.testBranchName);
                }).then(function (res) {
                    ctx.testedCommitSha = res.branchSha;
                    return github.deleteBranch(ctx._tempBranchName);
                }).then(function () {
                    return github.createPullRequestComment(ctx.prNumber, 'tests started');
                }).then(function () {
                    return new _Promise(function (resolve) {
                        return resolve(ctx);
                    });
                }).catch(function (err) {
                    throw new Error(err);
                }));

            case 2:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

function onTestsFinished(ctx, status, reportUrl) {
    return _regeneratorRuntime.async(function onTestsFinished$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt('return', github.createPullRequestComment(ctx.prNumber, status + ': ' + reportUrl).then(function () {
                    github.deleteBranch(ctx.testBranchName);
                }));

            case 1:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}
//# sourceMappingURL=webhooks-handler.js.map