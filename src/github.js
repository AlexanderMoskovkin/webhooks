import NodeGitHub from 'github';
import log from './log';

function makePromise (context, fn, args) {
    return new Promise(function (resolve, reject) {
        fn.apply(context, args.concat(function (err, res) {
            if (err) {
                log('ERROR:' + JSON.stringify(err, null, 4));
                reject(err);
            }
            else {
                resolve(res);
            }
        }));
    });
}

export default class GitHub {
    constructor (user, repo, oauthToken) {
        this.githubInitOptions = {
            version:  "3.0.0",
            // optional
            protocol: "https",
            host:     "api.github.com",
            timeout:  5000
        };

        this.user = user;
        this.repo = repo;

        this.github = new NodeGitHub(this.githubInitOptions);
        this.github.authenticate({
            type:  'oauth',
            token: oauthToken
        });
    }

    //returns new branch name and branch commit sha
    async createBranch (baseSha, branchName) {
        log('createBranch', baseSha, branchName);
        var refName = 'refs/heads/' + branchName;

        var msg = {
            user: this.user,
            repo: this.repo,
            ref:  refName,
            sha:  baseSha
        };

        return makePromise(this.github.gitdata, this.github.gitdata.createReference, [msg])
            .then(function (data) {
                return new Promise(resolve => resolve({
                    branchName: refName,
                    branchSha:  data.object.sha
                }));
            });
    }

    async deleteBranch (branchName) {
        log('deleteBranch', branchName);
        var refName = 'heads/' + branchName;

        var msg = {
            user: this.user,
            repo: this.repo,
            ref:  refName
        };

        return makePromise(this.github.gitdata, this.github.gitdata.deleteReference, [msg])
            .then(function () {
                return new Promise(resolve => resolve());
            });
    }

    //returns new pull request number
    async createPullRequest (title, base, head) {
        log('createPullRequest', title, base, head);

        var msg = {
            user:  this.user,
            repo:  this.repo,
            title: title,
            base:  base,
            head:  head
        };

        return makePromise(this.github.pullRequests, this.github.pullRequests.create, [msg])
            .then(function (res) {
                return new Promise(resolve => resolve(res.number));
            });
    }

    //returns the last commit sha
    async mergePullRequest (commitSha, prNumber, message) {
        log('mergePullRequest', commitSha, prNumber, message);

        var msg = {
            user:           this.user,
            repo:           this.repo,
            sha:            commitSha,
            number:         prNumber,
            commit_message: message
        };

        return makePromise(this.github.pullRequests, this.github.pullRequests.merge, [msg])
            .then(function (res) {
                return new Promise(resolve => resolve(res.sha));
            });
    }

    async createPullRequestComment (prNumber, comment, owner, repo) {
        log('createPullRequestComment', prNumber, comment);

        var msg = {
            user:   owner || this.user,
            repo:   repo || this.repo,
            number: prNumber,
            body:   comment
        };

        return makePromise(this.github.issues, this.github.issues.createComment, [msg])
            .then(function (res) {
                return new Promise(resolve => resolve(res.id));
            });
    }

    async editComment (id, comment, owner, repo) {
        log('editComment', id, comment);

        var msg = {
            user: owner || this.user,
            repo: repo || this.repo,
            id:   id,
            body: comment
        };

        return makePromise(this.github.issues, this.github.issues.editComment, [msg])
            .then(function (res) {
                return new Promise(resolve => resolve(res));
            });
    }

    async syncBranchWithCommit (branchName, commitSha) {
        log('syncBranchWithCommit', branchName, commitSha);

        var msg = {
            user:  this.user,
            repo:  this.repo,
            ref:   'heads/' + branchName,
            sha:   commitSha,
            force: true
        };

        return makePromise(this.github.gitdata, this.github.gitdata.updateReference, [msg]);
    }
}