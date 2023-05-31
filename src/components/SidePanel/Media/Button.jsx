import React, { PureComponent } from 'react';

import { COLORS } from '../../../constants';

import Loader from './Loader';


class Button extends PureComponent {

	state = {};

	renderLoader = () => {

		return (
			<div style={{ height: 24 }}>
				<Loader />
			</div>
		);
	};

	render = () => {

		return (
			<div
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				onClick={this.props.pending ? undefined : this.props.onClick}
				style={{
					opacity: this.state.hover && !this.props.pending ? 1 : 0.85,
					cursor: this.props.pending ? 'default' : 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '8px 12px',
					fontSize: 11,
					border: `1px solid ${COLORS.secondary}`,
					fontFamily: 'JetBrains-Mono-Regular',
					height: 24,
					color: '#fff',
					userSelect: 'none',
					borderRadius: 5,
					...(this.props.style || {})
				}}
			>
				{this.props.pending ? this.renderLoader() : this.props.label}
			</div>
		);
	};
}

export default Button;
