// All right, time for the first non-player object!!

ESP.StandardFireballHeight = 20;

class ESPFireballObject extends ESPGameObject {
	constructor(initAnimation, grounedStyle) {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(0, 0, 0);

		//this._particles = [];
		this._time = 0;

		this._initAnimation = !!initAnimation;
		this._isInitializing = this._initAnimation;
		this._groundedStyle = grounedStyle;
		this._onGroundShift = false;

		this._isDead = false;
	}

	constructSprite() {
		return new ESPFireballSprite(this, this._initAnimation);
	}

	update() {
		if(!this._isInitializing) {
			super.update();

			if(this._groundedStyle === 0) {
				if(this.position.z > 10) {
					this.speed.z = -1;
				} else {
					this.speed.z = 0;
				}
			} else if(this._groundedStyle === 1) {
				if(!this._onGroundShift) {
					///this.position.z += 0.01;
					if(this.speed.z < 0.2) this.speed.z = 0.2;
					this.speed.z += 0.2;
				} else if(this.position.z > ESP.StandardFireballHeight) {
					this.speed.z -= 0.5;
				} else {
					this.speed.z = 0;
					if(this.position.z < ESP.StandardFireballHeight) {
						this.speed.z += 0.01;
						if(this.position.z >= ESP.StandardFireballHeight) this.position.z = ESP.StandardFireballHeight;
					}
				}
			}
		}

		const size = 26;
		if(this.getDistance($espGamePlayer) <= size) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}

		if($gameMap.findObjectGroup("spearwall").filter((s) => s.isTouching(this)).length > 0) {
			this.onCollided();
		}

		$gameMap.findObjectGroup("triggerbug").filter((s) => !s._isTouched && this.getDistance(s) <= size).forEach(function(s) {
			s.hitWithFire();
		});

		if(!this._isInitializing) {
			$gameMap.findObjectGroup("webdevice").filter((s) => s.isOpen() && !s.isConnectedTo(this) && this.getDistance(s) <= 200).forEach(s => s.connect(this));
		}

		//webdevice
	}

	onCollisionHeightChange(oldHeight) {
		if(!this._onGroundShift) {
			if(this._groundedStyle === 1) {
				this.position.z += 0.01;
			}
			this._onGroundShift = true;
		}
	}

	finishInitializing() {
		this._isInitializing = false;
	}

	onCollided(direction) {
		if(!this._isDead) {
			this._isDead = true;
			this.speed.set(0, 0, 0);
		}
		/*
		if(direction === 4 || direction === 6) {
			this.speed.x *= -1;
		} else {
			this.speed.y *= -1;
		}*/
	}

	kill() {
		$gameMap.removeGameObject(this);
	}
}
