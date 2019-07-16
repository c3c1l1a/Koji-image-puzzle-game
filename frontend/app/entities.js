
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
        this.startY = height * 0.8;


        this.fireTimer = fireCooldown * 3;

        this.weaponLevel = 1;

        this.maxWeaponLevel = 6;
    }

    update() {
        super.update();


        this.fireTimer -= 1 / frameRate();

        if (this.fireTimer <= 0) {
            this.fire();
            this.fireTimer = fireCooldown;
        }

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
        this.pos.x = constrain(this.pos.x, objSize, width - objSize);
    }

    upgradeWeapon() {
        if (this.weaponLevel < this.maxWeaponLevel) {
            this.weaponLevel++;
        }
    }

    loseUpgrade() {
        if (this.weaponLevel > 1) {
            this.weaponLevel = floor(this.weaponLevel / 2);
        }
    }

    fire() {

        let projectileSpeed = -objSize * 0.6;
        let projectileY = this.pos.y - objSize * this.sizeMod / 4;

        if (this.weaponLevel == 1) {
            projectiles.push(new Projectile(this.pos.x, projectileY, 0, projectileSpeed));
        } else if (this.weaponLevel == 2) {
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
        } else if (this.weaponLevel == 3) {
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 3, projectileY + objSize, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 3, projectileY + objSize, 0, projectileSpeed));
        } else if (this.weaponLevel == 4) {
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 3, projectileY + objSize, -objSize * 0.04, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 3, projectileY + objSize, objSize * 0.04, projectileSpeed));
        } else if (this.weaponLevel == 5) {
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 2, projectileY + objSize * 2, -objSize * 0.06, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 3, projectileY + objSize, -objSize * 0.04, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 4, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 3, projectileY + objSize, objSize * 0.04, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 2, projectileY + objSize * 2, objSize * 0.06, projectileSpeed));
        } else if (this.weaponLevel == 6) {
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 2, projectileY + objSize * 2, -objSize * 0.06, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 3, projectileY + objSize, -objSize * 0.04, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x - objSize * this.sizeMod / 4, projectileY + objSize * 0.5, -objSize * 0.02, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x, projectileY, 0, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 4, projectileY + objSize * 0.5, objSize * 0.02, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 3, projectileY + objSize, objSize * 0.04, projectileSpeed));
            projectiles.push(new Projectile(this.pos.x + objSize * this.sizeMod / 2, projectileY + objSize * 2, objSize * 0.06, projectileSpeed));
        }


        this.pos.y = this.startY + objSize / 2;

        sndShoot.setVolume(0.8);
        sndShoot.rate(random(0.8,1.2));
        sndShoot.play();

        
    }
}

class Projectile extends Moveable {
    constructor(x, y, xVel, yVel) {
        super(x, y);
        this.velocity.x = xVel;
        this.velocity.y = yVel;

        this.img = imgProjectile;
        this.maxSize = 0.75;
        this.sizeMod = 0.01;

        this.collided = false;

    }

    update() {
        super.update();

        this.sizeMod = Smooth(this.sizeMod, this.maxSize, 2);

        if (this.pos.y < -objSize) {
            this.removable = true;
        }
    }
}

class Enemy extends Moveable {
    constructor(x, y) {
        super(x, y);

        //Calculate random speed based on average speed
        this.moveSpeed = objSize * enemyAverageSpeed * 0.01 * random(0.75, 1.25);
        this.img = imgEnemy[0];

        this.sizeMod = 4;
        this.defaultSize = this.sizeMod;

        if (this.type == 1) {
            this.moveSpeed *= 1.5;
            this.sizeMod *= 0.75;
        }

        this.velocity.y = this.moveSpeed;
        this.defaultVelocity = this.velocity.y;

        this.collided = false;
        this.destroyed = false;

        this.lives = 1;
        this.startingLives = 1;

    }

    update() {
        super.update();
        this.pos.x = constrain(this.pos.x, objSize, width - objSize);

        this.sizeMod = Smooth(this.sizeMod, this.defaultSize, 4);
        this.velocity.y = Smooth(this.velocity.y, this.defaultVelocity, 3);


        //remove if below screen
        if (this.pos.y > height + objSize * 2) {
            this.removable = true;
        }

        if (this.lives <= 0) {
            this.lives = 0;

            this.removable = true;
        }
    }

    assignImage() {
        if (this.lives == 1) {
            this.img = imgEnemy[0];
        }
        if (this.lives == 2) {
            this.img = imgEnemy[1];
        }
        if (this.lives > 2) {
            this.img = imgEnemy[2];
        }
        if (this.lives > 5) {
            this.img = imgEnemy[3];
        }
        if (this.lives > 10) {
            this.img = imgEnemy[4];
        }
        if (this.lives > 50) {
            this.img = imgEnemy[4];
        }
    }

    render() {
        super.render();

        if (this.lives > 0) {
            textSize(this.sizeMod * objSize * enemyNumberSize / 100);
            fill(Koji.config.colors.enemyNumberColor);
            textAlign(CENTER, CENTER);
            text(this.lives, this.pos.x, this.pos.y);
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
        this.size = random() * objSize / 5;

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
            this.pos.x = random(0, width);
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

        this.rotSpeed = 0.01;

    }

    update() {
        super.update();
        this.pos.x = constrain(this.pos.x, objSize, width - objSize);

        this.rotation += this.rotSpeed;

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