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
}

modify_Scene_Map_2 = class {
	processMapTouch() {
	}

	onMapTouch() {
	}

	isMenuCalled() {
		return false;
	}
}
