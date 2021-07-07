// Just because keys werent enough.

/*:
 * @command Key
 * @text Options for key.
 * @desc
 *
 * @arg On Touch
 * @desc The code to run when touched.
 * @type multiline_string
 * @default
 */

class ESPTriggerBugObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._code = data["On Touch"];
		
		this._isTouched = false;
	}

	constructSprite() {
		return new ESPTriggerBugSprite(this);
	}

	saveGroup() {
		return "triggerbug";
	}

	update() {
		super.update();
	}

	updateConsumeAnimation(speedZ) {
		this.position.z += speedZ;
	}

	hitWithFire() {
		this._isTouched = true;
		SceneManager._scene._spriteset.shake();
	}

	execute() {
		if(this._isTouched) {
			if(this._code) eval(this._code);
		}
	}
}

Game_Map.presetObjects[8] = ESPTriggerBugObject;
