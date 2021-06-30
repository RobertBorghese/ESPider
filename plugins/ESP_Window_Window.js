// ____
//|    |
//| hi | <- me saying "hi" inside a window
//|____|

modify_Window_Selectable = class {
	processCursorMove() {
		ESP.Window_Selectable.processCursorMove.apply(this, arguments);
		if(this.isCursorMovable()) {
			const lastIndex = this.index();
			if(Input.isRepeated("s") || Input.isDirectionTriggered("down")) {
				this.cursorDown(Input.isTriggered("s"));
			}
			if(Input.isRepeated("w") || Input.isDirectionTriggered("up")) {
				this.cursorUp(Input.isTriggered("w"));
			}
			if(Input.isRepeated("d") || Input.isDirectionTriggered("right")) {
				this.cursorRight(Input.isTriggered("d"));
			}
			if(Input.isRepeated("a") || Input.isDirectionTriggered("left")) {
				this.cursorLeft(Input.isTriggered("a"));
			}
		}
	}

	isOkTriggered() {
		return false;
	}
}
