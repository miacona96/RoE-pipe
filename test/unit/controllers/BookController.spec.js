//var server = require("../../../app")
var supertest = require('supertest')
var util = require('util')

require('../../lifecycle.test')

describe('POST /api/publish', function() {
    
    /*
    it("should respond with 200 id is authorised", async () => {
        const result = await request(app).post("/api/publish")
            .send({
                product_id: "123",
                origin: "localhost:3000",
            })
            .expect("Content-Type", /json/)
            .expect(200);

    });
    */
    // /application\/json/
    // Test for publishing a new book version
    var createdBookId = 0
    it('Should create a book record', function (done) {
        var agent = supertest.agent(sails.hooks.http.app);
        agent
        //supertest(sails.hooks.http.app)
            .post('/api/publish')
            .set('Accept', 'application/json')
            .send({"header": "some key", "body": "some body"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, result) {
                if (err) {
                    done(err);
                } 
                else {
                    result.body.should.be.an('object');
                    result.body.should.have.property('created_at', 'timestamp');
                    result.body.should.have.property('updated_at', 'timestamp');
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

describe('GET /api/books', function(){
    // test for fetching published books
    it('Should get published books matching string parameters', function(done){
    var agent = supertest.agent(sails.hooks.http.app);
    agent
    // supertest(sails.hooks.http.app)
            .get('/api/books')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, result) {
                if (err) {
                    console.log(result)
                    done(err);
                } 
                else {
                    result.body.should.be.an('array') //a list with a json object
                    result.body.should.have.length(1)
                    done();
                }
            });
    })
})