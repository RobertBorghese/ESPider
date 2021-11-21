// Hopefully this isnt so painfullll.

class ESPParticleSprite extends ESPGameSprite {
	constructor(object, spd, deleteOnComplete) {
		super();

		this.espObject = object;

		this.DeleteOnComplete = deleteOnComplete;
		this.ShouldUpdate = true;

		this.ObjectHolderOffsetY = -8;

		this.Animation = new ESPAnimatedSprite("img/particles/" + (this.espObject._img ?? "Particle") + ".png", spd);
		this.Animation.await();
		this.Animation.scale.set(2);
		this.Animation.anchor.set(0.5);
		this.ObjectHolder.addChild(this.Animation);

		this.visible = false;
	}

	update() {
		super.update();

		if(this.espObject._spriteXOffset) {
			this.x += this.espObject._spriteXOffset;
		}

		if(this.espObject.tint) {
			this.Animation.tint = this.espObject.tint;
		}

		if(this.espObject._fadeOut) {
			const a = 1 - this.Animation.ratio();
			if(a <= 0.5) {
				this.alpha = Easing.easeInCubic(a / 0.5);
			}
		}

		this.visible = !this.espObject.lastResort || ((this.espObject.CollisionHeight - 1) <= $espGamePlayer.CollisionHeight);

		if(this.DeleteOnComplete)  {
			if(this.ShouldUpdate && this.Animation.isDone()) {
				$gameMap.removeGameObject(this.espObject);
				this.ShouldUpdate = false;
			}
		}
	}

	updateShadowSprite() {
		if(this.espObject.NoShadow) {
			this.ShadowSprite.visible = false;
		} else {
			this.ShadowSprite.move(0, 0);
			this.ShadowSprite.scale.set((1 - ((this.Animation.Index) / 9)) * 0.8);
			this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
		}
	}

	freezable() {
		return false;
	}
}