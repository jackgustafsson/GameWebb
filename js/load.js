let shipImg = new Image();
let enemyImg = new Image();
let shotImg = new Image();

shipImg.src = "img/ship.gif";
enemyImg.src = "img/alien.gif";
shotImg.src = "img/shot.gif";

let shotSound;

let keysDown = {};

let canvas;
let ctx;

let ship, shot;
let enemyArray;

let gameOver = false;

let then;

let points;
let enemySpeed;
let enemiesToSpawn;
let spawnCooldown;
let lastSpawnTime = 0;

let gameState = "menu";

function init(){
	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);
	canvas = document.getElementById('spaceCanvas');
	ctx = canvas.getContext('2d');

	canvas.addEventListener("click", handleMenuClick);

	shotSound = new Audio('sound/fire.mp3');

	then = Date.now();
	gameLoop();
} 

function render() {
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.textAlign = "center";

	if (gameState === "menu") {
        renderMenu();
    } else if (gameState === "help") {
        renderHelp();
    } else if (gameState === "playing") {
        renderGame();
    } else if (gameState === "gameOver") {
        renderGameOver();
    } else if(gameState == "score"){
		renderScore();
	}

	ctx.restore();
}

function renderMenu() {
    ctx.font = "36px monospace";
    ctx.fillText("Space Shooter", canvas.width / 2, 150);

	ctx.font = "24px monospace";
    ctx.fillText("Start Game", canvas.width / 2, 250);
	ctx.fillText("Highest Score", canvas.width/2, 300);
    ctx.fillText("Help", canvas.width / 2, 350);
    ctx.fillText("Exit", canvas.width / 2, 400);
}

function renderHelp() {
    ctx.font = "18px monospace";
    ctx.fillText("Use arrow keys to move and space to shoot.", canvas.width / 2, 150);
    ctx.fillText("Avoid enemies and shoot them down.", canvas.width / 2, 200);
    ctx.fillText("Click to return to menu.", canvas.width / 2, 300);
}

function renderGame() {
    ctx.drawImage(ship.img, ship.x, ship.y);

    if (shot.action) {
        ctx.drawImage(shot.img, shot.x, shot.y);
    }

    for (let i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i].alive) {
            ctx.drawImage(enemyArray[i].img, enemyArray[i].x, enemyArray[i].y);
        }
    }

    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Enemy Down: " + points, 12, 20);
}

function renderGameOver() {
    ctx.font = "28px monospace";
    ctx.fillText("Game Over", canvas.width / 2, 100);
    ctx.fillText("Your score: " + points, canvas.width / 2, 150);
    ctx.fillText("Play Again", canvas.width / 2, 300);
    ctx.fillText("Back to Main Menu", canvas.width / 2, 350);
}

function renderScore() {
    ctx.font = "18px monospace";
    const highestScore = localStorage.getItem("highestScore") || 0;
    ctx.fillText("Your highest score is: " + highestScore, canvas.width / 2, 200);
    ctx.fillText("Click to return to menu.", canvas.width / 2, 250);
}

function handleMenuClick(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (gameState === "menu") {
        if (y > 230 && y < 270) {
            startGame();
        } else if (y > 270 && y < 330) {
            gameState = "score"
        } else if (y > 330 && y < 370) {
            gameState = "help";
        } else if (y > 370 && y < 430){
			window.close();
		}
    } else if (gameState === "help") {
        gameState = "menu";
    } else if (gameState === "gameOver") {
        if (y > 270 && y < 330) {
            startGame();
        } else if (y > 330 && y < 370) {
            gameState = "menu";
        } 
    } else if (gameState === "score") {
	    gameState = "menu";
    }
}

function startGame() {
    gameState = "playing";
    points = 0;
    gameOver = false;

	enemySpeed = 20;
    enemiesToSpawn = 1;
    spawnCooldown = 5000;

    ship = new Ship(canvas.width / 2, canvas.height - 50, shipImg, 500);
    shot = new Shot(ship.x + ship.img.width / 2, 400, shotImg, 600);
    enemyArray = [];
    lastSpawnTime = Date.now();
}

function update (deltaTime) {
	if (gameState !== "playing") return

    if (gameOver) {
		saveHighestScore();
        gameState = "gameOver";
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
		if(enemy.alive && enemy.y < (canvas.height - 50)){
			enemy.y += enemy.speed * deltaTime;

			if(shot.action && checkHit(enemy, shot)){
				enemy.alive = false;
				shot.action = false;
				shot.y = 0;
				ship.shootEnabled = true;
				points++;	

				if (points >= 100) {
					enemySpeed = Math.floor(Math.random() * (70 - 50 + 1)) + 50;
					enemiesToSpawn = Math.floor(Math.random() * 5) + 1;
					spawnCooldown = 3000;
				} else if (points >= 70) {
					enemySpeed = Math.floor(Math.random() * (70 - 40 + 1)) + 40;
					enemiesToSpawn = Math.floor(Math.random() * 4) + 1;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 50) {
					enemySpeed = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
					enemiesToSpawn = Math.floor(Math.random() * 4) + 1;
				} else if (points >= 40) {
					enemySpeed = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
					enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 30) {
					enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
					enemySpeed = Math.floor(Math.random() * (50 - 40 + 1)) + 40;
					spawnCooldown = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
				} else if (points >= 20) {
					enemySpeed = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
					enemiesToSpawn = Math.floor(Math.random() * 2) + 1;
				} else if (points >= 10) {
					enemiesToSpawn = Math.floor(Math.random() * 2) + 1;
					enemySpeed = Math.floor(Math.random() * (40 - 30 + 1)) + 30;
				} else if (points >= 5) {
					enemySpeed = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
				}

				console.log(`Points: ${points}, Speed: ${enemySpeed}, EnemiesToSpawn: ${enemiesToSpawn}, Cooldown: ${spawnCooldown}`);
	
			}

			if(checkHit(enemy, ship)){
				gameOver = true;
			}
		}
		else{
			if(enemy.y >= (canvas.height - 50)){
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

function gameLoop() {
	let now = Date.now();
	let delta = now - then;
	update(delta/1000);
	render();
	then = now;
	requestAnimationFrame(gameLoop);
}

function saveHighestScore() {
    const highestScore = localStorage.getItem("highestScore") || 0;
    if (points > highestScore) {
        localStorage.setItem("highestScore", points);
    }
}

function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let x, y, overlap;

        do {
            x = Math.random() * (canvas.width - 50);
            y = -50; 
            overlap = enemyArray.some(enemy =>
                Math.abs(enemy.x - x) < 50 && Math.abs(enemy.y - y) < 50
            );
            attempts++;
        } while (overlap && attempts < 20); 

        if (!overlap) {
            enemyArray.push(new Enemy(x, y, enemyImg, enemySpeed));
        }
    }
}

function fire(){
	if(ship.shootEnabled){
		shot.x = ship.x + ship.img.width/2 - shot.img.width/2;
		shot.y = ship.y;
		ship.shootEnabled = false;
		shot.action = true;
		shotSound.load();
		shotSound.play();
	}
}

function checkHit(enemy, obj){
    return (
        obj.x <= (enemy.x + enemy.img.width) &&
        enemy.x <= (obj.x + obj.img.width) &&
        obj.y <= (enemy.y + enemy.img.height) &&
        enemy.y <= (obj.y + obj.img.height)
    );
}

function keyDown(e){
	keysDown[e.keyCode] = true;
}

function keyUp(e){
	delete keysDown[e.keyCode];
}

window.addEventListener("load",init,false);