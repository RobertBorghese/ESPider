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

const _Scene_Boot_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
Scene_Boot.prototype.loadGameFonts = function() {
	_Scene_Boot_loadGameFonts.apply(this, arguments);
	FontManager.load("author-font", "Qahiri-Regular.ttf");
	FontManager.load("title-font", "ZenLoop-Regular.ttf");
};

modify_Scene_Title = class {
	initialize() {
		ESP.Scene_Title.initialize.apply(this, arguments);
		this._titleAnimationTime = 0;
	}

	create() {
		ESP.Scene_Title.create.apply(this, arguments);

		this._commandWindow.myUpdate = this._commandWindow.update;
		this._commandWindow.update = function() {}

		this._commandWindow.setHandler("fourth", function() {});

		// buttons
		this._titleButtons = ESP.makeButtons(this, 240, 40, -390, 240, 260, 0, [
			["New Game", this.commandESPNewGame.bind(this), 1],
			["Continue", this.commandLoadGame.bind(this)],
			["Volume [" + Math.floor(WebAudio._masterVolume * 100) + "%]", this.commandVolume.bind(this)],
			["Leave", this.commandEndGame.bind(this)]
		], 0x123a3b, 0x2e9294, 0x1b5657, 0x216869, this.onMouseEnter, this._commandWindow.isCommandEnabled.bind(this._commandWindow));
		this._titleButtons.forEach(b => b.y = 552 + 200);

		// fullscreen help
		this._fullscreenText = ESP.makeText("F4  •  Fullscreen Toggle", 22, "center");
		this._fullscreenText.style.fontFamily = "title-font";
		this._fullscreenText.alpha = 1;
		this._fullscreenText.style.strokeThickness = 6;
		this._fullscreenText.style.stroke = "rgba(1, 1, 1, 1)";

		this._fullscreenText.x = (Graphics.width) - 100;
		this._fullscreenText.y = 40 - 200;

		this.addChild(this._fullscreenText);

		// controller help
		this._controllerText = ESP.makeText("🎮  •  Controller Recommended", 22, "center");
		this._controllerText.style.fontFamily = "title-font";
		this._controllerText.alpha = 1;
		this._controllerText.style.strokeThickness = 6;
		this._controllerText.style.stroke = "rgba(1, 1, 1, 1)";

		this._controllerText.x = 130;
		this._controllerText.y = 40 - 200;

		this.addChild(this._controllerText);

		this._blackOverlay = new PIXI.Graphics();
		this._blackOverlay.beginFill(0x000000);
		this._blackOverlay.drawRect(0, 0, Graphics.width, Graphics.height);
		this._blackOverlay.endFill();
		this.addChild(this._blackOverlay);

		this._titleText = new PIXI.Text("Berry", {
			fontFamily: "title-font",
			fontSize: 180,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 0,
			lineJoin: "round",
			letterSpacing: 100
		});
		this._titleText.alpha = 0.00001;
		this._titleText.anchor.set(0.5);
		this._titleText.resolution = 2;
		this._titleText.x = (Graphics.width / 2);
		this._titleText.y = (Graphics.height / 2) - 100;
		this._titleTextGlow = new PIXI.filters.GlowFilter({
			color: 0x543ec4,
			quality: 1,
			distance: 50
		});
		this._titleText.filters = [this._titleTextGlow];
		this.addChild(this._titleText);

		this._textHolder = new Sprite();
		this.addChild(this._textHolder);

		this._mrText = new PIXI.Text("", {
			fontFamily: "author-font",
			fontSize: 60,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this._mrText.anchor.set(0.5);
		this._mrText.resolution = 2;
		this._mrText.x = (Graphics.width / 2) - 100;
		this._mrText.y = (Graphics.height / 2) - 50;
		this._textHolder.addChild(this._mrText);
		
		this._espiderText = new PIXI.Text("", {
			fontFamily: "author-font",
			fontSize: 140,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this._espiderText.anchor.set(0.5);
		this._espiderText.resolution = 2;
		this._espiderText.x = Graphics.width / 2;
		this._espiderText.y = Graphics.height / 2;
		this._textHolder.addChild(this._espiderText);

		this._presentsText = new PIXI.Text("", {
			fontFamily: "author-font",
			fontSize: 50,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this._presentsText.anchor.set(0.5);
		this._presentsText.resolution = 2;
		this._presentsText.x = (Graphics.width / 2) + 100;
		this._presentsText.y = (Graphics.height / 2) + 50;
		this._textHolder.addChild(this._presentsText);

		this._titleAnimationTime = 600;
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
		this._starsContainer.filters = [new PIXI.filters.MotionBlurFilter()];
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
		this._espTitleForeground.y = Graphics.height;
		this._gameTitleSprite.addChild(this._espTitleForeground);

		/*this._espTitleSprite = new Sprite(ImageManager.loadBitmapFromUrl("img/titles1/TitleLogo.png"));
		this._espTitleSprite.anchor.set(0.5);
		this._espTitleSprite.scale.set(3);
		this._espTitleSprite.move(Graphics.width / 2, (Graphics.height / 2) - 100 - 300);
		this._gameTitleSprite.addChild(this._espTitleSprite);*/
	}

	onMouseEnter(index, b, noSound) {
		const button = this._titleButtons[index];
		if(this._oldButton !== button) {
			if(this._oldButton) this._oldButton.unhover();
			this._oldButton = button;
			if(this._oldButton) this._oldButton.hover(noSound);
		}
		this._commandWindow.select(index);
	}

	update() {
		ESP.Scene_Title.update.apply(this, arguments);

		if(this._titleAnimationTime > 0) {
			this._titleAnimationTime--;

		}
		if(this._titleAnimationTime <= 120) {
			this._commandWindow.myUpdate();
			if(this._commandWindow.active && this._myIndex !== this._commandWindow._index) {
				this._myIndex = this._commandWindow._index;
				this.onMouseEnter(this._myIndex, null, !this._isNotFirstTime);
				this._isNotFirstTime = true;
			}
		}

		this._blackOverlay.alpha = this._titleAnimationTime > 400 ? 1 : (this._titleAnimationTime > 100 ? (this._titleAnimationTime - 100) / 300 : 0);
		this._textHolder.alpha = this._titleAnimationTime > 400 ? 1 : (this._titleAnimationTime > 200 ? (this._titleAnimationTime - 200) / 200 : 0);

		if(this._titleAnimationTime > 450) {
			const r = 1 - ((this._titleAnimationTime - 450) / 150);
			this._titleText.style.letterSpacing = (100 * r);
			const mr = "Mr.";
			const pos = (mr.length * r);
			this._mrText.text = mr.substring(0, pos + 1);

			const espider = "ESPider";
			const pos2 = (espider.length * r);
			this._espiderText.text = espider.substring(0, pos2 + 1);

			const presents = "presents...";
			this._presentsText.text = presents.substring(0, (presents.length * r) + 1);
		}

		if(this._titleAnimationTime < 260 && this._titleAnimationTime >= 50) {
			this._espTitleForeground.y = Graphics.height * Easing.easeInQuart(((this._titleAnimationTime - 50) / 210));
		}

		if(this._titleAnimationTime <= 120 && this._titleAnimationTime > 0) {
			const r = Easing.easeInCubic((this._titleAnimationTime - 1) / 120);
			//this._titleText.y = (Graphics.height / 2) - 100 - (300 * r);
			this._titleText.alpha = (1 - r);
			this._titleText.style.letterSpacing = 50 + (200 * r);

			this._fullscreenText.y = 40 - (30 * r);
			this._controllerText.y = 40 - (30 * r);
			this._fullscreenText.alpha = 1 * (1 - r);
			this._controllerText.alpha = 1 * (1 - r);
		} else if(this._titleAnimationTime === 0) {
			if(this._titleBreathe === undefined) {
				this._titleBreathe = 0;
			}
			this._titleText.scale.set((Math.sin((this._titleBreathe++) * 0.01) * 0.04) + 1);
		}

		this._titleTextGlow.innerStrength = 0;
		this._titleTextGlow.outerStrength = (Math.sin(Graphics.frameCount * 0.02) * 2) + 4;

		if(this._titleAnimationTime < 120) {
			const len = this._titleButtons.length;
			for(let i = 0; i < len; i++) {
				const n = (len - i) * 5;
				if(this._titleAnimationTime >= (n) && this._titleAnimationTime < 100 + (n)) {
					const ratio = Easing.easeInElastic((this._titleAnimationTime - n) / 100);
					this._titleButtons[i].y = 552 + (200 * ratio);
				}
			}
		}

		this._starsContainer.children.forEach((s) => {
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

			const spdY = this._titleAnimationTime > 300 ? 12 : (Easing.easeInQuart(this._titleAnimationTime / 300) * 12);
			s.y -= (spdY + 0.12) * s.scale.y;
			if(s.y < -6) {
				s.y = Graphics.height + 6;
			}

			s.x += 0.09 * s.scale.x;
			if(s.x > 1200) {
				s.x = 0;
			}
		});
	}
}
