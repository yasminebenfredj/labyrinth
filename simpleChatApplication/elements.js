
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

	listOfPosition;
	latestPos;
  
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

	  this.latestPos = 0;
	  this.listOfPosition = {}
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

  class Word {
	allPlayers;
	obtacles;
	laves;
	level;
	names;


	constructor (allPlayers, obstacles, laves, level, names) {
		this.allPlayers = allPlayers;
		this.obstacles = obstacles;
		this.laves  = laves ;
		this.level = level;
		this.names = names;

	}
  }



  module.exports = {
      Joueur,
      Obstacle,
      Word
  }

