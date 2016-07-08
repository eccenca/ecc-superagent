import superagent from 'superagent';
// load and apply RxJS plugin
import superagentRx from 'superagent-rx';

import superagentGlobalPlugin from './superagent-global-plugin';

superagentRx(superagent);

superagentGlobalPlugin(superagent);

export default superagent;
