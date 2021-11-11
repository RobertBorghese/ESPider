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

	getObjectHolderOffsetY() {
		return -16;
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

			if(this._groundedStyle === 0 || (!this._desiredZ && this._groundedStyle === 3)) {
				if(this.position.z > ESP.StandardFireballHeight) {
					this.speed.z = -1;
				} else {
					if(this._groundedStyle === 3) {
						this._desiredZ = this.realZ();
					}
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
			} else if(this._groundedStyle === 3) {
				this.speed.z = 0;
			}
		}

		if(!this._isDead) {
			this.updateInteractions();
		}
	}

	updateInteractions() {
		const playerDistance = this.getDistance($espGamePlayer);
		if(playerDistance <= this._collisionSize) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / this._collisionSize;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / this._collisionSize;
			$espGamePlayer.kill(true, spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}

		if($gameMapTemp._slugBoss) {
			$gameMapTemp._slugBoss.checkFireball(this);
		}

		{
			const spears = $gameMap.findObjectGroup("spearwall");
			if(spears.length > 0) {
				const len = spears.length;
				let touched = false;
				for(let i = 0; i < len; i++) {
					if(spears[i].isTouching(this)) {
						touched = true;
						break;
					}
				}
				if(touched) {
					this.onCollided();
				}
			}
		}

		{
			const triggerBugs = $gameMap.findObjectGroup("triggerbug");
			if(triggerBugs.length > 0) {
				const len = triggerBugs.length;
				for(let i = 0; i < len; i++) {
					const bug = triggerBugs[i];
					if(!bug._isTouched && this.getDistance(bug) <= this._collisionSize) {
						bug.hitWithFire();
					}
				}
			}
		}

		this.updateTeamInteractions();

		if(this.canConnect()) {
			{
				const webDevices = $gameMap.findObjectGroup("webdevice");
				if(webDevices.length > 0) {
					const len = webDevices.length;
					for(let i = 0; i < len; i++) {
						const s = webDevices[i];
						if(s.isOpen() && !s.isConnectedTo(this) && this.getDistance(s) <= 200) {
							s.connect(this);
						}
					}
				}
			}

			if($espGamePlayer.IsGrappling) {
				if(!$espGamePlayer.isConnectedTo(this) && playerDistance <= 200) {
					$espGamePlayer.connect(this);
				}
			}
		}
	}

	updateTeamInteractions() {
		{
			const icemakers = $gameMap.findObjectGroup("icemaker");
			if(icemakers.length > 0) {
				const len = icemakers.length;
				for(let i = 0; i < len; i++) {
					if(!icemakers[i]._isDefeated && this.getDistance(icemakers[i]) < this._collisionSize) {
						icemakers[i].defeat();
					}
				}
			}
		}

		if(this.canConnect()) {
			const firespitters = $gameMap.findObjectGroup("firespitter");
			if(firespitters.length > 0) {
				const len = firespitters.length;
				for(let i = 0; i < len; i++) {
					if(this._owner !== firespitters[i] && firespitters[i].canBounce() && this.getDistance(firespitters[i]) < this._collisionSize) {
						firespitters[i].bounce();
					}
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

	setOwner(owner) {
		this._owner = owner;
	}
}
