// im feeling 5/10 right now

modify_ConfigManager = class {
	static makeData() {
		const config = ESP.ConfigManager.makeData.apply(this, arguments);
		config.masterVolume = Math.floor(WebAudio._masterVolume * 100);
		return config;
	}

	static applyData(config) {
		ESP.ConfigManager.applyData.apply(this, arguments);
		WebAudio.setMasterVolume(((config.masterVolume ?? 100) / 100) ?? 1);
	}

	static incrementVolume() {
		let masterVolume = Math.floor(WebAudio._masterVolume * 100);
		if(masterVolume > 20) {
			masterVolume -= 20;
		} else if(masterVolume === 20) {
			masterVolume = 10;
		} else if(masterVolume === 10) {
			masterVolume = 5;
		} else if(masterVolume <= 5) {
			masterVolume -= 1;
		}
		if(masterVolume < 0) {
			masterVolume = 100;
		}
		WebAudio.setMasterVolume(masterVolume / 100);
		ConfigManager.save();
		return masterVolume;
	}
}
