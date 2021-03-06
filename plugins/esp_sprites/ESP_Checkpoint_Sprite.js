// Check this out *flashes whoever is reading this* :3

class ESPCheckpointSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 0;

		this._rate = 0;

		this._flagHolder = new Sprite();
		this.ObjectHolder.addChild(this._flagHolder);

		this._flag = new ESPAnimatedSprite("img/other/CheckpointFlag.png", 6, {
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
			this.dropAllGroundParticles();
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
		this._flag.tint = 0x999999 + (this._mode === 2 ? 0 : (0xffffff - 0x999999) * r2);
		if(this._rate < 1) {
			this._flag.Index = 0;
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		const r = (this._mode === 2 ? Easing.easeInCubic : Easing.easeOutBack)(this._rate);
		this.ShadowSprite.scale.set(0.8 + (0.6 * (1 - r)));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	dropAllGroundParticles(x, state) {
		if(!ESPGamePlayer.Particles) return;

		const count = 8;
		for(let i = 0; i < count; i++) {
			const p = $gameMap.addParticle(
				this.espObject.position.x,
				this.espObject.position.y,
				Math.cos(i * (Math.PI * 2 / count)) * 2,
				Math.sin(i * (Math.PI * 2 / count)) * 2 * 0.5,
				7,
				"CircleParticle",
				false
			);
			p.rotation = Math.random() * Math.PI * 2;
			//p.blendMode = PIXI.BLEND_MODES.ADD;
			//p.NoShadow = true;
			p.speed.z = 0.5;
			p.CanCollide = false;
			p._isParticle = true;

			p.CollisionHeight = this.espObject.CollisionHeight;
			p.position.z = this.espObject.position.z;

			//p.tint = SceneManager._scene._spriteset.getFloorColor(p.position.x, p.position.y, 0x22);
		}
	}
}