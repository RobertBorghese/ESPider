
// This will probably be hte coolest thing in this game. What sells it honestly. The main gimmick. 
// Only took until July 7th, half way through to begin XD

class ESPWebDeviceObject extends ESPGameObject {
	constructor(data, startOpen) {
		super(data);

		this.position.set(300, 350, 0);
		this.speed.set(0, 0, 0);

		this._startClosed = !startOpen;
		this._showAnimation = 0;
		this._showTime = this._startClosed ? 0 : 1;
		this._animationState = this._startClosed ? 0 : 1;
		this._isOpen = this._startClosed ? false : true;

		this._deleteNextFrame = false;

		this._connections = [];
		this._distances = [];
		this._connectTime = [];
		this._speed = [];
		this._graphics = [];
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPWebDeviceSprite(this, this._startClosed);
		}
		return this._spr;
	}

	saveIndividual() {
		return true;
	}

	saveGroup() {
		return "webdevice";
	}

	isOpen() {
		return this._isOpen;
	}

	isConnectedTo(obj) {
		return this._connections.contains(obj);
	}
	
	maxConnections() {
		return 5;
	}

	connect(obj) {
		if(this._connections.length >= this.maxConnections()) {
			return;
		}

		this._connections.push(obj);

		this._distances.push(this.getDistance2d(obj));

		this._connectTime.push(-12);

		this._speed.push(Vector2._length(obj.speed.x, obj.speed.y));

		const graphics = new PIXI.Graphics();
		this._spr._webHolder.addChild(graphics);
		this._graphics.push(graphics);

		ESPAudio.webDeviceAttach(this.getObjectVolume());
	}

	disconnect(obj) {
		const index = this._connections.indexOf(obj);
		this._connections.remove(obj);

		this._distances.splice(index, 1);
		this._connectTime.splice(index, 1);
		this._speed.splice(index, 1);

		const graphics = this._graphics[index];
		this._spr._webHolder.removeChild(graphics);
		this._graphics.remove(graphics);
	}

	disconnectAll() {
		while(this._connections.length > 0) {
			this.disconnect(this._connections[0]);
		}
	}

	update() {
		if(this.position.z > 0) {
			this.speed.z -= 0.1;
			if(this.speed.z < -10) this.speed.z = -10;
		}

		super.update();

		if(this.position.z < 0) {
			this.speed.z = 0;
			this.position.z = 0;
		}

		for(let i = 0; i < this._connections.length; i++) {
			const obj = this._connections[i];
			if(obj._isDead) {
				this.disconnect(obj);
				i--;
				continue;
			}

			let ratio = 1;
			if(this._connectTime[i] > 0) {
				this._connectTime[i]--;
			} else {
				this._connectTime[i]++;
				ratio = Easing.easeOutCubic(1 - ((-this._connectTime[i]) / 12));
				if(this._connectTime[i] >= 0) {
					ratio = 1;
					this._connectTime[i] = 40000;
				}
			}

			const graphics = this._graphics[i];
			graphics.clear();
			graphics.lineStyle(2, 0xffffff, 0.8);
			graphics.moveTo(0, -20 + this._spr._core.y);

			const desiredDistance = this._distances[i];

			if(ratio < 1) {
				const radians = Math.atan2(this.position.x - obj.position.x, this.position.y - obj.position.y);
				const x = (-Math.sin(radians) * (desiredDistance * ratio));
				const y = (-Math.cos(radians) * (desiredDistance * ratio));
				graphics.lineTo(x, y - 40);
			} else {
				graphics.lineTo(obj.position.x - this.position.x, (obj.position.y - 40) - this.position.y);
			}

			if(this._connectTime[i] === 0) {
				this.disconnect(obj);
				obj.onCollided();
			} else {
				const newX = obj.position.x + obj.speed.x;
				const newY = obj.position.y + obj.speed.y;
				const newDist = Math.sqrt(
					Math.pow(newX - this.position.x, 2) +
					Math.pow(newY - this.position.y, 2)
				);
				if(newDist > desiredDistance) {
					const radians = Math.atan2(this.position.x - newX, this.position.y - newY);
					const spdX = (this.position.x + -Math.sin(radians) * desiredDistance) - obj.position.x;
					const spdY = (this.position.y + -Math.cos(radians) * desiredDistance) - obj.position.y;
					const result = Vector2.normalized(spdX, spdY, this._speed[i]);
					obj.speed.x = result.x;
					obj.speed.y = result.y;
				} else {
					this._distances[i] = newDist;
				}
			}
		}

		if(this._deleteNextFrame) {
			this._deleteNextFrame = false;
			this._isOpen = this._showAnimation === 1 ? true : false;
			this._showAnimation = 0;
		} else if(this.isChanging()) {
			this._showTime += 0.04 * (this._showAnimation === 1 ? 1 : -1);

			this._animationState = Easing.easeOutCubic(this._showTime);

			if((this._showAnimation === 1 && this._showTime >= 1) ||
				(this._showAnimation === 2 && this._showTime <= 0)) {

				this._deleteNextFrame = true;
			}
		}
	}

	centerX() {
		return this.position.x + ((TS / 2) * (this._width - 1).clamp(0, 99));
	}

	open() {
		if(!this._isOpen) {
			this._showAnimation = 1;
		}
	}

	close() {
		if(this._showAnimation !== 2) {
			this._isOpen = false;
			this._showAnimation = 2;
			this.disconnectAll();
		}
	}

	isChanging() {
		return this._showAnimation !== 0;
	}
}

Game_Map.presetObjects[10] = ESPWebDeviceObject;
