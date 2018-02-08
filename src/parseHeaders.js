const _ = require('lodash');

function parseHeader(rawHeaders) {

    return _.chain(rawHeaders)
        .chunk(2)
        .sortBy(value => value[0])
        .reduce((result, current) => {
            const field = current[0].toLowerCase();
            const value = current[1];

            if (typeof result[field] === 'string') {
                result[field] += `, ${value}`;
            } else {
                result[field] = value;
            }

            return result;
        }, {})
        .value();
}

module.exports = parseHeader;
