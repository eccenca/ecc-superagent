import _ from 'lodash';

function httpProblemHandler(callback, err, res) {

    // Adapt new errors (problem+json) to the old format and inform the user about deprecation.
    if (err) {

        if (_.has(err, 'response.type') && err.response.type === 'application/problem+json') {

            const message = {
                get: function(t, n) {
                    if (n === 'message') {
                        if (__DEBUG__) {
                            console.warn("The usage of message is DEPRECATED. Please use title / detail / cause");
                        }
                        return err.response.body.title+'\n'+err.response.body.detail;
                    }
                    else {
                        return t[n];
                    }
                }
            };
            err = new Proxy(err, message);
            err.title = err.response.body.title;
            err.detail = err.response.body.detail;
            err.statusCode = _.get(err, 'response.statusCode', undefined);
    }
    // Convert connection aborted to a new format problem+json
    else if (err.code === 'ECONNABORTED') {
        // TODO: look at the repository and add more codes (CORS, conn refused ...)
        const m = err.message;
        err.title = 'A timeout error occurred';
        err.detail = err.message;
        const message = {
            get: function(t, n) {
                if (n === 'message') {
                    if (__DEBUG__) {
                        console.warn("The usage of message is DEPRECATED. Please use title / detail / cause");
                    }
                    return 'A timeout error occurred'+'\n'+m;
                }
                else {
                    return t[n];
                }
            }
        };
        err = new Proxy(err, message);
        _.set(err, 'response.type', 'application/problem+json');
    }

}

    callback(err, res);
}

module.exports = function(superagent) {

    const oldEnd = superagent.Request.prototype.end;

    superagent.Request.prototype.end = function(callback) {
        oldEnd.apply(this, [httpProblemHandler.bind(this, callback)]);
    };

    return superagent;
};
