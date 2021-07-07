// Input is what will make this game good. FEEEEEL like a real game.

Input.keyMapper[27] = "esc";
Input.keyMapper[32] = "space";
Input.keyMapper[87] = "w";
Input.keyMapper[83] = "s";
Input.keyMapper[65] = "a";
Input.keyMapper[68] = "d";

Input.gamepadMapper = {
	0: "button_a",
	1: "button_b",
	2: "button_x",
	3: "button_y",
	4: "button_lb",
	5: "button_rb",
	6: "button_l",
	7: "button_r",
	8: "button_select",
	9: "button_start",
	12: "dpad_up",
	13: "dpad_down",
	14: "dpad_left",
	15: "dpad_right"
};

Input._ESP_isDisabled = false;
/*
Input.update = function() {
    
};
*/
modify_Input = class {
	static clear() {
		ESP.Input.clear.apply(this, arguments);
		this.InputVector = new Vector2(0, 0);
		this.InputDir = 0;
		this.Input4Dir = 0;
		this.InputPressed = false;
		this.TrueTriggerTimer = 0;
		this.TrueTriggeredTimes = [];
		this.GamepadAxis = [];
		this.OldGamepadAxis = [];
		this.IsControlStickDirTriggered = [];
	}
	
	static update() {
		this.TrueTriggerTimer++;
		
		
		this._pollGamepads();
		if(this._currentState[this._latestButton]) {
			this._pressedTime++;
		} else {
			this._latestButton = null;
		}
		for(const name in this._currentState) {
			if(this._currentState[name] && !this._previousState[name]) {
				this.TrueTriggeredTimes[name] = this.TrueTriggerTimer + 1;
				this._latestButton = name;
				this._pressedTime = 0;
				this._date = Date.now();
			}
			this._previousState[name] = this._currentState[name];
		}
		if(this._virtualButton) {
			this._latestButton = this._virtualButton;
			this._pressedTime = 0;
			this._virtualButton = null;
		}
		this._updateDirection();


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

	static isPressed(keyName) {
		if(Input._ESP_isDisabled) return false;
		return ESP.Input.isPressed.apply(this, arguments);
	}

	static isTriggered(keyName) {
		if(Input._ESP_isDisabled) return false;
		return ESP.Input.isTriggered.apply(this, arguments);
	}

	static isTriggeredEx(keyName) {
		if(Input._ESP_isDisabled) return false;
		return (this.TrueTriggeredTimes[keyName] ?? 0) === this.TrueTriggerTimer;
	}

	static isDirectionTriggered(dir) {
		if(Input._ESP_isDisabled) return false;
		const Threshold = 0.5;
		switch(dir) {
			case "right": {
				if(this.GamepadAxis[0] > Threshold && this.OldGamepadAxis[0] < Threshold) {
					return true;
				}
				break;
			}
			case "left": {
				if(this.GamepadAxis[0] < -Threshold && this.OldGamepadAxis[0] > -Threshold) {
					return true;
				}
				break;
			}
			case "down": {
				if(this.GamepadAxis[1] > Threshold && this.OldGamepadAxis[1] < Threshold) {
					return true;
				}
				break;
			}
			case "up": {
				if(this.GamepadAxis[1] < -Threshold && this.OldGamepadAxis[1] > -Threshold) {
					return true;
				}
				break;
			}
		}
	}

	static _updateGamepadState(gamepad) {
		ESP.Input._updateGamepadState.apply(this, arguments);
		this.OldGamepadAxis = this.GamepadAxis;
		this.GamepadAxis = gamepad.axes;
	}

	static updateInputVector() {
		this.InputVector.x = 0;
		this.InputVector.y = 0;

		if(Input._ESP_isDisabled) {
			this.InputDir = 0;
			this.Input4Dir = 0;
			return false;
		}

		const LowThreshold = 0.2;
		const HighThreshold = 0.95;
		const XAxisLength = Math.abs(this.GamepadAxis[0]);
		const YAxisLength = Math.abs(this.GamepadAxis[1]);
		if(XAxisLength > LowThreshold) {
			this.InputVector.x += XAxisLength > HighThreshold ? Math.round(this.GamepadAxis[0]) : this.GamepadAxis[0];
		}
		if(YAxisLength > LowThreshold) {
			this.InputVector.y += YAxisLength > HighThreshold ? Math.round(this.GamepadAxis[1]) : this.GamepadAxis[1];
		}

		if(Input.isPressed("a") || Input.isPressed("dpad_left")) this.InputVector.x--;
		if(Input.isPressed("d") || Input.isPressed("dpad_right")) this.InputVector.x++;

		if(Input.isPressed("w") || Input.isPressed("dpad_up")) this.InputVector.y--;
		if(Input.isPressed("s") || Input.isPressed("dpad_down")) this.InputVector.y++;
	
		this.InputPressed = this.InputVector.length() > 0;
	
		if(this.InputVector.length() >= 1) this.InputVector.normalize();

		const degrees = (Input.InputVector.direction() * (180.0 / Math.PI));
		this.InputDir = Math.round(degrees / 45);
		if(degrees >= -157.5 && degrees < -112.5) {
			this.InputDir = 7;
		} else if((degrees >= -180 && degrees <= -157.5) ||
				(degrees <= 180 && degrees >= 157.5)) {
			this.InputDir = 4;
		} else {
			if(this.InputDir < 0) this.InputDir = 10 + this.InputDir;
			else if(this.InputDir > 0 && this.InputDir < 4) this.InputDir = 4 - this.InputDir;
			if(this.InputPressed && this.InputDir === 0) this.InputDir = 6;
		}

		this.Input4Dir = (this.InputDir === 1 || this.InputDir === 7) ? 4 : ((this.InputDir === 9 || this.InputDir === 3) ? 6 : this.InputDir);
	}
}
