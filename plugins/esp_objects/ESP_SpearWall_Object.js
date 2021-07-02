
// This will be th jeback bone of all puzlez

/*:
 * @command SpearWall
 * @text Options for spear wall.
 * @desc
 *
 * @arg Width
 * @desc 
 * @type number
 * @default 2
 *
 * @arg Starting State
 * @type select
 * @option Up
 * @value up
 * @option Down
 * @value down
 * @desc
 * @default up
 */

class ESPSpearWallObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._width = parseInt(data["Width"]) || 2;
		this._startingUp = data["StartingState"] === "up";
	}

	constructSprite() {
		return new ESPSpearWallSprite(this);
	}

	update() {
		super.update();

		this.updatePlayerKill();
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

Game_Map.presetObjects[3] = ESPSpearWallObject;
