// And, of course, a correlating first game sprite.

class ESPAbilityGainSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;
		this.Time = 0;
		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;

		this._core = new Sprite(ImageManager.loadBitmapFromUrl("img/other/WebDeviceCore.png"));
		this._core.anchor.set(0.5);
		this._core.scale.set(2);
		this._core.alpha = 1;
		this._core.y = -6 + (this._core.height / -2);
		this._filter = new PIXI.filters.GlowFilter({
			
		});
		this._core.filters = [this._filter];
		this.ObjectHolder.addChild(this._core);
	}

	update() {
		super.update();

		if(this._isTouching === 0) {
			this.Time += (0.1 * ESP.WS);
			this._core.y = -6 + (this._core.height / -2) + (Math.sin(this.Time) * 1.5);
			this._filter.outerStrength = 4 + (Math.sin(this.Time * 0.7) * 2);
			if(this.espObject._touched) {
				this._touchFlySpeed = 10;
				this._isTouching = 1;
			}
		} else if(this._isTouching === 1) {
			this._core.y = -6;
			this._touchTime += 2;
			this._core.rotation = (this._touchTime / 100) * 4;
			this._core.scale.set(2 * (this._touchTime < 80 ? 1 : 1 - ((this._touchTime - 80) / 20)));
			this.espObject.updateConsumeAnimation(this._touchFlySpeed);
			this._touchFlySpeed -= 0.45;
			if(this._touchTime === 100) {
				this.espObject.execute();
				this._isTouching = 2;
			}
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(0.5 * ((Math.abs(this._core.y)) * 0.05));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}