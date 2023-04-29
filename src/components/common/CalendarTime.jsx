import React from 'react';

const CalendarTime = ({ time, style, short }) => {

	const date = new Date(time * 1000);
	const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
	
	const M = months[date.getMonth()];
	const y = date.getFullYear();
	let m = date.getMinutes();
	let h = date.getHours();
	let d = date.getDate();
	let meridian = 'AM';

	if (d < 10) {
		d = '0' + d;
	}

	if (h > 12) {
		meridian = 'PM';
		h = h - 12;
	}

	if (h < 10) {
		h = '0' + h;
	}

	if (m < 10) {
		m = '0' + m;
	}

	return <span style={style || {}}>{short ? `${d} ${M}` : `${d} ${M} ${y} ${h}:${m} ${meridian}`}</span>;
};

export default CalendarTime;
