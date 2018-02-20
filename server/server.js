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
  var p = {id: PLAYERS.length, name: name, letter: letter};
  PLAYERS.push(p);
  return p;
}
removePlayer = function(playerID) {
  var i = PLAYERS.findIndex((p) => p.id === playerID);
  PLAYERS = PLAYERS.slice(0, i).concat(PLAYERS.slice(i+1));
  return PLAYERS;
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

  var playerID = -1;

  var disconnect = () => {
    var i = CONNECTIONS.indexOf(ws);
    CONNECTIONS.splice(i, 1);
    if (playerID === -1) {
      // player never identified.  There's a timeout (below) to automatically
      // disconnect unidentified connections.  Anything to do with connections
      // should happen above this clause, anything to do with identified
      // players should happen after this clause.
      return;
    }
    removePlayer(playerID);
    broadcastClients('playerList', {playerList: PLAYERS});
  }

  ws.on('error', (error) => {
    if (error.errno === 'ECONNRESET') {
      console.log('connection reset: ', playerID);
      disconnect();
    }
  });

  ws.on('close', (code, reason) => {
    disconnect();
  });

  setTimeout(() => {
    if (playerID === -1) {
      ws.close();
    }
  }, 1500); // is 15 seconds a reasonable timeout??

  ws.on('message', (message) => {
    try {
      var data = JSON.parse(message);
    } catch (e) {
      console.log('bad message sent!', typeof event, event);
      return;
    }
    if (data.type === 'identify') {
      playerID = data.playerID;
    }
  });
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
  var p = addPlayer(req.body.name, req.body.letter);
  res.send(JSON.stringify(p));
});

app.use('/static', express.static('../client/static'));

PORT = 8000;

app.listen(PORT, () => console.log(`Topiary server listening at http://${ip.address()}:${PORT}`));
