const express = require('express')
const {Joueur, Obstacle , Word} = require('./elements')
const fct = require('./fonctionsUtilitaire')

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
let nbUpdatesPerSeconds = 2;

let level = 1;

let playerSpeed = 80;
let obstacleSpeed = 100;
let obstacles= [];
let laves = [];

let target = {x:900, y:250, radius:40, color:'white'};

io.on('connection', (socket) => {
	let emitStamp;
	let connectionStamp = Date.now();


	//envoi du battement de coeur 
	setInterval(() => {
		sendHeartBeat();
	}, 1000/nbUpdatesPerSeconds);

	//battement envoyer
	socket.on('heartBeat',() => {
		//console.log("BOOM-BOOM!");


	});


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

	socket.on('playerHitObstacle', (playerName, delta) => {
		listOfPlayers[playerName].x -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseX )*2;
		listOfPlayers[playerName].y -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseY )*2;

		io.emit('updateusers', playerNames,listOfPlayers);

	});

	socket.on('playerHitLave', (playerName,delta) => {
		listOfPlayers[playerName].x -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseX )+10;
		listOfPlayers[playerName].y -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseY );
		listOfPlayers[playerName].score= listOfPlayers[playerName].score - 1;
		io.emit('updateusers', playerNames,listOfPlayers);

	});


	socket.on('playerHitTarget', (playerName) => {

		for (let player in playerNames) {
			listOfPlayers[player].x=10;
			listOfPlayers[player].y=10;
		}

		listOfPlayers[playerName].score= listOfPlayers[playerName].score + 10;
		level = level +1 ;
		io.emit('updateusers', playerNames,listOfPlayers);
		socket.broadcast.emit('updateusers', playerNames,listOfPlayers);

		if(level>5){ 
			io.emit('endOfGame',fct.winner(listOfPlayers,playerName, playerNames));
		}else {
			io.emit('updateLevel', level);
		}
	});

	socket.on("getLevel",() => {
		io.emit('updateLevel', level);
	});

	socket.on("pressKey",(sens,player) => {
		switch(sens) {
			case 0 :
				listOfPlayers[player].vitesseX = playerSpeed; //down
				break;
			case 1 :
				listOfPlayers[player].vitesseX = -playerSpeed;
				break;
			case 2 :
				listOfPlayers[player].vitesseY = -playerSpeed;
				break;			
			case 3 :
				listOfPlayers[player].vitesseY = playerSpeed;
				break;

			case 4 :
				listOfPlayers[player].vitesseX = 0; //up
				break;			
			case 5 :
				listOfPlayers[player].vitesseX = 0;
				break;
			case 6 :
				listOfPlayers[player].vitesseY = 0; 
				break;			
			case 7 :
				listOfPlayers[player].vitesseY = 0;
				break;
		}
	})



	socket.on('getObstaclesAndTarget', () =>{
		createObstacles();
		socket.emit("updateObstacleAndTarget",obstacles,laves, target);
	})

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', (data) => {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, listOfPlayers[socket.username].color, data);
	});

	socket.on('updateClient', (player, delta) => {
		let username = player.name;


		if (listOfPlayers[username] !== undefined) {
			listOfPlayers[player.name].vitesseX = player.vitesseX;
			listOfPlayers[player.name].vitesseY = player.vitesseY;

			listOfPlayers[username].x += fct.calcDistanceToMove(delta, listOfPlayers[username].vitesseX);
			listOfPlayers[username].y += fct.calcDistanceToMove(delta,listOfPlayers[username].vitesseY);
			let pos = {player: listOfPlayers[username] };

			socket.broadcast.emit('updatepos', pos);
			socket.broadcast.emit('updatePlayers',listOfPlayers);

		}
	});

	socket.on('moveLave', (i,delta) =>{
		console.log(laves);
		laves[i].y += fct.calcDistanceToMove(delta,laves[i].vy);

		if(laves[i].y > laves[i].max) {
			laves[i].y = laves[i].max-1;
		  	laves[i].vy = -laves[i].vy;
		} 
	
		if(laves[i].y <laves[i].min) {
			laves[i].y = laves[i].min+1;
			laves[i].vy = -laves[i].vy;
		}
		socket.emit("updateObstacleAndTarget",obstacles,laves, target);
	});

	socket.on("updatePlayers",() => {
		io.emit('updatePlayers',listOfPlayers);
	});

	socket.on('adduser', (username) => {
		socket.username = username;
		playerNames[username] = username;
		// echo to the current client that he is connected
		socket.emit('updatechat', 'SERVER','white', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER','white', username + ' has connected');

		let player = new Joueur(username);
		listOfPlayers[username] = player;

		// tell all clients to update the list of users on the GUI
		io.emit('updateusers', playerNames,listOfPlayers);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', () => {
		// remove the username from global usernames list
		delete playerNames[socket.username];
		delete listOfPlayers[socket.username];	
		
		io.emit('updateusers', playerNames,listOfPlayers);
		io.emit('updatePlayers',listOfPlayers);

		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER','white', socket.username + ' has disconnected');
	});
});


//envoi d'information sur le monde du jeu chaque battement de coeur 
function sendHeartBeat() {
	let word = new Word(listOfPlayers, obstacles, laves, level, playerNames);
	io.emit("receiveABeat",word);
}


function createObstacles() {
	[obstacles, laves] = Obstacle.createObstacles(level, obstacleSpeed);
};
