//ESPJumpRespondPlatformObject

/*:
 * @command Jump Respond Platform
 * @text Options for jump responding platform.
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
 * @arg Points
 * @desc The list of points to travel to.
 * @type multiline_string
 * @default []
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

class ESPJumpRespondPlatformObject extends ESPMovingPlatformObject {
	constructor(data) {
		super(data);

		this._moveIndex = 0;
		this._shouldBeMoving = true;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPJumpRespondPlatformSprite(this, this._imageType, this._width, this._height, this._espParent);
		}
		return this._spr;
	}

	childrenClass() {
		return ESPJumpRespondPlatformObject;
	}

	move() {
		this._shouldBeMoving = true;
		this._time = 0;
		this._moveIndex++;
		if(this._moveIndex >= this._points.length) {
			this._moveIndex = 0;
		}
	}

	updateMovement() {
		if(!this._points) return;

		if(this._shouldBeMoving) {
			this.oldX = this.position.x;
			this.oldY = this.position.y;

			this._time++;
			if(this._time >= this._maxTime) {
				this._shouldBeMoving = false;
			}

			let resultData = null;
			if(this._points.length > 1) {
				let ratio = (this._time / this._maxTime).clamp(0, 1);
				let index = 0;
				const first = this._points[this._moveIndex];
				const second = this._points[(this._moveIndex + 1 >= this._points.length ? 0 : this._moveIndex + 1)];
				if(first[4] && Easing["ease" + first[4]]) {
					ratio = Easing["ease" + first[4]](ratio);
				}
				resultData = [
					ratio,
					ESP.lerp(first[1], second[1], ratio),
					ESP.lerp(first[2], second[2], ratio),
					ESP.lerp(first[3], second[3], ratio)
				];
			}

			if(resultData !== null) {
				this.position.x = (resultData[1] * TS) + (TS / 2);
				this.position.y = (resultData[2] * TS) + (TS / 2);
				this.position.z = resultData[3] * TS;
			}

			this.deltaX = this.position.x - this.oldX;
			this.deltaY = this.position.y - this.oldY;
		} else {
			this.deltaX = 0;
			this.deltaY = 0;

			if($espGamePlayer._didJumpThisFrame) {
				this.move();
			}
		}
	}

	onPlayerStepOn() {
	}
}

Game_Map.presetObjects[13] = ESPJumpRespondPlatformObject;
