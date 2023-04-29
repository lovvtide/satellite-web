import React, { PureComponent } from 'react';

import PrettySVG from './PrettySVG';

import { transition } from '../../helpers';


/* props: style, text, onClick, svg, secondary */
class IconButton extends PureComponent {

	state = { hover: false };

	render = () => {
		return (
			<span
				style={styles.container(this.state.hover, this.props.disabled, 14 - this.props.svgSize, this.props.secondary, this.props.style)}
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				onClick={this.props.disabled ? null : this.props.onClick}
			>
				{this.props.svg ? <PrettySVG
					style={styles.svg(this.state.hover && !this.props.disabled, this.props.svgTranslateY || 0)}
					src={this.props.svg}
					height={this.props.svgSize || 12}
					width={this.props.svgSize || 12}
				/> : null}
				<span style={{ fontSize: this.props.fontSize || 13 }}>{this.props.text}</span>
			</span>
		);
	};
}

const styles = {
	container: (hover, disabled, translateY, secondary, style = {}) => {
		return {
			padding: '4px 8px',
			borderRadius: 5,
			fontFamily: 'JetBrains-Mono-Regular',
			cursor: disabled ? 'default' : 'pointer',
			color: hover && !disabled ? '#fff' : 'rgba(255,255,255,0.85)',
			background: hover/* || disabled*/ ? 'rgba(255,255,255,0.05)' : 'transparent',
			transform: `translate(0px, ${translateY < 0 ? translateY : 0}px)`,
			opacity: !secondary || hover ? 1 : 0.5,
			...transition(0.2, 'ease', [ 'opacity', 'background', 'color' ]),
			...style
		};
	},
	svg: (hover, translateY) => {
		return {
			marginRight: 6,
			opacity: hover ? 1 : 0.6,
			transform: `translate(0px, ${translateY || 0}px)`,
			...transition(0.2, 'ease', [ 'opacity' ]),
		};
	}
};

export default IconButton;
