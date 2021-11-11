// Didnt think i was gonna do enemies, but here we goooooo

class ESPSlugObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(2, 0, 0);

		this._mode = 0;
		this._frameDelay = 6;
		this._actionTime = 0;
		this._lastIdleAction = 0;

		this._cooldown = 0;

		this.CantWalkOffLedge = true;
	}

	constructSprite() {
		return new ESPSlugSprite(this);
	}

	saveIndividual() {
		return true;
	}

	update() {
		super.update();

		this._currentlyOnIce = this.findSlide();

		if(this._mode === 0) {
			this.redoIdleMotion();

			if(this._cooldown <= 0) {
				if(this.getDistance2d($espGamePlayer) < 200) {
					this.speed.x = this.speed.y = 0;
					this._mode = 1;
					this._actionTime = 40;
					ESPAudio.snailDashStart();
				}
			} else {
				this._cooldown--;
			}
		} else if(this._mode === 1) {
			this._actionTime--;
			if(this._actionTime <= 0) {
				const radians = Math.atan2(this.position.x - $espGamePlayer.position.x, this.position.y - $espGamePlayer.position.y);
				this.speed.x = Math.sin(radians) * -8 * (this._currentlyOnIce ? 1.3 : 1);
				this.speed.y = Math.cos(radians) * -8 * (this._currentlyOnIce ? 1.3 : 1);
				this._mode = 2;
				this._actionTime = (this._currentlyOnIce ? 9999 : 40);
				ESPAudio.snailDashCharge();
			}
		} else if(this._mode === 2) {
			this._actionTime--;
			if(this._actionTime <= 0 || (this._currentlyOnIce && Math.abs(this.speed.x) < 1 && Math.abs(this.speed.y) < 1)) {
				this.resetToDefaultMode();
			}
		}

		this.updatePlayerKill();
	}

	resetToDefaultMode() {
		this._mode = 0;
		this.speed.x = 0;
		this.speed.y = 0;
		this._actionTime = 0;
		this._cooldown = 200;
	}

	redoIdleMotion(forceStill) {
		if(this._actionTime <= 0) {
			if(!forceStill && (this._lastIdleAction === 0 || Math.random() < 0.5)) {
				this._lastIdleAction = 1;
				this.speed.x = (Math.random()) - 0.5;
				this.speed.y = (Math.random()) - 0.5;
			} else {
				this._lastIdleAction = 0;
				this.speed.x = this.speed.y = 0;
			}
			this._actionTime = 100 + (Math.random() * 300);
		} else {
			this._actionTime--;
		}
	}

	updatePlayerKill() {
		const size = 20;
		if(this.getDistance($espGamePlayer) < size) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(true, spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}

	onCollided(direction) {
		if(this._mode === 0) {
			this.redoIdleMotion();
		} else if(this._mode === 2) {
			/*this.resetToDefaultMode();
			this.redoIdleMotion(true);*/
			if(direction === 8 || direction === 2) {
				this.speed.y = this.speed.y * (this._currentlyOnIce ? -0.9 : -0.5);
			} else if(direction === 6 || direction === 4) {
				this.speed.x = this.speed.x * (this._currentlyOnIce ? -0.9 : -0.5);
			}
		}
	}

	direction() {
		return this._mode === 1 ? (this.position.x < $espGamePlayer.position.x ? -1 : 1) : (this.speed.x > 0 ? -1 : 1);
	}

	frameDelay() {
		return this._frameDelay;
	}

	mode() {
		return this._mode;
	}

	shadowify() {
		return true;
	}
}

Game_Map.presetObjects[1] = ESPSlugObject;
