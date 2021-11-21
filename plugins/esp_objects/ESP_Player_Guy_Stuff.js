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

		this.NomiCount = 0;
		this.TempNomiCount = 0;
		this.NomiData = [];
		this.OldNomiCount = 0;
		this.OldNomiData = [];

		this.Shields = 0;
		this.ShieldData = {};
		this.OldShieldCount = 0;
		this.OldShieldData = {};

		this.InventoryOpen = false;
		this.Items = [];
		this.OldItems = this.Items.slice();
		this.StoreData = {};
		this.OldStoreData = {};
		this._totalItems = [];
		this._itemSelectIndex = 0;

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
		this._invincibilityTime = 0;
		this._checkLandParticles = 0;
		this._nomiDrawDistanceBuffTime = -1;
		this._abilityTime = 0;
		this._abilityId = 0;

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

	canControlAndInvClosed() {
		return this.canControl() && !this.isInventoryOpen();
	}

	update() {
		this._didJumpThisFrame = false;
		this.updateInterpreter();
		this.updatePlayerControl();
		if(!this.updateDashMovement()) {
			this.updateInput();
			this.updateFalling();
			super.update();
			this.updateGroundHitResponse();
			this.updateDeathTiles();
		}
		this.updateTransition();
		this.updateInvincibility();
		this.updateDying();
		this.updateTempUpdater();
	}

	updateDashMovement() {
		if(this._isDying) return false;

		this.updateDashAfterImageAlpha();

		if(this.isDashing()) {
			this.position.x = ESP.lerp(this.position.x, this._dashTargetX, 0.3);
			this.position.y = ESP.lerp(this.position.y, this._dashTargetY, 0.3);

			//if(this._dashChargeString) this._dashChargeString.visible = false;
			if(this._dashChargeObject) this._dashChargeObject.string().visible = false;

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
		return !!this._dashTargetX;
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
			SceneManager._scene._spriteset._tilemap._espPlayer.updatePosition();
			spr.x = SceneManager._scene._spriteset._tilemap._espPlayer.x - 100;
			spr.y = SceneManager._scene._spriteset._tilemap._espPlayer.y - 100;
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
		this.speed.z = this._webChargeAmount === 2 ? 5.5 : (this._webChargeAmount === 1 ? 3 : 0);
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
			this.updateInventory();
		}
	}

	isOnPlatformOrIce() {
		return this._currentlyOnIce || this._currentMovingPlatform;
	}

	updateMovement() {
		if(!this._footstepInterval) this._footstepInterval = 14;
	
		this._currentlyOnIce = this.findSlide();

		let spd = (this._hasBox?.isPulling?.(this) ? 1.5 : 3) * (this._currentlyOnIce ? 1.2 : 1);

		if(this.isInventoryOpen()) {
			spd = 0;
		}

		let spdX = Input.InputVector.x * spd;
		let spdY = Input.InputVector.y * spd;

		if(this._currentlyOnIce) {
			spdX = ESP.lerp(this.speed.x, spdX, 0.01);
			spdY = ESP.lerp(this.speed.y, spdY, 0.01);
		}

		this.speed.x = spdX;
		this.speed.y = spdY;

		if(!this.isInventoryOpen() && this.canControl() && this.position.z === 0 && Input.InputVector.length() > 0.1 && (Graphics.frameCount % (Input.InputVector.length() > 0.5 ? 14 : 20)) === 0) {
			AudioManager.playSe({
				name: this.isOnPlatformOrIce() ? "Footstep2" : $gameMap.FootstepSound(),
				volume: 20 + (Math.random() * 40),
				pitch: 75 + (Math.random() * 50),
				pan: 0
			});


			if(this.shouldReleaseFootParticles()) {
				SceneManager._scene._spriteset._tilemap._espPlayer.dropWalkParticle();
			}
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
		return !this.isInventoryOpen() && (Input.isTriggeredEx("space") || Input.isTriggeredEx("button_a"));
	}

	isGrappleTriggered() {
		if(this.isInventoryOpen()) return 0;
		if(TouchInput.isLeftClickTriggered()) return 1;
		if(Input.isTriggeredEx("button_x")) return 2;
		return 0;
	}

	isGrappleReleased(button) {
		if(this.isInventoryOpen()) return true;
		if(button === 1) {
			return TouchInput.isLeftClickReleased();
		} else if(button === 2) {
			return Input.isReleasedEx("button_x");
		}
		return true;
	}

	isDashTriggered() {
		if(this.isInventoryOpen()) return 0;
		if(TouchInput.isRightClickTriggered()) return 1;
		if(Input.isTriggeredEx("button_l")) return 2;
		if(Input.isTriggeredEx("button_r")) return 3;
		return 0;
	}

	isDashReleased(button) {
		if(this.isInventoryOpen()) return true;
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
		SceneManager._scene._spriteset._tilemap._espPlayer.showJumpParticles();
	}

	onGroundHit() {
		super.onGroundHit();
		if(!this._checkLandParticles) {
			this._checkLandParticles = 5;
		}
	}

	updateGroundHitResponse() {
		if(this._checkLandParticles > 0) {
			this._checkLandParticles--;
			if(!this.shouldReleaseFootParticles()) {
				this._checkLandParticles = 0;
			} else if(this._checkLandParticles < 3) {
				SceneManager._scene._spriteset._tilemap._espPlayer.showLandParticles();
				this._checkLandParticles = 0;
			}
		}
	}

	checkInitialConnections() {
		if(this._connectionCandidates) {
			if(this.IsGrappling) {
				this._connectionCandidates.sort((a, b) => {
					if(!a.___playerDist) a.___playerDist = this.getDistance(a);
					if(!b.___playerDist) b.___playerDist = this.getDistance(b);
					return a.___playerDist - b.___playerDist;
				});
				const len = Math.min(this._connectionCandidates.length, this.maxConnections());
				for(let i = 0; i < len; i++) {
					this._connectionCandidates[i].___playerDist = null;
					if(this._connectionCandidates[i].isSelfMoved() || !this._hasBox) {
						this.actuallyConnect(this._connectionCandidates[i]);
					}
				}
				const m = this.maxConnections();
				if(this._connectionCandidates.length > m) {
					for(let i = m; i < this._connectionCandidates.length; i++) {
						this._connectionCandidates[i].___playerDist = null;
					}
				}
				ESPAudio.grappleOpen();
			}
			this._connectionCandidates = null;
		}
	}

	updateAbilities() {
		/*
		if($gameTemp.isPlaytest()) {
			if(Input.isTriggeredEx("button_y")) {
				this.position.x += this.speed.x * 20;
				this.position.y += this.speed.y * 20;
			}
		}
		*/

		this.updateGrapple();
		this.updateDash();
		this.updateTempAbilities();
	}

	updateGrapple() {
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
	}

	webShotDistanceRatio() {
		const f = this.flies();
		if(f >= 20) {
			return 1 + (f * 0.05);
		}
		return 1 + (f * 0.025);
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
			const pos = SceneManager._scene._spriteset._espPlayer.PlayerHolder.getGlobalPosition();
			radians = Math.atan2(TouchInput.y - pos.y, TouchInput.x - pos.x);
		} else {
			if(Math.abs(Input.rightStickX()) > 0.6 || Math.abs(Input.rightStickY()) > 0.6) {
				radians = Math.atan2(Input.rightStickY(), Input.rightStickX());
			} else if(this._currentlyOnIce) {
				if(Math.abs(Input.InputVector.x) > 0.06 || Math.abs(Input.InputVector.y) > 0.06) {
					radians = Math.atan2(Input.InputVector.y, Input.InputVector.x);
				}
			} else if(Math.abs($espGamePlayer.speed.x) > 0.2 || Math.abs($espGamePlayer.speed.y) > 0.2) {
				radians = Math.atan2($espGamePlayer.speed.y, $espGamePlayer.speed.x);
			}
		}

		if(radians !== null && this._dashDirection !== radians) {
			this._dashDirection = radians;
		}
	}

	currentGrappleAbility() {
		if(this._abilityTime > 0) {
			return this._abilityId;
		}
		return 0;
	}

	isNormalGrappleDash() {
		return this.currentGrappleAbility() === 0;
	}

	isTeleportGrappleDash() {
		return this.currentGrappleAbility() === 3;
	}

	startDash() {
		this.destroyDashObject();

		this._webDashAimTime = 0;
		this._webChargeAmount = 0;

		/*
		if(this._dashChargeString) {
			this._dashChargeString.visible = true;
			this._dashChargeString.alpha = 1;
		}*/

		this._dashChargeObject = new ESPWebShotObject();
		this._dashChargeObject.position.z = 18;
		$gameMap.addGameObject(this._dashChargeObject);
		this.updateDashObject(true);
	}

	releaseDash() {
		this._dashButton = 0;
		this.IsDashCharging = false;

		if(this._dashChargeObject && this._dashChargeObject._visible) {
			const ability = this.currentGrappleAbility();
			if(ability === 0) {
				if(this.position.z > 0) this.speed.z = 2;
				ESPAudio.webDeviceAttach();
				this._shootDirection = this._dashDirection;
				this._dashChargeObject.shoot(Math.cos(this._dashDirection) * 10, Math.sin(this._dashDirection) * 10, this._webChargeAmount);
			} else if(ability === 1 || ability === 2) {
				const normal = this._webChargeAmount < 2;
				const fireball = new (ability === 1 ? ESPFireballObject : ESPIceballObject)(true, 3);
				fireball.setOwner(this);
				fireball.cannotHurtPlayer();
				fireball.CollisionHeight = this.CollisionHeight;
				const dirX = Math.cos(this._dashDirection);
				const dirY = Math.sin(this._dashDirection);
				const spd = (normal ? 1 + this._webChargeAmount : 5);
				fireball.speed.set(dirX * spd, dirY * spd, 0);
				$gameMap.addGameObject(fireball, this.position.x + (dirX * 40), this.position.y + (dirY * 40), this.position.z + 20);
				this._dashChargeObject.setTargetMode(fireball.position.x, fireball.position.y, fireball.position.z - 6);
				this.freeDashObject();
				this._usedAbility = 10;
				if(this._abilityTime < 0) this._abilityTime = 0;
				//this.destroyDashObject();
			} else if(ability === 3) {
				if(this.position.z > 0) this.speed.z = 2;
				ESPAudio.webDeviceAttach();
				this._shootDirection = this._dashDirection;
				this._dashChargeObject.shoot(Math.cos(this._dashDirection) * 20, Math.sin(this._dashDirection) * 20, this._webChargeAmount, true);
			}
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
			this._webDashAimTime++;
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
		this._dashChargeObject.addSpriteRotation(this.currentGrappleAbility() === 3 ? 0.2 : 0.06);
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
		this._dashChargeObject.setVisible(!was99 && this.canConnectDash());
		//if(this._dashChargeString) this._dashChargeString.visible = this._dashChargeObject._visible;
		this._dashChargeObject._spr.update();
	}

	refreshDashString() {
		/*if(!this._dashChargeString) {
			this._dashChargeString = new PIXI.Graphics();
			SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.addChild(this._dashChargeString);
		}*/

		if(!this._dashChargeObject || !this._dashChargeObject.string().visible) return;
		
		if(this.isNormalGrappleDash()) {
			this._dashChargeObject.string().clear();
			this._dashChargeObject.string().lineStyle(2, 0xffffff, 0.8);

			let offsetX = 0;
			let offsetY = 0;
			if(this._dashChargeObject && this._dashChargeObject._shooting && this._dashChargeObject._spr._mainParticle.Index >= 6) {
				offsetX = Math.cos(this._shootDirection) * 10;
				offsetY = Math.sin(this._shootDirection) * 10;
			}

			let startX = 0;
			let startY = 0;//-20;// + SceneManager._scene._spriteset._tilemap._espPlayer.BodySprite.y;
			if(this._dashChargeObject && this._dashChargeObject._downMode) {
				this._dashChargeObject.string().alpha = this._dashChargeObject.alpha;
			}
			this._dashChargeObject.string().moveTo(startX + offsetX, startY + offsetY);

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

			this._dashChargeObject.string().lineTo(this.position.x - (x + 4), this.position.y - 20 + SceneManager._scene._spriteset._tilemap._espPlayer.BodySprite.y - (y - (z - this.realZ()) - 6));
		}
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
		/*
		if(this._dashChargeString) {
			this._dashChargeString.clear();
			this._dashChargeString.visible = false;
		}*/
	}

	freeDashObject() {
		this._dashChargeObject = null;
	}

	destroyDashString() {
		/*
		if(this._dashChargeString) {
			SceneManager._scene._spriteset._tilemap._espPlayer._webHolder.removeChild(this._dashChargeString);
			this._dashChargeString.destroy();
			this._dashChargeString = null;
		}*/
	}

	endDashShot() {
		if(this._dashChargeObject) {
			this._dashChargeObject.enterDownMode();
		}
	}

	connectTheDash(direction) {
		if(this.isNormalGrappleDash()) {
			if(this.canConnectDash()) {
				this.setupDashTargetPositions(direction);
				ESPAudio.webDashHitWall();
				this.createDashAfterImageBitmap();
				this.createDashAfterImageArray();
				this.createDashInitialAfterImage();
			}
		} else if(this.isTeleportGrappleDash()) {
			this.position.x = this._dashChargeObject.position.x;
			this.position.y = this._dashChargeObject.position.y;
			this.position.z = this._dashChargeObject.position.z;
			this.CollisionHeight = this._dashChargeObject.CollisionHeight;
			this.updatePosition();
		}
		this.destroyDashObject();
	}

	canConnectDash() {
		return this._dashChargeObject && (
			this._dashChargeObject.CollisionHeight <= this.CollisionHeight ||
			this._dashChargeObject.CollisionHeight <= (this.CollisionHeight + Math.floor(this.position.z / TS))
		);
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

		const tilemap = SceneManager._scene._spriteset._tilemap;
		tilemap._espPlayer._webHolder.visible = false;
		tilemap._espPlayer.move(100, 100);
		this._dashBitmap = ESP.snap(tilemap._espPlayer, 200, 200);
		tilemap._espPlayer._webHolder.visible = true;
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

	updateTempAbilities() {
		if(this._abilityTime > 0) {
			if(this._usedAbility > 0) {
				this._usedAbility--;
				this._abilityTime -= 50;
			} else {
				this._abilityTime--;
			}
			if(this._abilityTime <= 0) {
				this.destroyDashObject();
				this._abilityId = 0;
			}
		}
	}

	isInventoryOpen() {
		return this.InventoryOpen;
	}

	canOpenInventory() {
		return this.position.z === 0 && !this.IsGrappling && (!this.IsDashCharging || !this._dashChargeObject) && !this._isDying;
	}

	closeInventory() {
		this.InventoryOpen = false;
	}

	openInventory() {
		ESPAudio.inventoryOpen();
		this.InventoryOpen = true;
		this._itemSelectIndex = 0;
		this._totalItems = this._calcTotalItems();
		this.clearInfoText();
	}

	updateInventory() {
		if(this._confirmedItemId) {
			return;
		}
		const buttonPressed = Input.isTriggeredEx("e") || Input.isTriggeredEx("button_y");
		if(!this.InventoryOpen) {
			if(this.canOpenInventory() && buttonPressed) {
				this.openInventory();
			}
		} else {
			if(buttonPressed || Input.isTriggeredEx("button_b")) {
				this.closeInventory();
				ESPAudio.inventoryClose();
			} else if(Input.isOkTriggeredForGameplay()) {
				this.InventoryOpen = false;
				if(this._totalItems.length > 0) {
					ESPAudio.inventoryConfirm();
					this._confirmedItemId = this._totalItems[this._itemSelectIndex];
					if(this.Items[this._confirmedItemId]) {
						if(ESPItem.items?.[this._confirmedItemId]?.useOnce) {
							this.Items[this._confirmedItemId]--;
						}
					}
				} else {
					ESPAudio.inventoryClose();
				}
				// do item thing
			} else if(this._totalItems.length > 1) {
				if(Input.menuRightRepeated()) {
					ESPAudio.cursor();
					this._itemSelectIndex++;
					if(this._itemSelectIndex >= this._totalItems.length) {
						this._itemSelectIndex = 0;
					}
				} else if(Input.menuLeftRepeated()) {
					ESPAudio.cursor();
					this._itemSelectIndex--;
					if(this._itemSelectIndex < 0) {
						this._itemSelectIndex = this._totalItems.length - 1;
					}
				}
			}
		}
		/*this.InventoryOpen = false;
		this.Items = [];*/
	}

	_calcTotalItems() {
		let result = [];
		for(let i = 0; i < this.Items.length; i++) {
			const v = this.Items[i];
			if(v > 0) {
				for(let j = 0; j < v; j++) {
					result.push(i);
				}
			}
		}
		return result;
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
				this.clearInfoText();
			}
		}
	}

	updateDeathTiles() {
		if(!this._isDying && !$gameMap._isTransferring && (this.findKill() - 1) >= this.CollisionHeight && this.position.z <= 0) {
			this.kill(false, 0, 0, 60);
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

	kill(canShield, offsetX, offsetY, offsetZ) {
		if(!this.canKill) return;
		if(canShield && this.isInvincible()) return;

		if(canShield && this.hasShield()) {

			ESPAudio.spearsLeave();
			$gameMap.shake();
			this.removeShield();
			this.setInvincible(90);

		} else {

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
			this.InventoryOpen = false;
			this._customColor = [0, 0, 0, 0];
			this.clearGrappling();
			this.destroyDashObject();
			this.destroyAllDashSprites();
			this.destroyDashData();
			this.clearInfoText();
			this.clearColor();
			ESPAudio.deathContact();

		}
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
		result.NomiCount = this.NomiCount;
		result.NomiData = this.NomiData;
		result.Shields = this.Shields;
		result.ShieldData = this.ShieldData;
		result.Items = this.Items;
		result.StoreData = this.StoreData;
		return result;
	}

	loadData(data) {
		super.loadData(data);
		data.respawnPos = data.respawnPos ?? {};
		this.respawnPos = { x: data.respawnPos.x ?? 0, y: data.respawnPos.y ?? 0 };
		this.respawnCheckId = data.respawnCheckId ?? 0;
		this.FlyCount = data.FlyCount ?? 0;
		this.FlyData = data.FlyData ?? {};
		this.NomiCount = data.NomiCount ?? 0;
		this.NomiData = data.NomiData ?? [];
		this.Shields = data.Shields ?? 0;
		this.ShieldData = data.ShieldData ?? {};
		this.Items = data.Items ?? [];
		this.StoreData = data.StoreData ?? {};
	}

	shadowify() {
		return true;
	}

	restoreOldData() {
		this.restoreOldItemData();
		this.restoreOldNomiData();
		this.restoreOldShieldData();
	}

	storeOldData() {
		this.storeOldItemData();
		this.storeOldNomiData();
		this.storeOldShieldData();
	}

	_copyObjOfObj(obj) {
		if(!obj) return {};
		return Object.fromEntries(Object.entries(obj).map(a => [a[0], { ...a[1] }]));
	}

	restoreOldItemData() {
		this.Items = this.OldItems.slice();
		this.StoreData = this._copyObjOfObj(this.OldStoreData);
	}

	storeOldItemData() {
		this.OldItems = this.Items.slice();
		this.OldStoreData = this._copyObjOfObj(this.StoreData);
	}

	flies() {
		return this.FlyCount;
	}

	incrementFlies(id) {
		if(!this.hasFlyBeenEaten(id)) {
			this.FlyCount++;
			this.FlyData[id] = true;
			switch(this.FlyCount) {
				case 5: {
					window?.UnlockAchievement?.("fivefly");
					break;
				}
				case 10: {
					window?.UnlockAchievement?.("tenfly");
					break;
				}
				case 15: {
					window?.UnlockAchievement?.("fifteenfly");
					break;
				}
				case 20: {
					window?.UnlockAchievement?.("twentyfly");
					break;
				}
			}
		}
	}

	hasFlyBeenEaten(id) {
		return !!this.FlyData[id];
	}

	nomi() {
		return this.NomiCount;
	}

	payNomi(amount) {
		if(this.NomiCount >= amount) {
			this.NomiCount -= amount;
		}
	}

	incrementNomi(mapId, id) {
		this.NomiCount++;
		if(this.TempNomiCount < 0) this.TempNomiCount = 0;
		this.TempNomiCount++;
		this.LastNomiCollectTime = ESP.Time;
		if(typeof mapId === "number" && typeof id === "number") {
			while(this.NomiData.length <= mapId) {
				this.NomiData.push([]);
			}
			const arr = this.NomiData[mapId];
			while(arr.length <= id) {
				arr.push(0);
			}
			arr[id] = 1;
		}
	}

	addNomi(amount) {
		this.NomiCount += amount;
		if(this.TempNomiCount < 0) this.TempNomiCount = 0;
		this.TempNomiCount += amount;
		this.LastNomiCollectTime = ESP.Time;
	}

	hasNomiBeenTaken(mapId, id) {
		return this.NomiData?.[mapId]?.[id] === 1;
	}

	restoreOldNomiData() {
		this.NomiCount = this.OldNomiCount;
		this.NomiData = this.OldNomiData.map(a => a.slice());
	}

	storeOldNomiData() {
		this.OldNomiCount = this.NomiCount;
		this.OldNomiData = this.NomiData.map(a => a.slice());
	}

	nomiDrawDistance() {
		return 50 + (this.flies() * 10);
	}

	increaseNomiDrawDistance(time) {
		this._nomiDrawDistanceBuffTime = ESP.Time + time;
	}

	addTempShield(mapId, id) {
		if(this._isDying) return;
		if(!this.Shields) {
			this.Shields = 0;
		}
		this.Shields++;
		if(typeof mapId === "number" && typeof id === "number") {
			if(!this.ShieldData[mapId]) {
				this.ShieldData[mapId] = [];
			}
			const arr = this.ShieldData[mapId];
			while(arr.length <= id) {
				arr.push(0);
			}
			arr[id] = 1;
		}
	}

	shields() {
		return this.Shields;
	}

	hasShield() {
		return this.Shields > 0;
	}

	removeShield() {
		if(this.hasShield()) {
			ESPAudio.shieldBlock();
			const spr = SceneManager._scene._spriteset._espPlayer;
			spr.removeShield();
			this.Shields--;
		}
	}

	clearShields() {
		this.Shields = 0;
		SceneManager._scene._spriteset._espPlayer.removeAllShields();
	}

	hasShieldBeenTaken(mapId, id) {
		return this.ShieldData?.[mapId]?.[id] === 1;
	}

	_copyObjOfArrays(obj) {
		if(!obj) return {};
		return Object.fromEntries(Object.entries(obj).map(a => [a[0], a[1].slice()]));
	}

	restoreOldShieldData() {
		this.Shields = this.OldShieldCount;
		this.ShieldData = this._copyObjOfArrays(this.OldShieldData);
		SceneManager._scene._spriteset._espPlayer.removeAllShields();
	}

	storeOldShieldData() {
		this.OldShieldCount = this.Shields;
		this.OldShieldData = this._copyObjOfArrays(this.ShieldData);
	}

	isInvincible() {
		return this._invincibilityTime > 0;
	}

	setInvincible(time) {
		this._invincibilityTime = time;
	}

	updateInvincibility() {
		if(this.isInvincible()) {
			this._invincibilityTime--;
		}
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
		const f = this.flies();
		if(f <= 2) return 1 + f;
		return 3 + Math.floor(f / 5);
	}

	connect(obj) {
		if(this._connections.length >= this.maxConnections()) {
			return false;
		}

		if(!obj.isSelfMoved() && this._hasBox) return false;

		if(Math.abs(obj.realZ() - this.realZ()) < 12) {
			if(this._connectionCandidates) {
				this._connectionCandidates.push(obj);
			} else {
				this.actuallyConnect(obj);
			}
		}
	}
	
	actuallyConnect(obj) {
		obj?.setOwner?.(this);

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

	showFlyCount() {
		this._showFlyCount = true;
	}

	shouldShowFlyCount() {
		if(this._showFlyCount) {
			this._showFlyCount = false;
			return true;
		}
		return false;
	}

	shouldShowNomiCount() {
		if(!this.LastNomiCollectTime) {
			return false;
		}
		return (ESP.Time - this.LastNomiCollectTime) < 90;
	}

	setRemovedNomi(amount) {
		this.TempNomiCount = -amount;
		this.LastNomiCollectTime = ESP.Time - 60;
	}

	shouldReleaseFootParticles() {
		return !this.isOnPlatformOrIce();
	}

	showInfoText(text, time, fontSize = 20, isCenter = false) {
		this.__infoText = text;
		this.__infoTime = ESP.Time + time;
		this.__infoTextSize = fontSize;
		this.__infoTextCentered = isCenter;
		ESPAudio.talk();
	}

	infoText() {
		if(this.__infoTime >= ESP.Time) {
			return this.__infoText ?? "";
		}
		return null;
	}

	clearInfoText() {
		this.__infoText = "";
		this.__infoTime = -1;
	}

	onMapChangeOrRespawn() {
		this.clearInfoText();
		this.__metalCount = 0;
	}

	addItem(itemId) {
		while(this.Items.length <= itemId) {
			this.Items.push(0);
		}
		this.Items[itemId]++;
	}

	removeItem(itemId) {
		while(this.Items.length <= itemId) {
			this.Items.push(0);
		}
		if(this.Items[itemId] > 0) {
			this.Items[itemId]--;
		}
	}

	randomizeColor(isMetal) {
		if(isMetal) {
			if(!this.__metalCount) this.__metalCount = 0;
			this.__metalCount++
		}
		if(typeof this._hue !== "number" || isNaN(this._hue)) {
			this._hue = 0;
		}
		const lastHue = this._hue ?? 0;
		while((this._hue > 350 || this._hue < 10) || ((Math.abs(this._hue - lastHue)) < 20)) {
			this._hue = Math.random() * 360;
		}
	}

	clearColor() {
		this._hue = 0;
	}

	explodeColor() {
		this._hue = -1;
	}

	setFireMode(time = 5000) {
		this._abilityTime = time;
		this._abilityMaxTime = time;
		this._abilityColor = 0xc4533f;
		this._abilityId = 1;
	}

	setIceMode(time = 5000) {
		this._abilityTime = time;
		this._abilityMaxTime = time;
		this._abilityColor = 0x3f72c4;
		this._abilityId = 2;
	}

	tempAbilityRatio() {
		return 1 - (this._abilityTime / this._abilityMaxTime);
	}

	setTempUpdater(time, func) {
		this._tempUpdaterTime = time;
		this._tempUpdaterMax = time;
		this._tempUpdaterFunc = func;
	}

	updateTempUpdater() {
		if(this._tempUpdaterTime > 0) {
			const r = 1 - (this._tempUpdaterTime / this._tempUpdaterMax);
			this._tempUpdaterFunc?.(r, (this._tempUpdaterMax - this._tempUpdaterTime));
			this._tempUpdaterTime--;
			if(this._tempUpdaterTime <= 0) {
				this._tempUpdaterTime = this._tempUpdaterMax = 0;
				this._tempUpdaterFunc = null;
			}
		}
	}

	openStore(storeType) {
		let items = null;
		let advice = null;
		let initialQuote = null;
		switch(storeType) {
			case 0:
				items = [
					{ itemId: -1 },
					{ itemId: 0 },
					{ itemId: 5 },
					{ itemId: 8 },
					{ itemId: 15 },
				];
				advice = [
					"Items can be used through the inventory!",
					"Check which buttons open the inventory in the\n\"View Controls\" section of your pause menu.",
					"...",
					"It's important to save NOMI.",
					"However, since shops are infrequent and\nmost of the items will be unique for each one...",
					"... it's important to grab unique\nitems you may not see again.",
					"Don't worry, I'll always have shields available.\nSo hold off until they become a necessity.",
					"...",
					"If you use an item accidentally and lose it,\npause and select \"Restart from Checkpoint\".",
					"Your inventory will be restored to its previous state.",
					"On the reverse side, don't be afraid to use items.",
					"Even if you fail a challenge, you will just\nbe restored with all your items again.",
					"Be careful when moving to a new area, however.",
					"All active shields will be removed, and\na checkpoint save will occur automatically.",
					"...",
					"Are you having a good time?",
					"I don't have any other advice to give,\nso I'll just repeat what I said before."
				];
				break;
			case 1:
				items = [
					{ itemId: -1 },
					{ itemId: 0 },
					{ itemId: 1 },
					{ itemId: 10 },
					{ itemId: 16 },
				];
				advice = [
					"It's probably best to hold off on purchasing\nshields until it's absolutely necessary.",
					"A shop can be reached from anywhere.",
					"Just make sure there are not free shields available\nbefore purchasing my expensive ones.",
					"I don't know why I'm telling you this...",
					"...",
					"I don't get many customers.",
					"So... I don't want to lose any of them.",
					"I hope you can learn to trust me.",
					"...",
					"You should also get your legs\non my \"Shield Recycle\" tool.",
					"It will provide benefits to a skilled bug\nwho will never get hurt.",
					"Some things may be impossible to achieve without it.",
					"That's all the information I can think of.",
					"I cannot wait for your return.",
					"If you have forgetten anything, please do not worry.",
					"I will repeat what I've stated starting now."
				];
				initialQuote = "Sorry for the trouble getting here.\nThis was the best spot I could find.";
				break;
			case 2:
				items = [
					{ itemId: -1 },
					{ itemId: 0 },
					{ itemId: 7 },
					{ itemId: 6 },
					{ itemId: 18 },
				];
				advice = [
					"Do not hold on to projectiles\nfor long periods of time!",
					"Try attaching to a projectile,\nwalking towards the target,\nand releasing the projectile.",
					"This is a much safer aiming technique.",
					"Never forget!",
					"\"Becoming too attached will lead to a gash!\"",
					"...",
					"So, how has your day been?",
					"I found this fancy NOMI tracker.\nIt tracks money and friends!",
					"The issue is it's kinda useless.",
					"All spare NOMI is visible in plain sight.",
					"Though... I would not say the same about flies.",
					"This tool's utility depends on the user.",
					"...",
					"Have you tried body paint?",
					"It would be better if it didn't reset on respawn.",
					"I don't even know what that means, but that\nstill won't stop me from disliking that aspect.",
					"I'm going to repeat everything now.",
					"Please talk to me as much as you need."
				];
				initialQuote = "I hope you're ready for a tough debate.\nThe mountain guardian's mind never changes.";
				break;
			case 3:
				items = [
					{ itemId: -1 },
					{ itemId: 2 },
					{ itemId: 3 },
					{ itemId: 4 },
					{ itemId: 9 },
					{ itemId: 20 },
				];
				advice = [
					"First of all, congratulations!",
					"You are the first customer to reach my black market!",
					"Why is it a black market?",
					"...",
					"Because... it's very dark in here.",
					"...",
					"Changing subject.",
					"The Firefly and Frozen Fly are a delight to play with.\nJust be careful when playing with fire!",
					"...",
					"The space dust is practically unobtainable.",
					"Holding it invokes feelings of positivity for the future.",
					"Honestly, I don't want to part with it.",
					"That is why the cost is so high.",
					"But...",
					"Please don't feel pressured to purchase,\nor pressured into not purchasing.",
					"Only your feelings matter.",
					"...",
					"Did you know Jared's name is pronounced \"Jay-red\"",
					"...",
					"I'm going to start recycling my dialog now.",
					"Thank you for everything.",
					"Thank you.",
					"seriously...",
					"(thank you)",
					"..."
				];
				initialQuote = "Welcome to my underground hookup.\nEverything you could ask for is here."
				break;
		}
		if(items) {
			this._canControl = false;
			const s = new ESPStore(items, advice, initialQuote);
			s.move(Graphics.width / 2, Graphics.height / 2);
			SceneManager._scene.addChild(s);
			s.onEnd = () => this._canControl = true;
		}
	}

	hasSpaceParticles() {
		return this.Items[4] > 0;
	}
}

ESPGamePlayer.LayeringFreq = 5;
ESPGamePlayer.Particles = true;
