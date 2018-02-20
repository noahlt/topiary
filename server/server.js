var ip = require('ip');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

STATIC_DIR = '../client/static';

var WebSocketServer = require('ws').Server;
var WSS = new WebSocketServer({ port: 8001 });
/*
class Session {
  constructor() {
    this.players = [];
  }
  
  fullBroadcast() {
    broadcastClients('session', selectKeys(this, ['players']));
  }
 
  addPlayer(name, letter) {
    this.players.push({name: name, letter: letter});
    fullBroadcast();
  }
}

var SESSION = new Session(); // a singleton for now
*/
PLAYERS = [];
addPlayer = function(name, letter) {
  PLAYERS.push({name: name, letter: letter});
}
var CONNECTIONS = [];

function selectKeys(x, keys) {
  var r = {};
  keys.forEach((k) => {
    r[k] = x[k];
  });
  return r;
}

WSS.on('connection', (ws) => {
  CONNECTIONS.push(ws);
  console.log('added a new ws connection');
  broadcastClients('playerList', {playerList: PLAYERS});

  // ws.onmessage = (event) => {
  //   var data = JSON.parse(event.data);
  //   console.log('received mesg while connecting', data);
  //   if (data.type === 'newPlayer') {
  //     console.log('new player requests to join');
  //     if (data.name.length > 0 && data.letter.length === 1) {
  //       console.log('new player is valid');
  //       players.push({name: data.name, letter: data.letter, conn: ws});
  //       ws.send(JSON.stringify({
  //         type: 'playerAdded',
  //         letter: data.letter,
  //         name: data.name,
  //       }));
  //       broadcastClients('playerList', {playerList: players.map(
  //         (p) => selectKeys(p, ['name', 'letter']))});
  //     } else {
  //       ws.send(JSON.stringify({
  //         type: 'playerRejected',
  //       }));
  //     }
  //   } if (data.type === 'requestPlayerList') {
  //   } else {
  //     console.log('received other message:', data.type);
  //   }
  // }
});

function broadcastClients(mesgType, data) {
  var json = JSON.stringify(Object.assign({type: mesgType}, data));
  console.log('broadcasting:', json);
  CONNECTIONS.forEach((conn) => conn.send(json));
}

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(path.normalize(path.join(__dirname, STATIC_DIR, "index.html")));
});

app.post('/api/connect', function(req, res) {
  if (req.body.name.length < 1 && req.body.letter.length !== 1) {
    res.sendStatus(400);
    return;
  }
  addPlayer(req.body.name, req.body.letter);
  res.send(JSON.stringify({
    message:"welcome to the game!",
    name: req.body.name,
    letter: req.body.letter,
  }));
});

app.use('/static', express.static('../client/static'));

PORT = 8000;

app.listen(PORT, () => console.log(`Topiary server listening at http://${ip.address()}:${PORT}`));
