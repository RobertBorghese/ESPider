// Time to copy the fireball object. Thank god for object oriented programming. Inhereitence is pretty lit.

class ESPIceballObject extends ESPFireballObject {
	constructor(initAnimation, grounedStyle) {
		super(initAnimation, grounedStyle);
	}

	constructSprite() {
		return new ESPIceballSprite(this, this._initAnimation);
	}

	playShotAudio() {
		ESPAudio.iceballShot(this.getObjectVolume());
	}

	updateTeamInteractions() {
		{
			const firespitters = $gameMap.findObjectGroup("firespitter");
			if(firespitters.length > 0) {
				const len = firespitters.length;
				for(let i = 0; i < len; i++) {
					if(this.getDistance(firespitters[i]) < this._collisionSize) {
						firespitters[i].defeat();
					}
				}
			}
		}
	}
}
