
if(Utils.isOptionValid("test")) {
	Game_Variables.prototype.value = function(variableId) {
		if(variableId === 1) return 2;
		return this._data[variableId] || 0;
	};
}