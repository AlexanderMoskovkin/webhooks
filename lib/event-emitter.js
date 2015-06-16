"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check").default;

exports.__esModule = true;

var EventEmitter = (function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        this.eventsListeners = [];
    }

    EventEmitter.prototype.emit = function emit(evt) {
        var listeners = this.eventsListeners[evt];

        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i]) listeners[i].apply(this, Array.prototype.slice.apply(arguments, [1]));
            }
        }
    };

    EventEmitter.prototype.off = function off(evt, listener) {
        var listeners = this.eventsListeners[evt];

        if (listeners) {
            this.eventsListeners[evt] = listeners.filter(function (item) {
                return item !== listener;
            });
        }
    };

    EventEmitter.prototype.on = function on(evt, listener) {
        if (!this.eventsListeners[evt]) this.eventsListeners[evt] = [];

        this.eventsListeners[evt].push(listener);
    };

    return EventEmitter;
})();

exports.default = EventEmitter;
;
module.exports = exports.default;
//# sourceMappingURL=event-emitter.js.map