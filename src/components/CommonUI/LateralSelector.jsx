import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';

import { transition } from '../../helpers';


export default class LateralSelector extends PureComponent {

	state = { hover: null };

	render = () => {

		this._props = {
			hoverable: true,
			animate: true,
			leftDisabled: false,
			rightDisabled: false,
			spacing: 12,
			color: '#fff',
			width: 'auto',
			height: 'auto',
			fontSize: 18,
			fontFamily: 'JetBrains-Mono-Regular',
			display: 'flex',
			alignItems: 'center',
			...this.props
		};

		const action = (which) => {

			const clickable = !this._props[which + 'Disabled'];

			return {
				name: `chevron ${which}`,
				style: styles.chevron(this._props, this.state, which, clickable),
				onClick: clickable ? () => { this.props.onClick(which); } : null,
				onMouseOver: () => { this.setState({ hover: which }); },
				onMouseOut: () => { this.setState({ hover: null }); }
			};
		};

		return (
			<div style={styles.container(this._props)}>
				<Icon { ...action('left') } />
				<div>{this.props.children}</div>
				<Icon { ...action('right') } />
			</div>
		);
	};
}

const styles = {

	container: (p) => {

		return {
			color: p.color,
			width: p.width,
			height: p.height,
			fontSize: p.fontSize,
			fontFamily: p.fontFamily,
			alignItems: p.alignItems,
			display: p.display,
			...(p.style || {})
		};
	},

	chevron: (p, s, which, clickable) => {

		return {
			userSelect: 'none',
			opacity: clickable ? (which === s.hover && p.hoverable ? 1 : 0.85) : 0.1,
			cursor: clickable ? 'pointer' : 'default',
			marginLeft: which === 'right' ? p.spacing : 0,
			marginRight: which === 'left' ? p.spacing : 0,
			...(p.animate ? transition(0.2, 'ease', [ 'opacity' ]) : {})
		};
	}
};
