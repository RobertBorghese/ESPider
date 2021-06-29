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

		this._tilemap.visible = false;
		this._loadedESPider = false;
		for(const bitmap of this._tilemap._bitmaps) {
			if(bitmap) {
				bitmap.addLoadListener(this.OnBitmapsLoaded.bind(this));
			}
		}
	}

	initialize() {
		ESP.Spriteset_Map.initialize.apply(this, arguments);
		this.initializeFadeMembers();
		this.initializeTransitionMembers();
	}

	initializeFadeMembers() {
		this._espFadeMode = 0;
		this._espFadeTime = 0;
		this._espMaxFadeTime = 40;

		this._fadeCircle = new PIXI.Graphics();
		this._fadeCircle.move = function(x, y) { this.x = x; this.y = y; };
		this._fadeCircle.beginFill(0x000000);
		this._fadeCircle.lineStyle(0);
		this._fadeCircle.drawRect(0, 0, 2000, 2000);
		this._fadeCircle.endFill();
		this._fadeCircle.visible = false;
		this._fadeCircle.rotation = Math.PI / 4;
		this._fadeCircle.pivot.set(2000 / 2);
		this._fadeCircle.filters = [new PIXI.filters.PixelateFilter(40)];
		this.addChild(this._fadeCircle);
	}

	initializeTransitionMembers() {
		this._espTransitionMode = 0;
		this._espTransitionTime = 0;
		this._espTransitionIndexes = [];
		this._espBottomIndex = 0;

		this._ESP_GROUND_TRANSITION_TIME = 40;//60;
		this._ESP_GROUND_EASING = Easing.easeInOutCubic;
		this._ESP_OBJECT_TRANSITION_OFFSET = 0.02;//0.01;
		this._ESP_OBJECT_DISTANCE = 900;
		this._ESP_OBJECT_PER_FRAME = 7;
		this._ESP_OBJECT_EASING = Easing.easeInOutCubic;
	}

	update() {
		ESP.Spriteset_Map.update.apply(this, arguments);
		this.updateFade();
		this.updateTransition();
	}

	updateFade() {
		if(this._espFadeMode > 0) {
			this._espFadeTime += (this._espFadeMode === 1) ? 1 : -1;

			const ratio = this._espFadeTime / this._espMaxFadeTime;
			this._fadeCircle.scale.set(ratio);

			if(this._espFadeMode === 2 && this._espFadeTime === 0) {
				this._espFadeMode = 0;
				this._fadeCircle.visible = false;
				this.onFadeComplete(true);
			} else if(this._espFadeMode === 1 && this._espFadeTime === this._espMaxFadeTime) {
				this._espFadeMode = 0;
				this.onFadeComplete(false);
			}
		}
	}

	fadeIn() {
		this._espFadeMode = 2;
		this._espFadeTime = this._espMaxFadeTime;
		this._fadeCircle.visible = true;
		this._fadeCircle.move($gameMap.width() * TS, $gameMap.height() * TS);
		this.updateFade();
	}

	fadeOut() {
		this._espFadeMode = 1;
		this._espFadeTime = 0;
		this._fadeCircle.visible = true;
		this._fadeCircle.move(0, 0);
		this.updateFade();
	}

	onFadeComplete(isIn) {
		$gameMap.onESPFadeOutComplete(isIn);
	}

	updateTransition() {
		if(this._espTransitionMode > 0) {
			this._espTransitionTime += (this._espTransitionMode === 1 ? 1 : -1);
			if(this._espTransitionTime <= this._ESP_GROUND_TRANSITION_TIME) {
				this._transitionCirlce.visible = true;
				const Ratio = this._ESP_GROUND_EASING(this._espTransitionTime / this._ESP_GROUND_TRANSITION_TIME);
				this._transitionCirlce.scale.set(Ratio);
				this.setAllSpriteAlpha(1 - Ratio);
				if(this._espTransitionMode === 2) {
					this._updateTransitionCirclePosition();
					if(this._espTransitionTime === this._ESP_GROUND_TRANSITION_TIME) {
						this.OnPlayerVisibleFromIn();
					}
					if(this._espTransitionTime <= 0) {
						this._transitionCirlce.visible = false;
						this._espTransitionMode = 0;
						this.OnTransitionComplete(true);
					}
				}
			} else {
				const MaxIndex = this._espTransitionIndexes.length;
				const Index = Math.floor((this._espTransitionTime - this._ESP_GROUND_TRANSITION_TIME) * this._ESP_OBJECT_PER_FRAME).clamp(0, MaxIndex);
				for(let i = this._espBottomIndex; i < Index; i++) {
					const data = this._espTransitionIndexes[i];
					const spr = this._espWorldSprites[data[0]];
					if(!spr.__espDuration) spr.__espDuration = 0;
					spr.__espDuration += this._ESP_OBJECT_TRANSITION_OFFSET * (this._espTransitionMode === 1 ? 1 : -1);
					spr.__espDuration = spr.__espDuration.clamp(0, 1);
					const Ratio = (this._ESP_OBJECT_EASING(spr.__espDuration) * this._ESP_OBJECT_DISTANCE);
					this._updateTransitionObjectPosition(spr, data[1], Ratio);
					if(spr.__espDuration >= 1 && this._espBottomIndex < i) {
						this._espBottomIndex = i;
					}
				}
				if(this._espTransitionMode === 1 && this._espBottomIndex >= MaxIndex - 1) {
					this._espTransitionMode = 0;
					this.OnTransitionComplete(false);
				}
			}
		}
	}

	transitionIn() {
		this._randomizeTransitionIndexes(1);
		this.setAllSpriteAlpha(0);
		this._espTransitionMode = 2;
		this._espTransitionTime = this._calculateEndTime();
		this._espBottomIndex = 0;
		this._transitionCirlce.scale.set(1);
		this._transitionCirlce.visible = true;
		this._updateTransitionCirclePosition();
	}

	transitionOut() {
		this._randomizeTransitionIndexes(0);
		this.setAllSpriteAlpha(1);
		this._espTransitionMode = 1;
		this._espTransitionTime = 0;
		this._espBottomIndex = 0;
		this._transitionCirlce.scale.set(0);
		this._transitionCirlce.visible = false;
		this._updateTransitionCirclePosition();
	}

	_updateTransitionObjectPosition(spr, dir, ratio) {
		switch(dir) {
			case 0: { spr.move(spr._espBaseX + ratio, spr._espBaseY); break; }
			case 1: { spr.move(spr._espBaseX - ratio, spr._espBaseY); break; }
			case 2: { spr.move(spr._espBaseX, spr._espBaseY + ratio); break; }
			case 3: { spr.move(spr._espBaseX, spr._espBaseY - ratio); break; }
		}
	}

	_calculateEndTime() {
		return this._ESP_GROUND_TRANSITION_TIME + ((1 / this._ESP_OBJECT_TRANSITION_OFFSET) + Math.ceil(this._espWorldSprites.length / this._ESP_OBJECT_PER_FRAME));
	}

	_randomizeTransitionIndexes(initValue) {
		this._espTransitionIndexes = [];
		const len = this._espWorldSprites.length;
		for(let i = 0; i < len; i++) {
			const spr = this._espWorldSprites[i];
			const dir = Math.randomInt(4);
			spr.__espDuration = initValue;
			this._updateTransitionObjectPosition(spr, dir, initValue * this._ESP_OBJECT_DISTANCE);
			this._espTransitionIndexes.push([i, dir]);
		}
		this._espTransitionIndexes.shuffle();
	}

	_updateTransitionCirclePosition() {
		this._transitionCirlce.x = this._espPlayer.x - 10;
		this._transitionCirlce.y = this._espPlayer.y;
	}

	setAllSpriteAlpha(alpha) {
		this._tilemap._espSprites.forEach(function(spr) {
			spr.alpha = alpha;
		});
	}

	OnTransitionComplete(wasIn) {
		if(!wasIn) $gameMap.onTransferReady();
		else $gameMap.onTransferInReady();
	}

	OnPlayerVisibleFromIn() {
		$gameMap.onTransferInVisible();
	}

	OnBitmapsLoaded() {
		if(!this._loadedESPider && this._tilemap.isReady()) {
			this._loadedESPider = true;
			this._tilemap.visible = true;
			this.ConstructWorldBitmaps();
			this.transitionIn();
		}
	}

	ConstructWorldBitmaps() {
		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;

		this._espWorldSprites = [];

		this._transitionCirlce = new PIXI.Graphics();
		this._transitionCirlce.beginFill(0xffffff);
		this._transitionCirlce.lineStyle(0);
		this._transitionCirlce.drawCircle(0, 0, 900);
		this._transitionCirlce.endFill();
		this._transitionCirlce.z = 1;
		this._transitionCirlce.visible = false;
		this._transitionCirlce.filters = [new PIXI.filters.PixelateFilter(40)];
		this._tilemap.addChild(this._transitionCirlce);

		this._tilemap._needsRepaint = true;
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
					const bitmap = new Bitmap(TS, TS * height);
					bitmap.blt(tilemapBitmap, x * TS, y * TS, TS, TS * height, 0, 0);
					const spr = new Sprite(bitmap);
					spr.anchor.set(0.5, 1);
					spr._espBaseX = (x * TS) + TS2;
					spr._espBaseY = ((y + height - 1) * TS) + TS;
					spr.move(spr._espBaseX, spr._espBaseY);
					spr._colY = ((y + regionId) * TS);
					spr._colZ = regionId * TS;
					spr.z = height == 1 ? 999 : 4;
					spr._espWorldObject = true;
					this._espWorldSprites.push(spr);
					this._tilemap.addChild(spr);
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

		this.IsGameActive = true;

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

	setActive(active) {
		this.IsGameActive = active;
	}

	update() {
		super.update();
		if(this.IsGameActive) {
			this.updateObjectHolderChildren();
			this.updatePosition();
			this.updateShadowSprite();
		}
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
			this.y = this.espObject.displayY();
			this.ObjectHolder.x = this.ObjectHolderOffsetX;
			this.ObjectHolder.y = this.ObjectHolderOffsetY + -this.espObject.position.z;
			this._customLayerValue = this.espObject.position.y;
	
			this._colY = this.espObject.position.y + this.espObject.rectHeight();
			this._objY = this.espObject.position.y;
			this._colZ = this.espObject.position.z + (this.espObject.CollisionHeight * TS) + 1;
		}
	}

	updateShadowSprite() {
	}
}
