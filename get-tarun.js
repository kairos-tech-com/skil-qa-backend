“const url = 'mongodb://localhost:27017';
const dbname = 'skilapp';
var db = null;

// Connection with MongoDb and read the results

MongoClient.connect(url, function(err, client) {
  if (err) {
    console.log(err);
    throw err;
  } else {
    console.log("connected");
    db = client.db(dbname);
  }
});

//Get Method
app.listen(8888, function() {
  console.log('server running at http://localhost:8888');
});

app.get('/find-next-question', function(req, res) {
  var tarun = [];
  //console.log(db);
  if (db != null) {
    var cursor = db.collection('skilapp').find();
    cursor.each(function(err, data) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        console.log(data);
        tarun.push(data);
        //console.log(tarun);
      }
    });
  }
  console.log("Tarun: " + tarun);
  res.send(tarun);
});”
