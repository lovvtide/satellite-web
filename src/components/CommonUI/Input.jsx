import React, { PureComponent } from 'react';
import { Popup } from 'semantic-ui-react';

import { transition } from '../../helpers';


export default class Input extends PureComponent {

	state = { hover: false, focus: false };

	render = () => {

		this._props = {
			hoverable: true,
			animate: true,
			fontSize: 14,
			border: 'none',
			width: '100%',
			height: 36,
			color: '#fff',
			padding: '0px 12px',
			fontFamily: 'Lexend-Deca-Regular',
			...this.props
		};

		const element = (
			<input
				value={this.props.value}
				style={styles.input(this._props, this.state)}
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				onFocus={() => this.setState({ focus: true })}
				onBlur={() => this.setState({ focus: false })}
				onChange={this.props.onChange}
				disabled={this.props.status}
				placeholder={this.props.placeholder}
			/>
		);

		return this._props.status ? (
			<Popup
				trigger={element}
				style={styles.popup(this._props)}
				content={this._props.errorMessage || this._props.disabledMessage}
				position={this._props.statusMessagePosition || 'top center'}
				open={this._props.status === 'error' ? true : undefined}
				size='small'
			/>
		) : element;
	};
}

const styles = {

	popup: (p) => {
		return {
			filter: 'invert(85%)',
			boxShadow: 'none',
			color: ({ // filter inverts colors
				disabled: '#000',
				error: 'cyan'
			})[p.status]
		};
	},

	input: (p, s) => {

		return {
			outline: 'none',
			fontSize: p.fontSize,
			border: p.border,
			width: p.width,
			height: p.height,
			color: p.color,
			fontFamily: p.fontFamily,
			padding: p.padding,
			opacity: p.status ? 0.54 : 1,
			background: `rgba(255,255,255,${s.focus ? 0.05 : 0.025})`,
			...(p.animate ? transition(0.2, 'ease', [ 'background', 'opacity' ]) : {}),
			...(p.style || {})
		};
	}
};
