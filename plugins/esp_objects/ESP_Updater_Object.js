// Fun little challenge for the players!

/*:
 * @command Updater
 * @text Options for updater.
 * @desc
 *
 * @arg Condition
 * @desc The code to run for the condition.
 * @type multiline_string
 * @default
 *
 * @arg On Update
 * @desc The code to run when updating.
 * @type multiline_string
 * @default
 */

class ESPUpdaterObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._condition = data["Condition"] ?? "";
		this._onUpdate = data["On Update"] ?? "";
		if(this._onUpdate) this._onUpdateFunc = new Function(this._onUpdate);
		else this._onUpdateFunc = null;
	}

	constructSprite() {
		return new ESPUpdaterSprite(this);
	}

	condition() {
		if(!this._condition) return true;
		try {
			return !!eval(this._condition);
		} catch(e) {
			console.error(e);
		}
		return false;
	}
	
	update() {
		super.update();
		if(this._onUpdateFunc) {
			this._onUpdateFunc();
		}
	}
}

Game_Map.presetObjects[7] = ESPUpdaterObject;
