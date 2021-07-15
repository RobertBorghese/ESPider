// ESPTriggerBugSprite
//ESPTriggerBugSprite
//SPTriggerBugSprite

class ESPTriggerBugSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -16;

		this._bug = new ESPAnimatedSprite("img/other/TriggerBug.png", 5);
		this._bug.scale.set(2);
		this._bug.anchor.set(0.5);
		this.ObjectHolder.addChild(this._bug);

		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;
	}

	update() {
		super.update();

		if(this._isTouching === 0) {
			if(this.espObject._isTouched) {
				this._touchFlySpeed = 10;
				this._isTouching = 1;
			}
		} else if(this._isTouching === 1) {
			this._bug.y = 0;
			this._touchTime += 2;
			this._bug.rotation = (this._touchTime / 100) * 4;
			this._bug.scale.set(2 * (this._touchTime < 80 ? 1 : 1 - ((this._touchTime - 80) / 20)));
			this.espObject.updateConsumeAnimation(this._touchFlySpeed);
			this._touchFlySpeed -= 0.45;
			if(this._touchTime === 100) {
				this.espObject.execute();
				this.espObject.delete();
				this._isTouching = 2;
			}
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(this._bug.Index >= 4 && this._bug.Index <= 7 ? 2 : (this._bug.Index >= 12 && this._bug.Index <= 15 ? -2 : 0), 0);
		this.ShadowSprite.scale.set((this._bug.scale.x / 2) * ((400 - this.espObject.position.z) / 400.0).clamp(0.3, 1));// + (((this._bug.y) + 3) * 0.02));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}
