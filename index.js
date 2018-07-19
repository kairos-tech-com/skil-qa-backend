const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var express = require('express');
var app = express();
var bodyParser = require('body-Parser');

app.use(bodyParser.json());

const url = "mongodb://localhost:27017/skilapp";
const dbName = 'skilapp1';
var n;

app.listen(9090, function () {
    console.log('server running at http://localhost:9090');
});


app.get('/', function (request, response) {
    response.send({ "status": "welcome, i'm running" });
});


app.get('/find-next', function (req, res) {
    n.collection("test11")
        .find()
        .toArray(function (err, docs) {
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(docs)
            res.send(docs);
        });
});
app.post('/users', function (req, res) {
    console.log(req.body);
    n= req.body;
    var rest = insertion(n);
    console.log("inside add method--->>:", req.body);
    console.log(req.body);
   // res.send(rest);
});

function insertion(n) {
    MongoClient.connect(url, function (err, client) {  
        assert.equal(null, err);
        console.log("Connected correctly to server");

        const db = client.db(dbName);
        db.collection('daffb').insert(n
            , function (err, r) {
               // assert.equal(null, err);
                //assert.equal(1, r.insertedCount);
                
                if (err)
                {
                    console.log("error:"+err);
                }
                else
                {
                console.log("succesfull inserted row :"+ r);
            }
            });
    });
    return n;
}



