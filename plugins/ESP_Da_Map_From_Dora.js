// Hello map from dora de exporera. It's me, guy from reality.

class Window_PauseCommand extends Window_Command {
	maxCols() {
		return 1;
	}

	makeCommandList() {
		for(let i = 0; i < 4; i++) {
			this.addCommand("", "_" + i);
		}
	}
}


modify_Scene_Map = class {
	initialize() {
		ESP.Scene_Map.initialize.apply(this, arguments);
		this._isPaused = false;
		this._titleButtons = null;
	}

	updateMain() {
		if(!this._isPaused) {
			ESP.Scene_Map.updateMain.apply(this, arguments);
			this.updateESPPlayer();
			this.updateESPGameObjects();
			this.updatePauseInput();
			this.updateESPBackground();
		} else {
			this.updatePause();
		}
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

	isPauseInputTriggered() {
		return Input.isTriggered("button_start") || Input.isTriggeredEx("esc");
	}

	updatePauseInput() {
		if($espGamePlayer.canControl() && this.isPauseInputTriggered()) {
			this.onPause();
		}
	}

	updateESPBackground() {
		if(this._background) {
			if(this._background.alpha > 0) {
				this._background.alpha -= 0.1;
				if(this._background.alpha <= 0) {
					this.removeChild(this._Background);
					this._background = null;
				}
			}
		}
	}

	// make sure dat map loads when loading game
	onMapLoaded() {
		if($gameMapTemp._shouldLoad) {
			$gameMap.onLoad();
			$gameMapTemp._shouldLoad = false;
		}
		ESP.Scene_Map.onMapLoaded.apply(this, arguments);
	}

	onPause() {
		this._isPaused = true;

		SceneManager._scene._spriteset.setFrozen(2);

		if(!this._pauseWindow) {
			this._pauseWindow = new Window_PauseCommand(new Rectangle(0, 0, 100, 100));
		} else {
			this._pauseWindow.select(0);
		}

		if(!this._background) {
			this._background = new PIXI.Graphics();
			this._background.beginFill(0x000000, 0.9);
			this._background.drawRect(0, 0, Graphics.width, Graphics.height);
			this._background.endFill();
			this.addChild(this._background);
		}
		this._background.alpha = 0;

		this._titleButtons = ESP.makeButtons(this, 240, 40, 0, -80, 0, 50, [
			["Resume", this.onUnpause.bind(this)],
			["Volume [" + Math.floor(WebAudio._masterVolume * 100) + "%]", this.commandVolume.bind(this)],
			["Return to Title", this.commandReturnToTitle.bind(this)],
			["Exit Game", this.commandExitGame.bind(this)]
		], 0x123a3b, 0x2e9294, 0x1b5657, 0x216869, this.onMouseEnter, function() { return true; });

		this._titleButtonParent = new Sprite();
		this._titleButtonParent.alpha = 0;
		this.addChild(this._titleButtonParent);

		this._titleButtons.forEach(function(b) {
			this.removeChild(b);
			this._titleButtonParent.addChild(b);
		}.bind(this));
	}

	onUnpause() {
		this._isPaused = false;

		SceneManager._scene._spriteset.setFrozen(false);

		if(this._titleButtons && this._titleButtonParent) {
			for(let i = 0; i < this._titleButtons.length; i++) {
				this._titleButtonParent.removeChild(this._titleButtons[i]);
			}
		}

		this.removeChild(this._titleButtonParent);
		this._titleButtonParent = null;

		this._pauseWindow.select(-1);

		this._titleButtons = null;
		this._myPauseMenuIndex = null;
		this._oldButton = null;
	}

	commandVolume() {
		const masterVolume = ConfigManager.incrementVolume();
		this._titleButtons[1]._text.text = "Volume [" + masterVolume + "%]";
		this._titleButtons[1].unclick();
		this._titleButtons[1].updateGraphics();
	}

	commandReturnToTitle() {
		SceneManager.goto(Scene_Title);
	}

	commandExitGame() {
		SceneManager.exit();
	}

	updatePause() {
		if(this._background) {
			if(this._background.alpha < 1) {
				this._background.alpha += 0.1;
				if(this._background.alpha > 1) this._background.alpha = 1;
				this._titleButtonParent.alpha = this._background.alpha;
			}
		}
		if(this.isPauseInputTriggered()) {
			this.onUnpause();
		}
		if(this._pauseWindow) {
			this._pauseWindow.update();
		}
		if(this._myPauseMenuIndex !== this._pauseWindow._index) {
			this._myPauseMenuIndex = this._pauseWindow._index;
			this.onMouseEnter(this._myPauseMenuIndex);
		}
		/*
		if(this._titleButtons) {
			for(let i = 0; i < this._titleButtons.length; i++) {
				this._titleButtons[i].update();
			}
		}*/
	}

	onMouseEnter(index) {
		if(this._titleButtons) {
			const button = this._titleButtons[index];
			if(this._oldButton !== button) {
				if(this._oldButton) this._oldButton.unhover();
				this._oldButton = button;
				if(this._oldButton) this._oldButton.hover();
			}
			if(this._pauseWindow) this._pauseWindow.select(index);
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

var $gameMapTemp = {};
$gameMapTemp._shouldLoad = false;

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
	addGameObject(object, x, y) {
		if(SceneManager._scene.constructor === Scene_Map) {
			if(typeof x === "number" && typeof y === "number") {
				object.position.x = x;
				object.position.y = y;
			}
			$gameMapTemp._mapObjects.push(object);
			if(object.isGravityManipulator()) {
				$gameMapTemp._gravityManipulators.push(object);
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
			$gameMapTemp._mapObjects.remove(object);
			if($gameMapTemp._gravityManipulators.includes(object)) {
				$gameMapTemp._gravityManipulators.remove(object);
			}
			SceneManager._scene._spriteset.removeGameSprite(object);
		}
	}

	// remove every game object in existance
	removeAllGameObjects() {
		const len = $gameMapTemp._mapObjects.length;
		for(let i = 0; i < len; i++) {
			this.removeGameObject($gameMapTemp._mapObjects[i]);
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

	save() {
		$gameSystem.setSavefileId(1);
		$gameSystem.onBeforeSave();
		DataManager.saveGame(1).then(function() {}).catch(function() {});
	}

	onLoad() {
		this.setupESPGame();
	}

	shouldFastDeathFade() {
		if($espGamePlayer.lastDeathTime < 0) return false;
		return Graphics.frameCount - $espGamePlayer.lastDeathTime < 1000;
	}

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
