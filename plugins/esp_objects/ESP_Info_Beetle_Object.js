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
 */

class ESPInfoBeetleObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._triggerDist = parseInt(data["Trigger Distance"]) || 100;
		this._untriggerDist = parseInt(data["Untrigger Distance"]) || 140;

		this._text = data.text.join("\n");
		this._shouldShowText = false;
	}

	constructSprite() {
		return new ESPInfoBeetleSprite(this, this._text);
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
