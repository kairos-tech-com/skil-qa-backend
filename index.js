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
  console.log("Inside GET /questions/:questionId ");
  var questionId = req.params.questionId;
  getQuestionById(questionId, res);
});

app.post('/user/responses', function(req, res) {
  console.log("Inside POST user/responses ");
  saveToResultsCollection(req.body, res);
});

app.get('/results/:userId', function (req, res) {
  console.log("Inside GET /results/:userId ");
  var userId = req.params.userId;
  console.log("UserId: " + userId);
  getResultsForUser(userId, res);
});

function getQuestionById(questionId, res) {
  console.log("Inside getQuestionById method");
  if (db != null) {
    console.log("Query database with quesion id: " + questionId);

    var query = {
      "questionId": parseInt(questionId)
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
}

function saveToResultsCollection(questionResponse, res) {
  console.log("Inside saveToResultsCollection method");
  if(db != null) {
    var query = { "questionId": parseInt(questionResponse.questionId)};
    db.collection('questions').findOne(query, function(err, result) {
      if (err) {
        console.log("error:" + err);
        res.send("An error occured while querying question against the database. Here are the details: " + err);
      }

      console.log("Question object from mongodb after querying: " + result);

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

function getResultsForUser(userId, res) {
  console.log("Inside getResultsForUser method");
  if (db != null) {
    var query1 = {
      "userId": parseInt(userId)
    };

    var query2 = {
      "userId": parseInt(userId),
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
}

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