/* global describe, it */
// imports
import should from 'ecc-test-helpers';

// nock
import nock from 'nock';
nock('http://test.com').get('/').reply(200, 'OK');

// import module
import request from '../index.js';

// main test suite
describe('ReSPARQLer', () => {
    it('should exist', () => {
        // check object
        should.exist(request);
    });

    it('should get page', (done) => {
        request
            .get('http://test.com')
            .observe() // this returns Rx.Observable
            .subscribe(function(res) {
                should(res.text).equal('OK');
                done();
            });
    });
});
