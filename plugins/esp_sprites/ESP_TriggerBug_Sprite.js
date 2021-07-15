// ESPTriggerBugSprite
//ESPTriggerBugSprite
//SPTriggerBugSprite

class ESPTriggerBugSprite extends ESPGameSprite {
	constructor(object, customImage, customRate, customOffsetY) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = customOffsetY ?? -16;//-18//-16;

		customImage = customImage ?? "TriggerBug";

		this._bug = new ESPAnimatedSprite("img/other/" + customImage + ".png", customRate === -1 ? 5 : customRate);
		this._bug.scale.set(2);
		this._bug.anchor.set(0.5);
		this.ObjectHolder.addChild(this._bug);

		this._isTouching = 0;
		this._touchTime = 0;
		this._touchFlySpeed = 0;

		if(object._displayText) {
			this.TextHolder = new Sprite();
			this.Text = new PIXI.Text(object._displayText, {
				fontFamily: $gameSystem.mainFontFace(),
				fontSize: 20,
				fill: 0xffffff,
				align: "center",
				stroke: "rgba(0, 0, 0, 0.75)",
				strokeThickness: 4,
				lineJoin: "round"
			});
			this.Text.anchor.set(0.5, 1);
			this.Text.resolution = 2;

			this.TextHolder._baseY = this.Text.height * -0.5;
			this.TextHolder.scale.set(0);
			this.TextHolder.addChild(this.Text);

			this._textWait = 20;
		}

		this._shouldShowText = false;
		this._showTextTime = 0;
	}

	update() {
		super.update();

		this.updateText();

		if(this._isTouching === 0) {
			if(this.espObject._isTouched) {
				this._touchFlySpeed = 10;
				this._isTouching = 1;
				this._shouldShowText = false;
			}
		} else if(this._isTouching === 1) {
			this._bug.y = 0;
			this._touchTime += 2;
			this._bug.rotation = (this._touchTime / 100) * 4;
			this._bug.scale.set(2 * (this._touchTime < 80 ? 1 : 1 - ((this._touchTime - 80) / 20)));
			this.espObject.updateConsumeAnimation(this._touchFlySpeed);
			this._touchFlySpeed -= 0.45;
			if(this._touchTime === 100) {
				this.espObject.execute();
				this.espObject.delete();
				this._isTouching = 2;
			}
		}
	}

	updateText() {
		if(this.TextHolder && (this._isTouching !== 0 || this.espObject.position.z <= 0)) {
			if(this._textWait > 0 && this._isTouching === 0) {
				this._textWait--;
				if(this._textWait === 0) {
					if(!this.TextHolder.parent) {
						SceneManager._scene.addUiChild(this.TextHolder);
					}
					this._shouldShowText = true;
					ESPAudio.talk();
				}
			}

			if(this._shouldShowText) {
				if(this._showTextTime < 1) {
					this._showTextTime += 0.03;
					if(this._showTextTime >= 1) this._showTextTime = 1;
					this.updateTextHolder();
				}
			} else {
				if(this._showTextTime > 0) {
					this._showTextTime -= 0.03;
					if(this._showTextTime <= 0) this._showTextTime = 0;
					this.updateTextHolder();
				}
			}
		}
	}

	updateTextHolder() {
		const ratio = (this._shouldShowText ? Easing.easeOutBack : Easing.easeOutCubic)(this._showTextTime);
		this.TextHolder.scale.set(ratio);
		this.TextHolder.x = this.x + this.ObjectHolder.x;
		this.TextHolder.y = this.y + this.ObjectHolder.y + Math.round((this.TextHolder._baseY * ratio) - (this.Text.height) + 20);
	}

	updateShadowSprite() {
		this.ShadowSprite.move(this._bug.Index >= 4 && this._bug.Index <= 7 ? 2 : (this._bug.Index >= 12 && this._bug.Index <= 15 ? -2 : 0), 0);
		this.ShadowSprite.scale.set((this._bug.scale.x / 2) * ((400 - this.espObject.position.z) / 400.0).clamp(0.3, 1));// + (((this._bug.y) + 3) * 0.02));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	removeText() {
		this._shouldShowText = false;
	}

	destroy(options) {
		if(this.TextHolder && this.TextHolder.parent) this.TextHolder.parent.removeChild(this.TextHolder);
		super.destroy(options);
	}
}
