// title title title title title title title title title title title title title title title

class Sprite_StarsBackground extends Sprite {
	constructor(width, height, starCount = 300) {
		super();

		this._starsWidth = width;
		this._starsHeight = height;

		this._speedY = 0;
		this._speedX = 0.09;

		this.move((1200 - this._starsWidth) / -2, 0);
		this.filters = [new PIXI.filters.MotionBlurFilter()];

		const starBit = ImageManager.loadBitmapFromUrl("img/titles1/Star.png");
		starBit.smooth = true;
		for(let i = 0; i < starCount; i++) {
			const star = new Sprite(starBit);
			star.setFrame(0, 0, 15, 15);
			star.move(Math.randomInt(1200), Math.randomInt(this._starsHeight));
			star.anchor.set(0.5);
			star.scale.set((Math.random()) + 1);
			this.addChild(star);
		}
	}

	update() {
		this.children.forEach((s) => {
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

			const spdY = this._speedY;
			s.y -= (spdY + 0.12) * s.scale.y;
			if(s.y < -6) {
				s.y = this._starsHeight + 6;
			} else if(s.y > this._starsHeight + 7) {
				s.y = -5;
			}

			s.x += this._speedX * s.scale.x;
			if(s.x > 1200) {
				s.x = 0;
			} else if(s.x < -6) {
				s.x = 1200 - 1;
			}
		});
	}

	static makeColor(width, height) {
		const background = new PIXI.Graphics();
		background.beginFill(0x03051f);
		background.drawRect(0, 0, width, height);
		background.endFill();
		return background;
	}
}

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

		// new game text
		this._newGameText = ESP.makeText("", 24, "center");
		this._newGameText.style.fontStyle = "italic";
		//this._newGameText.style.fontFamily = "title-font";
		this._newGameText.alpha = 1;
		this._newGameText.style.strokeThickness = 4;
		this._newGameText.style.stroke = "rgba(1, 1, 1, 1)";
		this._newGameText.x = Graphics.width / 2;
		this._newGameText.y = Graphics.height / 2;
		this.addChild(this._newGameText);

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

		this._newGameAnimationTime = 0;
		this._newGameCutscene = true;
		//this.commandNewGame();
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

		const background = Sprite_StarsBackground.makeColor(Graphics.width, Graphics.height);
		this._gameTitleSprite.addChild(background);

		this._starsContainer = new Sprite_StarsBackground(Graphics.width, Graphics.height);
		this._gameTitleSprite.addChild(this._starsContainer);

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

		if(this._newGameCutscene === 2) {
			this._commandWindow.myUpdate();
			return;
		}
		if(this._newGameCutscene) {
			this.updateNewGameCutscene();
		} else {
			this.updateIntroCutscene();
		}
	}

	updateNewGameCutscene() {
		if(this._awaitingInput) {
			if(Input.isOkTriggeredEx()) {
				ESPAudio.titleSceneConfirm();
				this._awaitingInput = false;
			} else {
				return;
			}
		}
		this._newGameAnimationTime++;

		const t = this._newGameAnimationTime;

		if(t === 1) {
			AudioManager.fadeOutBgm(3);
		} else if(t === 20) {
			this._flySprite = new ESPAnimatedSprite("img/pictures/Intro/fly.png", 2);
			const size = 82 * 50;
			this._flySprite.scale.set(50);
			this._flySprite.anchor.set(0.5);
			this._flySprite.x = -1450;
			this._flySprite.y = 150;
			this.addChild(this._flySprite);
		} else if(t > 20 && t <= 140) {
			const r = Easing.easeInOutCubic((t - 20) / 120);
			this._flySprite.scale.set(50);
			this._flySprite.x = ESP.lerpEx(-1450, 450, r);
			this._flySprite.y = 150;

			this._flySprite.rotation = Math.sin(t * 0.1) * -0.35;
			this._flySpriteRotation = this._flySprite.rotation;

			if(t === 140) {
				this._starsContainer._speedY = -4;
				this._starsContainer._speedX = -7;
				this._espTitleForeground.visible = false;
				this._fullscreenText.visible = false;
				this._controllerText.visible = false;
				this._titleText.visible = false;
				this._titleButtons.forEach(t => t.visible = false);
			}
		} else if(t > 140 && t <= 140 + 80) {
			const r = Easing.easeInCubic((t - 140) / 80);

			this._flySprite.scale.set(50 + (4 - 50) * r);
			//this._flySprite.x = ESP.lerpEx(450, 850, r);
			//this._flySprite.y = ESP.lerpEx(150, 400, r);
			
		} else if(t > 140 + 80 && t <= 140 + 80 + 200) {
			const r = Easing.easeOutCubic((t - 140) / 200);

			this._flySprite.scale.set(4);
			
			//this._flySprite.rotation = ESP.lerpEx(0, -2.0, r);
		}

		if(t === 30) {
			AudioManager.playBgs({
				name: "Wind4", volume: 50, pitch: 100, pan: 0
			});
			AudioManager.fadeInBgs(2);
		}

		if(t > 140 && t <= /*620*/340) {
			const r = Easing.easeOutCubic((t - 140) / (480));
			const r2 = ((t - 140) / 80).clamp(0, 1);
			const newRotation = ESP.lerpEx(0, -2.0, r) + Math.atan2(this._flySprite.y, this._flySprite.x) - 0.46507036044920974;
			const newX = 450 + (Math.cos(r * Math.PI * 2) * 900 * ((1 - r)));//ESP.lerpEx(450, 850, r);
			const newY = 200 + (Math.sin((Math.PI * 0.5) + (r * Math.PI * 4)) * 500 * ((1 - r)));//ESP.lerpEx(150, 400, r);
			
			this._flySprite.rotation = ESP.lerpEx(this._flySpriteRotation, newRotation, r2);
			this._flySprite.x = ESP.lerpEx(450, newX, r2);
			this._flySprite.y = ESP.lerpEx(150, newY, r2);

			this._flySpriteX = this._flySprite.x;
			this._flySpriteY = this._flySprite.y;
			this._flySpriteRotation = this._flySprite.rotation;
		} else if(t > 340 && t < 400) {
			if(t === 341) ESPAudio.flyGet();
			this._flySprite.rotation = ESP.lerpEx(this._flySprite.rotation, 0, 0.07);
			this._flySprite.x = ESP.lerpEx(this._flySprite.x, 1300, 0.07);
			this._flySprite.y = ESP.lerpEx(this._flySprite.y, -100, 0.07);
		} else if(t === 400) {
			AudioManager.stopBgs();
			ESPAudio.titleSceneText();
			this._blackOverlay.visible = true;
			this._blackOverlay.alpha = 1;
			this._newGameText.text = "It's a spider's dream to claim the brightest light.";
			this._newGameText.visible = true;
			this._newGameText.alpha = 1;
			this._awaitingInput = true;
		} else if(t > 400 && t <= 450) {
			const r = ((t - 400) / 50);
			this._newGameText.style.letterSpacing = 40 * r;
			this._newGameText.alpha = 1 - r;
		} else if(t > 450 && t <= 500) {
			this._starsContainer._speedY = -2.3;
			this._starsContainer._speedX = 0.09;
			const r = ((t - 450) / 50);
			this._blackOverlay.alpha = 1 - r;
		} else if(t > 500 && t <= 700) {
			if(t === 501) {
				this._lamp = new Sprite(ImageManager.loadBitmapFromUrl("img/pictures/Intro/Page2Workspace.png"));
				this._lamp.scale.set(2);
				this._lamp.anchor.set(0.5);
				this._lamp.x = Graphics.width / 2;
				this._lamp.y = -200;
				this.addChild(this._lamp);
			}
			const r = Easing.easeOutCubic((t - 500) / 250);
			this._lamp.y = -200 + (400 * r);
			this._lamp.scale.set(2 + (2 * r));
			this._starsContainer._speedY = -2.3 + ((2.3 + 0.09) * r);
			//this._starsContainer._speedX = 0.09;
			//this._blackOverlay.alpha = 1 - r;
		} else if(t === 701) {
			ESPAudio.titleSceneText();
			this._lamp.visible = false;
			this._blackOverlay.visible = true;
			this._blackOverlay.alpha = 1;
			this._newGameText.text = "Seek out the perfect light...";
			this._newGameText.style.letterSpacing = 0;
			this._newGameText.visible = true;
			this._newGameText.alpha = 1;
			this._awaitingInput = true;
		} else if(t > 700 && t <= 750) {
			const r = ((t - 701) / 49);
			this._newGameText.style.letterSpacing = 40 * r;
			this._newGameText.alpha = 1 - r;
		} else if(t > 750 && t <= 800) {
			if(t === 751) {
				this._page3 = new Sprite(ImageManager.loadBitmapFromUrl("img/pictures/Intro/Page3.png"));
				this._page3.fitlers = [new PIXI.filters.PixelateFilter(2)];
				this._page3.scale.set(6);
				this._page3.anchor.set(0.5);
				this._page3.move(2400, -500);
				this.addChild(this._page3);
			}
			this._starsContainer._speedY = 0.09;
			this._starsContainer._speedX = 0.09;
			const r = ((t - 750) / 50);
			this._blackOverlay.alpha = 1 - r;
		}
		if(t > 750 && t <= 1000) {
			const r = Easing.easeInOutCubic((t - 750) / 250);
			this._page3.scale.set(6 - (5 * r));
			this._page3.move(ESP.lerpEx(2400, Graphics.width / 2, r), ESP.lerpEx(-500, Graphics.height / 2, r));
		}

		if(t === 1020) {
			ESPAudio.titleSceneText();
			this._page3.visible = false;
			this._blackOverlay.visible = true;
			this._blackOverlay.alpha = 1;
			this._newGameText.text = "... and your food will seek you.";
			this._newGameText.style.letterSpacing = 0;
			this._newGameText.visible = true;
			this._newGameText.alpha = 1;
			this._awaitingInput = true;
		} else if(t > 1020 && t <= 1070) {
			const r = ((t - 1021) / 49);
			this._newGameText.style.letterSpacing = 40 * r;
			this._newGameText.alpha = 1 - r;
		} else if(t === 1080) {
			this._newGameCutscene = 2;
			this.commandNewGame();
		}
	}

	updateIntroCutscene() {
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

		this._starsContainer._speedY = this._titleAnimationTime > 300 ? 12 : (Easing.easeInQuart(this._titleAnimationTime / 300) * 12);
	}
}
