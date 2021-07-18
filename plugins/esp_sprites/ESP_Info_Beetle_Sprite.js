// Info beetle, da display.

class ESPInfoBeetleSprite extends ESPGameSprite {
	constructor(object, text, mirror) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = object._customImageOffsetY;//-8;

		this.Graphics = new ESPAnimatedSprite("img/other/" + (object._customImage ?? "Beetle") + ".png", object._customImageRate);
		this.Graphics.scale.set(mirror ? -2 : 2, 2);
		this.Graphics.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this.Graphics);

		this.TextHolder = new Sprite();

		this.Text = new PIXI.Text(text.replace(/(?:\[STH\]|\[WTH\])/, "          "), {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: object._textSize ?? 20,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this.Text.anchor.set(0.5, 1);
		this.Text.resolution = 2;

		if(text.includes("[STH]") || text.includes("[WTH]")) {
			const isWest = text.includes("[WTH]");
			const bit = ImageManager.loadBitmapFromUrl(isWest ? "img/other/WestButton.png" : "img/other/SouthButton.png");
			bit.smooth = true;
			this._button = new Sprite(bit);
			this._button.x = isWest ? 34 : 28;
			this._button.y = -10;
			this._button.scale.set(0.5);
			this._button.anchor.set(0.5);
			this.Text.addChild(this._button);
		}

		this.TextHolder._baseY = this.Text.height * -0.5;
		this.TextHolder.scale.set(0);
		this.TextHolder.addChild(this.Text);

		this._showingText = false;
		this._time = 0;

		if(object._dontShowShadow) {
			this.ShadowSprite.visible = false;
		}
	}

	update() {
		super.update();

		const showing = this.espObject.shouldShowText();

		if(showing) {
			if(this._time < 1) {
				this._time += 0.03;
				if(this._time >= 1) this._time = 1;
				this.updateTextHolder();
			}
		} else {
			if(this._time > 0) {
				this._time -= 0.03;
				if(this._time <= 0) this._time = 0;
				this.updateTextHolder();
			}
		}

		if(this._showingText !== showing) {
			this._showingText = showing;
			if(!this.TextHolder.parent && showing) {
				SceneManager._scene.addUiChild(this.TextHolder);
			}
			if(showing) {
				if(this.Text.style.fontSize < 20) {
					ESPAudio.whisper();
				} else {
					ESPAudio.talk();
				}
			}
		}
	}

	updateTextHolder() {
		const ratio = (this._showingText ? Easing.easeOutBack : Easing.easeOutCubic)(this._time);
		this.TextHolder.scale.set(ratio);
		this.TextHolder.x = this.x + this.ObjectHolder.x;
		this.TextHolder.y = this.y + this.ObjectHolder.y + Math.round((this.TextHolder._baseY * ratio) - (25) + this.espObject._textOffsetY);
	}

	updateShadowSprite() {
		let ScaleX = this.Graphics.Index % 2 === 0 ? 0 : 0.1;
		let OffsetX = this.Graphics.Index === 2 ? -2 : (this.Graphics.Index === 4 ? 2 : 0);
		if(this.espObject._customImage && this.espObject._customImage !== "Beetle") {
			OffsetX = 0;
			ScaleX = 0;
		}
		this.ShadowSprite.move(OffsetX, 0);
		this.ShadowSprite.scale.set(0.9 + ScaleX);
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	destroy(options) {
		if(this.TextHolder.parent) this.TextHolder.parent.removeChild(this.TextHolder);
		super.destroy(options);
	}
}