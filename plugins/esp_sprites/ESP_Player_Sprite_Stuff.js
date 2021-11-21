// LET THERE BE LIGHTTTTT *light from death note walks in* "What?"

ImageManager.loadESPPlayer = function(filename) {
    return this.loadBitmap("img/characters/Player/", filename);
};

ImageManager.loadESPPlayerLegs = function(filename) {
    return this.loadESPPlayer("Legs/" + filename);
};

class ESPPlayerSprite extends ESPGameSprite {
	constructor() {
		super();

		this.espObject = $espGamePlayer;

		this.ObjectHolderOffsetX = 0;
		this.ObjectHolderOffsetY = -8;

		this.PlayerHolder = new Sprite();
		this.PlayerHolder.scale.set(2);
		this.PlayerHolder.move(0, -8);
		this.ObjectHolder.addChild(this.PlayerHolder);

		this._webAmmoBack = new Sprite();
		this._webAmmoBack.move(-1, 1);
		this.PlayerHolder.addChild(this._webAmmoBack);

		this.LegContainerBack = new PIXI.Container();
		this.PlayerHolder.addChild(this.LegContainerBack);

		this._webHolder = new Sprite();
		this._webHolder.move(-2, 12);
		this._webHolder.scale.set(0.5);
		this.PlayerHolder.addChild(this._webHolder);

		this.BodySprite = new ESPAnimatedSprite("img/characters/Player/SpiderBody.png", 10);
		this.BodySprite.anchor.set(0.5);
		this.BodySprite.move(-1, 1);
		this._bodyOffsetY = 0;
		this.PlayerHolder.addChild(this.BodySprite);

		this.LegContainerFront = new PIXI.Container();
		this.PlayerHolder.addChild(this.LegContainerFront);

		this._webAmmoFront = new Sprite();
		this._webAmmoFront.move(-1, 1);
		this.PlayerHolder.addChild(this._webAmmoFront);

		this._webAmmoAnimationTime = 0;
		this._webAmmoList = [];
		this._webAmmoTime = 0;
		for(let i = 0; i < $espGamePlayer.maxConnections(); i++) {
			this.addWebConnection(i);
		}

		this.LegCount = 8;

		this._showFlyCount = 0;

		this.makeIdleLegs();
		this.makeHorizontalLegs();
		this.makeVerticalLegs();
		this.makeJumpLegs();
		this.makeFallLegs();
		this.makeDeathLegs();

		this.Direction = -1;
		this.setDirection(6);
	}

	addWebConnection(i) {
		const par = new Sprite();
		par.visible = false;
		this._webAmmoFront.addChild(par);

		const web = new ESPAnimatedSprite("img/particles/Particle.png", 0);
		web.WebParent = par;
		web.Index = 4;
		web.alpha = 1;
		web.anchor.set(0.5);
		web._isFront = true;
		par.addChild(web);
		this._webAmmoList.push(web);

		web.ShadowSprite = new Sprite(ImageManager.loadSystem("Shadow4"));
		web.ShadowSprite.anchor.set(0.5);
		web.ShadowSprite.z = 3;
		web.ShadowSprite.move(0, 8);
		par.addChild(web.ShadowSprite);
	}

	makeIdleLegs() {
		this.IdleLegSprites = [];
		this.makeLegs(this.IdleLegSprites, "Idle_Side", "Idle_Front", 10);
	}

	makeHorizontalLegs() {
		this.SideLegSprites = [];
		this.makeLegs(this.SideLegSprites, "WalkHor_Side", "WalkHor_Front", 4, true);
	}

	makeVerticalLegs() {
		this.VerticalLegSprites = [];
		this.makeLegs(this.VerticalLegSprites, "WalkVer_Side", "WalkVer_Front", 4, true);
	}

	makeJumpLegs() {
		this.JumpLegSprites = [];
		this.makeLegs(this.JumpLegSprites, "Jump_Side", "Jump_Front", 2);
	}

	makeFallLegs() {
		this.FallLegSprites = [];
		this.makeLegs(this.FallLegSprites, "Fall_Side", "Fall_Front", 4);
	}

	makeDeathLegs() {
		this.DeathLegSprites = [];
		this.makeLegs(this.DeathLegSprites, "Death_Side", "Death_Front", 3);
	}

	makeLegs(container, side, front, speed, offset) {
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? side : front;
			const Sprite = new ESPAnimatedSprite("img/characters/Player/Legs/" + (SpriteName) + ".png", speed, false, !!offset ? ((i * 2) % 6) : 0);
			Sprite.anchor.set(0.5);
			container.push(Sprite);
			if(i === 0 || i === 3 || i === 4 || i === 5) {
				this.LegContainerFront.addChild(Sprite);
			} else {
				this.LegContainerBack.addChild(Sprite);
			}
		}
	}

	setDirection(dir) {
		if(this.Direction !== dir) {
			this.Direction = dir;
			this.refreshIdleLegs();
			this.refreshSideLegs();
			this.refreshVerticalLegs();
			this.BodySprite.reset();
			this.IdleLegSprites.forEach(s => s.reset());
			this.SideLegSprites.forEach(s => s.reset());
			this.VerticalLegSprites.forEach(s => s.reset());
			this.JumpLegSprites.forEach(s => s.reset());
			this.FallLegSprites.forEach(s => s.reset());
			this.DeathLegSprites.forEach(s => s.reset());

			if(dir === 10) {
				this.JumpLegSprites.forEach(s => s.await());
			} else if(dir === 11) {
				this.FallLegSprites.forEach(s => s.await());
			} else if(dir === 12) {
				this.DeathLegSprites.forEach(s => s.await());
			}

			this.refreshJumpLegs();
			this.refreshFallLegs();
			this.refreshDeathLegs();
		}
	}

	isIdle() {
		return this.Direction === 0;
	}

	isMovingHorizontal() {
		return this.Direction === 4 || this.Direction === 6;
	}

	isMovingVertical() {
		return this.Direction === 2 || this.Direction === 8;
	}

	isJumping() {
		return this.Direction === 10;
	}

	isFalling() {
		return this.Direction === 11;
	}

	isDeath() {
		return this.Direction === 12;
	}

	refreshIdleOrDeathLegs(cond, arr) {
		if(!cond) {
			this.hideSprites(arr);
			return;
		} else {
			this.showSprites(arr);
		}

		const Furthest = 6;
		const Sprites = arr;

		Sprites[0].move(Furthest - 0, Furthest - 2);

		Sprites[1].move(-Furthest - 1 - 3, Furthest - 2);
		Sprites[1].scale.set(-1, 1);

		Sprites[2].move(-Furthest + 1, 0);
		Sprites[2].scale.set(-1, 1);

		Sprites[3].move(Furthest - 4, 0);

		Sprites[4].move((Furthest / 2) + 1, Furthest);

		Sprites[5].move((Furthest / -2) - 5, Furthest);
		Sprites[5].scale.set(-1, 1);

		Sprites[6].move((Furthest / 2) - 2, 0);

		Sprites[7].move((Furthest / -2) - 5 - 1 + 2, 0);
		Sprites[7].scale.set(-1, 1);
	}

	refreshIdleLegs() {
		this.refreshIdleOrDeathLegs(this.isIdle(), this.IdleLegSprites);
	}

	refreshSideLegs() {
		if(!this.isMovingHorizontal()) {
			this.hideSprites(this.SideLegSprites);
			return;
		} else {
			this.showSprites(this.SideLegSprites);
		}

		const Furthest = 4;
		const IsLeft = this.Direction === 4;

		const Sprites = this.SideLegSprites;

		Sprites[0].move(Furthest, Furthest);
		Sprites[0].Invert = IsLeft;
		Sprites[0].Offset = IsLeft ? 0 : 2;

		Sprites[1].move(-Furthest, Furthest);
		Sprites[1].scale.set(-1, 1);
		Sprites[1].Invert = !IsLeft;
		Sprites[1].Offset = IsLeft ? 2 : 0;

		Sprites[2].move(-Furthest, 0);
		Sprites[2].scale.set(-1, 1);
		Sprites[2].Invert = !IsLeft;
		Sprites[2].Offset = IsLeft ? 4 : 0;

		Sprites[3].move(Furthest, 0);
		Sprites[3].Invert = IsLeft;
		Sprites[3].Offset = IsLeft ? 0 : 4;

		Sprites[4].move((Furthest / 2) + 2, Furthest);
		Sprites[4].Offset = 4;

		Sprites[5].move(Furthest / -2, Furthest);
		Sprites[5].Offset = 0;

		Sprites[6].move((Furthest / 2) + 2, 0);
		Sprites[6].Offset = 0;

		Sprites[7].move(Furthest / -2, 0);
		Sprites[7].Offset = 4;

		for(let i = 4; i <= 7; i++) { Sprites[i].Invert = !IsLeft; }
	}

	refreshVerticalLegs() {
		if(!this.isMovingVertical()) {
			this.hideSprites(this.VerticalLegSprites);
			return;
		} else {
			this.showSprites(this.VerticalLegSprites);
		}

		const Furthest = 4;
		const IsLeft = this.Direction === 4;

		const Sprites = this.VerticalLegSprites;

		Sprites[0].move(Furthest, Furthest + 1);
		Sprites[0].Invert = IsLeft;
		Sprites[0].Offset = IsLeft ? 0 : 2;

		Sprites[1].move(-Furthest - 2, Furthest + 1);
		Sprites[1].scale.set(-1, 1);
		Sprites[1].Invert = !IsLeft;
		Sprites[1].Offset = IsLeft ? 2 : 0;

		Sprites[2].move(-Furthest - 2, 1);
		Sprites[2].scale.set(-1, 1);
		Sprites[2].Invert = !IsLeft;
		Sprites[2].Offset = IsLeft ? 4 : 0;

		Sprites[3].move(Furthest, 1);
		Sprites[3].Invert = IsLeft;
		Sprites[3].Offset = IsLeft ? 0 : 4;

		Sprites[4].move((Furthest / 2) + 1, Furthest);
		Sprites[4].Offset = 4;

		Sprites[5].move((Furthest / -2) - 5, Furthest);
		Sprites[5].scale.set(-1, 1);
		Sprites[5].Offset = 0;

		Sprites[6].move((Furthest / 2) + 1, 0);
		Sprites[6].Offset = 0;

		Sprites[7].move((Furthest / -2) - 5, 0);
		Sprites[7].scale.set(-1, 1);
		Sprites[7].Offset = 4;
	}

	refreshJumpOrFallLegs(cond, arr) {
		if(!cond) {
			this.hideSprites(arr);
			return;
		} else {
			this.showSprites(arr);
		}

		const Furthest = 6;
		const Sprites = arr;

		Sprites[0].move(Furthest - 0, Furthest - 2);

		Sprites[1].move(-Furthest - 1 - 3, Furthest - 2);
		Sprites[1].scale.set(-1, 1);

		Sprites[2].move(-Furthest + 1, 0);
		Sprites[2].scale.set(-1, 1);

		Sprites[3].move(Furthest - 4, 0);

		Sprites[4].move((Furthest / 2) + 1, Furthest);

		Sprites[5].move((Furthest / -2) - 5, Furthest);
		Sprites[5].scale.set(-1, 1);

		Sprites[6].move((Furthest / 2) - 2, 0);

		Sprites[7].move((Furthest / -2) - 5 - 1 + 2, 0);
		Sprites[7].scale.set(-1, 1);
	}

	refreshJumpLegs() {
		this.refreshJumpOrFallLegs(this.isJumping(), this.JumpLegSprites);
	}

	refreshFallLegs() {
		this.refreshJumpOrFallLegs(this.isFalling(), this.FallLegSprites);
	}

	refreshDeathLegs() {
		this.refreshIdleOrDeathLegs(this.isDeath(), this.DeathLegSprites);
	}

	update() {
		super.update();
		this.updateContainers();
		this.updateBodySprite();
		this.updateDirection();
		this.updateLegSpeed();
		this.updateFlyCounter();
		this.updateNomiCounter();
		this.updateShieldsDisplay();
		this.updateTempGauge();
		this.updateWebAmmo();
		this.updateVisibility();
		this.updateColor();
		this.updateRotation();
		this.updateInvincibility();
		this.updateInfoText();
	}

	updateContainers() {
		const Containers = [
			this.LegContainerFront,
			this.LegContainerBack
		];
		for(let i = 0; i < Containers.length; i++) {
			if(Containers[i].visible) {
				const len = Containers[i].children.length;
				for(let j = 0; j < len; j++) {
					Containers[i].children[j].update();
				}
			}
		}
	}

	updateBodySprite() {
		if(this.isIdle()) {
			let Offset = this.IdleLegSprites[0].Index;
			if(Offset === 3) Offset = 1;
			this.BodySprite.move(-2, 2 - Offset - this._bodyOffsetY);
		} else if(this.isMovingHorizontal() || this.isMovingVertical()) {
			let Offset = this.BodySprite.Index;
			this.BodySprite.move(-2, 2 - (Offset >= 2 ? 1 : 0) - this._bodyOffsetY);
		}

		if(this.espObject.canControlAndInvClosed()) {
			if(Input.Input4Dir === 6) {
				this.BodySprite.scale.set(1, 1);
			} else if(Input.Input4Dir === 4) {
				this.BodySprite.scale.set(-1, 1);
			}
		} else if($gameMap._isTranferring) {
			if(this.Direction === 6) {
				this.BodySprite.scale.set(1, 1);
			} else if(this.Direction === 4) {
				this.BodySprite.scale.set(-1, 1);
			}
		}
	}

	updatePlayerSpeed2d() {
		if(!this.__espPlayerSpeed2d) {
			this.__espPlayerSpeed2d = new Vector2(0, 0);
		}
		this.__espPlayerSpeed2d.x = this.espObject.speed.x;
		this.__espPlayerSpeed2d.y = this.espObject.speed.y;
	}

	updateDirection() {
		if($espGamePlayer.isDying()) {
			this.setDirection(12);
		} else if($espGamePlayer.isJumping()) {
			this.setDirection(10);
		} else if($espGamePlayer.isFalling()) {
			this.setDirection(11);
		} else {
			let finalDir = this.espObject.canControlAndInvClosed() ? Input.Input4Dir : 0;
			if(finalDir === 0) {
				this.updatePlayerSpeed2d();
				if(this.__espPlayerSpeed2d.x < 0) finalDir = 4;
				else if(this.__espPlayerSpeed2d.x > 0) finalDir = 6;
				else if(this.__espPlayerSpeed2d.y < 0) finalDir = 8;
				else if(this.__espPlayerSpeed2d.y > 0) finalDir = 2;
			}
			this.setDirection(finalDir);
		}
	}

	updateShadowSprite() {
		if(this.espObject.position.z > 0) {
			this.ShadowSprite.scale.set(((200 - this.espObject.position.z) / 200.0).clamp(0.3, 1));
		} else {
			this.ShadowSprite.scale.set(1 + ((this.BodySprite.y - 2 + this._bodyOffsetY) * 0.05));
		}
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}

	updateLegSpeed() {
		this.updatePlayerSpeed2d();
		this.setLegSpriteSpeed(this.__espPlayerSpeed2d.length() / 3);
	}

	updateFlyCounter() {
		if(this.espObject.shouldShowFlyCount()) {
			this._showFlyCount = 50;

			if(this._flyHolder) {
				this.ObjectHolder.removeChild(this._flyHolder);
				this._flyHolder.destroy();
				this._flyHolder = null;
			}

			this._flyHolder = new Sprite();
			this._flyHolder.anchor.set(0.5);
			this._flyHolder.z = 9999;

			this._flyIcon = new Sprite(ImageManager.loadBitmapFromUrl("img/system/FlyIcon.png"));
			this._flyIcon.scale.set(3);
			this._flyIcon.move(-20, -20);

			this._flyCountText = ESP.makeText("×" + $espGamePlayer.flies(), 24, "left");
			this._flyCountText.anchor.set(0, 0.5);
			this._flyCountText.x = 4;
			this._flyCountText.y = 0;

			this._flyHolder.addChild(this._flyIcon);
			this._flyHolder.addChild(this._flyCountText);

			SceneManager._scene.addUiChild(this._flyHolder);
		}
		if(this._showFlyCount > 0) {
			this._showFlyCount--;

			const full = 100;
			const third = 33;
			const third2 = 66;

			if(this._showFlyCount < third) {
				this._flyHolder.scale.set(Easing.easeOutCubic(this._showFlyCount / third));
			} else if(this._showFlyCount > third2) {
				this._flyHolder.scale.set(Easing.easeOutCubic(((full - this._showFlyCount) / third)));
			}
			this._flyHolder.x = this.x - 2;
			this._flyHolder.y = this.y + this.ObjectHolder.y - (10 + (40 * ((full - this._showFlyCount) / full)));

			if(this._showFlyCount <= 0) {
				if(SceneManager?._scene?.removeUiChild) SceneManager._scene.removeUiChild(this._flyHolder);
				this._flyHolder.destroy();
				this._flyHolder = null;
			}
		}
	}

	updateNomiCounter() {
		const nomiLost = this.espObject.TempNomiCount < 0;

		let shouldDestroy = false;

		if(this.espObject.shouldShowNomiCount()) {
			if(!this._nomiCountText) {
				this._nomiCountText = ESP.makeText("", nomiLost ? 20 : 16, "left");
				if(nomiLost) {
					const style = this._nomiCountText.style;
					style.fill = 0xff6666;
					style.letterSpacing = 1;
					this._nomiCountText.style = style;
				}
				this._nomiCountText.anchor.set(0, 0.5);
				this._nomiCountText.alpha = 1;
				this._nomiCountText.scale.set(0);
				SceneManager._scene.addUiChild(this._nomiCountText);
			}

			if(this._nomiCountText.scale.x < 1) {
				this._nomiCountText.scale.set((this._nomiCountText.scale.x + 0.1).clamp(0, 1));
			}
		} else if(!nomiLost && this._nomiCountText && this._nomiCountText.scale.x > 0) {
			this._nomiCountText.scale.set((this._nomiCountText.scale.x - 0.05).clamp(0, 1));
			if(this._nomiCountText.scale.x <= 0) {
				shouldDestroy = true;
			}
		}

		if(!shouldDestroy && this._nomiCountText) {
			this._nomiCountText.x = this.x - (this._nomiCountText.width / 2) - 4;
			this._nomiCountText.y = this.y + this.ObjectHolder.y - 30 - (this._nomiCountText.scale.y * 20) - (this._shields > 0 ? 10 : 0) - (nomiLost ? (60 * Easing.easeInCubic((ESP.Time - this.espObject.LastNomiCollectTime) / 90)) - 30 : 0);
			const text = nomiLost ? this.espObject.TempNomiCount.toString() : ("×" + this.espObject.TempNomiCount);
			this._nomiCountText.text = text;

			if(nomiLost) {
				if(this._nomiCountText.rotation === 0) this._nomiCountText.rotation = 0.01;
				this._nomiCountText.rotation *= 1.11;
				const diff = (ESP.Time - this.espObject.LastNomiCollectTime);
				if(diff > (85)) {
					const r = Easing.easeInCubic((diff - 85) / 15).clamp(0, 1);
					const style = this._nomiCountText.style;
					style.letterSpacing = (r * 30) + 1;
					this._nomiCountText.style = style;
					this._nomiCountText.alpha = (1 - r);
					if(this._nomiCountText.alpha <= 0) {
						shouldDestroy = true;
					}
				}
			}
		}

		if(shouldDestroy) {
			this._nomiCountText.scale.set(0);
			this.espObject.TempNomiCount = 0;

			SceneManager._scene.removeUiChild(this._nomiCountText);
			this._nomiCountText.destroy();
			this._nomiCountText = null;
		}
	}

	_compArr(arr1, arr2) {
		if(!arr1 && arr2) return false;
		if(arr1.length !== arr2.length) return false;
		for(let i = 0; i < arr1.length; i++) {
			if(arr1[i] !== arr2[i]) return false;
		}
		return true;
	}

	updateShieldsDisplay() {
		if(!this.__shieldBitmap) {
			this.__shieldBitmap = ImageManager.loadSystem("ShieldIcon");
		}
		if(!this.__shieldBitmap.isReady()) return;

		const spacing = 1;
		const isInit = typeof this._shields === "undefined";
		const shields = this.espObject.shields();
		if(this._shields !== shields) {
			const oldShieldCount = this._shields ?? 0;
			const newShieldCount = shields;
			this._shields = shields;

			if(!this._shieldHolder) {
				this._shieldHolder = new Sprite();
				this._shieldHolder.anchor.set(0, 0.5);
				this._shieldHolder.y = -8;
				this.PlayerHolder.addChild(this._shieldHolder);
			}

			for(let i = oldShieldCount; i < newShieldCount; i++) {
				const s = new Sprite(this.__shieldBitmap);
				s.anchor.set(0.5, 1);
				s.x = (i * (this.__shieldBitmap.width + spacing));
				s.scale.set(isInit ? 1 : 0);
				this._shieldHolder.addChild(s);
			}
		}

		if(this._shieldHolder && this._shieldHolder.children.length > 0) {
			for(let i = 0; i < this._shieldHolder.children.length; i++) {
				const c = this._shieldHolder.children[i];
				c.x = (i * (this.__shieldBitmap.width + spacing));
				c.y = Math.sin((ESP.Time + c.x) / 30) * 2;
				if(!c._wasscaled && c.scale.x < 1.5) {
					c.scale.set(((c.scale.x ? c.scale.x : 0.04) * 1.2));
					if(!c._wasplayed && c.scale.x > 0.75) {
						ESPAudio.shieldGet();
						c._wasplayed = true;
					}
				} else if(c.scale.x > 1) {
					c.scale.set((c.scale.x * 0.9));
					if(c.scale.x < 1) c.scale.set(1);
					c._wasscaled = true;
				}
			}

			const totalWidth = ((this.__shieldBitmap.width + spacing) * this._shields) - spacing;
			const desiredX = (totalWidth / -2) + 4;
			if(this._shieldHolder.x < desiredX) {
				this._shieldHolder.x += 0.4;
				if(this._shieldHolder.x > desiredX) this._shieldHolder.x = desiredX;
			} else if(this._shieldHolder.x > desiredX) {
				this._shieldHolder.x -= 0.4;
				if(this._shieldHolder.x < desiredX) this._shieldHolder.x = desiredX;
			}
		}

		if(this._deadShield) {
			this._deadShield.y += this._deadShield._upSpeed;
			this._deadShield.x += 0.5;
			this._deadShield.alpha -= 0.01;
			this._deadShield._upSpeed += 0.5;
			this._deadShield.rotation += 0.03;
			if(this._deadShield.alpha <= 0) {
				this.PlayerHolder.removeChild(this._deadShield);
				this._deadShield.destroy();
				this._deadShield = null;
			}
		}
	}

	removeShield() {
		if(this._shieldHolder && this._shieldHolder.children.length > 0) {
			const c = this._shieldHolder.children[this._shieldHolder.children.length - 1];
			const pos = c.getGlobalPosition();
			this._shieldHolder.removeChild(c);
			this.PlayerHolder.addChild(c);
			this._deadShield = c;
			const newPos = this.PlayerHolder.toLocal(pos);
			this._deadShield.position = newPos;
			this._deadShield._upSpeed = -7;
		}
	}

	removeAllShields() {
		if(this._shieldHolder && this._shieldHolder.children.length > 0) {
			while(this._shieldHolder.children.length > 0) {
				const c = this._shieldHolder.children[0];
				this._shieldHolder.removeChild(c);
				c.destroy();
			}
			this._shieldHolder.x = 0;
		}
	}

	updateTempGauge() {
		if($espGamePlayer._abilityTime > 0) {
			if(!this.tempGauge) {
				this.tempGauge = new PIXI.Graphics();
				this.tempGauge.x = -26;
				this.tempGauge.alpha = 0;
				this.PlayerHolder.addChild(this.tempGauge);
			}

			this.tempGauge.y = this.espObject.hasShield() ? -32 : -24;

			const r = $espGamePlayer.tempAbilityRatio();

			if(this.tempGauge.alpha < 1) {
				this.tempGauge.alpha += 0.06;
			}

			this.tempGauge.clear();

			this.tempGauge.beginFill(0x333333);
			this.tempGauge.drawCircle(0, 0, 9);
			this.tempGauge.endFill();

			if(r > 0) {
				let c = $espGamePlayer._abilityColor;//0x3f72c4;
				if(r > 0.5) {
					const r2 = 0xbb * ((r - 0.5) / 0.5);
					c = (Math.min(0xff, ((c >> 16) & 0xff) + r2) << 16) | 
						(Math.min(0xff, ((c >> 8) & 0xff) + r2) << 8) |
						(Math.min(0xff, ((c) & 0xff) + r2));
				}
				this.tempGauge.beginFill(c);
				this.tempGauge.drawTorus(0, 0, 0, 8, 0, Math.PI * 2 * (1 - r));
				this.tempGauge.endFill();
			}
		} else if(this.tempGauge) {
			if(this.tempGauge.alpha > 0) {
				this.tempGauge.alpha -= 0.1;
			} else {
				this.PlayerHolder.removeChild(this.tempGauge);
				this.tempGauge.destroy();
				this.tempGauge = null;
			}
		}
	}

	setLegSpriteSpeed(speed) {
		{
			const len = this.SideLegSprites.length;
			for(let i = 0; i < len; i++) {
				this.SideLegSprites[i].FrameDelay = (4 + ((1 - speed) * 4));
			}
		}
		{
			const len = this.VerticalLegSprites.length;
			for(let i = 0; i < len; i++) {
				this.VerticalLegSprites[i].FrameDelay = (4 + ((1 - speed) * 4));
			}
		}
	}

	updateWebAmmo() {
		if(this.espObject.IsGrappling || this._webAmmoAnimationTime > 0) {

			const maxConnections = $espGamePlayer.maxConnections();
			if(this._webAmmoList.length < maxConnections) {
				for(let i = this._webAmmoList.length; i < maxConnections; i++) {
					this.addWebConnection(i);
				}
			}

			if(this.espObject.IsGrappling && this._webAmmoAnimationTime < 1) {
				if(!this.isWebAmmoOut()) {
					this._webAmmoList.forEach(w => w.WebParent.visible = true);
				}
				this._webAmmoAnimationTime += 0.05;
				if(this._webAmmoAnimationTime >= 1) {
					this._webAmmoOpenedAllTheWay = true;
					this._webAmmoAnimationTime = 1;
				}
			} else if(!this.espObject.IsGrappling && this._webAmmoAnimationTime > 0) {
				this._webAmmoAnimationTime -= 0.05;
				if(this._webAmmoAnimationTime <= 0) {
					this._webAmmoAnimationTime = 0;
					this._webAmmoList.forEach(w => w.WebParent.visible = false);
					if(this._webAmmoOpenedAllTheWay) {
						ESPAudio.grappleReady();
						this._webAmmoOpenedAllTheWay = false;
					}
				}
			}

			const r = Easing.easeOutBack(this._webAmmoAnimationTime);

			// this is animation speed. originally 25 in game jam ver.
			const durr = 20;//25;

			this._webAmmoTime += 1 + ((1 - this._webAmmoAnimationTime) * 2);
			const len = this._webAmmoList.length;
			for(let i = 0; i < len; i++) {
				const ir = (i * (3 / maxConnections));
				const spr = this._webAmmoList[i];
				spr.setIndex(((this._webAmmoTime % 60) > 30) ? 3 : 4);
				const yOffset = Math.cos((this._webAmmoTime + ir) * 0.1);
				spr.ShadowSprite.scale.set(0.3 + (yOffset * 0.05));
				spr.ShadowSprite.alpha = spr.ShadowSprite.scale.x + 0.3;
				spr.WebParent.alpha = r;
				spr.rotation += 0.1;
				spr.WebParent.x = Math.cos((this._webAmmoTime + (ir * durr * 2)) / durr) * 16 * r;
				spr.WebParent.y = (Math.sin((this._webAmmoTime + (ir * durr * 2)) / durr) * 6 * r) + yOffset;
				spr.WebParent.visible = $espGamePlayer.connectionCount() <= i;
				const isFront = spr.WebParent.y > 0;
				if(spr._isFront !== isFront) {
					spr._isFront = isFront;
					spr.WebParent.parent.removeChild(spr.WebParent);
					(isFront ? this._webAmmoFront : this._webAmmoBack).addChild(spr.WebParent);
				}
			}
		}
	}

	isWebAmmoOut() {
		return this._webAmmoAnimationTime !== 0;
	}

	updateVisibility() {
		this.visible = this.espObject.visible();
	}

	updateColor() {
		if(this.espObject.hasCustomColor()) {
			this.PlayerHolder.setColorTone(this.espObject.customColor());
		} else if(this.PlayerHolder._colorTone[0] !== 0 || this.PlayerHolder._colorTone[1] !== 0 || this.PlayerHolder._colorTone[2] !== 0 || this.PlayerHolder._colorTone[3] !== 0) {
			this.PlayerHolder.setColorTone([0, 0, 0, 0]);
		}

		if(this._bodyHue !== this.espObject._hue) {
			this._bodyHue = this.espObject._hue;
			if(typeof this._bodyHue === "number") {
    			if(!this.BodySprite._espColorFilter) {
    				this.BodySprite._espColorFilter = new ColorFilter();
    			}
    			if(!this.BodySprite.filters) {
					this.BodySprite.filters = [];
				}
				this.BodySprite.filters.push(this.BodySprite._espColorFilter);
				if(this._bodyHue === -1) {
					this.BodySprite._espColorFilter.setBlendColor([90, 0, 0, 230]);
					this.BodySprite._espColorFilter.setHue(0);
				} else {
					this.BodySprite._espColorFilter.setBlendColor([0, 0, 0, 0]);
					this.BodySprite._espColorFilter.setHue(this._bodyHue);
				}
			} else {
				if(this.BodySprite.filters) {
					this.BodySprite.filters.splice(this.BodySprite.filters.indexOf(this.BodySprite._espColorFilter), 1);
					if(this.BodySprite.filters.length === 0) {
						this.BodySprite.filters = null;
					}
				}
			}
		}
	}

	updateRotation() {
		this.PlayerHolder.rotation = this.espObject.spriteRotation();
	}

	updateInvincibility() {
		if(this.espObject.isInvincible()) {
			if(!this.BodySprite._espOverlapFilter) {
				this.BodySprite._espOverlapFilter = new PIXI.filters.ColorOverlayFilter(0xffffff, 0);
			}
			if(!this.BodySprite.filters || this.BodySprite.filters.indexOf(this.BodySprite._espOverlapFilter) === -1) {
				const filter = this.BodySprite._espOverlapFilter;
				if(!this.BodySprite.filters) this.BodySprite.filters = [];
				this.BodySprite.filters.push(filter);
				this.LegContainerBack.filters = [filter];
				this.LegContainerFront.filters = [filter];
			}
			this.BodySprite._espOverlapFilter.alpha = ((this.espObject._invincibilityTime % 15) / 25);
			this.__wasInvincible = true;
		} else if(this.__wasInvincible) {
			if(this.BodySprite.filters) {
				this.BodySprite.filters.splice(this.BodySprite.filters.indexOf(this.BodySprite._espOverlapFilter), 1);
				if(this.BodySprite.filters.length === 0) {
					this.BodySprite.filters = null;
				}
			}
			this.LegContainerBack.filters = null;
			this.LegContainerFront.filters = null;
			this.__wasInvincible = false;
		}
	}

	showJumpParticles() {
		if(!ESPGamePlayer.Particles) return;

		const PI2 = Math.PI * 2;
		for(let i = 0; i < 12; i++) {
			const xspd = Math.cos(PI2 * (i / 12)) * 1;
			const yspd = Math.sin(PI2 * (i / 12)) * 0.5 * 1;
			const p = $gameMap.addParticle(this.espObject.position.x, this.espObject.position.y, xspd, yspd, 7, "JumpParticle", true);
			p.willEncounterMovingPlatform = function() { return this.movingPlatformsExist(); }
			p.position.z = this.espObject.position.z + 12;
			p.CollisionHeight = this.espObject.CollisionHeight;
			p._drop = true;
			p._spriteXOffset = -4;
		}
	}

	showLandParticles() {
		if(!ESPGamePlayer.Particles) return;

		const PI2 = Math.PI * 2;
		const offset = Math.random() * Math.PI * 2;
		const count = 3 + Math.floor(Math.random() * 2);
		const tint = SceneManager._scene._spriteset.getPlayerFloorColor(0x22);
		for(let i = 0; i < count; i++) {
			const xspd = Math.cos(PI2 * (i / count) + offset);
			const yspd = Math.sin(PI2 * (i / count) + offset) * 0.5;
			const offsetY = (yspd * (15 + (Math.random() * 3)));
			const p = $gameMap.addParticle(
				this.espObject.position.x + (xspd * (15 + (Math.random() * 3))),
				this.espObject.position.y + offsetY,
				xspd * 0.3,
				yspd * 0.4,
				3,
				"LandParticle",
				false,
				offsetY > 0 ? 2 : true
			);
			p.rotation = Math.random() * Math.PI * 2;
			p._isParticle = true;
			p.willEncounterMovingPlatform = function() { return this.movingPlatformsExist(); }
			p.CollisionHeight = $espGamePlayer.CollisionHeight;
			p.position.z = $espGamePlayer.position.z + 1;
			p._raise = true;
			p.lastResort = true;
			p._spriteXOffset = -4;
			p.tint = tint;
		}
	}

	showPoofParticles() {
		if(!ESPGamePlayer.Particles) return;

		const PI2 = Math.PI * 2;
		const offset = Math.random() * Math.PI * 2;
		const count = 6;
		for(let i = 0; i < count; i++) {
			const xspd = Math.cos(PI2 * (i / count) + offset);
			const yspd = Math.sin(PI2 * (i / count) + offset) * 0.5;
			const offsetY = (yspd * (15 + (Math.random() * 3)));
			const p = $gameMap.addParticle(
				this.espObject.position.x + (xspd * (15 + (Math.random() * 3))),
				this.espObject.position.y + offsetY,
				xspd * 0.3,
				yspd * 0.4,
				3,
				"LandParticle",
				false,
				offsetY > 0 ? 2 : true
			);
			p.rotation = Math.random() * Math.PI * 2;
			p._isParticle = true;
			p.willEncounterMovingPlatform = function() { return this.movingPlatformsExist(); }
			p.CollisionHeight = $espGamePlayer.CollisionHeight;
			p.position.z = $espGamePlayer.position.z + 2;
			p.speed.z = 0.6;
			p._raise = true;
			p.lastResort = true;
			p._spriteXOffset = -4;
		}
	}

	dropWalkParticle() {
		if(!ESPGamePlayer.Particles) return;

		const offsetY = -2 + (-2 + (Math.random() * 4));

		const p = $gameMap.addParticle(
			this.espObject.position.x + (-2 + (Math.random() * 4)),
			this.espObject.position.y + offsetY,
			0,
			0,
			3,
			"StepParticle",
			false,
			this.espObject.speed.y > 0 ? true : (offsetY > 0 ? 2 : false)
		);
		p.rotation = Math.random() * Math.PI * 2;
		p._isParticle = true;
		p.willEncounterMovingPlatform = function() { return this.movingPlatformsExist(); }
		p.CollisionHeight = $espGamePlayer.CollisionHeight;
		p.position.z = $espGamePlayer.position.z;
		p.lastResort = true;
		p._spriteXOffset = -4;
		p.tint = SceneManager._scene._spriteset.getPlayerFloorColor(0x22);
	}

	updateInfoText() {
		if(this.__infoText !== $espGamePlayer.infoText()) {
			this.__infoText = $espGamePlayer.infoText();

			if(this.__infoText) {
				if(!this.Text) {
					this.Text = new PIXI.Text(this.__infoText, {
						fontFamily: $gameSystem.mainFontFace(),
						fontSize: $espGamePlayer.__infoTextSize ?? 20,
						fill: 0xffffff,
						align: $espGamePlayer.__infoTextCentered ? "center" : "left",
						stroke: "rgba(0, 0, 0, 0.75)",
						strokeThickness: 4,
						lineJoin: "round"
					});
					this.Text.anchor.set(0.5, 1);
					this.Text.resolution = 2;
				} else {
					this.Text.text = this.__infoText;
				}

				if(!this.TextHolder) {
					this.TextHolder = new Sprite();
					this.TextHolder._baseY = 0;//this.Text.height * -0.5;
					this.TextHolder.scale.set(0);
					this.TextHolder._time = 0;
					this.TextHolder.addChild(this.Text);
					SceneManager._scene.addUiChild(this.TextHolder);
				}
			}
		}

		if(this.TextHolder) {
			if(this.__infoText && this.TextHolder._time < 1) {
				this.TextHolder._time += 0.06;
				if(this.TextHolder._time > 1) this.TextHolder._time = 1;
			} else if(!this.__infoText && this.TextHolder._time > 0) {
				this.TextHolder._time -= 0.06;
				if(this.TextHolder._time < 0) this.TextHolder._time = 0;
			}
			const ratio = (this._showingText ? Easing.easeOutBack : Easing.easeOutCubic)(this.TextHolder._time);
			this.TextHolder.scale.set(ratio);
			this.TextHolder.x = this.x + this.PlayerHolder.x + this.ObjectHolder.x - 4;
			this.TextHolder.y = this.y + this.PlayerHolder.y + this.ObjectHolder.y + 
				Math.round((this.TextHolder._baseY * ratio) - (25)) - ($espGamePlayer.hasShield() ? 22 : 0);

			if(!this.__infoText && this.TextHolder._time <= 0) {
				this.TextHolder.removeChild(this.Text);
				SceneManager._scene.removeUiChild(this.TextHolder);
				this.TextHolder.destroy();
				this.Text.destroy();
				this.TextHolder = null
				this.Text = null;
			}
		}
	}
}

if(window?.ESPItem?.items?.[14]) {
	ESPItem.items[14].behavior = () => {
		if($espGamePlayer) {
			$espGamePlayer.showInfoText("I AM ALWAYS WATCHING.", 90);
			$espGamePlayer.openInventory = function() { $espGamePlayer.showInfoText("DENIED.", 40); }
			$espGamePlayer.updateMovement = function() {
				if(Math.abs(Input.InputVector.x) > 0.05 || Math.abs(Input.InputVector.y) > 0.05) {
					$espGamePlayer.showInfoText("LOL", 10);
				}
			}
			SceneManager._scene.onPause = function() { $espGamePlayer.showInfoText("WHERE DO YOU THINK YOU'RE GOING???", 40); }
		}
	}
}