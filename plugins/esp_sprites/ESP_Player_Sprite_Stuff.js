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

		this.LegContainerBack = new PIXI.Container();
		this.PlayerHolder.addChild(this.LegContainerBack);

		this.BodySprite = new ESPAnimatedSprite(ImageManager.loadBitmapFromUrl("img/characters/Player/SpiderBody.png"), 10);
		this.BodySprite.anchor.set(0.5);
		this.BodySprite.move(-1, 1);
		this._bodyOffsetY = 0;
		this.PlayerHolder.addChild(this.BodySprite);

		this.LegContainerFront = new PIXI.Container();
		this.PlayerHolder.addChild(this.LegContainerFront);

		this.LegCount = 8;

		this.makeIdleLegs();
		this.makeHorizontalLegs();
		this.makeVerticalLegs();
		this.makeJumpLegs();
		this.makeFallLegs();

		this.Direction = -1;
		this.setDirection(6);
	}

	makeIdleLegs() {
		this.IdleLegSprites = [];
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? "Idle_Side" : "Idle_Front";
			const Sprite = new ESPAnimatedSprite(ImageManager.loadESPPlayerLegs(SpriteName), 10);
			Sprite.anchor.set(0.5);
			this.IdleLegSprites.push(Sprite);
			if(i === 0 || i === 3 || i === 4 || i === 5) {
				this.LegContainerFront.addChild(Sprite);
			} else {
				this.LegContainerBack.addChild(Sprite);
			}
		}
	}

	makeHorizontalLegs() {
		this.SideLegSprites = [];
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? "WalkHor_Side" : "WalkHor_Front";
			const Sprite = new ESPAnimatedSprite(ImageManager.loadESPPlayerLegs(SpriteName), 4, false, (i * 2) % 6);
			Sprite.anchor.set(0.5);
			this.SideLegSprites.push(Sprite);
			if(i === 0 || i === 3 || i === 4 || i === 5) {
				this.LegContainerFront.addChild(Sprite);
			} else {
				this.LegContainerBack.addChild(Sprite);
			}
		}
	}

	makeVerticalLegs() {
		this.VerticalLegSprites = [];
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? "WalkVer_Side" : "WalkVer_Front";
			const Sprite = new ESPAnimatedSprite(ImageManager.loadESPPlayerLegs(SpriteName), 4, false, (i * 2) % 6);
			Sprite.anchor.set(0.5);
			this.VerticalLegSprites.push(Sprite);
			if(i === 0 || i === 3 || i === 4 || i === 5) {
				this.LegContainerFront.addChild(Sprite);
			} else {
				this.LegContainerBack.addChild(Sprite);
			}
		}
	}

	makeJumpLegs() {
		this.JumpLegSprites = [];
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? "Jump_Side" : "Jump_Front";
			const Sprite = new ESPAnimatedSprite(ImageManager.loadESPPlayerLegs(SpriteName), 2);
			Sprite.anchor.set(0.5);
			this.JumpLegSprites.push(Sprite);
			if(i === 0 || i === 3 || i === 4 || i === 5) {
				this.LegContainerFront.addChild(Sprite);
			} else {
				this.LegContainerBack.addChild(Sprite);
			}
		}
	}

	makeFallLegs() {
		this.FallLegSprites = [];
		for(let i = 0; i < this.LegCount; i++) {
			const SpriteName = i < 4 ? "Fall_Side" : "Fall_Front";
			const Sprite = new ESPAnimatedSprite(ImageManager.loadESPPlayerLegs(SpriteName), 4);
			Sprite.anchor.set(0.5);
			this.FallLegSprites.push(Sprite);
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

			if(dir === 10) {
				this.JumpLegSprites.forEach(s => s.await());
			} else if(dir === 11) {
				this.FallLegSprites.forEach(s => s.await());
			}

			this.refreshJumpLegs();
			this.refreshFallLegs();
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

	refreshIdleLegs() {
		if(!this.isIdle()) {
			this.hideSprites(this.IdleLegSprites);
			return;
		} else {
			this.showSprites(this.IdleLegSprites);
		}

		const Furthest = 6;
		const IsLeft = this.Direction === 4;

		const Sprites = this.IdleLegSprites;

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

	refreshJumpLegs() {
		if(!this.isJumping()) {
			this.hideSprites(this.JumpLegSprites);
			return;
		} else {
			if(!this.showSprites(this.JumpLegSprites)) {
				//this.JumpLegSprites.forEach(s => s.await());
			}
		}

		const Furthest = 6;

		const Sprites = this.JumpLegSprites;

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

	refreshFallLegs() {
		if(!this.isFalling()) {
			this.hideSprites(this.FallLegSprites);
			return;
		} else {
			if(!this.showSprites(this.FallLegSprites)) {
				//this.FallLegSprites.forEach(s => s.await());
			}
		}

		const Furthest = 6;

		const Sprites = this.FallLegSprites;

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

	update() {
		super.update();
		this.updateContainers();
		this.updateBodySprite();
		this.updateDirection();
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
			this.BodySprite.move(-2, 2 - (Offset >= 2 ? 2 : 0) - this._bodyOffsetY);
		}

		if(Input.Input4Dir === 6) {
			this.BodySprite.scale.set(1, 1);
		} else if(Input.Input4Dir === 4) {
			this.BodySprite.scale.set(-1, 1);
		}
	}

	updateDirection() {
		this.setDirection($espGamePlayer.isJumping() ? 10 : ($espGamePlayer.isFalling() ? 11 : Input.Input4Dir));
	}

	updateShadowSprite() {
		if(this.espObject.position.z > 0) {
			this.ShadowSprite.scale.set(((200 - this.espObject.position.z) / 200.0).clamp(0.3, 1));
		} else {
			this.ShadowSprite.scale.set(1 + ((this.BodySprite.y - 2 + this._bodyOffsetY) * 0.05));
		}
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}