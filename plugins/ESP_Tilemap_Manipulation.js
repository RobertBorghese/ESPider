// I lost years off my life coming up with this algorithm. Looks so simple in retrospect >.<

Tilemap.prototype.refreshPlayer = function() {
	this.removeChild(this._espPlayer);
	this.addChildAt(this._espPlayer, 0);
};

Tilemap.prototype._sortChildren = function() {
	//this._espSprites.forEach(s => this.removeChild(s));
	//this._espSprites.forEach(s => this.addChild(s));

	if(!$gameMap.exactLayering() && (ESPGamePlayer.LayeringFreq !== 1) && (Math.floor(ESP.Time) % ESPGamePlayer.LayeringFreq !== 0)) return;

	this.children.sort(this._compareChildOrder.bind(this));

	if(this._espPlayer) {
		let isHigher = null;
		for(let i = this.children.length - 1; i >= 0; i--) {
			if(this.children[i] === this._espPlayer) {
				break;
			}
			if(this.children[i]._ensureAbove) {
				this.children[i]._ensureAboveProcessed = false;
			}
			if(this.children[i]._espWorldObject) {
				if(this._compareChildOrder(this._espPlayer, this.children[i]) > 0) {
					isHigher = i;
					break;
				}
			}
		}

		if(this._espPlayer.espObject?._currentMovingPlatform?.getAllSiblings) {
			const playerIndex = this.children.indexOf(this._espPlayer);
			const siblings = this._espPlayer.espObject._currentMovingPlatform.getAllSiblings();
			const len = siblings.length;
			for(let i = 0; i < len; i++) {
				const newIndex = this.children.indexOf(siblings[i]?._spr);
				if(newIndex > playerIndex && (isHigher === null || newIndex > isHigher)) {
					isHigher = newIndex;
				}
			}
		}

		if(isHigher !== null) {
			this.removeChild(this._espPlayer);
			this.addChildAt(this._espPlayer, isHigher);
		}
	}

	const len = this.children.length;
	for(let i = 0; i < len; i++) {
		if(this.children[i]._ensureAbove && !this.children[i]._ensureAboveProcessed) {
			const child = this.children[i];
			const other = child._ensureAbove;
			const newIndex = this.children.indexOf(other);
			if(newIndex > i) {
				this.removeChild(child);
				this.addChildAt(child, newIndex);
				i--;
			}
			child._ensureAboveProcessed = true;
		}
	}

	if(this._espPlayer) {
		if(this._playerBasedSprites && this._playerBasedSprites.length > 0) {
			const len = this._playerBasedSprites.length;
			for(let i = 0; i < len; i++) {
				if(this._playerBasedSprites[i].visible && this._playerBasedSprites[i]._alwaysOnTop < $espGamePlayer.realZ()) {
					const spr = this._playerBasedSprites[i];
					const sprIndex = this.children.indexOf(spr);
					this.removeChild(this._espPlayer);
					this.addChildAt(this._espPlayer, sprIndex + 1);
				}
			}
		}
	}

	if(this._uiHolder && this.children.contains(this._uiHolder)) {
		this.removeChild(this._uiHolder);
		this.addChild(this._uiHolder);
	}
};

Tilemap.prototype._compareChildOrder = function(a, b) {

	if(a.visible && !b.visible) return 1;
	else if(!a.visible && b.visible) return -1;
	else if(!a.visible && !b.visible) return 0;

	if(a._ensureAbove === b) {
		return 1;
	} else if(b._ensureAbove === a) {
		return -1;
	}

	if(a._alwaysOnTop) return 1;
	else if(b._alwaysOnTop) return -1;

	if(a._alwaysBelowPlayer && (b === this._espPlayer || b === $espGamePlayer._dashChargeObject?._spr)) {
		return -1;
	} else if(b._alwaysBelowPlayer && (a === this._espPlayer ||  a === $espGamePlayer._dashChargeObject?._spr)) {
		return 1;
	}

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
			by2 = (a._espMovingPlatform ? (b._objY + (by2 - b._objY) * 0.5) : b._objY);
		}
	}
	if(b._espWorldObject && !a._espWorldObject && az2 < bz2) {
		by2 += TS;
		if(typeof a._objY === "number") {
			ay2 = (b._espMovingPlatform ? (a._objY + (ay2 - a._objY) * 0.5) : a._objY);
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

Tilemap.prototype.addPlayerBasedSprite = function(spr, at) {
	if(!this._playerBasedSprites) {
		this._playerBasedSprites = [];
	}
	this._playerBasedSprites.push(spr);
	if(at) {
		this.addChildAt(spr, at - 1);
	} else {
		this.addChild(spr);
	}
};

Tilemap.prototype.removePlayerBasedSprite = function(spr) {
	if(this._playerBasedSprites) {
		this._playerBasedSprites.remove(spr);
	}
	this.removeChild(spr);
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

Tilemap.prototype.update = function() {
    this.animationCount += ESP.WS;
    this.animationFrame = Math.floor(this.animationCount / 30);
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};
