// ____
//|    |
//| hi | <- me saying "hi" inside a window
//|____|

modify_Window_Selectable = class {
	processCursorMove() {
		ESP.Window_Selectable.processCursorMove.apply(this, arguments);
		if(this.isCursorMovable()) {
			const lastIndex = this.index();
			if(Input.isRepeated("s")) {
				this.cursorDown(Input.isTriggered("s"));
			}
			if(Input.isRepeated("w")) {
				this.cursorUp(Input.isTriggered("w"));
			}
			if(Input.isRepeated("d")) {
				this.cursorRight(Input.isTriggered("d"));
			}
			if(Input.isRepeated("a")) {
				this.cursorLeft(Input.isTriggered("a"));
			}
		}
	}

	isOkTriggered() {
		return false;
	}
}
