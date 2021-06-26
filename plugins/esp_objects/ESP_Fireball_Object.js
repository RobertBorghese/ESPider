// All right, time for the first non-player object!!

class ESPFireballObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 350, 50);
		this.speed.set(2, 0, 0);
	}

	constructSprite() {
		return new ESPFireballSprite(this);
	}

	onCollided(direction) {
		if(direction === 4) {
			this.speed.x = 2;
		} else if(direction === 6) {
			this.speed.x = -2;
		}
	}
}
