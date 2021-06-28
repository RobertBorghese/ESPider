// Okay, here comes the hard part.

class ESPGameObject {
	constructor() {
		this.position = new Vector3(0, 0, 0);
		this.speed = new Vector3(0, 0, 0);
		this.CollisionHeight = 0;
		this.CanCollide = true;
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

	rectWidth() {
		return 10;
	}

	rectHeight() {
		return 10;
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
			Math.pow(other.position.z - this.position.z, 2)
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

	findCollisionHeight() {
		return Math.max(
			this._GetCornerIndex(-1, -1),
			this._GetCornerIndex(1, -1),
			this._GetCornerIndex(-1, 1),
			this._GetCornerIndex(1, 1)
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
		return oldIndexX === indexX || Math.max(this._GetCornerIndex(isMovingLeft, -1, newPos), this._GetCornerIndex(isMovingLeft, 1, newPos)) <= this.__PrecisePlayerHeightIndex;
	}

	canMoveToY(newPos) {
		const tileSize = TS;
		const isMovingUp = newPos < this.position.y ? -1 : 1;
		const oldIndexY = Math.floor((this.position.y + (isMovingUp * this.rectHeight())) / tileSize);
		const indexY = Math.floor((newPos + (isMovingUp * this.rectHeight())) / tileSize);
		return oldIndexY === indexY || Math.max(this._GetCornerIndex(-1, isMovingUp, null, newPos), this._GetCornerIndex(1, isMovingUp, null, newPos)) <= this.__PrecisePlayerHeightIndex;
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

		const NewCollisionHeight = this.findCollisionHeight();
		if(this.CollisionHeight < 99) this.CollisionHeight = NewCollisionHeight;

		if(this.__OldCollisionHeight !== this.CollisionHeight) {
			const Diff = this.__OldCollisionHeight - this.CollisionHeight;
			this.position.z += (Diff * TS);
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

	loadData(data) {
		this.position = new Vector3(data.position.x ?? 0, data.position.y ?? 0, data.position.z ?? 0);
		this.speed = new Vector3(data.speed.x ?? 0, data.speed.y ?? 0, data.speed.z ?? 0);
		this.CollisionHeight = data.CollisionHeight ?? 0;
	}
}