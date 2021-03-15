

exports.Player = function (name, position) {
    this.name = name;

    
	let r = getRandomInt(0, 255);
	let g = getRandomInt(0, 255);
	let b = getRandomInt(0, 255);
    this.color = [r,g,b];
    this.position = position;
    this.vitesse = 1;
}



exports.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min +1 )) + min;
}