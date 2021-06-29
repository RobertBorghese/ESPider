// We do be needing a Vector3. Hehehehe

class Vector3 {
	constructor(x, y, z) {
		if(typeof x === "object") {
			if(Array.isArray(x)) {
				this.x = x[0] ?? 0;
				this.y = x[1] ?? 0;
				this.z = x[2] ?? 0;
			} else {
				this.x = x.x ?? 0;
				this.y = x.y ?? 0;
				this.z = x.z ?? 0;
			}
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}

	set(x, y, z) {
		if(typeof x === "object") {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}
}
