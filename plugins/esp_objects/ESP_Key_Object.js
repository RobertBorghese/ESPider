// Puzzles and muzzles are good for wuzzles.

/*:
 * @command Key
 * @text Options for key.
 * @desc
 */

class ESPKeyObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._isTouched = false;
	}

	condition() {
		return true;//!$espGamePlayer.hasFlyBeenEaten(this.makeId());
	}

	constructSprite() {
		return new ESPKeySprite(this);
	}

	update() {
		super.update();
		this.updatePlayerTouch();
	}

	updatePlayerTouch() {
		const size = 20;
		if(!this._isTouched && this.getDistance($espGamePlayer) < size) {
			//this.consumeFly();
			SceneManager._scene._spriteset.shake();
			this._isTouched = true;
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}
}

Game_Map.presetObjects[6] = ESPKeyObject;
