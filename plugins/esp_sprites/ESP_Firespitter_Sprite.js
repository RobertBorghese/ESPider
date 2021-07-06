// We gonna shoot da FIRE

class ESPFirespitterSprite extends ESPGameSprite {
	constructor(object, lookLeft) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._spitterSprite = new ESPAnimatedSprite("img/enemies/Firespitter.png", 10);
		this._spitterSprite.scale.set(2 * (lookLeft ? -1 : 1), 2);
		this._spitterSprite.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._spitterSprite);
	}

	update() {
		super.update();
		this._spitterSprite.FrameDelay = this.espObject._fastAnimation ? 4 : 10;
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(((500 - this.espObject.position.z).clamp(0, 500) / 500) + ((this._spitterSprite.Index === 0 ? 1 : 0) * 0.1));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}