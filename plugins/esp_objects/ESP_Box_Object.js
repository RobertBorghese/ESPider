// ive literally run out of fucking quotes to write. which is pretty ironic considering this file is alphabetically higher, thus more likely for someone to encounter first despire it being one of the last ones im making in this project

/*:
 * @command InfoBeetle
 * @text Options for info beetle.
 * @desc
 *
 * @arg Image
 * @desc 
 * @type string
 * @default
 */

class ESPBoxObject extends ESPGameObject {
	constructor(data) {
		super();

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._friction = 1;

		this.thresholdX = 20;
		this.thresholdY = 10;

		this.deltaX = 0;
		this.deltaY = 0;

		this._shouldSoundTrigger = true;

		this._image = data?.Image ?? null;
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPBoxSprite(this);
		}
		return this._spr;
	}

	saveIndividual() {
		return true;
	}

	saveGroup() {
		return "box";
	}

	isSelfMoved() {
		return false;
	}

	canPlayerMove() {
		return true;
	}

	attachOffsetY() {
		return 0;
	}

	isMovingPlatform() {
		return true;
	}

	canTouch() {
		return true;
	}

	standCollisionHeight() {
		return this.CollisionHeight + 0.5;
	}

	topCollisionZ() {
		return this.standCollisionHeight() * TS;
	}

	collideBottom() {
		return true;
	}

	onPlayerStepOn() {
	}

	willEncounterMovingPlatform() {
		return this.movingPlatformsExist();
	}

	isPulling(player) {
		const dist = this.getDistance2d($espGamePlayer);
		return (dist > this._initialDistance) && (this.speed.x !== 0 || this.speed.y !== 0);
	}

	update() {
		this.OldX = this.position.x;
		this.OldY = this.position.y;
		super.update();

		this.deltaX = this.position.x - this.OldX;
		this.deltaY = this.position.y - this.OldY;

		if(this.canPlayerMove() && $espGamePlayer.IsGrappling) {
			if(!$espGamePlayer.isConnectedTo(this)) {
				const dist = this.getDistance2d($espGamePlayer);
				if(dist <= 100) {
					$espGamePlayer.connect(this);
					this._initialDistance = dist;
				}
			}
			if($espGamePlayer.isConnectedTo(this)) {
				const dist = this.getDistance2d($espGamePlayer);
				if(dist > this._initialDistance) {
					const radians = Math.atan2(this.position.y - $espGamePlayer.position.y, this.position.x - $espGamePlayer.position.x);
					this.speed.x += (-Math.cos(radians) * ((dist - this._initialDistance) / 50));
					this.speed.y += (-Math.sin(radians) * ((dist - this._initialDistance) / 50));

					if(this._image === "Cake" && !this._stealinTheCake) {
						this._stealinTheCake = 1;
						const c = $gameMap.findObject("CakeGuy");
						if(c) {
							c._triggerDist = 600;
							c._untriggerDist = 700;
							c._spr.Text.text = "Please don't steal my cake!";
							c._spr._showingText = false;
							c._spr._time = 0;
						}
					}
				}
			}
		} else if(this._stealinTheCake === 1) {
			this._stealinTheCake = 2;
			const c = $gameMap.findObject("CakeGuy");
			if(c) {
				c._triggerDist = 100;
				c._untriggerDist = 140;
			}
		}

		if(this.speed.x !== 0 || this.speed.y !== 0) {
			const radians = Math.atan2(this.speed.y, this.speed.x);
			let totalSpeed = Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
			if(this._shouldSoundTrigger && totalSpeed > 3.0) {
				ESPAudio.boxDrag(this.getObjectVolume());
				this._shouldSoundTrigger = false;
			} else if(!this._shouldSoundTrigger && totalSpeed < 2) {
				this._shouldSoundTrigger = true;
			}
			totalSpeed -= this._friction;
			if(totalSpeed < 0) totalSpeed = 0;
			this.speed.x = Math.cos(radians) * totalSpeed;
			this.speed.y = Math.sin(radians) * totalSpeed;
		}
	}

	onCollided(direction) {
		if(direction === 4 || direction === 6) {
			this.speed.x = 0;
		} else if(direction === 8 || direction === 2) {
			this.speed.y = 0;
		}
	}

	setOwner() {}
}

Game_Map.presetObjects[14] = ESPBoxObject;
