// Making my life waaayyy easier just reusing this fireballlll :3

class ESPPoisonballObject extends ESPFireballObject {
	constructor(initAnimation, grounedStyle, isBig) {
		super(initAnimation, grounedStyle);
		this._isBig = !!isBig;
		this._didDamage = false;
		this._collisionSize = this.getCollisionSize();
	}

	constructSprite() {
		return new ESPPoisonballSprite(this, this._initAnimation, this._isBig);
	}

	getCollisionSize() {
		return (26 * 1.5) + (this._isBig ? 32 : 0);
	}

	getObjectHolderOffsetY() {
		return this._isBig ? 0 : -16;
	}

	playShotAudio() {
		if(this._isBig) {
			ESPAudio.boss2ShotBig();
		} else {
			ESPAudio.boss2Shot();
		}
	}

	finishInitializing() {
		super.finishInitializing();
		if(this._isBig) {
			const radians = Math.atan2(this.position.x - $espGamePlayer.position.x, this.position.y - $espGamePlayer.position.y);
			this.speed.x = (Math.sin(radians) * -6);
			this.speed.y = (Math.cos(radians) * -6);
		}
	}

	update() {
		super.update();

		if(!this._didDamage && this.speed.y < 0 && Math.abs(this.position.x - $gameMapTemp._boss2Face.x) < 170 && this.position.y < (9 * TS)) {
			this.onCollided();
			$gameMap.boss2TakeDamage();
			this._didDamage = true;
		}
	}
}
