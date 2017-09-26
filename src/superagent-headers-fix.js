const rawHeaders = require('./getRawHeaders');
const parseHeaders = require('./parseHeaders');

function fixHeaders(callback, err, res) {

    if (res) {
        delete res.header;
        delete res.headers;

        if (res.xhr) {
            res.rawHeaders = rawHeaders(res.xhr.getAllResponseHeaders());
            // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
            // getResponseHeader still works. so we get content-type even if getting
            // other headers fails.
            //res.header['content-type'] = res.xhr.getResponseHeader('content-type');

        } else {

            res.rawHeaders = res.request.res.rawHeaders;

        }

        res.headers = res.header = parseHeaders(res.rawHeaders)

        res._setHeaderProperties(res.headers);

    }


    callback(err, res);
}

module.exports = function(superagent) {

    const oldEnd = superagent.Request.prototype.end;

    superagent.Request.prototype.end = function(callback) {
        const oldCallback = callback;

        oldEnd.apply(this, [fixHeaders.bind(this, oldCallback)]);

    };

    return superagent;
};
