// I'm actually pretty excited to see how the "triangle" balls turn out

class ESPIceballSprite extends ESPFireballSprite {
	constructor(object, initAnimation) {
		super(object, initAnimation);
	}

	particlePath() {
		return "img/particles/TriangleParticle.png";
	}

	getMainParticleColor() {
		return 0xffffff;
	}

	getParticleColors() {
		return [0x059999, 0x18b8b8, 0x31d6d6, 0x5bf0f0, 0x90f5f5, 0xadf0f0, 0xd3eded, 0xffffff];
	}

	mainParticleIndex() {
		return 0;
	}
}