// SPRITES. Not from mcdonalds, dont worry.

modify_Spriteset_Map = class {
	initialize() {
		this._espIsFrozen = false;
		if(!this._unfreezable) this._unfreezable = [];
		this.initializeWorldTransparency();
		this.initializeTransitionMembers();

		ESP.Spriteset_Map.initialize.apply(this, arguments);

		this._tilemap._uiHolder = new Sprite();
		this._tilemap.addChild(this._tilemap._uiHolder);

		this.initializeFadeMembers();

		this._espHasForcedAboveSprites = false;
	}

	ensureSpritesAreForcedAbove() {
		if(this._espWorldSpriteIndexes && this._tilemap._espSprites && this._tilemap._espSprites.length > 0 && !this._espHasForcedAboveSprites) {
			this._espHasForcedAboveSprites = true;
			this._tilemap._espSprites.forEach(spr => {
				if(spr.espObject._forceAboveGround) {
					spr._ensureAbove = this._espWorldSpriteIndexes[spr.espObject.__eventX + (spr.espObject.__eventY * $gameMap.width())];
				}
			});
		}
	}

	createCharacters() {
		//ESP.Spriteset_Map.createCharacters.apply(this, arguments);

		if($gameMap.starBackground) {
			const background = Sprite_StarsBackground.makeColor(Graphics.width, $gameMap.height() * TS);
			background.z = -2;
			this._tilemap.addChild(background);

			const spr = new Sprite_StarsBackground(Graphics.width, $gameMap.height() * TS, 1200);
			spr.z = -1;
			this._starBackground = spr;
			this._tilemap.addChild(spr);
		}

		this._espPlayer = new ESPPlayerSprite();
		this._espPlayer.z = 4;
		this._tilemap._espPlayer = this._espPlayer;
		this._tilemap.addChild(this._espPlayer);

		this._tilemap._espSprites = [this._espPlayer];
		this._tilemap._espMovingPlatforms = [];

		const objects = $gameMap.getGameObjects();
		const len = objects.length;
		for(let i = 0; i < len; i++) {
			this.addGameSprite(objects[i]);
		}

		const movingPlatforms = $gameMap.getMovingPlatforms();
		for(let i = 0; i < movingPlatforms.length; i++) {
			this.addGameSprite(movingPlatforms[i]);
		}

		this.ensureSpritesAreForcedAbove();

		this._hudHolder = new Sprite();
		this.addChild(this._hudHolder);
	}

	addGameSprite(obj) {
		const spr = obj.constructSprite();
		spr.espObject = obj;
		if(this._addBelowPlayer) {
			if(this._addBelowPlayer === 2) {
				this._tilemap.addChildAt(spr, this._tilemap.getChildIndex(this._espPlayer) + 1);
			} else {
				this._tilemap.addChildAt(spr, this._tilemap.getChildIndex(this._espPlayer));
			}
			this._addBelowPlayer = false;
		} else {
			this._tilemap.addChild(spr);
		}
		if(obj.isMovingPlatform()) {
			this._tilemap._espMovingPlatforms.push(spr);
		} else {
			this._tilemap._espSprites.push(spr);
		}
		if(!spr.freezable()) {
			if(!this._unfreezable) this._unfreezable = [];
			this._unfreezable.push(spr);
		}
	}

	findGameSprite(obj) {
		const sprites = obj.isMovingPlatform() ? this._tilemap._espMovingPlatforms : this._tilemap._espSprites;
		const len = sprites.length;
		for(let i = 0; i < len; i++) {
			const spr = sprites[i];
			if(spr.espObject === obj) {
				return spr;
			}
		}
	}

	removeGameSprite(obj) {
		const spr = this.findGameSprite(obj);
		if(spr) {
			this._tilemap.removeChild(spr);
			if(obj.isMovingPlatform()) {
				this._tilemap._espMovingPlatforms.remove(spr);
			} else {
				this._tilemap._espSprites.remove(spr);
			}
			if(this._unfreezable.contains(spr)) {
				this._unfreezable.remove(spr);
			}
			spr.destroy();
		}
	}

	createTilemap() {
		ESP.Spriteset_Map.createTilemap.apply(this, arguments);

		this._tilemap.visible = false;
		this.visible = false;
		this._loadedESPider = false;
		for(const bitmap of this._tilemap._bitmaps) {
			if(bitmap) {
				bitmap.addLoadListener(this.OnBitmapsLoaded.bind(this));
			}
		}
	}

	initializeWorldTransparency() {
		this.__makeWorldTransparent = false;
		this.__makeWorldAlpha = 1;
		this.__makeWorldTargetAlpha = 1;
	}

	initializeFadeMembers() {
		this._espFadeMode = 0;
		this._espFadeTime = 0;
		this._refreshMaxFadeTime();

		this._fadeCircle = new PIXI.Graphics();
		this._fadeCircle.move = function(x, y) { this.x = x; this.y = y; };
		this._fadeCircle.beginFill(0x000000);
		this._fadeCircle.lineStyle(0);
		this._fadeCircle.drawRect(0, 0, 2500, 2500);
		this._fadeCircle.endFill();
		this._fadeCircle.visible = false;
		this._fadeCircle.rotation = Math.PI / 4;
		this._fadeCircle.pivot.set(2500 / 2);
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
		this._ESP_OBJECT_DISTANCEX = 1300;
		this._ESP_OBJECT_DISTANCEY = 1000;
		this._ESP_OBJECT_PER_FRAME = 7;
		this._ESP_OBJECT_EASING = Easing.easeInOutCubic;
	}

	update() {
		if(this._espTransitionMode === 0) {
			this.updateWorldSpriteVisibility();
		}
		if(!this._espIsFrozen) {
			ESP.Spriteset_Map.update.apply(this, arguments);
		} else if(this._espIsFrozen !== 2) {
			this._espPlayer.update();
			this._unfreezable.forEach(s => s.update());
		}
		this.updateShake();
		this.updateWorldTransparency();
		this.updateFade();
		this.updateTransition();
	}

	shake() {
		this.x = 0;
		this._shakeTimer = 5;
		this._shakeXSpeed = Math.round($espGamePlayer.speed.x) > 0 ? -8 : 8;
		this.__shakeThing = true;
	}

	updateShake() {
		if(this.__shakeThing) {
			if(!this._shakeXSpeed) {
				this._shakeXSpeed = Math.round($espGamePlayer.speed.x) > 0 ? -6 : 6;
			}
			this.x += this._shakeXSpeed;
			if(this._shakeXSpeed > 0) this._shakeXSpeed -= 0.5;
			else if(this._shakeXSpeed < 0) this._shakeXSpeed += 0.5;
			if(this._shakeTimer > 0) {
				this._shakeTimer--;
				if(this._shakeTimer <= 0) {
					this.x = 0;
					this.__shakeThing = false;
				}
			}
		}
	}

	updateWorldTransparency() {
		if(this._espWorldSprites) {
			const highest = $espGamePlayer.findLowestShow();
			const makeWorldTransparent = !$gameMap._isTranferring && ($espGamePlayer.realZ() < ((highest * TS) - (TS * 0.75)));
			if(this.__makeWorldTransparent !== makeWorldTransparent) {
				this.__makeWorldTransparent = makeWorldTransparent;
				this.__makeWorldTargetAlpha = makeWorldTransparent ? 0.5 : 1;
				$espGamePlayer._customColor = makeWorldTransparent ? [0, 0, 0] : null;
			}
		}
		if(this.__makeWorldAlpha < this.__makeWorldTargetAlpha) {
			this.__makeWorldAlpha += 0.05;
			if(this.__makeWorldAlpha >= this.__makeWorldTargetAlpha) this.__makeWorldAlpha = this.__makeWorldTargetAlpha;
			this._espWorldSprites.forEach(w => w.alpha = this.__makeWorldAlpha);
		} else if(this.__makeWorldAlpha > this.__makeWorldTargetAlpha) {
			this.__makeWorldAlpha -= 0.05;
			if(this.__makeWorldAlpha <= this.__makeWorldTargetAlpha) this.__makeWorldAlpha = this.__makeWorldTargetAlpha;
			this._espWorldSprites.forEach(w => w.alpha = this.__makeWorldAlpha);
		}
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

	_refreshMaxFadeTime() {
		this._espMaxFadeTime = $gameMap.shouldFastDeathFade() ? 20 : 40;
	}

	fadeIn() {
		this._espFadeMode = 2;
		this._espFadeTime = this._espMaxFadeTime;
		this._fadeCircle.visible = true;
		this._fadeCircle.move(Graphics.width, Graphics.height);
		this.updateFade();
	}

	fadeOut() {
		this._refreshMaxFadeTime();
		this._espFadeMode = 1;
		this._espFadeTime = 0;
		this._fadeCircle.visible = true;
		this._fadeCircle.move(0, 0);
		this.updateFade();
	}

	onFadeComplete(isIn) {
		$gameMap.onESPFadeOutComplete(isIn);
	}

	canMoveCamera() {
		return this._espTransitionMode === 0 || this._espTransitionMode === 2;
	}

	getGroundTransitionTime() {
		return $gameTemp._isNewGame ? this._ESP_GROUND_TRANSITION_TIME * 10 : this._ESP_GROUND_TRANSITION_TIME;
	}

	getObjectPerFrame() {
		return $gameTemp._isNewGame ? this._ESP_OBJECT_PER_FRAME : this._ESP_OBJECT_PER_FRAME;
	}

	updateTransition() {
		const transitionTime = this.getGroundTransitionTime();

		if(this._espTransitionMode > 0) {
			this._espTransitionTime += (this._espTransitionMode === 1 ? 1 : -1);
			if(this._espTransitionTime <= transitionTime) {
				this._transitionCirlce.visible = true;
				const Ratio = this._ESP_GROUND_EASING(this._espTransitionTime / transitionTime);
				if($gameTemp._isNewGame) {
					this._tilemap.scale.set((Ratio * 5) + 1);
				}
				this._transitionCirlce.scale.set(Ratio);
				this.setAllSpriteAlpha(1 - Ratio);
				if($gameTemp._isNewGame) {
					this._espWorldSprites.forEach(w => w.alpha = (1 - Ratio));
				}
				if(this._espTransitionMode === 2) {
					if(this.__oldESPPlayerX !== this._espPlayer.x || this.__oldESPPlayerY !== this._espPlayer.y) {
						this.__oldESPPlayerX = this._espPlayer.x;
						this.__oldESPPlayerY = this._espPlayer.y;
						this._updateTransitionCirclePosition();
						this._updateTransitionCircleSizedBasedOnPosition();
					}
					if(this._espTransitionTime === transitionTime) {
						this.OnPlayerVisibleFromIn();
					}
					if(this._espTransitionTime <= 0) {
						this._transitionCirlce.visible = false;
						this._espTransitionMode = 0;
						this.OnTransitionComplete(true);
						if($gameTemp._isNewGame) {
							this._tilemap.scale.set(1);
						}
					}
				}
				if($gameTemp._isNewGame) {
					if(this._espWorldSprites && this._espWorldSprites[0] && !this._espWorldSprites[0].visible) {
						this._espWorldSprites.forEach(w => w.visible = true);
					}
				}
			} else {
				if($gameTemp._isNewGame) {
					this._tilemap.scale.set(6);
				}
				this.setAllSpriteAlpha(0);
				const MaxIndex = this._espTransitionIndexes.length;
				const Index = Math.floor((this._espTransitionTime - transitionTime) * this.getObjectPerFrame()).clamp(0, MaxIndex);
				for(let i = this._espBottomIndex; i < Index; i++) {
					const data = this._espTransitionIndexes[i];
					const spr = this._espWorldSprites[data[0]];
					if($gameTemp._isNewGame) {
						spr.visible = false;
					}
					spr.__espDuration += this._ESP_OBJECT_TRANSITION_OFFSET * (this._espTransitionMode === 1 ? 1 : -1);
					spr.__espDuration = spr.__espDuration.clamp(0, 1);
					const Ratio = (this._ESP_OBJECT_EASING(spr.__espDuration) * (data[1] >= 2 ? this._ESP_OBJECT_DISTANCEY : this._ESP_OBJECT_DISTANCEX));
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
		this._transitionCirlce.scale.set(9999);
		this._transitionCirlce.visible = true;
		this._updateTransitionCirclePosition();
		this._updateTransitionCircleSizedBasedOnPosition();
		this._createShadowFilter();
		this._myFilter.alpha = 0.5;
		this._putWorldGeometryInFilterHolder();
		$gameMap._isTranferring = true;
		SceneManager?._scene?.updateCameraPos?.(true);
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
		this._updateTransitionCircleSizedBasedOnPosition();
		this._createShadowFilter();
		this._myFilter.alpha = 0;
		this._putWorldGeometryInFilterHolder();
		$gameMap._isTranferring = true;
		if(!$gameMap._isNewGame) ESPAudio.transferOut();
	}

	_putWorldGeometryInFilterHolder() {
		const len = this._espWorldSprites.length;
		for(let i = 0; i < len; i++) {
			const s = this._espWorldSprites[i];
			s.parent.removeChild(s);
			if(s._colZ <= (($gameMap._espNewMapPosition ? $gameMap._espNewMapPosition.z : $espGamePlayer.CollisionHeight) * TS) + 1) {
				this._underHolder.addChild(s);
			} else {
				this._filterHolder.addChild(s);
			}
		}
	}

	_removeWorldGeometryFromFilterHolder() {
		if(!this._filterHolder) return;
		const len = this._espWorldSprites.length;
		for(let i = 0; i < len; i++) {
			const s = this._espWorldSprites[i];
			s.parent.removeChild(s);
			this._filterHolder.parent.addChild(s);
		}
	}

	_createShadowFilter() {
		if(!this._myFilter) {
			this._myFilter = new PIXI.filters.DropShadowFilter({
				distance: 10,
				alpha: 0
			});
			this._filterHolder = new Sprite();
			this._filterHolder.filters = [this._myFilter];
			this._filterHolder.z = 99999999;

			this._underHolder = new Sprite();
			this._underHolder.z = 0;

			if(this._espWorldSprites && this._espWorldSprites[0]) {
				this._espWorldSprites[0].parent.addChild(this._filterHolder);
				this._espWorldSprites[0].parent.addChild(this._underHolder);
			}
		}
	}

	_updateTransitionObjectPosition(spr, dir, ratio) {
		switch(dir) {
			case 0: { spr.move(spr._espCurrX + ratio, spr._espCurrY); break; }
			case 1: { spr.move(spr._espCurrX - ratio, spr._espCurrY); break; }
			case 2: { spr.move(spr._espCurrX, spr._espCurrY + ratio); break; }
			case 3: { spr.move(spr._espCurrX, spr._espCurrY - ratio); break; }
		}
	}

	_calculateEndTime() {
		return (this.getGroundTransitionTime()) + ((1 / this._ESP_OBJECT_TRANSITION_OFFSET) + Math.ceil(this._espWorldSprites.length / this.getObjectPerFrame()));
	}

	freezeWorldSpriteVisibility(locations) {
		this._espWorldRenderingFrozen = true;
		{
			const len = this._espWorldSprites.length;
			for(let i = 0; i < len; i++) {
				this._espWorldSprites[i].visible = false;
			}
		}
		{
			const width = $dataMap.width;
			const len = locations.length;
			for(let i = 0; i < len; i++) {
				const x = locations[i][0];
				const y = locations[i][1];
				this._espWorldSpriteIndexes[x + (y * width)].visible = true;
			}
		}
	}

	unfreezeWorldSpriteVisibility() {
		this._espWorldRenderingFrozen = false;
	}

	updateWorldSpriteVisibility() {
		if(this._espWorldRenderingFrozen) return;
		if(!this._espWorldSprites) return;
		const len = this._espWorldSprites.length;
		const camX = -this._cameraTargetX;
		const camY = -this._cameraTargetY;
		const left = (camX - TS);
		const top = (camY - TS);
		const right = (Graphics.width + camX + (TS * 2));
		const bottom = (Graphics.height + camY + (TS * 2));
		for(let i = 0; i < len; i++) {
			const spr = this._espWorldSprites[i];
			if(spr._espSurronded) spr.visible = false;
			else if(spr._alwaysBelowEverything) spr.visible = false;
			else spr.visible = !((spr.x + spr._espLeft) > right || (spr.x + spr._espRight) < left || (spr.y + spr._espTop) > bottom || (spr.y + spr._espBottom) < top);
		}
	}

	_randomizeTransitionIndexes(initValue) {
		if(SceneManager._scene?.updateCameraPos) SceneManager._scene.updateCameraPos(true);
		this._espTransitionIndexes = [];
		const len = this._espWorldSprites.length;
		const camX = $gameMap.ESPCameraX;
		const camY = $gameMap.ESPCameraY;
		const left = (camX - TS);
		const top = (camY - TS);
		const right = (Graphics.width + camX + (TS * 2));
		const bottom = (Graphics.height + camY + (TS * 2));
		for(let i = 0; i < len; i++) {
			const spr = this._espWorldSprites[i];
			if((spr.x + spr._espLeft) > right || (spr.x + spr._espRight) < left || (spr.y + spr._espTop) > bottom || (spr.y + spr._espBottom) < top) {
				spr.visible = false;
			} else {
				spr.visible = true;
				const dir = Math.randomInt(4);
				spr.__espDuration = initValue;
				this._updateTransitionObjectPosition(spr, dir, initValue * (dir >= 2 ? this._ESP_OBJECT_DISTANCEY : this._ESP_OBJECT_DISTANCEX));
				this._espTransitionIndexes.push([i, dir]);
			}
		}
		this._espTransitionIndexes.shuffle();
		this._ESP_OBJECT_PER_FRAME = ((len / 10));
	}

	_updateTransitionCirclePosition() {
		if(this._transitionCirlce && this._espPlayer) {
			this._transitionCirlce.x = this._espPlayer.x - 10;
			this._transitionCirlce.y = this._espPlayer.y;
		}
	}

	_updateTransitionCircleSizedBasedOnPosition() {
		if(!this._transitionCirlce) return;
		
		if(!this.__oldTransitionCirlceSize) {
			this.__oldTransitionCirlceSize = -1;
		}

		const x = this._transitionCirlce.x;
		const width = ($gameMap.width() * TS);
		const t = 80;
		const closest = Math.min(x, width - x);
		let newSize = 900 + ((width / 2) - closest);

		if(this.__oldTransitionCirlceSize !== newSize) {
			this.__oldTransitionCirlceSize = newSize;
			this._transitionCirlce.clear();
			this._transitionCirlce.beginFill(0xffffff);
			this._transitionCirlce.lineStyle(0);
			this._transitionCirlce.drawCircle(0, 0, newSize);
			this._transitionCirlce.endFill();
		}
	}

	setAllSpriteAlpha(alpha) {
		if(this?._tilemap?._espSprites) {
			this._tilemap._espSprites.forEach(function(spr) {
				if(spr.doNotShowOnTransition()) {
					spr.alpha = Math.floor(alpha);
				} else {
					spr.alpha = alpha;
				}
			});
		}
		if(this?._tilemap?._espMovingPlatforms) {
			this._tilemap._espMovingPlatforms.forEach(function(spr) {
				spr.alpha = alpha;
			});
		}
		if(this._myFilter) {
			this._myFilter.alpha = 0.5 * (1 - alpha);
		}
	}

	OnTransitionComplete(wasIn) {
		$gameTemp._isNewGame = false;
		this._removeWorldGeometryFromFilterHolder();
		this._myFilter = null;
		if(!wasIn) $gameMap.goToNewMap();
		else $gameMap.onTransferInReady();
		if(wasIn) this._espWorldSprites.forEach(s => s.visible = true);
	}

	OnPlayerVisibleFromIn() {
		$gameMap.onTransferInVisible();
		if($gameMap._isNewGame === false) {
			ESPAudio.transferIn();
		}
	}

	OnBitmapsLoaded() {
		if(!this._loadedESPider && this._tilemap.isReady()) {
			this._loadedESPider = true;
			this._tilemap.visible = true;
			this.ConstructWorldBitmaps();
			if($gameMap.skipTransitionIn) {
				this.OnTransitionComplete(true);
			} else {
				this.transitionIn();
			}
			this.visible = true;
		}
	}

	ConstructWorldBitmaps() {
		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;

		this._espWorldSprites = [];
		this._espWorldSpriteIndexes = [];

		this._transitionCirlce = new PIXI.Graphics();
		this._transitionCirlce.beginFill(0xffffff);
		this._transitionCirlce.lineStyle(0);
		this._transitionCirlce.drawCircle(0, 0, 900);
		this._transitionCirlce.endFill();
		this._transitionCirlce.z = 1;
		this._transitionCirlce.visible = false;
		this._transitionCirlce.filters = [new PIXI.filters.PixelateFilter(20)];
		this._tilemap.addChild(this._transitionCirlce);

		this._tilemap._needsRepaint = true;
		this._tilemap.updateTransform();
		if(this._tilemapBitmap) {
			this._tilemapBitmap.destroy();
			this._tilemapBitmap = null;
		}
		this._tilemapBitmap = Bitmap.snapWhole(this._tilemap._lowerLayer, this._tilemap.width, this._tilemap.height);
		const tilemapBitmap = this._tilemapBitmap;
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < $gameMap.MapBottom; y++) {
				const regionId = $gameMap.getColHeight(x, y);
				if(regionId > 0) {
					let height = 0;
					if(($gameMap.getColHeight(x, y + 1)) > 0) {
						height = 1;
					} else {
						height = 2;
						for(let i = 2; i <= regionId; i++) {
							if(($gameMap.getColHeight(x, y + i)) > 0) {
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
					spr.espMove = function(x, y) {
						this._espCurrX = x;
						this._espCurrY = y;
						this.move(x, y);
					};
					spr.espOffset = function(x, y) {
						this.espMove(this._espCurrX + x, this._espCurrY + y);
					};
					if($gameMap.AlwaysBelowCallback) {
						spr._alwaysBelowEverything = $gameMap.AlwaysBelowCallback(spr, regionId);
					}
					if(regionId === 18) {
						spr._alwaysBelowPlayer = true;
					}
					spr.espMove(spr._espBaseX, spr._espBaseY);
					spr._colY = ((y + regionId) * TS);
					spr._colZ = regionId * TS;
					spr._espLeft = (bitmap.width / -2) - 10;
					spr._espRight = (bitmap.width / 2) + 10;
					spr._espTop = (-bitmap.height) - 10;
					spr._espBottom = 10;

					spr._espSurronded = false;

					if($gameMap.getColHeight(x - 1, y) === regionId && $gameMap.getColHeight(x - 1, y) === regionId &&
						$gameMap.getColHeight(x, y - 1) === regionId && $gameMap.getColHeight(x, y + 1) === regionId &&
						$gameMap.getColHeight(x - 1, y - 1) === regionId && $gameMap.getColHeight(x + 1, y - 1) === regionId &&
						$gameMap.getColHeight(x - 1, y + 1) === regionId && $gameMap.getColHeight(x + 1, y + 1) === regionId) {
						spr._espSurronded = true;
					}

					if(spr._espSurronded) {
						currLoop: for(let i = regionId; i >= 2; i--) {
							if($gameMap.getColHeight(x, y - i) !== regionId || $gameMap.getColHeight(x - 1, y - i) !== regionId || $gameMap.getColHeight(x + 1, y - i) !== regionId) {
								spr._espSurronded = false;
								break currLoop;
							}
						}
					}

					if(!spr._espSurronded && $gameMap.permaInvisibleFunc) {
						spr._espSurronded = $gameMap.permaInvisibleFunc(spr);
					}

					// try and make far-out walls dark?
					/*
					if(spr._espSurronded && $gameMap.highestRegionId === regionId) {
						let radius = 1;
						let result = 0;
						whileloop: while(true) {
							for(let xx = (x - radius); xx <= (x + radius); xx++) {
								const yy = y - radius;
								const yy2 = y + radius;
								if($gameMap.getColHeight(xx, yy) !== regionId || $gameMap.getColHeight(xx, yy2) !== regionId) {
									result = radius;
									break whileloop;
								}
							}
							for(let yy = (x - radius + 1); yy <= (x + radius - 1); yy++) {
								const xx = x - radius;
								const xx2 = x + radius;
								if($gameMap.getColHeight(xx, yy) !== regionId || $gameMap.getColHeight(xx2, yy) !== regionId) {
									result = radius;
									break whileloop;
								}
							}
							radius++;
						}
						spr._espDesiredAlpha = result <= 1 ? 1 : (result === 2 ? 0.7 : (result === 3 ? 0.4 : (result === 4 ? 0.1 : 0)));
					} else {
						spr._espDesiredAlpha = 1;
					}
					*/

					spr.update = null;
					spr.z = height == 1 ? 999 : 4;
					spr._espWorldObject = true;
					this._espWorldSpriteIndexes[x + (y * mapWidth)] = spr;
					this._espWorldSprites.push(spr);
					this._tilemap.addChild(spr);
				}
			}
		}

		this.ensureSpritesAreForcedAbove();
	}

	setFrozen(frozen) {
		this._espIsFrozen = frozen;
	}

	lerp(a, b, x) {
		if(Math.abs(a - b) < 0.1) return b;
		return a + (b - a) * x;
	}

	setCameraPos(x, y, force) {
		let newX = -(x.clamp(0, (($gameMap.maxCameraX() * TS * this._tilemap.scale.x) - Graphics.width)));
		const newY = -(y.clamp(0, (($gameMap.maxCameraY() * TS * this._tilemap.scale.y) - Graphics.height)));
		if(!force && !$gameMap.canMoveCameraX()) {
			newX = this._cameraTargetX;
		}
		if(this._cameraTargetX !== newX || this._cameraTargetY !== newY) {
			this._cameraTargetX = newX;
			this._cameraTargetY = newY;
			if(force) {
				this._tilemap.x = this._cameraTargetX;
				this._tilemap.y = this._cameraTargetY;
			}
		}
		if(!force) {
			if(this._tilemap.x !== this._cameraTargetX) {
				this._tilemap.x = this.lerp(this._tilemap.x, this._cameraTargetX, ESP.CameraSmoothing);
			}
			if(this._tilemap.y !== this._cameraTargetY) {
				this._tilemap.y = this.lerp(this._tilemap.y, this._cameraTargetY, ESP.CameraSmoothing);
			}
		}
		if(this._tilemap) {
			if(Math.abs(this._tilemap.x - Math.round(this._tilemap.x)) < 0.1) {
				this._tilemap.x = Math.round(this._tilemap.x);
			}
			if(Math.abs(this._tilemap.y - Math.round(this._tilemap.y)) < 0.1) {
				this._tilemap.y = Math.round(this._tilemap.y);
			}
		}
	}

	isCameraAtTarget(threshold) {
		return Math.abs(this._tilemap.x - this._cameraTargetX) < threshold && Math.abs(this._tilemap.y - this._cameraTargetY) < threshold;
	}

	getFloorColor(x, y, darken = null) {
		if(!this._tilemapBitmap) {
			return 0;
		}
		let tint = parseInt(this._tilemapBitmap.getPixel(x,y,1,1).substring(1), 16);
		if(darken) {
			tint = ((((tint & 0xff0000) >> 16) - darken).clamp(0, 0xff) << 16) |
				((((tint & 0x00ff00) >> 8) - darken).clamp(0, 0xff) << 8) |
				((((tint & 0x0000ff)) - darken).clamp(0, 0xff));
		}
		return tint;
	}

	getPlayerFloorColor(darken = null) {
		return this.getFloorColor(this._espPlayer.x, this._espPlayer.y, darken);
	}
}

class ESPGameSprite extends Sprite {
	constructor(bitmap) {
		super(bitmap);

		this.espObject = null;

		this.ObjectHolderOffsetX = 0;
		this.ObjectHolderOffsetY = 0;

		this.IsGameActive = true;

		this.Particles = [];

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
			this._colZBase = (this.espObject.CollisionHeight * TS) + 1;
			this._colZ = this.espObject.position.z + this._colZBase;

			this.updateAlpha();
		}
	}

	updateAlpha() {
	}

	updateShadowSprite() {
	}

	freezable() {
		return true;
	}

	doNotShowOnTransition() {
		return !!this.espObject?._doNotShowOnTransition;
	}

	addParticle(url, x, y, spdX, spdY, scaleData, alphaTime, time) {
		const p = new ESPParticle(ImageManager.loadBitmapFromUrl(url), x, y, spdX, spdY, scaleData, alphaTime, time);
		this.addChild(p);
		this.Particles.push(p);
		return p;
	}

	removeParticle(particle) {
		const index = this.Particles.indexOf(particle);
		if(index > -1) {
			this.Particles.splice(index, 1);
			this.removeChild(particle);
			particle.destroy();
		}
	}

	setupParticleSystem(url, countMin, countMax, scaleData, minAlpha, maxAlpha, minX, maxX, minY, maxY, minSpdX, maxSpdX, minSpdY, maxSpdY, alphaTime, minTime, maxTime) {
		function getRand(min, max) {
			return min + (Math.random() * (max - min));
		}

		const c = getRand(countMin, countMax);
		for(let i = 0; i < c; i++) {
			const p = this.addParticle(
				url,
				getRand(minX, maxX),
				getRand(minY, maxY),
				getRand(minSpdX, maxSpdX),
				getRand(minSpdY, maxSpdY),
				typeof scaleData === "object" ? {
					startScaleX: getRand(scaleData.startScaleXMin, scaleData.startScaleXMax),
					endScaleX: getRand(scaleData.endScaleXMin, scaleData.endScaleXMax),
					startScaleY: getRand(scaleData.startScaleYMin, scaleData.startScaleYMax),
					endScaleY: getRand(scaleData.endScaleYMin, scaleData.endScaleYMax),
				} : null,
				alphaTime,
				getRand(minTime, maxTime)
			);
			p._initAlpha = getRand(minAlpha, maxAlpha);
			if(typeof scaleData === "number") p.scale.set(scale);
		}
	}
}
