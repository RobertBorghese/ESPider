// Okay, here comes the hard part.

class ESPGameObject {
	constructor() {
		this.position = new Vector3(0, 0, 0);
		this.speed = new Vector3(0, 0, 0);
		this.CollisionHeight = 0;
		this.CanCollide = true;
		this.CantWalkOffLedge = false;
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

	_GetCornerIndex(x, y, xPos, yPos) {
		const tileSize = TS;
		const xx =  Math.floor(((xPos ?? this.position.x) + (this.rectWidth() * x)) / tileSize);
		const yy = Math.floor(((yPos ?? this.position.y) + (this.rectHeight() * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionMap.length) return 99;
		return $gameMap.espCollisionMap[xx + (yy * $dataMap.width)] ?? 0;
	}

	_GetCornerIndexEx(x, y, xPos, yPos) {
		const tileSize = TS;
		const xx =  Math.floor(((xPos ?? this.position.x) + (this.rectWidth() * x)) / tileSize);
		const yy = Math.floor(((yPos ?? this.position.y) + (this.rectHeight() * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionMap.length) return [99, 0];
		const index = xx + (yy * $dataMap.width);
		return [$gameMap.espCollisionMap[index] ?? 0, $gameMap.espCollisionKillers[index] ?? 0];
	}

	_GetCornerKill(x, y, expandX, expandY) {
		const tileSize = TS;
		const xx =  Math.floor(((this.position.x) + ((this.rectWidth() + expandX) * x)) / tileSize);
		const yy = Math.floor(((this.position.y) + ((this.rectHeight() + expandY) * y)) / tileSize);
		if(xx < 0 || yy < 0 || xx >= $gameMap.width() || (xx + (yy * $dataMap.width)) >= $gameMap.espCollisionKillers.length) return 0;
		const index = xx + (yy * $dataMap.width);
		return $gameMap.espCollisionKillers[index] ?? 0;
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
		const expandX = 5;
		const expandY = 5;
		return Math.min(
			this._GetCornerKill(-1, -1, expandX, expandY),
			this._GetCornerKill(1, -1, expandX, expandY),
			this._GetCornerKill(-1, 1, expandX, expandY),
			this._GetCornerKill(1, 1, expandX, expandY)
		);
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
			return oldIndexX === indexX || (newKillIndex === 0 && newHeightIndex === this.__PrecisePlayerHeightIndex);
		} else {
			const newHeightIndex = Math.max(this._GetCornerIndex(isMovingLeft, -1, newPos), this._GetCornerIndex(isMovingLeft, 1, newPos));
			return oldIndexX === indexX || (newHeightIndex <= this.__PrecisePlayerHeightIndex);
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
			return oldIndexY === indexY || (newKillIndex === 0 && newHeightIndex === this.__PrecisePlayerHeightIndex);
		} else {
			const newHeightIndex = Math.max(this._GetCornerIndex(-1, isMovingUp, null, newPos), this._GetCornerIndex(1, isMovingUp, null, newPos));
			return oldIndexY === indexY || (newHeightIndex <= this.__PrecisePlayerHeightIndex);
		}
	}

	updatePosition() {
		const isMovingLeft = this.speed.x < 0 ? -1 : 1;
		const isMovingUp = this.speed.y < 0 ? -1 : 1;
		const newPosX = this.position.x + (this.speed.x);
		const newPosY = this.position.y + (this.speed.y);

		this.__OldCollisionHeight = this.findCollisionHeight();
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
			const NewCollisionHeight = this.findCollisionHeight();
			if(this.CollisionHeight < 99) this.CollisionHeight = NewCollisionHeight;

			if(this.__OldCollisionHeight !== this.CollisionHeight) {
				const Diff = this.__OldCollisionHeight - this.CollisionHeight;
				this.position.z += (Diff * TS);
				this.onCollisionHeightChange(this.__OldCollisionHeight);
			}
		}
	}

	updateZPosition() {
		this.position.z += this.speed.z;
		if(this.position.z <= 0) {
			this.position.z = 0;
			this.speed.z = 0;
		}

		this.__PlayerHeightIndex = Math.floor((this.position.z + 1) / TS) + this.CollisionHeight;
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
}