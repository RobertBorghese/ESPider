// We gonna shoot da FIRE

class ESPFirespitterSprite extends ESPGameSprite {
	constructor(object, lookLeft, dontAddSpitterSprite) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._lookLeft = lookLeft;

		this._bug = new Sprite();
		this.ObjectHolder.addChild(this._bug);

		if(!dontAddSpitterSprite) {
			let img = "img/enemies/" + ((this.espObject._shootRate > 0 && this.espObject._shootRate < 30) ? "SuperFirespitter" : "Firespitter") + ".png";
			if(this.espObject._fireballSpeed === 999) {
				img = this.setupFirespitterLeader();
			}
			this._spitterSprite = new ESPAnimatedSprite(img, 10);
			this._spitterSprite.scale.set(2 * (lookLeft ? -1 : 1), 2);
			this._spitterSprite.anchor.set(0.5, 1);
			this._bug.addChild(this._spitterSprite);
		}

		this._isDefeating = 0;
		this._defeatTime = 0;
		this._defeatingFlySpeed = 0;
	}

	update() {
		super.update();
		this.updateVisibility();
		this.updateAnimation();
		this.updateFirespitterLeader();

		if(this._isDefeating === 1) {
			this._defeatTime += 2.5;
			if(this._defeatTime > 100) this._defeatTime = 100;
			this._bug.rotation = (this._defeatTime / 100) * 7;
			const scaleRatio = (this._defeatTime < 60 ? 1 : 1 - ((this._defeatTime - 60) / 40));
			this._bug.scale.set(1 * (this._lookLeft ? -1 : 1) * scaleRatio, 1 * scaleRatio);
			this.espObject.updateConsumeAnimation(this._defeatingFlySpeed);
			this._defeatingFlySpeed -= 0.45;
			if(this._defeatTime === 100) {
				this._bug.scale.set(0);
				this.espObject.kill();
				this._isDefeating = 2;
				if(this.Text) {
					$gameVariables.setValue(91, 1);
					$gameMap.findObjectGroup("spearwall")?.forEach(s => s?.hideSpears?.());
				}
			}
		} else if(this._isBouncing) {
			if(this._isBouncing > 10) {
				const r = 1 - ((this._isBouncing - 10) / 10);
				this.espObject.position.z = 10 * Easing.easeOutCubic(r);
			} else {
				this.clearTint();
				const r = (this._isBouncing) / 10;
				this.espObject.position.z = 10 * Easing.easeOutCubic(r);
			}
			this._isBouncing--;
		} else if(this._isDefeating === 0) {
			if(this.espObject._isDefeated) {
				this._defeatingFlySpeed = 10;
				this._isDefeating = 1;
				this.onFirespitterLeaderDefeat();
			}
		}
	}

	updateAnimation() {
		this._spitterSprite.FrameDelay = this.espObject._fastAnimation ? 4 : 10;
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(this._bug.scale.x * (((500 - this.espObject.position.z).clamp(0, 500) / 500) + ((this._spitterSprite.Index === 0 ? 1 : 0) * 0.1)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	updateVisibility() {
		if(!this.espObject._isDefeated) {
			this.visible = $gameMap.inCamera(this.x - 100, this.x + 100, this.y - 100, this.y + 100);
		}
	}

	updateAlpha() {
		this.alpha = this.espObject.position.z > 300 ? 1 - ((this.espObject.position.z - 300) / 200).clamp(0, 1) : 1;
	}

	clearTint() {
		if(this._spitterSprite) this._spitterSprite.tint = 0xFFFFFF;
	}

	bounce() {
		this._isBouncing = 20;
		if(this._spitterSprite) this._spitterSprite.tint = 0x777777;
	}

	setupFirespitterLeader() {
		let img = "img/other/Firespitter.png";
		this.espObject._fireballSpeed = 0;
		this._haveDialog = true;

		const flies = $espGamePlayer.flies();
		this._textTimeMax = flies >= 18 ? 30 : 120;
		this._textTime = 120;
		this._textIndex = 0;
		const sp = flies === 0 ? 0 : (flies >= 18 ? 1 : 2);
		if(typeof $espGamePlayer.FlyData._specialFire !== "number") {
			$espGamePlayer.FlyData._specialFire = sp;
		}
		if(sp !== $espGamePlayer.FlyData._specialFire) {
			this._texts = ["..."];
		} else {
			this._texts = sp === 0 ? 
			[
				"Hey...", "Sorry about earlier.", "I misjudged you.", "Even if 99 spiders...",
				"... initiate the fight,", "the 100th one may not.", "But...",
				"For our own survival...", "... we must do what we did.",
				"Be careful.", "This is not a world...", "... where you can become too strong.",
				"Humans have assured that.", "Don't make the same mistake...", "... those earth-invaders did.",
				"But I guess you already know that.", "...", "Thank you for your forgiveness.",
				"And please...", "... whatever you do...", "Don't forget me."
			]
			:
			(sp === 1 ? 
			[
				"Please don't hurt me.", "I'm sorry.", "Please forgive me.", "I'm sorry.", "I taste terrible.",
				"I'm sorry.", "My shell is solid.", "I'm sorry.", "I understand better now.", "Won't happen again.",
				"I'm sorry."
			]
			:
			[
				"You...", "Don't bother.", "You cannot defeat me.", "You're powerless...", "... without our powers.",
				"Try redirecting...", "... with nothing to redirect.", "Touch me...", "... and you'll be defeated.",
				"How does it feel?", "As evil as you are.", "As evil as all spiders are.", "You are nothing...",
				"... but cowardly trappers.", "Go die."
			]);
		}
		

		this.Text = new PIXI.Text(this._texts[0], {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 18,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 4,
			lineJoin: "round"
		});
		this.Text.anchor.set(0.5, 1);
		this.Text.resolution = 2;
		this.Text.scale.set(0);
		this.Text.y = -42;
		this._bug.addChild(this.Text);

		return img;
	}

	updateFirespitterLeader() {
		if(this._haveDialog) {
			if(this._textTime > 0) {
				this._textTime--;
				if(this._textTime <= 0) {
					this._textTime = 0;
					if(this._textIndex < this._texts.length) {
						this.Text.text = this._texts[this._textIndex];
						this._textIndex++;
						this.Text.scale.set(0);
					}
				}
			} else if(this.Text.scale.x < 1) {
				this.Text.scale.set(this.Text.scale.x + 0.02);
				if(this.Text.scale.x > 1) {
					this.Text.scale.set(1);
					this._textTime = this._textTimeMax;
				}
			}
		}
	}

	onFirespitterLeaderDefeat() {
		if(this.Text) {
			if($espGamePlayer.flies() < 18) this.Text.text = "WHAAAAAT??";
			this.Text.scale.set(1);
		}
	}
}