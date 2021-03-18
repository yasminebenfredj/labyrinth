let username;
let conversation, data, datasend, users;
let artificialLatencyDelay=0;
let socket;

// on load of page
window.onload = init;

function init() {
  username = prompt("Quel est votre nom?");

  // initialize socket.io client-side
  socket = io.connect();

  // get handles on various GUI components
  conversation = document.querySelector("#conversation");
  data = document.querySelector("#data");
  datasend = document.querySelector("#datasend");
  users = document.querySelector("#users");

  Level = document.querySelector("#level");





  // Listener for send button
  datasend.onclick = (evt) => {
    sendMessage();
  };

  // detect if enter key pressed in the input field
  data.onkeypress = (evt) => {
    // if pressed ENTER, then send
    if (evt.keyCode == 13) {
      this.blur();
      sendMessage();
    }
  };

  data.onblur = (event) => {
    console.log("Input field lost focus");
    canvas.focus(); // gives the focus to the canvas
  }

  // sends the chat message to the server
  function sendMessage() {
    let message = data.value;
    data.value = "";
    // tell server to execute 'sendchat' and send along one parameter
    socket.emit("sendchat", message);
  }

  socket.on("updateObstacleAndTarget",(obstacles, laves, t) => {
    updateObstaclesAndTarget(obstacles, laves, t);
  })


  // on connection to server, ask for user's name with an anonymous callback
  socket.on("connect", () => {
    clientStartTimeAtConnection = Date.now();
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit("adduser", username);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on("updatechat", (username, data) => {
    let chatMessage = "<font size='+1'> <b>" + username + ":</b> </font>" + data + "<br>";
    conversation.innerHTML += chatMessage;
  });

  // just one player moved
  socket.on("updatepos", ( newPos) => {
    updatePlayerNewPos(newPos);
  });

  // listener, whenever the server emits 'updateusers', this updates the username list
  socket.on("updateusers", ( playerNames,listOfPlayers) => {
    updatePlayers(listOfPlayers);
    updateUsersScore(playerNames);
  });

  socket.on("updateLevel", (level) => {
    updatelevel(level);
  });



  
  socket.on("endOfGame", (winner) => {
    alert("Le jeu est terminer. Le gagnant est "+winner.name+" : "+winner.score+"pts. ");
    /*
    if(confirm("Voulez vous rejouez ? "){
      startGame();
    }
    */
  });

  // Latency, ping etc.
  socket.on("ping", () => {
    send("pongo");
  });


  // update the whole list of players, useful when a player
  // connects or disconnects, we must update the whole list
  socket.on("updatePlayers", (listOfPlayers) => {
    updatePlayers(listOfPlayers);
  });

  socket.on("data", (timestamp, rtt, serverTime) => {
    //console.log("rtt time received from server " + rtt);

    let spanRtt = document.querySelector("#rtt");
    spanRtt.innerHTML = rtt;

    let spanPing = document.querySelector("#ping");
    spanPing.innerHTML = (rtt/2).toFixed(1);

    let spanServerTime = document.querySelector("#serverTime");
    spanServerTime.innerHTML = (serverTime/1000).toFixed(2);

    let clientTime = Date.now() - clientStartTimeAtConnection;


    let spanClientTime = document.querySelector("#clientTime");
    spanClientTime.innerHTML = (clientTime/1000).toFixed(2);
  
  });

  // we start the Game
  startGame();
}

// PERMET D'ENVOYER SUR WEBSOCKET en simulant une latence (donnée par la valeur de delay)
//permet de retarder le message a envoyer 
function send(typeOfMessage, data) {
  setTimeout(() => {
      socket.emit(typeOfMessage, data)
  }, artificialLatencyDelay);
}

function changeArtificialLatency(value) {
  artificialLatencyDelay = parseInt(value);

  let spanDelayValue = document.querySelector("#delay");
  spanDelayValue.innerHTML = artificialLatencyDelay;
}




