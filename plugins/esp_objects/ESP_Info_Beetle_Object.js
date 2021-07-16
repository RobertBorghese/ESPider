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
 * @option Eval
 * @value eval
 * @default all
 *
 * @arg Image
 * @desc The character image used.
 * @type string
 * @default Beetle
 *
 * @arg Image Rate
 * @desc The character animation rate.
 * @type number
 * @default 20
 *
 * @arg Image Offset Y
 * @desc The image offset
 * @type number
 * @min -9999
 * @default 10
 *
 * @arg Dont Show Shadow
 * @desc
 * @type boolean
 * @default false
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

		this._customImage = data["Image"] ?? null;
		this._customImageRate = parseInt(data["Image Rate"]) || 20;
		this._customImageOffsetY = parseInt(data["Image Offset Y"]) || 10;
		this._dontShowShadow = data["Dont Show Shadow"] === "true";

		if(this._textType === "roomDeaths") {
			this._text = data.text[$gameMap.RoomKillCount.clamp(0, data.text.length - 1)];
		} else if(this._textType === "eval") {
			this._text = eval(data.text.join("\n"));
		} else {
			this._text = data.text.join("\n");
		}
		this._shouldShowText = false;
	}

	saveIndividual() {
		return true;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPInfoBeetleSprite(this, this._text, this._mirror);
		}
		return this._spr;
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
