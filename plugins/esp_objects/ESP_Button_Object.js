// god please just kill me now. how the actual fuck am i gonna actually implement this

/*:
 * @command Button
 * @text Options for button.
 * @desc
 *
 * @arg On Press
 * @desc The code to run when pressed.
 * @type multiline_string
 * @default
 *
 * @arg On Released
 * @desc The code to run when released.
 * @type multiline_string
 * @default
 */

class ESPButtonObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		if(data["On Press"]) this._press = new Function(data["On Press"]);
		if(data["On Released"]) this._release = new Function(data["On Released"]);
		
		this._isTouched = false;
	}

	constructSprite() {
		return new ESPButtonSprite(this);
	}

	playerTouching(other) {
		const diffX = other.position.x - this.position.x;
		const diffY = other.position.y - this.position.y;
		return diffY >= -2 && diffY <= 27 && diffX >= -22 && diffX <= 31;
	}

	update() {
		if(this.position.z > 0) {
			this.speed.z -= 0.1;
			if(this.speed.z < -10) this.speed.z = -10;
		}

		super.update();

		if(this.position.z < 0) {
			this.speed.z = 0;
			this.position.z = 0;
		}

		const touched = (this.position.z <= 0 && $espGamePlayer.position.z <= 0 && this.playerTouching($espGamePlayer));
		if(this._isTouched !== touched) {
			this._isTouched = touched;
			if(this._isTouched) {
				if(this._press) this._press();
				ESPAudio.buttonPress();
			} else {
				if(this._release) this._release();
				ESPAudio.buttonUnpress();
			}
		}
	}
}

Game_Map.presetObjects[9] = ESPButtonObject;
