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
		this._isTranferring = false;
		this._worldFrozen = false;
		this.RoomKillCount = 0;
		this.ESPCameraX = 0;
		this.ESPCameraY = 0;
		this.ESPCameraOffsetX = 0;
		this.ESPCameraOffsetY = 0;
		this.skipTransitionIn = false;
		this.PostObjectsCreation = null;
		this.initESPFields();
	}

	// setup for each map
	setup(mapId) {
		ESP.Game_Map.setup.apply(this, arguments);
		this.setupESPGame();
	}

	// setup the map for ESPider
	setupESPGame() {
		this.onTransferReady();
		this.setFrozen(false);
		this.constructCode();
		this.initESPFields();
		this.setupCollisionMap();
		this.initMapEval();
		this.initPreGameObjectCreation();
		this.initStartingGameObjects();
		$espGamePlayer.onMapChangeOrRespawn();
		this.initPlayerPos();
		if(this.PostObjectsCreation) {
			this.PostObjectsCreation();
		}
	}

	// reset the map
	resetESPGame() {
		this.setFrozen(false);
		this.constructCode();
		this.removeAllGameObjects();
		this.initMapEval();
		this.initPreGameObjectCreation(true);
		this.initStartingGameObjects();
		$espGamePlayer.onMapChangeOrRespawn();
		this.cleanUpBosses();
		if(this.PostObjectsCreation) {
			this.PostObjectsCreation();
		}
		$espGamePlayer.restoreRespawnPos();
		if($espGamePlayer.respawnCheckId === 999990) {
			this.restoreBoss1Midpoint();
		}
	}

	// initialize fields for each map
	initESPFields() {
		$gameMapTemp._mapObjects = [];
		$gameMapTemp._mapMovingPlatforms = null;
		$gameMapTemp._mapReferences = {};
		$gameMapTemp._mapGroupReferences = {};
		$gameMapTemp._gravityManipulators = [];
		$gameMapTemp._requestedRespawns = null;
		this._espStartX = 0;
		this._espStartY = 0;
	}

	// get height
	getColHeight(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result >= 200) result -= 200;
		else if(result >= 150) result -= 150;
		else if(result >= 100) result -= 100;
		return result;
	}

	// get killer type
	getColKill(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result >= 100 && result < 150) return result - 99;
		return 0;
	}

	// get slide type
	getColSlide(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result >= 200) return 1;
		return 0;
	}

	getMeta(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result === 150) return 1;
		return 0;
	}

	getColMapHeight(x, y) {
		const height = this.getColHeight(x, y);
		return this.espCollisionMap[x + ((y + height) * $gameMap.width())] ?? 0;
	}

	// setup collision map for 3d world
	setupCollisionMap() {
		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;
		let largestRegion = 0;
		this.espCollisionMap = [];
		this.espCollisionKillers = [];
		this.espCollisionSlide = [];
		this.espCollisionShowMap = [];
		this.espMetaMap = [];
		this.hasKill = false;
		this.hasSlide = false;
		this.highestRegionId = 0;
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				this.espCollisionMap.push(0);
				this.espCollisionKillers.push(0);
				this.espCollisionSlide.push(0);
				this.espCollisionShowMap.push(0);
				this.espMetaMap.push(0);
				const regionId = this.getColHeight(x, y);
				if(largestRegion < regionId) {
					largestRegion = regionId;
				}
			}
		}

		this.MapBottom = mapHeight;

		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const regionId = this.getColHeight(x, y);
				const killId = this.getColKill(x, y);
				const slideId = this.getColSlide(x, y);
				if(killId > 0) this.hasKill = true;
				if(slideId > 0) this.hasSlide = true;
				const metaId = this.getMeta(x, y);
				if(regionId > 0) {
					const newX = x;
					const newY = y + regionId;

					if(regionId > this.highestRegionId) {
						this.highestRegionId = regionId;
					}

					const killIdUp = this.getColKill(x, y - 1);
					const slideIdUp = this.getColSlide(x, y - 1);
					let offset = 0;
					for(let i = newY; i >= y; i--) {
						const index = newX + (i * mapWidth);
						this.espCollisionShowMap[index] = Math.max(this.espCollisionShowMap[index], regionId - offset);
						if(i !== newY) {
							offset++;
							if(!this._manualBehindKills) {
								if(killIdUp !== 0) {
									this.espCollisionKillers[newX + (i * mapWidth)] = killIdUp;
								}
								if(slideIdUp !== 0) {
									this.espCollisionSlide[newX + (i * mapWidth)] = slideIdUp;
								}
							}
						}
					}

					const index = newX + (newY * mapWidth);
					this.espMetaMap[index] = metaId;
					this.espCollisionMap[index] = regionId ?? 0;
					this.espCollisionKillers[index] = killId;
					this.espCollisionSlide[index] = killId;
					if(newY > mapHeight) {
						this.MapBottom = newY;
					}
					if(y === 0) {
						for(let i = newY - 1; i >= 0; i--) {
							this.espCollisionMap[newX + (i * mapWidth)] = 99;
						}
					}
				} else if(killId > 0 || slideId > 0 || metaId > 0) {
					const index = x + (y * mapWidth);
					this.espCollisionKillers[index] = killId;
					this.espCollisionSlide[index] = slideId;
					this.espMetaMap[index] = metaId;
				}
			}
		}

		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y <= this.MapBottom; y++) {
				const index = x + (y * mapWidth);
				let height = this.espCollisionMap[index];
				if(height === undefined) {
					this.espCollisionMap[index] = height = 0;
				}
				if(height > 0) {
					const newY = y - height - 1;
					const aboveHeight = this.espCollisionMap[x + (newY * mapWidth)] ?? 0;
					if(aboveHeight > 0 && aboveHeight < height) {
						for(let i = y - 1; i >= (y - height); i--) {
							const replaceHeight = this.espCollisionMap[x + (i * mapWidth)];
							if(replaceHeight === 0) {
								this.espCollisionMap[x + (i * mapWidth)] = aboveHeight;
							}
						}
					}
				}
			}
		}
	}

	// code run prior to game objects being created
	initPreGameObjectCreation(isRespawn) {
		$gameTemp._unrespawnablesKilled = 0;
		ESPMoneyObject.lastUniqueId = 0;
		ESPShieldObject.lastUniqueId = 0;
		if(isRespawn) {
			$espGamePlayer.restoreOldData();
		}
	}

	// any starting game objects get initiated here
	initStartingGameObjects() {
		this.setupObjects();
	}

	// setup ESP objects
	setupObjects() {
		for(const event of $dataMap.events.filter(event => !!event)) {
			this.createEventObject(event);
		}
	}

	findGameSprite(obj) {
		return SceneManager._scene._spriteset.findGameSprite(obj);
	}

	createEventObjectFromId(id) {
		return this.createEventObject($dataMap.events[id], id);
	}

	createAndDropEventObjectFromId(id) {
		const obj = this.createEventObjectFromId(id);
		obj.position.z = 500;
		return obj;
	}

	createEventObject(event, eventId) {
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
				return this.createPresetObject(index, event.x, event.y, event.name, eventId ?? $dataMap.events.indexOf(event), objectData);
			}
		}
		return null;
	}

	// create objects based on id
	createPresetObject(id, x, y, eventName, eventId, objectData) {
		if(Game_Map.presetObjects[id]) {
			const cls = Game_Map.presetObjects[id];
			const regionId = this.getColHeight(x, y);
			const obj = new cls(objectData);
			obj.__eventId = eventId;
			obj.__eventName = eventName;
			obj.__eventX = x;
			obj.__eventY = y;
			let objX = (x * TS) + (TS / 2);
			let objY = (y * TS) + (regionId * TS) + (TS / 2);
			if(objectData["Force Below"] === "true") {
				objY = (y * TS) + (TS / 2);
			}
			if(objectData["Specific Tile X"]) {
				objectData["Specific X"] = Math.floor((parseFloat(objectData["Specific Tile X"]) + 0.5) * TS).toString();
			}
			if(objectData["Specific Tile Y"]) {
				objectData["Specific Y"] = Math.floor((parseFloat(objectData["Specific Tile Y"]) + 0.5) * TS).toString();
			}
			if(objectData["Specific X"] && objectData["Specific Y"]) {
				objX = parseInt(objectData["Specific X"]) || objX;
				objY = parseInt(objectData["Specific Y"]) || objY;
			}
			if(objectData["Specific Offset X"]) {
				objX += parseInt(objectData["Specific Offset X"]);
			}
			if(objectData["Specific Offset Y"]) {
				objY += parseInt(objectData["Specific Offset Y"]);
			}
			this.addGameObject(obj, objX, objY);//, regionId * TS);
			return obj;
		}
		return null;
	}

	constructCode() {
		this._notetagCode = "";

		if($dataMap && $dataMap.note) {
			this._notetagCode += $dataMap.note + "\n";
		}

		for(const event of $dataMap.events.filter(event => !!event)) {
			if(event && event.pages && event.pages[0]) {
				const data = event.pages[0];
				data.list.forEach((event) => {
					if(event.code === 355 || event.code === 655) {
						this._notetagCode += event.parameters[0] + "\n";
					}
				});
			}
		}

		if(this._notetagCode.contains("manualBehindKills()")) {
			this._manualBehindKills = true;
		}
	}

	// handling map "notetags" very lazily
	initMapEval() {
		this._espTransitions = {};

		this._espStartX = $dataSystem.startX;
		this._espStartY = $dataSystem.startY;
		this._cameraXMinY = 0;
		this._cameraXMaxY = 0;

		this._cameraMaxX = -1;
		this._cameraMaxXIfYBelow = -1;

		this._manualBehindKills = false;

		this.permaInvisibleFunc = null;
		this.OnRespawnFunction = null;
		this.PostObjectsCreation = null;
		this.AlwaysBelowCallback = null;

		this.restrictMapBottom = false;
		this.starBackground = false;
		this.immediateCameraReturnAtDeath = false;

		this.FootstepSound = () => "Footstep";

		$gameMapTemp._slugBoss = null;

		if(this._notetagCode) {
			const addGameObject = this.addGameObject.bind(this);
			function addTransitionDir(dir, mapId, destDir, dest, requiredZ, newZ) {
				this._espTransitions[dir] = [mapId, destDir, dest, requiredZ, newZ ?? 0];
			};
			const manualBehindKills = function() {
				this._manualBehindKills = true;
			}.bind(this);
			const start = function(x, y) {
				this._espStartX = x;
				this._espStartY = y;
			}.bind(this);
			const lockCameraXUnlessPlayerYIn = function(min, max) {
				this._cameraXMinY = (min * TS);
				this._cameraXMaxY = (max * TS);
			}.bind(this);
			const up = addTransitionDir.bind(this, "up");
			const down = addTransitionDir.bind(this, "down");
			const left = addTransitionDir.bind(this, "left");
			const right = addTransitionDir.bind(this, "right");
			try {
				eval(this._notetagCode);
			} catch(e) {
				console.error(e);
			}
		}
	}

	// put dat player down
	initPlayerPos() {
		if($gameMapTemp._shouldLoad) return;
		if(this._espNewMapPosition === null) {
			$espGamePlayer.movexy((this._espStartX + 0.5) * TS, (this._espStartY + 0.5) * TS);
		} else {
			$espGamePlayer.movexy(this._espNewMapPosition.x, this._espNewMapPosition.y + (this._espNewMapPosition.z * TS));
			$espGamePlayer.forceCollisionHeight(this._espNewMapPosition.z);
		}
		$espGamePlayer.makeCustscene();
		$espGamePlayer.CollisionHeight = 0;
		$espGamePlayer.resetSpeed();
		$espGamePlayer.saveRespawnPos();
	}

	// save respawn point and save
	saveRespawnPosAndSave(checkId) {
		if($espGamePlayer.saveRespawnPos(checkId)) {
			const checkpoints = this.findObjectGroup("checkpoint");
			for(let i = 0; i < checkpoints.length; i++) {
				if(checkpoints[i].genId() !== checkId) {
					checkpoints[i].close();
				}
			}
			this.save();
		}
	}

	// upon transferring in and the transfer is done
	onTransferInReady() {
		if(this._espNewMapPosition !== null) {
			this._espNewMapPosition = null;
			$espGamePlayer.makePlayable();
			this.saveRespawnPosAndSave();
		}
		this._isTranferring = false;
		this._transitionEndTime = ESP.Time + 120;
	}

	exactLayering() {
		return this._isTranferring || (ESP.Time <= this._transitionEndTime);
	}

	// upon transferring in and the player is visible (even if transparent)
	onTransferInVisible() {
		if(this._espNewMapPosition !== null) {
			$espGamePlayer.reset(this._espNewMapPosition.x, this._espNewMapPosition.y + (this._espNewMapPosition.z * TS), this._espNewMapPosition.xSpd, this._espNewMapPosition.ySpd, this._espNewMapPosition.z);
		} else {
			$espGamePlayer.makePlayable();
			this.saveRespawnPosAndSave();
		}
	}

	// get list of all currently active game objects
	getGameObjects() {
		if(!$gameMapTemp._mapObjects) {
			$gameMapTemp._mapObjects = [];
		}
		return $gameMapTemp._mapObjects;
	}

	getMovingPlatforms() {
		if(!$gameMapTemp._mapMovingPlatforms) {
			$gameMapTemp._mapMovingPlatforms = [];
		}
		return $gameMapTemp._mapMovingPlatforms;
	}

	// add game object when needed
	addGameObject(object, x, y, z) {
		if(SceneManager._scene.constructor === Scene_Map) {
			if(object.condition()) {
				if(typeof x === "number" && typeof y === "number") {
					object.position.x = x;
					object.position.y = y;
				}
				if(typeof z === "number") {
					object.position.z = z;
				}
				object.updatePosition();

				if(object.isMovingPlatform()) {
					this.getMovingPlatforms().push(object);
				} else {
					this.getGameObjects().push(object);
				}
				if(object.isGravityManipulator()) {
					$gameMapTemp._gravityManipulators.push(object);
				}

				if(object.saveIndividual()) {
					$gameMapTemp._mapReferences[object.__eventName] = object;
				}

				const groupName = object.saveGroup();
				if(groupName) {
					if(!$gameMapTemp._mapGroupReferences[groupName]) {
						$gameMapTemp._mapGroupReferences[groupName] = [];
					}
					$gameMapTemp._mapGroupReferences[groupName].push(object);
				}

				const spriteset = SceneManager._scene._spriteset;
				if(spriteset) {
					spriteset.addGameSprite(object);
					object.onCreate();
				}
				return object;
			}
		}
		return null;
	}

	findObject(name) {
		return $gameMapTemp._mapReferences[name] ?? null;
	}

	findObjectGroup(name) {
		return $gameMapTemp._mapGroupReferences[name] ?? [];
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
				if(object.isMovingPlatform()) {
					$gameMapTemp._mapMovingPlatforms.remove(object);
				} else {
					$gameMapTemp._mapObjects.remove(object);
				}
			}
			if(object.saveIndividual()) {
				delete $gameMapTemp._mapReferences[object.__eventName];
			}
			if(object.saveGroup()) {
				$gameMapTemp._mapGroupReferences[object.saveGroup()].remove(object);
			}
			this.onGameObjectRemoved(object);
		}
	}

	// remove other game object partners
	onGameObjectRemoved(object) {
		if(SceneManager._scene && SceneManager._scene._spriteset) {
			SceneManager._scene._spriteset.removeGameSprite(object);
		}
		if($gameMapTemp._gravityManipulators.includes(object)) {
			$gameMapTemp._gravityManipulators.remove(object);
		}
		object.onRemoved();
	}

	// remove every game object in existance
	removeAllGameObjects() {
		if(this.canRemoveGameObjects()) {
			{
				const objects = this.getGameObjects();
				const len = objects.length;
				for(let i = 0; i < len; i++) {
					this.onGameObjectRemoved(objects[i]);
				}
			}

			if($gameMapTemp._mapMovingPlatforms && $gameMapTemp._mapMovingPlatforms.length > 0) {
				const objects = $gameMapTemp._mapMovingPlatforms;
				const len = objects.length;
				for(let i = 0; i < len; i++) {
					this.onGameObjectRemoved(objects[i]);
				}
				$gameMapTemp._mapMovingPlatforms = [];
			}
		}
		$gameMapTemp._mapObjects = [];
		$gameMapTemp._mapReferences = {};
		$gameMapTemp._mapGroupReferences = {};
		$gameMapTemp._particles = [];
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
			this.RoomKillCount = 0;
			$espGamePlayer.clearShields();
			ESPDecorSprite.__lastMapId = $gameMap.mapId();
			this._espTransferDirection = direction;
			SceneManager._scene._spriteset.transitionOut();
			this.getGameObjects().forEach(g => g.onPlayerLeavesTheMap());
			return true;
		}
		return false;
	}

	goToNewMap() {
		const direction = this._espTransferDirection;
		const data = this._espTransitions[direction];
		if(data) {
			$gamePlayer.reserveTransfer(data[0], 0, 0, 0, 2);
		}
	}

	// upon "fade out" of transition, this is called
	onTransferReady() {
		if(this._espTransferDirection && this._espTransitions) {
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
					z: data[4],
					xSpd: newDir === "left" ? 1 : (newDir === "right" ? -1 : 0),
					ySpd: newDir === "up" ? 1 : (newDir === "down" ? -1 : 0)
				};
				
				this._espTransferDirection = null;
			}
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
			this.cleanUpBossesAfterFade();
			$espGamePlayer.unkill();
			this.espFadeIn();
			if(this.immediateCameraReturnAtDeath) {
				SceneManager._scene.updateCameraPos(true);
			}
		}
	}

	initiateKillSequence() {
		this.cleanUpBosses();
	}

	cleanUpBosses() {
		if(this.isBoss1()) {
			this.cleanUpBoss1();
		} else if(this.isBoss2()) {
			this.cleanUpBoss2();
		}
	}

	isBoss3() {
		return $gameMapTemp._slugBoss !== null;
	}

	cleanUpBoss3(isDefeated = false) {
		if($gameMapTemp._slugBoss) {
			$gameMapTemp._slugBoss.onDefeatFinal(isDefeated);
			$gameMapTemp._slugBoss = null;
		}
	}

	cleanUpBossesAfterFade() {
		this.cleanUpBoss2AfterFade();
		if(this.isBoss3()) {
			this.cleanUpBoss3();
		}
	}

	// increment the RoomKillCount
	onPlayerKilled() {
		this.RoomKillCount++;
		$gameMapTemp._requestedRespawns = null;
		if($gameMapTemp._slugBoss) {
			$gameMapTemp._slugBoss.onPlayerKilled();
		}
	}

	// save the game
	save() {
		$espGamePlayer.storeOldData();
		$gameSystem.setSavefileId(1);
		$gameSystem.onBeforeSave();
		DataManager.saveGame(1).then(function() {
		}).catch(function(e) {
			console.error(e);
			console.error("SAVE ERROR: \n" + e);
		});
	}

	onLoad() {
		this.setupESPGame();
	}

	// check if should increase fade upon player death
	shouldFastDeathFade() {
		if($espGamePlayer.lastDeathTime < 0) return false;
		return Graphics.frameCount - $espGamePlayer.lastDeathTime < 2000;
	}

	// freeze the game world
	setFrozen(frozen) {
		if(this._worldFrozen !== frozen) {
			this._worldFrozen = frozen;
			if(SceneManager._scene && SceneManager._scene._spriteset) {
				SceneManager._scene._spriteset.setFrozen(frozen);
			}
		}
	}

	getShadowifyObjects() {
		return $gameMapTemp._mapObjects.filter(obj => obj.shadowify()).concat([$espGamePlayer]);
	}

	inCamera(left, right, top, bottom) {
		if((SceneManager._scene?._spriteset?._tilemap?.scale.x ?? 0) > 1) return true;
		return !(right < this.ESPCameraX || left > (this.ESPCameraX + Graphics.width) ||
			bottom < this.ESPCameraY || top > (this.ESPCameraY + Graphics.height));
	}

	objectInCamera(obj) {
		return this.inCamera(obj.position.x - obj.rectWidth(), obj.position.x - obj.rectWidth(),
			obj.position.y + obj.rectWidth(), obj.position.y + obj.rectWidth());
	}

	canMoveCameraX() {
		if($gameMap._isTranferring) return true;
		if(this._cameraXMinY === 0 && this._cameraXMaxY === 0) return true;
		return $espGamePlayer.position.y > this._cameraXMinY && $espGamePlayer.position.y <= this._cameraXMaxY;
	}

	maxCameraX() {
		if(this._cameraMaxX > 0) {
			if(($espGamePlayer.position.y / TS) > this._cameraMaxXIfYBelow) {
				return this._cameraMaxX;
			}
		}
		return $dataMap.width;
	}

	maxCameraY() {
		return $dataMap.height;
	}

	requestRespawn(eventId, time, z) {
		if(!$gameMapTemp._requestedRespawns) {
			$gameMapTemp._requestedRespawns = [];
		}
		const curr = SceneManager._scene.gameTime;
		$gameMapTemp._requestedRespawns.push([eventId, curr + time, z]);
	}

	onRespawn(obj) {
		if(this.OnRespawnFunction) {
			this.OnRespawnFunction(obj);
		}
	}

	shake(duration = 100, weakMagnitude = 0.6, strongMagnitude = 0.9, start = 10) {
		SceneManager._scene._spriteset.shake();
		Input.vibrate(duration, weakMagnitude, strongMagnitude, start);
	}

	addParticle(x, y, spdX, spdY, animationSpeed, img = null, fadeOut = false, belowPlayer = false) {
		if(!$gameMapTemp._particles) $gameMapTemp._particles = [];
		if(!$gameMapTemp._recycleParticles) $gameMapTemp._recycleParticles = {};

		if(belowPlayer) {
			SceneManager._scene._spriteset._addBelowPlayer = belowPlayer === 2 ? 2 : true;
		}

		let obj;
		/*if($gameMapTemp._recycleParticles[img]?.length > 0) {
			obj = $gameMapTemp._recycleParticles[img].pop();

			obj._spr.Animation.setIndex(0);
			obj._spr.Animation.Frame = 0;
			obj._spr.Animation.await();
			obj._spr.alpha = 1;
			obj.position.set(x, y, 6);
			obj.speed.set(spdX, spdY, 0);
			obj._img = img;
			obj._fadeOut = fadeOut;
			obj._animationSpeed = animationSpeed;
			obj._deleteOnComplete = false;
		} else {*/
			obj = new ESPParticleObject(spdX, spdY, animationSpeed, true, img, fadeOut);
			$gameMap.addGameObject(obj, x, y);
		//}
		$gameMapTemp._particles.push(obj);
		
		return obj;
	}

	updateParticles() {
		if($gameMapTemp._particles) {
			for(let i = 0; i < $gameMapTemp._particles.length; i++) {
				const p = $gameMapTemp._particles[i];
				//p.update();
				if(p.isComplete()) {
					$gameMapTemp._particles.splice(i, 1);
					this.removeGameObject(p);
					i--;
					/*
					const img = p._img;
					if(!$gameMapTemp._recycleParticles[img]) {
						$gameMapTemp._recycleParticles[img] = [];
					}
					$gameMapTemp._recycleParticles[img].push(p);
					*/
				}
			}
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

	updateFlashback2(t) {
		if(t >= 0 && t <= 150) {
			const r = t / 150;
			ESP.WS = 1 - r;
		} else if(t > 150 && t <= (350)) {
			if($espGamePlayer.isInventoryOpen()) {
				$espGamePlayer.closeInventory();
			}
			if(t === 151) {
				ESPAudio.flashback();
			}
			const r = (t - 150) / 200;
			const r2 = Easing.easeInCubic(r);
			SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
			SceneManager._scene._overlay.alpha = r2;
			SceneManager._scene.updateCameraPos(true);
		} else if(t === 351) {
			SceneManager._scene.startSlideshow([
				["img/pictures/Scene2/Page1.png"],
				{ text: "Yamakuu Mountain", italic: false, color: 0xffffff },
				["img/pictures/Scene2/Page2.png"],
				{ text: "A tall, treacherous mountain filled with violent bugs.", italic: false, color: 0xffffff },
				["img/pictures/Scene2/Page3.png"],
				{ text: "\"It's the highest point in the world.\"", color: 0xffb8b8 },
				{ text: "\"From there you can reach the stars.\"", color: 0xffb8b8 },
				{ text: "\"Wait for me here. I'll find my way to the top.\"", color: 0xffb8b8 },
				{ text: "\"Then I'll return with a greater light.\"", color: 0xffb8b8 },
				["img/pictures/Scene2/Page4.png"],
				["img/pictures/Scene2/Page5.png"],
				["img/pictures/Scene2/Page4.png"],
				["img/pictures/Scene2/Page5.png"],
				["img/pictures/Scene2/Page4.png"],
				["img/pictures/Scene2/Page5.png"],
				["img/pictures/Scene2/Page4.png"],
				["img/pictures/Scene2/Page5.png"],
				["img/pictures/Scene2/Page6.png"],
				{ text: "Where did you go?", italic: false, color: 0xffffff }
			]);
		} else if(t > 351 && t <= 501) {
			const r = (t - 351) / 150;
			const r2 = Easing.easeInCubic(1 - r);
			ESP.WS = 1 - r2;
			SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
			SceneManager._scene._overlay.alpha = 0;
			SceneManager._scene.updateCameraPos(true);
		} else {
			return true;
		}
		return false;
	}
}

Array.prototype.filterIndex = function(index) {
	return this.filter(function(_, i) {
		return i !== index;
	});
}
