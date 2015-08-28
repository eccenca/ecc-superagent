/* eslint no-var: 0 */
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
.filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
}).forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = {
    devtool: 'inline-source-map',
    context: path.resolve(__dirname),
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'es5'),
        filename: 'component.js',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        root: path.resolve(__dirname),
    },
    externals: nodeModules,
};
