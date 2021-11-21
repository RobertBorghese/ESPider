// GOD IM GETTING SLEEPY BUT IM RUNNING OUT OF TIME NO NO NO NO NO NO NO NO N ON O O NO NO NO N ON ON O NO N ONON O NO NO N O N NO N O N

class ESPWebShotSprite extends ESPGameSprite {
	constructor(object, initAnimation) {
		super();

		this.espObject = object;

		this._dashChargeString = new PIXI.Graphics();
		this.ObjectHolder.addChild(this._dashChargeString);

		const ability = $espGamePlayer.currentGrappleAbility();
		const particleUrl = ability === 3 ? "SwirlParticle" : (ability === 2 ? "TriangleParticle" : "Particle");

		this._mainParticle = new ESPAnimatedSprite("img/particles/" + particleUrl + ".png", 0);
		this._mainParticle.scale.set(2);
		this._mainParticle.anchor.set(0.5);
		this.ObjectHolder.addChild(this._mainParticle);

		if(ability === 1) {
			this._mainParticle.tint = 0xffcc88;
		} else if(ability === 2) {
			this._mainParticle.tint = 0x88ccff;
		} else if(ability === 3) {
			this._mainParticle.tint = 0x8e55a1;
		}
	}

	update() {
		super.update();
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(0.8 * ((200 - this.espObject.position.z) / 200.0).clamp(0.3, 1) +
			((((3 - this._mainParticle.Index))) * 0.1));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}