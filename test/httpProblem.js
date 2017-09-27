/* global describe, it */
// imports
import should from 'ecc-test-helpers';

// nock
import nock from 'nock';

// import module
import request from '../index.js';

import _ from 'lodash';

describe('httpProblem', () => {

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

    describe('should rewrite http problems', () => {

        it('on timeout error', (done) => {

            nock('http://test.com')
                .get('/')
                .delayConnection(2000)
                .reply(200, '');

            request.get('http://test.com')
                .timeout({
                    response: 20,
                    deadline: 20,
                })
                .end(function(err, res) {
                    should(err).is.a.Error();
                    should(err.title).equal("A timeout error occurred");
                    should(err.message).equal(err.title+"\n"+err.detail);
                    should(err.response.type).equal('application/problem+json');
                    done();
                })

        });

        it('on 4xx errors', (done) => {

            const errorcode = _.random(400, 410);

            nock('http://test.com')
                .get('/')
                .reply(
                    errorcode,
                    {title: 'Test', detail: 'Test Detail'},
                    {'Content-Type': 'application/problem+json'}
                );


            request.get('http://test.com')
                .end(function(err, res) {
                    should(err).is.a.Error();
                    should(err.statusCode).equal(errorcode);
                    should(err.title).equal('Test');
                    should(err.detail).equal('Test Detail');
                    should(err.message).equal('Test\nTest Detail');
                    should(err.response.type).equal('application/problem+json');
                    done();
                });
        });

        it('on 5xx errors', (done) => {

            const errorcode = _.random(500, 520);

            nock('http://test.com')
                .get('/')
                .reply(
                    errorcode,
                    {title: 'Test', detail: 'Test Detail'},
                    {'Content-Type': 'application/problem+json'}
                );


            request.get('http://test.com')
                .end(function(err, res) {

                    should(err).is.a.Error();
                    should(err.statusCode).equal(errorcode);
                    should(err.title).equal('Test');
                    should(err.detail).equal('Test Detail');
                    should(err.message).equal('Test\nTest Detail');
                    should(err.response.type).equal('application/problem+json');
                    done();
                });
        });


        it('on "old message format" errors', (done) => {

            const message = 'Such a test message';

            const errorcode = _.random(400, 410);
            nock('http://test.com')
                .get('/')
                .reply(
                    errorcode,
                    {message: message},
                    {'Content-Type': 'application/json'}
                );


            request.get('http://test.com')
                .end(function(err, res) {

                    should(err).is.a.Error();
                    should(err.statusCode).equal(errorcode);
                    should(err.title).equal('An Error occurred');
                    should(err.detail).equal(message);
                    should(err.message).equal(`An Error occurred\n${message}`);
                    should(err.response.type).equal('application/problem+json');

                    done();
                });
        });

        it('on plain text errors', (done) => {

            const errorcode = _.random(400, 410);
            nock('http://test.com')
                .get('/')
                .reply(
                    errorcode,
                    'Something went wrong',
                );


            request.get('http://test.com')
                .end(function(err, res) {

                    should(err).is.a.Error();
                    should(err.statusCode).equal(errorcode);
                    should(err.title).equal('An Error occurred');
                    should(err.detail).equal('Something went wrong');
                    should(err.message).equal('An Error occurred\nSomething went wrong');
                    should(err.response.type).equal('application/problem+json');

                    done();
                });
        });

        it('on empty errors', (done) => {

            nock('http://test.com')
                .get('/')
                .reply(
                    404,
                    '',
                );


            request.get('http://test.com')
                .end(function(err, res) {

                    should(err).is.a.Error();
                    should(err.statusCode).equal(404);
                    should(err.title).equal('An Error occurred');
                    should(err.detail).equal('HTTP Error: Not Found');
                    should(err.message).equal('An Error occurred\nHTTP Error: Not Found');
                    should(err.response.type).equal('application/problem+json');

                    done();
                });
        });


    })


});
