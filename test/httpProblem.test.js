/* global describe, it */
// imports
import should from 'should';

global.__DEBUG__ = true;

// nock
import nock from 'nock';

// import module
import request from '../index.js';

import _ from 'lodash';

// Each Test file needs a unique url
const uri = 'http://test-problems.com';

describe('httpProblem', () => {
    describe('should get requests with errors correctly', () => {
        nock(uri)
            .get('/')
            .twice()
            .reply(415, 'FAIL');

        it('should get page as an observable', done => {
            request
                .get(uri)
                .observe() // this returns Rx.Observable
                .subscribe(_.noop, err => {
                    should(err).is.a.Error();
                    should(err.isHTTPProblem).equal(true);
                    should(err.response.text).equal('FAIL');

                    done();
                });
        });

        it('should get page with .end()', done => {
            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.isHTTPProblem).equal(true);
                should(res.text).equal('FAIL');
                should(err.response.text).equal('FAIL');
                done();
            });
        });
    });

    describe('should rewrite http problems', () => {
        it('on timeout error', done => {
            nock(uri)
                .get('/')
                .delayConnection(2000)
                .reply(200, 'a');

            request
                .get(uri)
                .timeout({
                    response: 20,
                    deadline: 20,
                })
                .end((err, res) => {
                    should(err).is.a.Error();
                    should(err.title).equal('A timeout error occurred');
                    should(err.message).equal(`${err.title}\n${err.detail}`);
                    should(err.response.type).equal('application/problem+json');
                    done();
                });
        });

        it('on 4xx errors', done => {
            const errorcode = _.random(400, 410);

            nock(uri)
                .get('/')
                .reply(
                    errorcode,
                    {title: 'Test', detail: 'Test Detail'},
                    {'Content-Type': 'application/problem+json'}
                );

            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.statusCode).equal(errorcode);
                should(err.title).equal('Test');
                should(err.detail).equal('Test Detail');
                should(err.message).equal('Test\nTest Detail');
                should(err.response.type).equal('application/problem+json');
                done();
            });
        });

        it('on 5xx errors', done => {
            const errorcode = _.random(500, 520);

            nock(uri)
                .get('/')
                .reply(
                    errorcode,
                    {title: 'Test', detail: 'Test Detail'},
                    {'Content-Type': 'application/problem+json'}
                );

            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.statusCode).equal(errorcode);
                should(err.title).equal('Test');
                should(err.detail).equal('Test Detail');
                should(err.message).equal('Test\nTest Detail');
                should(err.response.type).equal('application/problem+json');
                done();
            });
        });

        it('on "old message format" errors', done => {
            const message = 'Such a test message';

            const errorcode = _.random(400, 410);
            nock(uri)
                .get('/')
                .reply(
                    errorcode,
                    {message},
                    {'Content-Type': 'application/json'}
                );

            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.statusCode).equal(errorcode);
                should(err.title).equal('An Error occurred');
                should(err.detail).equal(message);
                should(err.message).equal(`An Error occurred\n${message}`);
                should(err.response.type).equal('application/problem+json');

                done();
            });
        });

        it('on plain text errors', done => {
            const errorcode = _.random(400, 410);
            nock(uri)
                .get('/')
                .reply(errorcode, 'Something went wrong');

            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.statusCode).equal(errorcode);
                should(err.title).equal('An Error occurred');
                should(err.detail).equal('Something went wrong');
                should(err.message).equal(
                    'An Error occurred\nSomething went wrong'
                );
                should(err.response.type).equal('application/problem+json');

                done();
            });
        });

        it('on empty errors', done => {
            nock(uri)
                .get('/')
                .reply(404, '');

            request.get(uri).end((err, res) => {
                should(err).is.a.Error();
                should(err.statusCode).equal(404);
                should(err.title).equal('An Error occurred');
                should(err.detail).equal('HTTP Error: Not Found');
                should(err.message).equal(
                    'An Error occurred\nHTTP Error: Not Found'
                );
                should(err.response.type).equal('application/problem+json');

                done();
            });
        });
    });
});
