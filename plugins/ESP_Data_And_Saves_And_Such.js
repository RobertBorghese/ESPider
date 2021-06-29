// Here lays the data and saves and such and stuff.

$espGamePlayer = null;

modify_DataManager = class {
	static createGameObjects() {
		ESP.DataManager.createGameObjects.apply(this, arguments);
		$espGamePlayer = new ESPGamePlayer();
	}

	static makeSaveContents() {
		const contents = ESP.DataManager.makeSaveContents.apply(this, arguments);
		contents.espPlayer = JSON.stringify($espGamePlayer.saveData());
		return contents;
	}

	static extractSaveContents(contents) {
		ESP.DataManager.extractSaveContents.apply(this, arguments);
		$espGamePlayer.loadData(JSON.parse(contents.espPlayer));
	}
}
