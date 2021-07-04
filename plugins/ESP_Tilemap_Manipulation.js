// I lost years off my life coming up with this algorithm. Looks so simple in retrospect >.<

Tilemap.prototype._sortChildren = function() {
	//this._espSprites.forEach(s => this.removeChild(s));
	//this._espSprites.forEach(s => this.addChild(s));
	this.children.sort(this._compareChildOrder.bind(this));

	let isHigher = null;
	for(let i = this.children.length - 1; i >= 0; i--) {
		if(this.children[i] === this._espPlayer) {
			break;
		}
		if(this.children[i]._espWorldObject) {
			if(this._compareChildOrder(this._espPlayer, this.children[i]) > 0) {
				isHigher = i;
				break;
			}
		}
	}

	if(isHigher !== null) {
		this.removeChild(this._espPlayer);
		this.addChildAt(this._espPlayer, isHigher);
	}
};

Tilemap.prototype._compareChildOrder = function(a, b) {

	if(a.visible && !b.visible) return 1;
	else if(!a.visible && b.visible) return -1;
	else if(!a.visible && !b.visible) return 0;

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

	/*
	if(typeof a._colZBase === "number") {
		if(typeof b._colZBase === "number") {
			if(a._colZBase !== b._colZBase) {
				return a._colZBase - b._colZBase;
			}
		} else if(a._colZBase !== b._colZ) {
			return a._colZBase - b._colZ;
		}
	} else if(typeof b._colZBase === "number" && b._colZBase !== a._colZ) {
		return a._colZ - b._colZBase;
	}*/

	/*
	if(a._espWorldObject && (b._colZBase ?? 0) > a._colZ) {
		return -1;
	}
	if(b._espWorldObject && (a._colZBase ?? 0) > b._colZ) {
		return 1;
	}
	*/

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

Tilemap.prototype.updateTransform = function() {
    const ox = Math.ceil(this.origin.x);
    const oy = Math.ceil(this.origin.y);
    const startX = 0;//Math.floor((ox - this._margin) / this._tileWidth);
    const startY = 0;//Math.floor((oy - this._margin) / this._tileHeight);
    this._lowerLayer.x = 0;//startX * this._tileWidth - ox;
    this._lowerLayer.y = 0;//startY * this._tileHeight - oy;
    this._upperLayer.x = 0;//startX * this._tileWidth - ox;
    this._upperLayer.y = 0;// startY * this._tileHeight - oy;
    if (
        this._needsRepaint ||
        this._lastAnimationFrame !== this.animationFrame ||
        this._lastStartX !== startX ||
        this._lastStartY !== startY
    ) {
        this._lastAnimationFrame = this.animationFrame;
        this._lastStartX = startX;
        this._lastStartY = startY;
        this._addAllSpots(startX, startY);
        this._needsRepaint = false;
    }
    this._sortChildren();
    PIXI.Container.prototype.updateTransform.call(this);
};
