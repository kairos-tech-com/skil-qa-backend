const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var express=require('express');
var app = express();
var bodyParser=require('body-Parser');
var fs=require('fs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.listen(9090,function(){
    console.log('server running at http://localhost:9090');
    });
app.get('/',function(request,response){
    response.send({"status":"welcome, i'm running"});
 });

const url = "mongodb://localhost:27017/skilapp";


const dbName = 'skilapp';
var _db ;

MongoClient.connect(url, function(err, client) {  //mongodb connection
  assert.equal(null, err);
  console.log("Connected correctly to server");

  const db = client.db(dbName);     //
  _db = db;
  // Insert a single document
//   db.collection('test1').insertOne({a:1}, function(err, r) {
//     assert.equal(null, err);
//     assert.equal(1, r.insertedCount);

    // Insert multiple documents
    // db.collection('test').insertMany([{a:2}, {a:3}], function(err, r) {
    //   assert.equal(null, err);
    //   assert.equal(2, r.insertedCount);

      db.collection('test1').insert({
        "skills" : "java",
        "questionType" : "Options",
        "level" : "medium",
        "question" : "Which is a reserved word in the Java programming language?",
        "options" : [
                {
                        "A" : "Method"
                },
                {
                        "B" : "Native"
                },
                {
                        "C" : "Subclasses"
                },
                {
                        "D" : "Reference"
                }
        ],
        "answer" : "B",
        "role" : "developer",
        "industry" : "all"
    }
    ,function(err, r) {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);
    });
    db.collection('test1').insert(
        {
            
            "skills" : "java",
            "questionType" : "Options",
            "level" : "easy",
            "question" : "Which one of these lists contains only Java programming language keywords?",
            "options" : [
                    {
                            "A" : "class, if, void, long, Int, continue."
                    },
                    {
                            "B" : "goto, instanceof, native, finally, default, throws."
                    },
                    {
                            "C" : "try, virtual, throw, final, volatile, transient."
                    },
                    {
                            "D" : "byte, break, assert, switch, include."
                    }
            ],
            "answer" : "A",
            "role" : "developer",
            "industry" : "all"
        });
    
      //client.close();
   // });
//   });
});

app.get('/find-next',function(req,res){
    _db.collection("test1")
    .find()
    .toArray(function(err, docs) {
        // db.collection('test123').insert(
        //     {
                
        //         "skills" : "java",
        //         "questionType" : "Options",
        //         "level" : "easy",
        //         "question" : "Which one of these lists contains only Java programming language keywords?",
        //         "options" : [
        //                 {
        //                         "A" : "class, if, void, long, Int, continue."
        //                 },
        //                 {
        //                         "B" : "goto, instanceof, native, finally, default, throws."
        //                 },
        //                 {
        //                         "C" : "try, virtual, throw, final, volatile, transient."
        //                 },
        //                 {
        //                         "D" : "byte, break, assert, switch, include."
        //                 }
        //         ],
        //         "answer" : "A",
        //         "role" : "developer",
        //         "industry" : "all"
        //     });
        
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      res.send(docs);
    });
    
   
   });
   app.post('/users', function (req, res) {
        req.body="_db";  
        console.log(_db);
           res = JSON.parse(_db);
    console.log("inside add method--->>:",req);
    console.log(res);

   });

//    app.post('/process',function(req,res){
//        var
    

    // if(req.body.questionId){
    //     if(!req.body.answerId){
    //         res.send({"status":"error","message":"Missing answer Id"});
    //         return;  
    //     }
    //     console.log("Question ID from client ->",req.body.questionId);
    // }else{

    // }

    // _db.collection("question")
    // .find()
    // .toArray(function(err, docs) {
    //   assert.equal(err, null);
    //   console.log("Found the following records");
    //   console.log(docs)
    //   res.send({"status":"success",data:docs});
    // });
  
