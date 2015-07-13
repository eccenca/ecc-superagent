import superagent from 'superagent';
// load and apply RxJS plugin
import superagentRx from 'superagent-rx';
superagentRx(superagent);

export default superagent;
