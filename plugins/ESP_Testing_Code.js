
if(Utils.isOptionValid("test")) {
	Game_Variables.prototype.value = function(variableId) {
		//if(variableId === 1) return 2;
		return this._data[variableId] || 0;
	};

	Scene_Boot.prototype.startNormalGame = function() {
		this.checkPlayerLocation();
		DataManager.setupNewGame();
		//SceneManager.goto(Scene_Title);
		SceneManager.goto(Scene_Map);
		Window_TitleCommand.initCommandPosition();
		$gameVariables.setValue(1, 2);
		$gameTemp._isNewGame = false;
	};
}