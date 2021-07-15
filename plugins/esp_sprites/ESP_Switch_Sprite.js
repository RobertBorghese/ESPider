// Gotta touch em all! GOTTA TOUCH EM ALL!! POKE-FLIESSSS

class ESPSwitchSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._switch = new ESPAnimatedSprite(("img/other/Switch.png"), 0, {
			FrameCount: 13
		});
		this._switch.scale.set(2);
		this._switch.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._switch);

		this.Time = 0;

		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;

		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();

		if(this._isTouching === 0) {
			if(this.espObject._isTouched) {
				this._isTouching = 1;
				this._touchTime = 0;
			}
		} else if(this._isTouching === 1) {
			this._touchTime += 14;
			if(this._touchTime >= 100) {
				this._touchTime = 100;
				this._isTouching = 2;
			}
			this._switch.setIndex(Math.floor(12 * (this._touchTime / 100)));
		} else if(this._isTouching === 2) {
			if(!this.espObject._isTouched) {
				this._isTouching = 3;
				this._touchTime = 100;
			}
		} else if(this._isTouching === 3) {
			if(this.espObject._isTouched) {
				this._isTouching = 1;
			} else {
				this._touchTime -= 14;
				if(this._touchTime < 0) {
					this._touchTime = 0;
					this._isTouching = 0;
				}
				this._switch.setIndex(Math.floor(12 * (this._touchTime / 100)));
			}
		}
	}

	updateShadowSprite() {
		/*
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set((this.espObject.position.z > 0 ? ((400 - this.espObject.position.z) / 400) : 1) * (0.7 + (((this._key.y) + 3) * 0.02)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
		*/
	}
}