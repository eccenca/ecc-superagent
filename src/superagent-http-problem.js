function httpProblemHandler(callback, err, res) {

    // DO something with err/res here :)
    console.warn('foobar');
    // TODO: Please do not forget that if .message is accessed,
    // it should log an deprecation warning if __DEBUG__ is on
    console.warn(__DEBUG__);

    callback(err, res);
}

module.exports = function(superagent) {

    const oldEnd = superagent.Request.prototype.end;

    superagent.Request.prototype.end = function(callback) {
        oldEnd.apply(this, [httpProblemHandler.bind(this, callback)]);
    };

    return superagent;
};
