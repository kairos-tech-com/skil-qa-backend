const MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var async = require('async');

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

app.post('/user/responses', function (req, res) {
  console.log("Inside POST user/responses ");
  saveToResultsCollection(req.body, res);
});

app.get('/results/:userId', function (req, res) {
  console.log("Inside GET /results/:userId ");
  var userId = req.params.userId;
  console.log("UserId: " + userId);
  getResultsForUser(userId, res);
});

app.get('/results/test/:testId', function (req, res) {
  console.log("Inside GET /results/test/:testId ");
  var testId = req.params.testId;
  console.log("TestId: " + testId);
  getResultsByTestId(testId, res);
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
  if (db != null) {
    var query = { "questionId": parseInt(questionResponse.questionId) };
    db.collection('questions').findOne(query, function (err, result) {
      if (err) {
        console.log("An error while fetching question details for question id:" + questionId + ". Here are the details: " + err);
        res.send("An error occured while querying question against the database. Here are the details: " + err);
      }

      console.log("Question object from mongodb after querying: " + result);

      var resultDb = {};
      var correctAnswer = result.answer;

      if (correctAnswer == questionResponse.selectedAnswer) {
        resultDb.status = "PASS";
      } else {
        resultDb.status = "FAIL";
      }

      resultDb.questionId = questionResponse.questionId;
      resultDb.question = result.question;
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

    db.collection('results').find(query1).count(function (err, result) {
      totalNumberOfQuestions = result;
      console.log("Total number of questions  " + totalNumberOfQuestions);

      db.collection('results').find(query2).count(function (err, result1) {

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

function getResultsByTestId(testId, res) {
  console.log("Inside  getResultsByTestId method");
  if (db != null) {

    var testIdQuery = {
      "testId": parseInt(testId)
    }

    db.collection('results').find(testIdQuery).toArray(function (err, result) {
      if (err) {
        console.log("Error while fetching results based on test id: " + testId + ". Here are the details: " + err);
      }

      var responseArray = [];

      async.each(result, function (item, callback) {

        var responseToSend = {};
        responseToSend.question = item.question;
        responseToSend.questionId = item.questionId;
        responseToSend.status = item.status;

        db.collection('questions').findOne({ "questionId": parseInt(item.questionId) }, function (err, questionResult) {
          if (err) {
            console.log("An error while fetching question details for question id:" + questionId + ". Here are the details: " + err);
          }

          var selectedAnswer = item.selectedAnswer;
          console.log("selected answer: " + selectedAnswer);
          var correctAnswer = item.correctAnswer;
          var correctAnswerIndex = getIndexByOption(correctAnswer);
          console.log("Correct answer: " + correctAnswer);


          var selectedAnswerText = "";

          console.log("CorrectAnswer: " + JSON.stringify(questionResult.options[correctAnswerIndex].A));

          var correctAnswerText = questionResult.options[correctAnswerIndex].correctAnswer;

          responseToSend.correctAnswerText = getAnswerTextByOption(questionResult, correctAnswerIndex, correctAnswer);

          if (responseToSend.status  == "PASS") {
            selectedAnswerText = responseToSend.correctAnswerText;
          } else {
            var selectedAnswerIndex = getIndexByOption(selectedAnswer);
            selectedAnswerText = getAnswerTextByOption(questionResult, selectedAnswerIndex, selectedAnswer);
          }

          responseToSend.selectedAnswerText = selectedAnswerText;
          
          console.log(responseToSend);

          responseArray.push(responseToSend);

          return callback();
        });
      }, function (err) {
        console.log("Complete");
        if (err) {
          console.log('An error occured while adding element to array');
        } else {
          console.log("Response array: " + responseArray);
          res.send(responseArray);
        }
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

function getIndexByOption(option) {
  var index = -1;
  if(option == "A") {
    index = 0;
  } else if(option == "B") {
    index = 1;
  }else if(option == "C") {
    index = 2;
  }else if(option == "D") {
    index = 3;
  }
  return index;
}

function getAnswerTextByOption(questionResult, answerIndex, option) {
  var text = "";
  if(option == "A") {
    text = questionResult.options[answerIndex].A;
  } else if(option == "B") {
    text = questionResult.options[answerIndex].B;
  }else if(option == "C") {
    text = questionResult.options[answerIndex].C;
  }else if(option == "D") {
    text = questionResult.options[answerIndex].D;
  }
  return text;
}