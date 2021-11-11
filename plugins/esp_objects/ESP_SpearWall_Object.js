
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
		this._showTime = showAni ? 0 : 1;
		this._scaleState = showAni ? 0 : 1;

		if(showAni) {
			ESPAudio.spearsEnter(this.getObjectVolume());
		}

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

			this._showAnimation = 0;
		} else if(this.isChanging()) {
			this._showTime += 0.04 * (this._showAnimation === 1 ? 1 : -1);

			this._scaleState = (this._showAnimation === 1 ? Easing.easeOutBack : Easing.easeInCubic)(this._showTime);

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
			$espGamePlayer.kill(true, 0, spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}

	isTouching(other) {
		const TS2 = TS / 2;
		const playerX = other.position.x;
		const playerY = other.position.y;
		const playerZ = other.realZ();
		return this.isTouchingPos(playerX, playerY, playerZ);
	}

	isTouchingPos(posX, posY, posZ) {
		const TS2 = TS / 2;
		return posX >= (this.position.x - TS2) && posX < (this.position.x + TS2 + ((this._width - 1) * TS)) &&
		(posY >= this.position.y - TS2) && (posY < this.position.y + TS2) && 
		(posZ >= this.realZ() + (TS * 2) - 10) && (posZ < this.realZ() + (TS * 2) + 10);
	}

	showSpears(refresh = true) {
		this._showAnimation = 1;
		if(refresh) this._showTime = 0;
		ESPAudio.spearsEnter(this.getObjectVolume());
	}

	hideSpears(refresh = true) {
		this._showAnimation = 2;
		if(refresh) this._showTime = 1;
		ESPAudio.spearsLeave(this.getObjectVolume());
	}

	isChanging() {
		return this._showAnimation !== 0;
	}

	_GetCollisionMap(index) {
		if(this._changedCollisions && this._changedCollisions[index] !== undefined) {
			return this._changedCollisions[index];
		}
		return $gameMap.espCollisionMap[index] ?? 0
	}

	onCreate() {
		this._changedCollisions = {};
		const x = Math.floor(this.position.x / TS);
		const y = Math.floor(this.position.y / TS);
		for(let i = x; i < x + this._width; i++) {
			const index = i + (y * $gameMap.width());
			this._changedCollisions[index] = $gameMap.espCollisionMap[index];
			$gameMap.espCollisionMap[index] = this.CollisionHeight + 2;
		}
	}

	onRemoved() {
		const keys = Object.keys(this._changedCollisions);
		for(let i = 0; i < keys.length; i++) {
			$gameMap.espCollisionMap[keys[i]] = this._changedCollisions[keys[i]];
		}
	}
}

Game_Map.presetObjects[3] = ESPSpearWallObject;
