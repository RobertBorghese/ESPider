// TIME TO WRITE MY OWN GODDAMN INTERPRETER AS IF THIS SHIT WASNT HARD ENOUGH
// (note: in retrospect, this isnt really interpreter, just async action executer)

class ESPInterpreter {
	constructor() {
		this._list = [];
		this._index = -1;
		this._updateFunc = null;
		this._input = null;
		this._waitTime = 0;
	}

	update() {
		if(this._updateFunc === null || this._updateFunc()) {
			this.increment();
		}
		return this._updateFunc === null;
	}

	increment() {
		this._index++;
		if(this._index < this._list.length) {
			this._input = this._list[this._index][0].call(this);
			this._updateFunc = this._list[this._index][1].bind(this, this._input);
		} else {
			this._updateFunc = null;
		}
	}

	setVariable(varId, value) {
		this._list.push([
			function() {
				$gameVariables._data[varId] = value;
			},
			function() {
				return true;
			}
		]);
		return this;
	}

	incrementVariable(varId, amount = 1) {
		const value = $gameVariables.value(varId);
		return this.setVariable(varId, value + amount);
	}

	bitBoolVariable(varId, amount) {
		const val = $gameVariables.value(varId);
		return this.setVariable(varId, val | amount);
	}

	wait(amount) {
		this._list.push([
			function() {
				this._waitTime = amount;
			},
			function() {
				this._waitTime--;
				return this._waitTime <= 0;
			}
		]);
		return this;
	}

	save() {
		this._list.push([
			function() {
				$gameMap.saveRespawnPosAndSave(-1);
			},
			function() {
				return true;
			}
		]);
		return this;
	}
	
	moveCameraTo(x, y) {
		this._list.push([
			function() {
				SceneManager._scene.setCameraTargetXY(x, y);
			},
			function() {
				return SceneManager._scene.isCameraAtTarget();
			}
		]);
		return this;
	}

	moveCameraToGrid(x, y) {
		return this.moveCameraTo(x * TS, y * TS);
	}

	moveCameraToPlayer() {
		this._list.push([
			function() {
				SceneManager._scene.setCameraToPlayer();
			},
			function() {
				return SceneManager._scene.isCameraAtTarget(Graphics.height / 2);
			}
		]);
		return this;
	}

	closeSpearWall(name) {
		this._list.push([
			function() {
				const obj = $gameMap.findObject(name);
				if(obj && obj.hideSpears) {
					obj.hideSpears();
				}
				return obj;
			},
			function(obj) {
				return !obj.isChanging();
			}
		]);
		return this;
	}
}
