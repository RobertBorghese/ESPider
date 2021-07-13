// Slurp slurp, dat game jam money is miiiiine.... i hope.... 

class ESPPoisonballSprite extends ESPFireballSprite {
	constructor(object, initAnimation) {
		super(object, initAnimation);
	}

	getSize() {
		return this.espObject._isBig ? 4 : 2;
	}

	getInitAnimationDelay() {
		return 24;
	}

	getMainParticleColor() {
		return 0xc6abeb;
	}

	getParticleColors() {
		return [0xd016fa, 0xb216fa, 0x9716fa, 0x720dbf, 0x52068c, 0x3c0466, 0x1d0230, 0x11011c];
	}

	getParticleSpeed() {
		return 0.5;
	}

	makeParticlePos() {
		return (Math.random() * 30) - 15;
	}

	onInitializing() {
		this._mainParticle.rotation += 0.1;
	}

	updateVisibility() {
		this.visible = $gameMap.inCamera(this.x - 300, this.x + 300, this.y - 300, this.y + 300);
	}
}