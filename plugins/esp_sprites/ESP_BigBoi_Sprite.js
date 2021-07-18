// "This is gonna be a piece of cake!" <- Very optimistic version of me about to get fucking ass pounded

class ESPBigBoiSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 50;

		this._slugHolder = new Sprite();
		this.ObjectHolder.addChild(this._slugHolder);

		this._slugSprite = new ESPAnimatedSprite("img/enemies/BigSlug.png", 0);
		this._slugSprite.scale.set(4);
		this._slugSprite.anchor.set(0.5, 1);
		this._slugHolder.addChild(this._slugSprite);

		this._jumpAnimationFrame = 0;
		this._isJumpReady = false;
		this._animationMode = 0;
		this._animationFrame =  0;
		this._animationIndex = 0;
		this._animationFrameDelay = 4;

		this._hpBarSize = 400;

		this._showHpBar = false;
		this._showHpBarTime = 0;

		this._hpBarHolder = new Sprite();
		this._hpBarHolder.anchor.set(0.5, 1);
		this._hpBarHolder.move((Graphics.width / 2) - (this._hpBarSize / 2), -30);

		function makeGradientBit(bit, offset, width, height, offsetX = 0, offsetY = 0) {
			bit.gradientFillRect(offsetX, offsetY, offset, height, "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 255)", false);
			bit.gradientFillRect(offset + offsetX, offsetY, width - (offset * 2), height, "rgba(0, 0, 0, 255)", "rgba(0, 0, 0, 255)", false);
			bit.gradientFillRect(width - offset + offsetX, offsetY, offset, height, "rgba(0, 0, 0, 255)", "rgba(0, 0, 0, 0)", false);
		};

		const bit = new Bitmap(800, 36);
		makeGradientBit(bit, 280, 700, 36, 50);
		makeGradientBit(bit, 240, 800, 2);
		makeGradientBit(bit, 160, 800, 2, 0, 34);

		this._hpBackground = new Sprite(bit);
		this._hpBackground.move((bit.width / 2) - 200, 6);
		this._hpBackground.anchor.set(0.5);
		this._hpBackground.alpha = 0.75;
		this._hpBarHolder.addChild(this._hpBackground);

		this._hpBar = new PIXI.Graphics();
		this._hpBarHolder.addChild(this._hpBar);

		this._hpText = ESP.makeText("Prevailing Guardian Slug", 20, "center");
		this._hpText.x = (this._hpBarSize / 2);
		this._hpText.y = 13;
		this._hpBarHolder.addChild(this._hpText);

		this.refreshHpBar();

		this._damageTint = 0;
		this._blockTint = 0;

		this.TextHolder = new Sprite();
		this.Text = new PIXI.Text("", {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 40,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 6,
			lineJoin: "round"
		});
		this.Text.anchor.set(0.5, 1);
		this.Text.resolution = 2;

		this.TextHolder._baseY = this.Text.height * -0.5;
		this.TextHolder.scale.set(0);
		this.TextHolder.addChild(this.Text);
	}

	onCreate() {
		if(!this._hpBarHolder.parent) {
			SceneManager._scene._spriteset._hudHolder.addChild(this._hpBarHolder);
		}
	}

	update() {
		super.update();
		if(this._defeatTimer > 0) {
			this.updateDefeat();
		} else {
			this.updateText();
			this.updateDirection();
			this.updateBlendColor();		
			this.updateSpeedVector();
		}
		this.updateSlugImage();
		this.updateHpBar();
	}

	updateText() {
		const showing = this.espObject.shouldShowText();

		if(showing) {
			if(this._time < 1) {
				this._time += 0.03;
				if(this._time >= 1) this._time = 1;
				this.updateTextHolder();
			}
		} else {
			if(this._time > 0) {
				this._time -= 0.03;
				if(this._time <= 0) this._time = 0;
				this.updateTextHolder();
			}
		}

		if(this._showingText !== showing) {
			this._showingText = showing;
			if(!this.TextHolder.parent && showing) {
				SceneManager._scene.addUiChild(this.TextHolder);
			}
			if(showing) {
				this.Text.text = this.espObject.showText();
				if(this.Text.style.fontSize < 20) {
					ESPAudio.whisper();
				} else {
					ESPAudio.talk();
				}
			}
		}
	}

	updateDirection() {
		this._slugSprite.scale.set(4 * this.espObject.direction(), 4);
	}

	updateBlendColor() {
		if(this._damageTint > 0) {
			this._damageTint--;
			const r = this._damageTint / 10;
			this._slugHolder.setBlendColor([255 * r, 0, 0, 255 * r]);
		} else if(this._blockTint > 0) {
			this._blockTint--;
			const r = this._blockTint / 10;
			this._slugHolder.setBlendColor([75 * r, 125 * r, 75 * r, 255 * r]);
		}
	}

	updateSpeedVector() {
		if(!this._speed2d) {
			this._speed2d = new Vector2(0, 0);
		}
		this._speed2d.x = this.espObject.getSpeedX();
		this._speed2d.y = this.espObject.getSpeedY();
	}

	updateSlugImage() {
		if(this.espObject.isJumping()) {
			if(this._jumpAnimationFrame < 100) {
				this._jumpAnimationFrame += 4;
				if(this._jumpAnimationFrame > 100) this._jumpAnimationFrame = 100;
				const r = Easing.easeInCubic(this._jumpAnimationFrame / 100);
				this._slugSprite.setIndex(4 + Math.round(r * 3));
			} else {
				this.espObject.performJump();
			}
		} else if(this.espObject.speed.z <= 0) {
			this._jumpAnimationFrame = 0;
			this._animationFrame++;
			if(this._animationFrame >= this._animationFrameDelay) {
				this._animationFrame = 0;
				this._animationIndex++;
				if(this._animationIndex >= 4) {
					this._animationIndex = 0;
				}
				if(this._animationIndex === 0 && this.espObject.isResting()) {
					ESPAudio.bigSnailBreathe();
				}
				this._slugSprite.setIndex((this.espObject.isResting() ? 9 : 0) + this._animationIndex);
			}
		} else if(this.espObject.speed > 0) {
			if(this._slugSprite.Index !== 8) this._slugSprite.setIndex(8);
		}

		if(this.espObject.mode() === 1) {
			this._animationFrameDelay = 4;
		} else if(this._speed2d.length() < 0.01) {
			this._animationFrameDelay = 20;
		} else {
			this._animationFrameDelay = 6;//(10 - Math.round(this._speed2d.length()).clamp(0, 10));
		}
	}

	updateHpBar() {
		if(this._showHpBar) {
			if(this._showHpBarTime < 1) {
				this._showHpBarTime += 0.005;
				if(this._showHpBarTime >= 1) this._showHpBarTime = 1;
				this._hpBarHolder.y = -30 + (50 * Easing.easeOutCubic(this._showHpBarTime));
			}
		} else {
			if(this._showHpBarTime > 0) {
				this._showHpBarTime -= 0.005;
				if(this._showHpBarTime <= 1) this._showHpBarTime = 0;
				this._hpBarHolder.y = -30 + (50 * Easing.easeOutCubic(this._showHpBarTime));
			}
		}
	}

	updateDefeat() {
		this._slugHolder.setBlendColor([255, 0, 0, 255]);
		const r = this._defeatTimer / 100;
		this.alpha = r;
		this._defeatTimer--;
		if(this._defeatTimer <= 0) {
			$gameMap.cleanUpBoss3(true);
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(6 * this.espObject.direction(), -6);
		let animationOffset = (this._animationIndex % 2 === 0 ? 0 : 1);
		if(this.espObject.isResting()) {
			animationOffset = this._animationIndex === 0 ? 0 : (this._animationIndex === 2 ? 2 : 1);
		}
		const ratio = ((400 - this.espObject.position.z) / 400) * (3.8 + (animationOffset * 0.2));
		this.ShadowSprite.scale.set(this.espObject.position.z > 400 ? 0 : ratio);
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	updateTextHolder() {
		const ratio = (this._showingText ? Easing.easeOutBack : Easing.easeOutCubic)(this._time);
		this.TextHolder.scale.set(ratio);
		this.TextHolder.x = this.x + this.ObjectHolder.x;
		this.TextHolder.y = this.y + this.ObjectHolder.y + Math.round((this.TextHolder._baseY * ratio) - (120));
	}

	damage(isInvincible) {
		if(isInvincible) {
			this._blockTint = 10;
			this._slugHolder.setBlendColor([75, 125, 75, 255]);
		} else {
			this._damageTint = 10;
			this._slugHolder.setBlendColor([255, 0, 0, 255]);
		}
	}

	refreshHpBar() {
		const width = this._hpBarSize;
		const height = 13;

		this._hpBar.clear();

		/*this._hpBar.beginFill(0x000000, 0.75);
		this._hpBar.drawRect(-6, -10, width + 16, height + 20);
		this._hpBar.endFill();*/

		this._hpBar.beginFill(0xa61f1f);
		this._hpBar.drawRect(0, 0, width * (this.espObject._hp / 1000), height);
		this._hpBar.endFill();

		const size = 2;
		this._hpBar.beginFill(0xa61f1f);
		this._hpBar.drawRect(2, 2, width, size);
		this._hpBar.drawRect(2, 4, size, 2 + height - 4);
		this._hpBar.drawRect(4, 4 + height - 2, width - 2, size);
		this._hpBar.drawRect(width + 2, 4, size, 2 + height - 4);
		this._hpBar.endFill();
	}

	onDefeat() {
		this._defeatTimer = 100;
		this._showHpBar = false;
	}

	onDefeatFinal() {
		if(this._hpBarHolder && this._hpBarHolder.parent) {
			this._hpBarHolder.parent.removeChild(this._hpBarHolder);
		}
	}

	destroy(options) {
		if(this.TextHolder.parent) this.TextHolder.parent.removeChild(this.TextHolder);
		super.destroy(options);
	}
}
