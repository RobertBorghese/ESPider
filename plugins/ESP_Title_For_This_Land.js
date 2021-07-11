// title title title title title title title title title title title title title title title

modify_Window_TitleCommand = class {
	maxCols() {
		return 4;
	}

	makeCommandList() {
		ESP.Window_TitleCommand.makeCommandList.apply(this, arguments);
		this.addCommand("", "fourth");
	}

	updateOpen() {
		if(this._opening) {
			this.openness += 255;
			if(this.isOpen()) {
				this._opening = false;
			}
		}
	}
}

modify_Scene_Title = class {
	create() {
		ESP.Scene_Title.create.apply(this, arguments);

		this._commandWindow.setHandler("fourth", function() {});

		this._titleButtons = ESP.makeButtons(this, 240, 40, -390, 240, 260, 0, [
			["New Game", this.commandESPNewGame.bind(this)],
			["Continue", this.commandLoadGame.bind(this)],
			["Volume [" + Math.floor(WebAudio._masterVolume * 100) + "%]", this.commandVolume.bind(this)],
			["Leave", this.commandEndGame.bind(this)]
		], 0x123a3b, 0x2e9294, 0x1b5657, 0x216869, this.onMouseEnter, this._commandWindow.isCommandEnabled.bind(this._commandWindow));
	}

	disableTheButtons() {
		this._commandWindow.deactivate();
		this._titleButtons.disableAllButtons();
	}

	commandESPNewGame() {
		this.disableTheButtons();
		this.commandNewGame();
	}

	commandLoadGame() {
		this.disableTheButtons();
		const savefileId = 1;
		DataManager.loadGame(savefileId).then(function() {
			// TODO: load game se
			this.fadeOutAll();
			SceneManager.goto(Scene_Map);
			$gameSystem.onAfterLoad();
			$gameMapTemp._shouldLoad = true;
		}.bind(this)).catch(function(e) {
			console.error("ERROR: ", e);
		});
	}

	commandVolume() {
		const masterVolume = ConfigManager.incrementVolume();
		this._titleButtons[2]._text.text = "Volume [" + masterVolume + "%]";
		this._titleButtons[2].unclick();
		this._titleButtons[2].updateGraphics();
	}

	commandEndGame() {
		this.disableTheButtons();
		SceneManager.pop();
	}

	createCommandWindow() {
		ESP.Scene_Title.createCommandWindow.apply(this, arguments);
		this._commandWindow.x = -1000;
	}

	drawGameTitle() {

		const background = new PIXI.Graphics();
		background.beginFill(0x03051f);
		background.drawRect(0, 0, Graphics.width, Graphics.height);
		background.endFill();
		this._gameTitleSprite.addChild(background);

		this._starsContainer = new Sprite();
		this._starsContainer.move((1200 - Graphics.width) / -2, 0);
		this._gameTitleSprite.addChild(this._starsContainer);

		const starBit = ImageManager.loadBitmapFromUrl("img/titles1/Star.png");
		starBit.smooth = true;
		for(let i = 0; i < 300; i++) {
			const star = new Sprite(starBit);
			star.setFrame(0, 0, 15, 15);
			star.move(Math.randomInt(1200), Math.randomInt(Graphics.height));
			star.anchor.set(0.5);
			star.scale.set((Math.random()) + 1);
			this._starsContainer.addChild(star);
		}

		this._espTitleForeground = new Sprite(ImageManager.loadBitmapFromUrl("img/titles1/Foreground.png"));
		this._espTitleForeground.filters = [ new PIXI.filters.PixelateFilter(4) ];
		this._gameTitleSprite.addChild(this._espTitleForeground);

		this._espTitleSprite = new Sprite(ImageManager.loadBitmapFromUrl("img/titles1/TitleLogo.png"));
		this._espTitleSprite.anchor.set(0.5);
		this._espTitleSprite.scale.set(3);
		this._espTitleSprite.move(Graphics.width / 2, (Graphics.height / 2) - 100);
		this._gameTitleSprite.addChild(this._espTitleSprite);
	}

	onMouseEnter(index) {
		const button = this._titleButtons[index];
		if(this._oldButton !== button) {
			if(this._oldButton) this._oldButton.unhover();
			this._oldButton = button;
			if(this._oldButton) this._oldButton.hover();
		}
		this._commandWindow.select(index);
	}

	update() {
		ESP.Scene_Title.update.apply(this, arguments);

		if(this._commandWindow.active && this._myIndex !== this._commandWindow._index) {
			this._myIndex = this._commandWindow._index;
			this.onMouseEnter(this._myIndex);
		}

		this._starsContainer.children.forEach(function(s) {
			if(s._start) {
				s._start += 0.1;
				s.setFrame(Math.floor(s._start.clamp(0, 2.99999)) * 15, 0, 15, 15);
				if(s._start > 4) {
					s._start = 0;
					s.setFrame(0, 0, 15, 15);
					s.rotation = 0;
				} else if(s._start >= 2) {
					const ratio = Easing.easeOutQuad((s._start - 2) / 2);
					s.rotation = (Math.PI / 2) * ratio;
				}
			} else if(Math.random() < 0.0004) {
				s._start = 0.001;
			}
			s.x += 0.04 * s.scale.x;
			if(s.x > 1200) {
				s.x = 0;
			}
		});
	}
}
