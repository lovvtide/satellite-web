import React from 'react';

import { COLORS } from '../../constants';


export default (props = {}) => {

	const style = props.style || {};
	const trans = typeof props.translate === 'undefined' ? -2 : props.translate;
	const color = style.color || COLORS.secondaryBright;
	const deg = { down: '45', left: '135', up: '225', right: '315' };
	const dimension = props.dimension || 12;

	return (
		<div
			style={{
				width: dimension,
				height: dimension,
				borderRight: `${props.thickness || 2}px solid ${color}`,
				borderBottom: `${props.thickness || 2}px solid ${color}`,
				transform: `rotate(${deg[props.pointing]}deg) translate(${trans}px, ${trans}px)`,
				...style
			}}
		/>
	);
};
