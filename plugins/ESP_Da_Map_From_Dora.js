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
		this.initESPFields();
		this.initMapEval();
		this.setupCollisionMap();
		this.initStartingGameObjects();
		this.initPlayerPos();
	}

	// reset the map
	resetESPGame() {
		this.setFrozen(false);
		this.removeAllGameObjects();
		this.initMapEval();
		this.initStartingGameObjects();
		this.cleanUpBosses();
		$espGamePlayer.restoreRespawnPos();
	}

	// initialize fields for each map
	initESPFields() {
		$gameMapTemp._mapObjects = [];
		$gameMapTemp._mapReferences = {};
		$gameMapTemp._mapGroupReferences = {};
		$gameMapTemp._gravityManipulators = [];
		this._espStartX = 0;
		this._espStartY = 0;
	}

	// get height
	getColHeight(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result >= 150) result -= 50;
		if(result >= 100) result -= 100;
		return result;
	}

	// get killer type
	getColKill(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result >= 100 && result < 150) return 1;
		return 0;
	}

	getMeta(x, y) {
		let result = this.tileId(x, y, 5) ?? 0;
		if(result === 150) return 1;
		return 0;
	}

	// setup collision map for 3d world
	setupCollisionMap() {
		const mapWidth = $dataMap.width;
		const mapHeight = $dataMap.height;
		let largestRegion = 0;
		this.espCollisionMap = [];
		this.espCollisionKillers = [];
		this.espCollisionShowMap = [];
		this.espMetaMap = [];
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				this.espCollisionMap.push(0);
				this.espCollisionKillers.push(0);
				this.espCollisionShowMap.push(0);
				this.espMetaMap.push(0);
				const regionId = this.getColHeight(x, y);
				if(largestRegion < regionId) {
					largestRegion = regionId;
				}
			}
		}

		/*
		for(let i = 0; i < largestRegion; i++) {
			for(let x = 0; x < mapWidth; x++) {
				this.espCollisionMap.push(0);
				this.espCollisionKillers.push(0);
			}
		}
		*/

		this.MapBottom = mapHeight;

		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const regionId = this.getColHeight(x, y);
				const killId = this.getColKill(x, y);
				const metaId = this.getMeta(x, y);
				if(regionId > 0) {
					const newX = x;
					const newY = y + regionId;

					const killIdUp = this.getColKill(x, y - 1);
					let offset = 0;
					for(let i = newY; i >= y; i--) {
						const index = newX + (i * mapWidth);
						this.espCollisionShowMap[index] = Math.max(this.espCollisionShowMap[index], regionId - offset);
						if(i !== newY) {
							offset++;
							if(!this._manualBehindKills && killIdUp !== 0) {
								this.espCollisionKillers[newX + (i * mapWidth)] = killIdUp;
							}
						}
					}

					const index = newX + (newY * mapWidth);
					this.espMetaMap[index] = metaId;
					this.espCollisionMap[index] = regionId ?? 0;
					this.espCollisionKillers[index] = killId;
					if(newY > mapHeight) {
						this.MapBottom = newY;
					}
					if(y === 0) {
						for(let i = newY - 1; i >= 0; i--) {
							this.espCollisionMap[newX + (i * mapWidth)] = 99;
						}
					}
				} else if(killId > 0 || metaId > 0) {
					const index = x + (y * mapWidth);
					this.espCollisionKillers[index] = killId;
					this.espMetaMap[index] = metaId;
				}
			}
		}

		let newCollisionMap = this.espCollisionMap;
		for(let x = 0; x < mapWidth; x++) {
			for(let y = 0; y < mapHeight; y++) {
				const index = x + (y * mapWidth);
				const height = this.espCollisionMap[index];
				if(height > 0) {
					const newY = y - height - 1;
					const aboveHeight = this.espCollisionMap[x + (newY * mapWidth)] ?? 0;
					if(aboveHeight > 0 && aboveHeight < height) {
						let doThis = true;
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

	// any starting game objects get initiated here
	initStartingGameObjects() {
		this.setupObjects();
		//this.addGameObject(new ESPFireballObject());
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
		return this.createEventObject($dataMap.events[id]);
	}

	createEventObject(event) {
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
				return this.createPresetObject(index, event.x, event.y, event.name, objectData);
			}
		}
		return null;
	}

	// create objects based on id
	createPresetObject(id, x, y, eventName, objectData) {
		if(Game_Map.presetObjects[id]) {
			//Game_Map
			const cls = Game_Map.presetObjects[id];
			const regionId = this.getColHeight(x, y);
			const obj = new cls(objectData);
			obj.__eventName = eventName;
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2));
			return obj;
		}
		return null;
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

		let code = "";

		if($dataMap && $dataMap.note) {
			code += $dataMap.note + "\n";
		}

		for(const event of $dataMap.events.filter(event => !!event)) {
			if(event && event.pages && event.pages[0]) {
				const data = event.pages[0];
				data.list.forEach(function(event) {
					if(event.code === 355 || event.code === 655) {
						code += event.parameters[0] + "\n";
					}
				});
			}
		}

		this._espStartX = $dataSystem.startX;
		this._espStartY = $dataSystem.startY;
		this._cameraXMinY = 0;
		this._cameraXMaxY = 0;
		this._manualBehindKills = false;

		if(code) {
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
				eval(code);
			} catch(e) {}
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

				this.getGameObjects().push(object);
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
				}
			}
		}
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
				$gameMapTemp._mapObjects.remove(object);
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
		$gameMapTemp._mapReferences = {};
		$gameMapTemp._mapGroupReferences = {};
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
			this._espTransferDirection = direction;
			SceneManager._scene._spriteset.transitionOut();
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
			$espGamePlayer.unkill();
			this.espFadeIn();
		}
	}

	initiateKillSequence() {
		this.cleanUpBosses();
	}

	cleanUpBosses() {
		if(this.isBoss1()) {
			this.cleanUpBoss1();
		}
	}

	// increment the RoomKillCount
	onPlayerKilled() {
		this.RoomKillCount++;
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

	getShadowifyObjects() {
		return $gameMapTemp._mapObjects.filter(obj => obj.shadowify()).concat([$espGamePlayer]);
	}

	inCamera(left, right, top, bottom) {
		if(SceneManager._scene._spriteset._tilemap.scale.x > 1) return true;
		return !(right < this.ESPCameraX || left > (this.ESPCameraX + Graphics.width) ||
			bottom < this.ESPCameraY || top > (this.ESPCameraY + Graphics.height));
	}

	canMoveCameraX() {
		if($gameMap._isTranferring) return true;
		if(this._cameraXMinY === 0 && this._cameraXMaxY === 0) return true;
		return $espGamePlayer.position.y > this._cameraXMinY && $espGamePlayer.position.y <= this._cameraXMaxY;
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

	isBoss1() {
		return $gameMap.mapId() === 13 && !!this._boss1Lefties;
	}

	cleanUpBoss1() {
		this._boss1Timer = null;
		this._boss1Lefties = null;
		this._boss1Righties = null;
		this._boss1Topies = null;
		this._boss1DidJump = null;
		if(!this._boss1Complete) $espGamePlayer.disableJump();
		ESP.WS = 1;
		SceneManager._scene._spriteset._tilemap.scale.set(1);
		if(!this._boss1Complete) {
			SceneManager._scene._overlay.alpha = 0;
		} else {
			$gameVariables.setValue(10, 1);
		}
		SceneManager._scene._spriteset.unfreezeWorldSpriteVisibility();
	}

	startBoss1() {
		this._boss1Timer = 0;
		this._boss1Lefties = [];
		this._boss1Righties = [];
		this._boss1Topies = [];
		for(let y = 7; y <= 12; y++) {
			let x = 7;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": "false",
				"Shoot Dir": "right",
				"Shoot Rate": 0
			});
			this._boss1Lefties.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + (y - 7) * 100);
		}
		for(let y = 7; y <= 12; y++) {
			let x = 19;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": "true",
				"Shoot Dir": "left",
				"Shoot Rate": 0
			});
			this._boss1Righties.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + (12 - y) * 100);
		}

		SceneManager._scene._spriteset.freezeWorldSpriteVisibility([
			[10, 16], [11, 16], [12, 16], [14, 16], [15, 16], [16, 16]
		])
	}

	startBoss1Phase2() {
		for(let x = 10; x <= 16; x++) {
			let y = 4;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": x % 2 === 0 ? "false" : "true",
				"Shoot Dir": "down",
				"Shoot Rate": 0
			});
			this._boss1Topies.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + Math.abs(13 - x) * 100);
		}
	}

	finishBoss1() {
		this._boss1Lefties.forEach(b => this.removeGameObject(b));
		this._boss1Righties.forEach(b => this.removeGameObject(b));
		this._boss1Topies.forEach(b => this.removeGameObject(b));
		this._boss1Complete = true;
		this.cleanUpBoss1();
	}

	updateBoss1() {
		if(!this.isBoss1()) return;

		this._boss1Timer++;

		switch(this._boss1Timer) {
			case 60: { this._boss1Lefties.filterIndex(0).forEach(b => b.shoot()); break; }
			case 260: { this._boss1Righties.filterIndex(5).forEach(b => b.shoot()); break; }
			case 460: { this._boss1Lefties.filterIndex(2).forEach(b => b.shoot()); break; }
			case 600: { this._boss1Righties.filterIndex(4).forEach(b => b.shoot()); break; }
			case 700: { this._boss1Lefties.filterIndex(1).forEach(b => b.shoot()); break; }
			case 780: { this._boss1Righties.filterIndex(5).forEach(b => b.shoot()); break; }
			case 840: { this._boss1Lefties.filterIndex(3).forEach(b => b.shoot()); break; }

			case 900: { this._boss1Righties.filterIndex(4).forEach(b => b.shoot()); break; }
			case 960: { this._boss1Lefties.filterIndex(0).forEach(b => b.shoot()); break; }
			case 1000: { this._boss1Righties.filterIndex(1).forEach(b => b.shoot()); break; }

			case 1300: {
				const interpreter = new ESPInterpreter();

				interpreter
				.moveCameraToGrid(13.5, 7)
				.callCode("this.startBoss1Phase2()", this)
				.wait(120)
				.moveCameraToPlayer();

				$espGamePlayer.setInterpreter(interpreter);
			}

			case 1600: { this._boss1Topies.filterIndex(3).forEach(b => b.shoot()); break; }
			case 1700: { this._boss1Righties.filterIndex(2).forEach(b => b.shoot()); break; }
			case 1800: { this._boss1Lefties.filterIndex(5).forEach(b => b.shoot()); break; }
			case 1900: { this._boss1Topies.filterIndex(6).forEach(b => b.shoot()); break; }
			case 2000: { this._boss1Lefties.filterIndex(3).forEach(b => b.shoot()); break; }
			case 2100: { this._boss1Righties.filterIndex(5).forEach(b => b.shoot()); break; }
			case 2200: { this._boss1Topies.filterIndex(1).forEach(b => b.shoot()); break; }

			case 2400: {
				this._boss1Lefties.filterIndex(2).forEach(b => b.shoot());
				this._boss1Righties.filterIndex(3).forEach(b => b.shoot()); break;
			}
			case 2550: {
				this._boss1Lefties.filterIndex(0).forEach(b => b.shoot());
				this._boss1Righties.filterIndex(1).forEach(b => b.shoot()); break;
			}
			case 2700: {
				this._boss1Lefties.filterIndex(2).forEach(b => b.shoot());
				this._boss1Righties.filterIndex(2).forEach(b => b.shoot());
				this._boss1Topies.filterIndex(3).forEach(b => b.shoot()); break;
			}

			case 3000: {
				this._boss1Lefties.forEach(b => b.shoot());
				this._boss1Righties.forEach(b => b.shoot());
				this._boss1Topies.forEach(b => b.shoot()); break;
			}
		}

		if(this._boss1Timer <= 3500) {
			if(this._boss1Timer > 3075) {
				const r = (150 - (this._boss1Timer - 3075).clamp(0, 150)) / 150;
				ESP.WS = r;
			}
			if(this._boss1Timer >= 3275) {
				const r = (200 - (this._boss1Timer - 3275).clamp(0, 200)) / 200;
				const r2 = Easing.easeInCubic(1 - r);
				SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
				SceneManager._scene._overlay.alpha = r2;
				SceneManager._scene.updateCameraPos(true);
			}
			if(this._boss1Timer === 3500) {
				SceneManager._scene.startSlideshow([
					["img/pictures/Scene1/Page1.png"],
					["img/pictures/Scene1/Page2.png"],
					"Are you really going to settle for that?",
					["img/pictures/Scene1/Page3.png"],
					"There are infinite lights greater than any spider has ever achieved.",
					["img/pictures/Scene1/Page4.png"],
					"How cute."
				]);
			}
		}
		
		if(!$espGamePlayer.canJump()) {
			if(this._boss1Timer === 3501) {
				const regionId = this.getColHeight(13, 14);
				this._boss1InfoBeetle = new ESPInfoBeetleObject({ text: ["Press [SPACE] or [STH] to jump."], "Trigger Distance": "10", "Untrigger Distance": "10" });
				this._boss1InfoBeetle.__eventName = "";
				this._boss1InfoBeetle.saveIndividual = function() { return true; };
				this.addGameObject(this._boss1InfoBeetle, (13 * TS) + (TS / 2), (14 * TS) + (regionId * TS) + (TS / 2));
			}
			if(this._boss1Timer <= 3701) {
				if(this._boss1Timer >= 3501) {
					const r = (200 - (this._boss1Timer - 3501).clamp(0, 200)) / 200;
					const r2 = Easing.easeOutCubic(r);
					SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
					SceneManager._scene._overlay.alpha = 0;
					SceneManager._scene.updateCameraPos(true);
				}
			}
			
			if(this._boss1Timer === 3750) {
				this._boss1InfoBeetle._triggerDist = 800;
				this._boss1InfoBeetle._untriggerDist = 850;
			}

			if(!this._boss1DidJump && this._boss1Timer > 3701) {
				if($espGamePlayer.isJumpButtonTriggered()) {
					this._boss1DidJump = this._boss1Timer;
					$espGamePlayer.speed.z = 8;
				}
			}

			if(ESP.WS < 1 && this._boss1DidJump) {
				const r = ((this._boss1Timer - this._boss1DidJump).clamp(0, 100)) / 100;
				ESP.WS = r;
			}

			if(this._boss1DidJump) {
				if($espGamePlayer.position.z > 0 || $espGamePlayer.speed.z > 0) {
					$espGamePlayer.speed.x = 0;
					$espGamePlayer.speed.y = $espGamePlayer.position.y > 585 ? -1 : 0;
					$espGamePlayer._canControl = false;
				} else {
					$espGamePlayer.enableJump();
					$espGamePlayer._canControl = true;
					this._boss1Timer = 4000;
				}
			}
		} else {

			switch(this._boss1Timer) {
				case 4100: { this._boss1Lefties.forEach(b => b.shoot()); break; }
				case 4300: { this._boss1Righties.forEach(b => b.shoot()); break; }
				case 4500: { this._boss1Topies.forEach(b => b.shoot()); break; }
				case 4700: {
					this._boss1Righties.forEach(b => b.shoot());
					this._boss1Lefties.forEach(b => b.shoot()); break;
				}
				case 5000: {
					this._boss1Lefties.forEach(b => b.shoot());
					this._boss1Righties.forEach(b => b.shoot());
					this._boss1Topies.forEach(b => b.shoot()); break;
				}
				case 5300: {
					this._boss1Lefties.forEach(b => b.shoot());
					this._boss1Righties.forEach(b => b.shoot());
					this._boss1Topies.forEach(b => b.shoot()); break;
				}
				case 5600: {
					this._boss1Lefties.forEach(b => b.shoot());
					this._boss1Righties.forEach(b => b.shoot());
					this._boss1Topies.forEach(b => b.shoot()); break;
				}
				case 6000: {
					this._boss1InfoBeetle._triggerDist = 100;
					this._boss1InfoBeetle._untriggerDist = 150;

					const interpreter = new ESPInterpreter();

					interpreter
					.moveCameraToGrid(13.5, 9)
					.wait(30)
					.fadeOut()
					.finishBoss1()
					.removeGameObject(this._boss1InfoBeetle)
					.createInfoBug(13, 14, "Nice buddy!", 80, 100, "InfoBug")
					.fadeIn()
					.wait(20)
					.moveCameraToGrid(13.5, 13)
					.closeSpearWall("Wall")
					.wait(20)
					.save()
					.moveCameraToPlayer();

					$espGamePlayer.setInterpreter(interpreter);
				}
			}

		}

		return false;
	}
}

Array.prototype.filterIndex = function(index) {
	return this.filter(function(_, i) {
		return i !== index;
	});
}
