// let's move this into separate file to help with organization 

modify_Game_Map_1 = class {
	isBoss1() {
		return $gameMap.mapId() === 13 && !!this._boss1Lefties;
	}

	cleanUpBoss1() {
		this._boss1Timer = null;
		this._boss1Lefties = null;
		this._boss1Righties = null;
		this._boss1Topies = null;
		this._boss1DidJump = null;
		if(!this._boss1Complete) $espGamePlayer.disableJump();
		ESP.WS = 1;
		SceneManager._scene._spriteset._tilemap.scale.set(1);
		if(!this._boss1Complete) {
			SceneManager._scene._overlay.alpha = 0;
		} else {
			$gameVariables.setValue(10, 1);
		}
		SceneManager._scene._spriteset.unfreezeWorldSpriteVisibility();
		AudioManager.fadeOutBgm(this._boss1Complete ? 2 : 1);
	}

	startBoss1() {
		this._boss1Timer = 0;
		this._boss1Lefties = [];
		this._boss1Righties = [];
		this._boss1Topies = [];
		for(let y = 7; y <= 12; y++) {
			let x = 7;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": "false",
				"Shoot Dir": "right",
				"Shoot Rate": 0
			});
			this._boss1Lefties.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + (y - 7) * 100);
		}
		for(let y = 7; y <= 12; y++) {
			let x = 19;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": "true",
				"Shoot Dir": "left",
				"Shoot Rate": 0
			});
			this._boss1Righties.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + (12 - y) * 100);
		}

		SceneManager._scene._spriteset.freezeWorldSpriteVisibility([
			[10, 16], [11, 16], [12, 16], [14, 16], [15, 16], [16, 16],
			[10, 17], [11, 17], [12, 17], [14, 17], [15, 17], [16, 17]
		])
	}

	startBoss1Phase2() {
		for(let x = 10; x <= 16; x++) {
			let y = 4;
			const regionId = this.getColHeight(x, y);
			const obj = new ESPFirespitterObject({
				"Look Dir": x % 2 === 0 ? "false" : "true",
				"Shoot Dir": "down",
				"Shoot Rate": 0
			});
			this._boss1Topies.push(obj);
			this.addGameObject(obj, (x * TS) + (TS / 2), (y * TS) + (regionId * TS) + (TS / 2), 500 + Math.abs(13 - x) * 100);
		}
	}

	finishBoss1() {
		ESPAudio.boss1Disappear();
		this._boss1Lefties.forEach(b => this.removeGameObject(b));
		this._boss1Righties.forEach(b => this.removeGameObject(b));
		this._boss1Topies.forEach(b => this.removeGameObject(b));
		this._boss1Complete = true;
		this.cleanUpBoss1();
	}

	updateBoss1() {
		if(!this.isBoss1()) return;

		this._boss1Timer++;


		const left = (i) => {
			if(i === undefined) {
				this._boss1Lefties.forEach(b => b.shoot());
			} else {
				this._boss1Lefties.filterIndex(i).forEach(b => b.shoot());
			}
			ESPAudio.superFireballShot();
		};

		const right = (i) => {
			if(i === undefined) {
				this._boss1Righties.forEach(b => b.shoot());
			} else {
				this._boss1Righties.filterIndex(i).forEach(b => b.shoot());
			}
			ESPAudio.superFireballShot();
		};

		const top = (i) => {
			if(this._boss1Timer < 1600) return;
			if(i === undefined) {
				this._boss1Topies.forEach(b => b.shoot());
			} else {
				this._boss1Topies.filterIndex(i).forEach(b => b.shoot());
			}
			ESPAudio.superFireballShot();
		};

		switch(this._boss1Timer) {
			case 50: { AudioManager.playBgm({ name: "TimeToFight_NoMelody", volume: 100, pitch: 100, pan: 0 }); break; }
			case 60: { left(0); break; }
			case 260: { right(5); break; }
			case 460: { left(2); break; }
			case 600: { right(4); break; }
			case 700: { left(1); break; }
			case 780: { right(5); break; }
			case 840: { left(3); break; }

			case 900: { right(4); break; }
			case 960: { left(0); break; }
			case 1000: { right(1); break; }

			case 1300: {
				const interpreter = new ESPInterpreter();

				interpreter
				.moveCameraToGrid(13.5, 7)
				.callCode("this.startBoss1Phase2()", this)
				.wait(120)
				.moveCameraToPlayer();

				$espGamePlayer.setInterpreter(interpreter);
			}

			case 1600: { top(3); break; }
			case 1700: { right(2); break; }
			case 1800: { left(5); break; }
			case 1900: { top(6); break; }
			case 2000: { left(3); break; }
			case 2100: { right(5); break; }
			case 2200: { top(1); break; }

			case 2400: {
				left(2);
				right(3); break;
			}
			case 2550: {
				left(0);
				right(1); break;
			}
			case 2700: {
				left(2);
				right(2);
				top(3); break;
			}

			case 3000: {
				left();
				right();
				top(); break;
			}
		}

		if(this._boss1Timer <= 3500) {
			if(this._boss1Timer === 3075) {
				AudioManager.fadeOutBgm(3);
			}
			if(this._boss1Timer > 3075) {
				const r = (150 - (this._boss1Timer - 3075).clamp(0, 150)) / 150;
				ESP.WS = r;
			}
			if(this._boss1Timer >= 3275) {
				if(this._boss1Timer === 3275) {
					ESPAudio.flashback();
				}
				const r = (200 - (this._boss1Timer - 3275).clamp(0, 200)) / 200;
				const r2 = Easing.easeInCubic(1 - r);
				SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
				SceneManager._scene._overlay.alpha = r2;
				SceneManager._scene.updateCameraPos(true);
			}
			if(this._boss1Timer === 3500) {
				AudioManager.playBgm({ name: "Flashback", volume: 100, pitch: 100, pan: 0 });
				SceneManager._scene.startSlideshow([
					["img/pictures/Scene1/Page1.png"],
					["img/pictures/Scene1/Page2.png"],
					"Are you really going to settle for that?",
					["img/pictures/Scene1/Page3.png"],
					"There are infinite lights greater than any spider has ever achieved.",
					["img/pictures/Scene1/Page4.png"],
					"How cute."
				]);
			}
		}
		
		if(!$espGamePlayer.canJump()) {
			if(this._boss1Timer === 3501) {
				const regionId = this.getColHeight(13, 14);
				this._boss1InfoBeetle = new ESPInfoBeetleObject({ text: ["Press [SPACE] or [STH] to jump."], "Trigger Distance": "10", "Untrigger Distance": "10" });
				this._boss1InfoBeetle.__eventName = "";
				this._boss1InfoBeetle.saveIndividual = function() { return true; };
				this.addGameObject(this._boss1InfoBeetle, (13 * TS) + (TS / 2), (14 * TS) + (regionId * TS) + (TS / 2));
			}
			if(this._boss1Timer <= 3701) {
				if(this._boss1Timer >= 3501) {
					const r = (200 - (this._boss1Timer - 3501).clamp(0, 200)) / 200;
					const r2 = Easing.easeOutCubic(r);
					SceneManager._scene._spriteset._tilemap.scale.set(1 + (6 * r2));
					SceneManager._scene._overlay.alpha = 0;
					SceneManager._scene.updateCameraPos(true);
				}
			}
			
			if(this._boss1Timer === 3750) {
				this._boss1InfoBeetle._triggerDist = 800;
				this._boss1InfoBeetle._untriggerDist = 850;
			}

			if(!this._boss1DidJump && this._boss1Timer > 3701) {
				if($espGamePlayer.isJumpButtonTriggered()) {
					ESPAudio.jump();
					this._boss1DidJump = this._boss1Timer;
					$espGamePlayer.speed.z = 8;
				}
			}

			if(ESP.WS < 1 && this._boss1DidJump) {
				const r = ((this._boss1Timer - this._boss1DidJump).clamp(0, 100)) / 100;
				ESP.WS = r;
			}

			if(this._boss1DidJump) {
				if($espGamePlayer.position.z > 0 || $espGamePlayer.speed.z > 0) {
					$espGamePlayer.speed.x = 0;
					$espGamePlayer.speed.y = $espGamePlayer.position.y > 585 ? -1 : 0;
					$espGamePlayer._canControl = false;
				} else {
					$espGamePlayer.enableJump();
					$espGamePlayer._canControl = true;
					this._boss1Timer = 4000;
				}
			}
		} else {

			switch(this._boss1Timer) {
				case 4090: { AudioManager.playBgm({ name: "TimeToFight", volume: 100, pitch: 100, pan: 0 }); break; }
				case 4100: { left(); break; }
				case 4300: { right(); break; }
				case 4500: { top(); break; }
				case 4700: {
					right();
					left(); break;
				}
				case 5000: {
					left();
					right();
					top(); break;
				}
				case 5300: {
					left();
					right();
					top(); break;
				}
				case 5600: {
					left();
					right();
					top(); break;
				}
				case 6000: {
					this._boss1InfoBeetle._triggerDist = 100;
					this._boss1InfoBeetle._untriggerDist = 150;

					const interpreter = new ESPInterpreter();

					interpreter
					.moveCameraToGrid(13.5, 9)
					.wait(30)
					.fadeOut()
					.finishBoss(1)
					.removeGameObject(this._boss1InfoBeetle)
					.createInfoBug(13, 14, "Nice buddy!", 80, 100, "InfoBug")
					.fadeIn()
					.wait(20)
					.moveCameraToGrid(13.5, 13)
					.closeSpearWall("Wall")
					.wait(20)
					.save()
					.moveCameraToPlayer();

					$espGamePlayer.setInterpreter(interpreter);
				}
			}

		}

		return false;
	}
}
