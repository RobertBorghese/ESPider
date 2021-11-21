// abcdefghijklmnopqrstuvwxyz

class ESPDecorSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 8;

		this._image = new Sprite(ImageManager.loadBitmapFromUrl("img/other/" + this.image() + ".png"));
		const scale = this.getScale();
		if(typeof scale === "number") {
			this._image.scale.set(scale);
		} else if(typeof scale === "object") {
			this._image.scale.set(scale.x ?? 3, scale.y ?? 3);
		}
		this._image.anchor.set(0.5, 1);
		const tint = this.getTint();
		if(tint !== null) {
			this._image.tint = tint;
		}
		this.ObjectHolder.addChild(this._image);

		//this.ShadowSprite.visible = false;
	}

	image() { return "Cake"; }

	getScale() { return 3; }

	getTint() { return null; }

	shadowY() { return 0; }

	shadowScale() { return 1.7; }

	updateShadowSprite() {
		this.ShadowSprite.move(0, this.shadowY());
		this.ShadowSprite.scale.set(this.shadowScale());
		this.ShadowSprite.alpha = 0.8;//this.ShadowSprite.scale.x;
	}

	rand() {
		return ESPDecorSprite.getPseudoRandom($gameMap.mapId(), this.espObject.position.x, this.espObject.position.y);
	}

	// "pseudo-random" so elements remain consistent whenever re-created
	static getPseudoRandom(mapId, x, y) {
		if(this.__lastMapId !== mapId || !this._state) {
			this.__lastMapId = mapId;
			this._state = (mapId * (x + 1) * (y + 1));
		}
		this._state = (this._state * 1763654 + 1018456223);
		return ((this._state) % 1000) / 1000;
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
	getScale() {
		const v = (2 + (this.rand() * 1));
		return { x: v * (this.rand() < 0.5 ? -1 : 1), y : v };
	}
	shadowScale() { return 1.3 + (0.4 * ((1 - (3 - Math.abs(this._image.scale.x))) / 1)); }
	getTint() {
		const v = 150 + (105 * this.rand());
		return (v << 16) | (v << 8) | v;
	}
}

class ESPRock2Sprite extends ESPRock1Sprite {
	image() { return "Rock2"; }
	shadowY() { return 6; }
	shadowScale() { return super.shadowScale() * 0.7; }
}

class ESPRockPileSprite extends ESPRock1Sprite {
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
