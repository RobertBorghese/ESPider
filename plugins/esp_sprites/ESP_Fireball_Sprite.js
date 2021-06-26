// And, of course, a correlating first game sprite.

class ESPFireballSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.ObjectHolderOffsetY = -8;

		this.Graphics = new PIXI.Graphics();
		this.Graphics.beginFill(0xFFFFFF);
		this.Graphics.lineStyle(0);
		this.Graphics.drawCircle(0, -10, 10);
		this.Graphics.endFill();
		this.ObjectHolder.addChild(this.Graphics);

		this.Time = 0;

		this.Graphics.filters = [new PIXI.filters.PixelateFilter(2)];
	}

	update() {
		super.update();

		this.Time += 0.1;
		this.Graphics.y = Math.sin(this.Time) * 5;
	}

	updateShadowSprite() {
		this.ShadowSprite.move(0, 0);
		this.ShadowSprite.scale.set(0.6 + (((this.Graphics.y) + 5) * 0.02));
		this.ShadowSprite.alpha = this.ShadowSprite.scale.x;
	}
}