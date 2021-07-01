// Particles. What a nightmare.

class ESPParticleObject extends ESPGameObject {
	constructor(xSpd, ySpd, animationSpeed, deleteOnComplete = true) {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(xSpd, ySpd, 0);
		this._animationSpeed = animationSpeed;
		this._deleteOnComplete = deleteOnComplete;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPParticleSprite(this, this._animationSpeed, this._deleteOnComplete);
		}
		return this._spr;
	}

	update() {
		super.update();
	}

	onCollided(direction) {
		if(this._deleteOnComplete) {
			$gameMap.removeGameObject(this);
			this._spr.ShouldUpdate = false;
		}
	}

	isComplete() {
		return this._deleteOnComplete ? !this._spr.ShouldUpdate : this._spr.Animation.isDone();
	}
}
