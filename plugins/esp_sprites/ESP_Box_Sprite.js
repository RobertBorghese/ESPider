// ok, this is where the fun begins (havent i already used this as a header comment already??)

class ESPBoxSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 12;

		this._box = new Sprite(ImageManager.loadBitmapFromUrl("img/other/Box4.png"));
		this._box.x = -3;
		this._box.anchor.set(0.5, 1);
		this._box.scale.set(2);
		this.ObjectHolder.addChild(this._box);

		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();

		if($espGamePlayer.realZ() > this.espObject.realZ()) {
			this._colY -= 16;
		} else {
			this._colY += 8;
		}
	}
}
