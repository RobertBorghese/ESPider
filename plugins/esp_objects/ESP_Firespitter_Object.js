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
 * @desc
 * @default left
 *
 * @arg Z Level Shift
 * @type select
 * @option No Change
 * @value default
 * @option Grounded
 * @value grounded
 * @option Random
 * @value random
 * @desc
 * @default default
 */

class ESPFirespitterObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._lookDir = data["Look Dir"] === "true";
		this._shootDir = data["Shoot Dir"] ?? "left";
		this._fireballSpeed = parseInt(data["Fireball Speed"]) || 2;
		this._shootRate = parseInt(data["Shoot Rate"]) || 60;
		this._shootRateOffset = parseInt(data["Shoot Rate Offset"]) || 0;
		this._zLevel = data["Z Level Shift"] === "grounded" ? 1 : (data["Z Level Shift"] === "random" ? 2 : 0);

		this._shootTime = this._shootRateOffset;

		this._fastAnimation = false;

		this.CantWalkOffLedge = true;
	}

	constructSprite() {
		return new ESPFirespitterSprite(this, this._lookDir);
	}

	update() {
		super.update();

		this.updatePlayerKill();

		this._fastAnimation = this._latestFireball && this._latestFireball._isInitializing;

		this._shootTime++;
		if(this._shootTime >= this._shootRate) {
			this._shootTime = 0;
			this.shoot();
		}
	}

	shoot() {
		this._latestFireball = new ESPFireballObject(true, this._zLevel);
		this._latestFireball.speed.x = this._latestFireball.speed.y = 0;
		switch(this._shootDir) {
			case "left": { this._latestFireball.speed.x = -this._fireballSpeed; break; }
			case "right": { this._latestFireball.speed.x = this._fireballSpeed; break; }
			case "up": { this._latestFireball.speed.y = -this._fireballSpeed; break; }
			case "down": { this._latestFireball.speed.y = this._fireballSpeed; break; }
		}
		$gameMap.addGameObject(this._latestFireball, this.position.x, this.position.y, 25);
	}

	updatePlayerKill() {
		const size = 20;
		if(this.getDistance($espGamePlayer) < size && ($espGamePlayer.position.z !== 0 || $espGamePlayer.CollisionHeight === this.CollisionHeight)) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}
}

Game_Map.presetObjects[2] = ESPFirespitterObject;