// the ending code is so large, im making it its own file. guess thisll make it easier for players to lurk and see whats in store if they look at the source code. a win/win
// now this truly is the last source file this game will see
// thanks for reading!
// though, i guess most likely this is the first source file most people will go to
// very ironic
// in that case, fuck off! and dont go readin the other files either! :pout:
// at least complete all 5 endings first
// or not, idk
// im not your mom

ESP.FinalCutscene = function() {
	if(!this.__didCutscene && $espGamePlayer.position.y < (21 * TS)) {
		this.__didCutscene = true;
		const interpreter = new ESPInterpreter();

		const cIn = 60;
		const wait = 140;
		const cOut = 60;

		let ending = 0;

		const flies = $espGamePlayer.flies();
		const sd = $espGamePlayer.hasSpaceParticles();

		if(flies === 0) {
			ending = 0;
		} else if(flies <= 7) {
			ending = 1;
		} else if(flies <= 14) {
			ending = 2;
		} else if(flies <= 19) {
			ending = 3;
		} else if(flies >= 20) {
			ending = sd ? 5 : 4;
		}

		interpreter
		.wait(120)
		.setCameraOffsetEase(0, -612, 280, "easeInOutCubic")
		.wait(120)
		.playMusicOnce("ThemeOfBerry")
		.showPicture("img/pictures/credits/Credits1.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits2.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits3.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits4.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits5.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits6.png", "pic", cIn, wait, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits7.png", "pic", cIn, wait - 80, cOut)
		.wait(10)
		.showPicture("img/pictures/credits/Credits8.png", "pic", cIn, wait, cOut)
		.wait(10);


		interpreter.fadeOut();

		let fin = 4;
		let data = null;
		let achivement = null;
		switch(ending) {
			case 0: {
				data = [
					["img/pictures/Ending/Pacifist1.png"],
					{ text: "What's with...", italic: true, color: 0xb8e8ff },
					{ text: "...these lights?", italic: true, color: 0xb8e8ff },
					{ text: "I'm nowhere close...", italic: true, color: 0xb8e8ff },
					{ text: "So...", italic: true, color: 0xb8e8ff },
					{ text: "hungry...", italic: true, color: 0xb8e8ff },
					{ text: "So...", italic: true, color: 0xb8e8ff },
					{ text: "cold...", italic: true, color: 0xb8e8ff },
					{ text: "Why did you leave me?", italic: true, color: 0xb8e8ff },
					{ text: "I'm still a good spider.", italic: true, color: 0xb8e8ff },
					{ text: "Just like we promised.", italic: true, color: 0xb8e8ff },
					{ text: "help...", italic: true, color: 0xb8e8ff },
					[
						"img/pictures/Ending/TruePacifist1.png",
						"img/pictures/Ending/TruePacifist2.png",
						"img/pictures/Ending/TruePacifist3.png"
					],
					{ text: "\"Oh?! What's this??\"", color: 0xdcdee0 },
					{ text: "\"It's Berry! The friendly spider!\"", color: 0xc8cacc },
					{ text: "\"Protector of this mountain!\"", color: 0x999c9e },
					{ text: "\"Is he okay??!\"", color: 0xdcdee0 },
					{ text: "\"Hurry! Grab that leg!\"", color: 0xc8cacc },
					{ text: "\"Let's get him out of here!\"", color: 0x999c9e },
					{ text: "\"Can you hear us? Don't worry.\"", color: 0xdcdee0 },
					{ text: "\"He's going to be okay now, right?\"", color: 0xc8cacc },
					{ text: "...", color: 0xffffff },
					{ text: "\"Yes.\"", color: 0xffb8b8 },
					{ text: "\"Take him with us. Let's save our hero.\"", color: 0xffb8b8 },
				];
				if(sd) {
					data[18].text = "What's this weird purple dust on him?";
					data[19].text = "Forget it! Focus on moving him!";
				}
				fin = 1;
				achivement = "pacifistending";
				break;
			}
			case 1: {
				data = [
					["img/pictures/Ending/Pacifist1.png"],
					{ text: "What's with these... lights?", italic: true, color: 0xb8e8ff },
					{ text: "I'm nowhere close...", italic: true, color: 0xb8e8ff },
					{ text: "Did she lie to me...", italic: true, color: 0xb8e8ff },
					{ text: "... like everyone else?", italic: true, color: 0xb8e8ff },
					{ text: "Does she hate me...", italic: true, color: 0xb8e8ff },
					{ text: "... like everyone else?", italic: true, color: 0xb8e8ff },
					{ text: "I'm so cold...", italic: true, color: 0xb8e8ff },
					{ text: "Please help...", italic: true, color: 0xb8e8ff },
					{ text: "I'm still a good spider.", italic: true, color: 0xb8e8ff },
					{ text: "Just like we promised. I still have my leaf...", italic: true, color: 0xb8e8ff },
					{ text: "Please... don't abandon me...", italic: true, color: 0xb8e8ff },
					["img/pictures/Ending/Pacifist2.png"],
					{ text: "It's so dark...", color: 0xb8e8ff },
					{ text: "I should have...", color: 0xb8e8ff },
					{ text: "... consumed more.", color: 0xb8e8ff },
					{ text: "At least then...", color: 0xb8e8ff },
					{ text: "... I wouldn't be the one to die.", color: 0xb8e8ff },
					{ text: "You sent me...", color: 0xb8e8ff },
					{ text: "... to a web that consumes spiders.", color: 0xb8e8ff },
					{ text: "I understand.", color: 0xa3cfe3 },
					{ text: "I...", color: 0x88acbd },
					{ text: "...", color: 0x6b8896 },
					{ text: "...", color: 0x40535c },
				];
				fin = 2;
				achivement = "hungryending";
				break;
			}
			case 2: {
				data = [
					["img/pictures/Ending/Pacifist1.png"],
					{ text: "I'm as high as can be.", italic: true, color: 0xb8e8ff },
					{ text: "But these lights still tiny.", italic: true, color: 0xb8e8ff },
					{ text: "This.. is interesting!", italic: true, color: 0xb8e8ff },
					{ text: "I can't wait to tell her everything!", italic: true, color: 0xb8e8ff },
					{ text: "...", italic: true, color: 0xb8e8ff },
					{ text: "That's right. I don't know where she is.", italic: true, color: 0xb8e8ff },
					{ text: "Even though I still have my leaf.", italic: true, color: 0xb8e8ff },
					{ text: "My proof that I would not do bad.", italic: true, color: 0xb8e8ff },
					{ text: "...", italic: true, color: 0xb8e8ff },
					{ text: "... my proof I have not changed...", italic: true, color: 0xb8e8ff },

					["img/pictures/Ending/Touch1.png", "img/pictures/Ending/Touch2.png","img/pictures/Ending/Touch3.png"],

					{ text: "Can these really not be touched?", italic: true, color: 0xb8e8ff },
					{ text: "Mmmm...", italic: true, color: 0xb8e8ff },
					{ text: "That's it!", italic: true, color: 0xb8e8ff },
					{ text: "The world is very bright.", italic: true, color: 0xb8e8ff },
					{ text: "Even if I cannot take them for myself...", italic: true, color: 0xb8e8ff },
					{ text: "... they can still work for me!", italic: true, color: 0xb8e8ff },
					{ text: "Every star will be my new friend!", italic: true, color: 0xb8e8ff },
					{ text: "Let's set off on a new journey!", italic: true, color: 0xb8e8ff },
					{ text: "To find more friends!", italic: true, color: 0xb8e8ff },
					{ text: "And enemies too!", italic: true, color: 0xb8e8ff },
					{ text: "I'm hungry. Better grab a snack as well!", italic: true, color: 0xb8e8ff }
				];
				fin = 4;
				achivement = "neutralending";
				break;
			}
			case 3: {
				data = [
					["img/pictures/Ending/Neutral.png"],
					{ text: "They're beautiful.", italic: true, color: 0xb8e8ff },
					{ text: "I wish you could be here to see it with me.", italic: true, color: 0xb8e8ff },
					{ text: "But... I understand....", italic: true, color: 0xb8e8ff },
					{ text: "Once a spider finds their light...", italic: true, color: 0xb8e8ff },
					{ text: "...nothing can stop them from consuming all other bugs.", italic: true, color: 0xb8e8ff },
					{ text: "I'm glad you could get away before I awakened.", italic: true, color: 0xb8e8ff },
					{ text: "I just wish one last time... we could've...", italic: true, color: 0xb8e8ff },

					["img/pictures/Ending/Awakened.png"],

					{ text: "I... suppose this leaf is pointless now.", italic: true, color: 0xb8e8ff },
					{ text: "But I still like it.", italic: true, color: 0xb8e8ff },
					{ text: "It lets them all recognize me.", italic: true, color: 0xb8e8ff },
					{ text: "That helpful beetle...", italic: true, color: 0xb8e8ff },
					{ text: "That greedy bee...", italic: true, color: 0xb8e8ff },
					{ text: "Those silly worms...", italic: true, color: 0xb8e8ff },
					{ text: "...", italic: true, color: 0xb8e8ff },
					{ text: "Those helpless flies...", italic: true, color: 0xb8e8ff },
					{ text: "...", italic: true, color: 0xb8e8ff },
					{ text: "I suppose I could stay here a while longer.", italic: true, color: 0xb8e8ff }
				];
				fin = 5;
				achivement = "awareending";
				break;
			}
			case 4: {
				data = [
					["img/pictures/Ending/Neutral.png"],
					{ text: "Too far. Too far. They cannot be tasted.", italic: true, color: 0xb8e8ff },
					{ text: "Oh well. There are plenty of treats on this mountain.", italic: true, color: 0xb8e8ff },
					{ text: "Who needs a light anyway.", italic: true, color: 0xb8e8ff },
					{ text: "I'll be a hunter.", italic: true, color: 0xb8e8ff },
					{ text: "As long as the sky is lit, bugs will be anywhere.", italic: true, color: 0xb8e8ff },
					{ text: "This world is my light.", italic: true, color: 0xb8e8ff },
					{ text: "And those insects are my food.", italic: true, color: 0xb8e8ff },
					{ text: "I bet that brown beetle is crunchy.", italic: true, color: 0xb8e8ff },
					{ text: "And that bee? I've always wanted to taste a spicy fly.", italic: true, color: 0xb8e8ff },
					{ text: "I can't stop shaking.", italic: true, color: 0xb8e8ff },
					{ text: "It's time to feast.", italic: true, color: 0xb8e8ff }
				];
				fin = 6;
				achivement = "awakenedending";
				break;
			}
			case 5: {
				data = [
					["img/pictures/Ending/Neutral.png"],
					{ text: "They're beautiful.", italic: true, color: 0xb8e8ff },
					{ text: "I wish you could be here to see it with me.", italic: true, color: 0xb8e8ff },
					{ text: "But... you're not here anymore, are you?", italic: true, color: 0xb8e8ff },
					{ text: "You truly believed in me, a spider.", italic: true, color: 0xb8e8ff },
					{ text: "A beast that consumes all others.", italic: true, color: 0xb8e8ff },
					{ text: "The only reason you wouldn't return is if...", italic: true, color: 0xb8e8ff },
					{ text: "...", italic: true, color: 0xb8e8ff },
					{ text: "But it's okay. I have not forgotten anything.", italic: true, color: 0xb8e8ff },
					{ text: "You will live on in my memory as I take revenge for you.", italic: true, color: 0xb8e8ff },
					{ text: "I will take revenge on all these violent bugs.", italic: true, color: 0xb8e8ff },
					{ text: "And bring peace to this mountain.", italic: true, color: 0xb8e8ff },
					["img/pictures/Ending/Dust.png"],
					{ text: "What's with this dust?", italic: true, color: 0xb8e8ff },
					{ text: "I got it all over myself while trying to hold it.", italic: true, color: 0xb8e8ff },
					{ text: "Yet...", italic: true, color: 0xb8e8ff },
					{ text: "It makes me feel... safe?", italic: true, color: 0xb8e8ff },
					{ text: "My head is so clear.", italic: true, color: 0xb8e8ff },
					{ text: "My body so... light?", italic: true, color: 0xb8e8ff },
					{ text: "I can... fly?", italic: true, color: 0xb8e8ff },
					{ text: "I can fly!", italic: true, color: 0xb8e8ff },
					{ text: "This is the weridest thing I've encountered yet.", italic: true, color: 0xb8e8ff },
					{ text: "But it's just what I needed. This will give me victory.", italic: true, color: 0xb8e8ff },
					{ text: "And once I'm done... I will have no need for this world anymore.", italic: true, color: 0xb8e8ff }
				];
				fin = 8;
				achivement = "trueending";
				break;
			}
		}

		interpreter.startSlideshow(data);

		interpreter.fadeIn()

		.startMovingDownForFinalCredits(180, "img/pictures/Fin/Fin" + fin + ".png")
		.showPicture("img/pictures/credits/Fin.png", "pic", 60, 240, 60)
		.callFunction(() => {
			if(achivement) {
				UnlockAchievement(achivement);
			}
		})
		.wait(10)
		.fadeOut()
		.fadeOutCreditsPicture()
		.wait(10)
		.callFunction(() => SceneManager.goto(Scene_Title));

		$espGamePlayer.setInterpreter(interpreter);

	}
}
