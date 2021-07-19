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
 *
 * @arg Image
 * @desc The character image used.
 * @type string
 * @default
 *
 * @arg Image Rate
 * @desc The character image used.
 * @type string
 * @default
 *
 * @arg Image Offset Y
 * @desc The image offset
 * @default -16
 */

class ESPTriggerBugObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._code = data["On Touch"];

		if(data.text && typeof data.text === "string") {
			this._displayText = data.text;
		} else {
			this._displayText = null;
		}

		this._customImage = data["Image"];
		if(this._customImage === "") this._customImage = null;
		this._customImageRate = parseInt(data["Image Rate"]) || -1;
		this._customImageOffsetY = parseInt(data["Image Offset Y"]) || -16;
		
		this._isTouched = false;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPTriggerBugSprite(this, this._customImage, this._customImageRate, this._customImageOffsetY);
		}
		return this._spr;
	}

	saveIndividual() {
		return true;
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
		$gameMap.shake();
		ESPAudio.triggerBugKill();
	}

	execute() {
		if(this._isTouched) {
			if(this._code) eval(this._code);
		}
	}

	onPlayerLeavesTheMap() {
		this._spr.removeText();
	}
}

Game_Map.presetObjects[8] = ESPTriggerBugObject;
