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

Futhermore it is possible to register/unregister global superagent plugins to manipulate each request.
For Example:

```
import request from 'ecc-superagent';

// Register a plugin which sets a header on each request
request.useForEachRequest('setHeaderPlugin', (request) => {
    request.set('X-Example-Header', 'FOO');
    return request;
});

// The following request will have the X-Example-Header set
request
    .get('http://example.org')
    .observe() // this returns Rx.Observable
    .subscribe(function(res) {
        // use res
    });

// Disable the plugin
request.useForEachRequest('setHeaderPlugin', false);

```