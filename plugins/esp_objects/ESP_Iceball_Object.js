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
					if(!firespitters[i]._isDefeated && this.getDistance(firespitters[i]) < this._collisionSize) {
						firespitters[i].defeat();
					}
				}
			}

			if(this.canConnect()) {
				const icemakers = $gameMap.findObjectGroup("icemaker");
				if(icemakers.length > 0) {
					const len = icemakers.length;
					for(let i = 0; i < len; i++) {
						if(this._owner !== icemakers[i] && icemakers[i].canBounce() && this.getDistance(icemakers[i]) < this._collisionSize) {
							icemakers[i].bounce();
						}
					}
				}
			}
		}
	}
}
