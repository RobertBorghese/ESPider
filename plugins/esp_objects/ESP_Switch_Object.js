// Puzzles and muzzles are good for ~~wuzzles~~ human brain conquest

/*:
 * @command Switch
 * @text Options for switch.
 * @desc
 *
 * @arg On Touch
 * @desc The code to run when touched.
 * @type multiline_string
 * @default
 *
 * @arg Allow Reverse
 * @desc Allow the player to reverse the switch
 * @type boolean
 * @default false
 * 
 * @arg On Reverse
 * @desc The code to run when touched.
 * @type multiline_string
 * @default
 */

class ESPSwitchObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._code = data["On Touch"];
		this._allowReverse = data["Allow Reverse"] === "true";
		if(data["On Reverse"]) {
			this._onReverse = new Function(data["On Reverse"]);
		} else {
			this._onReverse = null;
		}
		
		this._isTouched = false;
		this._canTouch = true;
	}

	constructSprite() {
		return new ESPSwitchSprite(this);
	}

	saveIndividual() {
		return true;
	}

	update() {
		if(!this._isTouched) this.updateGravity();
		super.update();
		if(!this._isTouched) this.updateGroundAssurance();

		this.updatePlayerTouch();
	}

	updatePlayerTouch() {
		const size = 20;
		if(this._canTouch && (!this._isTouched || this._allowReverse)) {
			if(this.getDistance($espGamePlayer) < size) {
				this._isTouched = !this._isTouched;
				this._canTouch = false;
				if(this._isTouched) {
					this.forward();
					this.execute();
				} else {
					this.reverse();
					this.unexecute();
				}
				
				$gameMap.shake();
				
			}
		} else if(!this._canTouch && this.getDistance($espGamePlayer) >= (size * 1.5)) {
			this._canTouch = true;
		}
	}

	execute() {
		if(this._code) eval(this._code);
	}

	unexecute() {
		if(this._onReverse) this._onReverse();
	}

	forward() {
		this._isTouched = true;
		ESPAudio.switchOn();
	}

	reverse() {
		this._isTouched = false;
		ESPAudio.switchOff();
	}
}

Game_Map.presetObjects[16] = ESPSwitchObject;
