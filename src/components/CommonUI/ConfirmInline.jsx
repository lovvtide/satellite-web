import React, { PureComponent } from 'react';

import { COLORS } from '../../constants';


class ConfirmInline extends PureComponent {

	state = { hover: '' };

	render = () => {

		this._props = {
			promptColor: '#fff',
			confirmColor: COLORS.red,
			cancelColor: '#fff',
			confirmText: 'CONFIRM',
			cancelText: 'CANCEL',
			...this.props
		};

		return (
			<div style={{ userSelect: 'none', ...this.props.style }}>
				<span style={{ color: this._props.promptColor, marginRight: 12, cursor: 'default'/*, opacity: 0.54*/ }}>{this.props.promptText || 'Are you sure?'}</span>
				<span
					onClick={this.props.onConfirm}
					onMouseOver={() => this.setState({ hover: 'confirm' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={styles.action('confirm', this.state, this._props)}
				>
					{this._props.confirmText}
				</span>
				<span style={{ marginLeft: 6, marginRight: 6, cursor: 'default' }}>/</span>
				<span
					onClick={this.props.onCancel}
					onMouseOver={() => this.setState({ hover: 'cancel' })}
					onMouseOut={() => this.setState({ hover: '' })}
					style={styles.action('cancel', this.state, this._props)}
				>
					{this._props.cancelText}
				</span>
			</div>
		);
	};
}

const styles = {

	action: (key, s, p) => {
		return {
			cursor: 'pointer',
			opacity: key === s.hover ? 1 : 0.85,
			color: key === 'confirm' ? p.confirmColor : p.cancelColor
		};
	}
};

export default ConfirmInline;
