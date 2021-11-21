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
 * @arg Text Size
 * @desc
 * @type number
 * @default 20
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
 * @arg Text Offset Y
 * @desc The text offset
 * @type number
 * @min -9999
 * @default 0
 *
 * @arg Dont Show Shadow
 * @desc
 * @type boolean
 * @default false
 *
 * @arg Get Excited
 * @desc
 * @type boolean
 * @default false
 *
 * @arg Constant Text Refresh
 * @desc
 * @type boolean
 * @default false
 *
 * @arg Custom Audio JSON
 * @desc
 * @type text
 * @default
 *
 * @arg Float
 * @desc
 * @type boolean
 * @default false
 *
 * @arg Float Min
 * @desc
 * @type number
 * @min -9999
 * @default
 *
 * @arg Float Max
 * @desc
 * @type number
 * @min -9999
 * @default
 *
 * @arg Float Time Ratio
 * @desc
 * @decimals 2
 * @type number
 * @min -9999
 * @default
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
		this._textSize = parseInt(data["Text Size"] ?? "20") || 20;

		this._customImage = data["Image"] ?? null;
		this._customImageRate = parseInt(data["Image Rate"]) || 20;
		this._customImageOffsetY = parseInt(data["Image Offset Y"]) || 10;
		this._dontShowShadow = data["Dont Show Shadow"] === "true";
		this._getExicted = data["Get Excited"] === "true";
		this._refreshText = data["Constant Text Refresh"] === "true";

		this._isFloat = data["Float"] === "true";
		this._floatMin = data["Float Min"] ? parseInt(data["Float Min"]) : null;
		this._floatMax = data["Float Max"] ? parseInt(data["Float Max"]) : null;
		this._floatTimeRatio = data["Float Time Ratio"] ? parseFloat(data["Float Time Ratio"]) : null;

		const audioJsonText = data["Custom Audio JSON"];
		if(audioJsonText && !audioJsonText.trim().startsWith("{")) {
			this._customAudio = { name: audioJsonText, volume: 100, pitch: 100, pan: 0 };
		} else {
			this._customAudio = audioJsonText && audioJsonText.trim() ? JSON.parse(audioJsonText) : null;
		}

		this._textOffsetY = parseInt(data["Text Offset Y"]) || 0;

		if(this._textType === "roomDeaths") {
			this._dataText = data.text;
			this._text = data.text[$gameMap.RoomKillCount.clamp(0, data.text.length - 1)];
		} else if(this._textType === "eval") {
			if(this._refreshText) {
				this._textFunction = new Function("return (" + data.text.join("\n") + ");");
				this._textFunction = this._textFunction.bind(this);
				this._text = this._textFunction();
			} else {
				this._text = eval(data.text.join("\n"));
			}
		} else {
			this._text = data.text.join("\n");
		}
		this._shouldShowText = false;
		this._shouldShowTextTimer = 0;
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
		if(this._refreshText) {
			const newText = this._forcedText ?? this._textFunction();
			if(this._text !== newText) {
				this._text = newText;
				this._spr.Text.text = newText;
				if(this._shouldShowTextTimer === 0) {
					this._shouldShowText = false;
					this._spr._time = 0;
				}
				this._spr.update();
				this._spr.updateTextHolder();
			}
		}
		if(this._shouldShowTextTimer > 0) {
			this._shouldShowTextTimer--;
			this._shouldShowText = true;
		} else {
			const prev = this._shouldShowText;
			this._shouldShowText = this._forcingText ? true : (
				$gameMap._isTranferring ? false : (
					this.getDistance($espGamePlayer) < (this._shouldShowText ? this._untriggerDist : this._triggerDist)
				)
			);
			if(!prev && this._shouldShowText) {
				if(!this._forcingText && this._forcedText) {
					this._forcedText = null;
					this.update();
					return;
				}
			}
		}

		if(this._isFloat) {
			this.position.z = this._floatMin + (Math.sin(ESP.Time * this._floatTimeRatio) * (this._floatMax - this._floatMin));
		}
	}

	forceText(text) {
		this._forcingText = true;
		this._forcedText = text;
	}

	clearForcedText() {
		this._forcingText = false;
	}

	shouldShowText() {
		return this._shouldShowText;
	}

	showTextForABit(time) {
		this._shouldShowTextTimer = time;
	}
}

Game_Map.presetObjects[0] = ESPInfoBeetleObject;
