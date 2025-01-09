/**
 * Initierar spelet, anropas vid onload
 */
function init(){
	document.addEventListener("keydown", keyDown);
	document.addEventListener("keyup", keyUp);

	// ---- ÖVRIG KOD HÄR ----

	// -----------------------

	gameLoop();
	
} 

/**
 * Spelloopen
 * Bytt till requestAnimationFrame som förbättring.
 */
function gameLoop() {
	// ---- ÖVRIG KOD HÄR ----


	// -----------------------
	
	// Bytt till requestAnimFrame istället för setInterval
	requestAnimationFrame(function() {
        gameLoop();
      });
}

/**  Ritar om canvas   */
function render() {
	// ---- ÖVRIG KOD HÄR ----
}


/**
 * Uppdaterar läget på figurernat
 * och kontrollerar krockar
 */
function update (deltaTime) {
	// ---- ÖVRIG KOD HÄR ----
}

/**  Avlosssar en missil om möjligt  */
function fire(){
	// ---- ÖVRIG KOD HÄR ----
}

/**
 * Kollitionsdetektion mellan fiende och missil
 * 
 * @param enemy		Fiende som skall kollas
 * @param obj		Objekt som kollision skall kollas mot
 * @returns true 	vid krock
 */
function checkHit(enemy, obj){
	// ---- ÖVRIG KOD HÄR ----
}

/** Sparar undan en tangentryckning för bearbetning  */
function keyDown(e){
	keysDown[e.keyCode] = true;
}

/**
 * Tar bort händelsen när knappen släpps. Detta så inte händelsen ligger kvar och 
 * återupprepas. Skeppet skulle då flytta sig hela tiden vid ett tryck.
 */
function keyUp(e){
	delete keysDown[e.keyCode];
}

window.addEventListener("load",init,false);




