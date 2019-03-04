var supertest = require('supertest')
var util = require('util')

require('../../lifecycle.test')

describe('The Book Controllers', function() {
    
    var createdBookId = 0
    it('Should create a book', function (done) {
        var agent = supertest.agent(sails.hooks.http.app);
        agent
        .post('/publish')
        .set('Accept', 'application/json')
        .send({"title": "a title", "body": "some body"})
        .expect('Content-Type', /text/)
        .expect(200)
        .end(function (err, result) {
            if (err) {
                done(err);
            } 
            else {
                result.body.should.be.an('object');
                result.body.should.have.property('id');
                result.body.should.have.property('title', 'a title');
                result.body.should.have.property('author', 'some author');
                result.body.should.have.property('isbn', 'some isbn');
                result.body.should.have.property('version', 'some version');
                createdBookId = result.body.id;
                done();
            }
        });
        })
})