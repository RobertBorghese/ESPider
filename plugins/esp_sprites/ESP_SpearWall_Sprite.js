// Wall off all the haters

class ESPSpearWallSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		//this.ObjectHolderOffsetY = 123;

		this._spear = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/other/Spear.png"), 10, {
			FrameCount: 2
		});
		this._spear.scale.set(2);
		this._spear.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._spear);

		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();
	}

	updateShadowSprite() {
	}
}