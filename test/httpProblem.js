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

        it('on old errors', (done) => {

            const errorcode = _.random(400, 410);
            nock('http://test.com')
                .get('/')
                .reply(
                    errorcode,
                    'Something went wrong'//,
                    //{'Content-Type': 'application/json'}
                );


            request.get('http://test.com')
                .end(function(err, res) {

                    should(err).is.a.Error();
                    should(err.statusCode).equal(errorcode);
                    should(err.title).equal('DEPRECATED old format response');
                    should(err.detail).equal('Something went wrong');
                    should(err.message).equal('DEPRECATED old format response\nSomething went wrong');
                    should(err.response.type).equal('application/problem+json');
                    done();
                });
        });


    })


});
