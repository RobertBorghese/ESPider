// Check this out *flashes whoever is reading this* :3

class ESPCheckpointSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 0;

		this._rate = 0;

		this._flagHolder = new Sprite();
		this.ObjectHolder.addChild(this._flagHolder);

		this._flag = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/other/CheckpointFlag.png"), 6, {
			FrameCount: 6
		});
		this._flag.anchor.set(0.5, 1);
		this._flag.scale.set(2);
		this._flagHolder.addChild(this._flag);

		this._pole = new Sprite(ImageManager.loadBitmapFromUrl("img/other/CheckpointPole.png"));
		this._pole.anchor.set(0.5, 1);
		this._pole.scale.set(2);
		this._flagHolder.addChild(this._pole);

		this.updateRate();

		this._mode = 0;
	}

	open() {
		this._mode = 1;
		this._rate = 0;
	}

	close() {
		this._mode = 2;
		this._rate = 1;
	}

	update() {
		super.update();

		this.updateObjectState();
		this.updateAnimation();
		this.updateRate();
	}

	updateObjectState() {
		if(this.espObject._shouldOpen === 1) {
			this.espObject._shouldOpen = 0;
			this.open();
		} else if(this.espObject._shouldOpen === 2) {
			this.espObject._shouldOpen = 0;
			this.close();
		}
	}

	updateAnimation() {
		const spd = 0.035;
		if(this._mode === 1) {
			this._rate += spd;
			if(this._rate >= 1) {
				this._rate = 1;
				this._mode = 0;
			}
		} else if(this._mode === 2) {
			this._rate -= spd;
			if(this._rate <= 0) {
				this._rate = 0;
				this._mode = 0;
			}
		}
	}

	updateRate() {
		const r = (this._mode === 2 ? Easing.easeInCubic : Easing.easeOutBack)(this._rate);
		if(r > 1.0) {
			this._flagHolder.y = -50 * (r - 1);
			this._flagHolder.rotation = -1 * (r - 1);
		}
		const r2 = r.clamp(0, 1);
		this._flag.y = 44 * (1 - r2);
		this._pole.scale.set(2, 0.5 + (1.5 * r2));
		this._flag.tint = 0x999999 + (0xffffff - 0x999999) * r2;
		if(this._rate < 1) {
			this._flag.Index = 0;
		}
		const r3 = this._rate >= 1 ? 0 : (r > 0.5 ? (1 - r) * 255 : 0);
		if(this._flag._blendColor[0] !== r3) {
			this._flag.setBlendColor([r3, r3, r3, r3]);
		}
		//this._flag.setHue((1 - r2) * 240);
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		const r = (this._mode === 2 ? Easing.easeInCubic : Easing.easeOutBack)(this._rate);
		this.ShadowSprite.scale.set(0.8 + (0.6 * (1 - r)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}