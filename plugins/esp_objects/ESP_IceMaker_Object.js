// okay, hopefully just copy/pasing firespitter dont make me wanna die

/*:
 * @command Icemaker
 * @text Options for icemaker.
 * @desc
 *
 * @arg Shoot Rate
 * @desc 
 * @type number
 * @default 120
 *
 * @arg Shoot Rate Offset
 * @desc 
 * @type number
 * @default 0
 *
 * @arg Fireball Speed
 * @desc 
 * @type number
 * @default 2
 * 
 * @arg Look Dir
 * @desc 
 * @type boolean
 * @on Left
 * @off Right
 * @default false
 *
 * @arg Shoot Dir
 * @type select
 * @option Up
 * @value up
 * @option Down
 * @value down
 * @option Left
 * @value left
 * @option Right
 * @value right
 * @option Shoot Player
 * @value player
 * @desc
 * @default left
 *
 * @arg Shoot Distance
 * @desc 
 * @type number
 * @default 0
 * 
 * @arg Z Level Shift
 * @type select
 * @option No Change
 * @value default
 * @option Grounded
 * @value grounded
 * @option Random
 * @value random
 * @desc
 * @default default
 */

class ESPIcemakerObject extends ESPFirespitterObject {
	constructor(data) {
		super(data);
	}

	constructSprite() {
		return new ESPIcemakerSprite(this, this._lookDir);
	}

	saveGroup() {
		return "icemaker";
	}

	makeProjectile() {
		return new ESPIceballObject(true, this._zLevel);
	}

	projectileInitialZ() {
		return 18;
	}
}

Game_Map.presetObjects[15] = ESPIcemakerObject;
