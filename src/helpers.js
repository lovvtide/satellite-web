import { DEFAULT_LOCALE_CURRENCY } from './constants';


// Append query params
export const query = (base, params = {}) => {

	const kv = Object.keys(params).map(k => {
		return `${k}=${encodeURIComponent(params[k])}`
	}).join('&');

	return `${base}?${kv}`;
};

export const randomID = (n) => {
	const c = [];
	for (let i = 0; i < n; i++) {
		c.push(String(Math.floor(Math.random() * 10)));
	}
	return c.join('');
};

export const formatOrdinal = (n, options = {}) => {

	const str = String(n);
	const len = str.length;
	const last = str[len - 1];

	let suffix = 'th';

	if (str[len - 2] !== '1') {

		if (last === '1') {

			suffix = 'st';

		} else if (last === '2') {

			suffix = 'nd';

		} else if (last === '3') {

			suffix = 'rd';
		}
	}

	return `${n}${options.uppercase ? suffix.toUpperCase() : suffix}`;
};

export const isValidEmail = (s) => {

	if (!s) { return false; }

	const match = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

	return (
		s.length <= 320
		&& match.test(s)
		&& s.split('@')[1]
		&& s.split('@')[1].indexOf('.') !== -1
	);
};

export const formatCurrency = (value, options = {}) => {

	const currency = options.currency || 'USD';

	const formatter = new Intl.NumberFormat(undefined, {
		currency: currency.toUpperCase(),
		style: 'currency',
	});

	const numeric = parseFloat(value.split('').filter(c => {
		return ('0123456789.').indexOf(c) !== -1;
	}).join('') || 0);

	let parsed = '0';

	for (let part of formatter.formatToParts(parseFloat(numeric))) {

		switch (part.type) {
			case 'fraction':
			case 'integer':
				parsed += part.value;
				break;
			case 'decimal':
				parsed += '.';
				break;
			default:
				break;
		}	
	}

	const number = parseFloat(parsed);

	return {
		valid: !isNaN(number) && isFinite(number),
		formatted: formatter.format(number),
		formatter,
		number
	}
};

export const getDefaultLocaleCurrency = () => {

	let currency;

	if (window.navigator && window.navigator.language) {

		const locale = window.navigator.language.split('-')[1];

		if (locale) {

			currency = DEFAULT_LOCALE_CURRENCY[locale];

			return currency || 'USD';
		}
	}

	return currency || 'USD';
};

// Resize / convert an image to given scale / type
export const formatImage = (file, options = {}) => {

	return new Promise((resolve, reject) => {

		const _src = URL.createObjectURL(file);
		const image = new Image();

		image.onload = () => {

			const canvas = document.createElement('canvas');
			const scaleFactor = Math.sqrt(options.dimension || 600000) / (Math.sqrt(image.height) * Math.sqrt(image.width));
			const height = scaleFactor * image.height;
			const width = scaleFactor * image.width;

			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').drawImage(image, 0, 0, width, height);

			canvas.toBlob(result => {

				resolve(new File(
					[ result ],
					(options.filename || file.name),
					{ type: `image/${options.outputFormat || 'jpeg'}` }
				));

			}, `image/${options.outputFormat || 'jpeg'}`, options.quality || 0.92);
		}

		image.src = _src;
	});
};

export const formatDataSize = (n, options = {}) => {

	if (options.kBMin && n < 1000) {
		return '0 KB';
	}

	if (n < 1000) {
		return `${n} B`;
	} else if (n < 1000000) {
		return `${Math.round(n / 1000)} KB`;
	} else if (n < 1000000000) {
		return `${(n / 1000000).toFixed(n > 100000000 ? 0 : 1)} MB`;
	} else {
		return `${(n / 1000000000).toFixed(1)} GB`;
	}
};

export const transition = (timing = 0.25, effect = 'ease', properties = []) => {

	const p = [];

	for (let item of properties) {
		p.push(`${item} ${timing}s ${effect}`);
	}

	const v = p.join(', ');

	return { transition: v };
};

export const countdownFormat = (remaining, options = {}) => {

	if (remaining < 0) { return ''; }

	const s = (n) => {
		const str = String(n);
		return str.length === 1 ? ('0' + str) : str;
	}; 

	let t = Math.floor(remaining);

	const days = Math.floor(t / 86400);
	t -= (days * 86400);

	const hours = Math.floor(t / 3600);
	t -= (hours * 3600);

	const minutes = Math.floor(t / 60);
	t -= minutes * 60;

	const seconds = t;

	return `${s(days)}:${s(hours)}:${s(minutes)}:${s(seconds)}`;
};

export const timeFormat = (unixTime, options = {}) => {

	const monthsLong = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	const date = new Date(unixTime * 1000);
	let d = date.getDate();
	const _M = (options.longMonth ? monthsLong : months)[date.getMonth()];
	const M = options.uppercase ? _M.toUpperCase() : _M;
	const y = date.getFullYear();
	
	if (d < 10) {
		d = '0' + d;
	}
	
	if (options.short) {
		return `${d} ${M} ${y}`;
	}

	let h = date.getHours();
	let meridian = 'AM';

	if (h > 12) {
		h = h - 12;
		meridian = 'PM';
	}

	if (h < 10) {
		h = '0' + h;
	}

	const m = '0' + date.getMinutes();

	return `${d} ${M} ${y} ${h}:${m.substr(-2)} ${meridian}`;
};

export const intervalTime = (delta) => {

	const d = Math.floor(delta / 86400);
	const h = Math.floor((delta - (d * 86400)) / 3600);
	const m = Math.floor((delta - ((d * 86400) + (h * 3600))) / 60);

	return `${d}D ${h}H ${m}M`;
};

export const relativeTime = (time) => {

	const delta = (Date.now() / 1000) - time;
	
	if (delta < 60) { // < 1 min
		return 'just now';
	} else if (delta < 3600) { // < 1 hour
		const m = Math.floor(delta / 60);
		return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`;
	} else if (delta < 172800) { // < 1 day
		const h = Math.floor(delta / 3600);
		return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
	}

	return `${Math.floor(delta / 86400)} days ago`;	
};
