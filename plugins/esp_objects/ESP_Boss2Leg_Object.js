// "This is where the fun begins."

class ESPBoss2LegObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.ObjectHolderOffsetY = 0;

		this.position.set(300, 350, 6);
		this.speed.set(0, 0, 0);

		this._reversed = !!data?.Reversed;
		this._time = 0;
		this._goUp = 0;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPBoss2LegSprite(this, this._reversed);
		}
		return this._spr;
	}

	update() {
		if(!this._isLeaving) {
			if(this._goUp !== 1) {
				if(this.position.z > 0) {
					this.speed.z -= this._superStomping ? 2 : (this._stomping ? 0.9 : 0.2);
					if(this.speed.z < -20) this.speed.z = -20;
				} else if(this._stomping) {
					this._stomping = false;
				} else if(this._superStomping) {
					this._superStomping = false;
				}
			} else {
				if(this.position.z < (this._superStomping ? 30 : (this._stomping ? 80 : 500))) {
					this.speed.z = (this._superStomping ? 30 : (this._stomping ? 14 : 7));
				} else if(this._stomping || this._superStomping) {
					this.goDown();
				}
			}
		}

		super.update();

		this._time += 0.01;
	}

	onGroundHit() {
		ESPAudio.boss2Footstomp(100);
		$gameMap.shake(100, 0.7, 1, 10);
		if(this._doCallback) {
			this._doCallback = false;
			$gameMap.onLegStomp();
		}
	}

	goUp() {
		this._goUp = 1;
	}

	goDown(pos, doCallback) {
		this._goUp = 0;
		if(pos) this.position.z = pos;
		this._doCallback = doCallback;
	}

	stomp() {
		this._stomping = true;
		this.goUp();
	}

	superStomp() {
		this._superStomping = true;
		this.goUp();
	}

	leave() {
		this._isLeaving = true;
		this.speed.set(0, 0, 10);
	}
}
