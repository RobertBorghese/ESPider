// The player descends from the heavens.

var gravityObjects = [];

class ESPGamePlayer extends ESPGameObject {
	constructor() {
		super();

		this.position.set(375, 500, 0);
		this.speed.set(0, 0, 0);

		this.respawnPos = {x: 0, y: 0};
		this.respawnCheckId = 0;

		this.canKill = true;

		this.FlyCount = 0;
		this.FlyData = {};

		this.IsGrappling = false;
		this._connectionCandidates = null;
		this._connections = [];
		this._distances = [];
		this._connectTime = [];
		this._speed = [];
		this._graphics = [];

		this._jumpHelp = 0;
		this._triggerHelp = 0;
		this._didJumpThisFrame = false;
		this._canControl = true;
		this._isDying = false;
		this._canTransition = true;
		this._noPlayerControlTimer = 0;
		this._deathAnimationData = null;
		this._customColor = null;
		this._spriteRotation = 0;
		this._deathParticles = null;
		this._isVisible = true;

		this._dashDirection = null;

		this._interpreter = null;

		this.lastDeathTime = -1;

		this.JUMP_POWER = 5;
		this.GRAVITY = 0.2;
	}

	cameraY() {
		if(this.__cameraCollisionHeight === undefined) this.__cameraCollisionHeight = 0;
		if(this.position.z <= 0 && this.__cameraCollisionHeight !== this.CollisionHeight) {
			this.__cameraCollisionHeight = this.CollisionHeight;
		}
		if($gameMap._espNewMapPosition && typeof $gameMap._espNewMapPosition.z === "number") {
			this.__cameraCollisionHeight = $gameMap._espNewMapPosition.z;
		}
		return this.position.y + (this.__cameraCollisionHeight * -TS);
	}

	getObjectVolume() {
		return 100;
	}

	reset(x, y, xSpd, ySpd, collisionHeight) {
		super.reset(x, y);
		this._canControl = true;
		this.CanCollide = true;
		Input._ESP_isDisabled = false;
		if(xSpd || ySpd) {
			this.makeCustscene();
			this._noPlayerControlTimer = 36;
			this.speed.x = xSpd ?? 0;
			this.speed.y = ySpd ?? 0;
		}
		if(collisionHeight !== undefined) {
			this.forceCollisionHeight(collisionHeight);
		}
	}

	makeCustscene() {
		this._canTransition = false;
		this._canControl = false;
		this.CanCollide = false;
	}

	makePlayable() {
		this._canTransition = true;
		this._canControl = true;
		this.CanCollide = true;
	}

	canControl() {
		return this._canControl && !this._isDying && !$gameTemp._isNewGame && ESP.WS > 0.2;
	}

	update() {
		this._didJumpThisFrame = false;
		this.updateInterpreter();
		this.updatePlayerControl();
		if(!this.updateDashMovement()) {
			this.updateInput();
			this.updateFalling();
			super.update();
			this.updateDeathTiles();
		}
		this.updateTransition();
		this.updateDying();
	}

	updateDashMovement() {
		if(this._isDying) return false;

		this.updateDashAfterImageAlpha();

		if(this.isDashing()) {
			this.position.x = ESP.lerp(this.position.x, this._dashTargetX, 0.3);
			this.position.y = ESP.lerp(this.position.y, this._dashTargetY, 0.3);

			if(this._dashChargeString) this._dashChargeString.visible = false;

			const diff = Math.max(Math.abs(this.position.x - this._dashTargetX), Math.abs(this.position.y - this._dashTargetY));
			if(diff < 1) {
				this.onDashComplete();
			} else {
				this.createDashAfterImage(diff);
				this.refreshDashString();
			}
			return true;
		}
		return false;
	}

	isDashing() {
		return !!this._dashChargeString && !!this._dashTargetX;
	}

	updateDashAfterImageAlpha() {
		if(this._dashSprites) {
			let allInvis = true;
			for(let i = 0; i < this._dashSprites.length; i++) {
				this._dashSprites[i].alpha -= 0.02;
				if(this._dashSprites[i].alpha > 0) {
					allInvis = false;
				}
			}
			if(allInvis) {
				this.destroyAllDashSprites();
			}
		}
	}
	
	createDashAfterImage(diff) {
		if(diff >= 20 && !this._placedDashSprite) {
			const spr = new Sprite(this._dashBitmap);
			spr.alpha = 0.5;
			spr.x = this.position.x - this._dashOriginalX;
			spr.y = this.position.y - this._dashOriginalY;
			SceneManager._scene._spriteset._tilemap._uiHolder.addChild(spr);
			this._dashSprites.push(spr);
			this._placedDashSprite = true;
		} else {
			this._placedDashSprite = false;
		}
	}

	onDashComplete() {
		this.position.x = this._dashTargetX;
		this.position.y = this._dashTargetY;
		this.destroyDashData();
		this.speed.z = this._webChargeAmount === 2 ? 6 : (this._webChargeAmount === 1 ? 3 : 0);
		if(this.speed.z > 0) {
			ESPAudio.jump();
		}
	}

	destroyDashData() {
		this._dashTargetX = this._dashTargetY = null;
		this._dashDirection = null;
	}

	updateInterpreter() {
		if(this._interpreter) {
			if(this._interpreter.update()) {
				this.makePlayable();
				this.clearInterpreter();
			}
			return false;
		}
		return true;
	}

	updatePlayerControl() {
		if(this._noPlayerControlTimer > 0) {
			this._noPlayerControlTimer--;
			if(this._noPlayerControlTimer === 0) {
				this.makePlayable();
				this.speed.x = 0;
				this.speed.y = 0;
			}
		}
	}

	updateInput() {
		if(this.canControl()) {
			this.checkInitialConnections();
			this.updateMovement();
			this.updateJump();
			this.updateAbilities();
		}
	}

	updateMovement() {
		if(!this._footstepInterval) this._footstepInterval = 14;

		const spd = this._hasBox?.isPulling?.(this) ? 1.5 : 3;

		this.speed.x = Input.InputVector.x * spd;
		this.speed.y = Input.InputVector.y * spd;

		if(this.canControl() && this.position.z === 0 && Input.InputVector.length() > 0.1 && (Graphics.frameCount % (Input.InputVector.length() > 0.5 ? 14 : 20)) === 0) {
			AudioManager.playSe({
				name: this._currentMovingPlatform ? "Footstep2" : "Footstep",
				volume: 20 + (Math.random() * 40),
				pitch: 75 + (Math.random() * 50),
				pan: 0
			});
			//this._footstepInterval = Math.round(13 + (Math.random() * 2));
			//ESPAudio.footstep(50);
		}
	}

	canJump() {
		return !this.IsGrappling && $gameVariables.value(1) >= 1;
	}

	canGrapple() {
		return !this._isDying && $gameVariables.value(1) >= 2;
	}

	canDash() {
		return !this._isDying && $gameVariables.value(1) >= 3;
	}

	enableJump() {
		if(!this.canJump()) {
			$gameVariables.setValue(1, 1);
		}
	}

	disableJump() {
		$gameVariables.setValue(1, 0);
	}

	isJumpButtonTriggered() {
		return Input.isTriggeredEx("space") || Input.isTriggeredEx("button_a");
	}

	isGrappleTriggered() {
		if(TouchInput.isLeftClickTriggered()) return 1;
		if(Input.isTriggeredEx("button_x")) return 2;
		return 0;
	}

	isGrappleReleased(button) {
		if(button === 1) {
			return TouchInput.isLeftClickReleased();
		} else if(button === 2) {
			return Input.isReleasedEx("button_x");
		}
		return true;
	}

	isDashTriggered() {
		if(TouchInput.isRightClickTriggered()) return 1;
		if(Input.isTriggeredEx("button_l")) return 2;
		if(Input.isTriggeredEx("button_r")) return 3;
		return 0;
	}

	isDashReleased(button) {
		if(button === 1) {
			return TouchInput.isRightClickReleased();
		} else if(button === 2) {
			return Input.isReleasedEx("button_l");
		} else if(button === 3) {
			return Input.isReleasedEx("button_r");
		}
		return false;
	}

	updateJump() {
		if(this.canJump()) {
			if(this.position.z <= 0) {
				this._jumpHelp = 6;
			} else if(this._jumpHelp > 0) {
				this._jumpHelp--;
			}
			if(this.isJumpButtonTriggered()) {
				this._triggerHelp = 4;
			} else if(this._triggerHelp > 0) {
				this._triggerHelp--;
			}
			if(this._triggerHelp > 0 && this._jumpHelp > 0) {
				this.doJump();
				this._triggerHelp = 0;
				this._jumpHelp = 0;
			}
		}
	}

	doJump() {
		this._didJumpThisFrame = true;
		this.speed.z = this.JUMP_POWER;
		ESPAudio.jump();
	}

	checkInitialConnections() {
		if(this._connectionCandidates) {
			if(this.IsGrappling) {
				this._connectionCandidates.sort((a, b) => {
					if(!a.___playerDist) a.___playerDist = this.getDistance(a);
					if(!b.___playerDist) b.___playerDist = this.getDistance(b);
					return a.___playerDist - b.___playerDist;
				});
				const len = Math.min(this._connectionCandidates.length, 3);
				for(let i = 0; i < len; i++) {
					this._connectionCandidates[i].___playerDist = null;
					if(this._connectionCandidates[i].isSelfMoved() || !this._hasBox) {
						this.actuallyConnect(this._connectionCandidates[i]);
					}
				}
				if(this._connectionCandidates.length > 3) {
					for(let i = 3; i < this._connectionCandidates.length; i++) {
						this._connectionCandidates[i].___playerDist = null;
					}
				}
				ESPAudio.grappleOpen();
			}
			this._connectionCandidates = null;
		}
	}

	updateAbilities() {
		if($gameTemp.isPlaytest()) {
			if(Input.isTriggeredEx("button_y")) {
				this.position.x += this.speed.x * 20;
				this.position.y += this.speed.y * 20;
			}
		}

		if(this.canGrapple()) {
			if(!this.IsGrappling && !SceneManager._scene._spriteset._tilemap._espPlayer.isWebAmmoOut()) {
				this._grappleButton = this.position.z <= 0 ? this.isGrappleTriggered() : 0;
				if(this._grappleButton !== 0) {
					this._connectionCandidates = [];
					this.IsGrappling = true;
				}
			} else {
				const grappleReleased = this.isGrappleReleased(this._grappleButton);
				if(this.position.z > 0 || grappleReleased) {
					if(grappleReleased && this._connections.length > 0) {
						ESPAudio.grappleRelease();
					}
					this._grappleButton = 0;
					this.IsGrappling = false;
					this.disconnectAll();
				} else {
					this.updateConnections();
				}
			}
		}

		this.updateDash();
	}

	updateDash() {
		if(this.canDash()) {
			this.updateDashDirection();
			if(this._dashDirection !== null && this._awaitingDashDirection) {
				this._awaitingDashDirection = false;
				this.startDash();
			}
			if(!this.IsDashCharging) {
				if(!this._dashChargeObject) {
					this._dashButton = this.isDashTriggered();
					if(this._dashButton !== 0) {
						this.IsDashCharging = true;
						if(this._dashDirection === null) {
							this._awaitingDashDirection = true;
						} else {
							this.startDash();
						}
					}
				}
			} else {
				const dashReleased = this.isDashReleased(this._dashButton);
				if(dashReleased) {
					if(this._awaitingDashDirection) {
						this._awaitingDashDirection = false;
					} else {
						this.releaseDash();
					}
				} else {
					this.incrementDashTime();
					this.updateDashObject();
				}
			}
			this.updatePostDashShoot();
		}
	}

	updateDashDirection() {
		let radians = null;
		if(this._dashButton === 1) {
			const pos = SceneManager._scene._spriteset._espPlayer.getGlobalPosition();
			radians = Math.atan2(TouchInput.y - pos.y, TouchInput.x - pos.x);
		} else if(Math.abs($espGamePlayer.speed.x) > 0.2 || Math.abs($espGamePlayer.speed.y) > 0.2) {
			radians = Math.atan2($espGamePlayer.speed.y, $espGamePlayer.speed.x);
		}
		if(radians !== null && this._dashDirection !== radians) {
			this._dashDirection = radians;
		}
	}

	startDash() {
		this.destroyDashObject();

		this._webDashAimTime = 0;
		this._webChargeAmount = 0;

		if(this._dashChargeString) {
			this._dashChargeString.visible = true;
			this._dashChargeString.alpha = 1;
		}

		this._dashChargeObject = new ESPWebShotObject();
		this._dashChargeObject.position.z = 18;
		$gameMap.addGameObject(this._dashChargeObject);
		this.updateDashObject(true);
	}

	releaseDash() {
		this._dashButton = 0;
		this.IsDashCharging = false;

		if(this._dashChargeObject._visible) {
			ESPAudio.webDeviceAttach();
			this._shootDirection = this._dashDirection;
			this._dashChargeObject.shoot(Math.cos(this._dashDirection) * 10, Math.sin(this._dashDirection) * 10, this._webChargeAmount);
		} else {
			this.destroyDashObject();
		}
	}

	incrementDashTime() {
		if(this._dashChargeObject?._visible) {
			this._webDashAimTime++;
		}
	}

	updateDashObject(force) {
		if(!this._dashChargeObject) return;

		const was99 = this._dashChargeObject.CollisionHeight >= 99;
		if(was99) { this._dashChargeObject.CollisionHeight = 0; }

		if(this._webDashAimTime === 6) {
			ESPAudio.webDashChargeStart();
		}

		this.updateDashObjectChargePosition(force);
		this.updateDashObjectChargeRotation();
		this.updateDashChargeAmount();
		this.updateDashObjectVisibility(was99);
		this.refreshDashString();
	}

	updateDashObjectChargePosition(force) {
		const r = this._webDashAimTime > 10 ? 1 : Easing.easeOutCubic(this._webDashAimTime / 10);
		this._dashChargeObjectX = (this.position.x + Math.cos(this._dashDirection) * 40 * r) - 4;
		this._dashChargeObjectY = this.position.y + (Math.sin(this._dashDirection) * 40 * r) * 0.7;
		this._dashChargeObjectZ = this.position.z + (TS * (this.CollisionHeight - this._dashChargeObject.CollisionHeight)) + 18 + (Math.sin(this._webDashAimTime / 5) * 3);
		if(force || !this._dashChargeObject._visible) {
			this._dashChargeObject.position.x = this._dashChargeObjectX;
			this._dashChargeObject.position.y = this._dashChargeObjectY;
			this._dashChargeObject.position.z = this._dashChargeObjectZ;
		} else {
			this._dashChargeObject.position.x = ESP.lerp(this._dashChargeObjectX, this._dashChargeObject.position.x, 0.7);
			this._dashChargeObject.position.y = ESP.lerp(this._dashChargeObjectY, this._dashChargeObject.position.y, 0.7);
			this._dashChargeObject.position.z = ESP.lerp(this._dashChargeObjectZ, this._dashChargeObject.position.z, 0.7);
		}
	}

	updateDashObjectChargeRotation() {
		this._dashChargeObject.addSpriteRotation(0.06);
	}

	updateDashChargeAmount() {
		const newChargeAmount = this._webDashAimTime > 80 ? 2 : (this._webDashAimTime > 40 ? 1 : 0);
		if(this._webChargeAmount !== newChargeAmount) {
			this._webChargeAmount = newChargeAmount;
			if(newChargeAmount === 1) {
				ESPAudio.webDashChargeMid();
			} else if(newChargeAmount === 2) {
				ESPAudio.webDashChargeFinal();
			}
		}
		this._dashChargeObject._spr._mainParticle.setIndex(this._webChargeAmount === 1 ? 2 : (this._webChargeAmount === 2 ? 1 : 3));
	}

	updateDashObjectVisibility(was99) {
		this._dashChargeObject.setVisible(!was99 && this._dashChargeObject.CollisionHeight <= this.CollisionHeight);
		if(this._dashChargeString) this._dashChargeString.visible = this._dashChargeObject._visible;
		this._dashChargeObject._spr.update();
	}

	refreshDashString() {
		if(!this._dashChargeString) {
			this._dashChargeString = new PIXI.Graphics();
			SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.addChild(this._dashChargeString);
		}

		if(!this._dashChargeString.visible) return;
		
		this._dashChargeString.clear();
		this._dashChargeString.lineStyle(2, 0xffffff, 0.8);

		let startX = 0;
		let startY = -20 + SceneManager._scene._spriteset._tilemap._espPlayer.BodySprite.y;
		if(this._dashChargeObject && this._dashChargeObject._downMode) {
			this._dashChargeString.alpha = this._dashChargeObject.alpha;
		}
		this._dashChargeString.moveTo(startX, startY);

		let x = 0;
		let y = 0;
		let z = 0;
		if(this._dashTargetX) {
			x = this._dashTargetX + this._dashTargetDisplayX;
			y = this._dashTargetY;
			z = this._dashTargetZ;
		} else if(this._dashChargeObject) {
			x = this._dashChargeObject.position.x;
			y = this._dashChargeObject.position.y;
			z = this._dashChargeObject.realZ();
		}

		let offsetX = 0;
		let offsetY = 0;
		if(this._dashChargeObject && this._dashChargeObject._shooting && this._dashChargeObject._spr._mainParticle.Index >= 6) {
			offsetX = Math.cos(this._shootDirection) * 10;
			offsetY = Math.sin(this._shootDirection) * 10;
		}

		this._dashChargeString.lineTo((x + 4) - this.position.x + offsetX, (y - (z - this.realZ()) - 6) - this.position.y + offsetY);
	}

	updatePostDashShoot() {
		if(this._dashChargeObject) {
			this.refreshDashString();
		}
	}

	destroyDashObject() {
		if(this._dashChargeObject) {
			$gameMap.removeGameObject(this._dashChargeObject);
			this._dashChargeObject = null;
		}
		if(this._dashChargeString) {
			this._dashChargeString.clear();
			this._dashChargeString.visible = false;
		}
	}

	destroyDashString() {
		if(this._dashChargeString) {
			SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.removeChild(this._dashChargeString);
			this._dashChargeString.destroy();
			this._dashChargeString = null;
		}
	}

	endDashShot() {
		if(this._dashChargeObject) {
			this._dashChargeObject.enterDownMode();
		}
	}

	connectTheDash(direction) {
		if(this.canConnectDash()) {
			this.setupDashTargetPositions(direction);
			ESPAudio.webDashHitWall();
			this.createDashAfterImageBitmap();
			this.createDashAfterImageArray();
			this.createDashInitialAfterImage();
		}
		this.destroyDashObject();
	}

	canConnectDash() {
		return this._dashChargeObject && this._dashChargeObject.CollisionHeight <= this.CollisionHeight;
	}

	setupDashTargetPositions(direction) {
		this._dashTargetDisplayX = (direction === 4 ? -30 : (direction === 6 ? 30 : 0));
		this._dashTargetX = this._dashChargeObject.position.x;
		this._dashTargetY = this._dashChargeObject.position.y;
		this._dashTargetZ = this.position.z;

		this._dashOriginalX = this.position.x;
		this._dashOriginalY = this.position.y;
	}

	createDashAfterImageBitmap() {
		if(this._dashBitmap) {
			this._dashBitmap.destroy();
			this._dashBitmap = null;
		}
		SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.visible = false;
		this._dashBitmap = Bitmap.snap(SceneManager._scene._spriteset._tilemap._espPlayer);
		SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.visible = true;
	}

	createDashAfterImageArray() {
		if(!this._dashSprites) {
			this._dashSprites = [];
		}
	}

	createDashInitialAfterImage() {
		this.createDashAfterImage(99999);
		this._placedDashSprite = false;
	}

	destroyAllDashSprites() {
		if(this._dashSprites) {
			while(this._dashSprites.length > 0) {
				const s = this._dashSprites[0];
				this._dashSprites.splice(0, 1);
				SceneManager._scene._spriteset._tilemap._uiHolder.removeChild(s);
				s.destroy();
			}
		}
	}

	clearGrappling() {
		this.disconnectAll();
		this._connectionCandidates = null;
		this.IsGrappling = false;
		this._grappleButton = 0;
	}

	updateFalling() {
		if(this._isDying) return;
		if(this.speed.z > -10) {
			this.speed.z -= (this.GRAVITY * ESP.WS);
		}
	}

	updateTransition() {
		if(this.canControl() && this._canTransition && !$gameMap._isTranferring) {
			const x = this.position.x;
			const y = this.displayY();
			let dir = null;
			const Threshold = 3;
			if(y - this.rectHeight() <= Threshold) {
				dir = "up";
			} else if(y + ((this.CollisionHeight - 1).clamp(0, 99) * TS) + this.rectHeight() >= (($gameMap.MapBottom * TS) - Threshold)) {
				dir = "down";
			} else if(x - this.rectWidth() <= Threshold) {
				dir = "left";
			} else if(x + this.rectWidth() >= ($gameMap.width() * TS) - Threshold) {
				dir = "right";
			}
			if(dir !== null && $gameMap.onPlayerLeaveMap(dir, this.CollisionHeight + (this.position.z > TS * 2 ? Math.floor(this.position.z / TS) : 0))) {
				this._canControl = false;
				this.CanCollide = false;
				this.clearGrappling();
				this.destroyDashObject();
				this.destroyDashString();
				this.destroyDashData();
			}
		}
	}

	updateDeathTiles() {
		if(!this._isDying && !$gameMap._isTransferring && (this.findKill() - 1) >= this.CollisionHeight && this.position.z <= 0) {
			this.kill(0, 0, 60);
		}
	}

	updateDying() {
		this.updateDeathAnimation1();
		this.updateDeathAnimation2();
	}

	updateDeathAnimation1() {
		if(this._isDying && this._deathAnimationData) {
			const maxTime = 40;
			const ratio = this._deathAnimationData.time / maxTime;

			this._spriteRotation = 6 * Easing.easeOutCubic(ratio) * (this._deathAnimationData.x < 0 ? -1 : 1);

			if(!this._customColor) this._customColor = [0, 0, 0, 0];
			this._customColor[0] = this._customColor[1] = this._customColor[2] = (255 * ratio);

			const easeRatio = Easing.easeOutCubic(ratio);
			this.speed.x = (this._deathAnimationData.baseX + (this._deathAnimationData.x * easeRatio)) - this.position.x;
			this.speed.y = (this._deathAnimationData.baseY + (this._deathAnimationData.y * easeRatio)) - this.position.y;
			this.speed.z = (this._deathAnimationData.z * easeRatio) - this._deathAnimationData.totalZ;
			this._deathAnimationData.totalZ += this.speed.z;

			if(this._deathAnimationData.time < maxTime) {
				this._deathAnimationData.time++;
			} else if(!this._deathParticles) {
				this.onDeathAnimation1End();
			}
		}
	}

	updateDeathAnimation2() {
		if(this._deathParticles) {
			const len = this._deathParticles.length;
			for(let i = 0; i < len; i++) {
				this._deathParticles[i].update();
			}
			if(this._deathParticles.filter(p => !p.isComplete()).length === 0) {
				this.onDeathAnimationComplete();
				this._deathParticles = null;
			}
		}
	}

	onDeathAnimation1End() {
		const animationSpeed = 6;
		const speedX = 1;
		const speedY = 1;
		this._deathParticles = [];
		this._isVisible = false;
		for(let i = -1; i <= 1; i++) {
			for(let j = -1; j <= 1; j++) {
				if(i === 0 && j === 0) continue;
				const x = speedX * i;
				const y = speedY * j;
				const mag = Math.sqrt(x * x + y * y);
				const obj = new ESPParticleObject(x / mag, (y / mag) - (0.3 * j), animationSpeed);
				this._deathParticles.push(obj);
				obj.position.set(this.position);
				obj.CollisionHeight = this.CollisionHeight;
				$gameMap.addGameObject(obj);
			}
		}
		this._deathAnimationData = null;
		this._isDying = true;
		ESPAudio.deathExplode();
	}

	onDeathAnimationComplete() {
		$gameMap.espFadeOut();
		this.lastDeathTime = Graphics.frameCount;
	}

	kill(offsetX, offsetY, offsetZ) {
		if(!this.canKill) return;
		if(this._interpreter) {
			SceneManager._scene.setCameraToPlayer();
			this.clearInterpreter();
		}
		$gameMap.initiateKillSequence();
		$gameMap.espFreezeWorld();
		$gameMap.onPlayerKilled();
		this._isDying = true;
		this._deathAnimationData = {
			x: offsetX,
			y: offsetY,
			z: offsetZ,
			baseX: this.position.x,
			baseY: this.position.y,
			totalZ: 0,
			time: 0
		};
		this._customColor = [0, 0, 0, 0];
		this.clearGrappling();
		this.destroyDashObject();
		this.destroyAllDashSprites();
		this.destroyDashData();
		ESPAudio.deathContact();
	}

	unkill() {
		this._isDying = false;
		this._isVisible = true;
		this._spriteRotation = 0;
		this._customColor = null;
		this._deathAnimationData = null;
		this._deathParticles = null;
		this.speed.z = 0;
		this.position.z = 0;
		$gameMap.resetESPGame();
	}

	isJumping() {
		return this.position.z > 0 && this.speed.z > 0;
	}

	isFalling() {
		return this.position.z > 0 && this.speed.z < 0
	}

	isDying() {
		return this._isDying;
	}

	hasCustomColor() {
		return this._customColor !== null;
	}

	customColor() {
		return this._customColor;
	}

	spriteRotation() {
		return this._spriteRotation;
	}

	visible() {
		return this._isVisible;
	}

	willEncounterMovingPlatform() {
		return this.movingPlatformsExist();
	}

	saveRespawnPos(checkId) {
		this.respawnPos.x = this.position.x;
		this.respawnPos.y = this.position.y;
		this.respawnCheckId = checkId ?? 0;
		if(this.__oldRespawnPosX !== this.respawnPos.x || this.__oldRespawnPosY !== this.respawnPos.y || this.__oldMapId !== $gameMap.mapId()) {
			this.__oldRespawnPosX = this.respawnPos.x;
			this.__oldRespawnPosY = this.respawnPos.y;
			this.__oldMapId = $gameMap.mapId();
			return true;
		}
		return false;
	}

	restoreRespawnPos() {
		this.position.x = this.respawnPos.x ?? 0;
		this.position.y = this.respawnPos.y ?? 0;
		this.position.z = 0;
	}

	saveData() {
		const result = super.saveData();
		result.respawnPos = this.respawnPos;
		result.respawnCheckId = this.respawnCheckId;
		result.FlyCount = this.FlyCount;
		result.FlyData = this.FlyData;
		return result;
	}

	loadData(data) {
		super.loadData(data);
		data.respawnPos = data.respawnPos ?? {};
		this.respawnPos = { x: data.respawnPos.x ?? 0, y: data.respawnPos.y ?? 0 };
		this.respawnCheckId = data.respawnCheckId ?? 0;
		this.FlyCount = data.FlyCount ?? 0;
		this.FlyData = data.FlyData ?? {};
	}

	shadowify() {
		return true;
	}

	flies() {
		return this.FlyCount;
	}

	incrementFlies(id) {
		this.FlyCount++;
		this.FlyData[id] = true;
	}

	hasFlyBeenEaten(id) {
		return !!this.FlyData[id];
	}

	setInterpreter(interpreter) {
		this._interpreter = interpreter;
		Input._ESP_isDisabled = true;
	}

	clearInterpreter() {
		this._interpreter = null;
		Input._ESP_isDisabled = false;
	}

	updateConnections() {
		for(let i = 0; i < this._connections.length; i++) {
			const obj = this._connections[i];
			if(obj._isDead) {
				this.disconnect(obj);
				i--;
				continue;
			}

			let ratio = 1;
			if(this._connectTime[i] > 0) {
				this._connectTime[i]--;
			} else {
				this._connectTime[i]++;
				ratio = Easing.easeOutCubic(1 - ((-this._connectTime[i]) / 12));
				if(this._connectTime[i] >= 0) {
					ratio = 1;
					this._connectTime[i] = 40000;
				}
			}

			const graphics = this._graphics[i];
			graphics.clear();
			graphics.lineStyle(2, 0xffffff, 0.8);
			graphics.moveTo(0, -20 + SceneManager._scene._spriteset._tilemap._espPlayer.BodySprite.y);

			const desiredDistance = this._distances[i];

			if(ratio < 1) {
				const r = ratio.clamp(0, 1);
				const radians = Math.atan2(obj.position.y - this.position.y, obj.position.x - this.position.x);
				const dist = obj.isSelfMoved() ? desiredDistance : obj.getDistance2d(this);
				const x = (Math.cos(radians) * (dist * r));
				const y = (Math.sin(radians) * (dist * r));
				graphics.lineTo(x, y + obj.attachOffsetY());
			} else {
				graphics.lineTo(obj.position.x - this.position.x, (obj.position.y + obj.attachOffsetY()) - this.position.y);
			}

			if(Math.abs(obj.realZ() - this.realZ()) >= 12) {
				this.disconnect(obj);
			} else if(this._connectTime[i] === 0) {
				this.disconnect(obj);
				obj.onCollided();
			} else if(obj.isSelfMoved()) {
				const newX = obj.position.x + obj.speed.x;
				const newY = obj.position.y + obj.speed.y;
				const newDist = Math.sqrt(
					Math.pow(newX - this.position.x, 2) +
					Math.pow(newY - this.position.y, 2)
				);
				if(newDist > desiredDistance) {
					const radians = Math.atan2(this.position.x - newX, this.position.y - newY);
					const spdX = (this.position.x + -Math.sin(radians) * desiredDistance) - obj.position.x;
					const spdY = (this.position.y + -Math.cos(radians) * desiredDistance) - obj.position.y;
					const result = Vector2.normalized(spdX, spdY, this._speed[i]);
					obj.speed.x = result.x;
					obj.speed.y = result.y;
				} else {
					this._distances[i] = newDist;
				}
			}
		}
	}

	isConnectedTo(obj) {
		return this._connections.contains(obj);
	}

	connectionCount() {
		return this._connections ? this._connections.length : 0;
	}

	maxConnections() {
		return 3;
	}

	connect(obj) {
		if(this._connections.length >= this.maxConnections()) {
			return;
		}

		if(!obj.isSelfMoved() && this._hasBox) return;

		if(Math.abs(obj.realZ() - this.realZ()) < 12) {
			if(this._connectionCandidates) {
				this._connectionCandidates.push(obj);
			} else {
				this.actuallyConnect(obj);
			}
		}
	}
	
	actuallyConnect(obj) {
		this._connections.push(obj);

		this._distances.push(this.getDistance2d(obj));

		this._connectTime.push(-12);

		this._speed.push(Vector2._length(obj.speed.x, obj.speed.y));

		if(!obj.isSelfMoved()) this._hasBox = obj;

		const graphics = new PIXI.Graphics();
		SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.addChild(graphics);
		this._graphics.push(graphics);

		ESPAudio.webDeviceAttach(75);
	}

	disconnect(obj, noSound) {
		const index = this._connections.indexOf(obj);
		this._connections.remove(obj);

		this._distances.splice(index, 1);
		this._connectTime.splice(index, 1);
		this._speed.splice(index, 1);

		if(!obj.isSelfMoved()) this._hasBox = null;

		const graphics = this._graphics[index];
		SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.removeChild(graphics);
		this._graphics.remove(graphics);
		graphics.destroy();

		if(!noSound) {
			ESPAudio.grappleRelease()
		}
	}

	disconnectAll() {
		while(this._connections.length > 0) {
			this.disconnect(this._connections[0], true);
		}
	}
}
