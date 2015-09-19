// development static file server
// in production, use nginx
var express = require("express");
var app = express();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Static file server listening at http://%s:%s', host, port);
});

app.use(express.static('static'));
