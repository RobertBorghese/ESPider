//ESPJumpRespondPlatformSprite

class ESPJumpRespondPlatformSprite extends ESPMovingPlatformSprite {
	constructor(object, imageType, shadowWidth, shadowHeight, parent) {
		super(object, imageType, shadowWidth, shadowHeight, parent);

		this._platform.filters = [new PIXI.filters.MultiColorReplaceFilter(
			[
				[0x952f31, 0x2f4794],
				[0xc03f43, 0x3f5fbf],
				[0x682223, 0x233369],
				[0x4c1818, 0x18264c]
			]
		)];
	}
}
