const Rx = require('rxjs/Rx');

module.exports = function(superagent) {
    superagent.Request.prototype.observe = function() {
        const self = this;
        // wrap into observable and return
        return Rx.Observable.create(observable => {
            self.end((err, res) => {
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
