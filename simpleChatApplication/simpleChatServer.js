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

let nbUpdatesPerSeconds = 1/1000;

let level = 1;

let playerSpeed = 80;
let obstacleSpeed = 100;
let obstacles= [];
let laves = [];

let target = {x:730, y:250, radius:40, color:'white'};




io.on('connection', (socket) => {
	let emitStamp;
	let connectionStamp = Date.now();
	let lastDate = Date.now();



	//envoi du battement de coeur 
	setInterval(() => {
		console.log("BOOM-");
		sendHeartBeat();
	}, 1000/nbUpdatesPerSeconds);

	//battement envoyer
	socket.on('heartBeat',() => {
		console.log("BOOM!");

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
		listOfPlayers[playerName].x -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseX )*6;
		listOfPlayers[playerName].y -= fct.calcDistanceToMove(delta,listOfPlayers[playerName].vitesseY )*6;
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

		if(level>4){ 
			io.emit('endOfGame',fct.winner(listOfPlayers,playerName, playerNames));
		}else {
			io.emit('updateLevel', level);
		}
	});

	socket.on("getLevel",() => {
		io.emit('updateLevel', level);
	});

	socket.on("pressKey",(sens,player, delta) => {
		switch(sens) {
			case 0 :
				listOfPlayers[player].vitesseX = playerSpeed;
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
				listOfPlayers[player].vitesseX = 0;
				break;			
			case 5 :
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
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('sendpos', (player, delta) => {
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
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo to all client except current, that a new person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');

		// Create a new player 
		let player = new Joueur(username);
		listOfPlayers[username] = player;

		// tell all clients to update the list of users on the GUI
		io.emit('updateusers', playerNames,listOfPlayers);
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


//envoi d'information sur le monde du jeu chaque battement de coeur 
function sendHeartBeat() {
	let word = new Word(listOfPlayers, obstacles, laves, level, playerNames);
	io.emit("receiveABeat",word);
}




function createObstacles() {
	let o1,o2,o3,o4,o5,o6,o7,o8,o9,o10,o11,o12,o13,o14,o15,o16, o17, o18;
	let l1, l2,l3, l4, l5, l6, l7;
	obstacles = [];
	laves = [];
				
	//			o9 = new Obstacle( x, y, hoteur, largeur, "white", 0, 100, 0, 0)

	switch(level) {
		case 1 :

			l1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100, 150, 80);
			l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 300, 40)
		  
			o1 = new Obstacle( 120, 250, 20, 300, "white", 0, 100, 0, 0)
			o2 = new Obstacle( 150, 0, 20, 100, "white", 0, 100, 0, 0)
		  
			o3 = new Obstacle(470, 100, 80, 20, "white", 0, 100, 0, 0)
			o4 = new Obstacle(570, 200, 80, 20, "white", 0, 100, 0, 0)
			o18 = new Obstacle(570, 285, 80, 20, "white", 0, 100, 0, 0)

			o5 =  new Obstacle(300, 100, 20, 400, "white", 0, 100, 0, 0)
			o6 =  new Obstacle(300, 0, 20, 50, "white", 0, 100, 0, 0)
			  
			o7 =  new Obstacle(400, 300, 20, 300, "white", 0, 100, 0, 0)
			o8 = new Obstacle(400, 0, 20, 200, "white", 0, 100, 0, 0)

			o9 =  new Obstacle(500, 100, 20, 400, "white", 0, 100, 0, 0)
			o10 = new Obstacle(500, 0, 20, 50, "white", 0, 100, 0, 0)

			o11 = new Obstacle(600, 300, 20, 200, "white", 0, 100, 0, 0)
			o12 = new Obstacle(600, 0, 20, 200, "white", 0, 100, 0, 0)

			o13 = new Obstacle( 60, 80, 100, 20, "white", 0, 100, 0, 0)
			o14 = new Obstacle( 60, 80, 20, 250, "white", 0, 100, 0, 0)

			o15 = new Obstacle( 120, 250, 110, 20, "white", 0, 100, 0, 0)
			o16 = new Obstacle( 210, 50, 20, 200, "white", 0, 100, 0, 0)

			o17 = new Obstacle(470, 30, 80, 20, "white", 0, 100, 0, 0)


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
			obstacles.push(o9);
			obstacles.push(o10);
			obstacles.push(o11);
			obstacles.push(o12);
			obstacles.push(o13);
			obstacles.push(o14);
			obstacles.push(o15);
			obstacles.push(o16);
			obstacles.push(o17);
			obstacles.push(o18);


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
		case 4 :


			l1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100, 250, 40);
			l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 250, 40)
		  
			o1 = new Obstacle( 120, 250, 20, 600, "white", 0, 100, 0, 0)
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
			obstacles.push(o9);
			obstacles.push(o10);
			obstacles.push(o11);
			obstacles.push(o12);

				break;
	}  
    
  };
