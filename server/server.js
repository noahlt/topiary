var ip = require('ip');
var path = require('path');

var express = require('express');
var app = express();

STATIC_DIR = '../client/static';

app.get('/', function(req, res) {
  res.sendFile(path.normalize(path.join(__dirname, STATIC_DIR, "index.html")));
});

app.get('/api/connect', function(req, res) {
  res.send('{"message":"welcome to the game!"}');
});

app.use('/static', express.static('../client/static'));

PORT = 8000;

app.listen(PORT, () => console.log(`Topiary server listening at http://${ip.address()}:${PORT}`));
