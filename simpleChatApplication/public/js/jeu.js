let canvas, ctx, mousePos;

// Autres joueurs
let allPlayers = {};
let playernames = {};


let level = 1;
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
  canvas.style = "position: absolute; top: 50%, left: 50%; right: 30%; bottom: 20%; margin: auto; border:2px solid black"; 

  // Les écouteurs
  //canvas.addEventListener("mousedown", traiteMouseDown);
  //canvas.addEventListener("mousemove", traiteMouseMove);

  canvas.onkeydown = processKeydown;
  canvas.onkeyup = processKeyup;

  createObstaclesAndTarget();
  

  requestAnimationFrame(animationLoop);
}



function processKeydown(event) {
  event.preventDefault();
  event.stopPropagation(); // avoid scrolling with arri-ow keys

  switch (event.key) {
    case "ArrowRight":
      allPlayers[username].vitesseX = playerSpeed;
      break;
    case "ArrowLeft":
      allPlayers[username].vitesseX = -playerSpeed;
      break;
    case "ArrowUp":
      allPlayers[username].vitesseY = -playerSpeed;
      break;
    case "ArrowDown":
      allPlayers[username].vitesseY = playerSpeed;
      break;
  }

  //console.log('keydown key = ' + event.key);
}

function processKeyup(event) {
  //event.preventDefault();
  //event.stopPropagation(); // avoid scrolling with arri-ow keys
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
  //console.log(mousePos.x + " " + mousePos.y);

  allPlayers[username].x = mousePos.x;
  allPlayers[username].y = mousePos.y;

  console.log("On envoie sendPos");
  let pos = { user: username, pos: mousePos };
  socket.emit("sendpos", pos);
}

function updatePlayerNewPos(newPos) {
  allPlayers[newPos.player.name].x = newPos.player.x;
  allPlayers[newPos.player.name].y = newPos.player.y;
}

function createObstaclesAndTarget() {
  socket.emit("getObstaclesAndTarget");
}

function updateObstaclesAndTarget(obstacle, lave, t) {
  obstacles = obstacle;
  laves = lave;
  target = t;
}
// Mise à jour du tableau quand un joueur arrive
// ou se deconnecte
function updatePlayers(listOfPlayers) {
  allPlayers = listOfPlayers;
}

function drawPlayer(player) {
  ctx.save();

  ctx.translate(player.x, player.y);
  ctx.fillStyle = "rgb("+player.color[0]+","+ player.color[1]+"," +player.color[2]+")"; 

  ctx.fillRect(player.x, player.y, 10, 10);

  ctx.restore();
}

function drawAllPlayers() {
  for (let name in allPlayers) {
    drawPlayer(allPlayers[name]);
  }
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function moveCurrentPlayer() {
  if (allPlayers[username] !== undefined) {
    allPlayers[username].x += calcDistanceToMove(delta, allPlayers[username].vitesseX);
    allPlayers[username].y += calcDistanceToMove(delta,allPlayers[username].vitesseY);


    socket.emit("sendpos",  username, delta);
  }
}

function drawTarget() {

  ctx.save();

  ctx.translate(target.x, target.y);

  // draws the target as a circle
  ctx.beginPath();
  ctx.fillStyle = target.color;
  ctx.arc(0, 0, target.radius, 0, Math.PI*2);
  ctx.fill();

  ctx.lineWidth=5;
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

  if(circRectsOverlap(player.x, player.y, 10, 10, target.x/2, target.y/2, target.radius/2)) {
    console.log("COLLISION TARGET REACHED BY PLAYER");
    target.color = "red";
    player.x = 15;
    player.y = 15;
    player.score = player.score + 10;
    updateUsers(playernames,allPlayers);
    level = level +1 ;
    updatelevel();
  } else {
    target.color = "yellow";
  }
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

  if(RectsOverlap(player.x, player.y, 10, 10, obstacle.x/2, obstacle.y/2, obstacle.width/2, obstacle.height/2)) {
    obstacle.color = "red";
    player.x = player.x-5;
    //player.y = player.y-10;
  } else {
    obstacle.color = "white";
  }
}

function checkIfPlayerHitLaves(lave,player) {
  if(player === undefined) return;

  if(RectsOverlap(player.x, player.y, 10, 10, lave.x/2, lave.y/2, lave.width/2, lave.height/2)) {
    player.x = player.x-5;
    player.score= player.score - 1;
    //player.y = player.y-10;
    updateUsers(playernames,allPlayers);
  } 
}

//Dessiner les Obstacles et les laves

function drawObstacles() {
  ctx.save();

  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);

    o.y += calcDistanceToMove(delta,o.vy);
    if(o.y > 250) o.vy = -o.vy;
    if(o.y <40) o.vy = -o.vy;

  });

  laves.forEach(o => {

    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);

    o.y += calcDistanceToMove(delta,o.vy);

    if(o.y > 250) {
      o.y = 249;
      o.vy = -o.vy;
    } 

    if(o.y <40) {
      o.y = 41;
      o.vy = -o.vy;
    }

  });

  ctx.restore();
}


function updateUsers(playerNames,listOfPlayers) {
  playernames = playerNames;

  users.innerHTML = "";

  for (let player in playerNames) {
    let userLineOfHTML = "<div>" + listOfPlayers[player].name + " : "+listOfPlayers[player].score +"</div>";
    users.innerHTML += userLineOfHTML;
  }
}

function updatelevel(){
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



