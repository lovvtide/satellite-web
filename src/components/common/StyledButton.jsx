import React, { PureComponent } from 'react';
import { Popup } from 'semantic-ui-react';


class StyledButton extends PureComponent {

	state = { hover: false, _hover: false };

	_onMouseOver = () => {
		this.setState({ hover: true });
		clearTimeout(this._hoverTimeout);
		this._hoverTimeout = setTimeout(() => {
			this.setState({ _hover: true });
		}, 150);
	};

	render = () => {

		const { width, center, text, style, solid, disabled } = this.props;
		const { hover, _hover } = this.state;

		const element = (
			<div
				style={{ ...styles.container(width, center), ...(style || {}) }}
				onClick={disabled ? null : this.props.onClick}
			>
				<div style={{ ...styles.div(width, null, hover, disabled), position: 'absolute', transform: 'translate(-5px, 5px)', zIndex: -1 }} />
				<div
					style={styles.div(width, solid, hover && _hover, disabled)}
					onMouseOver={this._onMouseOver}
					onMouseOut={() => {
						this.setState({ hover: false, _hover: false });
						clearTimeout(this._hoverTimeout)
					}}
				>
					{text}
				</div>
			</div>
		);

		return this.props.disabled ? (
			<Popup
				trigger={element}
				style={styles.popup}
				content={this.props.disabled}
				position='top center'
				//open={this._props.status === 'error' ? true : undefined}
				size='small'
			/>
		) : element;
	};
}

const styles = {
	popup: {
		filter: 'invert(85%)',
		boxShadow: 'none',
		color: '#000'
	},
	container: (width, center) => {
		return center ? {
			width,
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto'
		} : {};
	},
	div: (width, solid, hover, disabled) => {
		return {
			cursor: disabled ? 'not-allowed' : 'pointer',
			border: `1px solid ${hover && !disabled ? '#fff' : 'rgba(255,255,255,0.85)'}`,
			padding: 8,
			height: 39,
			userSelect: 'none',
			width: width || 105,
			textAlign: 'center',
			background: solid ? '#fff' : 'rgb(25, 26, 27)',
			color: solid ? 'rgb(25, 26, 27)' : (hover && !disabled ? '#fff' : 'rgba(255,255,255,0.85)')
		};
	}
};

export default StyledButton;
