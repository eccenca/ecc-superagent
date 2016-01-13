# Eccenca extended Superagent lib (ecc-superagent)

Extended version of Superagent.js to use within eLDS framework

## Usage

Includes [Superagent.js](https://github.com/visionmedia/superagent) and [Superagent-rx](https://github.com/yamalight/superagent-rx) packages.
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
