// the object version of this file doesnt have a header comment. get jebatied :3

class ESPBoxStaticSprite extends ESPBoxSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 12;

		this._box = new Sprite(ImageManager.loadBitmapFromUrl("img/other/MetalBox.png"));
		this._box.x = -3;
		this._box.anchor.set(0.5, 1);
		this._box.scale.set(2);
		this.ObjectHolder.addChild(this._box);

		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();

		if(this.espObject._currentMovingPlatform) {
			this._box.y = this.espObject._currentMovingPlatform._spr._platform.y;
		}

		if($espGamePlayer.realZ() > this.espObject.realZ()) {
			this._colY -= 16;
		} else {
			this._colY += 8;
		}
	}
}
