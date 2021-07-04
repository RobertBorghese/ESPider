// Fun little challenge for the players!

/*:
 * @command Fly
 * @text Options for fly.
 * @desc
 *
 * @arg Unqiue Map ID
 * @desc If there are multiple flies on the same map, they need unique ids. 0, 1, 2, etc.
 * @type number
 * @default 0
 */

class ESPFlyObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._uniqueMapId = data ? (parseInt(data["Unqiue Map ID"]) || 0) : 0;

		this._isConsumed = false;
	}

	condition() {
		return !$espGamePlayer.hasFlyBeenEaten(this.makeId());
	}

	makeId() {
		return ($gameMap.mapId() * 100) + this._uniqueMapId;
	}

	constructSprite() {
		return new ESPFlySprite(this);
	}

	update() {
		super.update();
		this.updatePlayerTouch();
	}

	updatePlayerTouch() {
		const size = 20;
		if(!this._isConsumed && this.getDistance($espGamePlayer) < size) {
			this.consumeFly();
			this._isConsumed = true;
		}
	}

	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	consumeFly() {
		if(!this._isConsumed) {
			$espGamePlayer.incrementFlies(this.makeId());
			this.CanCollide = false;
			SceneManager._scene._spriteset.shake();
		}
	}
}

Game_Map.presetObjects[5] = ESPFlyObject;
