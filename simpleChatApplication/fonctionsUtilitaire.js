
exports.winner = function  (listOfPlayers,name, playerNames){
	let win = listOfPlayers[name];

	for (let player in playerNames) {
		if(listOfPlayers[player].score>=win.score) {
			win = listOfPlayers[player];
		}
	}
	return win;
}


exports.calcDistanceToMove = function (delta, speed) {
	return (speed * delta);
}

