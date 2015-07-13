# Eccenca extended Superagent lib

Extended version of Superagent.js to use within eLDS framework

## Usage

Includes Superagent.js and Superagent-rx packages.
So, all you need to use it is import and call with your ajax requests:

```js
import request from 'ecc-superagent';
// ...
// parse results
request
    .get(requestUrl)
    .observe() // this returns Rx.Observable
    .subscribe(function(res) {
        // use res
    });
// use results ...
```
