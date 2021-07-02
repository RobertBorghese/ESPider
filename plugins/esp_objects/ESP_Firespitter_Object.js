
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
 * @arg Look Dir
 * @desc 
 * @type boolean
 * @on Left
 * @off Right
 * @default false

 * @arg Shoot Dir
 * @type select
 * @option Up
 * @value up
 * @option Down
 * @value down
 * @option Left
 * @value left
 * @desc
 * @default left
 */

class ESPFirespitterObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._lookDir = data["Look Dir"] === "true";
		this._shootDir = data["Shoot Dir"] ?? "left";
		this._shootRate = parseInt(data["Shoot Rate"]) || 60;

		this._shootTime = 0;

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
		this._latestFireball = new ESPFireballObject(true);
		switch(this._shootDir) {
			case "left": { this._latestFireball.speed.x = -2; break; }
			case "right": { this._latestFireball.speed.x = 2; break; }
			case "up": { this._latestFireball.speed.y = -2; break; }
			case "down": { this._latestFireball.speed.y = 2; break; }
		}
		$gameMap.addGameObject(this._latestFireball, this.position.x, this.position.y, 20);
	}

	updatePlayerKill() {
		const size = 20;
		if(this.getDistance($espGamePlayer) < size) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}
}

Game_Map.presetObjects.push(ESPFirespitterObject);
