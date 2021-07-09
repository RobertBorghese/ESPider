// oh god, how am i gonna do this in one day????? oh god here we goooooo

class ESPMovingPlatformSprite extends ESPGameSprite {
	constructor(object, imageType, shadowWidth, shadowHeight, isChild) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 24;

		this._isChild = isChild;
		this._shadowWidth = shadowWidth;
		this._shadowHeight = shadowHeight;
		this._hasShadow = !this._isChild;
		this.setupShadowMovingPlatform();
		this.ShadowSprite.visible = this._hasShadow;
		
		let url = "Basic";
		switch(imageType) {
			case 0: { url = "PlatTL"; break; }
			case 1: { url = "PlatMT"; break; }
			case 2: { url = "PlatBT"; break; }

			case 3: { url = "PlatTM"; break; }
			case 4: { url = "PlatMM"; break; }
			case 5: { url = "PlatBM"; break; }

			case 6: { url = "PlatTB"; break; }
			case 7: { url = "PlatMB"; break; }
			case 8: { url = "PlatBB"; break; }
		}

		this._platform = new Sprite(ImageManager.loadBitmapFromUrl("img/other/MovingPlatforms/" + url + ".png"));
		this._platform.scale.set(2);
		this._platform.anchor.set(0.5);
		this.ObjectHolder.addChild(this._platform);

		this._espMovingPlatform = true;
		this._espWorldObject = true;

		this.Time = 0;
	}

	update() {
		super.update();

		this._colY -= 24;

		this.Time += 0.1;
		this._platform.y = Math.sin(this.Time) * 1;
	}

	setupShadow() {
	}

	setupShadowMovingPlatform() {
		this.ShadowSprite = new Sprite();
		if(this._hasShadow) {
			this.ShadowSprite.bitmap = ImageManager.loadSystem("PlatShadow1");
			this.ShadowSprite.anchor.set(0.5);
			this.ShadowSprite.scale.set(2 * (this._shadowWidth), 2 * (this._shadowHeight));
			this.ShadowSprite.z = 3;
			this.addChildAt(this.ShadowSprite, 0);
		}
	}

	updateShadowSprite() {
		if(this._hasShadow) {
			this.ShadowSprite.move((this._shadowWidth - 1) * (TS / 2), (this._shadowHeight - 1) * (TS / 2));
			const offset = ((this.espObject.position.z / TS) * 0.1) + (this._platform.y * 0.04);
			this.ShadowSprite.scale.set(2 * (this._shadowWidth) - offset, 2 * (this._shadowHeight) - offset);
			this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
		}
	}
}