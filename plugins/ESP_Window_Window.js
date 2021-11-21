// ____
//|    |
//| hi | <- me saying "hi" inside a window
//|____|

modify_Window_Selectable = class {
	processCursorMove() {
		ESP.Window_Selectable.processCursorMove.apply(this, arguments);
		if(this.isCursorMovable()) {
			const lastIndex = this.index();
			if(Input.isRepeated("s") || Input.isRepeated("dpad_down") || Input.isDirectionTriggered("down")) {
				this.cursorDown(true);
			}
			if(Input.isRepeated("w") || Input.isRepeated("dpad_up") || Input.isDirectionTriggered("up")) {
				this.cursorUp(true);
			}
			if(Input.menuRightRepeated()) {
				this.cursorRight(true);
			}
			if(Input.menuLeftRepeated()) {
				this.cursorLeft(true);
			}
		}
	}

	isOkTriggered() {
		return false;
	}
}
