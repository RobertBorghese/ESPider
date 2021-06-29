// Hello map from dora de exporera. It's me, guy from reality.

modify_Scene_Map = class {
	updateMain() {
		ESP.Scene_Map.updateMain.apply(this, arguments);
		this.updateESPPlayer();
		this.updateESPGameObjects();
	}

	// update player
	updateESPPlayer() {
		$espGamePlayer.update();
	}

	// update game objects
	updateESPGameObjects() {
		if(!$gameMap.espIsFrozen()) {
			const objs = $gameMap.getGameObjects();
			const len = objs.length;
			for(let i = 0; i < len; i++) {
				objs[i].update();
			}
		}
	}

	// no button allowed!
	createMenuButton() {}

	// lets prevent da touching shit
	processMapTouch() {}
	onMapTouch() {}

	// lazy way to prevent menu
	isMenuCalled() { return false; }
}

modify_Game_Map = class {
	// lets begin!!
	initialize() {
		ESP.Game_Map.initialize.apply(this, arguments);
		this._espNewMapPosition = null;
		this._worldFrozen = false;
	}

	// setup for each map
	setup(mapId) {
		ESP.Game_Map.setup.apply(this, arguments);
		this.setupESPGame();
	}

	// setup the map for ESPider
	setupESPGame() {
		this._worldFrozen = false;
		this.initESPFields();
		this.setupCollisionMap();
		this.initStartingGameObjects();
		this.initMapEval();
		this.initPlayerPos();
	}

	// reset the map
	resetESPGame() {
		this._worldFrozen = false;
		this.removeAllGameObjects();
		this.initStartingGameObjects();
		$espGamePlayer.restoreRespawnPos();
	}

	// initialize fields for each map
	initESPFields() {
		this._mapObjects = [];
		this._gravityManipulators = [];
		this._espStartX = 0;
		this._espStartY = 0;
	}

	// setup collision map for 3d world
	setupCollisionMap() {
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

		this.MapBottom = mapHeight;

		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const regionId = this.tileId(x, y, 5);
				if(regionId > 0) {
					const newX = x;
					const newY = y + regionId;
					this.espCollisionMap[newX + (newY * mapWidth)] = regionId ?? 0;
					if(newY > mapHeight) {
						this.MapBottom = newY;
					}
					if(y === 0) {
						for(let i = newY - 1; i >= 0; i--) {
							this.espCollisionMap[newX + (i * mapWidth)] = 99;
						}
					}
				}
			}
		}
	}

	// any starting game objects get initiated here
	initStartingGameObjects() {
		this._otherGameObject = new ESPFireballObject();
		this.addGameObject(this._otherGameObject);
	}

	// handling map "notetags" very lazily
	initMapEval() {
		this._espTransitions = {};
		if($dataMap && $dataMap.note) {
			function addTransitionDir(dir, mapId, destDir, dest, requiredZ) {
				this._espTransitions[dir] = [mapId, destDir, dest, requiredZ];
			};
			const start = function(x, y) {
				this._espStartX = x;
				this._espStartY = y;
			}.bind(this);
			const up = addTransitionDir.bind(this, "up");
			const down = addTransitionDir.bind(this, "down");
			const left = addTransitionDir.bind(this, "left");
			const right = addTransitionDir.bind(this, "right");
			try {
				eval($dataMap.note);
			} catch(e) {}
		}
	}

	// put dat player down
	initPlayerPos() {
		if(this._espNewMapPosition === null) {
			$espGamePlayer.movexy(this._espStartX * TS, this._espStartY * TS);
		} else {
			$espGamePlayer.movexy(this._espNewMapPosition.x, this._espNewMapPosition.y);
		}
		$espGamePlayer.makeCustscene();
		$espGamePlayer.CollisionHeight = 0;
		$espGamePlayer.resetSpeed();
		$espGamePlayer.saveRespawnPos();
	}

	// upon transferring in and the transfer is done
	onTransferInReady() {
		if(this._espNewMapPosition !== null) {
			this._espNewMapPosition = null;
			$espGamePlayer.makePlayable();
			$espGamePlayer.saveRespawnPos();
		}
	}

	// upon transferring in and the player is visible (even if transparent)
	onTransferInVisible() {
		if(this._espNewMapPosition !== null) {
			$espGamePlayer.reset(this._espNewMapPosition.x, this._espNewMapPosition.y, this._espNewMapPosition.xSpd, this._espNewMapPosition.ySpd);
		} else {
			$espGamePlayer.makePlayable();
			$espGamePlayer.saveRespawnPos();
		}
	}

	// get list of all currently active game objects
	getGameObjects() {
		return this._mapObjects;
	}

	// add game object when needed
	addGameObject(object, x, y) {
		if(SceneManager._scene.constructor === Scene_Map) {
			if(typeof x === "number" && typeof y === "number") {
				object.position.x = x;
				object.position.y = y;
			}
			this._mapObjects.push(object);
			if(object.isGravityManipulator()) {
				this._gravityManipulators.push(object);
			}
			const spriteset = SceneManager._scene._spriteset;
			if(spriteset) {
				spriteset.addGameSprite(object);
			}
		}
	}

	// remove game object when not needed
	removeGameObject(object) {
		if(SceneManager._scene.constructor === Scene_Map) {
			this._mapObjects.remove(object);
			if(this._gravityManipulators.includes(object)) {
				this._gravityManipulators.remove(object);
			}
			SceneManager._scene._spriteset.removeGameSprite(object);
		}
	}

	// remove every game object in existance
	removeAllGameObjects() {
		const len = this._mapObjects.length;
		for(let i = 0; i < len; i++) {
			this.removeGameObject(this._mapObjects[i]);
		}
		this._mapObjects = [];
	}

	// called once the player leaves the map "zones"
	onPlayerLeaveMap(direction, z) {
		if(!this._espTransferDirection && this._espTransitions[direction]) {
			const data = this._espTransitions[direction];
			if(typeof data[3] === "number") {
				if(z > data[3]) {
					return false;
				}
			}
			this._espTransferDirection = direction;
			SceneManager._scene._spriteset.transitionOut();
			return true;
		}
		return false;
	}

	// upon "fade out" of transition, this is called
	onTransferReady() {
		const direction = this._espTransferDirection;
		const data = this._espTransitions[direction];
		if(data) {
			const newDir = data[1];
			const offset = 0.6;
			const x = newDir === "left" ? 11 : (newDir === "right" ? $gameMap.width() * TS : (data[2] + offset) * TS);
			const y = newDir === "up" ? 11 : (newDir === "down" ? $gameMap.height() * TS : (data[2] + offset) * TS);
			this._espNewMapPosition = {
				x: x,
				y: y,
				xSpd: newDir === "left" ? 1 : (newDir === "right" ? -1 : 0),
				ySpd: newDir === "up" ? 1 : (newDir === "down" ? -1 : 0)
			};
			$gamePlayer.reserveTransfer(data[0], 0, 0, 0, 2);
			this._espTransferDirection = null;
		}
	}

	// is the world frozen?
	espIsFrozen() {
		return this._worldFrozen;
	}

	// freezes the world
	espFreezeWorld() {
		this._worldFrozen = true;
	}

	// special fade out
	espFadeOut() {
		const spriteset = SceneManager._scene._spriteset;
		if(spriteset && spriteset.fadeOut) {
			spriteset.fadeOut();
		}
	}

	// special fade in
	espFadeIn() {
		const spriteset = SceneManager._scene._spriteset;
		if(spriteset && spriteset.fadeIn) {
			spriteset.fadeIn();
		}
	}

	// called whenever a fade in/out is complete
	onESPFadeOutComplete(isIn) {
		if(!isIn) {
			$espGamePlayer.unkill();
			this.espFadeIn();
		}
	}

	// need more precise method for getting touch x/y
	canvasToMapXPrecise(x) {
		const tileWidth = this.tileWidth();
		const originX = this._displayX * tileWidth;
		const mapX = (originX + x);
		return mapX;
	}

	canvasToMapYPrecise(y) {
		const tileHeight = this.tileHeight();
		const originY = this._displayY * tileHeight;
		const mapY = (originY + y);
		return mapY;
	}
}
