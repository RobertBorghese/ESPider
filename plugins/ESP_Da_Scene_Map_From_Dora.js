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

	updateCameraPos() {
		if(this._spriteset && this._spriteset.canMoveCamera()) {
			this._spriteset.setCameraPos($espGamePlayer.position.x - (Graphics.width / 2), $espGamePlayer.displayY() - (Graphics.height / 2));
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

	// no button allowed!
	createMenuButton() {}

	// lets prevent da touching shit
	processMapTouch() {}
	onMapTouch() {}

	// lazy way to prevent menu
	isMenuCalled() { return false; }
}