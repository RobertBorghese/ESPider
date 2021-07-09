// time to drrrrrrrrraaaaaaaaaaaaaaaaaaaaawwwwwwwwwwwwwwwwwwwwwwwwwwwwwww

class ESPFallingPlatformSprite extends ESPMovingPlatformSprite {
	constructor(object, imageType, shadowWidth, shadowHeight, parent) {
		super(object, imageType, shadowWidth, shadowHeight, parent);

		this._platform.filters = [new PIXI.filters.MultiColorReplaceFilter(
			[
				[0x952f31, 0x2e8f5e],
				[0xc03f43, 0x3fbf7f],
				[0x682223, 0x226644],
				[0x4c1818, 0x17472f]
			]
		)];

		this._isDying = false;
		this._isDead = false;
	}

	updateOffset() {
		this.Time += 0.1;

		if(!this._espParent) {
			this._platform.x = 0;
			this._platform.y = Math.sin(this.Time) * 1;
			if(this.espObject.isBreaking()) {
				this._platform.x += (Math.random() * 4) - 2;
				this._platform.y += (Math.random() * 4) - 2;
			} else if(!this._isDying && this.espObject.isDying()) {
				this._deathTime = 12;
				this._isDying = true;
			} else if(this._isDying && !this._isDead) {
				if(this._deathTime > 0) {
					this._deathTime--;
					const r = 1 - (this._deathTime / 12);
					this.alpha = (1 - r);
					this.espObject.position.z -= 1;
					this.updatePosition();
					this.espObject.updateChildrenPositionZ();
					this._platform.setColorTone([255 * r, 255 * r, 255 * r, 255 * r]);
					if(this._deathTime <= 0) {
						this._isDead = true;
						$gameMap.removeGameObject(this.espObject);
					}
				}
			}
		} else {
			if(!this._espParent._spr._isDead) {
				this._platform.x = this._espParent._spr._platform.x;
				this._platform.y = this._espParent._spr._platform.y;
				this._platform.alpha = this._espParent._spr.alpha;
				this._platform.setColorTone(this._espParent._spr._platform._colorTone);
			} else {
				this._platform.alpha = 0;
			}
		}
	}

	updateShadowSprite() {
		if(this._hasShadow) {
			this.ShadowSprite.move((this._shadowWidth - 1) * (TS / 2), (this._shadowHeight - 1) * (TS / 2));
			const offset = ((this.espObject.position.z / TS) * 0.1) + (this._platform.y * 0.04);
			this.ShadowSprite.scale.set(2 * (this._shadowWidth) - offset, 2 * (this._shadowHeight) - offset);
			this.ShadowSprite.alpha = this.alpha * this.ShadowSprite.scale.x;
		}
	}
}
