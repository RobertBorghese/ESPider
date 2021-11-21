// im feeling 5/10 right now

document.addEventListener("load", function() { document.body.style['image-rendering'] = "pixelated"; });

modify_ConfigManager = class {
	static makeData() {
		const config = ESP.ConfigManager.makeData.apply(this, arguments);
		config.masterVolume = Math.floor(WebAudio._masterVolume * 100);
		config.contrast = SceneManager._sceneContrast;
		config.brightness = SceneManager._sceneBrightness;
		config.rendering = document.body.style['image-rendering'];
		if(config.rendering !== "auto" && config.rendering !== "pixelated") {
			config.rendering = "auto";
		}
		config.particles = ESPGamePlayer.Particles ?? true;
		config.layering = ESPGamePlayer.LayeringFreq ?? 5;
		return config;
	}

	static applyData(config) {
		ESP.ConfigManager.applyData.apply(this, arguments);
		WebAudio.setMasterVolume(((config.masterVolume ?? 100) / 100) ?? 1);
		SceneManager.setSceneFilterData(config.contrast ?? 0, config.brightness ?? 100);
		document.body.style['image-rendering'] = config.rendering ?? "auto";
		ESPGamePlayer.Particles = config.particles ?? true;
		ESPGamePlayer.LayeringFreq = config.layering ?? 5;
	}

	static incrementVolume(start) {
		let volume = start;
		if(volume > 20) {
			volume -= 20;
		} else if(volume === 20) {
			volume = 10;
		} else if(volume === 10) {
			volume = 5;
		} else if(volume <= 5) {
			volume -= 1;
		}
		if(volume < 0) {
			volume = 100;
		}
		return volume;
	}

	static incrementMasterVolume() {
		const result = this.incrementVolume(Math.floor(WebAudio._masterVolume * 100));
		WebAudio.setMasterVolume(result / 100);
		ConfigManager.save();
		return result;
	}

	static incrementBGMVolume() {
		const result = this.incrementVolume(this.bgmVolume);
		this.bgmVolume = result;
		ConfigManager.save();
		return result;
	}

	static incrementBGSVolume() {
		const result = this.incrementVolume(this.bgsVolume);
		this.bgsVolume = result;
		ConfigManager.save();
		return result;
	}

	static incrementSEVolume() {
		const result = this.incrementVolume(this.seVolume);
		this.seVolume = result;
		ConfigManager.save();
		return result;
	}
}

modify_SceneManager = class {
	static initialize() {
		ESP.SceneManager.initialize.apply(this, arguments);
		this._sceneContrast = 0;
		this._sceneBrightness = 100;
	}

	static onSceneCreate() {
		ESP.SceneManager.onSceneCreate.apply(this, arguments);
		this.applySceneFilter();
	}

	static setSceneFilterData(contrast, brightness) {
		this._sceneContrast = contrast;
		this._sceneBrightness = brightness;
		if(this.shouldFilter() && !this._scene.filters) {
			this._scene.filters = [this.makeColorFilter()];
		} else if(!this.shouldFilter() && this._scene.filters) {
			this._scene.filters = null;
		}
		this.refreshColorFilter();
	}

	static applySceneFilter() {
		if(this.shouldFilter()) {
			this._scene.filters = [this.makeColorFilter()];
		} else {
			this._scene.filters = null;
		}
	}

	static shouldFilter() {
		return this._sceneContrast !== 0 || this._sceneBrightness !== 100;
	}

	static makeColorFilter() {
		if(!this._sceneColorMatrixFilter) {
			this._sceneColorMatrixFilter = new PIXI.filters.ColorMatrixFilter();
			this.refreshColorFilter();
		}
		return this._sceneColorMatrixFilter;
	}

	static refreshColorFilter() {
		if(this._sceneColorMatrixFilter) {
			if(this._sceneBrightness === 100) {
				this._sceneColorMatrixFilter.contrast(this._sceneContrast / 100, false);
			} else if(this._sceneContrast === 0) {
				this._sceneColorMatrixFilter.brightness(this._sceneBrightness / 100, false);
			} else {
				this._sceneColorMatrixFilter.brightness(this._sceneBrightness / 100, false);
				this._sceneColorMatrixFilter.contrast(this._sceneContrast / 100, true);
			}
		}
	}
}


modify_Scene_Options = class {
	initialize() {
		ESP.Scene_Options.initialize.apply(this, arguments);
		this._titleAnimationTime = 0;
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

	createCancelButton() {
	}

	getLayeringText() {
		return "Layering Freq. [" + 
				(ESPGamePlayer.LayeringFreq === 1 ? "EXACT" :
					(ESPGamePlayer.LayeringFreq === 2 ? "GOOD" :
						(ESPGamePlayer.LayeringFreq === 3 ? "DECENT" : (ESPGamePlayer.LayeringFreq === 5 ? "MEDIUM" : "FAST")))) + "]";
	}

	create() {
		ESP.Scene_Options.create.apply(this, arguments);

		this._commandWindow = new Window_Command(new Rectangle(0, 0, 100, 100));
		this._commandWindow.maxCols = function() { return 2; };
		this._commandWindow.x = -1000;
		this._commandWindow.myUpdate = this._commandWindow.update;
		this._commandWindow.update = function() {};

		function makeGradientBit(bit, offset, width, height, offsetX = 0, offsetY = 0) {
			bit.gradientFillRect(offsetX, offsetY, offset, height, "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 255)", false);
			bit.gradientFillRect(offset + offsetX, offsetY, width - (offset * 2), height, "rgba(0, 0, 0, 255)", "rgba(0, 0, 0, 255)", false);
			bit.gradientFillRect(width - offset + offsetX, offsetY, offset, height, "rgba(0, 0, 0, 255)", "rgba(0, 0, 0, 0)", false);
		};

		function makeBitmap(width, height) {
			const bit = new Bitmap(width, height);
			makeGradientBit(bit, 280, width - 100, height, 50);
			makeGradientBit(bit, 240, width, 2);
			makeGradientBit(bit, 160, width, 2, 0, height - 2);
			return bit;
		};

		const bit = makeBitmap(1200, 105);
		const bit2 = makeBitmap(1200, 150);
		const bit3 = makeBitmap(1200, 70);

		function makeBackground(self, id, y, bitmap = bit) {
			const result = new Sprite(bitmap);
			result.move(Graphics.width / 2, y);
			result.anchor.set(0.5);
			result.alpha = 0.75;
			self.addChild(result);
			self["_background" + id] = result;
			return result;
		};

		// uncomment these for gradient black backgrounds around option sections
		if(!this._isOpeningOptionsMenuInGame) {
			makeBackground(this, 1, 125 - 30, bit2);
			makeBackground(this, 2, 278 - 30);
			makeBackground(this, 3, 408, bit2);
			makeBackground(this, 4, 560, bit3);
		}

		function makeText(self, text, y) {
			const result = ESP.makeText(text, 40, "center");
			result.anchor.set(0.5);
			result.x = (Graphics.width / 2);
			result.y = y;
			result.style.fontFamily = "title-font";
			result.alpha = 1;
			result.style.strokeThickness = 6;
			result.style.stroke = "rgba(1, 1, 1, 1)";
			self.addChild(result);
			return result;
		};

		makeText(this, "Volume", 77 - 30);
		makeText(this, "Visual Accessibility", 255 - 30);
		makeText(this, "Other Options", 383 - 30);
		//makeText(this, "", 252);

		//pixiObject, width, height, shiftX, shiftY, offsetX, offsetY, data, color1, color2, color3, color4, onMouseEnter, enabledFunc
		this._titleButtons = ESP.makeButtons(this, 280, 40, 0, 0, 0, 60, [
			["Master [" + Math.floor(WebAudio._masterVolume * 100) + "%]", this.commandVolume.bind(this)],
			["Music [" + Math.floor(ConfigManager.bgmVolume) + "%]", this.commandBGMVolume.bind(this)],
			["Ambience [" + Math.floor(ConfigManager.bgsVolume) + "%]", this.commandBGSVolume.bind(this)],
			["Effect [" + Math.floor(ConfigManager.seVolume) + "%]", this.commandSEVolume.bind(this)],

			["Contrast [" + Math.floor(SceneManager._sceneContrast) + "%]", this.commandContrast.bind(this)],
			["Brightness [" + Math.floor(SceneManager._sceneBrightness) + "%]", this.commandBrightness.bind(this)],

			["Controller Vibration [" + (Input.AllowVibrate ? "ON" : "OFF") + "]", this.commandVibrate.bind(this)],
			["Render Style [" + (document.body.style['image-rendering'] === "pixelated" ? "PIXELATED" : "CRISP") + "]", this.commandRenderStyle.bind(this)],
			["Particles [" + (ESPGamePlayer.Particles ? "ON" : "OFF") + "]", this.commandParticles.bind(this)],
			[this.getLayeringText(), this.commandLayering.bind(this)],

			["Reset Options", this.commandResetOptions.bind(this)],
			["Leave", this.commandLeave.bind(this)]
		], 0x123a3b, 0x2e9294, 0x1b5657, 0x216869, this.onMouseEnter, () => true);
		//this._titleButtons.forEach(b => b.y = 552 + 200);

		const x = (Graphics.width / 2);
		const y = (Graphics.height / 2) - 220;
		for(let i = 0; i < this._titleButtons.length; i++) {
			this._commandWindow.addCommand("", i.toString());

			const b = this._titleButtons[i];
			const isLeft = i % 2 === 0;
			b.x = x + (isLeft ? -150 : 150);
			b.y = y + (Math.floor(i / 2) * 50);

			if(i >= this._titleButtons.length - 8) {
				b.y += 80;
			}

			if(i >= this._titleButtons.length - 6) {
				b.y += 80;
			}

			if(i >= this._titleButtons.length - 2) {
				//b.__espWidth = 460;
				b.y += 60;
				//b.updateLineBackground();
				//b.updateGraphics();
			}
		}
	}

	update() {
		ESP.Scene_Options.update.apply(this, arguments);

		this._commandWindow.myUpdate();
		if(this._commandWindow.active && this._myIndex !== this._commandWindow._index) {
			this._myIndex = this._commandWindow._index;
			this.onMouseEnter(this._myIndex, null, !this._isNotFirstTime);
			this._isNotFirstTime = true;
		}
	}

	setButtonText(index, text) {
		this._titleButtons[index]._text.text = text;
		this._titleButtons[index].unclick();
		this._titleButtons[index].updateGraphics();
	}

	commandVolume() {
		const volume = ConfigManager.incrementMasterVolume();
		this.setButtonText(0, "Master [" + volume + "%]");
	}

	commandBGMVolume() {
		const volume = ConfigManager.incrementBGMVolume();
		this.setButtonText(1, "Music [" + volume + "%]");
	}

	commandBGSVolume() {
		const volume = ConfigManager.incrementBGSVolume();
		this.setButtonText(2, "Ambience [" + volume + "%]");
	}

	commandSEVolume() {
		const volume = ConfigManager.incrementSEVolume();
		this.setButtonText(3, "Effect [" + volume + "%]");
	}

	_incrementContrast(input) {
		if(input < 50) {
			input += 10;
		} else {
			input = -50;
		}
		return input;
	}

	commandContrast() {
		const result = this._incrementContrast(SceneManager._sceneContrast);
		SceneManager.setSceneFilterData(result, SceneManager._sceneBrightness);
		this.setButtonText(4, "Contrast [" + result + "%]");
	}

	_incrementBrightness(input) {
		if(input < 150) {
			input += 10;
		} else {
			input = 50;
		}
		return input;
	}

	commandBrightness() {
		const result = this._incrementBrightness(SceneManager._sceneBrightness);
		SceneManager.setSceneFilterData(SceneManager._sceneContrast, result);
		this.setButtonText(5, "Brightness [" + result + "%]");
	}

	commandVibrate() {
		Input.AllowVibrate = !Input.AllowVibrate;
		this.setButtonText(6, "Controller Vibration [" + (Input.AllowVibrate ? "ON" : "OFF") + "]");
	}

	commandRenderStyle() {
		const result = document.body.style['image-rendering'] === "pixelated" ? "auto" : "pixelated";
		document.body.style['image-rendering'] = result;
		this.setButtonText(7, "Render Style [" + (result === "pixelated" ? "PIXELATED" : "CRISP") + "]");
	}

	/*["Particles [" + (ESPGamePlayer.Particles ? "ON" : "OFF") + "]", this.commandParticles.bind(this)],
			[this.getLayeringText(), this.commandLayering.bind(this)],*/

	commandParticles() {
		ESPGamePlayer.Particles = !ESPGamePlayer.Particles;
		this.setButtonText(8, "Particles [" + (ESPGamePlayer.Particles ? "ON" : "OFF") + "]");
	}

	commandLayering() {
		if(ESPGamePlayer.LayeringFreq < 3) {
			ESPGamePlayer.LayeringFreq++;
		} else if(ESPGamePlayer.LayeringFreq === 3) {
			ESPGamePlayer.LayeringFreq = 5;
		} else if(ESPGamePlayer.LayeringFreq === 5) {
			ESPGamePlayer.LayeringFreq = 10
		} else {
			ESPGamePlayer.LayeringFreq = 1;
		}
		this.setButtonText(9, this.getLayeringText());
	}

	commandResetOptions() {
		ConfigManager.bgmVolume = 100;
		ConfigManager.bgsVolume = 100;
		ConfigManager.seVolume = 100;
    	WebAudio.setMasterVolume(1);
		SceneManager.setSceneFilterData(0, 100);
		document.body.style['image-rendering'] = "auto";
		Input.AllowVibrate = true;
		ESPGamePlayer.Particles = true;
		ESPGamePlayer.LayeringFreq = 5;

		this.setButtonText(0, "Master [100%]");
		this.setButtonText(1, "Music [100%]");
		this.setButtonText(2, "Ambience [100%]");
		this.setButtonText(3, "Effect [100%]");
		this.setButtonText(4, "Contrast [0%]");
		this.setButtonText(5, "Brightness [100%]");

		this.setButtonText(6, "Controller Vibration [ON]");
		this.setButtonText(7, "Render Style [CRISP]");
		this.setButtonText(8, "Particles [ON]");
		this.setButtonText(9, "Layering Freq. [MEDIUM]");

		this.setButtonText(10, "Reset Options");
	}

	commandLeave() {
		this.popScene();
		Scene_Title._fromOptions = true;
	}

	createOptionsWindow() {}
}
