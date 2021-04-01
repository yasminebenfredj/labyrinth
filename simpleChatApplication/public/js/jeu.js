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
let targetImage;
let myword = {};
let lastMe = {x:0, y:0, sizeY:0, sizeY:0, color : [0,0,0]} ;


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

  lastMe.x = newPos.player.x;
  lastMe.y = newPos.player.y;
  lastMe.sizeY = newPos.player.sizeY;
  lastMe.sizeX = newPos.player.sizeY;
  console.log(newPos.player);

  allPlayers[newPos.player.name].x = newPos.player.x;
  allPlayers[newPos.player.name].y = newPos.player.y;
}



//called every nbClientUpdatesPerSeconds, 
//that will send its status to the server.
function updateClient() {
  if (allPlayers[username] !== undefined) {
    socket.emit("updateClient", allPlayers[username], delta);
  }
}




function drawPlayer(player) {
  ctx.save();

  //ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgb("+player.color[0]+","+ player.color[1]+"," +player.color[2]+")"; 
  ctx.fillRect(player.x, player.y, player.sizeY, player.sizeY);

  ctx.font = '15pt verdana';
  ctx.fillText(player.name,player.x-10, player.y-10);

  ctx.restore();
}

function drawAllPlayers() {

  for (let name in allPlayers) {
    drawPlayer(allPlayers[name]);
  }
  
  if (lastMe.color !== undefined) {
    console.log(lastMe);
    drawPlayer(lastMe);
  }
}



function moveCurrentPlayer() {
  if (allPlayers[username] !== undefined) {
    allPlayers[username].x += calcDistanceToMove(delta, allPlayers[username].vitesseX);
    allPlayers[username].y += calcDistanceToMove(delta,allPlayers[username].vitesseY);

    obstacles.forEach(o => {
      checkIfPlayerHitObstacles(o,allPlayers[username]);
    });

    checkIfPlayerHitTarget(allPlayers[username]);

    laves.forEach(o => {
      checkIfPlayerHitLaves(o,allPlayers[username]);
    });

    //deplacer le transfert  dans > ligne 288 
    socket.emit("updateClient", allPlayers[username], delta);
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
  }

  // 3 On rappelle la fonction d'animation à 60 im/s
  requestAnimationFrame(animationLoop);
}



//########################## Gestion du Target  ###################################

function drawTarget() {
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.beginPath();
  ctx.fillStyle = target.color;
  ctx.arc(0, 0, target.radius, 0, Math.PI*2);
  ctx.arc(0, 0, target.radius-15, 0, Math.PI*2);
  ctx.arc(0, 0, target.radius-30, 0, Math.PI*2);


  ctx.fill();


  ctx.lineWidth=7;
  ctx.strokeStyle = "red";
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

  if(circRectsOverlap(player.x, player.y, player.sizeX, player.sizeY, target.x, target.y, target.radius)) {
    target.color = "red";
    for (let player in playernames) {
			allPlayers[player].x=10;
			allPlayers[player].y=10;
		}
    socket.emit("playerHitTarget",player.name);
  } else {
    target.color = "white";
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

  for(var i = 0; i < laves.length; i++)
  {
    let o = laves[i];
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    socket.emit("mooveLave",o,delta);

    o.y += calcDistanceToMove(delta,o.vy);
    if(o.y > o.max) {
      o.y = o.max-1;
      o.vy = -o.vy;
    } 
    if(o.y <o.min) {
      o.y = o.min+1;
      o.vy = -o.vy;
    }
  }

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
  if(RectsOverlap(player.x, player.y, player.sizeX, player.sizeY, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
    obstacle.color = "red";
    allPlayers[player.name].x -= calcDistanceToMove(delta, allPlayers[player.name].vitesseX)*2;
    allPlayers[player.name].y -= calcDistanceToMove(delta,allPlayers[player.name].vitesseY)*2;

    socket.emit("playerHitObstacle",player.name, delta);
  } else {
    obstacle.color = "white";
  }
}

function checkIfPlayerHitLaves(lave,player) {
  if(player === undefined) return;

  if(RectsOverlap(player.x, player.y, player.sizeX, player.sizeY, lave.x, lave.y, lave.width, lave.height)) {
    allPlayers[player.name].x -= calcDistanceToMove(delta, allPlayers[player.name].vitesseX)*6;
    allPlayers[player.name].y -= calcDistanceToMove(delta,allPlayers[player.name].vitesseY)*6;
    socket.emit("playerHitLave",player.name, delta);
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
      socket.emit("pressKey", 4, username);

      break;
    case "ArrowUp":
    case "ArrowDown":
      allPlayers[username].vitesseY = 0;
      socket.emit("pressKey", 5, username);

      break;
  }
}








