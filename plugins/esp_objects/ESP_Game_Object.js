// Okay, here comes the hard part.

class ESPGameObject {
	constructor(data) {
		this.position = new Vector3(0, 0, 0);
		this.speed = new Vector3(0, 0, 0);
		this.CollisionHeight = 0;
		this.CanCollide = true;
		this.CantWalkOffLedge = false;
		this._currentMovingPlatform = null;

		this._showFlyCount = false;

		if(data && data["Is Variable Cond"] === "true") {
			this._isUsingVariableCondition = true;
			this._variableCond = parseInt(data["Variable Cond"]) || 0;
			this._variableComparison = parseInt(data["Variable Comparison"]) || 0;
			this._variableBitBool = data["Variable Bit Bool"] !== "true";
			this._variableIsOpposite = data["Is Opposite"] === "true";
		}

		if(data && data["Force Above Ground"] === "true") {
			this._forceAboveGround = true;
		}

		if(data && data["Do Not Show On Transition"] === "true") {
			this._doNotShowOnTransition = true;
		}
	}

	onCreate() {
	}

	reset(x, y) {
		this.movexy(x, y);
		this.CollisionHeight = 0;
	}

	movexy(x, y) {
		this.position.x = x;
		this.position.y = y;
	}

	resetSpeed() {
		this.speed.set(0, 0, 0);
	}

	constructSprite() {
		return new ESPGameSprite(...arguments);
	}

	condition() {
		if(this._isUsingVariableCondition) {
			if(this._variableCond === 0) return true;
			const val = $gameVariables.value(this._variableCond);
			if(this._variableIsOpposite) {
				if(this._variableBitBool) {
					return val < this._variableComparison;
				} else {
					return (val & this._variableComparison) !== 0;
				}
			} else {
				if(this._variableBitBool) {
					return val >= this._variableComparison;
				} else {
					return (val & this._variableComparison) === 0;
				}
			}
		}
		return true;
	}

	getObjectVolume() {
		if(SceneManager._scene._spriteset._tilemap.scale.x > 1) return 0;
		let dist = this.getDistanceCameraCenter2d();
		if(!$gameMap.objectInCamera(this)) {
			dist *= 2;
		}
		if(dist < 2000) {
			return (1 - (dist / 2000)) * 100;
		}
		return 0;
	}

	saveIndividual() {
		return false;
	}

	saveGroup() {
		return null;
	}

	delete() {
		$gameMap.removeGameObject(this);
	}

	displayY() {
		return this.position.y + (this.CollisionHeight * -TS);
	}

	realZ() {
		return this.position.z + (this.CollisionHeight * TS);
	}

	rectWidth() {
		return 10;
	}

	rectHeight() {
		return 10;
	}

	visibleWidth() {
		return 30;
	}

	visibleHeight() {
		return 30;
	}

	isGravityManipulator() {
		return false;
	}

	isMovingPlatform() {
		return false;
	}

	gravity() {
		return 0;
	}

	getDistance(other) {
		return Math.sqrt(
			Math.pow(other.position.x - this.position.x, 2) +
			Math.pow(other.position.y - this.position.y, 2) +
			Math.pow(other.realZ() - this.realZ(), 2)
		);
	}

	getDistance2d(other) {
		return Math.sqrt(
			Math.pow(other.position.x - this.position.x, 2) +
			Math.pow(other.position.y - this.position.y, 2)
		);
	}

	getDistanceCameraCenter2d() {
		return Math.sqrt(
			Math.pow($gameMap.ESPCameraX + (Graphics.width / 2) - this.position.x, 2) +
			Math.pow($gameMap.ESPCameraY + (Graphics.height / 2) - this.position.y, 2)
		);
	}

	movingPlatformsExist() {
		return !!$gameMapTemp._mapMovingPlatforms && $gameMapTemp._mapMovingPlatforms.length > 0;
	}

	willEncounterMovingPlatform() {
		return false;
	}

	_GetMovingPlatform(x, y, xPos, yPos) {
		if(this.movingPlatformsExist() && this.willEncounterMovingPlatform()) {
			const realX = ((xPos ?? this.position.x) + (this.rectWidth() * x));
			const realY = ((yPos ?? this.position.y) + (this.rectHeight() * y));
			const len = $gameMapTemp._mapMovingPlatforms.length;
			for(let i = 0; i < len; i++) {
				const p = $gameMapTemp._mapMovingPlatforms[i];
				if(this === p) continue;
				const thresholdX = p.thresholdX ?? (x < 0 ? 30 : 26);
				const thresholdY = p.thresholdY ?? 16;
				if(p.canTouch() && ((this.realZ() >= p.topCollisionZ()) || (p.collideBottom() && this.CollisionHeight === p.CollisionHeight))) {
					if(realX > (p.position.x - thresholdX) && realX < (p.position.x + thresholdX) && realY > (p.position.y - thresholdY) && realY < (p.position.y + thresholdY)) {
						return p;
					}
				}
			}
		}
		return null;
	}

	_GetCollisionMap(index) {
		return $gameMap.espCollisionMap[index] ?? 0
	}

	_GetCornerIndex(x, y, xPos, yPos) {
		const tileSize = TS;
		const xx =  Math.floor(((xPos ?? this.position.x) + (this.rectWidth() * x)) / tileSize);
		const yy = Math.floor(((yPos ?? this.position.y) + (this.rectHeight() * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionMap.length) return 99;
		if($gameMap.restrictMapBottom && yy >= $gameMap.MapBottom) {
			return 99;
		}
		const movingPlatform = this._GetMovingPlatform(x, y, xPos, yPos);
		if(movingPlatform !== null) {
			return movingPlatform.standCollisionHeight();
		}
		if(this.CantWalkOffLedge) {
			const index = xx + (yy * $dataMap.width);
			if($gameMap.espMetaMap[index] === 1 || $gameMap.espCollisionKillers[index] > 0 || $gameMap.espCollisionShowMap[index] > 0) {
				return 99;
			}
		}
		return this._GetCollisionMap(xx + (yy * $dataMap.width));
	}

	_GetCornerIndexEx(x, y, xPos, yPos) {
		const tileSize = TS;
		const xx =  Math.floor(((xPos ?? this.position.x) + (this.rectWidth() * x)) / tileSize);
		const yy = Math.floor(((yPos ?? this.position.y) + (this.rectHeight() * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionMap.length) return [99, 0];
		if($gameMap.restrictMapBottom && yy >= $gameMap.MapBottom) {
			return [99, 0];
		}
		const index = xx + (yy * $dataMap.width);
		const movingPlatform = this._GetMovingPlatform(x, y, xPos, yPos);
		if(movingPlatform !== null) {
			return [movingPlatform.standCollisionHeight(), $gameMap.espCollisionKillers[index] ?? 0];
		}
		if(this.CantWalkOffLedge) {
			if($gameMap.espMetaMap[index] === 1 || $gameMap.espCollisionKillers[index] > 0 || $gameMap.espCollisionShowMap[index] > 0) {
				return [99, 0];
			}
		}
		return [this._GetCollisionMap(index), $gameMap.espCollisionKillers[index] ?? 0];
	}

	_GetCornerKill(x, y, expandX, expandY) {
		const tileSize = TS;
		const xx =  Math.floor(((this.position.x) + ((this.rectWidth() + expandX) * x)) / tileSize);
		const yy = Math.floor(((this.position.y) + ((this.rectHeight() + expandY) * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionKillers.length) return 0;
		const index = xx + (yy * $dataMap.width);
		if(this._GetCollisionMap(index) > this.CollisionHeight) {
			return -1;
		}
		return $gameMap.espCollisionKillers[index] ?? 0;
	}

	_GetCornerSlide(x, y, expandX, expandY) {
		const tileSize = TS;
		const xx =  Math.floor(((this.position.x) + ((this.rectWidth() + expandX) * x)) / tileSize);
		const yy = Math.floor(((this.position.y) + ((this.rectHeight() + expandY) * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionSlide.length) return 0;
		const index = xx + (yy * $dataMap.width);
		if(this._GetCollisionMap(index) > this.CollisionHeight) {
			return -1;
		}
		return $gameMap.espCollisionSlide[index] ?? 0;
	}

	_GetCornerShow(x, y) {
		const tileSize = TS;
		const xx =  Math.floor(((this.position.x) + ((this.visibleWidth()) * x)) / tileSize);
		const yy = Math.floor(((this.position.y) + ((this.visibleHeight()) * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionKillers.length) return 0;
		const index = xx + (yy * $dataMap.width);
		return $gameMap.espCollisionShowMap[index] ?? 0;
	}

	findCollisionHeight() {
		return Math.max(
			this._GetCornerIndex(-1, -1),
			this._GetCornerIndex(1, -1),
			this._GetCornerIndex(-1, 1),
			this._GetCornerIndex(1, 1)
		);
	}

	findKill() {
		if(!$gameMap.hasKill) {
			return 0;
		}
		const expandX = 5;
		const expandY = 5;
		const topLeft = this._GetCornerKill(-1, -1, expandX, expandY);
		if(topLeft === 0) {
			return 0;
		}
		const topRight = this._GetCornerKill(1, -1, expandX, expandY);
		if(topRight === 0) {
			return 0;
		}
		const bottomLeft = this._GetCornerKill(-1, 1, expandX, expandY);
		if(bottomLeft === 0) {
			return 0;
		}
		const bottomRight = this._GetCornerKill(1, 1, expandX, expandY);
		if(bottomRight === 0) {
			return 0;
		}
		const result = Math.max(topLeft, topRight, bottomLeft, bottomRight);
		if(result === -1) return 0;
		return result;
	}

	findSlide() {
		if(!$gameMap.hasSlide) {
			return 0;
		}
		const expandX = 5;
		const expandY = 5;
		const topLeft = this._GetCornerSlide(-1, -1, expandX, expandY);
		if(topLeft === 0) {
			const topLeftKill = this._GetCornerKill(-1, -1, expandX, expandY);
			if(topLeftKill === 0) return 0;
		}
		const topRight = this._GetCornerSlide(1, -1, expandX, expandY);
		if(topRight === 0) {
			const topRightKill = this._GetCornerKill(1, -1, expandX, expandY);
			if(topRightKill === 0) return 0;
		}
		const bottomLeft = this._GetCornerSlide(-1, 1, expandX, expandY);
		if(bottomLeft === 0) {
			const bottomLeftKill = this._GetCornerKill(-1, 1, expandX, expandY);
			if(bottomLeftKill === 0) return 0;
		}
		const bottomRight = this._GetCornerSlide(1, 1, expandX, expandY);
		if(bottomRight === 0) {
			const bottomRightKill = this._GetCornerKill(1, 1, expandX, expandY);
			if(bottomRightKill === 0) return 0;
		}
		const result = Math.max(topLeft, topRight, bottomLeft, bottomRight);
		if(result === -1) return 0;
		return result;
	}

	findLowestShow() {
		return Math.min(
			this._GetCornerShow(-1, -1),
			this._GetCornerShow(0, -1),
			this._GetCornerShow(1, -1),
			this._GetCornerShow(-1, 0),
			this._GetCornerShow(0, 0),
			this._GetCornerShow(1, 0),
			this._GetCornerShow(-1, 1),
			this._GetCornerShow(0, 1),
			this._GetCornerShow(1, 1)
		);
	}

	findCollisionHeightAt(x, y) {
		return Math.max(
			this._GetCornerIndex(-1, -1, x, y),
			this._GetCornerIndex(1, -1, x, y),
			this._GetCornerIndex(-1, 1, x, y),
			this._GetCornerIndex(1, 1, x, y)
		);
	}

	findMovingPlatform() {
		let result = null;
		const process = (x, y) => {
			const newResult = this._GetMovingPlatform(x, y);
			if(newResult !== null && (result === null || (newResult !== result && this.getDistance2d(newResult) < this.getDistance2d(result)))) {
				result = newResult;
			}
		}
		process(-1, -1);
		process(-1, 1);
		process(1, -1);
		process(1, 1);
		return result;
	}

	update() {
		this.updatePosition();
		this.updateZPosition();
	}

	canMoveToX(newPos) {
		const tileSize = TS;
		const isMovingLeft = newPos < this.position.x ? -1 : 1;
		const oldIndexX = Math.floor((this.position.x + (isMovingLeft * this.rectWidth())) / tileSize);
		const indexX = Math.floor((newPos + (isMovingLeft * this.rectWidth())) / tileSize);
		if(this.CantWalkOffLedge) {
			const l = this._GetCornerIndexEx(isMovingLeft, -1, newPos);
			const r = this._GetCornerIndexEx(isMovingLeft, 1, newPos);
			const newHeightIndex = Math.max(l[0], r[0]);
			const newKillIndex = Math.min(l[1], r[1]);
			return (!this.willEncounterMovingPlatform() && oldIndexX === indexX) || (newKillIndex === 0 && newHeightIndex === this.__PrecisePlayerHeightIndex);
		} else {
			const newHeightIndex = Math.max(this._GetCornerIndex(isMovingLeft, -1, newPos), this._GetCornerIndex(isMovingLeft, 1, newPos));
			return (!this.willEncounterMovingPlatform() && oldIndexX === indexX) || (newHeightIndex <= this.__PrecisePlayerHeightIndex);
		}
	}

	canMoveToY(newPos) {
		const tileSize = TS;
		const isMovingUp = newPos < this.position.y ? -1 : 1;
		const oldIndexY = Math.floor((this.position.y + (isMovingUp * this.rectHeight())) / tileSize);
		const indexY = Math.floor((newPos + (isMovingUp * this.rectHeight())) / tileSize);
		if(this.CantWalkOffLedge) {
			const l = this._GetCornerIndexEx(-1, isMovingUp, null, newPos);
			const r = this._GetCornerIndexEx(1, isMovingUp, null, newPos);
			const newHeightIndex = Math.max(l[0], r[0]);
			const newKillIndex = Math.min(l[1], r[1]);
			return (!this.willEncounterMovingPlatform() && oldIndexY === indexY) || (newKillIndex === 0 && newHeightIndex === this.__PrecisePlayerHeightIndex);
		} else {
			const newHeightIndex = Math.max(this._GetCornerIndex(-1, isMovingUp, null, newPos), this._GetCornerIndex(1, isMovingUp, null, newPos));
			return (!this.willEncounterMovingPlatform() && oldIndexY === indexY) || (newHeightIndex <= this.__PrecisePlayerHeightIndex);
		}
	}

	updatePosition() {
		let offsetX = 0;
		let offsetY = 0;

		if(this.willEncounterMovingPlatform()) {
			const movingPlatform = this.position.z === 0 ? this.findMovingPlatform() : null;
			if(this._currentMovingPlatform !== movingPlatform) {
				this._currentMovingPlatform = movingPlatform;
				if(movingPlatform && this === $espGamePlayer) {
					movingPlatform.onPlayerStepOn();
				}
			} else if(movingPlatform !== null) {
				offsetX = movingPlatform.deltaX;
				offsetY = movingPlatform.deltaY;
			}
		}

		const isMovingLeft = this.speed.x < 0 ? -1 : 1;
		const isMovingUp = this.speed.y < 0 ? -1 : 1;
		const newPosX = this.position.x + (this.speed.x * ESP.WS) + offsetX;
		const newPosY = this.position.y + (this.speed.y * ESP.WS) + offsetY;

		//this.__OldCollisionHeight = this.findCollisionHeight();
		this.__OldCollisionHeight = this.CollisionHeight;
		this.__PrecisePlayerHeightIndex = Math.floor(this.position.z / TS) + this.__OldCollisionHeight;

		if(!this.CanCollide || this.canMoveToX(newPosX)) {
			this.position.x = newPosX;
		} else {
			this.onCollided(isMovingLeft === -1 ? 4 : 6);
		}
		if(!this.CanCollide || this.canMoveToY(newPosY)) {
			this.position.y = newPosY;
		} else {
			this.onCollided(isMovingUp === -1 ? 8 : 2);
		}

		if(this.CanCollide) {
			this.updateCollisionHeight();
		}
	}

	updateCollisionHeight() {
		this.setCollisionHeight(this.findCollisionHeight());
	}

	setCollisionHeight(NewCollisionHeight) {
		if(this.CollisionHeight < 99) this.CollisionHeight = NewCollisionHeight;

		if(this.__OldCollisionHeight !== this.CollisionHeight) {
			const Diff = this.__OldCollisionHeight - this.CollisionHeight;
			this.position.z += (Diff * TS);
			this.onCollisionHeightChange(this.__OldCollisionHeight);
		}
	}

	forceCollisionHeight(NewCollisionHeight) {
		this.CollisionHeight = NewCollisionHeight;
		this.__OldCollisionHeight = NewCollisionHeight;
	}

	updateZPosition() {
		const prevZ = this.position.z;
		this.position.z += (this.speed.z * ESP.WS);
		if(this.position.z <= 0 && ESP.WS > 0.2) {
			if(prevZ > 0) {
				this.onGroundHit();
			}
			this.position.z = 0;
			this.speed.z = 0;
		}

		this.__PlayerHeightIndex = Math.floor((this.position.z + 1) / TS) + this.CollisionHeight;
	}

	onGroundHit() {
		ESPAudio.hitGround(this.getObjectVolume());
	}

	onCollided(direction) {
	}

	onCollisionHeightChange(oldHeight) {
	}

	saveData() {
		const data = {};
		data.position = this.position;
		data.speed = this.speed;
		data.CollisionHeight = this.CollisionHeight;
		return data;
	}

	loadData(data) {
		this.position = new Vector3(data.position.x ?? 0, data.position.y ?? 0, data.position.z ?? 0);
		this.speed = new Vector3(data.speed.x ?? 0, data.speed.y ?? 0, data.speed.z ?? 0);
		this.CollisionHeight = data.CollisionHeight ?? 0;
	}

	shadowify() {
		return false;
	}

	updateGravity() {
		if(this.position.z > 0) {
			this.speed.z -= 0.1;
			if(this.speed.z < -10) this.speed.z = -10;
		}
	}

	updateGroundAssurance() {
		if(this.position.z < 0) {
			this.speed.z = 0;
			this.position.z = 0;
		}
	}

	onPlayerLeavesTheMap() {
	}

	onRemoved() {
	}
}