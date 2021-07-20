// And, of course, a correlating first game sprite.

class ESPFireballSprite extends ESPGameSprite {
	constructor(object, initAnimation) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = object?.getObjectHolderOffsetY?.() ?? -16;

		this._particleColors = this.getParticleColors();
		this._ballSize = this.getSize();
		this._particleSpeed = this.getParticleSpeed();
		
		this._particleHolder = new Sprite();
		this.ObjectHolder.addChild(this._particleHolder);
		this._particles = [];

		this._initAnimation = initAnimation;
		this._isInitializing = this._initAnimation;

		this._time = 0;
		this.Time = 0;

		this._mainParticle = new ESPAnimatedSprite(this.particlePath(), this.getInitAnimationDelay(), this._isInitializing);
		this._mainParticle.scale.set(2 * this._ballSize);
		this._mainParticle.anchor.set(0.5);
		this._mainParticle.tint = this.getMainParticleColor();
		this.ObjectHolder.addChild(this._mainParticle);

		if(this._isInitializing) {
			this.ShadowSprite.visible = false;
		}
	}

	particlePath() {
		return "img/particles/Particle.png";
	}

	getInitAnimationDelay() {
		return 4;
	}

	getSize() {
		return 1;
	}

	getMainParticleColor() {
		return 0xffecb3;
	}

	getParticleColors() {
		return [0xfac116, 0xfaa616, 0xfa9316, 0xfa8016, 0xfa5e16, 0xfa5e16, 0xfa2516, 0x420c08];
	}

	getParticleSpeed() {
		return 1;
	}

	makeParticle(i) {
		const particle = new ESPAnimatedSprite(this.particlePath(), 4, false, 0, i);
		particle.await();
		particle.scale.set(2 * this._ballSize);
		particle.anchor.set(0.5);
		particle.x = this.makeParticlePos();
		particle.y = this.makeParticlePos();
		this._particles.push(particle);
		this._particleHolder.addChild(particle);
	}

	makeParticlePos() {
		return (Math.random() * 10) - 5;
	}

	onInitializing() {
	}

	updateVisibility() {
		this.visible = $gameMap.inCamera(this.x - 100, this.x + 100, this.y - 100, this.y + 100);
	}

	mainParticleIndex() {
		return 1;
	}

	update() {
		super.update();

		this.updateVisibility();

		if(this._isInitializing) {
			if(this._mainParticle.isDone()) {
				this._mainParticle.Invert = false;
				this._mainParticle.FrameDelay = 0;
				this._isInitializing = false;
				this.ShadowSprite.visible = true;
				this.espObject.finishInitializing();
			} else {
				this.onInitializing();
			}
			return;
		}

		if(this._time < 20) {
			this.makeParticle(this._time);
			this._time += ESP.WS;
		}

		this._mainParticle.setIndex(this.mainParticleIndex());
		this._mainParticle.rotation += (this.espObject.speed.x === 0 ? (Math.sign(this.espObject.speed.y) * 0.1) : (0.1 * Math.sign(this.espObject.speed.x))) * ESP.WS;

		const len = this._particles.length;
		for(let i = 0; i < len; i++) {
			/*this._particleHolder.children.sort(function(a, b) {
				return b.Index - a.Index;
			});*/
			const particle = this._particles[i];
			particle.x -= (this.espObject.speed.x) * ESP.WS * this._particleSpeed;
			particle.y -= (this.espObject.speed.y - this.espObject.speed.z) * ESP.WS * this._particleSpeed;
			if(particle.isDone()) {
				if(this.espObject._isDead) {
					particle.visible = false;
				} else {
					particle.x = this._mainParticle.x + this.makeParticlePos();
					particle.y = this._mainParticle.y + this.makeParticlePos();
					particle.reset();
				}
			}
			particle.tint = this._particleColors[particle.Index];
		}

		if(this.espObject._isDead) {
			if(this._mainParticle.visible) {
				this._mainParticle.visible = false;
			}
			if(this._particles.filter(p => p.visible).length <= 0) {
				const len = this._particles.length;
				for(let i = 0; i < len; i++) {
					this._particleHolder.removeChild(this._particles[i]);
					this._particles[i].destroy();
				}
				this._particles = [];
				this.ObjectHolder.removeChild(this._particleHolder);
				this._particleHolder.destroy();
				this.espObject.kill();
			}
		} else {
			this.Time += (0.1 * ESP.WS);
			this._mainParticle.y = Math.sin(this.Time) * 3;
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(!this.espObject._isDead ? (0.6 + (((this._mainParticle.y) + 5) * 0.02)) : (this.ShadowSprite.scale.x - 0.05).clamp(0, 1));
		this.ShadowSprite.scale.set(this._ballSize * this.ShadowSprite.scale.x);
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}