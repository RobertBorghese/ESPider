// MAI BOI DO BE SPITTIN BARZZZ

/*:
 * @command Firespitter
 * @text Options for firespitter.
 * @desc
 *
 * @arg Shoot Rate
 * @desc 
 * @type number
 * @default 120
 *
 * @arg Shoot Rate Offset
 * @desc 
 * @type number
 * @default 0
 *
 * @arg Fireball Speed
 * @desc 
 * @type number
 * @default 2
 * 
 * @arg Look Dir
 * @desc 
 * @type boolean
 * @on Left
 * @off Right
 * @default false
 *
 * @arg Shoot Dir
 * @type select
 * @option Up
 * @value up
 * @option Down
 * @value down
 * @option Left
 * @value left
 * @option Right
 * @value right
 * @option Shoot Player
 * @value player
 * @option Shoot Direction
 * @value direction
 * @desc
 * @default left
 *
 * @arg Shoot Distance
 * @desc 
 * @type number
 * @default 0
 * 
 * @arg Z Level Shift
 * @type select
 * @option No Change
 * @value default
 * @option Grounded
 * @value grounded
 * @option Random
 * @value random
 * @option Constant
 * @value constant
 * @desc
 * @default default
 * 
 * @arg Respawn Time
 * @type number
 * @desc
 * @default 0
 *
 * @arg Shoot Direction Min
 * @desc 
 * @type number
 * @min -1000
 * @default 0
 *
 * @arg Shoot Direction Max
 * @desc 
 * @type number
 * @default 90
 */

class ESPFirespitterObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._lookDir = data["Look Dir"] === "true";
		this._shootDir = data["Shoot Dir"] ?? "left";
		this._fireballSpeed = parseInt(data["Fireball Speed"]) || 2;
		this._shootRate = parseInt(data["Shoot Rate"]);
		if(!this._shootRate && this._shootRate !== 0) {
			this._shootRate = 60;
		}
		this._shootRateOffset = parseInt(data["Shoot Rate Offset"]) || 0;
		this._distance = parseInt(data["Shoot Distance"]) || 0;
		this._zLevel = data["Z Level Shift"] === "grounded" ? 1 : (data["Z Level Shift"] === "random" ? 2 : (data["Z Level Shift"] === "constant" ? 3 : 0));

		this._respawnTime = parseInt(data["Respawn Time"]) || 0;

		this._shootDirectionMin = parseInt(data["Shoot Direction Min"]) || 0;
		this._shootDirectionMax = parseInt(data["Shoot Direction Max"]) || 30;

		this._shootTime = this._shootRateOffset > 0 ? this._shootRateOffset : this._shootRate;

		this._isDefeated = false;
		this._fastAnimation = false;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPFirespitterSprite(this, this._lookDir);
		}
		return this._spr;
	}

	saveGroup() {
		return "firespitter";
	}

	update() {
		if(!this._isDefeated) this.updateGravity();
		super.update();
		if(!this._isDefeated) this.updateGroundAssurance();
		this.updatePlayerKill();

		this._fastAnimation = this._latestFireball && this._latestFireball._isInitializing;

		if(!this._isDefeated && this.position.z <= 0 && this._shootRate > 0) {
			this._shootTime++;
			if(this._shootTime >= this._shootRate) {
				this._shootTime = 0;
				this.shoot();
			}
		}
	}

	makeProjectile() {
		return new ESPFireballObject(true, this._zLevel);
	}

	projectileInitialZ() {
		return 25;
	}

	shoot(speed = null) {
		if(this._distance !== 0 && this.getDistance($espGamePlayer) >= this._distance) {
			return;
		}

		speed ??= this._fireballSpeed;
		this._latestFireball = this.makeProjectile();
		this._latestFireball.speed.x = this._latestFireball.speed.y = 0;
		this._latestFireball.CollisionHeight = this.CollisionHeight;
		switch(this._shootDir) {
			case "left": { this._latestFireball.speed.x = -speed; break; }
			case "right": { this._latestFireball.speed.x = speed; break; }
			case "up": { this._latestFireball.speed.y = -speed; break; }
			case "down": { this._latestFireball.speed.y = speed; break; }
			case "player": {
				const radians = Math.atan2(this.position.y - $espGamePlayer.position.y, this.position.x - $espGamePlayer.position.x);
				this._latestFireball.speed.x = Math.cos(radians) * -speed;
				this._latestFireball.speed.y = Math.sin(radians) * -speed;
				break;
			}
			case "direction": {
				const degrees = this._shootDirectionMin + (Math.random() * (this._shootDirectionMax - this._shootDirectionMin));
				const radians = degrees * (Math.PI / 180);
				this._latestFireball.speed.x = Math.cos(radians) * -speed;
				this._latestFireball.speed.y = Math.sin(radians) * -speed;
				break;
			}
		}
		$gameMap.addGameObject(this._latestFireball, this.position.x, this.position.y, this.projectileInitialZ());
	}

	collisionKillSize() {
		return 20;
	}

	updatePlayerKill() {
		const size = this.collisionKillSize();
		if(this.getDistance($espGamePlayer) < size && ($espGamePlayer.position.z !== 0 || $espGamePlayer.CollisionHeight === this.CollisionHeight)) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}

	defeat() {
		if(!this._isDefeated) {
			this._isDefeated = true;
			$gameMap.shake();
			ESPAudio.triggerBugKill();
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.z += speedZ;
	}

	kill() {
		if(this._respawnTime > 0) {
			$gameMap.requestRespawn(this.__eventId, this._respawnTime, 500);
		}
		$gameMap.removeGameObject(this);
	}
}

Game_Map.presetObjects[2] = ESPFirespitterObject;
