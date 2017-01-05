const _ = require('lodash');


function getRawHeaders(string) {
    var lines = string.split(/\r?\n/);

    var res = [];

    for (var i = 0, len = lines.length; i < len; ++i) {
        var line = lines[i];

        if (!_.isEmpty(line)) {
            var index = line.indexOf(':');

            var field = line.slice(0, index);
            var val = _.trim(line.slice(index + 1));

            res.push(field);
            res.push(val);
        }

    }

    return res;

}

module.exports = getRawHeaders;
