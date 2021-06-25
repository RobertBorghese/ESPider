// Input is what will make this game good. FEEEEEL like a real game.

Input.keyMapper[87] = "w";
Input.keyMapper[83] = "s";
Input.keyMapper[65] = "a";
Input.keyMapper[68] = "d";

ESP.Input_clear = Input.clear;
Input.clear = function() {
	ESP.Input_clear.apply(this, arguments);
	this.InputVector = new Vector2(0, 0);
	this.InputDir = 0;
	this.Input4Dir = 0;
	this.InputPressed = false;
};

ESP.Input_update = Input.update;
Input.update = function() {
	ESP.Input_update.apply(this, arguments);
	this.updateInputVector();
};

Input.updateInputVector = function() {
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
};
