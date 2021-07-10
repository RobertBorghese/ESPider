// okay, heres where thdfh phfUPIhfUEIWfdishfdsljkfhdsfkjhkd lflDHSFJLDHF SKILLMEKILLMEKILLME

/*:
 * @command Falling Platform
 * @text Options for falling platform.
 * @desc
 *
 * @arg Collision Height
 * @desc
 * @type number
 * @default 1
 *
 * @arg Duration
 * @desc
 * @type number
 * @default 300
 *
 * @arg Respawn Time
 * @desc
 * @type number
 * @default 0
 *
 * @arg Platform Width
 * @desc
 * @type number
 * @default 1
 *
 * @arg Platform Height
 * @desc
 * @type number
 * @default 1
 */

class ESPFallingPlatformObject extends ESPMovingPlatformObject {
	constructor(data) {
		super(data);

		this._respawnTime = parseInt(data["Respawn Time"]) || 0;

		this._fallingPhase = 0;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPFallingPlatformSprite(this, this._imageType, this._width, this._height, this._espParent);
		}
		return this._spr;
	}

	canTouch() {
		if(this._espParent) {
			return this._espParent.canTouch();
		}
		return this._fallingPhase < 2;
	}

	isBreaking() {
		if(this._espParent) {
			return this._espParent.isBreaking();
		}
		return this._fallingPhase === 1;
	}

	isDying() {
		return !this.canTouch();
	}

	childrenClass() {
		return ESPFallingPlatformObject;
	}

	updateMovement() {
		if(this._time > 0) {
			this._time--;
			if(this._time <= 0) {
				this._fallingPhase = 2;
			}
		}
	}

	updateChildrenPositionZ() {
		if(this._espChildren && this._espChildren.length > 0) {
			const len = this._espChildren.length;
			for(let i = 0; i < len; i++) {
				this._espChildren[i].position.z = this.position.z;
				this._espChildren[i]._spr.updatePosition();
			}
		}
	}

	onPlayerStepOn() {
		if(this._fallingPhase === 0) {
			if(this._espParent) {
				this._espParent.onPlayerStepOn();
			} else {
				this._time = this._maxTime;
				this._fallingPhase = 1;
			}
		}
	}
}

Game_Map.presetObjects[12] = ESPFallingPlatformObject;
