/* global describe, it */
// imports
import should from 'ecc-test-helpers';

// nock
import nock from 'nock';

// import module
import request from '../index.js';

import _ from 'lodash';

describe('httpProblem', () => {

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

                    const title = 'An Timeout error occurred';

                    should(err).is.a.Error();
                    should(err.title).equal(title);
                    should(err.httpProblem).equal(true);
                    should(err.message).equal('Test\nTest Detail');
                    should(err.response.type).equal('application/json');
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
                    should(err.httpProblem).equal(true);
                    should(err.title).equal('Test');
                    should(err.detail).equal('Test Detail');
                    should(err.message).equal('Test\nTest Detail');
                    should(err.response.type).equal('application/json');
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
                    should(err.httpProblem).equal(true);
                    should(err.title).equal('Test');
                    should(err.detail).equal('Test Detail');
                    should(err.message).equal('Test\nTest Detail');
                    should(err.response.type).equal('application/json');
                    done();
                });
        });


    })


});
