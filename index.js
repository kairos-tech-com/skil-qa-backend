const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var express = require('express');
var app = express();
var bodyParser = require('body-Parser');

app.use(bodyParser.json());

const url = "mongodb://localhost:27017/";
var dbName = 'skilapp1';
var db = null;

// Connection with MongoDb
MongoClient.connect(url, function(err, client) {
  if (err) {
    console.log(err);
    //throw err;
  } else {
    console.log("connected");
    db = client.db(dbName);
  }
});

app.listen(9090, function () {
    console.log('server running at http://localhost:9090');
});


app.get('/', function (request, response) {
    response.send({ "status": "welcome, i'm running" });
});

app.get('/questions/:questionId', function(req, res) {

    var questionId = req.params.questionId;
    if(db != null) {

    } else {
      res.send("We have a problem connecting to our database");
    }
  });

app.get('/score/:userId', function(req, res) {

    var userId = req.params.questionId;
    res.send("Question id: " + questionId);
  });

app.get('/questions', function(req, res) {
    var tarun = [];
    //console.log(db);
    if (db != null) {
      var cursor = db.collection('questions').find();
      cursor.each(function(err, data) {
        if (err) {
          console.log(err);
          throw err;
        } else {
          console.log("Data from questions collections: " + data);
          tarun.push(data);
        }
      });
    }
    console.log("Tarun: " + tarun);
    res.send(tarun);
  });


app.post('/questions', function (req, res) {
    console.log("inside post method--->>:", req.body);
    insertion(req.body, res);
    console.log("Complete post method");
});

function insertion(body, res) {
    if(db != null) {
        db.collection('questions').insert(body
            , function (err, r) {

                if (err)
                {
                    console.log("error:"+err);
                    res.send("An error occured while inserting data in the database. Here are the details: " + err);
                }
                else
                {
                res.send("succesfull inserted row : "+ r.insertedCount + " row in the database");
            }
            });
    } else {
        res.send("Was unable to make a database connection");
    }
}
