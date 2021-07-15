// All right, time for the first non-player object!!

ESP.StandardFireballHeight = 10;

class ESPFireballObject extends ESPGameObject {
	constructor(initAnimation, grounedStyle) {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(0, 0, 0);

		this._time = 0;

		this._collisionSize = this.getCollisionSize();

		this._initAnimation = !!initAnimation;
		this._isInitializing = this._initAnimation;
		this._groundedStyle = grounedStyle;
		this._onGroundShift = false;

		this._isDead = false;

		if(!this._initAnimation) {
			this.playShotAudio();
		}
	}

	constructSprite() {
		return new ESPFireballSprite(this, this._initAnimation);
	}

	isSelfMoved() {
		return true;
	}

	attachOffsetY() {
		return -30;
	}

	willEncounterMovingPlatform() {
		return $gameMapTemp._mapGroupReferences && $gameMapTemp._mapGroupReferences["box"] && $gameMapTemp._mapGroupReferences["box"].length > 0;
	}

	getCollisionSize() {
		return 26;
	}

	update() {
		if(!this._isInitializing) {
			super.update();

			if(this._groundedStyle === 0) {
				if(this.position.z > ESP.StandardFireballHeight) {
					this.speed.z = -1;
				} else {
					this.speed.z = 0;
				}
			} else if(this._groundedStyle === 1) {
				if(!this._onGroundShift) {
					if(this.speed.z < 0.02) this.speed.z = 0.02;
					this.speed.z += (0.1) * Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
				} else if(this.position.z > ESP.StandardFireballHeight) {
					this.speed.z -= 0.5;
				} else {
					this.speed.z = 0;
					if(this.position.z < ESP.StandardFireballHeight) {
						this.speed.z += 0.01;
						if(this.position.z >= ESP.StandardFireballHeight) {
							this.speed.z = 0;
							this.position.z = ESP.StandardFireballHeight;
						}
					}
				}
			}
		}

		const playerDistance = this.getDistance($espGamePlayer);
		if(playerDistance <= this._collisionSize) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / this._collisionSize;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / this._collisionSize;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}

		if($gameMap.findObjectGroup("spearwall").filter((s) => s.isTouching(this)).length > 0) {
			this.onCollided();
		}

		$gameMap.findObjectGroup("triggerbug").filter((s) => !s._isTouched && this.getDistance(s) <= this._collisionSize).forEach(function(s) {
			s.hitWithFire();
		});

		if(this.canConnect()) {
			$gameMap.findObjectGroup("webdevice").filter((s) => (s.isOpen() && !s.isConnectedTo(this) && this.getDistance(s) <= 200)).forEach(s => s.connect(this));

			if($espGamePlayer.IsGrappling) {
				if(!$espGamePlayer.isConnectedTo(this) && playerDistance <= 200) {
					$espGamePlayer.connect(this);
				}
			}
		}
	}

	canConnect() {
		return !this._isInitializing && !this._isDead;
	}

	onCollisionHeightChange(oldHeight) {
		if(!this._onGroundShift) {
			if(this._groundedStyle === 1) {
				this.position.z += 0.01;
			}
			this._onGroundShift = true;
		}
	}

	playShotAudio() {
		ESPAudio.fireballShot(this.getObjectVolume());
	}

	finishInitializing() {
		this.playShotAudio();
		this._isInitializing = false;
	}

	onCollided(direction) {
		if(!this._isDead) {
			this._isDead = true;
			this.speed.set(0, 0, 0);
		}
	}

	kill() {
		$gameMap.removeGameObject(this);
	}
}
