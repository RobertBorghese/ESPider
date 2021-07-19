// the third and possibly final boss(?)

class ESPBigBoiObject extends ESPGameObject {
	constructor() {
		super();

		this.position.set(300, 350, 0);
		this.speed.set(2, 0, 0);

		this._mode = 0;
		this._frameDelay = 6;
		this._actionTime = 0;
		this._lastIdleAction = 0;

		this._movementCooldown = 0;
		this._attackCooldown = 300;
		this._attackFrequency = 0;

		this._metaMode = 0;

		this._hp = 1000;

		this._currentAttack = 0;

		this._graphicsLineOpacity = 0.2;

		this._resetTimer = 0;

		this._showText = "";
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPBigBoiSprite(this);
		}
		return this._spr;
	}

	startBoss() {
		this._metaMode = 1;
		this._spr._showHpBar = true;
		AudioManager.playBgm({ name: "PrepareToFight", volume: 100, pitch: 100, pan: 0 });
	}

	setText(text) {
		if(text) {
			this._spr._showingText = false;
			this._showText = text;
			this._spr._time = 0;
		} else {
			this._showText = "";
		}
	}

	showText() {
		return this._showText;
	}

	shouldShowText() {
		return this._showText.length > 0;
	}

	onCreate() {
		this._spr.onCreate();
	}

	saveIndividual() {
		return true;
	}

	checkFireball(fireball) {
		if(!fireball._isDead && this.checkIfColliding(fireball)) {
			this.damage();
			fireball.onCollided();
		}
	}

	newFormHPThreshold() {
		return 250;
	}

	damageValue() {
		return 80;
	}

	damage() {
		const isInvincible = this.isInvincible();
		if(!isInvincible) {
			const before = this._hp < this.newFormHPThreshold();

			this._hp -= this.damageValue();

			if(!before && this._hp < this.newFormHPThreshold()) {
				const filter = new PIXI.filters.MultiColorReplaceFilter(
					[
						[0x4d4a0e, 0x4d210e],
						[0x726d15, 0x733115],
						[0xada92c, 0xad532c]
					]
				);
				if(this._spr.filters) {
					this._spr.filters.push(filter);
				} else {
					this._spr.filters = [filter];
				}
			}

			if(this._hp < 0) {
				this._hp = 0;
			}
		}
		
		if(isInvincible) {
			ESPAudio.bigSnailBlock();
		} else {
			if(this._hp <= 0) {
				ESPAudio.bigSnailDefeat();
			} else {
				ESPAudio.bigSnailDamage(70);
			}
		}

		if(this._hp <= 0) {
			this.onDefeat();
		} else {
			this._spr.damage(isInvincible);
		}
		this._spr.refreshHpBar();
	}

	isInvincible() {
		return this._currentAttack === 1 && this._mode === 2 && this._actionTime > 40;
	}

	update() {
		super.update();

		if(this._metaMode === 1) {
			this.updatePlayerKill();
			this.updateBossFight();
		} else {
			this.speed.x = this.speed.y = 0;
			if(this._metaMode === 2) {
				this.speed.z = 0;
			} else {
				if(this.position.z > 0) {
					this.speed.z -= 0.2;
				}/* else {
					this.position.z = 0;
					this.speed.z = 0;
				}*/
			}
		}
	}

	updateBossFight() {
		if(this._currentAttack === 0) {

			if(this.position.x < 0 || this.position.x > (($gameMap.width() + 1) * TS) ||
				this.position.y < 0 || this.position.y > (($gameMap.height() + 1) * TS)) {
				this._resetTimer++;
				if(this._resetTimer > 20) {
					this.position.x = 11.5 * TS;
					this.position.y = 13.5 * TS;
					this.position.z = 400;
					this.CollisionHeight = 0;
					this._resetTimer = 0;
				}
			}

			this.checkJumpOutOfDanger();

			if(this.position.z > 0) {
				this.speed.z = -8;
				if(this.position.z < 0) {
					this.position.z = 0;
					this.speed.z = 0;
				}
			} else {
				if(this._attackCooldown > 0) {
					this._attackCooldown--;
				} else {
					this.findAttack();
				}

				if(this._currentAttack === 0) {
					const radians = Math.atan2(this.position.y - $espGamePlayer.position.y, this.position.x - $espGamePlayer.position.x);
					this.speed.x = Math.cos(radians) * -2;
					this.speed.y = Math.sin(radians) * -2;
				}
			}
		} else if(this._currentAttack === 1) {
			this.updateChargeAttack();
		} else if(this._currentAttack === 2) {
			this.updateJumpAttack();
		} else if(this._currentAttack === 3) {
			this.updateRest();
		}
	}

	checkJumpOutOfDanger() {
		if(this.position.x < 4 * TS || this.position.x > 18 * TS) {
			const left = this.position.x < 4 * TS;
			this.startJumpAttack(left ? 6 : -6, $espGamePlayer.position.y < this.position.y ? 2 : -2);
			return true;
		}
		return false;
	}

	findAttack() {
		if(Math.random() < (0.5 - (this._attackFrequency / 6)) && this.getDistance2d($espGamePlayer) < 300) {
			this.startChargeAttack();
			this._attackFrequency += 3;
		} else {
			this.startJumpAttack();
			this._attackFrequency--;
		}
	}

	getSpeedX() {
		return this._puesdoSpeedX ?? this.speed.x;
	}

	getSpeedY() {
		return this._puesdoSpeedY ?? this.speed.y;
	}

	deleteTraceLine() {
		if(this._graphicsLine) {
			SceneManager._scene._spriteset._tilemap.removeChild(this._graphicsLine);
			this._graphicsLine.destroy();
			this._graphicsLine = null;
		}
	}

	onPlayerKilled() {
		this.deleteTraceLine();
	}

	resetToDefaultMode() {
		this._mode = 0;
		this.speed.x = 0;
		this.speed.y = 0;
		this._actionTime = 0;
		this._attackCooldown = 200;
	}

	redoIdleMotion(forceStill) {
		/*
		if(this._actionTime <= 0) {
			if(!forceStill && (this._lastIdleAction === 0 || Math.random() < 0.5)) {
				this._lastIdleAction = 1;
				this.speed.x = (Math.random()) - 0.5;
				this.speed.y = (Math.random()) - 0.5;
			} else {
				this._lastIdleAction = 0;
				this.speed.x = this.speed.y = 0;
			}
			this._actionTime = 100 + (Math.random() * 300);
		} else {
			this._actionTime--;
		}*/
	}

	updatePlayerKill() {
		if(Math.abs(this._puesdoSpeedX) > TS || Math.abs(this._puesdoSpeedY) > TS) {
			const num = Math.abs(Math.abs(this._puesdoSpeedX) > TS ?
				Math.ceil(this._puesdoSpeedX / TS) :
				Math.ceil(this._puesdoSpeedY / TS)
			)
			let startX = this.position.x - this._puesdoSpeedX;
			let startY = this.position.y - this._puesdoSpeedY;
			for(let i = 0; i <= num; i++) {
				if(this.checkIfCollidingFromPosition(
					$espGamePlayer,
					startX + (this._puesdoSpeedX * (i / num)),
					startY + (this._puesdoSpeedY * (i / num))
				)) {
					this.killPlayer();
				}
			}
		}
		if(this.checkIfColliding($espGamePlayer)) {
			this.killPlayer();
		}
		const spitters = $gameMap.findObjectGroup("firespitter");
		if(spitters && spitters.length > 0) {
			const len = spitters.length;
			for(let i = 0; i < len; i++) {
				if(!spitters[i].isDefeated() && this.checkIfColliding(spitters[i])) {
					spitters[i].defeat();
				}
			}
		}
		const makers = $gameMap.findObjectGroup("icemaker");
		if(makers && makers.length > 0) {
			const len = makers.length;
			for(let i = 0; i < len; i++) {
				if(!makers[i].isDefeated() && this.checkIfColliding(makers[i])) {
					makers[i].defeat();
				}
			}
		}
	}

	killPlayer() {
		const x = Math.abs(this.position.x - $espGamePlayer.position.x) / 50;
		const y = Math.abs(this.position.y - $espGamePlayer.position.y) / 20;
		$espGamePlayer.kill(20 * (this.position.x > $espGamePlayer.position.x ? -x : x), 20 * (this.position.y > $espGamePlayer.position.y ? -y : y), 40);
	}

	checkIfCollidingFromPosition(obj, x, y) {
		if(this.position.z > 0) {
			return false;
		}
		const distX = Math.abs(x - obj.position.x);
		const distY = Math.abs(y - obj.position.y);
		return distY < 20 && distX < 50;
	}

	checkIfColliding(obj) {
		return this.checkIfCollidingFromPosition(obj, this.position.x, this.position.y);
	}

	onCollided(direction) {
		/*
		if(this._mode === 0) {
			this.redoIdleMotion();
		} else if(this._mode === 2) {
			if(direction === 8 || direction === 2) {
				this.speed.y = this.speed.y * -0.7;
			} else if(direction === 6 || direction === 4) {
				this.speed.x = this.speed.x * -0.7;
			}
		}*/
	}

	direction() {
		return this._mode === 1 ? (this.position.x < $espGamePlayer.position.x ? -1 : 1) : (this.getSpeedX() > 0 ? -1 : 1);
	}

	frameDelay() {
		return this._frameDelay;
	}

	mode() {
		return this._mode;
	}

	shadowify() {
		return true;
	}

	incrementDrawPoints() {
		if(this._drawTime > 0) {
			this._drawTime--;
			let storePoint = false;

			{
				const newX = this._drawX + this._drawSpeedX;
				let canMoveToNewX = true;
				let currX = this._drawX;
				while(true) {
					if(!this.canMoveToX(currX)) {
						canMoveToNewX = false;
						break;
					}
					if(currX === newX) {
						break;
					}
					if(this._drawX < newX) {
						currX += TS;
						if(currX > newX) currX = newX;
					} else if(this._drawX > newX) {
						currX -= TS;
						if(currX < newX) currX = newX;
					}
				}
				if(!canMoveToNewX) {
					this._drawSpeedX *= -0.7;
					storePoint = true;
				} else {
					this._drawX = newX;
				}
			}

			{
				const newY = this._drawY + this._drawSpeedY;
				let canMoveToNewY = true;
				let currY = this._drawY;
				while(true) {
					if(!this.canMoveToY(currY)) {
						canMoveToNewY = false;
						break;
					}
					if(currY === newY) {
						break;
					}
					if(this._drawY < newY) {
						currY += TS;
						if(currY > newY) currY = newY;
					} else if(this._drawY > newY) {
						currY -= TS;
						if(currY < newY) currY = newY;
					}
				}
				if(!canMoveToNewY) {
					this._drawSpeedY *= -0.7;
					storePoint = true;
				} else {
					this._drawY = newY;
				}
			}

			if(storePoint) {
				this._drawPoints.push([this._drawX, this._drawY]);
			}
			this._drawPositions.push([this._drawX, this._drawY]);
		}
	}

	onAttackEnds() {
		if(this._restQueue && this._restQueue > 0) {
			this.startRest(this._restQueue);
			this._restQueue = 0;
		} else if(this._currentAttack === 1) {
			if(!this.checkJumpOutOfDanger()) {
				this.startRest(240 * 2);
			} else {
				this._restQueue = 240 * 2;
			}
		} else {
			this._currentAttack = 0;
			this._attackCooldown = 60;
		}
	}

	startChargeAttack() {
		this._currentAttack = 1;
		this._mode = 0;
	}

	updateChargeAttack() {
		if(this._mode === 0) {
			this._isShortDash = this._hp < 250;
			this._mode = 1;
			this.speed.x = this.speed.y = 0;
			this._actionTime = this._isShortDash ? 40 : 80;
			const radians = Math.atan2(this.position.x - $espGamePlayer.position.x, this.position.y - $espGamePlayer.position.y);
			this._desiredSpeedX = Math.sin(radians) * -36;
			this._desiredSpeedY = Math.cos(radians) * -36;
			if(this._isShortDash) {
				ESPAudio.bigSnailDashStart();
			} else {
				ESPAudio.bigSnailDashStartLong();
			}
			this._drawX = this.position.x;
			this._drawY = this.position.y;
			this._drawSpeedX = this._desiredSpeedX;
			this._drawSpeedY = this._desiredSpeedY;
			this._drawTime = this._actionTime * 4;
			this._drawPoints = [];
			this._drawPoints.push([this._drawX, this._drawY]);
			this._drawPositions = [];

			if(!this._graphicsLine) {
				this._graphicsLine = new PIXI.Graphics();
				this._graphicsLine.filters = [new PIXI.filters.PixelateFilter(4)];
				this._graphicsLine.blendMode = PIXI.BLEND_MODES.ADD;
				this._graphicsLine.alpha = this._graphicsLineOpacity;
				SceneManager._scene._spriteset._tilemap.addChild(this._graphicsLine);
			} else {
				this._graphicsLine.alpha = this._graphicsLineOpacity;
				this._graphicsLine.clear();
			}
		} else if(this._mode === 1) {
			this._actionTime--;

			this.incrementDrawPoints();
			this.incrementDrawPoints();
			if(this._isShortDash) {
				this.incrementDrawPoints();
				this.incrementDrawPoints();
			}

			if(this._graphicsLine) {
				this._graphicsLine.clear();
				this._graphicsLine.lineStyle(58, this._isShortDash ? 0xe38f86 : 0xe1e3a3, 1);
				this._graphicsLine.moveTo(this.position.x, this.position.y);
				this._graphicsLine.z = 3;
				for(let i = 0; i < this._drawPoints.length; i++) {
					this._graphicsLine.lineTo(this._drawPoints[i][0], this._drawPoints[i][1]);
				}
				this._graphicsLine.lineTo(this._drawX, this._drawY);
			}

			if(this._actionTime <= 0) {
				this._mode = 2;
				this._actionTime = 160;
				ESPAudio.bigSnailDashCharge();
			}
		} else if(this._mode === 2) {
			this._actionTime--;

			const r = Easing.easeOutCubic(1 - (this._actionTime / 160));
			const newPos = this._drawPositions[Math.round(160 * r)];
			if(newPos) {
				const newPuesdoSpeedX = newPos[0] - this.position.x;
				const newPuesdoSpeedY = newPos[1] - this.position.y;
				if(newPuesdoSpeedX !== 0) this._puesdoSpeedX = newPuesdoSpeedX;
				if(newPuesdoSpeedY !== 0) this._puesdoSpeedY = newPuesdoSpeedY;
				this.position.x = newPos[0];
				this.position.y = newPos[1];
				this.position.z = 0;
				this.CollisionHeight = 0;
			}

			if(this._graphicsLine && this._actionTime >= (80)) {
				this._graphicsLine.alpha = this._graphicsLineOpacity * ((this._actionTime - 80) / 80);
			}
			if(this._actionTime <= 0) {
				this.onAttackEnds();
				this._puesdoSpeedX = null;
				this._puesdoSpeedY = null;
			}
		}
	}

	startRest(time) {
		this._currentAttack = 3;
		this._mode = time;
		ESPAudio.bigSnailRest();
	}

	isResting() {
		return this._currentAttack === 3;
	}

	updateRest() {
		if(this._mode > 0) {
			this._mode--;
		} else {
			this.onAttackEnds();
		}
	}

	startJumpAttack(spdX, spdY) {
		this._currentAttack = 2;
		this._mode = 0;
		this._desiredSpeedX = spdX ?? null;
		this._desiredSpeedY = spdY ?? null;
	}

	isJumping() {
		return this._currentAttack === 2 && this._mode === 0;
	}

	performJump() {
		this.speed.z = 4;
		if(!this._desiredSpeedX && !this._desiredSpeedY) {
			const radians = Math.atan2(this.position.x - $espGamePlayer.position.x, this.position.y - $espGamePlayer.position.y);
			this._desiredSpeedX = Math.sin(radians) * -8;
			this._desiredSpeedY = Math.cos(radians) * -8;
		}
		this.speed.x = this._desiredSpeedX;
		this.speed.y = this._desiredSpeedY;
		this._desiredSpeedX = null;
		this._desiredSpeedY = null;
		this._mode = 1;
		ESPAudio.bigSnailJump();
	}

	updateJumpAttack() {
		if(this._mode === 0) {
			this.speed.x = this.speed.y = 0;
		} else if(this.position.z > 0) {
			this.speed.z -= 0.2;
		} else {
			this.position.z = 0;
			this.speed.set(0, 0, 0);
			this.onAttackEnds();
		}
	}

	onDefeat() {
		this._spr.onDefeat();
		this._metaMode = 2;
	}

	onDefeatFinal(defeated) {
		this._spr.onDefeatFinal();
		$gameMap.removeGameObject(this);

		AudioManager.fadeOutBgm(defeated ? 2 : 1);

		if(defeated) {
			$gameMap._boss3Defeated = true;
			$gameVariables.setValue(51, 1);

			$gameMap.findObjectGroup("firespitter").forEach(s => s._shootRate = 0);
			$gameMap.findObjectGroup("icemaker").forEach(s => s._shootRate = 0);

			const obj = $gameMap.findObject("OtherWall");
			if(obj && obj.hideSpears) {
				obj.hideSpears();
			}

			const interpreter = new ESPInterpreter();
			interpreter
			.moveCameraToGrid(11.5, 4.5)
			.closeSpearWall("FinalWall")
			.wait(20)
			.save()
			.moveCameraToPlayer();
			$espGamePlayer.setInterpreter(interpreter);
		}
	}

	onGroundHit() {
		ESPAudio.bigSnailLand();
		$gameMap.shake();
	}
}
