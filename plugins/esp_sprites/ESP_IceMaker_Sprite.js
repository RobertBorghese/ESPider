// We gonna shoot da ICE
// damn thought, firespitter's sprite was simple af, now i gota fuck it all up making ice maker look nice

class ESPIcemakerSprite extends ESPFirespitterSprite {
	constructor(object, lookLeft, animationOffset) {
		super(object, lookLeft, true);

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._bodies = [];

		this._head = new Sprite();
		this._head._baseY = 0;

		{
			const ShadowSprite = new Sprite(ImageManager.loadSystem("Shadow4"));
			ShadowSprite.anchor.set(0.5);
			ShadowSprite.z = 3;
			ShadowSprite.scale.set(0.5);
			ShadowSprite.move(0, -8);
			this._head.addChild(ShadowSprite);

			this._headSpr = new ESPAnimatedSprite("img/enemies/Icemaker_Head.png", 10);
			this._headSpr.scale.set(this._lookLeft ? -2 : 2, 2);
			this._headSpr.anchor.set(0.5, 1);
			this._head.addChild(this._headSpr);
		}

		this._bug.addChild(this._head);
		this._bodies.push(this._head);

		for(let i = 0; i < 3; i++) {
			const spr = new Sprite();
			spr._baseY = -4;

			const ShadowSprite = new Sprite(ImageManager.loadSystem("Shadow4"));
			ShadowSprite.anchor.set(0.5);
			ShadowSprite.z = 3;
			ShadowSprite.scale.set(0.5);
			ShadowSprite.move(0, -4);
			spr.addChild(ShadowSprite);

			const body = new ESPAnimatedSprite("img/enemies/Icemaker_Body.png", 10);
			body.scale.set(2);
			body.anchor.set(0.5, 1);
			spr.addChild(body);

			this._bug.addChild(spr);
			this._bodies.push(spr);
		}

		this._time = animationOffset;
		this._timeInc = 0.2;

		this._animationTime = 1;

		this.ShadowSprite.visible = false;
	}

	setAnimationSpeed(r) {
		this._timeInc = 0.2 + (0.4 * (1 - r));
		const len = this._bodies.length;
		for(let i = 0; i < len; i++) {
			this._bodies[i].FrameDelay = 4 + Math.round(6 * r);
		}
	}

	update() {
		super.update();

		this._bug.children.sort(function(a, b) {
			if(a._desiredY !== b._desiredY) {
				return a._desiredY - b._desiredY;
			}
			return a.spriteId - b.spriteId;
		});

		if(this.espObject._fastAnimation && this._animationTime > 0) {
			this._animationTime -= 0.3;
			if(this._animationTime < 0) this._animationTime = 0;
		} else if(!this.espObject._fastAnimation && this._animationTime < 1) {
			this._animationTime += 0.04;
			if(this._animationTime > 1) this._animationTime = 1;
		}
		this.setAnimationSpeed(this._animationTime);
	}

	updateAnimation() {
		this._time += this._timeInc;

		const durr = 6;
		const len = this._bodies.length;
		for(let i = 0; i < len; i++) {
			const spr = this._bodies[i];
			spr.x = Math.cos((this._time + ((i * -0.3) * durr * 2)) / durr) * 16 * (this._lookLeft ? -1 : 1);
			spr._desiredY = (Math.sin((this._time + ((i * -0.3) * durr * 2)) / durr) * 6);
			spr.y = spr._desiredY + spr._baseY;
		}

		this._headSpr.scale.x = (this._head.x < 0 ? -2 : 2) * (this._lookLeft ? -1 : 1);
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(((500 - this.espObject.position.z).clamp(0, 500) / 500) + ((this._head.Index === 0 ? 1 : 0) * 0.1));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}