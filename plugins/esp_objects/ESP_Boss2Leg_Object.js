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
		return new ESPBoss2LegSprite(this, this._reversed);
	}

	update() {
		if(this._goUp !== 1) {
			if(this.position.z > 0) {
				this.speed.z -= 0.2;
				if(this.speed.z < -20) this.speed.z = -20;
			}
		} else {
			if(this.position.z < 500) {
				this.speed.z = 7;
			}
		}
		
		super.update();

		this._time += 0.01;
	}

	onGroundHit() {
		ESPAudio.boss2Footstomp(100);
		SceneManager._scene._spriteset.shake();
	}

	goUp() {
		this._goUp = 1;
	}

	goDown(pos) {
		this._goUp = 0;
		this.position.z = pos;
	}
}
