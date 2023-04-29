import React, { PureComponent } from 'react';
import { Modal } from 'semantic-ui-react';
import { Button, X } from '../CommonUI';

class PrettyModal extends PureComponent {

	state = { hoverAction: '' };

	renderActions = () => {
		return this.props.actions ? (
			<div style={styles.actionContainer(this.props.mobile)}>
				{this.props.actions.map(({ name, onClick, color, style }) => {
					return (
						<Button
							key={name}
							onClick={onClick}
							text={name}
							style={style}
							color={color}
							border
						/>
					);
				})}
			</div>
		) : null;
	};

	renderClose = () => {

		if (this.props.showCloseAction === false) {
			return null;
		}

		return (
			<X
				onClick={this.props.onClose}
				style={{ float: 'right' }}
			/>
		);
	};

	render = () => {
		return (
			<Modal
				open={this.props.open}
				basic={this.props.basic}
				size={this.props.size || 'tiny'}
				dimmer={this.props.dimmer}
				onClose={this.props.onClose}
				style={{ ...styles.modal(this.props.mobile), ...(this.props.style || {}) }}
			>
				{this.renderClose()}
				{this.props.children}
				{this.renderActions()}
			</Modal>
		);
	};
};

const styles = {
	modal: (mobile) => {
		return {
			background: 'rgb(18,18,18)',
			padding: 24,
			border: '1px solid rgb(47, 54, 61)',
			borderRadius: 0,
			color: '#fff',
			...(mobile ? {
				height: '100%',
				width: '100%'
			} : {})
		}
	},
	actionContainer: (mobile) => {
		return {
			paddingTop: 24,
			display: 'flex',
			justifyContent: 'right',
			...(mobile ? {
				position: 'absolute',
				bottom: 24,
				right: 24
			} : {})
		};
	},
	actionText: (hover) => {
		return {
			fontSize: 15,
			marginLeft: 18,
			cursor: 'pointer',
			opacity: hover ? 1 : 0.85
		};
	}
};

export default PrettyModal;
