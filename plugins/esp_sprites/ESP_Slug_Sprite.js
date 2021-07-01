// And, of course, a correlating first enemy sprite. (god, im getting tired of writing these dumb comments D:)

class ESPSlugSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 20;

		this._slugSprite = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/enemies/Slug.png"), 8);
		this._slugSprite.scale.set(2);
		this._slugSprite.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._slugSprite);
	}

	update() {
		super.update();

		this._slugSprite.scale.set(2 * this.espObject.direction(), 2);

		if(!this._speed2d) {
			this._speed2d = new Vector2(0, 0);
		}
		this._speed2d.x = this.espObject.speed.x;
		this._speed2d.y = this.espObject.speed.y;

		if(this.espObject.mode() === 1) {
			this._slugSprite.FrameDelay = 4;
		} else if(this._speed2d.length() < 0.01) {
			this._slugSprite.FrameDelay = 20;
		} else {
			this._slugSprite.FrameDelay = (10 - Math.round(this._speed2d.length()).clamp(0, 10));
		}
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(1 + (((this._slugSprite.Index) + 5) * 0.01));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}