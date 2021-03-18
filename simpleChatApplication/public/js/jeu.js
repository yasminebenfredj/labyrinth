let canvas, ctx, mousePos;

// Autres joueurs
let allPlayers = {};
let playernames = {};

let level;
let delta, oldTime;

let playerSpeed = 100;
let obstacleSpeed = 100;
let obstacles = [];
let laves = [] ;
let target={};

function startGame() {
  console.log("init");
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext("2d");
  canvas.style = "position: absolute; top: 20%; left: 30%; right: 35%; bottom: 30%; margin: auto; border:2px solid black"; 

  // Les écouteurs
  //canvas.addEventListener("mousedown", traiteMouseDown);
  //canvas.addEventListener("mousemove", traiteMouseMove);

  canvas.onkeydown = processKeydown;
  canvas.onkeyup = processKeyup;
  //getlevel met à jour le niveau du jeu ainsi que les obstacle et le taget correspondant
  socket.emit("getLevel");

  requestAnimationFrame(animationLoop);
}

function updatePlayerNewPos(newPos) {
  allPlayers[newPos.player.name].x = newPos.player.x;
  allPlayers[newPos.player.name].y = newPos.player.y;
}


function drawPlayer(player) {
  ctx.save();

  ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgb("+player.color[0]+","+ player.color[1]+"," +player.color[2]+")"; 

  ctx.fillRect(player.x, player.y, player.sizeY, player.sizeY);

  ctx.restore();
}

function drawAllPlayers() {

  for (let name in allPlayers) {
    drawPlayer(allPlayers[name]);
  }
}



function moveCurrentPlayer() {
  if (allPlayers[username] !== undefined) {
    allPlayers[username].x += calcDistanceToMove(delta, allPlayers[username].vitesseX);
    allPlayers[username].y += calcDistanceToMove(delta,allPlayers[username].vitesseY);


    //deplacer le transfert  dans > ligne 288 
    socket.emit("sendpos", allPlayers[username], delta);
  }
}


// Mise à jour du tableau quand un joueur arrive
// ou se deconnecte
function updatePlayers(listOfPlayers) {
  allPlayers = listOfPlayers;
}

function updateUsersScore(playerNames) {
  playernames = playerNames;
  users.innerHTML = "";

  for (let player in playerNames) {
    let userLineOfHTML = "<div>" + allPlayers[player].name + " : "+allPlayers[player].score +"</div>";
    users.innerHTML += userLineOfHTML;
  }
}

function updatelevel(l){
  level = l;
  createObstaclesAndTarget();

  Level.innerHTML = "";

  let txt = "<font size='+10' > Niveau <b>" + level + "</b> </font>" ;
  Level.innerHTML += txt;
}

function timer(currentTime) {
  var delta = currentTime - oldTime;
  oldTime = currentTime;
  return delta/1000;
}

var calcDistanceToMove = function(delta, speed) {
  return (speed * delta);
}



// ############################### Boucle  d'animation  ##############################

function animationLoop(time) {

  if(!oldTime) {
    oldTime = time;
    requestAnimationFrame(animationLoop);
  }

  delta = timer(time);

  if (username != undefined) {
    // 1 On efface l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2 On dessine des objets
    drawAllPlayers();

    drawTarget();
    drawObstacles();

    moveCurrentPlayer();

    checkIfPlayerHitTarget(allPlayers[username]);
    obstacles.forEach(o => {
      checkIfPlayerHitObstacles(o,allPlayers[username]);
    });

    laves.forEach(o => {
      checkIfPlayerHitLaves(o,allPlayers[username]);
    });
  }

  // 3 On rappelle la fonction d'animation à 60 im/s
  requestAnimationFrame(animationLoop);
}



//########################## Gestion du Target  ###################################

function drawTarget() {
  ctx.save();
  ctx.translate(target.x, target.y);
  // draws the target as a circle
  ctx.beginPath();
  ctx.fillStyle = target.color;
  ctx.arc(0, 0, target.radius, 0, Math.PI*2);
  ctx.fill();

  ctx.lineWidth=2;
  ctx.strokeStyle = "green";
  ctx.stroke();

  ctx.restore();
}

// Collisions between rectangle and circle
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
  var testX=cx; 
  var testY=cy; 
  
  if (testX < x0) testX=x0; 
  if (testX > (x0+w0)) testX=(x0+w0); 
  if (testY < y0) testY=y0; 
  if (testY > (y0+h0)) testY=(y0+h0); 

  return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))<r*r); 
}


function checkIfPlayerHitTarget(player) {
  if(player === undefined) return;

  if(circRectsOverlap(player.x, player.y, player.sizeX/2, player.sizeY/2, target.x/2, target.y/2, target.radius/2)) {
    target.color = "red";
    for (let player in playernames) {
			allPlayers[player].x=10;
			allPlayers[player].y=10;
		}
    socket.emit("playerHitTarget",player.name);
  } else {
    target.color = "yellow";
  }
}


//########################## Gestion Des Obstacles et Laves  ###################################

function createObstaclesAndTarget() {
  socket.emit("getObstaclesAndTarget");
}

function updateObstaclesAndTarget(obstacle, lave, t) {
  obstacles = obstacle;
  laves = lave;
  target = t;
}

//Dessiner les Obstacles et les laves

function drawObstacles() {
  ctx.save();
  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);

  });

  laves.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    o.y += calcDistanceToMove(delta,o.vy);

    if(o.y > o.max) {
      o.y = o.max-1;
      o.vy = -o.vy;
    } 

    if(o.y <o.min) {
      o.y = o.min+1;
      o.vy = -o.vy;
    }
  });
  ctx.restore();
}


// Collisions between rectangle and rectangle
function RectsOverlap(x0, y0, w0, h0, tx, ty,tw, th) {
  var myleft = x0;
  var myright = x0 + w0;
  var mytop = y0;
  var mybottom = y0 + h0;
  var otherleft = tx;
  var otherright = tx + tw;
  var othertop = ty;
  var otherbottom = ty + th;
  var crash = true;
  if ((mybottom < othertop) ||
  (mytop > otherbottom) ||
  (myright < otherleft) ||
  (myleft > otherright)) {
    crash = false;
  }
  return crash;
}


function checkIfPlayerHitObstacles(obstacle,player) {
  if(player === undefined) return;
  if(RectsOverlap(player.x, player.y, player.sizeX/2, player.sizeY/2, obstacle.x/2, obstacle.y/2, obstacle.width/2, obstacle.height/2)) {
    obstacle.color = "red";
    socket.emit("playerHitObstacle",player.name);
  } else {
    obstacle.color = "white";
  }
}

function checkIfPlayerHitLaves(lave,player) {
  if(player === undefined) return;

  if(RectsOverlap(player.x, player.y, player.sizeX/2, player.sizeY/2, lave.x/2, lave.y/2, lave.width/2, lave.height/2)) {
    socket.emit("playerHitLave",player.name);
  } 
}




// ####################### Gestion des touches Clavier et souris ###########################

function processKeydown(event) {
  event.preventDefault();
  event.stopPropagation(); // avoid scrolling with arri-ow keys

  switch (event.key) {
    case "ArrowRight":
      allPlayers[username].vitesseX = playerSpeed;
      socket.emit("pressKey", 0, username);
      break;
    case "ArrowLeft":
      allPlayers[username].vitesseX = -playerSpeed;
      socket.emit("pressKey", 1, username);

      break;
    case "ArrowUp":
      allPlayers[username].vitesseY = -playerSpeed;
      socket.emit("pressKey", 2, username);

      break;
    case "ArrowDown":
      allPlayers[username].vitesseY = playerSpeed;
      socket.emit("pressKey", 3, username);

      break;
  }
}

function processKeyup(event) {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowLeft":
      allPlayers[username].vitesseX = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      allPlayers[username].vitesseY = 0;
      break;
  }
}

function traiteMouseDown(evt) {
  console.log("mousedown");
}

function traiteMouseMove(evt) {
  console.log("mousemove");

  mousePos = getMousePos(canvas, evt);

  allPlayers[username].x = mousePos.x;
  allPlayers[username].y = mousePos.y;

  console.log("On envoie sendPos");
  let pos = { user: username, pos: mousePos };
  socket.emit("sendpos", pos);
}


function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
