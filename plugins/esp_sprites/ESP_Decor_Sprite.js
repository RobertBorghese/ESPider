// abcdefghijklmnopqrstuvwxyz

class ESPDecorSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._image = new Sprite(ImageManager.loadBitmapFromUrl("img/other/" + this.image() + ".png"));
		this._image.scale.set(3);
		this._image.anchor.set(0.5, 1);
		this.ObjectHolder.addChild(this._image);

		//this.ShadowSprite.visible = false;
	}

	image() { return "Cake"; }

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(1.7);
		this.ShadowSprite.alpha = 0.8;//this.ShadowSprite.scale.x;
	}
}

class ESPBush1Sprite extends ESPDecorSprite {
	image() { return "Bush"; }
}

class ESPBush2Sprite extends ESPDecorSprite {
	image() { return "Bush2"; }
}

class ESPRock1Sprite extends ESPDecorSprite {
	image() { return "Rock1"; }
}

class ESPRock2Sprite extends ESPDecorSprite {
	image() { return "Rock2"; }
}

class ESPRockPileSprite extends ESPDecorSprite {
	image() { return "RockPile"; }
}

class ESPTreeSprite extends ESPDecorSprite {
	image() { return "Tree"; }
}

class ESPDeadTreeSprite extends ESPDecorSprite {
	image() { return "DeadTree"; }
}

class ESPYellowTreeSprite extends ESPDecorSprite {
	image() { return "YellowTree"; }
}

class ESPSnowTreeSprite extends ESPDecorSprite {
	image() { return "SnowTree"; }
}
