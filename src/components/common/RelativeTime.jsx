import React from 'react';

const RelativeTime = ({ time, style }) => {

	const delta = (Date.now() / 1000) - time;
	let display;
	
	if (delta < 60) { // < 1 min
		display = 'just now';
	} else if (delta < 3600) { // < 1 hour
		const m = Math.floor(delta / 60);
		display = `${m} ${m === 1 ? 'minute' : 'minutes'} ago`;
	} else if (delta < 172800) { // < 1 day
		const h = Math.floor(delta / 3600);
		display = `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
	} else {
		display = `${Math.floor(delta / 86400)} days ago`;
	}

	// TODO add support for months and years

	return <span style={style || {}}>{display}</span>;
};

export default RelativeTime;
