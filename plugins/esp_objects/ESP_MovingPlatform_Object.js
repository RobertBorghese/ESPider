// This is where the true platforming begins!!

/*:
 * @command Platform
 * @text Options for platform.
 * @desc
 *
 * @arg Collision Height
 * @desc
 * @type number
 * @default 1
 *
 * @arg Points
 * @desc The list of points to travel to.
 * @type multiline_string
 * @default []
 *
 * @arg Duration
 * @desc
 * @type number
 * @default 300
 *
 * @arg Offset Time
 * @desc
 * @type number
 * @default 0
 * 
 * @arg Platform Width
 * @desc
 * @type number
 * @default 1
 *
 * @arg Platform Height
 * @desc
 * @type number
 * @default 1
 * 
 * @arg Orbit Movement
 * @desc
 * @type boolean
 * @default false
 * 
 * @arg Orbit Radius
 * @desc
 * @type number
 * @default 76
 * 
 * @arg Orbit X
 * @desc
 * @type string
 * @default 0
 * 
 * @arg Orbit Y
 * @desc
 * @type string
 * @default 0
 */

class ESPMovingPlatformObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);

		this._espParent = data?.["Parent"] ?? null;
		this._espChildren = !!this._espParent ? null : [];
		this._collisionHeight = parseInt(data?.["Collision Height"]) ?? 1;
		this._width = parseInt(data?.["Platform Width"]) ?? 1;
		this._height = parseInt(data?.["Platform Height"]) ?? 1;

		this._offsetTime = parseInt(data["Offset Time"]) || 0;

		this._orbit = data["Orbit Movement"] === "true";
		this._orbitRadius = parseInt(data["Orbit Radius"]) || 76;
		this._orbitX = parseInt(data["Orbit X"]) || 0;
		this._orbitY = parseInt(data["Orbit Y"]) || 0;
		this._orbitOffsetX = parseFloat(data["Orbit Offset X"]) || 0;
		this._orbitOffsetY = parseFloat(data["Orbit Offset Y"]) || 0;

		const points = data?.["Points"];
		if(Array.isArray(points)) {
			this._points = points;
		} else if(typeof points === "string") {
			try {
				this._points = JSON.parse(data?.["Points"] ?? "[]");
			} catch(e) {
				console.error(e);
				this._points = [];
			}
		} else {
			this._points = null;
		}

		this._imageType = data?.["Image Type"] ?? ((this._width > 1 || this._height > 1) ? (this._width > 1 && this._height === 1 ? 50 : 0) : -1);

		this.deltaX = 0;
		this.deltaY = 0;

		this.oldX = 0;
		this.oldY = 0;

		this._time = this._offsetTime;
		this._maxTime = parseInt(data?.["Duration"]) ?? 300;
	}

	onCreate() {
		super.onCreate();
		this.position.z = this._collisionHeight * TS;
		this.setupChildren();
	}

	constructSprite() {
		if(!this._spr) {
			this._spr = new ESPMovingPlatformSprite(this, this._imageType, this._width, this._height, this._espParent);
		}
		return this._spr;
	}

	isMovingPlatform() {
		return true;
	}

	standCollisionHeight() {
		return Math.floor(this.realZ() / TS);
	}

	topCollisionZ() {
		return this.realZ();
	}

	collideBottom() {
		return false;
	}

	getAllSiblings() {
		if(this._espParent) {
			return this._espParent.getAllSiblings();
		}
		return this._espChildren;
	}

	onPlayerStepOn() {
	}

	canTouch() {
		return true;
	}

	childrenClass() {
		return ESPMovingPlatformObject;
	}

	setupChildren() {
		if(this._width > 1 || this._height > 1) {
			for(let x = 0; x < this._width; x++) {
				for(let y = 0; y < this._height; y++) {
					if(x === 0 && y === 0) continue;
					let newPoints = null;
					if(this._points) {
						newPoints = JSON.parse(JSON.stringify(this._points));
						for(let i = 0; i < newPoints.length; i++) {
							newPoints[i][1] += x;
							newPoints[i][2] += y;
						}
					}
					let imageType = 0;
					if(x === 0) imageType = (y === 0 ? 0 : (y === this._height - 1 ? 6 : 3));
					else if(x === this._width - 1) imageType = (y === 0 ? 2 : (y === this._height - 1 ? 8 : 5));
					else imageType = (y === 0 ? 1 : (y === this._height - 1 ? 7 : 4));

					if(this._height === 1) {
						if(imageType === 0) imageType = 50;
						else if(imageType === 1) imageType = 51;
						else if(imageType === 2) imageType = 52;
					}
					const cls = this.childrenClass();
					const obj = new cls({
						"Collision Height": this._collisionHeight,
						"Platform Width": 1,
						"Platform Height": 1,
						"Points": newPoints,
						"Duration": this._maxTime,
						"Offset Time": this._offsetTime,
						"Image Type": imageType,
						"Shadowless": true,
						"Parent": this,
						"Orbit Movement": this._orbit ? "true" : "false",
						"Orbit Radius": this._orbitRadius,
						"Orbit X": this._orbitX,
						"Orbit Y": this._orbitY,
						"Orbit Offset X": x,
						"Orbit Offset Y": y
					});
					$gameMap.addGameObject(obj, this.position.x + (x * TS), this.position.y + (y * TS));
					this._espChildren.push(obj);
				}
			}
		}
	}

	update() {
		super.update();
		this.updateMovement();
	}

	updateMovement() {
		if(!this._points) return;
		this.oldX = this.position.x;
		this.oldY = this.position.y;

		this._time++;
		if(this._time > this._maxTime) {
			this._time = 0;
		}

		let resultData = null;
		if(this._orbit) {
			const r = Math.PI * 2 * (this._time / this._maxTime);
			const x = Math.round((Math.cos(r) * this._orbitRadius) + (this._orbitX * TS));
			const y = Math.round((Math.sin(r) * this._orbitRadius) + (this._orbitY * TS));
			this.position.x = x + (this._orbitOffsetX * TS);
			this.position.y = y + (this._orbitOffsetY * TS);
			this.position.z = (this._collisionHeight - this.CollisionHeight) * TS;
		} else if(this._points.length > 1) {
			const ratio = this._time / this._maxTime;
			const len = this._points.length;
			for(let i = 0; i < len; i++) {
				if(i + 1 >= len) {
					resultData = this._points[i];
					break;
				} else if(ratio >= this._points[i][0] && ratio < this._points[i + 1][0]) {
					const first = this._points[i];
					const second = this._points[i + 1];
					let r = (ratio - first[0]) / (second[0] - first[0]);
					if(first[4] && Easing["ease" + first[4]]) {
						r = Easing["ease" + first[4]](r);
					}
					resultData = [
						ratio,
						ESP.lerp(first[1], second[1], r),
						ESP.lerp(first[2], second[2], r),
						ESP.lerp(first[3], second[3], r)
					];
					break;
				} else if(ratio < this._points[i][0]) {
					resultData = this._points[i];
					break;
				}
			}
		} else if(this._points.length === 1) {
			resultData = this._points[0];
		}

		if(resultData !== null) {
			this.position.x = (resultData[1] * TS) + (TS / 2);
			this.position.y = (resultData[2] * TS) + (TS / 2);
			this.position.z = resultData[3] * TS;
		}

		this.deltaX = this.position.x - this.oldX;
		this.deltaY = this.position.y - this.oldY;
	}
}

Game_Map.presetObjects[11] = ESPMovingPlatformObject;
