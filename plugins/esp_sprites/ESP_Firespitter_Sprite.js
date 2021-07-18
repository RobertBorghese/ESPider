// We gonna shoot da FIRE

class ESPFirespitterSprite extends ESPGameSprite {
	constructor(object, lookLeft, dontAddSpitterSprite) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._lookLeft = lookLeft;

		this._bug = new Sprite();
		this.ObjectHolder.addChild(this._bug);

		if(!dontAddSpitterSprite) {
			this._spitterSprite = new ESPAnimatedSprite("img/enemies/Firespitter.png", 10);
			this._spitterSprite.scale.set(2 * (lookLeft ? -1 : 1), 2);
			this._spitterSprite.anchor.set(0.5, 1);
			this._bug.addChild(this._spitterSprite);
		}

		this._isDefeating = 0;
		this._defeatTime = 0;
		this._defeatingFlySpeed = 0;
	}

	update() {
		super.update();
		this.updateVisibility();
		this.updateAnimation();

		if(this._isDefeating === 0) {
			if(this.espObject._isDefeated) {
				this._defeatingFlySpeed = 10;
				this._isDefeating = 1;
			}
		} else if(this._isDefeating === 1) {
			this._defeatTime += 2.5;
			if(this._defeatTime > 100) this._defeatTime = 100;
			this._bug.rotation = (this._defeatTime / 100) * 7;
			const scaleRatio = (this._defeatTime < 60 ? 1 : 1 - ((this._defeatTime - 60) / 40));
			this._bug.scale.set(1 * (this._lookLeft ? -1 : 1) * scaleRatio, 1 * scaleRatio);
			this.espObject.updateConsumeAnimation(this._defeatingFlySpeed);
			this._defeatingFlySpeed -= 0.45;
			if(this._defeatTime === 100) {
				this._bug.scale.set(0);
				this.espObject.kill();
				this._isDefeating = 2;
			}
		}
	}

	updateAnimation() {
		this._spitterSprite.FrameDelay = this.espObject._fastAnimation ? 4 : 10;
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(this._bug.scale.x * (((500 - this.espObject.position.z).clamp(0, 500) / 500) + ((this._spitterSprite.Index === 0 ? 1 : 0) * 0.1)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	updateVisibility() {
		if(!this.espObject._isDefeated) {
			this.visible = $gameMap.inCamera(this.x - 100, this.x + 100, this.y - 100, this.y + 100);
		}
	}
}