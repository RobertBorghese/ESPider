// welp this may be the last source file i write before v2 goes out into the world. shouldve had this done yesterday. oh well.

class ESPStore extends Sprite {
	constructor(itemdata, advice, initialQuote) {
		super();

		this._itemdata = itemdata;
		this._advice = advice;
		this._adviceIndex = 0;

		this.anchor.set(0.5);

		this._voidFilter = new PIXI.filters.AlphaFilter();
		this.filters = [this._voidFilter];
		this.alpha = 0;

		this.Overlay = new PIXI.Graphics();
		this.Overlay.beginFill(0x000000, 0.6);
		this.Overlay.drawRect(0, 0, Graphics.width, Graphics.height);
		this.Overlay.endFill();
		this.Overlay.position.set(Graphics.width / -2, Graphics.height / -2);
		this.addChild(this.Overlay);

		this.BeeHolder = new Sprite();
		this.BeeHolder.x = Graphics.width / -4;
		this.BeeHolder.y = 60;
		this.addChild(this.BeeHolder);

		this.Background = new ESPAnimatedSprite("img/other/BeeStand2.png", 2);
		this.Background.anchor.set(0.5, 1);
		this.Background.scale.set(5);
		this.Background.y = 200;
		this.BeeHolder.addChild(this.Background);

		this.Stand = new ESPAnimatedSprite("img/other/BeeStand.png", 2);
		this.Stand.anchor.set(0.5, 1);
		this.Stand.scale.set(5);
		this.Stand.y = 150;
		/*this.Stand.filters = [new PIXI.filters.DropShadowFilter({
			distance: 0,
			blur: 4
		})];*/
		this.BeeHolder.addChild(this.Stand);

		this.Bee = new ESPAnimatedSprite("img/other/Bee.png", 2);
		this.Bee.anchor.set(0.5, 1);
		this.Bee.scale.set(5);
		this.BeeHolder.addChild(this.Bee);

		const NomiIndicatorWidth = 150;

		this.NomiRemaining = new PIXI.Text("Current NOMI: ", {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 20,
			fill: 0xffffff,
			align: "left",
			stroke: "rgba(0, 0, 0, 0.5)",
			strokeThickness: 4
		});
		this.NomiRemaining.anchor.set(0, 0);
		this.NomiRemaining.resolution = 2;
		this.NomiRemaining.x = -70;
		this.NomiRemaining.y = 30;
		this.NomiRemaining.scale.set(1);
		this.BeeHolder.addChild(this.NomiRemaining);

		this.NomiRemainingNum = new PIXI.Text($espGamePlayer.nomi(), {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 20,
			fill: 0xffffff,
			align: "right",
			stroke: "rgba(0, 0, 0, 0.5)",
			strokeThickness: 4
		});
		this.NomiRemainingNum.anchor.set(1, 0);
		this.NomiRemainingNum.resolution = 2;
		this.NomiRemainingNum.x = this.NomiRemaining.x + NomiIndicatorWidth;
		this.NomiRemainingNum.y = this.NomiRemaining.y;
		this.NomiRemainingNum.scale.set(1);
		this.BeeHolder.addChild(this.NomiRemainingNum);

		this.MoneyUnderline = new PIXI.Graphics();
		this.MoneyUnderline.beginFill(0xffffff, 0.7);
		this.MoneyUnderline.drawRect(0, 0, (NomiIndicatorWidth) + 8, 2);
		this.MoneyUnderline.endFill();
		this.MoneyUnderline.beginFill(0x000000, 0.4);
		this.MoneyUnderline.drawRect(2, 2, (NomiIndicatorWidth) + 8, 2);
		this.MoneyUnderline.endFill();
		this.MoneyUnderline.x = this.NomiRemaining.x - 4;
		this.MoneyUnderline.y = this.NomiRemaining.y + this.NomiRemaining.height;
		this.BeeHolder.addChild(this.MoneyUnderline);

		this.Description = new PIXI.Text("", {
			fontFamily: $gameSystem.mainFontFace(),
			fontSize: 26,
			fill: 0xffffff,
			align: "left",
			stroke: "rgba(0, 0, 0, 0.5)",
			strokeThickness: 4
		});
		this.Description.anchor.set(0.5, 1);
		this.Description.resolution = 2;
		this.Description.x = 0;
		this.Description.y = -120;
		this.Description.scale.set(1);
		this.BeeHolder.addChild(this.Description);
		this.setDescriptionText(initialQuote ?? "Welcome Back!")

		this._commandWindow = new Window_Command(new Rectangle(0, 0, 100, 100));
		this._commandWindow.maxCols = function() { return 1; };
		this._commandWindow.x = -1000;
		this._commandWindow.myUpdate = this._commandWindow.update;
		this._commandWindow.update = function() {};
		for(let i = 0; i < itemdata.length; i++) {
			this._commandWindow.addCommand("", i.toString());
		}

		if(!$espGamePlayer.StoreData) {
			$espGamePlayer.StoreData = {};
		}
		const mapId = $gameMap.mapId();
		if(!$espGamePlayer.StoreData[mapId]) {
			$espGamePlayer.StoreData[mapId] = {};
		}
		this._storeData = $espGamePlayer.StoreData[mapId];

		this._moneyTexture = ImageManager.loadSystem("MoneyIcon");
		if(!this._moneyTexture.isReady()) {
			this._moneyTexture.addLoadListener(this.makeButtons.bind(this));
		} else {
			this.makeButtons();
		}
	}

	makeButtons() {
		const itemdata = this._itemdata;

		const buttonWidth = 400;
		const buttonHeight = 50;

		this.ButtonContainer = new Sprite();
		this.ButtonContainer.anchor.set(0, 0.5);
		this.ButtonContainer.x = (buttonWidth / 2) + 12;
		this.ButtonContainer.y = ((60 * itemdata.length) / -2) + 60;
		this.addChild(this.ButtonContainer);

		this._buttons = [];
		for(let i = 0; i < itemdata.length; i++) {
			const data = itemdata[i];
			const x = 0;
			const y = 60 * i;
			const itemId = data.itemId;
			const count = data.count;

			let item = ESPItem.items[itemId];

			if(itemId === -1) {
				item = {
					name: "Talk/Advice",
					storeDesc: "Oh? You'd like some advice?",
					price: 0,
					iconUrl: "img/other/QuestionMarkIcon.png",
					iconFrameDelay: 6,
					behavior: () => {
					}
				};
			}

			if(!item) continue;

			const price = data.price ?? item.price;
			let button = null;
			button = new ESPButton(buttonWidth, buttonHeight, "", 0x355732, 0x71b86c, 0x385237, 0x618c5e, () => {
				this.onItemClick(item, itemId, price);
				button?.unclick();
			}, 2);
			button.x = x;
			button.y = y;
			button._item = item;
			button._itemId = itemId;
			button._price = price;
			//onMouseEnter.bind(pixiObject, i, button)
			button.onMouseEnter = this.onMouseEnter.bind(this, i, button);

			const spr = new Sprite();
			button._graphicsFront.addChild(spr);
			spr._time = 0;
			button._offseter = spr;

			const icon = new ESPAnimatedSprite(item.iconUrl, item.iconFrameDelay);
			icon.anchor.set(0, 0.5);
			icon.scale.set(2);
			icon.x = 8;
			icon.y = (buttonHeight / 2) - 4;
			spr.addChild(icon);

			const text = new PIXI.Text(item.name, {
				fontFamily: $gameSystem.mainFontFace(),
				fontSize: 28,
				fill: 0xffffff,
				align: "left",
				stroke: "rgba(0, 0, 0, 0.5)",
				strokeThickness: 4
			});
			text.anchor.set(0, 0.5);
			text.resolution = 2;
			text.x = icon.x + 48 + 8;
			text.y = (buttonHeight / 2) - 4;
			text.scale.set(1);
			spr.addChild(text);

			const costText = new PIXI.Text(button._price, {
				fontFamily: $gameSystem.mainFontFace(),
				fontSize: 18,
				fill: 0xffffff,
				align: "center",
				stroke: "rgba(0, 0, 0, 0.5)",
				strokeThickness: 4
			});
			costText.anchor.set(0, 0.5);
			costText.resolution = 2;
			costText.x = (buttonWidth) - ((costText.width + this._moneyTexture.width + 32));
			costText.y = (buttonHeight / 2);
			costText.scale.set(1);
			button._graphicsFront.addChild(costText);

			const money = new Sprite(this._moneyTexture);
			money.anchor.set(0, 0.5);
			money.scale.set(2);
			money.x = costText.x + costText.width + 8;
			money.y = costText.y;
			button._graphicsFront.addChild(money);

			this._buttons.push(button);
			this.ButtonContainer.addChild(button);
		}

		this.refreshEnabledButtons();
	}

	update() {
		super.update();

		if(this._isEnding) {
			if(this._isEndingTime > 0) {
				this._isEndingTime--;
			} else if(this.alpha > 0) {
				this.alpha -= 0.05;
				if(this.alpha <= 0) {
					this.onEnd?.();
					this.alpha = 0;
					this.parent.removeChild(this);
					this.destroy();
					return;
				}
			}
		}

		this.Bee.y = Math.sin(ESP.Time / 30) * 12;

		this.NomiRemainingNum.text = $espGamePlayer.nomi();

		if(this.Description._scaleTime < 1) {
			this.Description._scaleTime += 0.04;
			if(this.Description._scaleTime > 1) this.Description._scaleTime = 1;
			this.Description.scale.set(Easing.easeOutBack(this.Description._scaleTime));
		}

		if(this._buttons) {
			for(let i = 0; i < this._buttons.length; i++) {
				const b = this._buttons[i];

				if(b._offseter._time > 0 && !b._espHovered) {
					b._offseter._time -= 0.08;
					if(b._offseter._time < 0) b._offseter._time = 0;
					b._offseter.x = Easing.easeInCubic(b._offseter._time) * 15;
				} else if(b._offseter._time < 1 && b._espHovered) {
					b._offseter._time += 0.08;
					if(b._offseter._time > 1) b._offseter._time = 1;
					b._offseter.x = Easing.easeOutCubic(b._offseter._time) * 15;
				}

				if(!this._isEnding) {
					const childs = b._graphicsFront.children;
					const len = childs.length;
					for(let j = 0; j < len; j++) {
						if(childs[j].update) {
							childs[j].update();
						}
					}
				}
			}
		}

		if(!this._isEnding) {
			if(this.alpha < 1) {
				this.alpha += 0.03;
				if(this.alpha > 1) {
					this.alpha = 1;
				}
			}

			if(this.alpha >= 1) {
				this._commandWindow.myUpdate();
				if(this._commandWindow.active && this._myIndex !== this._commandWindow._index) {
					this._myIndex = this._commandWindow._index;
					this.onMouseEnter(this._myIndex, null, !this._isNotFirstTime);
					this._isNotFirstTime = true;
				}

				if(!this._cantLeave && Input.isCancelTriggeredEx()) {
					this._isEnding = true;
					this._isEndingTime = 30;
					this.setRandomDescriptionText("Thanks for stopping by!", "Good luck!", "Goodbye!");
					ESPAudio.menuButtonClickCancel();
				}
			} else {
				this._commandWindow._index = -1;
			}
		}
	}

	onMouseEnter(index, b, noSound) {
		if(!this._buttons) return;
		const button = this._buttons[index];
		if(this._oldButton !== button) {
			if(this._oldButton) this._oldButton.unhover();
			this._oldButton = button;
			if(this._oldButton) {
				this._oldButton.hover(noSound);
				this.onItemHover(this._oldButton._item, this._oldButton._itemId, this._oldButton._enabled);
			}
		}
		this._commandWindow.select(index);
	}

	setDescriptionText(text) {
		if(this.Description.text !== text) {
			this.Description.text = text;
			this.Description.scale.set(0);
			this.Description._scaleTime = 0;
			return true;
		}
		return false;
	}

	onItemHover(item, itemId, enabled) {
		if(enabled) {
			this.setDescriptionText(item.storeDesc);
		} else {
			this.setRandomDescriptionText(
					"Sorry, only had one of those.",
					"Hope you enjoyed this purchase, only had one!",
					"Out of stock.",
					"I don't have any left."
				);
		}
	}

	setRandomDescriptionText() {
		if(arguments.length < 2) return;
		let result = false;
		while(!result) {
			result = this.setDescriptionText(arguments[Math.floor(Math.random() * arguments.length)]);
		}
	}

	onItemClick(item, itemId, price) {
		if(itemId === -1) {
			let text = this._advice[this._adviceIndex];
			if(this.setDescriptionText(text)) {
				ESPAudio.beeTalk(500);
			}
			this._adviceIndex++;
			if(this._adviceIndex >= this._advice.length) {
				this._adviceIndex = 0;
			}
		} else if(item.isService) {
			if(item.behavior(this)) {
				this._storeData[itemId] = (this._storeData[itemId] ?? 0) + 1;
			}
			this.refreshEnabledButtons();
		} else {
			if($espGamePlayer.nomi() >= price) {
				$espGamePlayer.payNomi(price);
				$espGamePlayer.addItem(itemId);
				if(item.response) {
					this.setDescriptionText(item.response);
					ESPAudio.beeTalk(500);
				} else {
					this.setRandomDescriptionText(
						"Thanks for the support!",
						"Hope you enjoy!",
						"Thanks!",
						"Nice choice!"
					);
				}
				ESPAudio.pay();
				this._storeData[itemId] = (this._storeData[itemId] ?? 0) + 1;
				this.refreshEnabledButtons();
			} else {
				this.setRandomDescriptionText(
					"Sorry, you're going to need more NOMI.",
					"Insufficient NOMI.",
					"Not enough NOMI dude.",
					"You'll need more NOMI than that."
				);
				ESPAudio.beeTalk(500);
			}
		}
	}

	refreshEnabledButtons() {
		for(let i = 0; i < this._buttons.length; i++) {
			const item = this._buttons[i]._item;
			const id = this._buttons[i]._itemId;
			this._buttons[i].setEnabled(item.buyOnce && this._storeData[id] > 0 ? false : true);
		}
	}
}
