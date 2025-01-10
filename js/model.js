/**
 * @param x      Läge i x-led
 * @param y      Läge i y-led
 * @param img    Bild som representerar figuren
 * @param speed  Hastighet i px/s
 * 
 */

//Gemensamt för alla figurer
class Sprite {
    constructor(x,y,img,speed){
        this.x = x;
        this.y = y;
        this.img = img;
        this.speed = speed;
    }
}

//De olika figurerna i nedanstående klasser

class Ship extends Sprite{
    constructor(x,y,img,speed){
        super(x, y, img, speed);
        this.shootEnabled = true;
    }
}

class Enemy extends Sprite{
    constructor(x,y,img,speed){
        super(x, y, img, speed);
        this.alive = true;
    }
}

class Shot extends Sprite{
    constructor(x,y,img,speed){
        super(x, y, img, speed);
        this.action = false;
    }
}



