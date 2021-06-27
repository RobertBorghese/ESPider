// The player descends from the heavens.

var gravityObjects = [];

class ESPGamePlayer extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 500, 0);
		this.speed.set(0, 0, 0);

		this._jumpHelp = 0;
		this._triggerHelp = 0;

		this.JUMP_POWER = 5;
		this.GRAVITY = 0.2;
	}

	update() {
		/*
		if(TouchInput.isTriggered()) {
			if(this._playerIsGravity) {
				$gameMap._gravityManipulators.remove(this);
			} else {
				$gameMap._gravityManipulators.push(this);
			}
			this._playerIsGravity = !this._playerIsGravity;
		}*/
		if(TouchInput.isTriggered()) {
			const x = $gameMap.canvasToMapXPrecise(TouchInput.x);
			const y = $gameMap.canvasToMapYPrecise(TouchInput.y);
			const obj = new ESPWebGravityObject();
			$gameMap.addGameObject(obj, x, y);
			gravityObjects.push(obj);
		} else if(TouchInput.isCancelled()) {
			const len = gravityObjects.length;
			for(let i = 0; i < len; i++) {
				$gameMap.removeGameObject(gravityObjects[i]);
			}
			gravityObjects = [];
		}
		this.updateMovement();
		this.updateJump();
		this.updateFalling();
		super.update();
	}

	updateMovement() {
		this.speed.x = Input.InputVector.x * 3;
		this.speed.y = Input.InputVector.y * 3;
	}

	updateJump() {
		if(this.position.z <= 0) {
			this._jumpHelp = 6;
		} else if(this._jumpHelp > 0) {
			this._jumpHelp--;
		}
		if(Input.isTriggeredEx("space")) {
			this._triggerHelp = 4;
		} else if(this._triggerHelp > 0) {
			this._triggerHelp--;
		}
		if(this._triggerHelp > 0 && this._jumpHelp > 0) {
			this.speed.z = this.JUMP_POWER;
		}
	}

	updateFalling() {
		if(this.speed.z > -10) {
			this.speed.z -= this.GRAVITY;
		}

		/*if(this.__PlayerHeightIndex !== NewPlayerHeightIndex) {
			this.__PlayerHeightIndex = NewPlayerHeightIndex;

			//const oldIndexY = Math.floor(this.position.y / tileSize);

			/*
			for(let i = 0; i <= NewPlayerHeightIndex; i++) {
				if(TilemapDecor[i]) {
					for(let j = 0; j < TilemapDecor[i].length; j++) {
						TilemapDecor[i][j].ComparisonZ[this._entityId] = ((TopPos) < TilemapDecor[i][j]._colY ? TilemapDecor[i][j]._shouldZ : 3);
					}
				}
			}
			for(let i = NewPlayerHeightIndex + 1; i <= 5; i++) {
				if(TilemapDecor[i]) {
					for(let j = 0; j < TilemapDecor[i].length; j++) {
						TilemapDecor[i][j].ComparisonZ[this._entityId] = ((TopPos) < (TilemapDecor[i][j]._colY + 48) ? TilemapDecor[i][j]._shouldZ : 3);
					}
				}
			}

			this._spriteNeedsRefresh = true;
		}*/
	}

	isJumping() {
		return this.position.z > 0 && this.speed.z > 0;
	}

	isFalling() {
		return this.position.z > 0 && this.speed.z < 0
	}
}
