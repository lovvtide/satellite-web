import React, { PureComponent } from 'react';

import { transition } from '../../helpers';


export default class Textarea extends PureComponent {

	state = { hover: false, focus: false };

	render = () => {

		this._props = {
			hoverable: true,
			animate: true,
			disabled: false,
			fontSize: 14,
			border: 'none',
			width: '100%',
			height: 36,
			color: '#fff',
			padding: 12,
			lineHeight: '22px',
			fontFamily: 'Lexend-Deca-Regular',
			...this.props
		};

		return (
			<textarea
				rows={this.props.rows}
				value={this.props.value}
				style={styles.input(this._props, this.state)}
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				onFocus={() => this.setState({ focus: true })}
				onBlur={() => this.setState({ focus: false })}
				onChange={this.props.onChange}
				disabled={this.props.disabled}
				placeholder={this.props.placeholder}
			/>
		);
	};
}

const styles = {

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
			resize: p.resize,
			lineHeight: p.lineHeight,
			background: `rgba(255,255,255,${s.focus ? 0.05 : 0.025})`,
			...(p.animate ? transition(0.2, 'ease', [ 'background' ]) : {}),
			...(p.style || {})
		};
	}
};
