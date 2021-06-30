// All right, time for the first non-player object!!

class ESPFireballObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 350, 6);
		this.speed.set(2, 0, 0);
	}

	constructSprite() {
		return new ESPFireballSprite(this);
	}

	update() {
		super.update();
		const manipulators = $gameMapTemp._gravityManipulators;
		const len = manipulators.length;
		for(let i = 0; i < len; i++) {
			const manipulator = manipulators[i];
			const distance = this.getDistance2d(manipulator);
			if(distance < 100) {
				const ratio = (distance / 100) * manipulator.gravity();

				if(this.position.x < manipulator.position.x) {
					this.speed.x += ratio;
				} else if(this.position.x > manipulator.position.x) {
					this.speed.x -= ratio;
				}

				if(this.position.y < manipulator.position.y) {
					this.speed.y += ratio;
				} else if(this.position.y > manipulator.position.y) {
					this.speed.y -= ratio;
				}
			}
		}

		const size = 20;
		if(this.getDistance($espGamePlayer) < size) {
			const spd = 60;
			const distX = Math.abs(this.position.x - $espGamePlayer.position.x) / size;
			const distY = Math.abs(this.position.y - $espGamePlayer.position.y) / size;
			$espGamePlayer.kill(spd * (this.position.x > $espGamePlayer.position.x ? -distX : distX), spd * (this.position.y > $espGamePlayer.position.y ? -distY : distY), 40);
		}
	}

	onCollided(direction) {
		if(direction === 4 || direction === 6) {
			this.speed.x *= -1;
		} else {
			this.speed.y *= -1;
		}
	}
}
