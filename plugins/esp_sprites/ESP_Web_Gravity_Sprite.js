// Now times for the real shit.

class ESPWebGravitySprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -8;

		this.WebBase = new Sprite(ImageManager.loadBitmapFromUrl("img/projectiles/Web.png"));
		this.WebBase.anchor.set(0.5, 1);
		this.WebBase.scale.set(2);
		this.WebBase.z = 0;
		this.WebBase.__added = false;

		this.WebBaseString = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/projectiles/WebString_10.png"));
		this.WebBaseString.anchor.set(0.5, 1);
		this.WebBaseString.scale.set(2);
		this.ObjectHolder.addChild(this.WebBaseString);

		this.ObjectHolderOffsetY = 48;
	}

	update() {
		super.update();

		if(!this.WebBase.__added && this.parent) {
			this.parent.addChild(this.WebBase);
			this.WebBase.__added = true;
		}

		this.WebBase.x = this.x;
		this.WebBase.y = this.y + 24;
	}

	updateShadowSprite() {
		this.ShadowSprite.visible = false;
	}

	destroy() {
		if(this.WebBase.parent) {
			this.WebBase.parent.removeChild(this.WebBase);
		}
		super.destroy.apply(this, arguments);
	}
}