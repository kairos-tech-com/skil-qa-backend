const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var express=require('express');
var app = express();
var bodyParser=require('body-Parser');

app.use(bodyParser.json());
app.listen(9090,function(){
    console.log('server running at http://localhost:9090');
    });
app.get('/',function(request,response){
    response.send({"status":"welcome, i'm running"});
 });