// Gotta get rid of some default behavior.

modify_Game_Player = class {
	triggerTouchActionD1(x1, y1) {
		return $gameMap.setupStartingEvent();
	}

	triggerTouchActionD2(x2, y2) {
		return $gameMap.setupStartingEvent();
	}

	update() {
	}

	setupForNewGame() {
		ESP.Game_Player.setupForNewGame.apply(this, arguments);
		// skip intro when testing and holding a s and d
		if($gameTemp.isPlaytest() && (!Input.isPressed("a") || !Input.isPressed("s") || !Input.isPressed("d"))) {
			$gameTemp._isNewGame = true;
		}
	}
}

// this is dumb annoying feature. GET DISTABLED!! >:3
SceneManager.isGameActive = function() {
	return true;
}
