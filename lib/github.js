'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _Promise = require('babel-runtime/core-js/promise').default;

var _regeneratorRuntime = require('babel-runtime/regenerator').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

function makePromise(context, fn, args) {
    return new _Promise(function (resolve, reject) {
        fn.apply(context, args.concat(function (err, res) {
            if (err) {
                console.log('ERROR:', err);
                throw new Error(err);
                reject(err);
            } else {
                console.log(res);
                resolve(res);
            }
        }));
    });
}

var GitHub = (function () {
    function GitHub(user, repo, oauthToken) {
        _classCallCheck(this, GitHub);

        this.githubInitOptions = {
            version: '3.0.0',
            // optional
            protocol: 'https',
            host: 'api.github.com',
            timeout: 5000
        };

        this.user = user;
        this.repo = repo;

        this.github = new _github2.default(this.githubInitOptions);
        this.github.authenticate({
            type: 'oauth',
            token: oauthToken
        });
    }

    //returns new branch name and branch commit sha

    GitHub.prototype.createBranch = function createBranch(baseSha, branchName) {
        var refName, msg;
        return _regeneratorRuntime.async(function createBranch$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    refName = 'refs/heads/' + branchName;
                    msg = {
                        user: this.user,
                        repo: this.repo,
                        ref: refName,
                        sha: baseSha
                    };
                    return context$2$0.abrupt('return', makePromise(this.github.gitdata, this.github.gitdata.createReference, [msg]).then(function (data) {
                        return new _Promise(function (resolve) {
                            return resolve({
                                branchName: refName,
                                branchSha: data.object.sha
                            });
                        });
                    }));

                case 3:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    GitHub.prototype.deleteBranch = function deleteBranch(branchName) {
        var refName, msg;
        return _regeneratorRuntime.async(function deleteBranch$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    refName = 'heads/' + branchName;
                    msg = {
                        user: this.user,
                        repo: this.repo,
                        ref: refName
                    };
                    return context$2$0.abrupt('return', makePromise(this.github.gitdata, this.github.gitdata.deleteReference, [msg]).then(function () {
                        return new _Promise(function (resolve) {
                            return resolve();
                        });
                    }));

                case 3:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    //returns new pull request number

    GitHub.prototype.createPullRequest = function createPullRequest(title, base, head) {
        var msg;
        return _regeneratorRuntime.async(function createPullRequest$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    msg = {
                        user: this.user,
                        repo: this.repo,
                        title: title,
                        base: base,
                        head: head
                    };
                    return context$2$0.abrupt('return', makePromise(this.github.pullRequests, this.github.pullRequests.create, [msg]).then(function (res) {
                        return new _Promise(function (resolve) {
                            return resolve(res.number);
                        });
                    }));

                case 2:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    //returns the last commit sha

    GitHub.prototype.mergePullRequest = function mergePullRequest(commitSha, prNumber, message) {
        var msg;
        return _regeneratorRuntime.async(function mergePullRequest$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    msg = {
                        user: this.user,
                        repo: this.repo,
                        sha: commitSha,
                        number: prNumber,
                        commit_message: message
                    };
                    return context$2$0.abrupt('return', makePromise(this.github.pullRequests, this.github.pullRequests.merge, [msg]).then(function (res) {
                        return new _Promise(function (resolve) {
                            return resolve(res.sha);
                        });
                    }));

                case 2:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    GitHub.prototype.createPullRequestComment = function createPullRequestComment(prNumber, comment) {
        var msg;
        return _regeneratorRuntime.async(function createPullRequestComment$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    msg = {
                        user: this.user,
                        repo: this.repo,
                        number: prNumber,
                        body: comment
                    };
                    return context$2$0.abrupt('return', makePromise(this.github.issues, this.github.issues.createComment, [msg]).then(function (res) {
                        return new _Promise(function (resolve) {
                            return resolve(res);
                        });
                    }));

                case 2:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return GitHub;
})();

exports.default = GitHub;
module.exports = exports.default;
//# sourceMappingURL=github.js.map