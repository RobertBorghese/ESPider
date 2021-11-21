// NO TIME FOR DESCRIPTION GOTTA CODE GOTTTA CODE

class ESPWebShotObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(0, 0, 0);
		
		this._shooting = false;
		this._power = 0;
		this._existTime = 0;
		this._inc = 5;
		this._visible = true;
		this._downMode = false;
		this._deltaX = 0;
		this._deltaY = 0;
		this.alpha = 1;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPWebShotSprite(this);
		}
		return this._spr;
	}

	string() {
		return this._spr._dashChargeString;
	}

	willEncounterMovingPlatform() {
		return $gameMapTemp._mapGroupReferences && $gameMapTemp._mapGroupReferences["box"] && $gameMapTemp._mapGroupReferences["box"].length > 0;
	}

	lerp(a, b, i) {
		if(Math.abs((b - a)) < 1) return b;
		return a + ((b - a) * i);
	}

	setTargetMode(x, y, z) {
		this._isTargetting = true;
		this._target = [ x, y, z + 20 ];
	}

	update() {
		const oldX = this.position.x;
		const oldY = this.position.y;
		super.update();
		if(this._isTargetting) {
			this.position.set(this.lerp(this.position.x, this._target[0], 0.2), this.lerp(this.position.y, this._target[1], 0.2), this.lerp(this.position.z, this._target[2], 0.2));
			if(this.position.x === this._target[0] && this.position.y === this._target[1] && this.position.z === this._target[2]) {
				if(this._spr._mainParticle.scale.x > 0.3) {
					//this._spr.alpha -= 0.2;
					this._spr._mainParticle.scale.set((this._spr._mainParticle.scale.x * 0.8).clamp(0, 99));
				} else {
					$gameMap.removeGameObject(this);
				}
			}
			return;
		}
		if(this._downMode) {
			//this._deltaX += this.position.x - oldX;
			//this._deltaY += this.position.y - oldY;
			//this._deltaZ -= 1;
			if(this.alpha > 0) {
				this.alpha -= 0.08;
				if(this.alpha <= 0) {
					$espGamePlayer.destroyDashObject();
				}
				this._spr.alpha = this.alpha;
			}
		}
		if(this._existTime > 0) {
			this._existTime--;
			const index = (7 - Math.floor(this._existTime / this._inc)) + 1;
			this._spr._mainParticle.setIndex(index);
			if(index >= 6) {
				this._spr._mainParticle.visible = false;
			}
			if(this._existTime <= 0) {
				$espGamePlayer.endDashShot();
			}
		}
	}

	addSpriteRotation(rot) {
		if(this._spr) this._spr._mainParticle.rotation += rot;
	}

	setVisible(vis) {
		this._visible = vis;
		this._spr.visible = vis;
	}

	shoot(spdX, spdY, power, ignoreBuffs = false) {
		if(!this._shooting && this._visible) {
			this._shooting = true;
			this._power = power;
			const r = ignoreBuffs ? 1 : $espGamePlayer.webShotDistanceRatio();
			this._existTime = Math.floor(((5 + power) * this._inc) * r);
			this.speed.x = spdX * r;
			this.speed.y = spdY * r;
		}
	}

	onCollided(direction) {
		if(Math.abs(this.speed.x) > 0.5 || Math.abs(this.speed.y) > 0.5) {
			this.speed.x /= 2;
			this.speed.y /= 2;
			super.update();
		} else {
			if(!this._downMode && this._shooting) {
				this._shooting = false;
				$espGamePlayer.connectTheDash(direction);
			}
		}
	}

	enterDownMode() {
		this._downMode = true;
		this.speed.x = this.speed.y = this.speed.z = 0;
	}
}
