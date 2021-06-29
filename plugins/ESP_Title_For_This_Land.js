// title title title title title title title title title title title title title title title

modify_Window_TitleCommand = class {
	maxCols() {
		return 3;
	}
}

modify_Scene_Title = class {
	create() {
		ESP.Scene_Title.create.apply(this, arguments);

		const shiftX = -260;
		const shiftY = 240;
		const offsetX = 260;
		const offsetY = 0;

		const x = (Graphics.boxWidth / 2) + shiftX;
		const y = (Graphics.boxHeight / 2) + shiftY;

		this._newGameButton = new ESPButton(240, 40, "New Game", 0xd4336b, 0xa12751, 0xbd2d5f, 0xfca9c6, this.commandNewGame.bind(this));
		this._newGameButton.move(x, y);
		this._newGameButton.onMouseEnter = this.onMouseEnter.bind(this, 0, this._newGameButton);

		this._continueButton = new ESPButton(240, 40, "Continue", 0x3363d4, 0x274ca1, 0x2d58bd, 0xa9c2fc, this.commandLoadGame.bind(this));
		this._continueButton.move(x + offsetX, y + offsetY);
		this._continueButton.onMouseEnter = this.onMouseEnter.bind(this, 1, this._continueButton);

		this._exitButton = new ESPButton(240, 40, "Leave Game", 0x2dba73, 0x208754, 0x27a365, 0x9ae6c0, this.commandEndGame.bind(this));
		this._exitButton.move(x + (offsetX * 2), y + (offsetY * 2));
		this._exitButton.onMouseEnter = this.onMouseEnter.bind(this, 2, this._exitButton);

		this.addChild(this._newGameButton);
		this.addChild(this._continueButton);
		this.addChild(this._exitButton);
	}

	commandLoadGame() {
		this.commandNewGame();
	}

	commandEndGame() {
		SceneManager.pop();
	}

	createCommandWindow() {
		ESP.Scene_Title.createCommandWindow.apply(this, arguments);
		this._commandWindow.x = -1000;
	}

	drawGameTitle() {
		this._espTitleSprite = new Sprite(ImageManager.loadBitmapFromUrl("img/titles1/TitleLogo.png"));
		this._espTitleSprite.anchor.set(0.5);
		this._espTitleSprite.scale.set(3);
		this._espTitleSprite.move(Graphics.boxWidth / 2, (Graphics.boxHeight / 2) - 100);
		this._gameTitleSprite.addChild(this._espTitleSprite);
	}

	onMouseEnter(index) {
		const button = index === 0 ? this._newGameButton : (index === 1 ? this._continueButton : this._exitButton);
		if(this._oldButton !== button) {
			if(this._oldButton) this._oldButton.unhover();
			this._oldButton = button;
			if(this._oldButton) this._oldButton.hover();
		}
		this._commandWindow.select(index);
	}

	update() {
		ESP.Scene_Title.update.apply(this, arguments);

		if(this._myIndex !== this._commandWindow._index) {
			this._myIndex = this._commandWindow._index;
			this.onMouseEnter(this._myIndex);
		}
	}
}
