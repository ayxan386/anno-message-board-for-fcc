/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
let ObjectId = require("mongodb").ObjectId;
module.exports = function(app, db) {
  app
    .route("/api/threads/:board")
    .post((req, res) => {
      const board = req.params.board;
      const text = req.body.text;
      const pass = req.body.delete_password;
      db.collection("board").findOne({ board: board }, (err, doc) => {
        if (!doc) {
          doc = {};
          doc.board = board;
          doc.threads = [];
        }
        doc.threads.push({
          text: text,
          delete_password: pass,
          created_on: new Date().toUTCString(),
          bumped_on: new Date().toUTCString(),
          replies: [],
          _id: new ObjectId(),
          reported: false
        });
        db.collection("board").save(doc, err => {
          res.redirect("/b/" + board + "/");
        });
      });
    })
    .get((req, res) => {
      const board = req.params.board;
      db.collection("board").findOne({ board: board }, (err, doc) => {
        if (doc) {
          let threads = doc.threads
            .map(el => Object.assign({},el,{bumped_on:Date.parse(el.bumped_on)}))
            .sort((a, b) => b.bumped_on - a.bumped_on)
            .slice(0, 10);
          for (let i = 0; i < threads.length; i++) {
            threads[i].replycount = threads[i].replies.length;
            threads[i].replies = threads[i].replies
              .map(el => Object.assign({},el,{created_on:Date.parse(el.created_on)}))
              .sort((a, b) => b.created_on - a.created_on)
              .slice(0, 3);
            threads[i].reported = null;
            threads[i].delete_password=null;
            
          }
          //console.log(threads);
          res.json(threads);
        }
      });
    })
  .delete((req,res) => {
       const board = req.params.board;
       const id = req.body.thread_id;
       const pass = req.body.delete_password;
       db.collection("board").findOne({board},(err,doc) => {
           let thread = doc.threads.filter(el => el._id == id)[0];
           if(thread.delete_password === pass)
             {
               let i = doc.threads.indexOf(thread);
               doc.threads.splice(i,1);
                db.collection("board").save(doc,(err) => {
               if(err)console.log(err);
               res.json("success");
              })
            }
          else {
            res.json("incorrect password");
          }
       })
  })
  .put((req,res) => {
    const board = req.params.board;
       const id = req.body.thread_id;
       db.collection("board").findOne({board},(err,doc) => {
           let thread = doc.threads.filter(el => el._id == id)[0];
           thread.reported = true;
           db.collection("board").save(doc,(err) => {
               if(err)console.log(err);
               res.json("success");
              })
       })
  });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      const board = req.params.board;
      const text = req.body.text;
      const pass = req.body.delete_password;
      const id = req.body.thread_id;
      db.collection("board").findOne({ board: board }, (err, doc) => {
        if (err) console.log(err);
        if (doc) {
          let thread = doc.threads.filter(el => el._id == id)[0];
          thread.bumped_on = new Date().toUTCString();
          thread.replies.push({
            _id: new ObjectId(),
            text: text,
            created_on: new Date().toUTCString(),
            delete_password: pass,
            reported: false
          });
          db.collection("board").save(doc, err => {
            if (err) console.log(err);
            res.redirect("/b/" + board + "/" + id + "/");
          });
        }
      });
    })
    .get((req, res) => {
      const board = req.params.board;
      const id = req.query.thread_id;
      db.collection("board").findOne({ board }, (err, doc) => {
        if (err) console.log(err);
        if (doc) {
          let thread = doc.threads.filter(el => el._id == id)[0];
         // console.log(thread);
          thread.reported = null;
          thread.delete_password = null;
          thread.replies.forEach(el => {
            el.delete_password = null;
          })
          res.json(thread);
        }
      });
    })
    .delete((req,res) => {
          const board = req.params.board;
          const tid = req.body.thread_id;
          const pass = req.body.delete_password;
          const rid = req.body.reply_id;
      db.collection("board").findOne({board},(err, doc) => {
        if(err)console.log(err);
        if(doc) {
          let thread = doc.threads.filter(el => el._id == tid)[0];
          let reply = thread.replies.filter(el => el._id == rid)[0];
          if(reply.delete_password === pass){
              reply.text = "[deleted]";
              db.collection("board").save(doc,(err)=>{
                res.json("success");
              })
          }
          else res.json("incorrect password");
        }
      })
  })
  .put((req,res) => {
          const board = req.params.board;
          const tid = req.body.thread_id;
          const rid = req.body.reply_id;
      db.collection("board").findOne({board},(err, doc) => {
        if(err)console.log(err);
        if(doc) {
          let thread = doc.threads.filter(el => el._id == tid)[0];
          let reply = thread.replies.filter(el => el._id == rid)[0];
                reply.reported = true;
              db.collection("board").save(doc,(err)=>{
                res.json("success");
              })
          }
        });
      });
};
