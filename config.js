var path = require('path');

module.exports = {
    testEntryPoint: path.join(__dirname, 'test', 'index.js'),
    webpackConfig: {
        production: require('./webpack.config.js'),
    },
};
