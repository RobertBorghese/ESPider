// A quick lil sprite util for all your util needs.

class ESPAnimatedSprite extends PIXI.Sprite {
	constructor(sourceUrl, FrameDelay, InvertOrObj, Offset, InitOffset) {
		super();

		if(!ESPAnimatedSprite.bitmapFrames) {
			ESPAnimatedSprite.bitmapFrames = {};
		}

		this.FrameDelay = FrameDelay ?? 10;
		if(typeof InvertOrObj === "object") {
			this.Invert = InvertOrObj.Invert ?? false;
			this.Offset = InvertOrObj.Offset ?? 0;
			this.InitOffset = InvertOrObj.InitOffset ?? 0;
			this.FrameCount = InvertOrObj.FrameCount ?? null;
		} else {
			this.Invert = InvertOrObj ?? false;
			this.Offset = Offset ?? 0;
			this.InitOffset = InitOffset ?? 0;
		}

		this.Frame = 0;
		this.Index = 0;
		this.MaxIndex = 0;
		this.FrameWidth = 0;
		this.FrameHeight = 0;
		this.IsAwaiting = false;
		this.IsFrozen = false;
		//this.setFrame(0, 0, 0, 0);

		this._espUrl = sourceUrl;

		if(!ESPAnimatedSprite.baseTextures) {
			ESPAnimatedSprite.baseTextures = {};
		}
		let asyncLoad = false;
		if(!ESPAnimatedSprite.baseTextures[this._espUrl]) {
			this._espBaseTexture = PIXI.BaseTexture.from(sourceUrl);
			this._espBaseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			ESPAnimatedSprite.baseTextures[this._espUrl] = [this._espBaseTexture, false];
			asyncLoad = true;
		} else {
			const data = ESPAnimatedSprite.baseTextures[this._espUrl];
			this._espBaseTexture = data[0];
			if(!data[1]) {
				asyncLoad = true;
			}
		}

		if(asyncLoad) {
			this._espIsLoaded = false;
			this._espBaseTexture.on("loaded", function() {
				this.setup();
			}.bind(this));
		} else {
			this._espIsLoaded = true;
			this.setup();
		}
		
		//this.bitmap.addLoadListener(this.setup.bind(this));
	}

	move(x, y) {
		this.x = x;
		this.y = y;
	}

	await() {
		this.IsAwaiting = true;
	}

	unawait() {
		this.IsAwaiting = false;
		this.IsFrozen = false;
	}

	reset() {
		this.unawait();
		this.Frame = 0;
		this.Index = 0;
		if(this.TextureFrames) this.texture = (this.TextureFrames[this.Index]);
		//this.setFrame(0, 0, this.FrameWidth, this.FrameHeight);
	}

	setup() {

		this._espIsLoaded = true;

		ESPAnimatedSprite.baseTextures[this._espUrl][1] = true;

		if(!ESPAnimatedSprite.bitmapFrames[this._espUrl]) {

			const result = {};
			const Width = this._espBaseTexture.width;
			const Height = this._espBaseTexture.height;
			result.MaxIndex = this.FrameCount ?? Math.floor(Width / Height);
			if(this._espUrl.match(/_(\d+)\.png$/)) {
				const Num = parseInt(RegExp.$1);
				if(Num !== NaN) {
					result.MaxIndex = Num;
				}
			}
			result.FrameWidth = result.MaxIndex > 0 ? (Width / result.MaxIndex) : 0;
			result.FrameHeight = Height;

			result.TextureFrames = [];
			for(let i = 0; i < result.MaxIndex; i++) {
				result.TextureFrames.push(new PIXI.Texture(this._espBaseTexture, new PIXI.Rectangle(i * result.FrameWidth, 0, result.FrameWidth, result.FrameHeight)));
			}

			ESPAnimatedSprite.bitmapFrames[this._espUrl] = result;

		}

		const data = ESPAnimatedSprite.bitmapFrames[this._espUrl];
		this.MaxIndex = data.MaxIndex;
		this.FrameWidth = data.FrameWidth;
		this.FrameHeight = data.FrameHeight;
		this.TextureFrames = data.TextureFrames;
		
		if(this.Invert) {
			this.Index = this.MaxIndex - 1;
		}
		if(this.InitOffset) {
			this.Index += this.InitOffset;
			this.Index = this.Index % this.MaxIndex;
		}
		this.texture = (this.TextureFrames[this.Index]);
		//this.setFrame(this.Index * this.FrameWidth, 0, this.FrameWidth, this.FrameHeight);
	}

	update() {
		//super.update();

		if(!this.IsFrozen && this.FrameWidth > 0) {
			this.Frame += ESP.WS;
			if(this.Frame >= this.FrameDelay) {
				this.Frame = 0;
				this.incrementFrame();
			}
		}
	}

	incrementFrame() {
		if(this.Invert) {
			this.Index--;
			if(this.Index < 0) {
				this.Index = this.MaxIndex - 1;
			}
		} else {
			this.Index++;
			if(this.Index >= this.MaxIndex) {
				this.Index = 0;
			}
		}
		
		let FinalIndex = this.Index + this.Offset;
		if(FinalIndex < 0) FinalIndex += this.MaxIndex;
		if(FinalIndex >= this.MaxIndex) FinalIndex -= this.MaxIndex;

		if(FinalIndex === this.MaxIndex - 1) {
			if(this.IsAwaiting) {
				this.IsFrozen = true;
			}
		}

		this.texture = (this.TextureFrames[FinalIndex]);
		//this.setFrame(FinalIndex * this.FrameWidth, 0, this.FrameWidth, this.FrameHeight);
	}

	isDone() {
		if(!this._espIsLoaded) {
			return false;
		}
		return this.Invert ? this.Index <= 0 : (this.MaxIndex > 0 && this.Index >= this.MaxIndex - 1);
	}

	destroy() {
		this.texture = null;
		super.destroy();
	}
}
