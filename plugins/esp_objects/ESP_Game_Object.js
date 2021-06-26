// Okay, here comes the hard part.

modify_Scene_Map = class {
	updateMain() {
		ESP.Scene_Map.updateMain.apply(this, arguments);
		$espGamePlayer.update();

		const objs = $gameMap.getGameObjects();
		const len = objs.length;
		for(let i = 0; i < len; i++) {
			objs[i].update();
		}
	}
}

modify_Game_Map = class {
	setup(mapId) {
		ESP.Game_Map.setup.apply(this, arguments);

		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;
		let largestRegion = 0;
		this.espCollisionMap = [];
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				this.espCollisionMap.push(0);
				const regionId = this.tileId(x, y, 5) ?? 0;
				if(largestRegion < regionId) {
					largestRegion = regionId;
				}
			}
		}

		for(let i = 0; i < largestRegion; i++) {
			for(let x = 0; x < mapWidth; x++) {
				this.espCollisionMap.push(0);
			}
		}

		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const regionId = this.tileId(x, y, 5);
				if(regionId > 0) {
					const newX = x;
					const newY = y + regionId;
					this.espCollisionMap[newX + (newY * mapWidth)] = regionId ?? 0;
				}
			}
		}

		this._otherGameObject = new ESPFireballObject();
	}

	getGameObjects() {
		return [this._otherGameObject];
	}
}

class ESPGameObject {
	constructor() {
		this.position = new Vector3(0, 0, 0);
		this.speed = new Vector3(0, 0, 0);
		this.CollisionHeight = 0;
	}

	constructSprite() {
		return new ESPGameSprite(...arguments);
	}

	rectWidth() {
		return 10;
	}

	rectHeight() {
		return 10;
	}

	_GetCornerIndex(x, y, xPos, yPos) {
		const tileSize = 48;
		const xx =  Math.floor(((xPos ?? this.position.x) + (this.rectWidth() * x)) / tileSize);
		const yy = Math.floor(((yPos ?? this.position.y) + (this.rectHeight() * y)) / tileSize);
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

	updatePosition() {
		const isMovingLeft = this.speed.x < 0 ? -1 : 1;
		const isMovingUp = this.speed.y < 0 ? -1 : 1;
		const newPosX = this.position.x + (this.speed.x);
		const newPosY = this.position.y + (this.speed.y);

		const tileSize = $gameMap.tileWidth();

		const oldIndexX = Math.floor((this.position.x + (isMovingLeft * this.rectWidth())) / tileSize);
		const oldIndexY = Math.floor((this.position.y + (isMovingUp * this.rectHeight())) / tileSize);
		const indexX = Math.floor((newPosX + (isMovingLeft * this.rectWidth())) / tileSize);
		const indexY = Math.floor((newPosY + (isMovingUp * this.rectHeight())) / tileSize);

		const OldCollisionHeight = this.findCollisionHeight();

		const PlayerHeightIndex = Math.floor(this.position.z / tileSize) + OldCollisionHeight;

		if(oldIndexX === indexX || Math.max(this._GetCornerIndex(isMovingLeft, -1, newPosX), this._GetCornerIndex(isMovingLeft, 1, newPosX)) <= PlayerHeightIndex) {
			this.position.x = newPosX;
		} else {
			this.onCollided(isMovingLeft === -1 ? 4 : 6);
		}
		if(oldIndexY === indexY || Math.max(this._GetCornerIndex(-1, isMovingUp, null, newPosY), this._GetCornerIndex(1, isMovingUp, null, newPosY)) <= PlayerHeightIndex) {
			this.position.y = newPosY;
		} else {
			this.onCollided(isMovingUp === -1 ? 8 : 2);
		}

		this.CollisionHeight = this.findCollisionHeight();

		if(OldCollisionHeight !== this.CollisionHeight) {
			const Diff = OldCollisionHeight - this.CollisionHeight;
			this.position.z += (Diff * 48);
		}
	}

	updateZPosition() {
		this.position.z += this.speed.z;
		if(this.position.z <= 0) {
			this.position.z = 0;
			this.speed.z = 0;
		}

		this.__PlayerHeightIndex = Math.floor((this.position.z + 1) / 48) + this.CollisionHeight;
	}

	onCollided(direction) {
	}

	loadData(data) {
		this.position = new Vector3(data.position.x ?? 0, data.position.y ?? 0, data.position.z ?? 0);
		this.speed = new Vector3(data.speed.x ?? 0, data.speed.y ?? 0, data.speed.z ?? 0);
		this.CollisionHeight = data.CollisionHeight ?? 0;
	}
}