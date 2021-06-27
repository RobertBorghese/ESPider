// SPRITES. Not from mcdonalds, dont worry.

modify_Spriteset_Map = class {
	createCharacters() {
		//ESP.Spriteset_Map.createCharacters.apply(this, arguments);
		this._espPlayer = new ESPPlayerSprite();
		this._espPlayer.z = 4;
		this._tilemap._espPlayer = this._espPlayer;
		this._tilemap.addChild(this._espPlayer);

		this._tilemap._espSprites = [this._espPlayer];

		const objects = $gameMap.getGameObjects();
		const len = objects.length;
		for(let i = 0; i < len; i++) {
			this.addGameSprite(objects[i]);
		}
	}

	addGameSprite(obj) {
		const spr = obj.constructSprite();
		spr.espObject = obj;
		this._tilemap.addChild(spr);
		this._tilemap._espSprites.push(spr);
	}

	removeGameSprite(obj) {
		const sprites = this._tilemap._espSprites;
		const len = sprites.length;
		for(let i = 0; i < len; i++) {
			const spr = sprites[i];
			if(spr.espObject === obj) {
				this._tilemap.removeChild(spr);
				this._tilemap._espSprites.remove(spr);
				spr.destroy();
				break;
			}
		}
	}

	createTilemap() {
		ESP.Spriteset_Map.createTilemap.apply(this, arguments);

		this._loadedESPider = false;
		for(const bitmap of this._tilemap._bitmaps) {
			if(bitmap) {
				bitmap.addLoadListener(this.OnBitmapsLoaded.bind(this));
			}
		}
	}

	OnBitmapsLoaded() {
		if(!this._loadedESPider && this._tilemap.isReady()) {
			this._loadedESPider = true;

			const mapWidth = $dataMap.width;
			const mapHeight = $dataMap.height;

			this._tilemap.updateTransform();
			const tilemapBitmap = Bitmap.snap(this._tilemap._lowerLayer);
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
						const bitmap = new Bitmap(48, 48 * height);
						bitmap.blt(tilemapBitmap, x * 48, y * 48, 48, 48 * height, 0, 0);
						const spr = new Sprite(bitmap);
						spr.anchor.set(0.5, 1);
						spr.move((x * 48) + 24, ((y + height - 1) * 48) + 48);
						spr._colY = ((y + regionId) * 48);
						spr._colZ = regionId * 48;
						spr.z = height == 1 ? 999 : 4;
						spr._espWorldObject = true;
						this._tilemap.addChild(spr);
					}
				}
			}
		}
	}
}

class ESPGameSprite extends Sprite {
	constructor(bitmap) {
		super(bitmap);

		this.espObject = null;

		this.ObjectHolderOffsetX = 0;
		this.ObjectHolderOffsetY = 0;

		this.setupShadow();
		this.setupObjectHolder();
	}

	setupShadow() {
		this.ShadowSprite = new Sprite(ImageManager.loadSystem("Shadow4"));
		this.ShadowSprite.anchor.set(0.5);
		this.ShadowSprite.z = 3;
		this.ShadowSprite.move(-4, 0);
		this.addChild(this.ShadowSprite);
	}

	setupObjectHolder() {
		this.ObjectHolder = new PIXI.Container();
		this.addChild(this.ObjectHolder);
	}

	setSpritesVisibility(sprites, val) {
		const len = sprites.length;
		const result = sprites[0].visible;
		for(let i = 0; i < len; i++) {
			sprites[i].visible = val;
		}
		return result;
	}

	hideSprites(sprites) {
		return this.setSpritesVisibility(sprites, false);
	}

	showSprites(sprites) {
		return this.setSpritesVisibility(sprites, true);
	}

	update() {
		super.update();
		this.updateObjectHolderChildren();
		this.updatePosition();
		this.updateShadowSprite();
	}

	updateObjectHolderChildren() {
		const len = this.ObjectHolder.children.length;
		for(let i = 0; i < len; i++) {
			const spr = this.ObjectHolder.children[i];
			if(spr && spr.update) {
				spr.update();
			}
		}
	}

	updatePosition() {
		if(this.espObject) {
			this.x = this.espObject.position.x;
			this.y = this.espObject.position.y + (this.espObject.CollisionHeight * -48);
			this.ObjectHolder.x = this.ObjectHolderOffsetX;
			this.ObjectHolder.y = this.ObjectHolderOffsetY + -this.espObject.position.z;
			this._customLayerValue = this.espObject.position.y;
	
			this._colY = this.espObject.position.y + this.espObject.rectHeight();
			this._objY = this.espObject.position.y;
			this._colZ = this.espObject.position.z + (this.espObject.CollisionHeight * 48) + 1;
		}
	}

	updateShadowSprite() {
	}
}
