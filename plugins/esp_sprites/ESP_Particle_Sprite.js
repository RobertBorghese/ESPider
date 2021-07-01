// Hopefully this isnt so painfullll.

class ESPParticleSprite extends ESPGameSprite {
	constructor(object, spd, deleteOnComplete) {
		super();

		this.espObject = object;

		this.DeleteOnComplete = deleteOnComplete;
		this.ShouldUpdate = true;

		this.ObjectHolderOffsetY = -8;

		this.Animation = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/particles/Particle.png"), spd);
		this.Animation.await();
		this.Animation.scale.set(2);
		this.Animation.anchor.set(0.5);
		this.ObjectHolder.addChild(this.Animation);
	}

	update() {
		super.update();

		if(this.DeleteOnComplete)  {
			if(this.ShouldUpdate && this.Animation.isDone()) {
				$gameMap.removeGameObject(this.espObject);
				this.ShouldUpdate = false;
			}
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set((1 - ((this.Animation.Index) / 9)) * 0.8);
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	freezable() {
		return false;
	}
}