// lets make the most epic boss of the entire game jam!!! >:3c

class ESPBoss2Data {
	constructor() {
		this.timer = 0;
		this.currentAttack = 0;
		this.attackTimer = 0;
		this.legDir = 0;
		this.dropStuffTimes = 0;
		this.stuffExists = false;

		this._doneSuperBalls = 3;
		this._bigBallCombos = 0;

		this.attackFreqId = 0;
		this.attackFreq = 0;

		this.phase = 0;
		this.wasDamaged = false;
	}

	destroy() {
	}

	static getRandomNumber() {
		this.place++;
		if(this.place >= this.randomGenerator.length) {
			this.place = 0;
		}
		return this.randomGenerator[this.place];
	}

	static place = 0;

	static randomGenerator = [
		0.1812404113022401,0.5976258919426354,0.9084797343416324,0.23534504153127855,0.33357626282777253,0.46406687777187794,
		0.6813193027678033,0.502357762418,0.3750719199685222,0.1373682933423479,0.4733420880565187,0.29708171917402204,0.9685071421871594,0.30303477795390776,
		0.9387032139006652,0.6772964078671146,0.6455160344143136,0.47229366786630345,0.8947624231950446,0.7528976636725906,0.6784921325806521,0.4162218605669994,
		0.6524295062878334,0.7837587619070956,0.494251378416273,0.3420413591438125,0.8192594017267008,0.8931270104535955,0.9065463380146797,0.39943747731943646
	];

	static cameraOffset = -148;
}

modify_Game_Map_2 = class {
	startBoss2() {
		this._boss2Data = new ESPBoss2Data();

		{
			const x = 9;
			const y = 6.5;
			const obj = new ESPBoss2LegObject();
			$gameMapTemp._boss2LeftLeg = obj;
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (TS / 2), 300);
		}

		{
			const x = 22;
			const y = 6.5;
			const obj = new ESPBoss2LegObject({
				"Reversed": true
			});
			$gameMapTemp._boss2RightLeg = obj;
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (TS / 2), 500);
		}

		$gameMapTemp._boss2Face = new ESPBoss2FaceSprite();
		$gameMapTemp._boss2Face._alwaysOnTop = 60;
		$gameMapTemp._boss2Face.x = (($gameMap.width() * TS) / 2) + 30;
		$gameMapTemp._boss2Face._baseY = -300;
		$gameMapTemp._boss2Face._damageOffsetY = 0;
		$gameMapTemp._boss2Face._damageOffsetYMax = 40;
		$gameMapTemp._boss2Face.y = -300;
		$gameMapTemp._boss2Face.filters = [new PIXI.filters.DropShadowFilter({
			blur: 0,
			distance: 30,
			resolution: 2,
			rotation: 90,
			alpha: 0.3
		})];
		SceneManager._scene._spriteset._tilemap.addChild($gameMapTemp._boss2Face);
	}

	updateBoss2() {
		if(!this._boss2Data) return;
		this._boss2Data.timer++;

		const time = this._boss2Data.timer;

		if(time > 380) {
			this.updateIdle();
		} else if(time > 120 && time < 240) {
			$gameMapTemp._boss2Face._baseY = -300 + (360 * Easing.easeOutCubic(((time - 120) / 120)));
		} else if(time >= 260 && time <= 280) {
			const r = Easing.easeInCubic((time - 260) / 20);
			$gameMapTemp._boss2Face._baseY = 60 - (r * 40);
			$gameMapTemp._boss2Face.setOpenness(-0.5 * r);
		} else if(time >= 290 && time <= 300) {
			const r = Easing.easeInCubic((time - 290) / 10);
			$gameMapTemp._boss2Face._baseY = 20 + (r * 90);
			$gameMapTemp._boss2Face.setOpenness(-0.5 + (1 * r));
		} else if(time >= 320 && time <= 340) {
			const r = Easing.easeOutCubic((time - 320) / 20);
			$gameMapTemp._boss2Face._baseY = 110 - (50 * r)
			$gameMapTemp._boss2Face.setOpenness(0.5 - (0.5 * r));
			this._boss2Data.TempData = $gameMapTemp._boss2Face._left.rotation;
			this._boss2Data.TempDataTime = 20;
		} else if(time === 380) {
			AudioManager.playBgm({ name: "Conflict", volume: 100, pitch: 100, pan: 0 });
		}

		if(this._boss2Data.killAwait > 0) {
			this._boss2Data.killAwait--;
			if(this._boss2Data.killAwait <= 0) {
				$espGamePlayer.kill(0, 0, 100);
			}
		} else if(this._boss2Data.canAttackNextTimer > 0) {
			this._boss2Data.canAttackNextTimer--;

			if(this._boss2Data.wasDamaged && $gameMapTemp._boss2Face._damageOffsetY === 0) {
				this._boss2Data.canAttackNextTimer = 0;
				this.boss2Attack(-1);
				this._boss2Data.wasDamaged = false;
			}
		} else if(time > 440) {
			if(this._boss2Data.currentAttack === 1) {
				this.updateSwingAttack();
				this.onAttackEnd();
			} else if(this._boss2Data.currentAttack === 2) {
				this.updatePoisonShot();
				this.onAttackEnd();
			} else if(this._boss2Data.currentAttack === -1) {
				this.updateScream();
				this.onAttackEnd();
				if(this._boss2Data && this._boss2Data.currentAttack === 0) {
					if(this._boss2Data.phase === 3) {
						this.boss2Attack(-1);
					} else if(this._boss2Data.phase >= 3) {
						this.boss2Attack(-2);
					}
				}
			} else if(this._boss2Data.currentAttack === -2) {
				this.updateLeavingThing();
				this.onAttackEnd();
			} else if(this._boss2Data.currentAttack === 0) {
				if(!this.updateStompDefense()) {
					let result = null;
					const id = this._boss2Data.attackFreqId;
					if(id > 0) {
						if(this._boss2Data.attackFreq === 2) {
							if(id === 1) result = Math.random() < 0.75 ? 2 : 1;
							else if(id === 2) result = Math.random() < 0.75 ? 1 : 2;
						} else if(this._boss2Data.attackFreq === 3) {
							if(id === 1) result = Math.random() < 0.9 ? 2 : 1;
							else if(id === 2) result = Math.random() < 0.9 ? 1 : 2;
						} else if(this._boss2Data.attackFreq >= 4) {
							if(id === 1) result = 2;
							else if(id === 2) result = 1;
						}
					}
					if(result === null) {
						result = Math.random() < 0.5 ? 1 : 2;
					}
					this.boss2Attack(result);
					if(result !== this._boss2Data.attackFreqId) {
						this._boss2Data.attackFreqId = result;
						this._boss2Data.attackFreq = 0;
					} else {
						this._boss2Data.attackFreq++;
					}
				}
			}
		}

		if(time === 300) {
			SceneManager._scene._spriteset.shake();
			ESPAudio.boss2Roar();
		}

		if(this._boss2Data && this._boss2Data.stuffExists) {
			if(this._boss2Data._webdevice && this._boss2Data._webdevice.position.y > 21 * TS) {
				$gameMap.removeGameObject(this._boss2Data._webdevice);
				this._boss2Data._webdevice = null;
			}
			if(this._boss2Data._button && this._boss2Data._button.position.y > 21 * TS) {
				$gameMap.removeGameObject(this._boss2Data._button);
				this._boss2Data._button = null;
			}
			if(!this._boss2Data._button && !this._boss2Data._webdevice) {
				this._boss2Data.stuffExists = false;
			}
		}

		if($gameMapTemp._boss2Face && $gameMapTemp._boss2Face._damageOffsetY < 0) {
			const r = ($gameMapTemp._boss2Face._damageOffsetY / -$gameMapTemp._boss2Face._damageOffsetYMax);
			const blend = [255 * r, 0, 0, 255 * r];
			$gameMapTemp._boss2Face.setBlendColor(blend);
			$gameMapTemp._boss2LeftLeg._spr.setBlendColor(blend);
			$gameMapTemp._boss2RightLeg._spr.setBlendColor(blend);
			$gameMapTemp._boss2Face._damageOffsetY++;
		}

		if($gameMapTemp._boss2Face) $gameMapTemp._boss2Face.y = $gameMapTemp._boss2Face._damageOffsetY + ($gameMapTemp._boss2Face._baseY + (-80 * (Math.sin($gameMapTemp._boss2LeftLeg._time) * 0.3)));

		const mapWidth = $gameMap.width();
		if($espGamePlayer.CollisionHeight === 2) {
			for(let x = 9; x <= 21; x++) {
				for(let y = 12; y <= 14; y++) {
					SceneManager._scene._spriteset._espWorldSpriteIndexes[x + (y * mapWidth)].visible = false;
				}
			}
		}
	}

	updateLeavingThing() {
		this._boss2Data.attackTimer++;

		if(this._boss2Data.attackTimer === 40) {
			AudioManager.fadeOutBgm(8);
		}
		if(this._boss2Data.attackTimer < 120) {
			const r = this._boss2Data.attackTimer / 120;
			$gameMapTemp._boss2Face._baseY = 60 - (r * 400);
		}
		if(this._boss2Data.attackTimer === 40) {
			$gameMapTemp._boss2LeftLeg.leave();
		}
		if(this._boss2Data.attackTimer === 80) {
			$gameMapTemp._boss2RightLeg.leave();
		}
		if(this._boss2Data.attackTimer === 280) {
			$gameMap.removeGameObject($gameMapTemp._boss2LeftLeg);
			$gameMap.removeGameObject($gameMapTemp._boss2RightLeg);
			this.finishBoss2();
			//this._boss2Data.currentAttack = -3;
		}
	}

	updateScream() {
		if(this._boss2Data.attackTimer < 200) {
			this._boss2Data.attackTimer = 200;
		}
		this._boss2Data.attackTimer++;

		const time = this._boss2Data.attackTimer;

		if(time >= 260 && time <= 280) {
			const r = Easing.easeInCubic((time - 260) / 20);
			$gameMapTemp._boss2Face._baseY = 60 - (r * 40);
			$gameMapTemp._boss2Face.setOpenness(-0.5 * r);
		} else if(time >= 290 && time <= 300) {
			const r = Easing.easeInCubic((time - 290) / 10);
			$gameMapTemp._boss2Face._baseY = 20 + (r * 90);
			$gameMapTemp._boss2Face.setOpenness(-0.5 + (1 * r));
		} else if(time >= 320 && time <= 340) {
			const r = Easing.easeOutCubic((time - 320) / 20);
			$gameMapTemp._boss2Face._baseY = 110 - (50 * r)
			$gameMapTemp._boss2Face.setOpenness(0.5 - (0.5 * r));
			this._boss2Data.TempData = $gameMapTemp._boss2Face._left.rotation;
			this._boss2Data.TempDataTime = 20;
		} else if(time === 420) {
			this._boss2Data.TempData = $gameMapTemp._boss2Face._left.rotation;
			this._boss2Data.TempDataTime = 20;
			this._boss2Data.currentAttack = 0;
		}
		if(time === 300) {
			SceneManager._scene._spriteset.shake();
			ESPAudio.boss2Roar();
			if(this._boss2Data._webdevice) this._boss2Data._webdevice.speed.set(0, 4, 4);
			if(this._boss2Data._button) this._boss2Data._button.speed.set(0, 4, 4);
			this._boss2Data.phase++;
		}

		if(time === 240) {
			$gameMapTemp._boss2LeftLeg.superStomp();
		} else if(time === 270) {
			$gameMapTemp._boss2RightLeg.superStomp();
		}
	}

	updateIdle() {
		if(!this.shouldUpdateIdle()) return;
		const targetOpenness = -0.25 + (0.5 * Math.sin($gameMapTemp._boss2LeftLeg._time * 1.6) * 0.3);
		if(this._boss2Data.TempDataTime > 0) {
			this._boss2Data.TempDataTime--;
			$gameMapTemp._boss2Face.setOpenness(this._boss2Data.TempData + ((targetOpenness - this._boss2Data.TempData) * (1 - (this._boss2Data.TempDataTime / 20))));
		} else {
			$gameMapTemp._boss2Face.setOpenness(targetOpenness);
		}
	}

	shouldUpdateIdle() {
		return this._boss2Data.currentAttack !== 2 && this._boss2Data.currentAttack !== -1;
	}

	onAttackEnd() {
		if(this._boss2Data && this._boss2Data.currentAttack === 0) {
			this._boss2Data.attackTimer = 0;
			this._boss2Data.canAttackNextTimer = (this._boss2Data.lastAttack === 2 && this._boss2Data.stuffExists) ? 360 : 120;
		}
	}

	updateStompDefense() {
		if($espGamePlayer.position.y < 400 && $espGamePlayer.position.z <= 0) {
			if($espGamePlayer.position.x < 600) {
				$gameMapTemp._boss2LeftLeg.stomp();
			} else {
				$gameMapTemp._boss2RightLeg.stomp();
			}
			this._boss2Data.killAwait = 45;
			return true;
		}
		return false;
	}

	boss2Attack(type) {
		this._boss2Data.attackTimer = 0;
		this._boss2Data.currentAttack = type;
		this._boss2Data.lastAttack = type;

		if(this._boss2Data.currentAttack === 1) {
			// generate direction
			if(!this._boss2Data.legDirRatio) this._boss2Data.legDirRatio = 0.5
			this._boss2Data.legDir = Math.random() < this._boss2Data.legDirRatio ? 1 : 0;
			if(this._boss2Data.legDir === 1) {
				this._boss2Data.legDirRatio -= 0.1;
			} else {
				this._boss2Data.legDirRatio += 0.1;
			}
			this._boss2Data.legDirRatio = this._boss2Data.legDirRatio.clamp(0.1, 0.9);

			// generate leg speed
			if(this._boss2Data.phase === 0) {
				this._boss2Data.legSpeed = 80;
			} else if(this._boss2Data.phase === 1) {
				this._boss2Data.legSpeed = 40;
			} else if(this._boss2Data.phase >= 2) {
				this._boss2Data.legSpeed = Math.random() < 0.5 ? 40 : 80;
			}
		} else if(this._boss2Data.currentAttack === 2) {
			this._boss2Data.currentOpeness = $gameMapTemp._boss2Face.getOpenness();
			if(this._boss2Data.phase === 0) {
				this._boss2Data.bigBall = false;
				this._boss2Data.superBalls = false;
			} else if(this._boss2Data.phase === 1) {
				this._boss2Data.bigBall = true;
				this._boss2Data.superBalls = false;
			} else if(this._boss2Data.phase >= 2) {
				this._boss2Data.bigBall = Math.random() < 0.5;

				// ensure big ball only happens twice in a row
				if(this._boss2Data.bigBall) {
					this._boss2Data._bigBallCombos++;
				}
				if(this._boss2Data._bigBallCombos >= 3) {
					this._boss2Data._bigBallCombos = 0;
					this._boss2Data.bigBall = false;
				}

				// ensure "super balls" only happens twice ever
				if(!this._boss2Data.bigBall) {
					this._boss2Data._doneSuperBalls--;
					if(this._boss2Data._doneSuperBalls <= -3) {
						this._boss2Data._doneSuperBalls = 1;
					}
				}
				this._boss2Data.superBalls = this._boss2Data._doneSuperBalls > 0;
			}
		}
	}

	isBoss2() {
		return $gameMap.mapId() === 25 && !!$gameMapTemp._boss2LeftLeg;
	}

	cleanUpBoss2() {
		if(this._boss2Data) {
			this._boss2Data.destroy();
			this._boss2Data = null;
			AudioManager.fadeOutBgm(this._boss2Complete ? 2 : 1);
			$gameMap.ESPCameraOffsetX = 0;
			$gameMap.ESPCameraOffsetY = 0;
		}
	}

	cleanUpBoss2AfterFade() {
		if($gameMapTemp._boss2Face) {
			SceneManager._scene._spriteset._tilemap.removePlayerBasedSprite($gameMapTemp._boss2Face);
			$gameMapTemp._boss2Face.destroy();
			$gameMapTemp._boss2Face = null;
		}
		if(this._attackSprite) {
			SceneManager._scene._spriteset._tilemap.removePlayerBasedSprite(this._attackSprite);
			this._attackSprite.destroy();
			this._attackSprite = null;
		}
	}

	finishBoss2() {
		this._boss2Complete = true;
		this.cleanUpBoss2();
		this.cleanUpBoss2AfterFade();
		{
			const obj = new ESPAbilityGainObject();
			$gameMap.addGameObject(obj, 15.5 * TS, 14 * TS, 500);
			obj.CollisionHeight = 2;
		}
	}

	updatePoisonShot() {
		this._boss2Data.attackTimer++;

		const time = this._boss2Data.attackTimer;

		const FIRERATE = this._boss2Data.superBalls ? 20 : 40;//20;
		const FIRETIME = this._boss2Data.bigBall ? 220 : (this._boss2Data.superBalls ? 220 : 120);//220;

		if(time <= 30) {
			const r = Easing.easeInCubic(time / 30);
			$gameMapTemp._boss2Face.setOpenness(this._boss2Data.currentOpeness + ((-0.8 - this._boss2Data.currentOpeness) * r));
			$gameMapTemp._boss2Face._baseY = (60 - (40 * r));
			if(time === 30) {
				ESPAudio.boss2Clap();
				this._boss2Data.currentOpeness = $gameMapTemp._boss2Face.getOpenness();
			}
		} else if(time > 50 && time <= 80) {
			const r = Easing.easeOutBack((time - 50) / 30);
			$gameMapTemp._boss2Face._baseY = (20 + (120 * r));
			$gameMapTemp._boss2Face.setOpenness(this._boss2Data.currentOpeness + ((0.3 - this._boss2Data.currentOpeness) * r));
		} else if(time > 80 && time <= (80 + FIRETIME)) {
			$gameMapTemp._boss2Face.setOpenness(0.3 + (Math.sin(time / 3) * 0.05));
			if((this._boss2Data.bigBall && time === 81) || (!this._boss2Data.bigBall && (time % FIRERATE === 0))) {
				const obj = new ESPPoisonballObject(this._boss2Data.bigBall, 2, this._boss2Data.bigBall);
				$gameMap.addGameObject(obj, $gameMapTemp._boss2Face.x, (10 * TS) + (this._boss2Data.bigBall ? TS : 0), 110 + (this._boss2Data.bigBall ? 20 : 0));
				const radians = Math.atan2(obj.position.x - $espGamePlayer.position.x, (obj.position.y - $espGamePlayer.position.y) + $gameMapTemp._boss2Face._baseY) + ((ESPBoss2Data.getRandomNumber() * 2) - 1);
				obj.speed.x = (Math.sin(radians) * -2);
				obj.speed.y = (Math.cos(radians) * -2);
				if(obj.speed.y < 0.2) {
					obj.speed.y = 0.2;
				}
				if(this._boss2Data.bigBall) {
					ESPAudio.boss2Charge();
				}
			}
		} else if(time > (80 + FIRETIME) && time <= (100 + FIRETIME)) {
			const r = (time - (80 + FIRETIME)) / 20;
			$gameMapTemp._boss2Face._baseY = (140 - (80 * r));
		} else if(time === (101 + FIRETIME)) {
			this._boss2Data.TempData = $gameMapTemp._boss2Face._left.rotation;
			this._boss2Data.TempDataTime = 20;
			this._boss2Data.currentAttack = 0;
		}
	}

	updateSwingAttack() {
		this._boss2Data.attackTimer++;

		const START_WAIT = 0;//10;
		const ATTACK_DURATION = this._boss2Data.legSpeed;
		const LEAVE_DURATION = 20;

		const time = this._boss2Data.attackTimer;

		if(time === 1) {
			if(this._boss2Data.legDir === 0) {
				$gameMapTemp._boss2LeftLeg.goUp();
			} else {
				$gameMapTemp._boss2RightLeg.goUp();
			}
		} else if(time === 20) {
			$gameMap.ESPCameraOffsetY = 0;
		} else if(time === 60) {
			if(this._boss2Data.legSpeed === 40) {
				if(this._boss2Data.legDir === 0) {
					$gameMapTemp._boss2RightLeg.stomp();
				} else {
					$gameMapTemp._boss2LeftLeg.stomp();
				}
			}
		} else if(time === 80) {
			if(!this._attackSprite) {
				this._attackSprite = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegAttack1.png"));
				this._attackSprite.anchor.set(37 / 73, 37 / 260);
				this._attackSprite.filters = [new PIXI.filters.DropShadowFilter({
					blur: 0,
					distance: 30,
					resolution: 2,
					rotation: 90,
					alpha: 0.3
				})];

				this._attackSprite2 = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegAttack2.png"));
				this._attackSprite2.anchor.set(9 / 32, 10 / 123);
				this._attackSprite2.move(5, 210);
				this._attackSprite.addChild(this._attackSprite2);

				this._attackSprite3 = new Sprite(ImageManager.loadBitmapFromUrl("img/bosses/boss2/LegAttack3.png"));
				this._attackSprite3.anchor.set(8 / 26, 8 / 82);
				this._attackSprite3.move(5, 110);
				this._attackSprite2.addChild(this._attackSprite3);

				this._attackSprite._alwaysOnTop = 100;
				this._attackSprite.scale.set(2);
				SceneManager._scene._spriteset._tilemap.addPlayerBasedSprite(this._attackSprite, SceneManager._scene._spriteset._tilemap.children.indexOf($gameMapTemp._boss2Face));
			}

			if(this._boss2Data.legDir === 0) {
				this._attackSprite.scale.set(2, 2);
			} else {
				this._attackSprite.scale.set(-2, 2);
			}

			this._attackSprite.visible = true;
			this._attackSprite.y = -800;
			if(this._boss2Data.legDir === 0) {
				this._attackSprite.x = 400;
			} else {
				this._attackSprite.x = 1100;
			}
			this._attackSprite.rotation = 0
			this._attackSprite2.rotation = 0;
			this._attackSprite3.rotation = 0;
		} else if(time > 80 && time <= 100) {
			const r = Easing.easeOutCubic((time - 80) / 20);
			this._attackSprite.y = -800 + (900 * r);
		} else if(time > 100 && time <= 120) {
			const r = Easing.easeInOutQuad((time - 100) / 20);

			this._attackSprite.rotation = 0.1 * r * (this._boss2Data.legDir === 1 ? -1 : 1);//0.1 * r;
			this._attackSprite2.rotation = 0.2 * r;
			this._attackSprite3.rotation = 0.5 * r;

			if(this._boss2Data.legDir === 1) {
				//this._attackSprite.x = 1100 + (100 * r);
			}
			this._attackSprite.y = 100 - (100 * r);
		} else if(time > (120 + START_WAIT) && time <= (120 + ATTACK_DURATION)) {
			const r = Easing.easeInCubic((time - (120 + START_WAIT)) / (ATTACK_DURATION - START_WAIT));
			if(this._boss2Data.legDir === 0) {
				this._attackSprite.x = 400 + (500 * r);
			} else {
				this._attackSprite.x = 1100 - (700 * r);
			}

			this._attackSprite.rotation = ((this._boss2Data.legDir === 1 ? -0.1 : 0.1) - (0.3 * r));
			this._attackSprite2.rotation = 0.2 - (0.6 * r);
			this._attackSprite3.rotation = 0.5 - (1.1 * r);

			if(r) {
				const damagePos = this._attackSprite.x;
				let damagePosOffset = 0;
				if(this._boss2Data.legDir === 0) {
					damagePosOffset = damagePos + (($espGamePlayer.position.x < 900 ? -20 : -40) + (r * 250));
				} else {
					damagePosOffset = damagePos + (150 + (r * ($espGamePlayer.position.x < 750 ? 0 : -150)));
				}
				if($espGamePlayer.position.z < 6 && Math.abs($espGamePlayer.position.x - damagePosOffset) < 20) {
					$espGamePlayer.kill((this._boss2Data.legDir === 0 ? 50 : -50), 0, 60);
				}
			}

		} else if(time > (120 + ATTACK_DURATION) && time <= (120 + ATTACK_DURATION + LEAVE_DURATION)) {
			const r = (time - (120 + ATTACK_DURATION)) / LEAVE_DURATION;
			this._attackSprite.y = 0 - (800 * r);
			if(this._boss2Data.legDir === 1) {
				this._attackSprite.x = 400 - (400 * r);
			}
		} else if(time === (120 + ATTACK_DURATION + LEAVE_DURATION + 1)) {
			this._attackSprite.visible = false;
			if(this._boss2Data.legDir === 0) {
				$gameMapTemp._boss2LeftLeg.goDown(280, true);
			} else {
				$gameMapTemp._boss2RightLeg.goDown(280, true);
			}
		} else if(time === (120 + ATTACK_DURATION + LEAVE_DURATION + 120)) {
			this._boss2Data.currentAttack = 0;
			$gameMap.ESPCameraOffsetY = ESPBoss2Data.cameraOffset;
			SceneManager._scene._spriteset._tilemap.refreshPlayer();
		}
	}

	onLegStomp() {
		if(!this._boss2Data.stuffExists) {
			this._boss2Data.dropStuffTimes++;
			if(true) {//Math.random() < (this._boss2Data.dropStuffTimes / 6)) {
				this._boss2Data.dropStuffTimes = 0;
				this._boss2Data.stuffExists = true;

				let buttonX = 0;//Math.floor(Math.random() * (21 - 9)) + 9;
				if(this._boss2Data.phase === 0) {
					buttonX = Math.random() < 0.5 ? 10 : 20;
				} else if(this._boss2Data.phase === 1) {
					buttonX = Math.random() < 0.5 ? 10 : 20;
				} else if(this._boss2Data.phase === 2) {
					buttonX = Math.random() < 0.5 ? 10 : 20;
				}
				const buttonY = 13;
				const button = $gameMap.createPresetObject(9, buttonX, buttonY, "Button", {
					"On Press": "$gameMap.findObject(\"WebDevice\").open();",
					"On Released": "$gameMap.findObject(\"WebDevice\").close();"
				});
				button.CollisionHeight = 2;
				button.position.z = 400;
				this._boss2Data._button = button;

				{
					let y = 11;
					let x = 0;
					if(this._boss2Data.phase === 0) {
						x = buttonX;
					} else if(this._boss2Data.phase === 1) {
						x = 15;
					} else if(this._boss2Data.phase === 2) {
						x = buttonX === 10 ? 20 : 10;
					}
					const obj = $gameMap.createPresetObject(10, x, y, "WebDevice", {
					});
					obj.CollisionHeight = 2;
					obj.position.z = 430;
					this._boss2Data._webdevice = obj;
				}
			}
		}
	}

	boss2TakeDamage() {
		const blend = [255, 0, 0, 255];
		$gameMapTemp._boss2Face.setBlendColor(blend);
		$gameMapTemp._boss2LeftLeg._spr.setBlendColor(blend);
		$gameMapTemp._boss2RightLeg._spr.setBlendColor(blend);
		$gameMapTemp._boss2Face._damageOffsetY = -$gameMapTemp._boss2Face._damageOffsetYMax;
		this._boss2Data.wasDamaged = true;
		SceneManager._scene._spriteset.shake();
		ESPAudio.boss2Damage();
	}
}
