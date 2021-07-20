// I actually got some extra time, time to make this game look a little preetier

class ESPDecorObject extends ESPGameObject {
	constructor(data) {
		super(data);
	}

	constructSprite() {
		return new ESPDecorSprite(this);
	}
}

// ---

class ESPBush1Object extends ESPDecorObject {
	constructSprite() {
		return new ESPBush1Sprite(this);
	}
}

Game_Map.presetObjects[18] = ESPBush1Object;

// ---

class ESPBush2Object extends ESPDecorObject {
	constructSprite() {
		return new ESPBush2Sprite(this);
	}
}

Game_Map.presetObjects[19] = ESPBush2Object;

// ---

class ESPRock1Object extends ESPDecorObject {
	constructSprite() {
		return new ESPRock1Sprite(this);
	}
}

Game_Map.presetObjects[20] = ESPRock1Object;

// ---

class ESPRock2Object extends ESPDecorObject {
	constructSprite() {
		return new ESPRock2Sprite(this);
	}
}

Game_Map.presetObjects[21] = ESPRock2Object;

// ---

class ESPRockPileObject extends ESPDecorObject {
	constructSprite() {
		return new ESPRockPileSprite(this);
	}
}

Game_Map.presetObjects[22] = ESPRockPileObject;

// ---

class ESPTreeObject extends ESPDecorObject {
	constructSprite() {
		return new ESPTreeSprite(this);
	}
}

Game_Map.presetObjects[23] = ESPTreeObject;

// ---

class ESPDeadTreeObject extends ESPDecorObject {
	constructSprite() {
		return new ESPDeadTreeSprite(this);
	}
}

Game_Map.presetObjects[24] = ESPDeadTreeObject;

// ---

class ESPYellowTreeObject extends ESPDecorObject {
	constructSprite() {
		return new ESPYellowTreeSprite(this);
	}
}

Game_Map.presetObjects[25] = ESPYellowTreeObject;

// ---

class ESPSnowTreeObject extends ESPDecorObject {
	constructSprite() {
		return new ESPSnowTreeSprite(this);
	}
}

Game_Map.presetObjects[26] = ESPSnowTreeObject;
