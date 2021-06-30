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
				this.cursorDown(Input.isTriggered("s"));
			}
			if(Input.isRepeated("w") || Input.isRepeated("dpad_up") || Input.isDirectionTriggered("up")) {
				this.cursorUp(Input.isTriggered("w"));
			}
			if(Input.isRepeated("d") || Input.isRepeated("dpad_right") || Input.isDirectionTriggered("right")) {
				this.cursorRight(Input.isTriggered("d"));
			}
			if(Input.isRepeated("a") || Input.isRepeated("dpad_left") || Input.isDirectionTriggered("left")) {
				this.cursorLeft(Input.isTriggered("a"));
			}
		}
	}

	isOkTriggered() {
		return false;
	}
}
