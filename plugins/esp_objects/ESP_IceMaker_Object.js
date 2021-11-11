// okay, hopefully just copy/pasing firespitter dont make me wanna die

/*:
 * @command Icemaker
 * @text Options for icemaker.
 * @desc
 *
 * @arg Animation Offset
 * @desc 
 * @type string
 * @default 0
 */

class ESPIcemakerObject extends ESPFirespitterObject {
	constructor(data) {
		super(data);

		this._animationOffset = parseInt(data["Animation Offset"]) || 0;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPIcemakerSprite(this, this._lookDir, this._animationOffset);
		}
		return this._spr;
	}

	saveGroup() {
		return "icemaker";
	}

	makeProjectile() {
		const result = new ESPIceballObject(true, this._zLevel);
		result.setOwner(this);
		return result;
	}

	projectileInitialZ() {
		return 18;
	}

	collisionKillSize() {
		return 25;
	}
}

Game_Map.presetObjects[15] = ESPIcemakerObject;
