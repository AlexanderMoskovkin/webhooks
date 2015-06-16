import GitHub from './github';

var GITHUB_USER = 'AlexanderMoskovkin';
var GITHUB_REPO = 'testcafe-phoenix';
var OAUTH_TOKEN = 'eb86634398d9049fd40fffd4ad9437ce2a198be8';
//'29ca9b01bc72125d3ea1e6ee61be7374dc56da26'

var github = new GitHub(GITHUB_USER, GITHUB_REPO, OAUTH_TOKEN);

//returns sha of the tested commit
export async function onPullRequest(baseCommitSha, prHeadLabel, prId, prNumber) {
    var ctx = {
        baseCommitSha: baseCommitSha,
        prHeadLabel: prHeadLabel,
        prId: prId,
        prNumber: prNumber,

        testBranchName: 'rp-' + prId,
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

export async function onTestsFinished(ctx, status, reportUrl) {
    return github.createPullRequestComment(ctx.prNumber, status + ': ' + reportUrl)
        .then(function () {
            github.deleteBranch(ctx.testBranchName);
        });
}