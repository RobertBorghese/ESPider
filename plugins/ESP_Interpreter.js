// TIME TO WRITE MY OWN GODDAMN INTERPRETER AS IF THIS SHIT WASNT HARD ENOUGH
// (note: in retrospect, this isnt really interpreter, just async action executer)

class ESPInterpreter {
	constructor() {
		this._list = [];
		this._index = -1;
		this._updateFunc = null;
		this._input = null;
		this._waitTime = 0;
	}

	update() {
		if(this._updateFunc === null || this._updateFunc()) {
			this.increment();
		}
		return this._updateFunc === null;
	}

	increment() {
		this._index++;
		if(this._index < this._list.length) {
			this._input = this._list[this._index][0].call(this);
			this._updateFunc = this._list[this._index][1].bind(this, this._input);
		} else {
			this._updateFunc = null;
		}
	}

	setVariable(varId, value) {
		this._list.push([
			function() {
				$gameVariables._data[varId] = value;
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	incrementVariable(varId, amount = 1) {
		const value = $gameVariables.value(varId);
		return this.setVariable(varId, value + amount);
	}

	bitBoolVariable(varId, amount) {
		const val = $gameVariables.value(varId);
		return this.setVariable(varId, val | amount);
	}

	wait(amount) {
		this._list.push([
			function() {
				this._waitTime = amount;
			},
			function() {
				this._waitTime--;
				return this._waitTime <= 0;
			}
		]);
		return this;
	}

	save() {
		this._list.push([
			function() {
				$gameMap.saveRespawnPosAndSave(-1);
			},
			function() {
				return true;
			}
		]);
		return this;
	}
	
	setCameraSmoothing(smoothing = 0.08) {
		this._list.push([
			function() {
				ESP.CameraSmoothing = smoothing;
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	resetCameraSmoothing() {
		return this.setCameraSmoothing(0.04);
	}

	moveCameraTo(x, y) {
		this._list.push([
			function() {
				SceneManager._scene.setCameraTargetXY(x, y);
			},
			function() {
				return SceneManager._scene.isCameraAtTarget();
			}
		]);
		return this;
	}

	moveCameraToGrid(x, y) {
		return this.moveCameraTo(x * TS, y * TS);
	}

	moveCameraToPlayer() {
		this._list.push([
			function() {
				SceneManager._scene.setCameraToPlayer();
			},
			function() {
				return SceneManager._scene.isCameraAtTarget(Graphics.height / 2);
			}
		]);
		return this;
	}

	setCameraOffset(x, y) {
		this._list.push([
			function() {
				$gameMap.ESPCameraOffsetX = x;
				$gameMap.ESPCameraOffsetY = y;
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	setCameraOffsetEase(x, y, duration, easeFunc) {
		if(!Easing[easeFunc]) return this;
		let startX = $gameMap.ESPCameraOffsetX;
		let startY = $gameMap.ESPCameraOffsetY;
		let time = 0;
		this._list.push([
			function() {
			},
			function() {
				const r = time / duration;
				$gameMap.ESPCameraOffsetX = startX + ((x - startX) * Easing[easeFunc](r));
				$gameMap.ESPCameraOffsetY = startY + ((y - startY) * Easing[easeFunc](r));
				time++;
				return time > duration;
			}
		]);
		return this;
	}
	
	resetCameraOffset() {
		return this.setCameraOffset(0, 0);
	}

	fadeOut() {
		this._list.push([
			function() {
			},
			function() {
				if(SceneManager._scene._overlay.alpha < 1) {
					SceneManager._scene._overlay.alpha += 0.02;
					return false;
				}
				return true;
			}
		]);
		return this;
	}

	fadeIn() {
		this._list.push([
			function() {
			},
			function() {
				if(SceneManager._scene._overlay.alpha > 0) {
					SceneManager._scene._overlay.alpha -= 0.02;
					return false;
				}
				return true;
			}
		]);
		return this;
	}

	closeSpearWall(name) {
		this._list.push([
			function() {
				const obj = $gameMap.findObject(name);
				if(obj && obj.hideSpears) {
					obj.hideSpears();
				}
				return obj;
			},
			function(obj) {
				if(!obj) return true;
				return !obj.isChanging();
			}
		]);
		return this;
	}

	createSpearWall(xGrid, yGrid, size, name, waitForIt = true) {
		this._list.push([
			function() {
				const regionId = $gameMap.getColHeight(xGrid, yGrid);
				const obj = new ESPSpearWallObject({ Width: size, StartingState: "down" }, true);
				obj.__eventName = name;
				$gameMap.addGameObject(obj, (xGrid * TS) + (TS / 2), (yGrid * TS) + (regionId * TS) + (TS / 2));
				return obj;
			},
			function(obj) {
				if(!obj) return true;
				return !waitForIt || !obj.isChanging();
			}
		]);
		return this;
	}

	removeGameObject(obj) {
		this._list.push([
			function() {
				$gameMap.removeGameObject(obj);
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	createInfoBug(xGrid, yGrid, text, trigDist, unTrigDist, name) {
		this._list.push([
			function() {
				const regionId = $gameMap.getColHeight(xGrid, yGrid);
				const obj = new ESPInfoBeetleObject({ text: [text], "Trigger Distance": trigDist.toString(), "Untrigger Distance": unTrigDist.toString() });
				obj.__eventName = name;
				obj.saveIndividual = function() { return true; };
				$gameMap.addGameObject(obj, (xGrid * TS) + (TS / 2), (yGrid * TS) + (regionId * TS) + (TS / 2));
				return obj;
			},
			function(obj) {
				return true;
			}
		]);
		return this;
	}

	callCode(code, thisObj) {
		this._list.push([
			function() {
				const func = new Function(code);
				func.call(thisObj);
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	callFunction(func, thisObj) {
		this._list.push([
			function() {
				if(thisObj) {
					func.call(thisObj);
				} else {
					func();
				}
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	waitForOkTrigger(preWaitTime) {
		this.wait(preWaitTime);
		this._list.push([
			function() {
			},
			function() {
				return Input.isOkTriggeredEx();
			}
		]);
		return this;
	}

	freezeWorldRendering(locations) {
		this._list.push([
			function() {
				SceneManager._scene._spriteset.freezeWorldSpriteVisibility(locations);
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	freezeWorldRendering(locations) {
		this._list.push([
			function() {
				SceneManager._scene._spriteset.unfreezeWorldSpriteVisibility();
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	startBoss(num) {
		this._list.push([
			function() {
				switch(num) {
					case 1: { $gameMap.startBoss1(); break; }
					case 2: { $gameMap.startBoss2(); break; }
					case 3: {
						if($gameMapTemp._slugBoss) {
							$gameMapTemp._slugBoss.startBoss();
						}
						break;
					}
					case 4: { $gameMap.startBoss4(); break; }
				}
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	finishBoss(num) {
		this._list.push([
			function() {
				switch(num) {
					case 1: { $gameMap.finishBoss1(); break; }
					case 2: { $gameMap.finishBoss2(); break; }
					case 3: { break; }
					case 4: { $gameMap.finishBoss4(); break; }
				}
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	setBGM(bgm) {
		this._list.push([
			function() {
				AudioManager.playBgm({ name: bgm, volume: 100, pitch: 100, pan: 0 });
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	playMusicOnce(songName) {
		this._list.push([
			function() {
				AudioManager.playMe({ name: songName, volume: 100, pitch: 100, pan: 0 });
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	startMovingDownForFinalCredits(duration) {
		let time = 0;
		this._list.push([
			() => {
				const spr = new Sprite(ImageManager.loadBitmapFromUrl("img/pictures/End.png"));
				spr.x = 0;
				spr.y = Graphics.height;
				SceneManager._scene.addChild(spr);
				this._movingDownForCreditsSpr = spr;
			},
			() => {
				const r = Easing.easeOutCubic(time / duration);
				this._movingDownForCreditsSpr.y = (1 - r) * Graphics.height;
				time++;
				return time > duration;
			}
		]);
		return this;
	}

	showPicture(img, id, fadeInDuration, holdDuration, fadeOutDuration) {
		let time = 0;
		let mode = 0;
		this._list.push([
			() => {
				const spr = new Sprite(ImageManager.loadBitmapFromUrl(img));
				spr.anchor.set(0.5);
				spr.x = Graphics.width / 2;
				spr.y = Graphics.height / 2;
				spr.alpha = 0;
				SceneManager._scene.addChild(spr);
				this[id] = spr;
			},
			() => {
				let result = false;
				const spr = this[id];
				const r = mode === 0 ? (time / fadeInDuration) : (mode === 1 ? (time / holdDuration) : (time / fadeOutDuration));
				time++;
				if(mode === 0) {
					spr.alpha = r;
					if(time > fadeInDuration) {
						time = 0;
						mode = 1;
					}
				} else if(mode === 1) {
					if(time > holdDuration) {
						time = 0;
						mode = 2;
					}
				} else if(mode === 2) {
					spr.alpha = 1 - r;
					if(time > fadeOutDuration) {
						time = 0;
						result = true;
						spr.visible = false;
						SceneManager._scene.removeChild(spr);
						spr.destroy();
						this[id] = null;
					}
				}
				return result;
			}
		]);
		return this;
	}
}
