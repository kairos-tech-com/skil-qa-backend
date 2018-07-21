const MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(9090, function () {
  console.log('server running at http://localhost:9090');
});

const url = "mongodb://localhost:27017/";
var dbName = 'skilapp';
var db = null;

// Connection with MongoDb
MongoClient.connect(url, function (err, client) {
  if (err) {
    console.log("Error while connecting to mongo. Make sure mongodb is running");
  } else {
    console.log("Successfully connected to MongoDB!!");
    db = client.db(dbName);
  }
});

app.get('/', function (request, response) {
  response.send({ "status": "Skil App - backend is running successfully!" });
});

app.get('/questions/:questionId', function (req, res) {
  var questionId = req.params.questionId;
  if (db != null) {
    console.log("Query database with quesion id: " + questionId);

    var query = {
      questionId: questionId
    };

    db.collection("questions").find(query).toArray(function (err, result) {
      if (err) {
        console.log("Error occured while querying the collection with question id: "
          + questionId + ". Here is the error: " + err);
      }
      console.log(result);
      var questionResponse = {};

      if (result.length == 1) {
        questionResponse.questionId = result[0].questionId;
        questionResponse.question = result[0].question;
        questionResponse.options = result[0].options;
        console.log(questionResponse);
        res.send(JSON.stringify(questionResponse));
      } else {
        res.status(404).send('Not found');
      }
    });
  }
  else {
    res.send("We have a problem connecting to our database");
  }
});

app.post('/user/responses', function(req, res) {
  // Called when we save users 
  console.log("Need to implement this");

  saveToResultsCollection(req.body, res);

});

app.get('/results/:userId', function (req, res) {
  var userId = req.params.userId;
  console.log("UserId: " + userId);
  if (db != null) {
    var query1 = {
      "userId": 12
    };

    var query2 = {
      "userId": 12,
      "status": "PASS"
    };

    var totalNumberOfQuestions = 0;
    var noOfPassedQuestions = 0;

    db.collection('results').find(query1).count(function(err, result) {
      totalNumberOfQuestions = result;
      console.log("Total number of questions  " + totalNumberOfQuestions);

      db.collection('results').find(query2).count(function(err, result1) {
         
         noOfPassedQuestions = result1;
         console.log("Number of passed questions  " + noOfPassedQuestions);
         console.log("Percentage is: " + (noOfPassedQuestions / totalNumberOfQuestions) * 100);
        var scoreResult = {}

        var overallResult = (noOfPassedQuestions / totalNumberOfQuestions) * 100;
        scoreResult.overallResult = overallResult;
        res.send(scoreResult);
  
      });

    });
  } else {
    res.send("There was an error connecting to the database");
  }
});

app.post('/questions', function (req, res) {
  console.log("inside post method--->>:", req.body);
  insertion(req.body, res);
  console.log("Complete post method");
});

function insertion(body, res) {
  if (db != null) {
    db.collection('questions').insert(body
      , function (err, r) {

        if (err) {
          console.log("error:" + err);
          res.send("An error occured while inserting data in the database. Here are the details: " + err);
        }
        else {
          res.send("Succesfully inserted (" + r.insertedCount + ") row in the database");
        }
      });
  } else {
    res.send("There was an error connecting to the database");
  }
}

function saveToResultsCollection(questionResponse, res) {
  if(db != null) {
    var query = { "questionId": questionResponse.questionId};
    db.collection('questions').findOne(query, function(err, result) {
      if (err) {
        console.log("error:" + err);
        res.send("An error occured while querying question against the database. Here are the details: " + err);
      }
      var resultDb = {};
      var correctAnswer = result.answer;
      
      if(correctAnswer == questionResponse.selectedAnswer) {
        resultDb.status = "PASS";
      } else {
        resultDb.status = "FAIL";
      }

      resultDb.questionId = questionResponse.questionId;
      resultDb.question = result.question;
      //TODO: Get the actual answer and the correct answer as text instead of options
      resultDb.userId = questionResponse.userId;
      resultDb.testId = questionResponse.userId;
      resultDb.selectedAnswer = questionResponse.selectedAnswer;
      resultDb.correctAnswer = correctAnswer;

      db.collection('results').insert(resultDb, function (err, r) {
          if (err) {
            console.log("error:" + err);
            res.send("An error occured while inserting results in the database. Here are the details: " + err);
          }
          else {
            res.send("Succesfully saved " + JSON.stringify(resultDb) + " to the database");
          }
        });
    });
  }
}