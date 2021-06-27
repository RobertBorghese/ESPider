// A quick lil sprite util for all your util needs.

class ESPAnimatedSprite extends Sprite {
	constructor(Bitmap, FrameDelay, Invert, Offset) {
		super();

		this.bitmap = Bitmap;
		this.bitmap.smooth = false;

		this.FrameDelay = FrameDelay ?? 10;
		this.Invert = Invert ?? false;
		this.Offset = Offset ?? 0;

		this.Frame = 0;
		this.Index = 0;
		this.MaxIndex = 0;
		this.FrameWidth = 0;
		this.FrameHeight = 0;
		this.IsAwaiting = false;
		this.IsFrozen = false;
		this.setFrame(0, 0, 0, 0);

		this.bitmap.addLoadListener(this.setup.bind(this));
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
		this.setFrame(0, 0, this.FrameWidth, this.FrameHeight);
	}

	setup() {
		const Width = this.bitmap.width;
		const Height = this.bitmap.height;
		this.MaxIndex = Math.floor(Width / Height);
		if(this.bitmap._url.match(/_(\d+)\.png$/)) {
			const Num = parseInt(RegExp.$1);
			if(Num !== NaN) {
				this.MaxIndex = Num;
			}
		}
		this.FrameWidth = this.MaxIndex > 0 ? (Width / this.MaxIndex) : 0;
		this.FrameHeight = Height;
		this.setFrame(0, 0, this.FrameWidth, this.FrameHeight);
		if(this.Invert) {
			this.Index = this.MaxIndex - 1;
		}
	}

	update() {
		super.update();

		if(!this.IsFrozen && this.FrameWidth > 0) {
			this.Frame++;
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

		this.setFrame(FinalIndex * this.FrameWidth, 0, this.FrameWidth, this.FrameHeight);
	}
}
