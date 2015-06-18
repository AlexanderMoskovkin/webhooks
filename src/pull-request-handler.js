import GitHub from './github';
import WebHooksListener from './webhooks-listener';
import GITHUB_MESSAGE_TYPES from './github-message-types';

//API
export function init (githubUser, githubRepo, githubOauthToken, webhooksListener) {
    var github = new GitHub(githubUser, githubRepo, githubOauthToken);

    webhooksListener.on(GITHUB_MESSAGE_TYPES.PULL_REQUEST, function (e) {
        var prBody = e.body;

        if (/temp-pr/.test(prBody.pull_request.base.ref))
            return;

        if (!/opened/.test(prBody.action))
            return;

        var pullRequestSha = prBody.pull_request.head.sha;
        var prId           = prBody.pull_request.id;
        var prNumber       = prBody.number;
        var testBranchName = 'rp-' + prId;
        var testsStarted   = false;

        github.createBranch(pullRequestSha, testBranchName)
            .then(function () {
                function onStatusMessage (e) {
                    var statusBody = e.body;

                    if (!/continuous-integration\/travis-ci\//.test(statusBody.context))
                        return;

                    if (statusBody.sha !== pullRequestSha)
                        return;

                    if (statusBody.state === 'pending' && !testsStarted) {
                        testsStarted = true;
                        github.createPullRequestComment(prNumber, 'tests started: ' + statusBody.target_url);
                        return;
                    }

                    webhooksListener.off(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);

                    github.createPullRequestComment(prNumber, 'Tests ' + statusBody.state);
                    github.deleteBranch(testBranchName);
                }

                webhooksListener.on(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);
            });
    });
}