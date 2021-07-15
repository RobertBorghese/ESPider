// ESP_Da_Map_From_Dora.js was getting a bit too big.

class Window_PauseCommand extends Window_Command {
	maxCols() {
		return 1;
	}

	makeCommandList() {
		for(let i = 0; i < 5; i++) {
			this.addCommand("", "_" + i);
		}
	}
}

modify_Scene_Map = class {
	initialize() {
		ESP.Scene_Map.initialize.apply(this, arguments);
		this._isPaused = false;
		this._titleButtons = null;
		this._targetCameraX = null;
		this._targetCameraY = null;
		this._slideshowList = null;
		this.gameTime = 0;
	}

	createDisplayObjects() {
		ESP.Scene_Map.createDisplayObjects.apply(this, arguments);

		this._slideshowHolder = new Sprite();
		this.addChild(this._slideshowHolder);

		this._overlay = new PIXI.Graphics();
		this._overlay.beginFill(0xffffff);
		this._overlay.drawRect(0, 0, Graphics.width, Graphics.height);
		this._overlay.endFill();
		this._overlay.alpha = 0;
		this.addChild(this._overlay);
	}

	start() {
		ESP.Scene_Map.start.apply(this, arguments);

		if($gameMapTemp._mapMovingPlatforms && $gameMapTemp._mapMovingPlatforms.length > 0) {
			const movingPlatforms = $gameMapTemp._mapMovingPlatforms;
			const len = movingPlatforms.length;
			for(let i = 0; i < len; i++) {
				movingPlatforms[i].onCreate();
			}
		}

		const objects = $gameMap.getGameObjects();
		const len = objects.length;
		for(let i = 0; i < len; i++) {
			objects[i].onCreate();
		}
	}

	updateMain() {
		if(this._slideshowList !== null) {
			this.updateSlideshow();
		} else {
			if(!this._isPaused) {
				ESP.Scene_Map.updateMain.apply(this, arguments);
				this.updateESPRespawns();
				this.updateESPMovingPlatforms();
				this.updateESPPlayer();
				this.updateESPGameObjects();
				this.updatePauseInput();
				this.updateESPBackground();
			} else {
				this.updatePause();
			}
		}
	}

	// update player
	updateESPPlayer() {
		$espGamePlayer.update();
		this.updateCameraPos();
	}

	// sets camera x y to certain position
	setCameraTargetXY(x, y) {
		this._targetCameraX = x;
		this._targetCameraY = y;
	}

	// sets camera back to player
	setCameraToPlayer() {
		this._targetCameraX = this._targetCameraY = null;
	}

	updateCameraPos(force = false) {
		if(this._spriteset && (this._spriteset.canMoveCamera())) {
			const letsForce = $gameTemp._isNewGame || ($gameMap._isTranferring && !$espGamePlayer._canControl) || force || this._spriteset._tilemap.scale.x > 1;
			this._spriteset.setCameraPos(this.genCameraPosX(), this.genCameraPosY(), letsForce);
			$gameMap.ESPCameraX = -this._spriteset._tilemap.x;
			$gameMap.ESPCameraY = -this._spriteset._tilemap.y;
		}
	}

	isCameraAtTarget(threshold = 10) {
		return this._spriteset.isCameraAtTarget(threshold);
	}

	genCameraPosX() {
		return ((this._targetCameraX ?? $espGamePlayer.position.x) * this._spriteset._tilemap.scale.x) - (Graphics.width / 2) + $gameMap.ESPCameraOffsetX;
	}

	genCameraPosY() {
		return ((this._targetCameraY ?? $espGamePlayer.cameraY()) * this._spriteset._tilemap.scale.y) - (Graphics.height / 2) + $gameMap.ESPCameraOffsetY;
	}

	updateESPRespawns() {
		this.gameTime++;
		console.log($gameMapTemp._requestedRespawns);
		if($gameMapTemp._requestedRespawns && $gameMapTemp._requestedRespawns.length > 0) {
			for(let i = 0; i < $gameMapTemp._requestedRespawns.length; i++) {
				const respawn = $gameMapTemp._requestedRespawns[i];
				console.log(respawn[1], this.gameTime);
				if(respawn[1] <= this.gameTime) {
					const obj = $gameMap.createEventObjectFromId(respawn[0]);
					obj.position.z = respawn[2];
					$gameMapTemp._requestedRespawns.splice(i, 1);
					i--;
				}
			}
		}
	}

	// update game objects
	updateESPMovingPlatforms() {
		if($gameMapTemp._mapMovingPlatforms && $gameMapTemp._mapMovingPlatforms.length > 0) {
			$gameMapTemp._objectsUpdating = true;
			if(!$gameMap.espIsFrozen()) {
				const objs = $gameMapTemp._mapMovingPlatforms;
				const len = objs.length;
				for(let i = 0; i < len; i++) {
					objs[i].update();
				}
			}
			$gameMapTemp._objectsUpdating = false;
			if($gameMapTemp._toBeDeleted.length > 0) {
				$gameMapTemp._toBeDeleted.forEach(function(obj) {
					$gameMapTemp._mapMovingPlatforms.remove(obj);
				});
				$gameMapTemp._toBeDeleted = [];
			}
		}
	}

	// update game objects
	updateESPGameObjects() {
		$gameMapTemp._objectsUpdating = true;
		if(!$gameMap.espIsFrozen()) {
			const objs = $gameMap.getGameObjects();
			const len = objs.length;
			for(let i = 0; i < len; i++) {
				objs[i].update();
			}
		}
		$gameMapTemp._objectsUpdating = false;
		if($gameMapTemp._toBeDeleted.length > 0) {
			$gameMapTemp._toBeDeleted.forEach(function(obj) {
				if(obj.isMovingPlatform()) {
					$gameMapTemp._mapMovingPlatforms.remove(obj);
				} else {
					$gameMapTemp._mapObjects.remove(obj);
				}
			});
			$gameMapTemp._toBeDeleted = [];
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

		this._titleButtons = ESP.makeButtons(this, 300, 40, 0, -120, 0, 58, [
			["Resume", this.onUnpause.bind(this), 2],
			["Restart from Checkpoint", this.restartFromLastCheckpoint.bind(this), 2],
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

		this.createFlyCounterDisplay();

		ESPAudio.pause();
	}

	createFlyCounterDisplay() {
		if(!this._flyHolder) {
			this._flyHolder = new Sprite();
			this._flyHolder.x = -100;
		} else {
			this.removeChild(this._flyHolder);
		}
		this._flyHolder.x = -1000;
		this._flyHolder.__aniIntroTime = 0;
		this.addChild(this._flyHolder);

		this._flyIcon = new Sprite(ImageManager.loadBitmapFromUrl("img/system/FlyIcon.png"));
		this._flyIcon.scale.set(3);
		this._flyIcon.move(12, Graphics.height - (2 * 24) - 12);

		this._flyCountText = ESP.makeText("×" + $espGamePlayer.flies(), 30, "left");
		this._flyCountText.anchor.set(0, 0.5);
		this._flyCountText.x = (24 * 2) + 12;
		this._flyCountText.y = this._flyIcon.y + 12;

		this._flyBackground = new PIXI.Graphics();
		this._flyBackground.beginFill(0xffffff);
		this._flyBackground.drawRoundedRect(-30, 0, 130 + (this._flyCountText.width - 30), 35, 8);
		this._flyBackground.endFill();
		this._flyBackground.alpha = 0.5;
		this._flyBackground.x = 0;
		this._flyBackground.y = Graphics.height - 65;

		this._flyHolder.addChild(this._flyBackground);
		this._flyHolder.addChild(this._flyIcon);
		this._flyHolder.addChild(this._flyCountText);
	}

	restartFromLastCheckpoint() {
		this.onUnpause();
		$espGamePlayer.kill(0, 0, 0);
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

		this.destroyFlyCounterDisplay();

		this._pauseWindow.select(-1);

		this._titleButtons = null;
		this._myPauseMenuIndex = null;
		this._oldButton = null;

		ESPAudio.unpause();
	}

	destroyFlyCounterDisplay() {
		if(this._flyBackground) {
			this._flyHolder.removeChild(this._flyBackground);
			this._flyBackground.destroy();
			this._flyBackground = null;
		}

		if(this._flyIcon) {
			this._flyHolder.removeChild(this._flyIcon);
			this._flyIcon.destroy();
			this._flyIcon = null;
		}

		if(this._flyCountText) {
			this._flyHolder.removeChild(this._flyCountText);
			this._flyCountText.destroy();
			this._flyCountText = null;
		}
	}

	commandVolume() {
		const masterVolume = ConfigManager.incrementVolume();
		this._titleButtons[2]._text.text = "Volume [" + masterVolume + "%]";
		this._titleButtons[2].unclick();
		this._titleButtons[2].updateGraphics();
	}

	disableAllButtons() {
		this._titleButtons.disableAllButtons();
		this._pauseWindow.deactivate();
	}

	commandReturnToTitle() {
		this.disableAllButtons();
		SceneManager.goto(Scene_Title);
	}

	commandExitGame() {
		this.disableAllButtons();
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
		if(this._flyHolder) {
			if(this._flyHolder.__aniIntroTime < 1) {
				this._flyHolder.__aniIntroTime += 0.05;
				if(this._flyHolder.__aniIntroTime >= 1) this._flyHolder.__aniIntroTime = 1;
				this._flyHolder.x = Easing.easeInBack(1 - this._flyHolder.__aniIntroTime) * -40;
			}
		}
		if(this.isPauseInputTriggered()) {
			this.onUnpause();
		}
		if(this._pauseWindow) {
			this._pauseWindow.update();
		}
		if(this._pauseWindow.active && this._myPauseMenuIndex !== this._pauseWindow._index) {
			this._myPauseMenuIndex = this._pauseWindow._index;
			this.onMouseEnter(this._myPauseMenuIndex);
		}
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

	addUiChild(child) {
		this._spriteset._tilemap._uiHolder.addChild(child);
	}

	removeUiChild(child) {
		this._spriteset._tilemap._uiHolder.removeChild(child);
	}

	updateSlideshow() {
		if(this._slideshowTimer > 0) {
			this._slideshowTimer--;
		} else {
			if(this._slideshowFadingOut) {
				if(this._overlay.alpha < 1) {
					this._overlay.alpha += (this._slideshowEnding ? 0.02 : 0.1);
					if(this._overlay.alpha >= 1) {
						this.incrementSlideshow();
						this._overlay.alpha = 1;
						this._slideshowFadingOut = false;
					}
				}
			} else {
				if(this._overlay.alpha > 0) {
					this._overlay.alpha -= (this._slideshowEnding ? 0.02 : 0.1);
					if(this._overlay.alpha <= 0 && this._slideshowEnding) {
						this.endSlideshow();
					}
				}
				if(!this._slideshowEnding && this._overlay.alpha <= 0 && this.isSlideshowIncrementTriggered()) {
					{
						this._slideshowFadingOut = true;
						this._slideshowEnding = ((this._slideshowIndex + 1) >= this._slideshowList.length);
						if(this._slideshowEnding) {
							if(this._slideshowBackground) {
								AudioManager.fadeOutBgm(2);
								this._slideshowHolder.removeChild(this._slideshowBackground);
								this._slideshowBackground.destroy();
								this._slideshowBackground = null;
							}
						}
					}
				}
			}
		}
	}

	startSlideshow(list) {
		this._slideshowList = list;
		this._slideshowIndex = -1;
		this._slideshowTimer = 60;
		this._slideshowFadingOut = false;
		this._slideshowEnding = false;

		this._slideshowBackground = new PIXI.Graphics();
		this._slideshowBackground.beginFill(0x000000);
		this._slideshowBackground.drawRect(0, 0, Graphics.width, Graphics.height);
		this._slideshowBackground.endFill();
		this._slideshowHolder.addChild(this._slideshowBackground);

		this.incrementSlideshow();
	}

	endSlideshow() {
		this._slideshowList = null;
		this._slideshowIndex = -1;
		this._slideshowTimer = 60;
		this._slideshowFadingOut = false;
		this._slideshowEnding = true;

		if(this._slideshowBackground) {
			this._slideshowHolder.removeChild(this._slideshowBackground);
			this._slideshowBackground.destroy();
			this._slideshowBackground = null;
		}
	}

	incrementSlideshow() {
		this._slideshowIndex++;
		const hasBackground = this._slideshowHolder.children.contains(this._slideshowBackground);
		while(this._slideshowHolder.children.length > 0) {
			let child = this._slideshowHolder.children[0];
			this._slideshowHolder.removeChild(child);
		}
		if(hasBackground) this._slideshowHolder.addChild(this._slideshowBackground);
		if(this._slideshowList && this._slideshowIndex < this._slideshowList.length) {
			const data = this._slideshowList[this._slideshowIndex];
			if(Array.isArray(data)) {
				const spr = new Sprite(ImageManager.loadBitmapFromUrl(data[0]));
				this._slideshowHolder.addChild(spr);
			} else if(typeof data === "string") {
				const background = new PIXI.Graphics();
				background.beginFill(0x000000);
				background.drawRect(0, 0, Graphics.width, Graphics.height);
				background.endFill();
				this._slideshowHolder.addChild(background);

				const text = ESP.makeText(data);
				text.x = Graphics.width / 2;
				text.y = Graphics.height / 2;
				this._slideshowHolder.addChild(text);
			}
		}
	}

	isSlideshowIncrementTriggered() {
		return Input.isTriggeredEx("space") || Input.isTriggeredEx("enter") || TouchInput.isTriggered() || Input.isTriggered("button_a");
	}

	// no button allowed!
	createMenuButton() {}

	// lets prevent da touching shit
	processMapTouch() {}
	onMapTouch() {}

	// lazy way to prevent menu
	isMenuCalled() { return false; }
}
