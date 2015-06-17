import * as pullRequestHandler from './webhooks-handler.js';
import EventEmitter from './event-emitter.js';
import GITHUB_MESSAGE_TYPES from './github-message-types';

var MESSAGE_TYPES = {
    PULL_REQUEST: 'pullRequest',
    STATUS:       'status',
    DEFAULT:      'default'
};

export default class WebhooksListener {
    constructor () {
        this.eventEmitter = new EventEmitter();
    }

    on (evt, listener) {
        return this.eventEmitter.on(evt, listener);
    }

    off (evt, listener) {
        return this.eventEmitter.off(evt, listener);
    }

    addMessage (header, body) {
        var event = '';

        switch (header) {
            case 'pull_request':
                event = GITHUB_MESSAGE_TYPES.PULL_REQUEST;
                break;

            case 'status':
                event = GITHUB_MESSAGE_TYPES.STATUS;
                break;

            default:
                event = GITHUB_MESSAGE_TYPES.DEFAULT;
                break;
        }

        this.eventEmitter.emit(event, {
            body: body
        });
    }
}