import _ from 'lodash';

// import array of all superagent http methods
import methods from 'methods';

// Instead of delete superagent uses del, so we need to add it
methods.indexOf('del') == -1 && methods.push('del');

const superagentGlobalPlugin = superagent => {
    // This is a map of global superagent plugins
    const globalPlugins = {};

    /**
     *
     * Adds a plugin to each request if fn is a function, deletes it otherwise
     *
     * @param {String} key
     * @param {Function|*} fn
     * @returns {superagent}
     */
    superagent.useForEachRequest = function(key, fn) {
        //
        if (_.isFunction(fn)) {
            globalPlugins[key] = fn;
        } else {
            delete globalPlugins[key];
        }
        return this;
    };

    // Apply method for each superagent method like .get and .post
    methods.forEach(method => {
        const oldMethod = superagent[method];

        superagent[method] = function() {
            let request = oldMethod.apply(superagent, arguments);
            _.forEach(globalPlugins, plugin => {
                request = request.use(plugin);
            });
            return request;
        };
    });
};

export default superagentGlobalPlugin;
