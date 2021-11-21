// The cool metroid thingy im doing

class ESPShieldObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);
		this._touched = false;

		this._uniqueId = (ESPShieldObject.lastUniqueId++);
	}

	condition() {
		if(!super.condition()) {
			return false;
		}
		if(!$gameMap._enableIndividualShields) {
			return true;
		}
		return !$espGamePlayer.hasShieldBeenTaken($gameMap.mapId(), this._uniqueId);
	}

	constructSprite() {
		return new ESPShieldSprite(this);
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
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	execute() {
		$espGamePlayer.addTempShield($gameMap.mapId(), this._uniqueId);
		this.delete();
	}
}

Game_Map.presetObjects[28] = ESPShieldObject;
