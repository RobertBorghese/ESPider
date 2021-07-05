
// Why dont you CHECK this code out? HEHEHEHE

/*:
 * @command Checkpoint
 * @text Options for checkpoint.
 * @desc
 *
 * @arg 2d Trigger Distance
 * @desc 
 * @type number
 * @default 30
 */

Game_Map.presetObjects[4] = class ESPCheckpointObject extends ESPGameObject {
	constructor(data, showAni) {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._triggerDistance = parseInt(data["2d Trigger Distance"]) || 30;

		this._shouldOpen = 0;
		this._isOpen = false;
	}

	constructSprite() {
		return new ESPCheckpointSprite(this);
	}

	saveGroup() {
		return "checkpoint";
	}

	update() {
		super.update();

		this.updatePlayerTouch();
	}

	genId() {
		return ($gameMap.mapId() * 10000) + (Math.floor(this.position.x / TS) + (Math.floor(this.position.y / TS) * $gameMap.width()));
	}

	close() {
		if(this._isOpen) {
			this._shouldOpen = 2;
			this._isOpen = false;
		}
	}

	updatePlayerTouch() {
		if(!this._isOpen) {
			const size = this._triggerDistance;
			const z = this.realZ();
			const playerZ = $espGamePlayer.realZ();
			if(this.getDistance($espGamePlayer) < size && $espGamePlayer.CollisionHeight === this.CollisionHeight && playerZ >= z && playerZ <= z + (TS * 2)) {
				this._shouldOpen = 1;
				this._isOpen = true;

				const newId = this.genId();
				if($espGamePlayer.respawnCheckId !== newId) {
					$gameMap.saveRespawnPosAndSave(newId);
				}
			}
		}
	}
}
