var MODE_SETUP = 0;
var MODE_CONNECTING = 1;
var MODE_PLAYING = 2;

var CLIENT_MODE = MODE_SETUP;
var WS = null;

function render() {
  console.log('render');
  if (CLIENT_MODE === MODE_SETUP) {
    renderSetup();
  } else if (CLIENT_MODE === MODE_CONNECTING) {
    renderConnecting();
  } else if (CLIENT_MODE === MODE_PLAYING) {
    renderPlaying();
  }
}

function renderSetup() {
  console.log('renderSetup');
  document.body.innerHTML = '<div>Player Name: <input id="name" type="text" /></div>' +
    '<div>Player Letter: <input id="letter" type="text" /></div>' +
    '<div><button id="join">join game</button>';

  document.getElementById('join').addEventListener('click', (event) => {
    var name = document.getElementById('name').value;
    var letter = document.getElementById('letter').value;
    if (letter.length !== 1) {
      alert('sorry, you can only have one letter to for your letter');
      return;
    }
    modeConnect(name, letter);
  });
}

function modeSetup() {
  CLIENT_MODE = MODE_SETUP;
  WS = null;
  renderSetup();
}

function modeConnect(name, letter) {
  CLIENT_MODE = MODE_CONNECTING;
  render();

  fetch('/api/connect', {
    method: 'POST',
    body: JSON.stringify({name: name, letter: letter}),
    headers: new Headers({'Content-Type': 'application/json'}),
  }).then((response) => {
    return response.json();
  }).then((data) => {
    console.log('api/connect response:', data);
    modePlay();
  }).catch((error) => {
    console.error('error!', error);
  });
}

function modePlay(playerID) {
  CLIENT_MODE = MODE_PLAYING;
  WS = new WebSocket('ws://' + location.hostname + ':8001');
  WS.onopen = () => {
    console.log('ws open');
    WS.onmessage = (mesg) => {
      var data = JSON.parse(mesg.data);
      console.log('received message', data);
      if (data.type === 'playerList') {
        renderPlaying(data.playerList);
      }
    }
    WS.send(JSON.stringify({type: 'requestPlayerList'}));
  }
}

function renderPlaying(playerList) {
  var labels = playerList.map((p) => `<div>${p.letter} &mdash; ${p.name}</div>`);
  document.body.innerHTML = labels.join('\n');
}

function renderConnecting() {
  document.body.innerHTML = 'connecting...';
}

window.onload = render;
