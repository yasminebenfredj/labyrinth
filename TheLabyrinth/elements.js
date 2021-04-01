
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
	  this.vitesseX=0;
	  this.vitesseY=0;
	  let r = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  let g = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  let b = Math.floor(Math.random() * (255 - 0 +1 )) + 0;
	  this.color = "rgb("+r+","+ g+"," +b+")";
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
	  
	static createObstacles (level, obstacleSpeed) {
		let o1,o2,o3,o4,o5,o6,o7,o8,o9,o10,o11,o12,o13,o14,o15,o16, o17, o18, o19,o20;
		let l1, l2,l3, l4, l5, l6, l7;
		let obstacles = [];
		let laves = [];
						
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
	
				o9 = new Obstacle( 750, 0, 20, 350, "white", 0, 100, 0, 0)
				o10 = new Obstacle( 750, 400, 20, 400, "white", 0, 100, 0, 0)
	
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
											/*
				obstacles.push(o11);
				obstacles.push(o12);
				*/
	
	
				break;
			case 5 :
	
				l1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100, 250, 40);
				l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 250, 40)
				l3 = new Obstacle(415, 50, 20, 50, "orange", obstacleSpeed-10, 100, 500, 20)

				o1 = new Obstacle( 150, 250, 20, 600, "white", 0, 100, 0, 0)
				o2 = new Obstacle( 150, 0, 20, 150, "white", 0, 100, 0, 0)
			  
				o3 = new Obstacle(300, 300, 20, 500, "white", 0, 100, 0 , 0)
				o4 = new Obstacle(300, 0, 20, 200, "white", 0, 100, 0, 0)
			  
				o5 =  new Obstacle(450, 100, 20, 500, "white", 0, 100, 0, 0)
				o6 =  new Obstacle(450, 0, 20, 50, "white", 0, 100, 0, 0)
			  
				o7 =  new Obstacle(600, 300, 20, 300, "white", 0, 100, 0, 0)
				o8 = new Obstacle(600, 0, 20, 250, "white", 0, 100, 0, 0)
	
				o9 = new Obstacle( 750, 0, 20, 350, "white", 0, 100, 0, 0)
				o10 = new Obstacle( 750, 400, 20, 400, "white", 0, 100, 0, 0)

				o11 = new Obstacle(710, 350, 100, 20, "white", 0, 100, 0, 0)
				o12 = new Obstacle(710, 400, 100, 20, "white", 0, 100, 0, 0)

				o13 = new Obstacle(550, 230, 100, 20, "white", 0, 100, 0, 0)
				o14 = new Obstacle(550, 300, 100, 20, "white", 0, 100, 0, 0)

				o15 = new Obstacle(150, 130, 80, 20, "white", 0, 100, 0, 0)
				o16 = new Obstacle( 230, 130, 20, 300, "white", 0, 100, 0, 0)

				o17 = new Obstacle(390, 10, 80, 20, "white", 0, 100, 0, 0)
				o18 = new Obstacle( 380, 10, 20, 400, "white", 0, 100, 0, 0)

				o19 = new Obstacle( 530, 50, 20, 200, "white", 0, 100, 0, 0)


				laves.push(l1);
				laves.push(l2);
				laves.push(l3);

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
				obstacles.push(o19);

	
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

				o13 = new Obstacle( 750, 0, 20, 350, "white", 0, 100, 0, 0)
				o14 = new Obstacle( 750, 400, 20, 400, "white", 0, 100, 0, 0)

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
				obstacles.push(o13);
				obstacles.push(o14);
				
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

				o13 = new Obstacle( 750, 0, 20, 350, "white", 0, 100, 0, 0)
				o14 = new Obstacle( 750, 400, 20, 400, "white", 0, 100, 0, 0)


	
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
				obstacles.push(o13);
				obstacles.push(o14);

				break;
			case 4 :
				l1 = new Obstacle(150, 50, 20, 100, "red", obstacleSpeed, 100, 150, 80);
				l2 = new Obstacle(600, 50, 20, 50, "orange", obstacleSpeed, 100, 300, 40)
			  
				o1 = new Obstacle( 120, 250, 20, 300, "white", 0, 100, 0, 0)
				o2 = new Obstacle( 150, 0, 20, 100, "white", 0, 100, 0, 0)
			  
				o3 = new Obstacle(470, 100, 80, 20, "white", 0, 100, 0, 0)
				o4 = new Obstacle(570, 200, 80, 20, "white", 0, 100, 0, 0)
	
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
				o18 = new Obstacle(570, 285, 80, 20, "white", 0, 100, 0, 0)
	
				o19 = new Obstacle( 750, 0, 20, 350, "white", 0, 100, 0, 0)
				o20 = new Obstacle( 750, 400, 20, 400, "white", 0, 100, 0, 0)

				
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
				obstacles.push(o19);
				obstacles.push(o20);

					break;
		}  
		return [obstacles,laves];
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

