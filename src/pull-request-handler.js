import GitHub from './github';
import WebHooksListener from './webhooks-listener';
import GITHUB_MESSAGE_TYPES from './github-message-types';

//returns sha of the tested commit
async function _onPullRequest (github, baseCommitSha, prHeadLabel, prId, prNumber) {
    var ctx = {
        baseCommitSha: baseCommitSha,
        prHeadLabel:   prHeadLabel,
        prId:          prId,
        prNumber:      prNumber,

        testBranchName:  'rp-' + prId,
        testedCommitSha: null,
        _tempBranchName: 'temp-pr-' + prId
    };

    return github.createBranch(ctx.baseCommitSha, ctx._tempBranchName)
        .then(function () {
            return github.createPullRequest(ctx.prId, ctx._tempBranchName, ctx.prHeadLabel);
        })
        .then(function (tempPrNumber) {
            return github.mergePullRequest(ctx.baseCommitSha, tempPrNumber, 'Merge pr to run tests');
        })
        .then(function (prCommitSha) {
            return github.createBranch(prCommitSha, ctx.testBranchName);
        })
        .then(function (res) {
            ctx.testedCommitSha = res.branchSha;
            return github.deleteBranch(ctx._tempBranchName);
        })
        .then(function () {
            return github.createPullRequestComment(ctx.prNumber, 'tests started');
        })
        .then(function () {
            return new Promise(resolve => resolve(ctx));
        })
        .catch(function (err) {
            throw new Error(err);
        });
}

async function _onTestsFinished (github, ctx, status, reportUrl) {
    return github.createPullRequestComment(ctx.prNumber, status + ': ' + reportUrl)
        .then(function () {
            github.deleteBranch(ctx.testBranchName);
        });
}

//API
export function init (githubUser, githubRepo, githubOauthToken, webhooksListener) {
    var github = new GitHub(githubUser, githubRepo, githubOauthToken);

    webhooksListener.on(GITHUB_MESSAGE_TYPES.PULL_REQUEST, function (e) {
        var prBody = e.body;

        if (/temp-pr/.test(prBody.pull_request.base.ref))
            return;

        var baseCommitSha = prBody.pull_request.base.sha;
        var prHeadLabel   = prBody.pull_request.head.label;
        var prId          = prBody.pull_request.id;
        var prNumber      = prBody.number;

        _onPullRequest(github, baseCommitSha, prHeadLabel, prId, prNumber)
            .then(function (prCtx) {
                function onStatusMessage (e) {
                    var statusBody = e.body;

                    if (!/continuous-integration\/travis-ci\//.test(context))
                        return;

                    if (statusBody.sha !== testedCommitSha)
                        return;

                    if (statusBody.state === 'pending')
                        return;

                    webhooksListener.off(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);

                    _onTestsFinished(github, prCtx, statusBody.state, statusBody.target_url);
                }

                webhooksListener.on(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);
            });
    });
}