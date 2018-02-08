const _ = require('lodash');

function getRawHeaders(string) {
    const lines = string.split(/\r?\n/);

    const res = [];

    for (let i = 0, len = lines.length; i < len; ++i) {
        const line = lines[i];

        if (!_.isEmpty(line)) {
            const index = line.indexOf(':');

            const field = line.slice(0, index);
            const val = _.trim(line.slice(index + 1));

            res.push(field);
            res.push(val);
        }
    }

    return res;
}

module.exports = getRawHeaders;
