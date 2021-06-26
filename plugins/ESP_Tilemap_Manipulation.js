// I lost years off my life coming up with this algorithm. Looks so simple in retrospect >.<

Tilemap.prototype._compareChildOrder = function(a, b) {

	// If both sprites are "tilemap walls", do comparison with objects.
	if(a._shouldZ && b._shouldZ) {
		const player = SceneManager?._scene?._spriteset?._espPlayer;
		if(player) {
			const val1 = this._compareChildOrder(a, player);
			const val2 = this._compareChildOrder(b, player);
			if(val1 !== val2) {
				return val1 - val2;
			}
		}
	}

	// If they exist, compare y and z based on collision positions.
	const az2 = a._colZ ?? 0;
	const bz2 = b._colZ ?? 0;

	let ay2 = a._colY ?? 0;
	let by2 = b._colY ?? 0;

	// If an entity is above another, the back needs to be compared, not the front.
	if(a._shouldZ && bz2 < az2) {
		ay2 += 48;
	}
	if(b._shouldZ && az2 < bz2) {
		by2 += 48;
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