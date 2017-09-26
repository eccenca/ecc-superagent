import superagent from 'superagent';
// load and apply RxJS plugin
// We do not load the real superagent-rx, as we cloned the source code
import superagentRx from './superagent-rx';

import superagentGlobalPlugin from './superagent-global-plugin';

import superagentHeadersFix from './superagent-headers-fix';

superagentHeadersFix(superagent);

superagentRx(superagent);

superagentGlobalPlugin(superagent);

export default superagent;
