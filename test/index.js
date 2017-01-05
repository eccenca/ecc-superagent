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

// main test suite
describe('SuperAgent', () => {
    it('should exist', () => {
        // check object
        should.exist(request);
    });

    describe('should get requests', () => {

        nock('http://test.com').get('/').twice().reply(200, 'OK');


        it('should get page as an observable', (done) => {
            request
                .get('http://test.com')
                .observe() // this returns Rx.Observable
                .subscribe(function(res) {
                    should(res.text).equal('OK');
                    done();
                });
        });

        it('should get page with .end()', (done) => {
            request
                .get('http://test.com')
                .end(function(err, res) {
                    should(err).equal(null);
                    should(res.text).equal('OK');
                    done();
                });
        });

    });

    describe('Global Plugin Extension', () => {

        it('should exist', () => {
            // check object
            should.exist(request.useForEachRequest);
        });

        it('should register a global plugin', () => {
            // check object
            request.useForEachRequest('testPlugin', request => {
                request.url = 'http://test2.com';
                return request;
            });
        });

        it('should apply a global plugin', (done) => {

            nock('http://test2.com').get('/').reply(200, 'OK');
            nock('http://foobar.com').get('/').reply(403, 'NOPE');

            request
                .get('http://foobar.com')
                .observe() // this returns Rx.Observable
                .subscribe(function(res) {
                    should(res.text).equal('OK');
                    done();
                });

        });

        it('should unregister a global plugin', () => {
            request.useForEachRequest('testPlugin', false);
        });

        it('should do not apply a unregistered plugin', (done) => {

            nock('http://test3.com').get('/').reply(200, 'OK');

            request
                .get('http://test3.com')
                .observe() // this returns Rx.Observable
                .subscribe(function(res) {
                    should(res.text).equal('OK');
                    done();
                });

        });

    });

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

});
