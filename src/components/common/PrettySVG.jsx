import React from 'react';
import { Link } from 'react-router-dom';

const PrettySVG = ({ id, src, height, width, link, onClick, style, onHoverStateChange }) => {
	
	const img = (
		<img
			id={id}
			src={src}
			height={height}
			width={width}
			style={style}
			onClick={onClick}
			onMouseOver={onHoverStateChange ? () => onHoverStateChange(true) : null}
			onMouseOut={onHoverStateChange ? () => onHoverStateChange(false) : null}
		/>
	);

	return link ? <Link to={link}>{img}</Link> : img;
};

export default PrettySVG;
