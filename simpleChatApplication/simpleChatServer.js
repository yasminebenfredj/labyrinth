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

let playerSpeed = 100;
let obstacleSpeed = 100;
let obstacles = [];
let laves = [] ;

let target = {x:700, y:200, radius:30, color:'yellow'};


function createObstacles() {
	let o1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100);
	let o2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100)
  
	let o3 = new Obstacle( 150, 250, 20, 600, "white", 0, 100)
	let o4 = new Obstacle( 150, 0, 20, 100, "white", 0, 100)
  
	let o5 = new Obstacle(300, 300, 20, 500, "white", 0, 100)
	let o6 = new Obstacle(300, 0, 20, 200, "white", 0, 100)
  
	let o7 =  new Obstacle(450, 100, 20, 500, "white", 0, 100)
	let o8 =  new Obstacle(450, 0, 20, 10, "white", 0, 100)
  
	let o9 =  new Obstacle(600, 300, 20, 300, "white", 0, 100)
	let o10 = new Obstacle(600, 0, 20, 200, "white", 0, 100)
  
  
	laves.push(o1);
	laves.push(o2);
	obstacles.push(o3);
	obstacles.push(o4);
	obstacles.push(o5);
	obstacles.push(o6);
	obstacles.push(o7);
	obstacles.push(o8);
	obstacles.push(o9);
	obstacles.push(o10);
  
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

	socket.on('getObstaclesAndTarget', () =>{
		createObstacles();
		socket.emit("updateObstacleAndTarget",obstacles,laves, target);
	})

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', (data) => {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendpos', (username, delta) => {
		if (listOfPlayers[username] !== undefined) {

			listOfPlayers[username].x += calcDistanceToMove(delta, listOfPlayers[username].vitesseX);
			listOfPlayers[username].y += calcDistanceToMove(delta,listOfPlayers[username].vitesseY);
			let pos = {player: listOfPlayers[username] };

			socket.broadcast.emit('updatepos', socket.username, pos);
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', (username) => {
		// we store the username in the socket session for this client
		// the 'socket' variable is unique for each client connected,
		// so we can use it as a sort of HTTP session
		socket.username = username;
		// add the client's username to the global list
		// similar to usernames.michel = 'michel', usernames.toto = 'toto'
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
		io.emit('updatelevel');

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
		io.emit('updatelevel');

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
	  constructor( x, y, l, h, c, vy, range){
		this.color = c;
		this.x = x;
		this.y = y;
		this.width= l;
		this.height= h;
		this.vy = vy;
		this.range = range;

	  }

	  
  }