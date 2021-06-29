// Particles. What a nightmare.

class ESPParticleObject extends ESPGameObject {
	constructor(xSpd, ySpd, animationSpeed) {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(xSpd, ySpd, 0);
		this._animationSpeed = animationSpeed;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPParticleSprite(this, this._animationSpeed);
		}
		return this._spr;
	}

	update() {
		super.update();
	}

	onCollided(direction) {
		this._spr.ShouldUpdate = false;
		$gameMap.removeGameObject(this);
	}

	isComplete() {
		return !this._spr.ShouldUpdate;
	}
}
