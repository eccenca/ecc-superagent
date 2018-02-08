/* global describe, it */

// imports
import should from 'should';

global.__DEBUG__ = true;

// nock
import nock from 'nock';

// import module
import request from '../index.js';

// Each Test file needs a unique url
const uri = 'http://test.com';

// main test suite
describe('SuperAgent', () => {
    it('should exist', () => {
        // check object
        should.exist(request);
    });

    describe('should get requests', () => {
        nock(uri)
            .get('/')
            .twice()
            .reply(200, 'OK');

        it('should get page as an observable', done => {
            request
                .get(uri)
                .observe() // this returns Rx.Observable
                .subscribe(res => {
                    should(res.text).equal('OK');
                    done();
                });
        });

        it('should get page with .end()', done => {
            request.get(uri).end((err, res) => {
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
                request.url = uri;
                return request;
            });
        });

        it('should apply a global plugin', done => {
            nock(uri)
                .get('/')
                .reply(200, 'OK');
            nock('http://foobar.com')
                .get('/')
                .reply(403, 'NOPE');

            request
                .get('http://foobar.com')
                .observe() // this returns Rx.Observable
                .subscribe(res => {
                    should(res.text).equal('OK');
                    done();
                });
        });

        it('should unregister a global plugin', () => {
            request.useForEachRequest('testPlugin', false);
        });

        it('should do not apply a unregistered plugin', done => {
            nock('http://test3.com')
                .get('/')
                .reply(200, 'OK');

            request
                .get('http://test3.com')
                .observe() // this returns Rx.Observable
                .subscribe(res => {
                    should(res.text).equal('OK');
                    done();
                });
        });
    });
});
