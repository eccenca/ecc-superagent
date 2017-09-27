import _ from 'lodash';
import warning from 'warning';

const DEPRECATION_WARNING = `@eccenca/superagent: You used .message of to access Error details.
You should use the more detailed .title and .detail .`;

function httpProblemHandler(callback, err, res) {

    // Adapt new errors (problem+json) to the old format and inform the user about deprecation.
    if (err) {

        // Yay, we got a nice HTTP Problem error here
        if (_.get(err, 'response.type') === 'application/problem+json') {

            err.title = err.response.body.title;
            err.detail = err.response.body.detail;
            err.statusCode = _.get(err, 'response.statusCode', undefined);
        }
        //We try to fit all non-http errors in the HTTP error scheme
        else {

            let detail = err.message;
            let title = 'An Error occurred';

            const responseText = _.get(err, 'response.text', '');
            const responseMessage = _.get(err, 'response.body.message', '');

            err.statusCode = _.get(err, 'response.statusCode', undefined);

            // TODO: Which errors are also handled by superagent ? -> https://github.com/visionmedia/superagent
            // Handle Superagent Timeout Errors
            if (err.code === 'ECONNABORTED') {
                title = 'A timeout error occurred';
            }
            // Handle HTTP Errors which have a body formed {message: '...'}
            else if (!_.isEmpty(responseMessage)) {
                detail = responseMessage;
            }
            // Handle plain HTTP text errors
            else if (!_.isEmpty(responseText)) {
                detail = responseText;
            }
            // Handle empty HTTP Errors with status code
            else if (_.isNumber(err.statusCode)) {
                detail = 'HTTP Error: ' + detail;
            }

            err.title = title;
            err.detail = detail;
            err.message = title + '\n' + detail;
        }

        _.set(err, 'response.type', 'application/problem+json');

        err = new Proxy(err, {
            get: function(t, n) {
                if (n === 'message') {
                    warning(!__DEBUG__, DEPRECATION_WARNING);
                    return t.title + '\n' + t.detail;
                }
                else {
                    return t[n];
                }
            }
        });

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
