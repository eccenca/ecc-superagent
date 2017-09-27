/* global describe, it */
// imports
import should from 'ecc-test-helpers';

// nock
import nock from 'nock';

// import module
import request from '../index.js';

import parseHeaders from '../src/parseHeaders';
import getRawHeaders from '../src/getRawHeaders';

import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';
import _ from 'lodash';

describe('Headers Fix', () => {
    it('should add rawHeaders', (done) => {

        nock('http://testheaders.com').get('/').reply(200, 'OK',
            {'X-HEADER': 'value'}
        );

        request
            .get('http://testheaders.com')
            .observe() // this returns Rx.Observable
            .subscribe(function(res) {

                should(res.rawHeaders).eql([
                    'X-HEADER', 'value'
                ]);

                done();
            });

    });

    it('should parse rawHeaders', (done) => {

        nock('http://testheaders.com').get('/').reply(200, 'OK',
            {'X-HEADER': 'value'}
        );

        request
            .get('http://testheaders.com')
            .observe() // this returns Rx.Observable
            .subscribe(function(res) {
                should(res.headers).eql({
                    'x-header': 'value'
                });


                done();
            });

    });
});

describe('parseHeaders', () => {

    const jsons = globby.sync(path.join(__dirname, 'fixtures', 'headers', '*.json'))
        .reduce((result, file) => {
            const key = path.basename(file);

            result[key] = fs.readJsonSync(file);

            return result;
        }, {});

    it('should parse headers browser independently', () => {

        var result = { 'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
            'content-type': 'application/json',
            expires: '0',
            link: '<https://sscpoc-ericsson.eccenca.com/dataplatform/pubsub/hub/default>;rel="hub", ' +
            '<https://sscpoc-ericsson.eccenca.com/data/mdm/>;rel="self"',
            pragma: 'no-cache' };

        _.forEach(jsons, (headers, file) => {

            should(parseHeaders(getRawHeaders(headers))).eql(result, 'Parsing different for ' + file)

        });

    });

});
