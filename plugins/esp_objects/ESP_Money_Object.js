// Aiight, the first v1.1 file!! HERE WE GO

/*:
 * @command InfoBeetle
 * @text Options for money.
 * @desc
 *
 * @arg Shift X Ratio
 * @desc 
 * @type text
 * @default 0
 *
 * @arg Shift Y Ratio
 * @desc 
 * @type text
 * @default 0
 *
 * @arg Z Position
 * @desc 
 * @type number
 * @default 0
 */

class ESPMoneyObject extends ESPGameObject {
	constructor(data) {
		super(data);

		this._eventData = data;

		this.position.set(0, 0, 0);
		this.speed.set(0, 0, 0);
		this._touched = false;
		this.CanCollide = false;

		this._uniqueId = (ESPMoneyObject.lastUniqueId++);
	}

	onCreate() {
		if(this._eventData["Shift X Ratio"] !== "0") {
			const ratioX = parseFloat(this._eventData["Shift X Ratio"]);
			if(ratioX !== 0 && !isNaN(ratioX)) {
				this.position.x += (ratioX * TS);
			}
		}

		if(this._eventData["Shift Y Ratio"] !== "0") {
			const ratioY = parseFloat(this._eventData["Shift Y Ratio"]);
			if(ratioY !== 0 && !isNaN(ratioY)) {
				this.position.y += (ratioY * TS);
			}
		}

		this._desiredZ = 0;
		this.position.z = 0;
		if(this._eventData["Z Position"] !== "0") {
			const posZ = parseFloat(this._eventData["Z Position"]);
			if(posZ !== 0 && !isNaN(posZ)) {
				this.position.z = posZ;
				this._desiredZ = posZ;
			}
		}

		this.updateCollisionHeight();
		//this.updatePosition();
	}

	condition() {
		return !$espGamePlayer.hasNomiBeenTaken($gameMap.mapId(), this._uniqueId);
	}

	constructSprite() {
		return new ESPMoneySprite(this);
	}

	update() {
		if(!this._touched) this.position.z = this._desiredZ;

		super.update();

		/*if(!this._touched) {
			if(this.position.z < 0) {
				this.speed.z = 0;
				this.position.z = 0;
			}
		}*/

		if(!this._touched) {
			const dist = this.getDistance($espGamePlayer);
			if(dist <= 26) {
				this._touched = true;

				ESPAudio.nomiGet();
				$espGamePlayer.incrementNomi($gameMap.mapId(), this._uniqueId);
				this.CanCollide = false;
				//$gameMap.shake();
			} else if(dist <= 50) {
				const pow = 0.01 + (1 - ((dist - 26) / 26)) * 0.09;
				this.position.x += ($espGamePlayer.position.x - this.position.x) * pow;
				this.position.y += ($espGamePlayer.position.y - this.position.y) * pow;
				this.position.z += ($espGamePlayer.position.z - this.position.z) * 0.2;
			}
		}
	}


	updateConsumeAnimation(speedZ) {
		this.position.x = ESP.lerp(this.position.x, $espGamePlayer.position.x - 2, 0.5);
		this.position.y = ESP.lerp(this.position.y, $espGamePlayer.position.y, 0.5);
		this.position.z += speedZ;
	}

	execute() {
		$gameMap.removeGameObject(this);
	}
}

Game_Map.presetObjects[27] = ESPMoneyObject;
