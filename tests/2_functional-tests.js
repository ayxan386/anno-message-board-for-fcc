/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  let last_added = null;
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("posting new threads", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({ text: "test1", delete_password: 123 })
          .end(function(err, res) {
            //console.log(res.body);
            assert.equal(res.status, 200);
            done();
          });
      });
    });
    suite("GET", function() {
      test("getting 10 recent threads", function(done) {
        chai
          .request(server)
          .get("/api/threads/test")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            last_added = res.body[0];
            //console.log(last_added);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length, 10);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "replies");
            assert.property(res.body[0], "text");
            assert.isNull(res.body[0].delete_password);
            done();
          });
      });
    });

    suite("API ROUTING FOR /api/replies/:board", function() {
      suite("POST", function() {
        test("posting new reply", function(done) {
          chai
            .request(server)
            .post("/api/replies/test")
            .send({
              text: "test1",
              delete_password: 123,
              thread_id: last_added._id
            })
            .end(function(err, res) {
              //console.log(last_added);
              assert.equal(res.status, 200);
              done();
            });
        });
      });
      let recRep = null;
      suite("GET", function() {
        test("getting whole list of replies", function(done) {
          chai
            .request(server)
            .get("/api/replies/test")
            .query({thread_id : last_added._id})
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body.replies);
              recRep = res.body.replies[0];
              assert.property(res.body.replies[0], "_id");
              assert.property(res.body.replies[0], "text");
              assert.isNull(res.body.replies[0].delete_password);
              done();
            });
        });
      });

      suite("PUT", function() {
        test("updating reported value of reply to true", function(done) {
          chai
            .request(server)
            .put("/api/replies/test")
            .send({ thread_id: last_added._id, reply_id: recRep._id })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.include(res.body, "success");
              done();
            });
        });
      });

      suite("DELETE", function() {
        test("deleting last reply wrong password", function(done) {
          chai
            .request(server)
            .delete("/api/replies/test")
            .send({
              thread_id: last_added._id,
              delete_password: 1234,
              reply_id: recRep._id
            })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.include(res.body, "incorrect password");
              done();
            });
        });

        test("deleting last reply correct password", function(done) {
          chai
            .request(server)
            .delete("/api/replies/test")
            .send({ thread_id: last_added._id, reply_id:recRep._id,delete_password: 123 })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.include(res.body, "success");
              done();
            });
        });
      });
    });
  });

  suite("PUT", function() {
    test("updating reported value of thread to true", function(done) {
      chai
        .request(server)
        .put("/api/threads/test")
        .send({ thread_id: last_added._id })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.include(res.body, "success");
          done();
        });
    });
  });

  suite("DELETE", function() {
    test("deleting last thread wrong password", function(done) {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: last_added._id, delete_password: 1234 })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.include(res.body, "incorrect password");
          done();
        });
    });

    test("deleting last thread correct password", function(done) {
      chai
        .request(server)
        .delete("/api/threads/test")
        .send({ thread_id: last_added._id, delete_password: 123 })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.include(res.body, "success");
          done();
        });
    });
  });
});
