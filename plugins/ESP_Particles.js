// ive been extremely terrified of implementing more particles into my pseudo-3d layering system that's held together with sticks and sticky-spit, but here we go!

class ESPParticle extends Sprite {
	constructor(texture, initX, initY, spdX, spdY, scaleData, alphaLifetime, lifetime) {
		super(texture);

		this.anchor.set(0.5);

		this.x = initX;
		this.y = initY;

		this._spdX = spdX;
		this._spdY = spdY;

		this.alphaLifetime = alphaLifetime;
		this.maxlifetime = lifetime;
		this.lifetime = lifetime;

		this.scaleData = scaleData;

		this._lastGlobal = null;

		this._tilemap = SceneManager._scene._spriteset._tilemap;
	}

	lerp(s, e, r) {
		return s + ((e - s) * r);
	}

	update() {
		if(this._lastGlobal === null) {
			if(this.parent) {
				this._lastGlobal = this._tilemap.toLocal(this.getGlobalPosition());
			}
		} else if(this.parent) {
			this._lastGlobal.x += this._spdX;
			this._lastGlobal.y += this._spdY;
			this.position = this.parent.toLocal(this._tilemap.toGlobal(this._lastGlobal));

			if(this.lifetime > 0) {

				const r = 1 - (this.lifetime / this.maxlifetime);
				if(this.scaleData) {
					this.scale.set(
						this.lerp(this.scaleData.startScaleX, this.scaleData.endScaleX, r),
						this.lerp(this.scaleData.startScaleY, this.scaleData.endScaleY, r)
					);
				}

				this.lifetime--;
				if(this.lifetime <= this.alphaLifetime) {
					this.alpha = this._initAlpha * (this.lifetime / this.alphaLifetime);
				} else {
					this.alpha = this._initAlpha;
				}
				if(this.lifetime <= 0) {
					if(this.parent.removeParticle) {
						this.parent.removeParticle(this)
					} else {
						this.parent.removeChild(this);
						this.destroy();
					}
				}
			}
		}
	}
}
