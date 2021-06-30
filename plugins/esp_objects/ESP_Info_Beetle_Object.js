// Info beetle, my boi.

class ESPInfoBeetleObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._text = data.text.join("\n");
		this._shouldShowText = false;
	}

	constructSprite() {
		return new ESPInfoBeetleSprite(this, this._text);
	}

	update() {
		super.update();
		this._shouldShowText = this.getDistance($espGamePlayer) < (this._shouldShowText ? 140 : 100);
	}

	shouldShowText() {
		return this._shouldShowText;
	}
}
