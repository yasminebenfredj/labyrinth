const express = require('express')
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);


http.listen(8082, () => {
	console.log("Web server écoute sur http://localhost:8082");
})

// Indicate where static files are located. Without this, no external js file, no css...  
app.use(express.static(__dirname + '/public'));    


// routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// nom des joueurs connectés sur le chat
var playerNames = {};
var listOfPlayers = {};

let level = 1;


let playerSpeed = 100;
let obstacleSpeed = 100;
let obstacles, laves ;

let target = {x:730, y:250, radius:30, color:'yellow'};



function winner(name){
	let win = listOfPlayers[name];

	for (let player in playerNames) {
		if(listOfPlayers[player].score>=win.score) {
			win = listOfPlayers[player];
		}
	}
	return win;
}

function createObstacles() {
	let o1,o2,o3,o4,o5,o6,o7,o8,o9,o10,o11,o12;
	let l1, l2,l3, l4, l5, l6, l7;
	obstacles = [];
	laves = [];
	switch(level) {
		case 1 :
			l1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100, 250, 40);
			l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 250, 40)
		  
			o1 = new Obstacle( 150, 250, 20, 600, "white", 0, 100, 0, 0)
			o2 = new Obstacle( 150, 0, 20, 100, "white", 0, 100, 0, 0)
		  
			o3 = new Obstacle(300, 300, 20, 500, "white", 0, 100, 0 , 0)
			o4 = new Obstacle(300, 0, 20, 200, "white", 0, 100, 0, 0)
		  
			o5 =  new Obstacle(450, 100, 20, 500, "white", 0, 100, 0, 0)
			o6 =  new Obstacle(450, 0, 20, 10, "white", 0, 100, 0, 0)
		  
			o7 =  new Obstacle(600, 300, 20, 300, "white", 0, 100, 0, 0)
			o8 = new Obstacle(600, 0, 20, 200, "white", 0, 100, 0, 0)

			laves.push(l1);
			laves.push(l2);
			
			obstacles.push(o1);
			obstacles.push(o2);
			obstacles.push(o3);
			obstacles.push(o4);
			obstacles.push(o5);
			obstacles.push(o6);
			obstacles.push(o7);
			obstacles.push(o8);

			break;
		case 2 :
				
			l1 = new Obstacle(100, 50, 20, 100, "red", obstacleSpeed, 100, 250, 40);
			l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 250, 40);

			l3 = new Obstacle(300, 50, 20, 100, "red", obstacleSpeed+50, 100, 200, 0);
			l4 = new Obstacle(500, 50, 20, 50, "orange", obstacleSpeed+50, 100, 200, 0);
			   
			o1 = new Obstacle( 100, 250, 20, 600, "white", 0, 100, 0, 0)
			o2 = new Obstacle( 100, 0, 20, 100, "white", 0, 100)
			  
			o3 = new Obstacle(200, 300, 20, 500, "white", 0, 100, 0, 0)
			o4 = new Obstacle(200, 0, 20, 200, "white", 0, 100, 0, 0)
			  
			o5 =  new Obstacle(300, 100, 20, 500, "white", 0, 100, 0, 0)
			o6 =  new Obstacle(300, 0, 20, 10, "white", 0, 100, 0, 0)
			  
			o7 =  new Obstacle(400, 300, 20, 300, "white", 0, 100, 0, 0)
			o8 = new Obstacle(400, 0, 20, 200, "white", 0, 100, 0, 0)

			o9 =  new Obstacle(500, 100, 20, 500, "white", 0, 100, 0, 0)
			o10 = new Obstacle(500, 0, 20,10, "white", 0, 100, 0, 0)

			o11 = new Obstacle(600, 350, 20, 500, "white", 0, 100, 0, 0)
			o12 = new Obstacle(600, 0, 20, 200, "white", 0, 100, 0, 0)

			laves.push(l1);
			laves.push(l2);
			laves.push(l3);
			laves.push(l4);
			
			obstacles.push(o1);
			obstacles.push(o2);
			obstacles.push(o3);
			obstacles.push(o4);
			obstacles.push(o5);
			obstacles.push(o6);
			obstacles.push(o7);
			obstacles.push(o8);
			obstacles.push(o9);
			obstacles.push(o10);
			obstacles.push(o11);
			obstacles.push(o12);

			
			break;
		case 3 :
			l1 = new Obstacle(100, 50, 20, 100, "red", obstacleSpeed+100, 100, 250, 40);
			l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed+100, 100, 300, 50);
			l7 = new Obstacle(600, 50, 20, 50, "red", obstacleSpeed+50, 100, 400, 100);


			l3 = new Obstacle(300, 50, 20, 80, "orange", obstacleSpeed+50, 100, 200, 0);
			l4 = new Obstacle(500, 50, 20, 100, "red", obstacleSpeed+50, 100, 100, 0);
			  
			l5 = new Obstacle(200, 50, 20, 100, "red", obstacleSpeed+50, 100, 220, 20);
			l6 = new Obstacle(400, 50, 20, 50, "orange", obstacleSpeed+50, 100, 300, 100);

			  
			o1 = new Obstacle( 100, 250, 20, 600, "white", 0, 100, 0, 0)
			o2 = new Obstacle( 100, 0, 20, 100, "white", 0, 100)
			  
			o3 = new Obstacle(200, 300, 20, 500, "white", 0, 100, 0, 0)
			o4 = new Obstacle(200, 0, 20, 200, "white", 0, 100, 0, 0)
			  
			o5 =  new Obstacle(300, 100, 20, 500, "white", 0, 100, 0, 0)
			o6 =  new Obstacle(300, 0, 20, 10, "white", 0, 100, 0, 0)
			  
			o7 =  new Obstacle(400, 300, 20, 300, "white", 0, 100, 0, 0)
			o8 = new Obstacle(400, 0, 20, 200, "white", 0, 100, 0, 0)

			o9 =  new Obstacle(500, 100, 20, 500, "white", 0, 100, 0, 0)
			o10 = new Obstacle(500, 0, 20,10, "white", 0, 100, 0, 0)

			o11 = new Obstacle(600, 350, 20, 500, "white", 0, 100, 0, 0)
			o12 = new Obstacle(600, 0, 20, 200, "white", 0, 100, 0, 0)

			laves.push(l1);
			laves.push(l2);
			laves.push(l3);
			laves.push(l4);
			laves.push(l5);
			laves.push(l6);
			laves.push(l7);

			obstacles.push(o1);
			obstacles.push(o2);
			obstacles.push(o3);
			obstacles.push(o4);
			obstacles.push(o5);
			obstacles.push(o6);
			obstacles.push(o7);
			obstacles.push(o8);
			obstacles.push(o9);
			obstacles.push(o10);
			obstacles.push(o11);
			obstacles.push(o12);
			break;
	}
  
  }

  var calcDistanceToMove = function(delta, speed) {
	return (speed * delta);
  }

io.on('connection', (socket) => {
	let emitStamp;
	let connectionStamp = Date.now();

	setInterval(()=> {
		emitStamp = Date.now();
		socket.emit("ping");
	}, 500);

	socket.on('pongo', () => {
		let currentTime = Date.now();
		let timeElapsedSincePing = currentTime - emitStamp;
		let serverTimeElapsedSinceClientConnected = currentTime - connectionStamp;

		socket.emit("data", currentTime, timeElapsedSincePing, serverTimeElapsedSinceClientConnected);
	});

	socket.on('playerHitObstacle', (playerName) => {
		listOfPlayers[playerName].x = listOfPlayers[playerName].x - 5;
		io.emit('updateusers', playerNames,listOfPlayers);

	});

	socket.on('playerHitLave', (playerName) => {
		listOfPlayers[playerName].x = listOfPlayers[playerName].x - 5;
		listOfPlayers[playerName].score= listOfPlayers[playerName].score - 1;
		io.emit('updateusers', playerNames,listOfPlayers);

	});

	socket.on('playerHitTarget', (playerName) => {

		for (let player in playerNames) {
			listOfPlayers[player].x=10;
			listOfPlayers[player].y=10;
		}

		listOfPlayers[playerName].score= listOfPlayers[playerName].score + 10;
		io.emit('updateusers', playerNames,listOfPlayers);
		socket.broadcast.emit('updateusers', playerNames,listOfPlayers);
		level = level +1 ;
		if(level>3){ 
			io.emit('endOfGame',winner(playerName));
		}else {
			io.emit('updateLevel', level);
		}
	});

	socket.on("getLevel",() => {
		io.emit('updateLevel', level);
	});



	socket.on('getObstaclesAndTarget', () =>{
		createObstacles();
		socket.emit("updateObstacleAndTarget",obstacles,laves, target);
	})

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', (data) => {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('sendpos', (player, delta) => {
		let username = player.name;


		if (listOfPlayers[username] !== undefined) {
			listOfPlayers[player.name].vitesseX = player.vitesseX;
			listOfPlayers[player.name].vitesseY = player.vitesseY;

			listOfPlayers[username].x += calcDistanceToMove(delta, listOfPlayers[username].vitesseX);
			listOfPlayers[username].y += calcDistanceToMove(delta,listOfPlayers[username].vitesseY);
			let pos = {player: listOfPlayers[username] };

			socket.broadcast.emit('updatepos', pos);
			socket.broadcast.emit('updatePlayers',listOfPlayers);

		}
	});

	socket.on("updatePlayers",() => {
		io.emit('updatePlayers',listOfPlayers);
	});

	socket.on('adduser', (username) => {
		socket.username = username;
		playerNames[username] = username;
		// echo to the current client that he is connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');

		// Create a new player 
		let player = new Joueur(username);
		listOfPlayers[username] = player;

		// tell all clients to update the list of users on the GUI
		io.emit('updateusers', playerNames,listOfPlayers);
		io.emit('updatePlayers',listOfPlayers);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', () => {
		// remove the username from global usernames list
		delete playerNames[socket.username];
		// update list of users in chat, client-side

		// Remove the player too
		delete listOfPlayers[socket.username];	
		
		io.emit('updateusers', playerNames,listOfPlayers);
		io.emit('updatePlayers',listOfPlayers);

		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});


class Joueur {
	name;
	x;
	y;
	largeur = 100;
	hauteur = 100;

	vitesseX;
	vitesseY;

	color;
	score;

	sizeX;
	sizeY;
  
	constructor( name) {
	  this.x = 10;
	  this.y =  Math.floor(Math.random() * (41 )) + 10;
	  this.vitesseX=1;
	  this.vitesseY=1;
	  let r = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  let g = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  let b = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  this.color = [r,g,b];
	  this.name = name;
	  this.score = 0;
	  this.sizeX = 20;
	  this.sizeY = 20;
	}
	
	draw(ctx) {
	  ctx.save();
	  ctx.translate(this.x, this.y);
	  ctx.fillStyle = "rgb("+this.color[0]+","+ this.color[1]+"," +this.color[2]+")"; 
	  ctx.fillRect(this.x, this.y, 10, 10);
	  ctx.restore();
	}

	print(){
		console.log("hello");
	}
	changeDirection() {
	  this.vitesseX = -this.vitesseX;
	}
	move() {
	  this.x+=this.vitesseX;
	}
  }

  class Obstacle {
	  color;
	  x;
	  y;
	  width;
	  height;
	  vx;
	  vy;
	  range;
	  max;
	  min;
	  constructor( x, y, l, h, c, vy, range, max, min){
		this.color = c;
		this.x = x;
		this.y = y;
		this.width= l;
		this.height= h;
		this.vy = vy;
		this.range = range;
		this.max = max ;
		this.min = min;

	  }

	  
  }