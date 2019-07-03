
/*
    Base entity class, can be used as a base for other drawable objects, used for drawing and checking basic collisions

    IMPORTANT: Make sure to assign it an img variable after instantiating

    Common way to use it:

    let myObject;
    ...
    myObject = new Entity(x, y);
    myObject.img = myImage;

    ...

    draw(){
        ...

        myObject.render();
    }

    If you want to check for collisions with another Entity:

    if(myObject.collisionWith(anotherObject)){
        //do stuff
    }
    
*/
class Entity {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.rotation = 0;
        this.img; //Assign this after instantiating
        this.sizeMod = 1; //Size multiplier on top of objSize
        this.removable = false;
        this.scale = createVector(1, 1);
    }


    render() {
        let size = objSize * this.sizeMod;

        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.rotation);
        scale(this.scale.x, this.scale.y);
        image(this.img, -size / 2, -size / 2, size, size);
        pop();
    }

    //Basic circle collision
    collisionWith(other) {
        let distCheck = (objSize * this.sizeMod + objSize * other.sizeMod) / 2;

        if (dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < distCheck) {
            return true;
        } else {
            return false;
        }
    }

}

//An extended version of Entity, with movement speed
class Moveable extends Entity {
    constructor(x, y) {
        super(x, y);
        this.velocity = createVector(0, 0);
    }

    update() {
        this.pos.add(this.velocity);
    }
}

class Player extends Moveable {
    constructor(x, y) {
        super(x, y);
        this.moveSpeed = objSize * 0.5;
        this.img = imgPlayer;
        this.sizeMod = 1.75;
        this.moveDir = 0;
        this.startY = this.pos.y;
        this.shieldTimer = 0;
        this.maxShieldSize = objSize * this.sizeMod * 1.2;
        this.shieldSize = 0.1;
    }

    update() {
        super.update();

        this.shieldTimer -= 1 / frameRate();

        //Move logic
        if (touching) {
            if (abs(mouseX - this.pos.x) > objSize / 3) {
                this.moveDir = Math.sign(mouseX - this.pos.x);
            } else {
                this.moveDir = 0;
            }
        } else {
            if (!usingKeyboard) {
                this.moveDir = 0;
            }
        }

        //make it a bit slower if using keyboard, since it gets a bit clunky at full speed
        let speedMod = 1;
        if (usingKeyboard) {
            speedMod = 0.75;
        }

        this.velocity.x = Smooth(this.velocity.x, this.moveDir * this.moveSpeed * speedMod, 3);
        this.pos.y = Smooth(this.pos.y, this.startY, 8);

        //Limit X position inside bounds
        this.pos.x = constrain(this.pos.x, leftX + objSize, rightX - objSize);
    }

    render() {
        super.render();

        //Shrink and grow shield when needed
        if (this.shieldTimer > 0) {
            if (this.shieldTimer > 0.3) {
                this.shieldSize = Smooth(this.shieldSize, this.maxShieldSize, 4);
            } else {
                this.shieldSize = Smooth(this.shieldSize, 0.1, 4);
            }

            let size = this.shieldSize;

            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.rotation);
            scale(this.scale.x, this.scale.y);
            image(imgShield, -size / 2, -size / 2, size, size);
            pop();
        }
    }
}

class Enemy extends Moveable {
    constructor(x, y, type) {
        super(x, y);

        this.type = type;
        //Calculate random speed based on average speed
        this.moveSpeed = objSize * enemyAverageSpeed * 0.01 * random(0.75, 1.25);
        this.img = imgEnemy[type];

        this.sizeMod = random(1.25, 2);
        if (this.type == 1) {
            this.moveSpeed *= 1.5;
            this.sizeMod *= 0.75;
        }

        this.velocity.y = this.moveSpeed;
        this.collided = false;
        this.rotation = random() * Math.PI;
    }

    update() {
        super.update();
        this.pos.x = constrain(this.pos.x, objSize, width - objSize);

        //remove if below screen
        if (this.pos.y > height + objSize * 2) {
            this.removable = true;
        }
    }
}



///===Background stars
/*
    Makes them a random color
    When a star moves offscreen, it gets teleported back at the opposite side and starts again

*/
class Star extends Moveable {
    constructor(x, y) {
        super(x, y);
        this.pos = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.size = random() * objSize / 8;

        this.r = random() * 100 + 155;
        this.g = random() * 100 + 155;
        this.b = random() * 100 + 155;
        this.a = random() * 90 + 60;

        this.speedModifier = random() * 0.1;

        this.timer = 0;

    }

    update() {
        super.update();

        this.velocity.y = objSize / 30;

        this.timer += 1 / frameRate();

        this.pos.add(this.velocity);

        if (this.pos.y > height) {
            this.pos.y = -objSize;
            this.pos.x = random(leftX, rightX);
        }
    }

    render() {
        //override
        // Set colors
        fill(this.r, this.g, this.b, this.a);
        strokeWeight(0);

        circle(this.pos.x, this.pos.y, this.size);
    }
}


class Collectible extends Moveable {
    constructor(x, y, type) {
        super(x, y);

        this.type = type;
        //Same speed calculation as with enemies
        this.moveSpeed = objSize * enemyAverageSpeed * 0.01 * random(0.75, 1.25);

        this.img = imgCollectible[this.type];
        this.sizeMod = 1.5;
        this.velocity.y = this.moveSpeed;
        this.collided = false;

    }

    update() {
        super.update();
        this.pos.x = constrain(this.pos.x, objSize, width - objSize);

        if (this.pos.y > height + objSize) {
            this.removable = true;
        }
    }
}

//Short lasting explosion after colliding with an enemy
class Explosion extends Entity {
    constructor(x, y, type) {
        super(x, y);

        this.img = imgExplosion;
        this.maxSize = random(2, 3);
        this.sizeMod = 0.01;
        this.timer = 0.3;

    }

    update() {
        this.timer -= 1 / frameRate();

        if (this.timer > 0.1) {
            if (this.sizeMod < this.maxSize) {
                this.sizeMod = Smooth(this.sizeMod, this.maxSize, 2);
            }
        } else {
            this.sizeMod = Smooth(this.sizeMod, 0.1, 2);
        }

    }
}