// And, of course, a correlating first game sprite.

class ESPFireballSprite extends ESPGameSprite {
	constructor(object, initAnimation) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -16;

		/*
		this.Graphics = new PIXI.Graphics();
		this.Graphics.beginFill(0xffffff);
		this.Graphics.lineStyle(0);
		this.Graphics.drawCircle(0, -10, 10);
		this.Graphics.endFill();
		this.ObjectHolder.addChild(this.Graphics);
		*/

		/*
		if(this._time < 200 && this._time % 10 === 0) {
			const particle = new ESPParticleObject(this.speed.x / -2, this.speed.y / -2, 4, false);
			$gameMap.addGameObject(particle, this.position.x + (Math.random() * 10) - 5, this.position.y + (Math.random() * 10) - 5);
			this._particles.push(particle);
		}
		this._time++;

		for(let i = 0; i < this._particles.length; i++) {
			if(this._particles[i].isComplete()) {
				this._particles[i].position.x = this.position.x + (Math.random() * 10) - 5;
				this._particles[i].position.y = this.position.y + (Math.random() * 10) - 5;
				this._particles[i].position.z = 0;
				this._particles[i]._spr.Animation.reset();
			}
		}*/

		this._particleHolder = new Sprite();
		this.ObjectHolder.addChild(this._particleHolder);
		this._particles = [];
/*
		this.Animation = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/particles/Particle.png"), spd);
		this.Animation.await();
		this.Animation.scale.set(2);
		this.Animation.anchor.set(0.5);
		this.ObjectHolder.addChild(this.Animation);*/

		//this.ShadowSprite.visible = false;

		this._initAnimation = initAnimation;
		this._isInitializing = this._initAnimation;

		this._time = 0;
		this.Time = 0;

		/*for(let i = 0; i < 20; i++) {
			this.makeParticle(i);
		}*/

		this._mainParticle = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/particles/Particle.png"), 4, this._isInitializing);
		this._mainParticle.scale.set(2);
		this._mainParticle.anchor.set(0.5);
		this._mainParticle.tint = 0xffecb3;
		this.ObjectHolder.addChild(this._mainParticle);

		if(this._isInitializing) {
			this.ShadowSprite.visible = false;
		}
	}

	makeParticle(i) {
		const particle = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/particles/Particle.png"), 4, false, 0, i);
		particle.await();
		particle.scale.set(2);
		particle.anchor.set(0.5);
		particle.x = this.makeParticlePos();
		particle.y = this.makeParticlePos();
		this._particles.push(particle);
		this._particleHolder.addChild(particle);
	}

	makeParticlePos() {
		return (Math.random() * 10) - 5;
	}

	update() {
		super.update();

		this.visible = $gameMap.inCamera(this.x - 100, this.x + 100, this.y - 100, this.y + 100);

		if(this._isInitializing) {
			if(this._mainParticle.isDone()) {
				this._mainParticle.Invert = false;
				this._isInitializing = false;
				this.ShadowSprite.visible = true;
				this.espObject.finishInitializing();
			} else {
			}
			return;
		}

		if(this._time < 20) {
			this.makeParticle(this._time);
			this._time++;
		}

		this._mainParticle.Index = 0;
		this._mainParticle.rotation += 0.1 * Math.sign(this.espObject.speed.x);

		const len = this._particles.length;
		for(let i = 0; i < len; i++) {
			this._particleHolder.children.sort(function(a, b) {
				/*if(a.y !== b.y) {
					return a.y - b.y;
				}*/
				return b.Index - a.Index;
			});
			const particle = this._particles[i];
			particle.x -= (this.espObject.speed.x);
			particle.y -= (this.espObject.speed.y - this.espObject.speed.z);
			if(particle.isDone()) {
				if(this.espObject._isDead) {
					particle.visible = false;
				} else {
					particle.x = this._mainParticle.x + this.makeParticlePos();
					particle.y = this._mainParticle.y + this.makeParticlePos();
					particle.reset();
				}
			}
			switch(particle.Index) {
				case 0: { particle.tint = 0xfac116; break; }
				case 1: { particle.tint = 0xfaa616; break; }
				case 2: { particle.tint = 0xfa9316; break; }
				case 3: { particle.tint = 0xfa8016; break; }
				case 4: { particle.tint = 0xfa5e16; break; }
				case 5: { particle.tint = 0xfa5e16; break; }
				case 6: { particle.tint = 0xfa2516; break; }
				case 7: { particle.tint = 0x420c08; break; }
			}
		}

		if(this.espObject._isDead) {
			if(this._mainParticle.visible) {
				this._mainParticle.visible = false;
			}
			if(this._particles.filter(p => p.visible).length <= 0) {
				this.espObject.kill();
			}
		} else {
			this.Time += 0.1;
			this._mainParticle.y = Math.sin(this.Time) * 3;
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(!this.espObject._isDead ? (0.6 + (((this._mainParticle.y) + 5) * 0.02)) : (this.ShadowSprite.scale.x - 0.05).clamp(0, 1));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}