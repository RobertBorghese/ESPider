// Wall off all the haters

class ESPSpearWallSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -8;
		this.bla = 0;

		this._spears = [];
		for(let i = 0; i < object._width; i++) {
			for(let j = 0; j < 4; j++) {
				const spear = new ESPAnimatedSprite("img/other/Spear.png", 10, {
					FrameCount: 2
				});
				spear.scale.set(2, this.espObject._showAnimation ? 0 : 2);
				spear.anchor.set(0.5, 1);
				spear.x = ((TS / -2) + (TS * (j / 4)) + (i * TS)) + 4;
				spear.y = j % 2 === 0 ? 24 : 16;
				this.ObjectHolder.addChild(spear);
				this._spears.push(spear);
			}
		}
		
		this.ObjectHolder.children.sort(function(a, b) {
			if(a.y !== b.y) return a.y - b.y;
			return a.spriteId - b.spriteId;
		});

		this.ShadowSprite.visible = false;
	}

	update() {
		super.update();
		if(this._spears) {
			if(this._scaleState !== this.espObject._scaleState) {
				this._scaleState = this.espObject._scaleState;
				this._spears.forEach(s => s.scale.set(2, this._scaleState * 2));
				if(ESP.Time % 2 === 0) {
					for(let i = 0; i < this.espObject._width; i++) {
						this.bla = (++this.bla) % 5;
						this.dropGroundParticle(i, this.bla);
					}
				}
			}
		}
	}

	updateShadowSprite() {
	}

	dropGroundParticle(x, state) {
		if(!ESPGamePlayer.Particles) return;

		const p = $gameMap.addParticle(
			this.espObject.position.x + (0 + (TS * (x + (0.2 * state)))) - (TS / 2),
			this.espObject.position.y + (TS * 0.4) + (((Math.random() * 0.2) - 0.1) * TS),
			0,
			0,
			5,
			"CircleParticle",
			false
		);
		p.rotation = Math.random() * Math.PI * 2;
		p.blendMode = PIXI.BLEND_MODES.ADD;
		p.NoShadow = true;
		p.speed.z = 0.3;
		p.CanCollide = false;
		p._isParticle = true;

		p.CollisionHeight = this.espObject.CollisionHeight;
		p.position.z = this.espObject.position.z;

		p.tint = SceneManager._scene._spriteset.getFloorColor(p.position.x, p.position.y, 0x22);
	}
}