// Input is what will make this game good. FEEEEEL like a real game.

Input.keyMapper[32] = "space";
Input.keyMapper[87] = "w";
Input.keyMapper[83] = "s";
Input.keyMapper[65] = "a";
Input.keyMapper[68] = "d";

modify_Input = class {
	static clear() {
		ESP.Input.clear.apply(this, arguments);
		this.InputVector = new Vector2(0, 0);
		this.InputDir = 0;
		this.Input4Dir = 0;
		this.InputPressed = false;
		this.TrueTriggerTimer = 0;
		this.TrueTriggeredTimes = [];
	}
	
	static update() {
		ESP.Input.update.apply(this, arguments);
		this.TrueTriggerTimer++;
		this.updateInputVector();
	}

	static _onKeyDown(event) {
		ESP.Input._onKeyDown.apply(this, arguments);
		
		if(!event.repeat) {
			const buttonName = this.keyMapper[event.keyCode];
			if (buttonName) {
				this.TrueTriggeredTimes[buttonName] = this.TrueTriggerTimer + 1;
			}
		}
	}

	static isTriggeredEx(keyName) {
		return (this.TrueTriggeredTimes[keyName] ?? 0) === this.TrueTriggerTimer;
	}
	
	static updateInputVector() {
		this.InputVector.x = 0;
		if(Input.isPressed("a")) this.InputVector.x--;
		if(Input.isPressed("d")) this.InputVector.x++;
	
		this.InputVector.y = 0;
		if(Input.isPressed("w")) this.InputVector.y--;
		if(Input.isPressed("s")) this.InputVector.y++;
	
		this.InputPressed = this.InputVector.length() > 0;
	
		if(this.InputPressed) this.InputVector.normalize();
	
		this.InputDir = Math.round((Input.InputVector.direction() * (180.0 / Math.PI)) / 45);
		if(this.InputDir < 0) this.InputDir = 10 + this.InputDir;
		else if(this.InputDir > 0 && this.InputDir < 4) this.InputDir = 4 - this.InputDir;
		if(this.InputPressed && this.InputDir === 0) this.InputDir = 6;
	
		this.Input4Dir = (this.InputDir === 1 || this.InputDir === 7) ? 4 : ((this.InputDir === 9 || this.InputDir === 3) ? 6 : this.InputDir);
	}
}
