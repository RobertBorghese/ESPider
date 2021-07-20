// lets just make this easy for myse;lf. (this is gonna be tedious as hell);

// AudioManager edits

AudioManager.createBuffer = function(folder, name) {
	const ext = (folder === "se/" ? ".wav" : this.audioFileExt());
	const url = this._path + folder + Utils.encodeURI(name) + ext;
	const buffer = new WebAudio(url);
	buffer.name = name;
	buffer.frameCount = Graphics.frameCount;
	return buffer;
};

AudioManager.playSe = function(se) {
	if (se.name) {
		// [Note] Do not play the same sound in the same frame.
		const latestBuffers = this._seBuffers.filter(
			buffer => buffer.frameCount === Graphics.frameCount
		);
		if (latestBuffers.find(buffer => buffer.name === se.name)) {
			return;
		}
		const buffer = this.createBuffer("se/", se.name);
		this.updateSeParameters(buffer, se);
		buffer.play(false);
		this._seBuffers.push(buffer);
		this.cleanupSe();
		return buffer;
	}
	return null;
};

// String extension

String.prototype.lowerCaseFirstOneAndGetRidOfEndNumber = function() {
	const endCharCode = this.charCodeAt(this.length - 1);
	return this.charAt(0).toLowerCase() + (endCharCode >= 48 && endCharCode <= 57 ? this.substring(1, this.length - 1) : this.substring(1));
};

// ESPAudio

class ESPAudio {
	static playSe(name, volume = 100) {
		return AudioManager.playSe({
			name: name,
			volume: volume,
			pitch: 100,
			pan: 0
		});
	}

	static audios = [
		"Footstep2",
		["Jump", 0.6],
		["HitGround2", 0.9],
		"Talk",
		"Whisper",
		["FireballShot2", 0.75],
		["IceballShot", 0.8],
		["SuperFireballShot", 0.5],
		["KeyGet", 0.2],
		"SpearsEnter2",
		"SpearsLeave",
		["SnailDashStart", 0.3],
		["SnailDashCharge2", 0.3],
		["Flashback", 0.5],
		["ButtonPress", 0.75],
		"ButtonUnpress",
		["TriggerBugKill2", 0.4],
		"FallingPlatformTouch",
		["FallingPlatformFall", 0.45],
		["FlyGet", 0.35],
		["DeathContact2", 0.5],
		["DeathExplode", 0.5],
		"TransferIn",
		"TransferOut",
		["WebDeviceAttach", 0.8],
		["GrappleOpen2", 0.8],
		"GrappleRelease",
		["GrappleReady2", 0.6],
		"Checkpoint",
		"Boss1Disappear",

		"BoxDrag",
		["SwitchHit", 0.9],
		["SwitchOn", 0.6],
		["SwitchOff", 0.6],

		"MenuButtonClick",
		"MenuButtonClickCancel",
		"MenuButtonClickSpecial",

		"Boss2Hit",
		"Boss2Defeat",
		"Boss2Footstomp",
		"Boss2Roar",
		"Boss2Clap",
		"Boss2Shot",
		"Boss2ShotBig",
		"Boss2Charge",
		["Boss2Damage2", 0.8],

		"BigSnailDashCharge2",
		["BigSnailDashStart", 0.7],
		["BigSnailDashStartLong", 0.7],
		"BigSnailJump2",
		"BigSnailLand",
		"BigSnailDamage",
		["BigSnailRest2", 0.9],
		"BigSnailBreathe",
		["BigSnailBlock2", 0.9],
		"BigSnailDefeat",

		"WebDash",
		["WebDashHitWall3", 0.4],
		["WebDashChargeStart", 0.5],
		["WebDashChargeMid", 0.2],
		["WebDashChargeFinal", 0.2],

		"TitleSceneText2",
		"TitleSceneConfirm2"
	];

	static setup() {
		const len = this.audios.length;
		for(let i = 0; i < len; i++) {
			const data = this.audios[i];
			const audio = typeof data === "string" ? data : data[0];
			const volume = typeof data === "string" ? 1 : data[1];
			ESPAudio[audio.lowerCaseFirstOneAndGetRidOfEndNumber()] = function(v = 100) {
				if(v > 10) return this.playSe(audio, v * volume);
				return null;
			};
		}
	}

	static pause() {
		this.playSe("MenuButtonClick");
	}

	static unpause() {
		this.playSe("MenuButtonClickCancel");
	}

	static switchAudios = ["C", "D", "F", "G", "A", "C2"];
	static switchSong = [1, 2, 4, 3, 2, 1, 2, 4, 3, 5, 6, 5, 4, 3, 2];
	static menuButtonSwitch() {
		this.playSe("MenuButtonSwitchC", 50);
		return;

		if(this._switchSound === undefined) this._switchSound = -1;
		this._switchSound++;
		if(this._switchSound < 0 || this._switchSound >= this.switchSong.length) {
			this._switchSound = 0;
		}
		this.playSe("MenuButtonSwitch" + this.switchAudios[this.switchSong[this._switchSound] - 1], 100);
	}
}

ESPAudio.setup();
