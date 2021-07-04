// The player descends from the heavens.

var gravityObjects = [];

class ESPGamePlayer extends ESPGameObject {
	constructor() {
		super();

		this.position.set(375, 500, 0);
		this.speed.set(0, 0, 0);

		this.respawnPos = {x: 0, y: 0};
		this.respawnCheckId = 0;

		this.FlyCount = 0;
		this.FlyData = {};

		this._jumpHelp = 0;
		this._triggerHelp = 0;
		this._canControl = true;
		this._isDying = false;
		this._canTransition = true;
		this._noPlayerControlTimer = 0;
		this._deathAnimationData = null;
		this._customColor = null;
		this._spriteRotation = 0;
		this._deathParticles = null;
		this._isVisible = true;

		this.lastDeathTime = -1;

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
		this.CanCollide = false;
	}

	makePlayable() {
		this._canTransition = true;
		this._canControl = true;
		this.CanCollide = true;
	}

	canControl() {
		return this._canControl && !this._isDying && !$gameTemp._isNewGame;
	}

	update() {
		this.updatePlayerControl();
		this.updateInput();
		this.updateFalling();
		super.update();
		this.updateTransition();
		this.updateDeathTiles();
		this.updateDying();
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

	canJump() {
		return $gameVariables.value(0) >= 1;
	}

	isJumpButtonTriggered() {
		return Input.isTriggeredEx("space") || Input.isTriggered("button_a");
	}

	updateJump() {
		if(this.canJump()) {
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
	}

	updateAbilities() {
		/*
		if(TouchInput.isTriggered()) {
			if(this._playerIsGravity) {
				$gameMapTemp._gravityManipulators.remove(this);
			} else {
				$gameMapTemp._gravityManipulators.push(this);
			}
			this._playerIsGravity = !this._playerIsGravity;
		}*/
		/*
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
		}*/
	}

	updateFalling() {
		if(this._isDying) return;
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
		if(this.canControl() && this._canTransition && !$gameMap._isTranferring) {
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

	updateDeathTiles() {
		if(!this._isDying && this.findKill() === 1 && this.position.z <= 0) {
			this.kill(0, 0, 60);
		}
	}

	updateDying() {
		this.updateDeathAnimation1();
		this.updateDeathAnimation2();
	}

	updateDeathAnimation1() {
		if(this._isDying && this._deathAnimationData) {
			const maxTime = 40;
			const ratio = this._deathAnimationData.time / maxTime;

			this._spriteRotation = 6 * Easing.easeOutCubic(ratio) * (this._deathAnimationData.x < 0 ? -1 : 1);

			if(!this._customColor) this._customColor = [0, 0, 0, 0];
			this._customColor[0] = this._customColor[1] = this._customColor[2] = (255 * ratio);

			const easeRatio = Easing.easeOutCubic(ratio);
			this.speed.x = (this._deathAnimationData.baseX + (this._deathAnimationData.x * easeRatio)) - this.position.x;
			this.speed.y = (this._deathAnimationData.baseY + (this._deathAnimationData.y * easeRatio)) - this.position.y;
			this.speed.z = (this._deathAnimationData.z * easeRatio) - this._deathAnimationData.totalZ;
			this._deathAnimationData.totalZ += this.speed.z;

			if(this._deathAnimationData.time < maxTime) {
				this._deathAnimationData.time++;
			} else if(!this._deathParticles) {
				this.onDeathAnimation1End();
			}
		}
	}

	updateDeathAnimation2() {
		if(this._deathParticles) {
			const len = this._deathParticles.length;
			for(let i = 0; i < len; i++) {
				this._deathParticles[i].update();
			}
			if(this._deathParticles.filter(p => !p.isComplete()).length === 0) {
				this.onDeathAnimationComplete();
				this._deathParticles = null;
			}
		}
	}

	onDeathAnimation1End() {
		const animationSpeed = 6;
		const speedX = 1;
		const speedY = 1;
		this._deathParticles = [];
		this._isVisible = false;
		for(let i = -1; i <= 1; i++) {
			for(let j = -1; j <= 1; j++) {
				if(i === 0 && j === 0) continue;
				const x = speedX * i;
				const y = speedY * j;
				const mag = Math.sqrt(x * x + y * y);
				const obj = new ESPParticleObject(x / mag, (y / mag) - (0.3 * j), animationSpeed);
				this._deathParticles.push(obj);
				obj.position.set(this.position);
				$gameMap.addGameObject(obj);
			}
		}
		this._deathAnimationData = null;
		this._isDying = true;
	}

	onDeathAnimationComplete() {
		$gameMap.espFadeOut();
		this.lastDeathTime = Graphics.frameCount;
	}

	kill(offsetX, offsetY, offsetZ) {
		$gameMap.espFreezeWorld();
		$gameMap.onPlayerKilled();
		this._isDying = true;
		this._deathAnimationData = {
			x: offsetX,
			y: offsetY,
			z: offsetZ,
			baseX: this.position.x,
			baseY: this.position.y,
			totalZ: 0,
			time: 0
		};
		this._customColor = [0, 0, 0, 0];
	}

	unkill() {
		this._isDying = false;
		this._isVisible = true;
		this._spriteRotation = 0;
		this._customColor = null;
		this._deathAnimationData = null;
		this._deathParticles = null;
		$gameMap.resetESPGame();
	}

	isJumping() {
		return this.position.z > 0 && this.speed.z > 0;
	}

	isFalling() {
		return this.position.z > 0 && this.speed.z < 0
	}

	isDying() {
		return this._isDying;
	}

	hasCustomColor() {
		return this._customColor !== null;
	}

	customColor() {
		return this._customColor;
	}

	spriteRotation() {
		return this._spriteRotation;
	}

	visible() {
		return this._isVisible;
	}

	saveRespawnPos(checkId) {
		this.respawnPos.x = this.position.x;
		this.respawnPos.y = this.position.y;
		this.respawnCheckId = checkId ?? 0;
		if(this.__oldRespawnPosX !== this.respawnPos.x || this.__oldRespawnPosY !== this.respawnPos.y || this.__oldMapId !== $gameMap.mapId()) {
			this.__oldRespawnPosX = this.respawnPos.x;
			this.__oldRespawnPosY = this.respawnPos.y;
			this.__oldMapId = $gameMap.mapId();
			return true;
		}
		return false;
	}

	restoreRespawnPos() {
		this.position.x = this.respawnPos.x ?? 0;
		this.position.y = this.respawnPos.y ?? 0;
		this.position.z = 0;
	}

	saveData() {
		const result = super.saveData();
		result.respawnPos = this.respawnPos;
		result.respawnCheckId = this.respawnCheckId;
		result.FlyCount = this.FlyCount;
		result.FlyData = this.FlyData;
		return result;
	}

	loadData(data) {
		super.loadData(data);
		data.respawnPos = data.respawnPos ?? {};
		this.respawnPos = { x: data.respawnPos.x ?? 0, y: data.respawnPos.y ?? 0 };
		this.respawnCheckId = data.respawnCheckId ?? 0;
		this.FlyCount = data.FlyCount ?? 0;
		this.FlyData = data.FlyData ?? {};
	}

	shadowify() {
		return true;
	}

	flies() {
		return this.FlyCount;
	}

	incrementFlies(id) {
		this.FlyCount++;
		this.FlyData[id] = true;
	}

	hasFlyBeenEaten(id) {
		return !!this.FlyData[id];
	}
}
