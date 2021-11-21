// ive definintely gained a lot from this project. this file signifies a difference in coding style since when i started this project. i love it. these are the things that keep me going and make me feel more and more powerful. i get it now. i get it now. i get it now.

class ESPInventoryUseSprite extends ESPAnimatedSprite {
	constructor(url, delay) {
		super(url, delay);

		this._isUsing = false;
		this._time = 0;
	}

	update() {
		super.update();

		if(this._isUsing) {
			if(this._time < 1) {
				this._time += 0.03;
				if(this._time > 1) {
					this._time = 1;
				}
			}
			const espPlayer = SceneManager._scene._spriteset._tilemap._espPlayer;
			this.x = SceneManager._scene._spriteset._tilemap.x + espPlayer.x + espPlayer.PlayerHolder.x;
			this.y = SceneManager._scene._spriteset._tilemap.y + espPlayer.y + espPlayer.PlayerHolder.y - 120;
			this.y += /*(this._initY) + ((targetY - this._initY)*/this._initY * Easing.easeInBack(this._time);
			this.rotation += 0.1;
			if(this._time > 0.5) this.scale.set(3 * (1 - (2 * (this._time - 0.5))));
			if(this._time >= 1) {
				const item = ESPItem.items[this._itemId];
				if(item) {
					item.behavior(this._itemId);

					this.parent.removeChild(this);
					this.destroy();
				}
			}
		}
	}
}

class ESPInventorySprite extends Sprite {
	constructor() {
		super();

		this.updatePosition();

		this._downward = this.y < 100;

		this.Container = new Sprite();
		this.Container.scale.set(0);
		this.addChild(this.Container);

		//this._baseY = this.Text.height * -0.5;
		this.scale.set(2);
		this.anchor.set(0.5, 1);

		this._background = new Sprite(ImageManager.loadBitmapFromUrl("img/other/Inventory.png"));
		//this._background.scale.set(0);
		this._background.anchor.set(0.5, 0.5);
		this._background.y = 10;
		this._background.alpha = 0;
		this._background._time = 0;
		this.Container.addChild(this._background);


		this.ItemContainer = new Sprite();
		this._realIndex = 0;
		this._itemIcons = [];
		const items = $espGamePlayer._totalItems;
		for(let i = 0; i < items.length; i++) {
			const item = ESPItem.items[items[i]];
			const s = new ESPInventoryUseSprite(item.iconUrl, item.iconFrameDelay);
			s.anchor.set(0.5, 1);
			this._itemIcons.push(s);
			this.ItemContainer.addChild(s);
		}
		this.Container.addChild(this.ItemContainer);

		this.Text = new PIXI.Text("", {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 10,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 0.75)",
			strokeThickness: 2,
			lineJoin: "round"
		});
		this.Text.y = 26;
		this.Text.anchor.set(0.5, 1);
		this.Text.resolution = 2;
		this.Container.addChild(this.Text);

		this.TitleText = new PIXI.Text("", {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 12,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 1)",
			strokeThickness: 2,
			lineJoin: "round"
		});
		this.TitleText.y = -22;
		this.TitleText.anchor.set(0.5, 1);
		this.TitleText.resolution = 2;
		this.Container.addChild(this.TitleText);

		this._nomiIcon = new Sprite(ImageManager.loadSystem("MoneyIcon"));
		this._nomiIcon.anchor.set(0.5);
		this._nomiIcon.move(-60, 22);
		this.Container.addChild(this._nomiIcon);

		this.NomiText = new PIXI.Text($espGamePlayer.nomi(), {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 8,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 1)",
			strokeThickness: 2,
			lineJoin: "round"
		});
		this.NomiText.x = -60;
		this.NomiText.y = 38;
		this.NomiText.anchor.set(0.5, 1);
		this.NomiText.resolution = 2;
		this.Container.addChild(this.NomiText);

		this._flyIcon = new Sprite(ImageManager.loadSystem("FlyIcon"));
		this._flyIcon.anchor.set(0.5);
		this._flyIcon.move(60, 22);
		this.Container.addChild(this._flyIcon);

		this.FlyText = new PIXI.Text($espGamePlayer.flies(), {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 8,
			fill: 0xffffff,
			align: "center",
			stroke: "rgba(0, 0, 0, 1)",
			strokeThickness: 2,
			lineJoin: "round"
		});
		this.FlyText.x = 60;
		this.FlyText.y = 38;
		this.FlyText.anchor.set(0.5, 1);
		this.FlyText.resolution = 2;
		this.Container.addChild(this.FlyText);

		this._timer = 0;
		this._confirmedItemId = null;
	}

	update() {
		super.update();

		this.updatePosition();

		const desiredIndex = $espGamePlayer._itemSelectIndex;

		if(this._confirmedItemId === null && typeof $espGamePlayer._confirmedItemId === "number") {
			this._confirmedItemId = $espGamePlayer._confirmedItemId;
			$espGamePlayer._confirmedItemId = null;
			if(this._itemIcons[desiredIndex]) {
				const spr = this._itemIcons[desiredIndex];
				const pos = spr.getGlobalPosition();
				this.ItemContainer.removeChild(spr);
				this.parent.addChild(spr);
				spr.scale.set(3);
				spr.anchor.set(0.5, 0.5);
				const newPos = this.parent.toLocal(pos);
				newPos.y -= (spr.height / 2);
				spr.position = newPos;
				this._itemIcons[desiredIndex] = null;
				spr._itemId = this._confirmedItemId;
				const espPlayer = SceneManager._scene._spriteset._tilemap._espPlayer;
				spr._initY = SceneManager._scene._spriteset._tilemap.y + espPlayer.y + espPlayer.PlayerHolder.y - spr.y;
				spr._isUsing = true;
			}
		}

		this._timer += ESP.WS;

		if(this._lastDesiredIndex !== desiredIndex) {
			this._lastDesiredIndex = desiredIndex;
			this._timer = Math.PI * 10;//desiredIndex % 2 === 0 ? 0 : (Math.PI * 10);

			if(this._itemIcons[desiredIndex]) {
				this.ItemContainer.removeChild(this._itemIcons[desiredIndex]);
				this.ItemContainer.addChild(this._itemIcons[desiredIndex]);
			}
			
		}
		if(this._realIndex < desiredIndex) {
			this._realIndex += (desiredIndex - this._realIndex) * 0.2;
			if(this._realIndex > desiredIndex) {
				this._realIndex = desiredIndex;
			}
		} else if(this._realIndex > desiredIndex) {
			this._realIndex += (desiredIndex - this._realIndex) * 0.2;
			if(this._realIndex < desiredIndex) {
				this._realIndex = desiredIndex;
			}
		}

		if(Math.abs(this._realIndex - desiredIndex) < 0.01) {
			this._realIndex = desiredIndex;
		}

		for(let i = 0; i < this._itemIcons.length; i++) {
			const s = this._itemIcons[i];
			if(!s) continue;
			const off = (i - this._realIndex);
			const offa = Math.abs(off);
			s.x = 50 * Math.sin(off / 2);
			s.y = 15 + (desiredIndex === i ? (4 * Math.sin(this._timer / 10)) : 0);
			s.scale.set((1.5 - (Math.abs(off * 20) / 45)).clamp(0, 2));
		}

		const currItem = ESPItem.items[$espGamePlayer._totalItems[desiredIndex]];
		this.Text.text = $espGamePlayer._totalItems.length === 0 ? "No Items" : (currItem?.description ?? "???");
		this.TitleText.text = $espGamePlayer._totalItems.length === 0 ? "" : currItem?.name;

		/*this._itemSelectIndex = 0;
				this._totalItems = this._calcTotalItems();*/

		if(!this._ending) {
			const b = this._background;

			/*if(Math.abs(1 - b.scale.x) < 0.)

			this._background._xAccel = 0.01;
			this._background._xSpeed = 0.2;
			this._background._yAccel = 0.01;
			this._background._ySpeed = 0;*/

			/*
			if(!this.__hitPeak && b.scale.x < 1.1) {
				if(b.scale.x === 0) b.scale.set(0.1);
				b.scale.set(b.scale.x * 1.3);
				if(b.scale.x > 1.1) {
					this.__hitPeak = true;
				}
			} else if(this.__hitPeak && b.scale.x > 1) {
				b.scale.set(b.scale.x * 0.95);
				if(b.scale.x < 1) b.scale.set(1);
			}
			*/

			if(this._background._time < 1) {
				this._background._time += 0.05;
				if(this._background._time > 1) {
					this._background._time = 1;
				}
			}
			const r = Easing.easeOutCubic(this._background._time);
			this.Container.scale.x = (Easing.easeOutBack(this._background._time)).clamp(0, 999);
			this.Container.scale.y = (this.Container.scale.x > 1 ? 1 - (this.Container.scale.x - 1) : 1).clamp(0, 999);
			this.Container.y = this._downward ? (20 + (-40 + (r * 60))) : (-20 + (40 - (r * 50)));
			b.alpha = (r * 2).clamp(0, 1);

			/*
			if(b.alpha < 1) {
				b.alpha += 0.08;
			}
			*/
		} else {

			if(this._endTime > 0) {
				this._endTime -= 0.05;
				if(this._endTime < 0) {
					this._endTime = 0;
				}
				const r = Easing.easeInCubic(this._endTime);
				this.Container.scale.x = r;
				this.Container.scale.y = 1 + ((1 - r) * 0.5);
				this.Container.alpha = r < 0.3 ? r / 0.3 : 1;
				//this.Container
			} else {
				this.parent.removeChild(this);
				this.destroy();
			}

		}
	}

	updatePosition() {
		if($espGamePlayer._isDying) return;
		const espPlayer = SceneManager._scene._spriteset._tilemap._espPlayer;
		if(espPlayer) {
			this.x = SceneManager._scene._spriteset._tilemap.x + espPlayer.x + espPlayer.PlayerHolder.x - 4;
			this.y = SceneManager._scene._spriteset._tilemap.y + espPlayer.y + espPlayer.PlayerHolder.y - 40;
		}
	}

	end() {
		if(!this._ending) {
			this._ending = true;
			this._endTime = 1;
		}
	}
}
