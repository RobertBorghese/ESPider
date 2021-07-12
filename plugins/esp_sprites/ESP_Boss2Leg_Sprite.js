// Hnnnnn, I keep trying to complete this game but the clap of my thicc girlfriend's ass kesp distracting my brain

class ESPBoss2LegSprite extends ESPGameSprite {
	constructor(object, reveresed) {
		super();

		this.espObject = object;

		this._legBottom = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegBottom.png"));
		this._legBottom.scale.set(reveresed ? -2 : 2, 2);
		this._legBottom.anchor.set(29 / 120, 137 / 144);
		this._legBottom.y = 0;
		this.ObjectHolder.addChild(this._legBottom);

		this._legTop = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegTop.png"));
		this._legTop.anchor.set(21 / 120, 61 / 144);
		this._legTop.move(-10, -70);
		this._legTop.rotation = -0.5;
		this._legBottom.addChild(this._legTop);

		this._legBack = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegAttack1.png"));
		this._legBack.anchor.set(0.5, 1);
		this._legBack.move(50, -30);
		this._legBack.rotation = 0.5;
		this._legTop.addChild(this._legBack);

		this._reveresed = reveresed;
	}

	update() {
		super.update();

		this._legBottom.rotation = Math.sin(this.espObject._time) * 0.3 * (this._reveresed ? -1 : 1);
		this._legTop.rotation = this._legBottom.rotation * -2 * (this._reveresed ? -1 : 1);
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(((500 - this.espObject.position.z).clamp(0, 500) / 500));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}

class ESPBoss2FaceSprite extends Sprite {
	constructor() {
		super();

		this.scale.set(2);
		this.anchor.set(0.5, 1);

		this._holder = new Sprite();
		this._holder.x = (288 / -2);
		this.addChild(this._holder);

		this._faceback = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/FaceBack.png"));
		this._faceback.anchor.set(0, 1);
		this._faceback.move(58, 10);
		//this._faceback.anchor.set(0, 1);
		this._holder.addChild(this._faceback);
		
		this._left = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LeftPincer.png"));
		this._left.anchor.set(109 / 288, 78 / 216);
		this._left.move(110, 90);
		this._holder.addChild(this._left);

		this._right = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/RightPincer.png"));
		this._right.anchor.set(175 / 288, 78 / 216);
		this._right.move(180, 85);
		this._holder.addChild(this._right);

		this._facebase = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/Face.png"));
		this._holder.addChild(this._facebase);
	}

	setOpenness(value) {
		this._left.rotation = value;
		this._right.rotation = -value;
	}
}

//360, 500
