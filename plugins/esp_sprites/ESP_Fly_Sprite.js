// Gotta touch em all! GOTTA TOUCH EM ALL!! POKE-FLIESSSS

class ESPFlySprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -24;

		this._flyHolder = new Sprite();
		this.ObjectHolder.addChild(this._flyHolder);

		this._flyWingRight = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/other/FlyWing.png"), 1);
		this._flyWingRight.scale.set(2);
		this._flyWingRight.anchor.set(0.5);
		this._flyHolder.addChild(this._flyWingRight);

		this._flyWingLeft = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/other/FlyWing.png"), 1);
		this._flyWingLeft.scale.set(-2, 2);
		this._flyWingLeft.anchor.set(0.5);
		this._flyHolder.addChild(this._flyWingLeft);

		this._flyBody = new Sprite(ImageManager.loadBitmapFromUrl("img/other/FlyBody.png"));
		this._flyBody.scale.set(2);
		this._flyBody.anchor.set(0.5);
		this._flyHolder.addChild(this._flyBody);

		this.Time = 0;

		this._isConsuming = 0;
		this._consumeTime = 0;
		this._consumeFlySpeed = 0;
	}

	update() {
		super.update();

		if(this._isConsuming === 0) {
			this.Time += 0.1;
			this._flyHolder.y = Math.sin(this.Time) * 5;
			if(this.espObject._isConsumed) {
				this._consumeFlySpeed = 10;
				this._isConsuming = 1;
			}
		} else if(this._isConsuming === 1) {
			this._flyHolder.y = 0;
			this._consumeTime += 2;
			this._flyHolder.rotation = (this._consumeTime / 100) * 4;
			this._flyHolder.scale.set(this._consumeTime < 50 ? 1 : 1 - ((this._consumeTime - 50) / 50));
			this.espObject.updateConsumeAnimation(this._consumeFlySpeed);
			this._consumeFlySpeed -= 0.45;
			if(this._consumeTime === 100) {
				$espGamePlayer.showFlyCount();
				this.espObject.delete();
				this._isConsuming = 2;
			}
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(0.6 + (((this._flyHolder.y) + 5) * 0.01));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}