// The cool metroid thingy im doing

class ESPAbilityGainObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);
		this._touched = false;
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
			SceneManager._scene._spriteset.shake();
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	execute() {
		const interpreter = new ESPInterpreter();

		interpreter
		.fadeOut()
		.callCode("ESPAudio.boss1Disappear()", this)
		.removeGameObject(this)
		.createInfoBug(20, 13, "Seems you've gained a new skill.", 120, 160, "InfoBug")
		.fadeIn()
		.wait(20)
		.moveCameraToGrid(15.5, 14)
		.closeSpearWall("Wall")
		.wait(3)
		.closeSpearWall("Wall2")
		.wait(3)
		.closeSpearWall("Wall3")
		.wait(3)
		.closeSpearWall("Wall4")
		.wait(3)
		.closeSpearWall("Wall5")
		.wait(3)
		.setVariable(1, 2) // enable web grab
		.save()
		.moveCameraToPlayer();

		$espGamePlayer.setInterpreter(interpreter);
	}
}
