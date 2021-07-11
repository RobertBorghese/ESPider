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

	if(this._espPlayer._currentMovingPlatform) {
		const playerIndex = this.children.indexOf(this._espPlayer);
		const siblings = this._espPlayer._currentMovingPlatform.getAllSiblings();
		const len = siblings.length;
		for(let i = 0; i < len; i++) {
			const newIndex = this.children.indexOf(siblings[i]);
			if(newIndex > playerIndex && (isHigher === null || newIndex > isHigher)) {
				isHigher = newIndex;
			}
		}
	}

	if(isHigher !== null) {
		this.removeChild(this._espPlayer);
		this.addChildAt(this._espPlayer, isHigher);
	}
	
	/*
	if($gameMapTemp._mapMovingPlatforms && $gameMapTemp._mapMovingPlatforms.length > 0) {
		const playerIndex = this.children.indexOf(this._espPlayer);
		const platforms = [];
		for(let i = 0; i < playerIndex; i++) {
			if(this.children[i]._espMovingPlatform) {
				platforms.push(this.children[i]);
			}
		}
		platforms.forEach(p => {
			this.removeChild(p);
			this.addChildAt(p, playerIndex - 1);
		});
	}*/

	if($gameMapTemp._mapGroupReferences["webdevice"] && $gameMapTemp._mapGroupReferences["webdevice"].length > 0) {
		const results = [];
		const len = this.children.length;
		for(let i = 0; i < len; i++) {
			if(this.children[i]._isWebDeviceSprite) {
				let highest = i;
				for(let j = i; j < len; j++) {
					if(this.children[j]._colZ <= this.children[i]._colZ) {
						highest = j;
					}
				}
				results.push([i, highest]);
			}
		}
		let highest = null;
		const childs = [];
		results.forEach(r => {
			if(r[0] < this.children.length) {
				childs.push(this.removeChildAt(r[0]));
			}
		});
		for(let i = 0; i < childs.length; i++) {
			const index = results[i][1] - childs.length;
			if(Math.abs(this._espPlayer.y - childs[i].y) < 30 && Math.sqrt(Math.pow(this._espPlayer.x - childs[i].x, 2) + Math.pow(this._espPlayer.y - childs[i].y, 2)) < 20 && 
				this._compareChildOrder(this._espPlayer, childs[i]) > 0) {
				highest = index;
			}
			this.addChildAt(childs[i], index);
		}
		if(highest !== null && this.children.indexOf(this._espPlayer) < highest) {
			this.removeChild(this._espPlayer);
			this.addChildAt(this._espPlayer, highest);
		}
	}

	const len = this.children.length;
	for(let i = 0; i < len; i++) {
		if(this.children[i]._ensureAbove) {
			const child = this.children[i];
			const other = child._ensureAbove;
			const newIndex = this.children.indexOf(other);
			if(newIndex > i) {
				this.removeChild(child);
				this.addChildAt(child, newIndex);
				i--;
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
			by2 = (a._espMovingPlatform ? (b._objY + (by2 - b._objY) * 0.5) : b._objY);
		}
	}
	if(b._espWorldObject && !a._espWorldObject && az2 < bz2) {
		by2 += TS;
		if(typeof a._objY === "number") {
			ay2 = (b._espMovingPlatform ? (a._objY + (ay2 - a._objY) * 0.5) : a._objY);
		}
	}

	/*
	if(a._isWebDeviceSprite && b._espWorldObject) {
		if((az2 + 1) !== bz2) {
			return (az2 + 1) - bz2;
		}
	}
	if(b._isWebDeviceSprite && a._espWorldObject) {
		if((bz2 + 1) !== az2) {
			return az2 - (bz2 + 1);
		}
	}*/

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

Tilemap.prototype.update = function() {
    this.animationCount += ESP.WS;
    this.animationFrame = Math.floor(this.animationCount / 30);
    for (const child of this.children) {
        if (child.update) {
            child.update();
        }
    }
};
