const _ = require('lodash');

function parseHeader(rawHeaders) {

    //var rawHeaders = getRawHeaders(str);

    return _.chain(rawHeaders)
        .chunk(2)
        .sortBy((value) => value[0])
        .reduce((result, current) => {

            var field = current[0].toLowerCase();
            var value = current[1];

            if (typeof result[field] === "string") {
                result[field] += ', ' + value;
            } else {
                result[field] = value;
            }

            return result;
        }, {})
        .value();

}

module.exports = parseHeader;
