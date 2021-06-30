// Info beetle, da display.

class ESPInfoBeetleSprite extends ESPGameSprite {
	constructor(object, text) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 10;//-8;

		this.Graphics = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/other/Beetle.png"), 20);
		this.Graphics.scale.set(2);
		this.Graphics.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this.Graphics);

		this.TextHolder = new Sprite();

		this.Text = new PIXI.Text(text, {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 20,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this.Text.anchor.set(0.5, 1);
		this.Text.resolution = 2;

		this.TextHolder._baseY = this.Text.height * -0.5;
		this.TextHolder.scale.set(0);
		this.TextHolder.addChild(this.Text);

		this.ObjectHolder.addChild(this.TextHolder);

		this._showingText = false;
		this._time = 0;
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
		}
	}

	updateTextHolder() {
		const ratio = (this._showingText ? Easing.easeOutBack : Easing.easeOutCubic)(this._time);
		this.TextHolder.scale.set(ratio);
		this.TextHolder.y = Math.round((this.TextHolder._baseY * ratio) - (this.Text.height));
	}

	updateShadowSprite() {
		this.ShadowSprite.move(this.Graphics.Index === 2 ? -2 : (this.Graphics.Index === 4 ? 2 : 0), 0);
		this.ShadowSprite.scale.set(0.9 + (this.Graphics.Index % 2 === 0 ? 0 : 0.1));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}