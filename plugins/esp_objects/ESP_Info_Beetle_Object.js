// Info beetle, my boi.

/*:
 * @command InfoBeetle
 * @text Options for info beetle.
 * @desc
 *
 * @arg Trigger Distance
 * @desc 
 * @type number
 * @default 100
 *
 * @arg Untrigger Distance
 * @desc 
 * @type number
 * @default 140
 *
 * @arg Looking Left
 * @desc 
 * @type boolean
 * @default true
 *
 * @arg Text Type
 * @desc 
 * @type select
 * @option All
 * @value all
 * @option Room Deaths
 * @value roomDeaths
 * @default all
 */

class ESPInfoBeetleObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._triggerDist = parseInt(data["Trigger Distance"]) || 100;
		this._untriggerDist = parseInt(data["Untrigger Distance"]) || 140;
		this._mirror = data["Looking Left"] === "false";
		this._textType = data["Text Type"];

		if(this._textType === "roomDeaths") {
			this._text = data.text[$gameMap.RoomKillCount.clamp(0, data.text.length - 1)];
		} else {
			this._text = data.text.join("\n");
		}
		this._shouldShowText = false;
	}

	constructSprite() {
		return new ESPInfoBeetleSprite(this, this._text, this._mirror);
	}

	update() {
		super.update();
		this._shouldShowText = $gameMap._isTranferring ? false : (this.getDistance($espGamePlayer) < (this._shouldShowText ? this._untriggerDist : this._triggerDist));
	}

	shouldShowText() {
		return this._shouldShowText;
	}
}

Game_Map.presetObjects[0] = ESPInfoBeetleObject;
