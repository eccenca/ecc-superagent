var Rx = require('rxjs/Rx');

module.exports = function(superagent) {
    superagent.Request.prototype.observe = function() {
        var self = this;
        // wrap into observable and return
        return Rx.Observable.create(function(observable) {
            self.end(function(err, res) {
                if (err) {

                    err.response = res;

                    observable.error(err);
                } else {
                    observable.next(res);
                }
                observable.complete();
            });
        });
    };

    return superagent;
};
