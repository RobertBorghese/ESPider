// Hello map from dora de exporera. It's me, guy from reality.

var $gameMapTemp = {};
$gameMapTemp._shouldLoad = false;
$gameMapTemp._objectsUpdating = false;
$gameMapTemp._toBeDeleted = [];

Game_Map.presetObjects = [];

modify_Game_Map = class {
	// lets begin!!
	initialize() {
		ESP.Game_Map.initialize.apply(this, arguments);
		this._espNewMapPosition = null;
		this._worldFrozen = false;
		this.initESPFields();
	}

	// setup for each map
	setup(mapId) {
		ESP.Game_Map.setup.apply(this, arguments);
		this.setupESPGame();
	}

	// setup the map for ESPider
	setupESPGame() {
		this.setFrozen(false);
		this.initESPFields();
		this.setupCollisionMap();
		this.initStartingGameObjects();
		this.initMapEval();
		this.initPlayerPos();
	}

	// reset the map
	resetESPGame() {
		this.setFrozen(false);
		this.removeAllGameObjects();
		this.initStartingGameObjects();
		$espGamePlayer.restoreRespawnPos();
	}

	// initialize fields for each map
	initESPFields() {
		$gameMapTemp._mapObjects = [];
		$gameMapTemp._gravityManipulators = [];
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
		this.setupObjects();
		this.addGameObject(new ESPFireballObject());
	}

	// setup ESP objects
	setupObjects() {
		for(const event of $dataMap.events.filter(event => !!event)) {
			if(event && event.pages && event.pages[0]) {
				const data = event.pages[0];
				if(data.image && data.image.characterName === "_Entities") {
					const d = data.image;
					const ci = d.characterIndex;
					const x = (ci > 3 ? ((ci - 3) * 3) : (ci * 3)) + d.pattern;
					const y = (ci > 3 ? 4 : 0) + (d.direction / 2) - 1
					const index = (y * 12) + x;
					const objectData = { text: [] };
					data.list.forEach(function(event) {
						if(event.code === 401) {
							objectData.text.push(event.parameters[0]);
						} else if(event.code === 357) {
							const data = event.parameters[3];
							const keys = Object.keys(data);
							for(let i = 0; i < keys.length; i++) {
								objectData[keys[i]] = data[keys[i]];
							}
						}
					});
					this.createPresetObject(index, event.x, event.y, objectData);
				}
			}
		}
	}

	// create objects based on id
	createPresetObject(id, x, y, objectData) {
		if(Game_Map.presetObjects[id]) {
			//Game_Map
			const cls = Game_Map.presetObjects[id];
			this.addGameObject(new cls(objectData), x * TS, y * TS);
		}
		/*
		switch(id) {
			case 0: {
				this.addGameObject(new ESPInfoBeetleObject(objectData), x * TS, y * TS);
				break;
			}
		}
		*/
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
		if($gameMapTemp._shouldLoad) return;
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
		if(!$gameMapTemp._mapObjects) {
			$gameMapTemp._mapObjects = [];
		}
		return $gameMapTemp._mapObjects;
	}

	// add game object when needed
	addGameObject(object, x, y, z) {
		if(SceneManager._scene.constructor === Scene_Map) {
			if(typeof x === "number" && typeof y === "number") {
				object.position.x = x;
				object.position.y = y;
			}
			if(typeof z === "number") {
				object.position.z = z;
			}
			this.getGameObjects().push(object);
			if(object.isGravityManipulator()) {
				$gameMapTemp._gravityManipulators.push(object);
			}
			const spriteset = SceneManager._scene._spriteset;
			if(spriteset) {
				spriteset.addGameSprite(object);
			}
		}
	}

	canRemoveGameObjects() {
		return SceneManager._scene.constructor === Scene_Map;
	}

	// remove game object when not needed
	removeGameObject(object) {
		if(object && this.canRemoveGameObjects()) {
			if($gameMapTemp._objectsUpdating) {
				$gameMapTemp._toBeDeleted.push(object);
			} else {
				$gameMapTemp._mapObjects.remove(object);
			}
			this.onGameObjectRemoved(object);
		}
	}

	// remove other game object partners
	onGameObjectRemoved(object) {
		SceneManager._scene._spriteset.removeGameSprite(object);
		if($gameMapTemp._gravityManipulators.includes(object)) {
			$gameMapTemp._gravityManipulators.remove(object);
		}
	}

	// remove every game object in existance
	removeAllGameObjects() {
		if(this.canRemoveGameObjects()) {
			const objects = this.getGameObjects();
			const len = objects.length;
			for(let i = 0; i < len; i++) {
				this.onGameObjectRemoved(objects[i]);
			}
		}
		$gameMapTemp._mapObjects = [];
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
		this.setFrozen(true);
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

	// save the game
	save() {
		$gameSystem.setSavefileId(1);
		$gameSystem.onBeforeSave();
		DataManager.saveGame(1).then(function() {}).catch(function() {});
	}

	onLoad() {
		this.setupESPGame();
	}

	// check if should increase fade upon player death
	shouldFastDeathFade() {
		if($espGamePlayer.lastDeathTime < 0) return false;
		return Graphics.frameCount - $espGamePlayer.lastDeathTime < 1000;
	}

	// freeze the game world
	setFrozen(frozen) {
		if(this._worldFrozen !== frozen) {
			this._worldFrozen = frozen;
			SceneManager._scene._spriteset.setFrozen(frozen);
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
