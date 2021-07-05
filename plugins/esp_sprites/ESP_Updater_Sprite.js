// Should there even be a sprite for this? Idk, but too scared to change the system that's already set up.

class ESPUpdaterSprite extends ESPGameSprite {
	constructor(object) {
		super();

		this.espObject = object;

		this.visible = false;
		this.ShadowSprite.visible = false;
	}
}