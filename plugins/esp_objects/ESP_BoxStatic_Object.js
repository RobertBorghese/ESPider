class ESPBoxStaticObject extends ESPBoxObject {
	constructor() {
		super();

		console.log("jfdkls");
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPBoxStaticSprite(this);
		}
		return this._spr;
	}

	canPlayerMove() {
		return false;
	}
}

Game_Map.presetObjects[17] = ESPBoxStaticObject;
