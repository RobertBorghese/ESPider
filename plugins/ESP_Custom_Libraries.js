
const Vector2 = require("./js/customlibs/victor.min.js");

Vector2._length = function(x, y) {
	if(!Vector2.__tempBoi) {
		Vector2.__tempBoi = new Vector2(x, y);
	}
	Vector2.__tempBoi.x = x;
	Vector2.__tempBoi.y = y;
	return Vector2.__tempBoi.length();
};

Vector2.normalized = function(x, y, overloadLen) {
	if(!Vector2.__tempBoi) {
		Vector2.__tempBoi = new Vector2(x, y);
	}
	Vector2.__tempBoi.x = x;
	Vector2.__tempBoi.y = y;
	const len = overloadLen ?? Vector2.__tempBoi.length();
	Vector2.__tempBoi.norm();
	Vector2.__tempBoi.x *= len;
	Vector2.__tempBoi.y *= len;
	return Vector2.__tempBoi;
};
