import GitHub from './github';
import WebHooksListener from './webhooks-listener';
import GITHUB_MESSAGE_TYPES from './github-message-types';
import log from './log';

var RUN_TESTS_ON_PULL_REQUEST_SYNCHRONIZE_TIMEOUT = 5 * 60 * 1000;

//API
export function init (githubUser, githubRepo, githubOauthToken, webhooksListener) {
    var github = new GitHub(githubUser, githubRepo, githubOauthToken);

    webhooksListener.on(GITHUB_MESSAGE_TYPES.PULL_REQUEST, function (e) {
        var prBody = e.body;
        log('Pull request message: ' + JSON.stringify(prBody, null, 4));

        if (/temp-pr/.test(prBody.pull_request.base.ref))
            return;

        if (!/opened/.test(prBody.action))
            return;

        var owner          = prBody.repository.owner.login;
        var repo           = prBody.repository.name;
        var pullRequestSha = prBody.pull_request.head.sha;
        var prId           = prBody.pull_request.id;
        var prNumber       = prBody.number;
        var testBranchName = 'rp-' + prId;
        var runningTests   = {};
        var testsStarted   = false;

        var mergeCommitWithTestBranchTimeout = null;
        var testCommentId                    = null;

        function onTestsStarted (commitSha) {
            function onStatusMessage (e) {
                var statusBody = e.body;
                log('Status message: ' + JSON.stringify(e.body, null, 4));

                if (!/continuous-integration\/travis-ci\//.test(statusBody.context))
                    return;

                if (statusBody.sha !== commitSha)
                    return;

                if (statusBody.state === 'pending') {
                    if (!runningTests[commitSha]) {
                        runningTests[commitSha] = true;
                        github.createPullRequestComment(prNumber, 'tests for commit ' + commitSha + ' started: ' +
                                                                  statusBody.target_url, owner, repo)
                            .then(function (commentId) {
                                testCommentId = commentId;
                            });
                    }
                    return;
                }

                webhooksListener.off(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);

                runningTests[pullRequestSha] = null;
                github.editComment(testCommentId, 'tests for commit ' + commitSha + ' **' + statusBody.state +
                                                  '**: ' + statusBody.target_url, owner, repo);
            }

            webhooksListener.on(GITHUB_MESSAGE_TYPES.STATUS, onStatusMessage);
        }

        github.createBranch(pullRequestSha, testBranchName)
            .then(function () {
                onTestsStarted(pullRequestSha);

                function onPullRequestEvents (e) {
                    log('Pull request message: ' + JSON.stringify(e.body, null, 4));
                    if (e.body.pull_request.id !== prId)
                        return;

                    if (e.body.action === 'closed') {
                        github.deleteBranch(testBranchName);
                        webhooksListener.off(GITHUB_MESSAGE_TYPES.PULL_REQUEST, onPullRequestEvents);

                        return;
                    }

                    if (e.body.action === 'synchronize') {
                        if (mergeCommitWithTestBranchTimeout) {
                            clearTimeout(mergeCommitWithTestBranchTimeout);
                            mergeCommitWithTestBranchTimeout = null;
                            testsStarted                     = false;
                        }

                        mergeCommitWithTestBranchTimeout = setTimeout(function () {
                            github.syncBranchWithCommit(testBranchName, e.body.pull_request.head.sha);
                            onTestsStarted(e.body.pull_request.head.sha);
                        }, RUN_TESTS_ON_PULL_REQUEST_SYNCHRONIZE_TIMEOUT);
                    }
                }

                webhooksListener.on(GITHUB_MESSAGE_TYPES.PULL_REQUEST, onPullRequestEvents);
            });
    });
}