// And, of course, a correlating first game sprite.

class ESPShieldSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;
		this.Time = 0;
		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;

		this._core = new ESPAnimatedSprite("img/other/Shield.png", 4);
		this._core.anchor.set(0.5);
		this._core.scale.set(2);
		this._core.alpha = 1;
		this._core.y = -6 + (this._core.height / -2);
		this.ObjectHolder.addChild(this._core);
	}

	update() {
		super.update();

		if(this._isTouching === 0) {
			this.Time += (0.1 * ESP.WS);
			this._core.y = -6 + (this._core.height / -2) + (Math.sin(this.Time / 2) * 4);
			if(this.espObject._touched) {
				this._touchFlySpeed = 10;
				this._isTouching = 1;
			}
		} else if(this._isTouching === 1) {
			this._core.y = -20;
			this._touchTime += 2;
			this._core.rotation = (this._touchTime / 100) * 4;
			this._core.scale.set(2 * (this._touchTime < 60 ? 1 : 1 - ((this._touchTime - 60) / 40)));
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
		this.ShadowSprite.scale.set(0.5 * ((Math.abs(this._core.y)) * 0.06));
		this.ShadowSprite.alpha = 0.5 + (2.4 - (this.ShadowSprite.scale.x * 2));
	}
}