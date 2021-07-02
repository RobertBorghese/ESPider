// Let's make things a bit fancyyyy.

// https://gist.github.com/gre/1650294
// http://robertpenner.com/easing_terms_of_use.html
// https://github.com/warrenm/AHEasing/blob/master/COPYING
const Easing = {
	PI2: Math.PI / 2,

	linear: t => t,
	easeInQuad: t => t*t,
	easeOutQuad: t => t*(2-t),
	easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
	easeInCubic: t => t*t*t,
	easeOutCubic: t => (--t)*t*t+1,
	easeInOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
	easeInQuart: t => t*t*t*t,
	easeOutQuart: t => 1-(--t)*t*t*t,
	easeInOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
	easeInQuint: t => t*t*t*t*t,
	easeOutQuint: t => 1+(--t)*t*t*t*t,
	easeInOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t,

	easeInExponential: p => (p == 0.0) ? p : pow(2, 10 * (p - 1)),
	easeOutExponential: p => (p == 1.0) ? p : 1 - pow(2, -10 * p),
	easeInOutExponential: p => {
		if(p == 0.0 || p == 1.0) return p;
		if(p < 0.5) return 0.5 * pow(2, (20 * p) - 10);
		else return -0.5 * pow(2, (-20 * p) + 10) + 1;
	},

	easeInElastic: p => Math.sin(13 * Easing.PI2 * p) * pow(2, 10 * (p - 1)),
	easeOutElastic: p => Math.sin(-13 * Easing.PI2 * (p + 1)) * pow(2, -10 * p) + 1,
	easeInOutElastic: p => {
		if(p < 0.5) return 0.5 * Math.sin(13 * Easing.PI2 * (2 * p)) * pow(2, 10 * ((2 * p) - 1));
		else return 0.5 * (Math.sin(-13 * Easing.PI2 * ((2 * p - 1) + 1)) * pow(2, -10 * (2 * p - 1)) + 2);
	},

	easeInBack: p => p * p * p - p * Math.sin(p * Math.PI),
	easeOutBack: p => {
		const f = (1 - p);
		return 1 - (f * f * f - f * Math.sin(f * Math.PI));
	},

	easeInBounce: t => 1-Easing.easeOutBounce(1-t),
	easeOutBounce: p => {
		if(p < 4/11.0) return (121 * p * p)/16.0;
		else if(p < 8/11.0) return (363/40.0 * p * p) - (99/10.0 * p) + 17/5.0;
		else if(p < 9/10.0) return (4356/361.0 * p * p) - (35442/1805.0 * p) + 16061/1805.0;
		else return (54/5.0 * p * p) - (513/25.0 * p) + 268/25.0;
	},
	easeInOutBounce: t => t<.5 ? .5*Easing.easeInBounce(t*2) : .5*Easing.easeOutBounce(t*2-1)+.5
};
