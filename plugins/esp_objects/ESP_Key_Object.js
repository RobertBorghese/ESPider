// Puzzles and muzzles are good for wuzzles.

/*:
 * @command Key
 * @text Options for key.
 * @desc
 *
 * @arg On Touch
 * @desc The code to run when touched.
 * @type multiline_string
 * @default
 *
 * @arg Immediate
 * @desc Whether on touch is run the second the key is touched
 * @type boolean
 * @default false
 */

class ESPKeyObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._code = data["On Touch"];
		this._immediate = data["Immediate"] === "true";
		
		this._isTouched = false;
	}

	constructSprite() {
		return new ESPKeySprite(this);
	}

	update() {
		super.update();
		this.updatePlayerTouch();
	}

	updatePlayerTouch() {
		const size = 20;
		if(!this._isTouched && this.getDistance($espGamePlayer) < size) {
			//this.consumeFly();
			if(this._immediate) this.execute();
			SceneManager._scene._spriteset.shake();
			this._isTouched = true;
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	execute() {
		if(this._code) eval(this._code);
	}
}

Game_Map.presetObjects[6] = ESPKeyObject;
