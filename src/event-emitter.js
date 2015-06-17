export default class EventEmitter {
    constructor() {
        this.eventsListeners = [];
    }

    emit(evt) {
        var listeners = this.eventsListeners[evt];

        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i])
                    listeners[i].apply(this, Array.prototype.slice.apply(arguments, [1]));
            }
        }
    }

    off(evt, listener) {
        var listeners = this.eventsListeners[evt];

        if (listeners) {
            this.eventsListeners[evt] = listeners.filter(function (item) {
                return item !== listener;
            });
        }
    }

    on(evt, listener) {
        if (!this.eventsListeners[evt])
            this.eventsListeners[evt] = [];

        this.eventsListeners[evt].push(listener);
    }
};