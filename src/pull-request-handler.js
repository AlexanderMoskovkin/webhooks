import GitHub from './github';
import WebHooksListener from './webhooks-listener';
import GITHUB_MESSAGE_TYPES from './github-message-types';

//returns sha of the tested commit
async function _onPullRequest (github, prId, prNumber, pullRequestSha, testBranchName) {
    return github.createBranch(pullRequestSha, testBranchName)
        .then(function (res) {
            return github.createPullRequestComment(prNumber, 'tests started');
        })
        .then(function () {
            return new Promise(resolve => resolve());
        })
        .catch(function (err) {
            throw new Error(err);
        });
}

async function _onTestsFinished (github, prNumber, testBranchName, status, reportUrl) {
    return github.createPullRequestComment(prNumber, status + ': ' + reportUrl)
        .then(function () {
            github.deleteBranch(testBranchName);
        });
}

//API
export function init (githubUser, githubRepo, githubOauthToken, webhooksListener) {
    var github = new GitHub(githubUser, githubRepo, githubOauthToken);

    webhooksListener.on(GITHUB_MESSAGE_TYPES.PULL_REQUEST, function (e) {
        var prBody = e.body;

        if (/temp-pr/.test(prBody.pull_request.base.ref))
            return;

        var pullRequestSha = prBody.pull_request.head.sha;
        var prId           = prBody.pull_request.id;
        var prNumber       = prBody.number;
        var testBranchName = 'rp-' + prId;

        _onPullRequest(github, prId, prNumber, pullRequestSha, testBranchName)
            .then(function () {
                function onStatusMessage (e) {
                    var statusBody = e.body;

                    if (!/continuous-integration\/travis-ci\//.test(statusBody.context))
                        return;

                    if (statusBody.sha !== pullRequestSha)
                        return;

                    if (statusBody.state === 'pending')
                        return;

                    webhooksListener.off(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);

                    _onTestsFinished(github, prNumber, testBranchName, statusBody.state, statusBody.target_url);
                }

                webhooksListener.on(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);
            });
    });
}