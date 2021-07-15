// i actually drew a thing. a thing a thing a ting at tah athg athgh ahtwoi ahDSOL: HDLA:Ho  HFADUOEFOJUDSfh  "FKFDJAS (#)JDFFDJS FJ{#)(FJDJSFI{H #*FHHFU*DPSHFP*#(FDNFDNFDSNFP(E*DUFDSNJk"

class ESPButtonSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 24;

		this._button = new Sprite(ImageManager.loadBitmapFromUrl("img/other/Button.png"));
		this._button.scale.set(2);
		this._button.anchor.set(0.5, 1);
		this._button.setFrame(0, 0, 24, 24);
		this.ObjectHolder.addChild(this._button);

		this._isTouching = false;
		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();

		if(this._isTouching !== this.espObject._isTouched) {
			this._isTouching = this.espObject._isTouched;
			this._button.setFrame(this._isTouching ? 24 : 0, 0, 24, 24);
		}

		if(this._touchingObject !== this.espObject._touchingObject) {
			if(this._touchingObject) {
				this._touchingObject._spr._ensureAbove = null;
			}
			this._touchingObject = this.espObject._touchingObject;
			if(this._touchingObject) {
				this._touchingObject._spr._ensureAbove = this;
			}
		}
	}

	updateShadowSprite() {
		if(this.espObject.position.z > 0) {
			this.ShadowSprite.visible = true;
			this.ShadowSprite.move(0, 8);
			this.ShadowSprite.scale.set(this.espObject.position.z <= 400 ? 1.7 * (1 - (this.espObject.position.z / 400)) : 0);
			this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
		} else {
			this.ShadowSprite.visible = false;
		}
	}
}
