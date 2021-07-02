// I lost years off my life coming up with this algorithm. Looks so simple in retrospect >.<

Tilemap.prototype._compareChildOrder = function(a, b) {

	// If both sprites are "tilemap walls", do comparison with objects.
	if(a._espWorldObject && b._espWorldObject) {
		{
			const val1 = Math.sign(this._compareChildOrder(a, this._espPlayer));
			const val2 = Math.sign(this._compareChildOrder(b, this._espPlayer));
			if(val1 !== val2) {
				return val1 - val2;
			}
		}

		const sprites = this._espSprites;
		const len = sprites.length;
		let Total = 0;
		for(let i = 0; i < len; i++) {
			const spr = sprites[i];
			if(spr) {
				const val1 = Math.sign(this._compareChildOrder(a, spr));
				const val2 = Math.sign(this._compareChildOrder(b, spr));
				if(val1 !== val2) {
					Total += (val1 - val2);
				}
			}
		}
		if(Total !== 0) return Total;
	}

	// If they exist, compare y and z based on collision positions.
	const az2 = Math.round(a._colZ ?? 0);
	const bz2 = Math.round(b._colZ ?? 0);

	let ay2 = Math.round(a._colY ?? 0);
	let by2 = Math.round(b._colY ?? 0);

	// If an entity is above another, the back needs to be compared, not the front.
	if(a._espWorldObject && !b._espWorldObject && bz2 < az2) {
		ay2 += TS;
		if(typeof b._objY === "number") {
			by2 = b._objY;
		}
	}
	if(b._espWorldObject && !a._espWorldObject && az2 < bz2) {
		by2 += TS;
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

	const ax2 = a.espObject?.position?.x ?? 0;
	const bx2 = b.espObject?.position?.x ?? 0;
	if(ax2 !== bx2) {
		return ax2 - bx2;
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

Object.defineProperty(Tilemap.prototype, "width", {
    get: function() {
        return this._mapWidth * TS;
    },
    set: function(value) {
        this._width = value;
    },
    configurable: true
});

Object.defineProperty(Tilemap.prototype, "height", {
    get: function() {
        return this._mapHeight * TS;
    },
    set: function(value) {
        this._height = value;
    },
    configurable: true
});
