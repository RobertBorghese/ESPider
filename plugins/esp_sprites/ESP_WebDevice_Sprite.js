// Wall off all the haters

class ESPWebDeviceSprite extends ESPGameSprite {
	constructor(object, startClosed) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = 12;

		this._holder = new Sprite();
		this._holder.scale.set(2);
		this.ObjectHolder.addChild(this._holder);

		this._bottom = new Sprite(ImageManager.loadBitmapFromUrl("img/other/WebDeviceBottom.png"));
		this._bottom.anchor.set(0.5, 1);
		this._holder.addChild(this._bottom);

		this._webHolder = new Sprite();
		this._webHolder.scale.set(0.5);
		this._holder.addChild(this._webHolder);

		this._webFrameCount = 5;
		this._webFrameTimeInterval = 6;
		this._webFrameIndex = 0;
		this._webFrameTime = 0;
		this._webFrameCutoff = startClosed ? 41 : 0;
		this._webFrameCutoffMax = 41;

		this._trueWebHolder = new Sprite();
		this._trueWebHolder.anchor.set(0.5, 1);
		this._trueWebHolder.y = -6;
		this._holder.addChild(this._trueWebHolder);

		this._core = new Sprite(ImageManager.loadBitmapFromUrl("img/other/WebDeviceCore.png"));
		this._core.anchor.set(0.5);
		this._core.alpha = 1;
		this._core.y = 6 + (this._core.height / -2);
		this._trueWebHolder.addChild(this._core);

		this._web = new Sprite(ImageManager.loadBitmapFromUrl("img/other/WebDeviceMiddle.png"));
		this._web.anchor.set(0.5, 1);
		this._web.alpha = 0.8;
		this._trueWebHolder.addChild(this._web);

		this._top = new Sprite(ImageManager.loadBitmapFromUrl("img/other/WebDeviceTop.png"));
		this._top.anchor.set(0.5, 1);
		this._holder.addChild(this._top);

		this.ShadowSprite.visible = false;

		this.Time = 0;

		this._isWebDeviceSprite = true;

		this.updateWebFrame();
	}

	updateWebFrame() {
		this._web.setFrame(this._webFrameIndex * 24, 0, 24, 48);

		const ratio = (this._webFrameCutoff / this._webFrameCutoffMax);
		this._trueWebHolder.scale.x = 1 + (0.2 * ratio);
		this._trueWebHolder.scale.y = (1 - ratio);
	}

	update() {
		super.update();

		const newWebCutoff = Math.round(this._webFrameCutoffMax * (1 - this.espObject._animationState));
		if(this._webFrameCutoff !== newWebCutoff) {
			this._webFrameCutoff = newWebCutoff;
			this.updateWebFrame();
		}

		this._webFrameTime++;
		if(this._webFrameTime > this._webFrameTimeInterval) {
			this._webFrameTime = 0;
			this._webFrameIndex++;
			if(this._webFrameIndex >= this._webFrameCount) {
				this._webFrameIndex = 0;
			}
			this.updateWebFrame();
		}

		if(this._webFrameCutoff === 0) {
			this._top.y = (this._webFrameIndex >= 1 && this._webFrameIndex <= 2 ? 0 : 1);
		} else {
			const ratio = (this._webFrameCutoff / this._webFrameCutoffMax);
			this._top.y = (25 + (6 * ratio)) * ratio;
		}

		this.Time += (0.1 * ESP.WS);
		this._core.y = 6 + (this._core.height / -2) + (Math.sin(this.Time) * 1.5);
	}

	updateShadowSprite() {
	}
}