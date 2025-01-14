//Läser in bilderna på figurerna
let shipImg = new Image();
let enemyImg = new Image();
let shotImg = new Image();

shipImg.src = "img/ship.gif";
enemyImg.src = "img/alien.gif";
shotImg.src = "img/shot.gif";

//Ljud för skott
let shotSound = new Audio('sound/fire.mp3');

let keysDown = {};

let canvas;
/**
 * @type {CanvasRenderingContext2D}
 */
let ctx;

let ship, shot;
let enemyArray;

let gameOver = false;

let then;

let points = 0;
let enemySpeed = 20;
let enemiesToSpawn = 1
let spawnCooldown = 5000;
let lastSpawnTime = 0;

// Initierar spelet, anropas vid onload
function init(){
	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);

	canvas = document.getElementById('spaceCanvas');
	ctx = canvas.getContext('2d');

	ship = new Ship(265, 400, shipImg, 256);
	shot = new Shot(ship.x + ship.img.width/2, 400, shotImg, 300);

	enemyArray = []; //new Array();

	/*for(let x = 0; x < 8; x++){
		for(let y = 0; y < 3; y++){
			enemyArray.push(new Enemy(x*65+20, y*50+60, enemyImg, 10));
		}
	}*/

	then = Date.now();

	gameLoop();
	
} 

//Spelloopen
function gameLoop() {
	let now = Date.now();
	let delta = now - then;

	update(delta/1000);
	render();

	then = now;
	
	// Bytt till requestAnimFrame istället för setInterval
	requestAnimationFrame(function() {
        gameLoop();
      });
}

//  Ritar om canvas
function render() {
	
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(ship.img, ship.x, ship.y);

	if(shot.action == true){
		ctx.drawImage(shot.img, shot.x, shot.y);
	}

	for(let i = 0; i < enemyArray.length; i++){
		if(enemyArray[i].alive){
			ctx.drawImage(enemyArray[i].img, enemyArray[i].x, enemyArray[i].y);
		}
	}

	ctx.fillStyle = "yellow";
	ctx.font = "14px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Enemy Down: " + points, 12, 10);

	if(gameOver){
		ctx.fillStyle = "green";
		ctx.font = "28px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("Game Over", 275, 180);
	}

	ctx.restore();
}


//Uppdaterar läget på figurernatoch kontrollerar krockar

function update (deltaTime) {
	if(gameOver){
		return;
	}

	if(32 in keysDown){  //Space
		fire();
	}

	if(37 in keysDown){ //vänster
		ship.x -= ship.speed * deltaTime;
		if(ship.x < 0){
			ship.x = 0;
		}
	}

	if(39 in keysDown){ //Höger
		ship.x += ship.speed * deltaTime;

		if((ship.x + ship.img.width) > canvas.width){
			ship.x = canvas.width - ship.img.width;
		}
	}

	if(shot.action){
		shot.y -= shot.speed * deltaTime;

		if(shot.y < 0){
			shot.action = false;
			ship.shootEnabled = true;
		}
	}

	for(let i = 0; i < enemyArray.length; i++){
		let enemy = enemyArray[i];
		if(enemy.alive && enemy.y < 400){
			enemy.y += enemy.speed * deltaTime;

			if(shot.action && checkHit(enemy, shot)){
				enemy.alive = false;
				shot.action = false;
				shot.y = 0;
				ship.shootEnabled = true;
				points++;

				//Svårighetsgraden ökar ju mer poäng man får
				if (points >= 100) {
					enemySpeed = Math.floor(Math.random() * (70 - 40 + 1)) + 40;
					enemiesToSpawn = Math.floor(Math.random() * 5) + 1;
					spawnCooldown = 3000;
				} else if (points >= 70) {
					enemySpeed = Math.floor(Math.random() * (70 - 40 + 1)) + 40;
					enemiesToSpawn = Math.floor(Math.random() * 4) + 1;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 50) {
					enemySpeed = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
					enemiesToSpawn = Math.floor(Math.random() * 4) + 1;
				} else if (points >= 40) {
					enemySpeed = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
					enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 30) {
					enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
					enemySpeed = Math.floor(Math.random() * (40 - 30 + 1)) + 30;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 20) {
					enemySpeed = Math.floor(Math.random() * (40 - 30 + 1)) + 30;
					enemiesToSpawn = Math.floor(Math.random() * 2) + 1;
				} else if (points >= 10) {
					enemiesToSpawn = Math.floor(Math.random() * 2) + 1;
					enemySpeed = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
				} else if (points >= 5) {
					enemySpeed = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
				}

				console.log(`Points: ${points}, Speed: ${enemySpeed}, EnemiesToSpawn: ${enemiesToSpawn}, Cooldown: ${spawnCooldown}`);
	
			}

			if(checkHit(enemy, ship)){
				gameOver = true;
				ship.y = 451;
			}
		}

		else{
			if(enemy.y >= 400){
				gameOver = true;
			}
		}
	}

	enemyArray = enemyArray.filter(enemy => enemy.alive);

	if(Date.now() - lastSpawnTime > spawnCooldown){
		spawnEnemies(enemiesToSpawn);
		lastSpawnTime = Date.now();
	}

	if(gameOver){
		shot.action = false;
		shot.y = 0;
		ship.shootEnabled = true;
	}

}

function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        let overlap = true;
        let x, y;
        let attempts = 0; // Räknar försök för att undvika oändlig loop

        while (overlap && attempts < 50) {
            x = Math.random() * (canvas.width - 50);
            y = -50; // Spawnar alltid från toppen
            overlap = enemyArray.some(enemy => 
                Math.abs(enemy.x - x) < 50 && Math.abs(enemy.y - y) < 50
            );
            attempts++;
        }

        if (attempts < 50) { // Endast lägg till om en giltig position hittas
            enemyArray.push(new Enemy(x, y, enemyImg, enemySpeed));
        }
    }
}

/**  Avlosssar en missil om möjligt  */
function fire(){
	if(ship.shootEnabled){
		shot.x = ship.x + ship.img.width/2 - shot.img.width/2;
		shot.y = 400;
		ship.shootEnabled = false;
		shot.action = true;
		shotSound.load();
		shotSound.play();
	}
}

/**
 * Kollitionsdetektion mellan fiende och missil
 * 
 * @param enemy		Fiende som skall kollas
 * @param obj		Objekt som kollision skall kollas mot
 * @returns true 	vid krock
 */
function checkHit(enemy, obj){
	if (!enemy || !obj) return false; // Kontrollera att objekten är definierade
    return (
        obj.x <= (enemy.x + enemy.img.width) &&
        enemy.x <= (obj.x + obj.img.width) &&
        obj.y <= (enemy.y + enemy.img.height) &&
        enemy.y <= (obj.y + obj.img.height)
    );
}

// Sparar undan en tangentryckning för bearbetning 
function keyDown(e){
	keysDown[e.keyCode] = true;
}

//Tar bort händelsen när knappen släpps. 
function keyUp(e){
	delete keysDown[e.keyCode];
}

window.addEventListener("load",init,false);