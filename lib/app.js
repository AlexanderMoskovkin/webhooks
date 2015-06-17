'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

var _webhooksHandlerJs = require('./webhooks-handler.js');

var webhooksHandler = _interopRequireWildcard(_webhooksHandlerJs);

var _eventEmitterJs = require('./event-emitter.js');

var _eventEmitterJs2 = _interopRequireDefault(_eventEmitterJs);

var MESSAGE_TYPES = {
    PULL_REQUEST: 'pullRequest',
    STATUS: 'status',
    DEFAULT: 'default'
};

var WebhooksListener = (function () {
    function WebhooksListener() {
        _classCallCheck(this, WebhooksListener);

        this.eventEmitter = new _eventEmitterJs2.default();
    }

    WebhooksListener.prototype.on = function on(evt, listener) {
        return this.eventEmitter.on(evt, listener);
    };

    WebhooksListener.prototype.off = function off(evt, listener) {
        return this.eventEmitter.off(evt, listener);
    };

    WebhooksListener.prototype.addMessage = function addMessage(header, body) {
        var event = '';

        switch (header) {
            case 'pull_request':
                event = MESSAGE_TYPES.PULL_REQUEST;
                break;

            case 'status':
                event = MESSAGE_TYPES.STATUS;
                break;

            default:
                event = MESSAGE_TYPES.DEFAULT;
                break;
        }

        this.eventEmitter.emit(event, {
            body: body
        });
    };

    return WebhooksListener;
})();

function getPullRequest() {
    return {
        'action': 'opened',
        'number': 47,
        'pull_request': {
            'id': 37809578,
            'number': 47,
            'head': {
                'label': 'AlexanderMoskovkin-test1:master',
                'sha': '609566bb74f0c094dd5c01437d70e5a762c58757'
            },
            'base': {
                'sha': '9c88ece2cb93a99e4082bd1c468d0e11041b3f6d'
            }
        }
    };
}

function getStatus(state) {
    return {
        'id': 242623552,
        'sha': '5d4290f1065b18b14e38f2f26d416c7d4571b6c8',
        'name': 'AlexanderMoskovkin/testcafe-phoenix',
        'target_url': 'https://magnum.travis-ci.com/AlexanderMoskovkin/testcafe-phoenix/builds/12810986',
        'state': state,
        'context': 'continuous-integration/travis-ci/push'
    };
}

function getPendingStatus() {
    return getStatus('pending');
}

function getSuccessStatus() {
    return getStatus('success');
}

function getFailedStatus() {
    return getStatus('failure');
}

var webhooksListener = new WebhooksListener();

webhooksListener.on(MESSAGE_TYPES.PULL_REQUEST, function (e) {
    var prBody = e.body;
    var baseCommitSha = prBody.pull_request.base.sha;
    var prHeadLabel = prBody.pull_request.head.label;
    var prId = prBody.pull_request.id;
    var prNumber = prBody.number;

    webhooksHandler.onPullRequest(baseCommitSha, prHeadLabel, prId, prNumber).then(function (prCtx) {
        function onStatusMessage(e) {
            var statusBody = e.body;

            if (!/continuous-integration\/travis-ci\//.test(context)) return;

            if (statusBody.sha !== testedCommitSha) return;

            if (statusBody.state === 'pending') return;

            webhooksListener.off(MESSAGE_TYPES.STATUS, onStatusMessage);

            webhooksHandler.onTestsFinished(prCtx, statusBody.state, statusBody.target_url);
        }

        webhooksListener.on(MESSAGE_TYPES.STATUS, onStatusMessage);
    });
});

//webhooksListener.addMessage('pull_request', getPullRequest());
/*setTimeout(function () {
    webhooksListener.addMessage('status', getPendingStatus());
}, 1000);*/
setTimeout(function () {
    var status = getFailedStatus();

    webhooksHandler.onTestsFinished({
        prNumber: 47,
        testBranchName: 'rp-37809578'
    }, status.state, status.target_url);
}, 2000);
//# sourceMappingURL=app.js.map