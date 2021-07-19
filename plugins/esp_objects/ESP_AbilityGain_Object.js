// The cool metroid thingy im doing

class ESPAbilityGainObject extends ESPGameObject {
	constructor(executeFunc) {
		super();

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);
		this._touched = false;

		this._executeFunc = executeFunc;
	}

	constructSprite() {
		return new ESPAbilityGainSprite(this);
	}

	update() {
		if(!this._touched) {
			if(this.position.z > 0) {
				this.speed.z -= 0.1;
				if(this.speed.z < -10) this.speed.z = -10;
			}
		}

		super.update();

		if(!this._touched) {
			if(this.position.z < 0) {
				this.speed.z = 0;
				this.position.z = 0;
			}
		}

		if(this.getDistance($espGamePlayer) <= 26 && !this._touched) {
			this._touched = true;

			ESPAudio.keyGet();
			$gameMap.shake();
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	execute() {
		if(this._executeFunc) this._executeFunc();
	}
}
