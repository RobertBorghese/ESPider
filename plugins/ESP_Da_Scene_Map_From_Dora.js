// ESP_Da_Map_From_Dora.js was getting a bit too big.

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
		this.updateCameraPos();
	}

	updateCameraPos(force = false) {
		if(this._spriteset && (this._spriteset.canMoveCamera())) {
			this._spriteset.setCameraPos(
				($espGamePlayer.position.x * this._spriteset._tilemap.scale.x) - (Graphics.width / 2),
				($espGamePlayer.position.y * this._spriteset._tilemap.scale.y) - (Graphics.height / 2),
				$gameTemp._isNewGame || $gameMap._isTranferring || force);
			$gameMap.ESPCameraX = -this._spriteset._tilemap.x;
			$gameMap.ESPCameraY = -this._spriteset._tilemap.y;
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
		$gameMapTemp._toBeDeleted.forEach(function(obj) {
			$gameMapTemp._mapObjects.remove(obj);
		});
		$gameMapTemp._toBeDeleted = [];
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

		this.createFlyCounterDisplay();
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
		this._titleButtons[1]._text.text = "Volume [" + masterVolume + "%]";
		this._titleButtons[1].unclick();
		this._titleButtons[1].updateGraphics();
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

	addUiChild(child) {
		this._spriteset._tilemap._uiHolder.addChild(child);
	}

	removeUiChild(child) {
		this._spriteset._tilemap._uiHolder.removeChild(child);
	}

	// no button allowed!
	createMenuButton() {}

	// lets prevent da touching shit
	processMapTouch() {}
	onMapTouch() {}

	// lazy way to prevent menu
	isMenuCalled() { return false; }
}