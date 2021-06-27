// I lost years off my life coming up with this algorithm. Looks so simple in retrospect >.<

Tilemap.prototype._compareChildOrder = function(a, b) {

	// If both sprites are "tilemap walls", do comparison with objects.
	if(a._espWorldObject && b._espWorldObject) {

		{
			const val1 = this._compareChildOrder(a, this._espPlayer);
			const val2 = this._compareChildOrder(b, this._espPlayer);
			if(val1 !== val2) {
				return val1 - val2;
			}
		}

		const sprites = this._espSprites;
		const len = sprites.length;
		for(let i = 0; i < len; i++) {
			const spr = sprites[i];
			if(spr) {
				const val1 = this._compareChildOrder(a, spr);
				const val2 = this._compareChildOrder(b, spr);
				if(val1 !== val2) {
					return val1 - val2;
				}
			}
		}
	}

	// If they exist, compare y and z based on collision positions.
	const az2 = a._colZ ?? 0;
	const bz2 = b._colZ ?? 0;

	let ay2 = a._colY ?? 0;
	let by2 = b._colY ?? 0;

	// If an entity is above another, the back needs to be compared, not the front.
	if(a._espWorldObject && bz2 < az2) {
		ay2 += 48;
		if(typeof b._objY === "number") {
			by2 = b._objY;
		}
	}
	if(b._espWorldObject && az2 < bz2) {
		by2 += 48;
		if(typeof a._objY === "number") {
			ay2 = a._objY;
		}
	}

	// Apply checks.
	if(ay2 !== by2) {
		return ay2 - by2;
	}
	if(az2 !== bz2) {
		return az2 - bz2;
	}
	
	// Normal sort algorithm. Left it inline for performance reasons.
    if (a.z !== b.z) {
        return a.z - b.z;
    } else if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return a.spriteId - b.spriteId;
    }
};
