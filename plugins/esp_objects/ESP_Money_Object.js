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
		this._beingDrawn = false;
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

	saveGroup() {
		return "nomi";
	}

	condition() {
		if(!super.condition()) {
			return false;
		}
		return !$espGamePlayer.hasNomiBeenTaken($gameMap.mapId(), this._uniqueId);
	}

	constructSprite() {
		return new ESPMoneySprite(this);
	}

	update() {
		if(!this._touched && !this._beingDrawn) {
			this.position.z = this._desiredZ;
		}

		if(!this._touched) {
			const dist = this.getDistance($espGamePlayer);
			const catchDist = $espGamePlayer.isDashing() ? 60 : 26;
			if(dist <= catchDist) {
				this._touched = true;

				ESPAudio.nomiGet();
				$espGamePlayer.incrementNomi($gameMap.mapId(), this._uniqueId);
				this.CanCollide = false;
				//$gameMap.shake();
			} else if(dist <= $espGamePlayer.nomiDrawDistance()) {
				this.CanCollide = true;
				this._beingDrawn = true;
				const mdd = $espGamePlayer.nomiDrawDistance();
				const pow = 0.01 + (1 - ((dist - (mdd / 2)) / (mdd / 2))) * 0.09;
				this.speed.x = ($espGamePlayer.position.x - this.position.x) * pow;
				this.speed.y = ($espGamePlayer.position.y - this.position.y) * pow;
				this.speed.z = ($espGamePlayer.realZ() - this.realZ()) * pow;
			} else if(this._beingDrawn) {
				this.speed.set(0, 0, 0);
				this._desiredZ = this.position.z;
				this._beingDrawn = false;
				this.CanCollide = false;
			}
		}

		super.update();

		//if(this.position.z < 0) this.position.z = 0;

		/*if(!this._touched) {
			if(this.position.z < 0) {
				this.speed.z = 0;
				this.position.z = 0;
			}
		}*/

		
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
