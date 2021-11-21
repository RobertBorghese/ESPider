// all my jackets dont have buttons anymore cause some fucking guy keeps coming into my apartment at 2am and ripping them off. he keeps coming even though i dont wear anything with buttons anymore. this sounds like a joke but it's genuinely terrifying im actually crying as i write this idk maybe theres just something wrong with me cause no one else seems to understand that he exists please help me if youre reading this. message me, dm me, reach out and send your regards. trust me, i will appreciate it more than you can imagine.

ESP.makeButtons = function(pixiObject, width, height, shiftX, shiftY, offsetX, offsetY, data, color1, color2, color3, color4, onMouseEnter, enabledFunc) {
	const x = (Graphics.width / 2) + shiftX;
	const y = (Graphics.height / 2) + shiftY;

	const result = [];

	const makeButton = function(i, text, callback, soundType) {
		const button = new ESPButton(width, height, text, color1, color2, color3, color4, callback, soundType);
		button.move(x + (offsetX * i), y + (offsetY * i));
		button.onMouseEnter = onMouseEnter.bind(pixiObject, i, button);
		button.setEnabled(enabledFunc(i));
		result.push(button);
		pixiObject.addChild(button);
	};

	for(let i = 0; i < data.length; i++) {
		makeButton(i, data[i][0], data[i][1], data[i][2] ?? 0);
	}

	return result;
};

Array.prototype.disableAllButtons = function() {
	const len = this.length;
	for(let i = 0; i < len; i++) {
		this[i].setFrozen(true);
	}
};

Array.prototype.enableAllButtons = function() {
	const len = this.length;
	for(let i = 0; i < len; i++) {
		this[i].setFrozen(false);
	}
};

class ESPButton extends Sprite_Clickable {
	constructor(width, height, text, colorNormal, colorHover, colorClickFlash, colorUnderline, callback, soundType) {
		super();

		this.bitmap = new Bitmap(width, height);

		this.filters = [ new PIXI.filters.AlphaFilter() ];

		this.anchor.set(0.5);

		this._isFrozen = false;

		this._maxLetterSpacing = 8;

		this._soundType = soundType;

		this._colorNormal = colorNormal ?? 0xd4336b;
		this._colorHover = colorHover ?? 0xa12751;
		this._colorClickFlash = colorClickFlash ?? 0xbd2d5f;
		this._colorUnderline = colorUnderline ?? 0xfca9c6;

		this._callback = callback;

		this.__espWidth = width;
		this.__espHeight = height;
		this.__espOffset = 6;

		this._state = 0;
		this._enabled = true;
		this._espHovered = false;

		const offset = this.__espOffset;

		this._graphicsHolder = new Sprite();
		this._graphicsHolder.x = width / -2;
		this._graphicsHolder.y = height / -2;
		this.addChild(this._graphicsHolder);

		this._graphicsBack = new PIXI.Graphics();
		this.updateLineBackground();
		this._graphicsHolder.addChild(this._graphicsBack);

		this._style = {
			fontFamily: "title-font",//$gameSystem.mainFontFace(),
			fontSize: 36,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.5)",
			strokeThickness: 4
		};
		this._text = new PIXI.Text(text ?? "New Game", this._style);
		this._text.resolution = 2;
		this._text.y = -4//4;
		this._text.scale.set(1);

		this._graphicsFront = new PIXI.Graphics();
		this.updateGraphics();		
		this._graphicsHolder.addChild(this._graphicsFront);

		this._graphicsFront.addChild(this._text);

		this._espClicked = false;
		this._espClickTime = 0;
	}

	onMouseEnter() {
	}

	onMouseExit() {
	}

	setEnabled(enabled) {
		if(this._enabled !== enabled) {
			this._enabled = enabled;
			this.alpha = enabled ? 1 : 0.5;
		}
	}

	hover(noSound) {
		if(!this._espClicked) {
			if(!noSound && !this._espHovered) {
				ESPAudio.menuButtonSwitch();
			}
			this._espHovered = true;
			this.updateLineBackground();
			this._graphicsFront.x = this._graphicsFront.y = 2;
		}
	}

	unhover() {
		this._espHovered = false;
		this.updateLineBackground();
		if(!this._espClicked) this._graphicsFront.x = this._graphicsFront.y = 0;
	}

	updateLineBackground() {
		const offset = this.__espOffset;
		const width = this.__espWidth;
		const height = this.__espHeight;
		this._graphicsBack.clear();
		this._graphicsBack.beginFill(this._espHovered ? this._colorUnderline : this._colorNormal);
		this._graphicsBack.drawRect(offset, height - offset, 2, offset - 2);
		this._graphicsBack.drawRect(offset + 2, height - 2, width - offset - 4, 2);
		this._graphicsBack.drawRect(width - 2, offset + 2, 2, height - offset - 4);
		this._graphicsBack.drawRect(width - offset, offset, offset - 2, 2);
		this._graphicsBack.endFill();
	}

	updateGraphics() {
		const easing = (this._espHovered ? Easing.easeOutCubic : Easing.easeInOutCubic);
		const ratio = easing(this._espClicked ? 1 : this._state.clamp(0, 1)).clamp(0, 1);
		const offset = this.__espOffset;
		this._graphicsFront.clear();
		this._graphicsFront.beginFill(this._espClicked ? (this._espClickTime >= 5 ? this._colorClickFlash : this._colorHover) : this._colorNormal);
		this._graphicsFront.drawRect(2, 2, this.__espWidth - offset - 4, this.__espHeight - offset - 4);
		this._graphicsFront.endFill();
		const ww = (this.__espWidth - offset - 4) * ratio;
		const x = ((this.__espWidth - ww) / 2) - (offset / 2);
		const x2 = x + ww;
		if(!this._espClicked && ratio > 0) {
			this._graphicsFront.beginFill(this._colorHover);
			this._graphicsFront.drawRect(x, 2, ww, this.__espHeight - offset - 4);
			this._graphicsFront.endFill();
		}

		// underline
		//if(ratio > 0) {
		//	this._graphicsFront.beginFill(this._colorUnderline);
		//	const ww2 = (this.__espWidth - offset) * ratio;
		//	this._graphicsFront.drawRect(((this.__espWidth - ww2) / 2) - (offset / 2), this.__espHeight - offset - 2, ww2, 2);
		//	this._graphicsFront.drawRect(((this.__espWidth - ww2) / 2) - (offset / 2), 0, ww2, 2);
		//	this._graphicsFront.drawRect(x, 0, 2, this.__espHeight - offset);
		//	this._graphicsFront.drawRect(x2 - 2, 0, 2, this.__espHeight - offset);
		//	this._graphicsFront.endFill();
		//}

		if(this._style) {
			this._text.x = (this.__espWidth - this._text.width) / 2;
			// letter spacing
			//this._style.letterSpacing = ratio < 0.001 ? 1 : (this._maxLetterSpacing * ratio) + 1;
			this._text.style = this._style;
		}
	}

	onPress() {
		if(this._enabled) {
			this._graphicsFront.x = this._graphicsFront.y = 4;
		}
	}

	onClick() {
		if(this._enabled) {
			if(!this._espClicked) {
				switch(this._soundType) {
					case 0: { ESPAudio.menuButtonClick(); break; }
					case 1: { ESPAudio.menuButtonClickSpecial(); break; }
					case 2: { break; }
				}
			}
			this._espClicked = false;
			this.hover();
			this._espClicked = true;
			if(this._callback) this._callback();
		}
	}

	unclick() {
		this._espClicked = false;
		this._espClickTime = 0;
	}

	update() {
		if(!this._isFrozen) {
			super.update();
		}
		if(!this._espClicked) {
			const spd = 0.05;
			if(this._espHovered) {
				if(this._state < 1) {
					this._state += spd;
					if(this._state >= 1) this._state = 1;
					this.updateGraphics();
				}
			} else {
				if(this._state > 0) {
					this._state -= spd;
					if(this._state <= 0) this._state = 0;
					this.updateGraphics();
				}
			}
		} else {
			this._espClickTime++;
			if(this._espClickTime > 10) {
				this._espClickTime = 0;
			}
			this.updateGraphics();
		}

		if(!this._isFrozen && this._espHovered) {
			if(!this._pressedKey) { 
				const choices = ["ok", "space", "button_a"];
				for(let i = 0; i < choices.length; i++) {
					if(Input.isTriggered(choices[i])) {
						this._pressedKey = choices[i];
						this.onPress();
						break;
					}
				}
			} else if(!Input.isPressed(this._pressedKey)) {
				this._pressedKey = null;
				this.onClick();
			}
		} else {
			this._pressedKey = null;
		}
	}

	setFrozen(frozen) {
		this._isFrozen = frozen;
	}
}
