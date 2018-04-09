import _ from 'lodash';

function httpProblemHandler(callback, err, res) {
    // Adapt new errors (problem+json) to the old format and inform the user about deprecation.
    if (err) {
        let detail = err.message;
        let title = 'An Error occurred';

        err.statusCode = _.get(err, 'response.statusCode', undefined);

        // Yay, we got a nice HTTP Problem error here
        if (_.get(err, 'response.type') === 'application/problem+json') {
            title = _.get(err, 'response.body.title', title);
            detail = _.get(err, 'response.body.detail', detail);
        } else {
            // We try to fit all non-http errors in the HTTP error scheme
            const responseText = _.get(err, 'response.text', '');
            const responseMessage = _.get(err, 'response.body.message', '');

            // TODO: Which errors are also handled by superagent ? -> https://github.com/visionmedia/superagent
            // Handle Superagent Timeout Errors
            if (err.code === 'ECONNABORTED') {
                title = 'A timeout error occurred';
            } else if (!_.isEmpty(responseMessage)) {
                // Handle HTTP Errors which have a body formed {message: '...'}
                detail = responseMessage;
            } else if (!_.isEmpty(responseText)) {
                // Handle plain HTTP text errors
                detail = responseText;
            } else if (_.isNumber(err.statusCode)) {
                // Handle empty HTTP Errors with status code
                detail = `HTTP Error: ${detail}`;
            }
        }

        err.title = title;
        err.detail = detail;
        err.isHTTPProblem = true;

        _.set(err, 'response.type', 'application/problem+json');

        err.message = `${title}\n${detail}`
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
