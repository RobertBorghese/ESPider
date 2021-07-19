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

	update() {
		const oldX = this.position.x;
		const oldY = this.position.y;
		super.update();
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

	shoot(spdX, spdY, power) {
		if(!this._shooting && this._visible) {
			this._shooting = true;
			this._power = power;
			this._existTime = ((5 + power) * this._inc);
			this.speed.x = spdX;
			this.speed.y = spdY;
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
