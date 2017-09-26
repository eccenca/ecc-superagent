/* global describe, it */

// imports
import should from 'ecc-test-helpers';

// nock
import nock from 'nock';

// import module
import request from '../index.js';
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

    describe('should get requests with errors correctly', () => {

        nock('http://test.com').get('/').twice().reply(415, 'FAIL');


        it('should get page as an observable', (done) => {
            request
                .get('http://test.com')
                .observe() // this returns Rx.Observable
                .subscribe(_.noop, function(err){

                    should(err).is.a.Error();

                    should(err.response.text).equal('FAIL');

                    done();
                });
        });

        it('should get page with .end()', (done) => {
            request
                .get('http://test.com')
                .end(function(err, res) {
                    should(err).is.a.Error();
                    should(res.text).equal('FAIL');
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

});
