// The player descends from the heavens.

var gravityObjects = [];

class ESPGamePlayer extends ESPGameObject {
	constructor() {
		super();

		this.position.set(375, 500, 0);
		this.speed.set(0, 0, 0);

		this._jumpHelp = 0;
		this._triggerHelp = 0;
		this._canControl = true;
		this._canTransition = true;
		this._noPlayerControlTimer = 0;

		this.JUMP_POWER = 5;
		this.GRAVITY = 0.2;
	}

	reset(x, y, xSpd, ySpd) {
		super.reset(x, y);
		this._canControl = true;
		this.CanCollide = true;
		if(xSpd || ySpd) {
			this.makeCustscene();
			this._noPlayerControlTimer = 36;
			this.speed.x = xSpd ?? 0;
			this.speed.y = ySpd ?? 0;
		}
	}

	makeCustscene() {
		this._canTransition = false;
		this._canControl = false;
	}

	makePlayable() {
		this._canTransition = true;
		this._canControl = true;
	}

	canControl() {
		return this._canControl;
	}

	update() {
		this.updatePlayerControl();
		this.updateInput();
		this.updateFalling();
		super.update();
		this.updateTransition();
	}

	updatePlayerControl() {
		if(this._noPlayerControlTimer > 0) {
			this._noPlayerControlTimer--;
			if(this._noPlayerControlTimer === 0) {
				this.makePlayable();
				this.speed.x = 0;
				this.speed.y = 0;
			}
		}
	}

	updateInput() {
		if(this.canControl()) {
			this.updateMovement();
			this.updateJump();
			this.updateAbilities();
		}
	}

	updateMovement() {
		this.speed.x = Input.InputVector.x * 3;
		this.speed.y = Input.InputVector.y * 3;
	}

	isJumpButtonTriggered() {
		return Input.isTriggeredEx("space") || Input.isTriggered("button_a");
	}

	updateJump() {
		if(this.position.z <= 0) {
			this._jumpHelp = 6;
		} else if(this._jumpHelp > 0) {
			this._jumpHelp--;
		}
		if(this.isJumpButtonTriggered()) {
			this._triggerHelp = 4;
		} else if(this._triggerHelp > 0) {
			this._triggerHelp--;
		}
		if(this._triggerHelp > 0 && this._jumpHelp > 0) {
			this.speed.z = this.JUMP_POWER;
		}
	}

	updateAbilities() {
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
						TilemapDecor[i][j].ComparisonZ[this._entityId] = ((TopPos) < (TilemapDecor[i][j]._colY + TS) ? TilemapDecor[i][j]._shouldZ : 3);
					}
				}
			}

			this._spriteNeedsRefresh = true;
		}*/
	}

	updateTransition() {
		if(this.canControl() && this._canTransition) {
			const x = this.position.x;
			const y = this.displayY();
			let dir = null;
			const Threshold = 3;
			if(y - this.rectHeight() <= Threshold) {
				dir = "up";
			} else if(y + this.rectHeight() >= (($gameMap.MapBottom * TS) +  - Threshold)) {
				dir = "down";
			} else if(x - this.rectWidth() <= Threshold) {
				dir = "left";
			} else if(x + this.rectWidth() >= ($gameMap.width() * TS) - Threshold) {
				dir = "right";
			}
			if(dir !== null && $gameMap.onPlayerLeaveMap(dir, this.CollisionHeight + (this.position.z > TS * 2 ? Math.floor(this.position.z / TS) : 0))) {
				this._canControl = false;
				this.CanCollide = false;
			}
		}
	}

	isJumping() {
		return this.position.z > 0 && this.speed.z > 0;
	}

	isFalling() {
		return this.position.z > 0 && this.speed.z < 0
	}
}
