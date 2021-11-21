// Particles. What a nightmare.

class ESPParticleObject extends ESPGameObject {
	constructor(xSpd, ySpd, animationSpeed, deleteOnComplete = true, img = null, fadeOut = false) {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(xSpd, ySpd, 0);
		this._img = img;
		this._fadeOut = fadeOut;
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

		if(this._desiredCollisionHeight) {
			if(this._desiredCollisionHeight !== this.CollisionHeight) {
				this.CollisionHeight = this._desiredCollisionHeight;
				this._spr.visible = false;
				$gameMap.removeGameObject(this);
			}
		}
	}

	updateZPosition() {
		if(this._drop) {
			this.position.z -= 0.76;
			if(this.position.z < 0) {
				this.position.z = 0;
			}
		} else if(this._raise) {
			this.position.z += 0.35;
		}
		super.updateZPosition();
	}

	onCollided(direction) {
		if(this._deleteOnComplete) {
			$gameMap.removeGameObject(this);
			if(this._spr) this._spr.ShouldUpdate = false;
		}
	}

	isComplete() {
		return this._deleteOnComplete ? !this._spr.ShouldUpdate : this._spr.Animation.isDone();
	}
}
