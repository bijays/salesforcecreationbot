var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login('bijays@creation.technology', 'BM@1227174', function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});