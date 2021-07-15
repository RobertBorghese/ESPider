// Gotta touch em all! GOTTA TOUCH EM ALL!! POKE-FLIESSSS

class ESPKeySprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 0;

		this._key = new Sprite(ImageManager.loadBitmapFromUrl("img/other/Key.png"));
		this._key.scale.set(2);
		this._key.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._key);

		this.Time = 0;

		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;
	}

	update() {
		super.update();

		if(this._isTouching === 0) {
			this.Time += 0.05;
			this._key.y = Math.sin(this.Time) * 7;
			if(this.espObject._isTouched) {
				this._touchFlySpeed = 10;
				this._isTouching = 1;
			}
		} else if(this._isTouching === 1) {
			this._key.y = 0;
			this._touchTime += 2;
			this._key.rotation = (this._touchTime / 100) * 4;
			this._key.scale.set(2 * (this._touchTime < 80 ? 1 : 1 - ((this._touchTime - 80) / 20)));
			this.espObject.updateConsumeAnimation(this._touchFlySpeed);
			this._touchFlySpeed -= 0.45;
			if(this._touchTime === 100) {
				if(!this.espObject._immediate) this.espObject.execute();
				this.espObject.delete();
				this._isTouching = 2;
			}
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set((this.espObject.position.z > 0 ? ((400 - this.espObject.position.z) / 400) : 1) * (0.7 + (((this._key.y) + 3) * 0.02)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}