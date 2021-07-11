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
		["Jump", 0.6],
		["HitGround2", 0.9],
		["FireballShot2", 0.75],
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
		"WebDeviceAttach"
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
}

ESPAudio.setup();
