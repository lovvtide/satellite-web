import React, { PureComponent } from 'react';


export default class X extends PureComponent {

	state = { hover: false }

	handleHoverAction = (hover) => {

		if (hover) {

			if (this.props.onMouseOver) {
				this.props.onMouseOver();
			}

		} else {

			if (this.props.onMouseOut) {
				this.props.onMouseOut();
			}
		}

		this.setState({ hover });
	};

	render = () => {

		const style = {
			transform: 'rotate(45deg)',
			userSelect: 'none',
			cursor: 'pointer',
			opacity: this.state.hover ? 1 : 0.85,
			...(this.props.style || {})
		};

		const d = this.props.dimension || 24;

		const _border = `1px solid ${style.color || 'rgb(47, 54, 61)'}`;

		return (
			<div
				style={style}
				onClick={this.props.onClick}
				onMouseDown={this.props.onMouseDown}
				onMouseOver={() => this.handleHoverAction(true)}
				onMouseOut={() => this.handleHoverAction(false)}
				// onMouseOver={() => this.setState({ hover: true })}
				// onMouseOut={() => this.setState({ hover: false })}
			>
				<div style={{ width: d, height: d / 2 }}>
					<div style={{ float: 'left', width: d / 2, height: d / 2, borderRight: _border, borderBottom: _border }} />
					<div style={{ float: 'right', width: d / 2, height: d / 2, borderLeft: _border, borderBottom: _border }} />
				</div>
				<div style={{ width: d, height: d / 2 }}>
					<div style={{ float: 'left', width: d / 2,  height: d / 2, borderRight: _border, borderTop: _border }} />
					<div style={{ float: 'right', width: d / 2, height: d / 2, borderLeft: _border, borderTop: _border }} />
				</div>
			</div>
		);
	};
}
