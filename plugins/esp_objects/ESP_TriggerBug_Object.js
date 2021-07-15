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
		if(!this._spr) {
			this._spr = new ESPTriggerBugSprite(this);
		}
		return this._spr;
	}

	saveGroup() {
		return "triggerbug";
	}

	update() {
		if(!this._isTouched) {
			this.updateGravity();
		}

		super.update();

		if(!this._isTouched) {
			this.updateGroundAssurance();
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.z += speedZ;
	}

	hitWithFire() {
		this._isTouched = true;
		SceneManager._scene._spriteset.shake();
		ESPAudio.triggerBugKill();
	}

	execute() {
		if(this._isTouched) {
			if(this._code) eval(this._code);
		}
	}
}

Game_Map.presetObjects[8] = ESPTriggerBugObject;
