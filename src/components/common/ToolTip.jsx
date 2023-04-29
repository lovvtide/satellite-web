import React from 'react';
import { Popup, Icon } from 'semantic-ui-react';


export default ({ position, text, iconStyle }) => {
	return (
		<Popup
			style={{ fontSize: 12, zIndex: 99999, filter: 'invert(85%)', boxShadow: 'none', color: '#000' }}
			position={position}
			trigger={<Icon onClick={e => e.stopPropagation()} name='question circle outline' style={{ marginLeft: 6, ...(iconStyle || {}) }} />}
			content={text}
		/>
	);
};
