// Ugh, how am I even gonna do thisssss.

class ESPWebGravityObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 300, 20);
	}

	constructSprite() {
		return new ESPWebGravitySprite(this);
	}

	isGravityManipulator() {
		return true;
	}

	gravity() {
		return 0.1;
	}
}
