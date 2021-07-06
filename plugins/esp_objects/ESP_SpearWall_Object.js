
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
	constructor(data, showAni) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._width = parseInt(data["Width"]) || 2;
		this._startingUp = data["StartingState"] === "up";

		this._showAnimation = showAni ? 1 : 0;
		this._showTime = 0;
		this._scaleState = showAni ? 0 : 1;

		this._deleteNextFrame = false;
	}

	constructSprite() {
		return new ESPSpearWallSprite(this);
	}

	saveIndividual() {
		return true;
	}

	saveGroup() {
		return "spearwall";
	}

	update() {
		super.update();

		if(this._deleteNextFrame) {
			this._deleteNextFrame = false;

			if(this._showAnimation === 2) {
				$gameMap.removeGameObject(this);
			}

			this._showTime = 0;
			this._showAnimation = 0;
		} else if(this.isChanging()) {
			this._showTime += 0.04 * (this._showAnimation === 1 ? 1 : -1);

			this._scaleState = Easing.easeOutBack(this._showTime);

			if((this._showAnimation === 1 && this._showTime >= 1) ||
				(this._showAnimation === 2 && this._showTime <= 0)) {

				this._deleteNextFrame = true;
			}
		} else {
			this._scaleState = 1;
		}

		this.updatePlayerKill();
	}

	centerX() {
		return this.position.x + ((TS / 2) * (this._width - 1).clamp(0, 99));
	}

	updatePlayerKill() {
		const size = 20;
		if(this.isTouching($espGamePlayer)) {
			const spd = 60;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(0, spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}

	isTouching(other) {
		const TS2 = TS / 2;
		const playerX = other.position.x;
		const playerY = other.position.y;
		const playerZ = other.realZ();
		return playerX >= (this.position.x - TS2) && playerX < (this.position.x + TS2 + ((this._width - 1) * TS)) &&
		(playerY >= this.position.y - TS2) && (playerY < this.position.y + TS2) && 
		(playerZ >= this.realZ()) && (playerZ < this.realZ() + TS * 2);
	}

	hideSpears() {
		this._showAnimation = 2;
		this._showTime = 1;
	}

	isChanging() {
		return this._showAnimation !== 0;
	}
}

Game_Map.presetObjects[3] = ESPSpearWallObject;
