
// This will probably be hte coolest thing in this game. What sells it honestly. The main gimmick. 
// Only took until July 7th, half way through to begin XD

/*:
 * @command SpearWall
 * @text Options for spear wall.
 * @desc
 *
 * @arg Width
 * @desc 
 * @type number
 * @default 2
 *
 * @arg Starting State
 * @type select
 * @option Up
 * @value up
 * @option Down
 * @value down
 * @desc
 * @default up
 */

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
	
	connect(obj) {
		this._connections.push(obj);

		const graphics = new PIXI.Graphics();
		this._spr._webHolder.addChild(graphics);
		this._graphics.push(graphics);
	}

	disconnect(obj) {
		const index = this._connections.indexOf(obj);
		this._connections.remove(obj);

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
		super.update();

		for(let i = 0; i < this._connections.length; i++) {
			const obj = this._connections[i];
			if(obj._isDead) {
				this.disconnect(obj);
				i--;
				continue;
			}
			const graphics = this._graphics[i];
			graphics.clear();
			graphics.lineStyle(2, 0xffffff, 0.8);
			graphics.moveTo(obj.position.x - this.position.x, (obj.position.y - 40) - (this.position.y));
			graphics.lineTo(0, -40);

			const distance = this.getDistance2d(obj);
			if(distance < 100) {
				const ratio = (distance / 100) * 0.1;

				if(obj.position.x < this.position.x) {
					obj.speed.x += ratio;
				} else if(obj.position.x > this.position.x) {
					obj.speed.x -= ratio;
				}

				if(obj.position.y < this.position.y) {
					obj.speed.y += ratio;
				} else if(obj.position.y > this.position.y) {
					obj.speed.y -= ratio;
				}
			} else {
				this.disconnect(obj);
				i--;
			}
		}

		if(this._deleteNextFrame) {
			this._deleteNextFrame = false;

			//this._showTime = 0;
			this._isOpen = this._showAnimation === 1 ? true : false;
			this._showAnimation = 0;
			/*if(!this._isOpen) {
				this.disconnectAll();
			}*/
		} else if(this.isChanging()) {
			this._showTime += 0.04 * (this._showAnimation === 1 ? 1 : -1);

			this._animationState = Easing.easeOutCubic(this._showTime);

			if((this._showAnimation === 1 && this._showTime >= 1) ||
				(this._showAnimation === 2 && this._showTime <= 0)) {

				this._deleteNextFrame = true;
			}
		} else {
			//this._animationState = 1;
		}
	}

	centerX() {
		return this.position.x + ((TS / 2) * (this._width - 1).clamp(0, 99));
	}

	open() {
		if(!this._isOpen) {
			//this._isOpen = true;
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
