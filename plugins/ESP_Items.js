// i really hope people enjoy this system. im kinda terrified im going to put in all this effort only for no one to ever play this update ever. it sucks, but risks must be taken for the future. if theres someone out there reading this, i really appreciate you. thank you for taking your time. if you have any questions or wanna talk, please tell me you read "ESP_Items.js", and I'll promise to be your friend forever

class ESPItem {
	constructor(name, description, storeDesc, iconUrl, price, iconFrameDelay, useOnce, buyOnce, behavior, isService = false, response = null) {
		this.id = -1;
		this.name = name;
		this.description = description;
		this.storeDesc = storeDesc;
		this.iconUrl = iconUrl;
		this.iconFrameDelay = iconFrameDelay;
		this.price = price;
		this.behavior = behavior;
		this.useOnce = useOnce;
		this.buyOnce = buyOnce;
		this.isService = isService;
		this.response = response;
	}

	static setupItems() {
		this.items = [
			new ESPItem(
				"Shield",
				"Adds shield to spider.",
				"A portable shield that can be activated anywhere!\nCareful where you choose to use it!",
				"img/other/Shield.png",
				99,
				4,
				true,
				false,
				() => {
					$espGamePlayer.addTempShield();
				}
			),

			new ESPItem(
				"Shield Recycle",
				"Convert shields to NOMI.",
				"This converts all active shields to 100 NOMI each.\nIt can be used infinitely, so I highly recommend it!",
				"img/other/Recycle.png",
				151,
				3,
				false,
				true,
				() => {
					if(!$espGamePlayer.hasShield()) {
						$espGamePlayer.showInfoText("(No shields active.)", 60, 17);
					} else {
						$espGamePlayer.addNomi(100 * $espGamePlayer.shields());
						$espGamePlayer.removeShield();
						$espGamePlayer.clearShields();
					}
				}
			),

			new ESPItem(
				"Firefly",
				"Shoot fireballs temporarily.",
				"A helpful friend who will light-up your day!\n(Consuming will allow you to shoot fireballs\ntemporarily instead of Grapple Dashing.)",
				"img/other/FireFly.png",
				27,
				4,
				true,
				false,
				() => {
					$espGamePlayer.showInfoText("Grapple Dash replaced with Fire Ball!", 75, 18);
					$espGamePlayer.setFireMode();
				}
			),

			new ESPItem(
				"Frozen Fly",
				"Shoot iceballs temporarily.",
				"A helpful friend who's cooler than anyone!\n(Consuming will allow you to shoot iceballs\ntemporarily instead of Grapple Dashing.)",
				"img/other/IceFly.png",
				44,
				9,
				true,
				false,
				() => {
					$espGamePlayer.showInfoText("Grapple Dash replaced with Ice Ball!", 75, 18);
					$espGamePlayer.setIceMode();
				}
			),

			new ESPItem(
				"Space Dust",
				"Wallet empty now.",
				"I'm not entirely sure what this is. It fell from the stars.\nMight be important for collectors and completionists,\nso I won't give it away that easily!",
				"img/other/SpaceDust.png",
				1234,
				9,
				false,
				true,
				() => {
					$espGamePlayer.showInfoText("It's time. Everything you worked for...\ncan now finally come together.", 90, 18);
				},
				false,
				"Woah, really?! Thank you!!\nHere's the pile of dust."
			),

			new ESPItem(
				"Some Random Palette",
				"Changes spider's color.",
				"This is a used palette I used to paint a masterpiece.\nUse it to randomize your body's colors.",
				"img/other/Palette.png",
				7,
				3,
				false,
				false,
				(id) => {
					ESPAudio.poof();
					SceneManager._scene._spriteset?._espPlayer?.showPoofParticles?.();
					if($espGamePlayer._hue && Math.random() < 0.2) {
						$espGamePlayer.clearColor();
						$espGamePlayer.showInfoText("The palette broke.", 120);
						$espGamePlayer.removeItem(id);
					} else {
						$espGamePlayer.randomizeColor();
					}
				},
				false,
				"Have fun!!"
			),

			new ESPItem(
				"Metal Palette",
				"Sets spider's color.",
				"This is a durable palette that will never break (I think?).\nIt can be used infinitely (I think?), so I highly recommend it!",
				"img/other/MetalPalette.png",
				11,
				3,
				false,
				false,
				(id) => {
					ESPAudio.poof();
					SceneManager._scene._spriteset?._espPlayer?.showPoofParticles?.();
					if($espGamePlayer._hue && $espGamePlayer.__metalCount >= 10) {
						$espGamePlayer.explodeColor();
						$espGamePlayer.showInfoText("The palette exploded?!", 120);
						$espGamePlayer.removeItem(id);
					} else {
						$espGamePlayer.randomizeColor(true);
					}
				},
				false,
				"Be gentle with it."
			),

			new ESPItem(
				"NOMI Radar",
				"Detects nearby NOMI.",
				"An item that details the number of NOMI and flies left.\nIt can be used infinitely, so I highly recommend it!",
				"img/other/Radar.png",
				202,
				3,
				false,
				true,
				() => {
					const nomi = $gameMap.findObjectGroup("nomi");
					const flies = $gameMap.findObjectGroup("fly");

					let size = 20;
					let text = "";
					if(nomi.length > 0 && flies.length > 0) {
						text = "There are " + nomi.length + " NOMI and a fly in this area!";
					} else if(nomi.length > 0) {
						text = "There are " + nomi.length + " NOMI left in this area!";
					} else if(flies.length > 0) {
						text = "There is a fly in this area!";
					} else {
						text = "(There is nothing left to collect here.)";
						size = 17;
					}

					$espGamePlayer.showInfoText(text, 120, size);
				}
			),

			new ESPItem(
				"Self-Reflection",
				"Shows info about spider.",
				"An item that details the exact stat-changes provided by\nthe flies you've consumed. It can be used infinitely,\nso I highly recommend it!",
				"img/other/LookGlass.png",
				49,
				3,
				false,
				true,
				() => {
					let result = "SPIDER REPORT";
					result += "\n• FLIES EAT: " + $espGamePlayer.flies() + " flies";
					result += "\n• NOMI PULL: +" + Math.floor((($espGamePlayer.nomiDrawDistance() / 50) * 100) - 100) + "%";
					if($gameVariables.value(1) >= 2) {
						result += "\n• WEB ATTCH: ×" + $espGamePlayer.maxConnections() + "";
					}
					if($gameVariables.value(1) >= 3) {
						result += "\n• GRPL DASH: +" + Math.floor(($espGamePlayer.webShotDistanceRatio() * 100) - 100) + "%";
					}
					$espGamePlayer.showInfoText(result, 300, 17);
				}
			),

			new ESPItem(
				"Jared Fanart",
				"It's Jared??",
				//"Hope to make art for a living one day.\nWill you help?? I normally wouldn't put in this much effort...\nbut recently, a lot of people gave me motivation.\nI was even given first place? Me??\n... thank you.",
				"Something I worked really hard on.\nIt even won 1st place in a competition somehow??\nI still find it weird some people enjoyed it so much.\nBut... to all those that did... thank you.",
				"img/other/JaredFanart.png",
				15,
				8,
				false,
				true,
				(id) => {
					if(!window.__jaredFanartUsageCount) window.__jaredFanartUsageCount = 0;
					let text = "";
					switch(window.__jaredFanartUsageCount) {
						case 0:
							text = "The power put into this piece of work is compelling.\nYou feel a sudden urge to leave a positive review.";
							break;
						case 1:
							text = "Please leave a positive review.\nIt would make Jared very happy.";
							break;
						case 2:
							text = "Please leave a positive review.";
							break;
						case 3:
							text = "Please leave. Go to Steam. And give this game a positive review.";
							break;
						case 4:
							text = "That's right, please give Berry a positive review.";
							break;
						case 5:
							text = "I'm begging you.";
							break;
						case 6:
							text = "Welp, at this point, you either did or didn't do it.";
							break;
						case 7:
							text = "Can't help what happens now.";
							break;
						case 8:
							text = "So... uh... how's life?";
							break;
						case 9:
							text = "Dang... just gonna ignore my question and just immediately re-trigger the item?";
							break;
						case 10:
							text = "Ruuuude";
							break;
						case 11:
							text = "Anyway, I'm just gonna keep repeating the same thing.";
							break;
						case 12:
							text = "Good luck! I hope you enjoy the game.";
							break;
						default:
							text = "It's Jared! (as a picture)";
							break;
					}
					window.__jaredFanartUsageCount++;
					$espGamePlayer.showInfoText(text, 120, 18, true);
				},
				false,
				"Thanks for the support! Stare at it multiple times,\nand make sure you don't miss anything in it."
			),

			new ESPItem(
				"Jared",
				"It's Jared!!",
				"Say hello to Jared! He is a wholesome beetle guy.\nProvides infinite energy! Provides infinity light!\nTake him away from me for the low, LOW price of 1 NOMI!",
				"img/other/Jared.png",
				1,
				8,
				false,
				true,
				(id) => {
					const flies = $espGamePlayer.flies();
					if(flies === 0) {
						$espGamePlayer.showInfoText("You passionately cuddle Jared!", 90);
						ESPAudio.cuddleJared();
						for(let i = 0; i < 5; i++) $espGamePlayer.addTempShield();
						$espGamePlayer.removeItem(id);
						$espGamePlayer.addItem(id + 3);
					} else if(flies < 5) {
						$espGamePlayer.showInfoText("You hug Jared.", 90);
						$espGamePlayer.addTempShield();
						$espGamePlayer.removeItem(id);
						$espGamePlayer.addItem(id + 1);
					} else if(flies === 20) {
						$espGamePlayer.showInfoText("You have a slow, and fulfilling meal.\nThere is nothing left.", 240, 14, true);
						ESPAudio.consumeJared();
						for(let i = 0; i < 5; i++) $espGamePlayer.addTempShield();
						$espGamePlayer.removeItem(id);
					} else if(flies > 15) {
						$espGamePlayer.showInfoText("You take a bite.\n... uh-oh, it got away.", 160, 18, true);
						$espGamePlayer.addTempShield();
						$espGamePlayer.removeItem(id);
						$espGamePlayer.addItem(id + 2);
					} else {
						$espGamePlayer.showInfoText("It's Jared!", 90);
					}
				},
				false,
				"Adoption success!!"
			),

			new ESPItem(
				"Hugged Jared",
				"A Jared that's been hugged.",
				"",
				"img/other/Jared.png",
				1,
				8,
				false,
				true,
				(id) => {
					$espGamePlayer.showInfoText("It's Jared! (after a hug)", 90);
				}
			),

			new ESPItem(
				"Remains™",
				"Still some pieces left.",
				"",
				"img/other/Remains.png",
				1,
				8,
				true,
				true,
				(id) => {
					$espGamePlayer.showInfoText("Leftovers night.", 90);
					$espGamePlayer.addTempShield();
				}
			),

			new ESPItem(
				"Jared 2.0™",
				"Finally loved and happy.",
				"",
				"img/other/LovedJared.png",
				1,
				8,
				false,
				true,
				(id) => {
					const flies = $espGamePlayer.flies();
					if(flies === 20) {
						$espGamePlayer.showInfoText("You weren't sure what was more delicious,\nthe legs or the fear and betrayal in its eyes.", 300, 14, true);
						AudioManager.fadeOutBgm(1);
						ESPAudio.consumeJared();
						for(let i = 0; i < 10; i++) $espGamePlayer.addTempShield();
						$espGamePlayer.removeItem(id);
					} else if(flies > 15) {
						$espGamePlayer.showInfoText("You release Jared... before it's too late.", 90);
						$espGamePlayer.removeItem(id);
					} else {
						$espGamePlayer.showInfoText("Jared looks super happy!", 90);
					}
				}
			),

			new ESPItem(
				"Lurker Badge",
				"Hi",
				"A secret badge for those who like to look through source code. Press F8 and type: `$espGamePlayer.addItem(14)` to get!",
				"img/system/Lurker.png",
				1,
				8,
				false,
				false,
				(id) => {
					$espGamePlayer.showInfoText("i would put some interesting behavior here, but youd already know about it before using this item so oh well", 90);
				}
			),

			new ESPItem(
				"Shield Removal Service",
				"",
				"A special service I provide!\nIf you have any active shields on you,\nI will pay you 80 NOMI if you let me take them.\nPlease note shields will not respawn.",
				"img/other/RecycleService.png",
				-80,
				8,
				false,
				false,
				(store) => {
					if(!$espGamePlayer.hasShield()) {
						if(store.setDescriptionText("You do not have any active shields!")) {
							ESPAudio.beeTalk(500);
						}
					} else {
						const s = $espGamePlayer.shields();
						const money = s * 80;
						$espGamePlayer.addNomi(money);
						$espGamePlayer.removeShield();
						$espGamePlayer.clearShields();
						window?.UnlockAchievement?.("tradeshield");
						if(store.setDescriptionText("I have removed all your shields!\nHere is " + money + " NOMI!")) {
							ESPAudio.beeTalk(500);
						}
					}
				},
				true
			),

			new ESPItem(
				"Shield Removal Service 2",
				"",
				"A special service I provide!\nIf you have any active shields on you,\nI will trade you a fly if you let me take them.",
				"img/other/RecycleService2.png",
				0,
				8,
				false,
				true,
				(store) => {
					if(!$espGamePlayer.hasShield()) {
						if(store.setDescriptionText("You do not have any active shields!")) {
							ESPAudio.beeTalk(500);
						}
					} else {
						$espGamePlayer.incrementFlies(($gameMap.mapId() * 100));
						$gameMap.shake();
						$espGamePlayer.removeShield();
						$espGamePlayer.clearShields();
						window?.UnlockAchievement?.("tradeshield");
						if(store.setDescriptionText("I have removed all your shields!\nHere is your new, cute pet fly!\nBe sure to take care of... oh..")) {
							ESPAudio.flyGet();
							//ESPAudio.beeTalk(500);
						}
						return true;
					}
					return false;
				},
				true
			),

			new ESPItem(
				"Honey",
				"Tasty, tasty honey.",
				"",
				"img/other/Honey.png",
				0,
				1,
				false,
				true,
				(id) => {
					$espGamePlayer.showInfoText("Feels nice and jiggly.", 120);
				}
			),

			new ESPItem(
				"Trade for Firecracker",
				"",
				"This is a powerful device made from a Firespitter's shell.\nOnce used, fireballs will shoot out around you.\nIt's very rare and perfect against a difficult opponent.\nIf you can find me two pieces of honey, it's yours.",
				"img/other/Firecracker.png",
				0,
				6,
				false,
				true,
				(store) => {
					if(($espGamePlayer.Items[17] ?? 0) < 2) {
						if(store.setDescriptionText("You don't have enough honey.")) {
							ESPAudio.beeTalk(500);
						}
					} else {
						$espGamePlayer.addItem(19);
						$espGamePlayer.removeItem(17);
						$espGamePlayer.removeItem(17);
						window?.UnlockAchievement?.("tradefirecracker");
						if(store.setDescriptionText("Thank you so much!\nHere you go! Use it wisely.")) {
							ESPAudio.beeTalk(500);
						}
						return true;
					}
					return false;
				},
				true
			),

			new ESPItem(
				"Firecracker",
				"Careful not to drop.",
				"",
				"img/other/Firecracker.png",
				0,
				6,
				true,
				true,
				(id) => {
					function makeFireball(dir) {
						const fireball = new ESPFireballObject(false, 3);
						fireball.setOwner(this);
						fireball.cannotHurtPlayer();
						fireball.CollisionHeight = $espGamePlayer.CollisionHeight;
						const dirX = Math.cos(dir);
						const dirY = Math.sin(dir);
						const spd = 5;
						fireball.speed.set(dirX * spd, dirY * spd, 0);
						$gameMap.addGameObject(
							fireball,
							$espGamePlayer.position.x + (dirX * 40),
							$espGamePlayer.position.y + (dirY * 40),
							$espGamePlayer.position.z + 20
						);
					}

					$espGamePlayer.setTempUpdater(180, function(r, t) {
						if(r <= 0.5 && t % 8 === 0) {
							const dir = (Math.PI * 2) * (r / 0.5);
							makeFireball(dir);
						} else if(t === 179) {
							for(let i = 0; i < 12; i++) makeFireball((Math.PI * 2) * (i / 12));
						} else if(t >= 90 && ((t - 90) % 60) === 0) {
							for(let i = 0; i < 4; i++) makeFireball(((Math.PI * 2) * (i / 4)) + (Math.PI / 4));
						} else if(t >= 90 && ((t - 90) % 30) === 0) {
							for(let i = 0; i < 4; i++) makeFireball(((Math.PI * 2) * (i / 4)));
						}
					});
				}
			),

			new ESPItem(
				"Leave Blackmarket",
				"",
				"Let me know when you want to leave here.\nI'll fly you out of the hole you fell in.",
				"img/other/Blackmarket.png",
				0,
				6,
				false,
				false,
				(store) => {
					ESPAudio.transferOut();
					store._cantLeave = true;
					store._buttons.forEach(b => b.setEnabled(false));
					$espGamePlayer.setTempUpdater(30, function(r, t) {
						if(t !== 29) {
							store.alpha = (1 - r);
							SceneManager._scene._overlay.alpha = r;
						} else {
							store.alpha = 0;
							SceneManager._scene._overlay.alpha = 1;
							$gamePlayer.reserveTransfer(53, 0, 0);
						}
					});
				},
				true
			),
		];

		for(let i = 0; i < this.items.length; i++) this.items[i].id = i;
	}
}

ESPItem.setupItems();
