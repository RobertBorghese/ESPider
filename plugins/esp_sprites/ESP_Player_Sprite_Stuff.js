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
		for(let i = 0; i < 3; i++) {
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
		this.updateWebAmmo();
		this.updateVisibility();
		this.updateColor();
		this.updateRotation();
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

		if(this.espObject.canControl()) {
			if(Input.Input4Dir === 6) {
				this.BodySprite.scale.set(1, 1);
			} else if(Input.Input4Dir === 4) {
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
			let finalDir = this.espObject.canControl() ? Input.Input4Dir : 0;
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

			const durr = 25;
			this._webAmmoTime += 1 + ((1 - this._webAmmoAnimationTime) * 2);
			const len = this._webAmmoList.length;
			for(let i = 0; i < len; i++) {
				const spr = this._webAmmoList[i];
				spr.setIndex(((this._webAmmoTime % 60) > 30) ? 3 : 4);
				const yOffset = Math.cos((this._webAmmoTime + i) * 0.1);
				spr.ShadowSprite.scale.set(0.3 + (yOffset * 0.05));
				spr.ShadowSprite.alpha = spr.ShadowSprite.scale.x + 0.3;
				spr.WebParent.alpha = r;
				spr.rotation += 0.1;
				spr.WebParent.x = Math.cos((this._webAmmoTime + (i * durr * 2)) / durr) * 16 * r;
				spr.WebParent.y = (Math.sin((this._webAmmoTime + (i * durr * 2)) / durr) * 6 * r) + yOffset;
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
	}

	updateRotation() {
		this.PlayerHolder.rotation = this.espObject.spriteRotation();
	}
}