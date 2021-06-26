// Okay, here comes the hard part.


const TilemapDecor = [];

modify_Spriteset_Map = class {
	createCharacters() {
		ESP.Spriteset_Map.createCharacters.apply(this, arguments);
		this._espPlayer = new ESPPlayerSprite();
		this._espPlayer.z = 4;
		this._tilemap.addChild(this._espPlayer);
	}

	createTilemap() {
		const tilemap = new Tilemap();
		tilemap.tileWidth = $gameMap.tileWidth();
		tilemap.tileHeight = $gameMap.tileHeight();
		tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
		tilemap.horizontalWrap = $gameMap.isLoopHorizontal();
		tilemap.verticalWrap = $gameMap.isLoopVertical();
		this._baseSprite.addChild(tilemap);
		this._effectsContainer = tilemap;
		this._tilemap = tilemap;
		this.loadTileset();

		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;

		this._loadedESPider = false;
		function OnBitmapsLoaded() {
			if(!this._loadedESPider && this._tilemap.isReady()) {
				this._loadedESPider = true;

				this._tilemap.updateTransform();
				const bit = Bitmap.snap(this._tilemap._lowerLayer);

				for(let x = 0; x < mapWidth; x++) {
					for(let y = 0; y < mapHeight; y++) {
						const regionId = $gameMap.tileId(x, y, 5) ?? 0;
						if(regionId > 0) {
							let height = 0;
							if(($gameMap.tileId(x, y + 1, 5) ?? 0) > 0) {
								height = 1;
							} else {
								height = 2;
								for(let i = 2; i <= regionId; i++) {
									if(($gameMap.tileId(x, y + i, 5) ?? 0) > 0) {
										i = regionId + 1;
									} else {
										height++;
									}
								}
							}
							const bit2 = new Bitmap(48, 48 * height);
							bit2.blt(bit, x * 48, y * 48, 48, 48 * height, 0, 0);
							const spr = new Sprite(bit2);
							spr.anchor.set(0.5, 1);
							spr.move((x * 48) + 24, ((y + height - 1) * 48) + 48);
							spr._colY = ((y + regionId) * 48);
							spr._colZ = regionId * 48;
							spr.z = height == 1 ? 999 : 4;
							spr._shouldZ = spr.z;
							spr.IsWorldSprite = true;
							spr.IsWorldSpriteId = regionId;
							spr.ComparisonZ = {};
							if(!TilemapDecor[regionId]) {
								TilemapDecor[regionId] = [];
							}
							TilemapDecor[regionId].push(spr);
							//spr._zHeight = (regionId * 48);
							this._tilemap.addChild(spr);
						}
					}
				}
			}
		}

		for(const bitmap of this._tilemap._bitmaps) {
			if(bitmap) {
				bitmap.addLoadListener(OnBitmapsLoaded.bind(this));
			}
		}

		
/*
		
		//$gameMap.espCollisionMap
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const regionId = this.tileId(x, y, 5);
				if(regionId > 0) {
					const newX = x;
					const newY = y + regionId;
					this.espCollisionMap[newX + (newY * mapWidth)] = regionId ?? 0;
				}
			}
		}*/
	}
}

modify_Scene_Map = class {
	updateMain() {
		ESP.Scene_Map.updateMain.apply(this, arguments);
		$espGamePlayer.update();
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
	}
}

class ESPGamePlayer {
	constructor(isArrows) {
		this.position = new Vector3(300, 500 + (isArrows ? 96 : 0), 0);
		this.speed = 3;
		this.speedZ = 0;

		this.CollisionHeight = 0;

		this._jumpHelp = 0;
		this._triggerHelp = 0;

		this.JUMP_POWER = 6;
		this.GRAVITY = 0.2;

		this._entityId = 0;
		this._spriteNeedsRefresh = false;
	}

	update() {
		this.updatePosition();
		this.updateJump();
		this.updateFalling();
	}

	rectWidth() {
		return 10;
	}

	rectHeight() {
		return 6;
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

	updatePosition() {
		const isMovingLeft = Input.InputVector.x < 0 ? -1 : 1;
		const isMovingUp = Input.InputVector.y < 0 ? -1 : 1;
		const newPosX = this.position.x + (Input.InputVector.x * this.speed);
		const newPosY = this.position.y + (Input.InputVector.y * this.speed);

		const tileSize = $gameMap.tileWidth();

		const oldIndexX = Math.floor((this.position.x + (isMovingLeft * this.rectWidth())) / tileSize);
		const oldIndexY = Math.floor((this.position.y + (isMovingUp * this.rectHeight())) / tileSize);
		const indexX = Math.floor((newPosX + (isMovingLeft * this.rectWidth())) / tileSize);
		const indexY = Math.floor((newPosY + (isMovingUp * this.rectHeight())) / tileSize);

		const OldCollisionHeight = this.findCollisionHeight();

		const PlayerHeightIndex = Math.floor(this.position.z / tileSize) + OldCollisionHeight;

		if(oldIndexX === indexX || Math.max(this._GetCornerIndex(isMovingLeft, -1, newPosX), this._GetCornerIndex(isMovingLeft, 1, newPosX)) <= PlayerHeightIndex) {
			this.position.x = newPosX;
		}
		if(oldIndexY === indexY || Math.max(this._GetCornerIndex(-1, isMovingUp, null, newPosY), this._GetCornerIndex(1, isMovingUp, null, newPosY)) <= PlayerHeightIndex) {
			this.position.y = newPosY;
		}
		/*
		if($gameMap.espCollisionMap[oldIndexX + (indexY * $dataMap.width)] <= PlayerHeightIndex) {
			this.position.y = newPosY;
		}*/

		this.CollisionHeight = this.findCollisionHeight();

		if(OldCollisionHeight !== this.CollisionHeight) {
			const Diff = OldCollisionHeight - this.CollisionHeight;
			this.position.z += (Diff * 48);
		}
	}

	updateJump() {
		if(this.position.z <= 0) {
			this._jumpHelp = 10;
		} else if(this._jumpHelp > 0) {
			this._jumpHelp--;
		}
		if(Input.isTriggeredEx("space")) {
			this._triggerHelp = 4;
		} else if(this._triggerHelp > 0) {
			this._triggerHelp--;
		}
		if(this._triggerHelp > 0 && this._jumpHelp > 0) {
			this.speedZ = this.JUMP_POWER;
		}
	}

	updateFalling() {
		if(this.speedZ > -10) {
			this.speedZ -= this.GRAVITY;
		}

		this.position.z += this.speedZ;
		if(this.position.z <= 0) {
			this.position.z = 0;
			this.speedZ = 0;
		}

		const TopPos = this.position.y + this.rectHeight();
		const TopPosIndex = Math.floor(TopPos / 48);

		const NewPlayerHeightIndex = Math.floor((this.position.z + 1) / 48) + this.CollisionHeight;
		if(this.__PlayerHeightIndex !== NewPlayerHeightIndex || this.__PlayerTopPos !== TopPosIndex) {
			this.__PlayerHeightIndex = NewPlayerHeightIndex;
			this.__PlayerTopPos = TopPosIndex;

			//const oldIndexY = Math.floor(this.position.y / tileSize);

			for(let i = 0; i <= NewPlayerHeightIndex; i++) {
				if(TilemapDecor[i]) {
					for(let j = 0; j < TilemapDecor[i].length; j++) {
						//ComparisonZ[this._entityId]
						TilemapDecor[i][j].ComparisonZ[this._entityId] = ((TopPos) < TilemapDecor[i][j]._colY ? TilemapDecor[i][j]._shouldZ : 3);
					}
				}
			}
			for(let i = NewPlayerHeightIndex + 1; i <= 5; i++) {
				if(TilemapDecor[i]) {
					for(let j = 0; j < TilemapDecor[i].length; j++) {
						TilemapDecor[i][j].ComparisonZ[this._entityId] = ((TopPos) < (TilemapDecor[i][j]._colY + 48) ? TilemapDecor[i][j]._shouldZ : 3);
						//TilemapDecor[i][j].z = TilemapDecor[i][j]._shouldZ;
					}
				}
			}

			this._spriteNeedsRefresh = true;
		}
	}

	isJumping() {
		return this.position.z > 0 && this.speedZ > 0;
	}

	isFalling() {
		return this.position.z > 0 && this.speedZ < 0
	}

	loadData(data) {
		this.position = new Vector3(data.position.x ?? 0, data.position.y ?? 0, data.position.z ?? 0);
		this.speed = data.speed ?? 0;
		this.speedZ = data.speedZ ?? 0;
		this.CollisionHeight = data.CollisionHeight ?? 0;
	}
}
